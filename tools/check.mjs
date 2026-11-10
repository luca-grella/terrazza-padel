// Headless check with real touch events through the Chrome DevTools Protocol.
// Usage: node --experimental-websocket tools/check.mjs <url> <outDir> [--mobile] [--landscape] [--lang=en]
// Needs Google Chrome installed. Serve the folder first, e.g. python3 -m http.server 8777.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, out] = process.argv.slice(2);
const mobile = process.argv.includes('--mobile'), landscape = process.argv.includes('--landscape');
const lang = (process.argv.find((a) => a.startsWith('--lang=')) || '--lang=it').slice(7);
const W = mobile ? (landscape ? 844 : 390) : 1280, H = mobile ? (landscape ? 390 : 844) : 800;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const prof = mkdtempSync(join(tmpdir(), 'tp-'));
const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9333', `--user-data-dir=${prof}`, '--use-angle=metal', '--hide-scrollbars', `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pending = new Map(); const logs = [];
async function connect() {
  for (let i = 0; i < 50; i++) {
    try { const list = await (await fetch('http://127.0.0.1:9333/json')).json(); const pg = list.find((t) => t.type === 'page'); if (pg) return pg.webSocketDebuggerUrl; } catch (e) { /* not up yet */ }
    await sleep(200);
  }
  throw new Error('chrome did not start');
}
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = (expr) => send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }).then((r) => { if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; });
async function shot(name) { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(out, name + '.png'), Buffer.from(r.data, 'base64')); }
async function rect(sel) { return ev(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; })()`); }
async function tap(sel) {
  const c = await rect(sel);
  if (mobile) { await touch('touchStart', c.x, c.y, 1); await sleep(60); await touch('touchEnd', c.x, c.y, 1); }
  else for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: c.x, y: c.y, button: 'left', clickCount: 1 });
  await sleep(120);
}
const touch = (type, x, y, idt) => send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: idt }] });
const result = { errors: logs };
try {
  ws = new WebSocket(await connect());
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(new Error(d.error.message)) : p.res(d.result); }
    if (d.method === 'Runtime.exceptionThrown') logs.push('EXC ' + JSON.stringify(d.params.exceptionDetails).slice(0, 300));
    if (d.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(d.params.type)) logs.push(d.params.type + ' ' + d.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300));
  });
  await send('Runtime.enable'); await send('Page.enable');
  if (mobile) {
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', platform: 'iPhone' });
  }
  await send('Emulation.setLocaleOverride', { locale: lang === 'en' ? 'en-GB' : 'it-IT' }).catch(() => {});
  await send('Page.navigate', { url });
  for (let i = 0; i < 60; i++) { await sleep(250); if (await ev('!!window.padel && !document.getElementById("loading")').catch(() => false)) break; }
  await sleep(1200);
  await shot('1-start');
  result.lang = await ev('document.documentElement.lang');
  // type a name on the start card
  await tap('#nm_0b'); await send('Input.insertText', { text: 'Luca' }); await sleep(200);
  await ev('document.activeElement.blur()');
  // arcade: pick a stadium (the world is rebuilt behind the card), then play
  await tap('#goArcade'); await sleep(300);
  await tap('#venueGrid [data-v="napoli"]'); await sleep(800);
  result.venue = await ev('window.padel.settings.venue');
  await shot('1b-arcade');
  await tap('#goPlay'); await sleep(2500);
  result.names = await ev('window.padel.players.map((p) => p.name)');
  result.vs = await ev('document.getElementById("vsLine").textContent');
  result.touchVisible = await ev('!document.getElementById("touch").hidden');
  await shot('2-play');
  // serve with the Hit button, then drag the stick while the point is live
  for (let i = 0; i < 40 && (await ev('window.padel.state.rally.state')) !== 'serve'; i++) await sleep(200);
  const before = await ev('window.padel.state.rally.state');
  await tap('#shots .main'); await sleep(150);
  result.serve = { before, after: await ev('window.padel.state.rally.state') };
  if (result.touchVisible) {
    const s = await rect('#stick');
    const hp = 'window.padel.players.find((p) => p.isHuman).pos.toArray().map((v) => +v.toFixed(2))';
    const p0 = await ev(hp);
    await touch('touchStart', s.x, s.y, 7); await sleep(50);
    for (let k = 1; k <= 6; k++) { await touch('touchMove', s.x + k * 8, s.y - k * 3, 7); await sleep(30); }
    await sleep(500); await shot('3-stick');
    await touch('touchEnd', s.x, s.y, 7);
    result.stickMove = { p0, p1: await ev(hp) };
  }
  // pause from the HUD button, then open the panel
  await tap('#hudPause'); await sleep(300);
  result.paused = await ev('document.getElementById("btnPause").textContent');
  if (await ev('getComputedStyle(document.getElementById("panelBtn")).display !== "none"')) { await tap('#panelBtn'); await sleep(400); }
  await shot('4-panel');
  await ev('document.getElementById("panel").scrollTop = 99999'); await sleep(200); await shot('5-panel-bottom');
  // switch language from the panel
  await tap(`#segLang button[data-v="${lang === 'en' ? 'it' : 'en'}"]`); await sleep(300);
  result.langAfter = await ev('document.documentElement.lang');
  result.commNow = await ev('document.getElementById("commNow").textContent');
  await ev('document.getElementById("panel").scrollTop = 0'); await sleep(200); await shot('6-panel-switched');
  result.overflowX = await ev('document.documentElement.scrollWidth > innerWidth');
  // coach mode: long simulated match, then the score and the last commentary line
  result.sim = await ev(`(() => { const P = window.padel; P.settings.mode = 'coach'; P.newMatch(false); for (let i = 0; i < 300; i++) P.step(240); return { score: P.state.score, points: P.debugLog.length, comm: document.getElementById('commNow').textContent, coachWho: document.getElementById('coachWho').textContent }; })()`);
  await sleep(300); await shot('7-coach');
  // tournament: back to the menu, enter the Bronze event in the quick format, play the first match
  await ev('window.padel.newMatch(true)'); await sleep(300);
  if (await ev('!document.getElementById("cardResult").hidden')) await tap('#resMenu');
  for (const sel of ['#cardArcade [data-back]', '#cardTour [data-back]', '#cardTourDet [data-back]']) if (await ev(`!document.querySelector('${sel}').closest('.card').hidden`)) { await tap(sel); await sleep(200); }
  if (await ev('!document.getElementById("cardTour").hidden')) { await tap('#cardTour [data-back]'); await sleep(200); }
  await tap('#goTour'); await sleep(300); await shot('8-tour-list');
  await tap('.trow[data-id="napoli"]'); await sleep(300);
  await tap('#segTourLen [data-v="fast"]'); await sleep(100);
  await tap('#detEnter'); await sleep(500); await shot('9-tour-draw');
  await tap('#detPlay'); await sleep(2500);
  result.tour = { header: await ev('document.getElementById("topEyebrow").textContent + " | " + document.getElementById("topTitle").textContent'), vs: await ev('document.getElementById("vsLine").textContent'), fmt: await ev('JSON.stringify(window.padel.FMT)') };
  await shot('10-tour-match');
  result.tour.end = await ev(`(() => { const P = window.padel; for (let i = 0; i < 60 && !P.score.over; i++) P.award(0); P.step(600); return document.getElementById('cardResult').innerText.replace(/\s+/g, ' '); })()`);
  await sleep(300); await shot('11-result');
  await tap('#resCont'); await sleep(400); await shot('12-next-round');
  result.tour.next = await ev('document.getElementById("detNextLbl").textContent');
} catch (e) { result.fatal = String(e.stack || e); }
writeFileSync(join(out, 'result.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 1));
try { ws?.close(); } catch (e) { /* closed */ }
proc.kill(); await sleep(300); rmSync(prof, { recursive: true, force: true });
process.exit(0);
