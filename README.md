# Terrazza Padel

2 vs 2 padel in isometric pixel art, on a rooftop club in Milan. It runs in the browser on a Mac and on an iPhone, and it can be installed on the iPhone home screen and played offline.

**Play:** https://luca-grella.github.io/terrazza-padel/

Italian and English. The language follows the browser the first time and can be changed from the start card (IT / EN) or from the options panel.

## How to play

- **Gioca / Play:** you move the player with the yellow arrow, the computer plays your partner and the opponents.
- **Allena / Coach:** the match plays itself and you give orders to your pair: tactic (defend, normal, attack), next shot (lob, drop shot, smash), where to serve, and a target for the next shot.
- Names: type yours on the start card; partner and opponents can be renamed in the options panel (Players). Empty fields use the default names.

Keyboard: `WASD` or arrows to move, `J` or Space to hit and serve, `K` lob, `L` smash, `1`–`3` tactic in coach mode, `P` pause, `C` camera. Drag on the court to rotate, mouse wheel to zoom.

iPhone: stick on the left, Hit / Lob / Smash on the right, pause button at the top right, options from the top bar. In coach mode the orders sit in a bar at the bottom. Vibration on hits and won points (can be turned off).

### Install on iPhone

Safari › Share › Add to Home Screen. The game opens full screen and works offline after the first visit.

## The rules it follows

Padel rules on a 10 x 20 m court: serve underhand into the diagonal box, one bounce on the floor, then the ball may hit the glass and stay in play. Hitting the opponents' glass or fence before the bounce loses the point. A ball that leaves the court after a legal bounce wins it (por tres over the side, por cuatro over the back). Games and sets as in tennis, no tie-break yet.

## Files

- `index.html`: the whole game (HTML, CSS, JavaScript module, strings in Italian and English).
- `vendor/three.module.min.js`: three.js r160 (MIT, licence in `vendor/THREE_LICENSE.txt`).
- `manifest.webmanifest`, `sw.js`, `icons/`: install and offline support.
- `tools/check.mjs`: headless check with real touch events (see below). `tools/icon-render.html`: renders the PNG icons from `icons/icon.svg`.

No build step: GitHub Pages serves the folder as it is.

## Release

1. Change the code.
2. Bump `CACHE` in `sw.js` (`terrazza-padel-r1` → `r2` …), otherwise installed copies keep the old files.
3. Test, commit, push to `main`.

## Test

```bash
python3 -m http.server 8777 --bind 127.0.0.1
node --experimental-websocket tools/check.mjs http://127.0.0.1:8777/ /tmp/tp --mobile
```

`--mobile` emulates an iPhone in portrait (add `--landscape` for landscape); without it the check runs on a desktop window. It types a name, starts a match, serves with the Hit button, drags the stick, pauses, opens the panel, switches language and simulates a coach match, then writes screenshots and `result.json` (console errors included) to the output folder. Needs Google Chrome and Node 20 or newer.

## Credits

Code by Claude for Luca. Fonts from Google Fonts (Jersey 10, Pixelify Sans, Fraunces, Inter; SIL Open Font License). three.js by its authors (MIT).
