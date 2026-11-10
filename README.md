# Terrazza Padel

2 vs 2 padel in isometric pixel art, on eight rooftop clubs around the world. On a computer it runs in the browser. On a phone or tablet it is played as an installed app (iPhone, iPad, Android) and works offline: opening the link in a mobile browser shows a page that explains how to install it, and the game does not start there.

**Play:** https://luca-grella.github.io/terrazza-padel/

Italian and English. The language follows the browser the first time and can be changed from the start card (IT / EN) or from the options panel.

## Modes

- **Arcade:** a single match. Pick one of eight stadiums (Milan, Rome, Naples, Cortina, Barcelona, Buenos Aires, Dubai, Paris), the length (mini set, one set, best of three) and what happens at 40-40 (advantage, golden point, star point).
- **Tournament:** a tour of eight events, one per stadium, with categories from Bronze to Major and the Finals in Milan. Each event has its own draw (8 or 16 pairs, knockout; the Finals have two round-robin groups and then semi-finals) and its own format from the FIP rules. You can play every event in the official format or in the quick one (4-game mini sets with a super tie-break). The other matches of the draw are simulated, and opponents get stronger with the category and the round. Progress is saved on the device, also in the middle of a match.
- **Ranking and seasons:** a pool of 21 computer pairs plays the same circuit and collects points like you. Your best result in each event counts for the season; smaller events draw their field from the lower part of the ranking, Majors from the top. The top 8 pairs of the ranking play the Finals, and after the Finals a new season starts (the computer pairs keep part of their points, and their strength drifts a little). Results from before seasons existed count for season 1.

## How to play

- **Gioca / Play:** you move the player with the yellow arrow, the computer plays your partner and the opponents.
- **Allena / Coach:** the match plays itself and you give orders to your pair: tactic (defend, normal, attack), next shot (lob, drop shot, smash), where to serve, and a target for the next shot.
- Names: type yours on the start card; partner and opponents can be renamed in the options panel (Players). Empty fields use the default names.

Keyboard: `WASD` or arrows to move, `J` or Space to hit and serve, `K` lob, `L` smash (with left or right held, from mid court: vibora), `1`–`3` tactic in coach mode, `P` pause, `C` camera. Drag on the court to rotate, mouse wheel to zoom.

iPhone: stick on the left, Hit / Lob / Smash on the right (Smash with the stick to one side from mid court plays the vibora), pause button at the top right, options from the top bar. In coach mode the orders sit in a bar at the bottom. Vibration on hits and won points (can be turned off).

### Install on a phone

- iPhone and iPad: Safari › Share › Add to Home Screen.
- Android: Chrome › menu › Install app (or the Install button on the page, when Chrome offers it).

The game opens full screen and works offline after the first visit.

## The rules it follows

Padel rules on a 10 x 20 m court with two side doors per half, checked against the FIP Rules of Padel (2023 edition):

- Serve underhand into the diagonal box. A serve that lands outside the box, hits the fence after the bounce, or hits a wall before reaching the box is a fault; two faults lose the point. A serve that clips the net and lands in the box is a let and is replayed (on the second serve, only that serve).
- One bounce on the floor, then the ball may hit the glass and stay in play. Hitting the opponents' glass or fence before the bounce loses the point. Waiting for the ball off the back glass and driving it down is the bajada. The vibora is a sliced overhead from mid court: it bounces low and skids into the side glass.
- A ball that goes over the back wall after a legal bounce wins the point at once (por cuatro). Over the side wall or through a door it can still be chased: the player runs out through the door and plays it back before it bounces outside (por tres if they don't make it). The kick smash near the net tries exactly that.
- Change of ends after the first game and then every two games, and every six points in a tie-break; the camera shows the whole venue during the changeover.
- On the golden point and on the decisive star point the receiving pair chooses whether to receive on the right or on the left. Scoring: 6-game sets won by two with a tie-break to 7 at 6-6 (or 4-game mini sets with a tie-break at 4-4); at 40-40 advantage, golden point or star point (two advantages, then a decisive point on the third deuce; the star point is not in the 2023 FIP text this check used, so it follows the description published by the FIP for the 2026 season); the deciding set can be replaced by a match tie-break to 7 or a super tie-break to 10. In a tie-break the first server serves one point, then two each, and the pair that did not serve first starts the next set.

## Files

- `index.html`: the whole game (HTML, CSS, JavaScript module, strings in Italian and English).
- `vendor/three.module.min.js`: three.js r160 (MIT, licence in `vendor/THREE_LICENSE.txt`).
- `manifest.webmanifest`, `sw.js`, `icons/`: install and offline support.
- `tools/check.mjs`: headless check with real touch events (see below). `tools/icon-render.html`: renders the PNG icons from `icons/icon.svg`.

No build step: GitHub Pages serves the folder as it is.

## Release

1. Change the code.
2. Bump `CACHE` in `sw.js` (`terrazza-padel-r4` → `r5` …), otherwise installed copies keep the old files.
3. Test, commit, push to `main`.

## Test

```bash
python3 -m http.server 8777 --bind 127.0.0.1
node --experimental-websocket tools/check.mjs http://127.0.0.1:8777/ /tmp/tp --mobile
```

`--mobile` emulates the installed app on an iPhone in portrait (add `--landscape` for landscape); without it the check runs on a desktop window. `--gate` checks the install page that a phone browser gets instead (add `--android` for Android). It types a name, picks a stadium, starts a match, serves with the Hit button, drags the stick, pauses, opens the panel, switches language and simulates a coach match, enters a tournament and plays its first match to the end, then writes screenshots and `result.json` (console errors included) to the output folder. Needs Google Chrome and Node 20 or newer.

## Credits

Code by Claude for Luca. Fonts from Google Fonts (Jersey 10, Pixelify Sans, Fraunces, Inter; SIL Open Font License). three.js by its authors (MIT).
