import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { describe, it } from 'node:test';
import { appDefinitions, appIds, dockApps } from '../content/apps';
import { temporaryIconFiles } from '../content/icon-manifest';
import { musicTracks } from '../content/media-library';
import { answerLocally, findApp, parseAssistantReply } from '../lib/assistant';
import { applyOperator, formatNumber } from '../lib/calculator';
import { floodFill } from '../lib/flood-fill';
import { emptyBoard, isWon, plantMines, reveal } from '../lib/minesweeper';
import { automaticWallpaperFor, wallpapers } from '../lib/wallpapers';
// The proxy is plain ESM so it can run on the server without a build step.
import { osApps } from '../services/assistant-proxy/src/os-guide.mjs';

const publicFile = (path: string) => new URL(`../public${path}`, import.meta.url);
// Temporary third-party assets are gitignored; a fresh clone runs
// `npm run assets:temporary` before these file checks apply.
const temporaryAssetsPresent = existsSync(publicFile('/icons/ryos'));

void describe('Sushin OS apps', () => {
  void it('describes every app with menus, icons and both languages', () => {
    for (const id of appIds) {
      const app = appDefinitions[id];
      assert.equal(app.id, id);
      assert.ok(app.title.ru && app.title.en, id);
      assert.ok(app.summary.ru && app.summary.en, id);
      assert.ok(app.menus.length > 0, id);
      assert.match(temporaryIconFiles[app.icon], /^\/icons\/ryos\/[\w-]+\.png$/);
      if (temporaryAssetsPresent)
        assert.ok(existsSync(publicFile(temporaryIconFiles[app.icon])), `${id} icon file`);
    }
    for (const id of dockApps) assert.ok(appIds.includes(id));
  });

  void it('keeps the assistant guide in sync with the app registry', () => {
    assert.deepEqual(
      osApps.map((app) => app.id).sort(),
      [...appIds].sort(),
    );
  });

  void it('resolves every wallpaper and the Rover sprite locally', () => {
    for (const wallpaper of temporaryAssetsPresent ? wallpapers : []) {
      assert.ok(existsSync(publicFile(wallpaper.src)), wallpaper.src);
      assert.ok(existsSync(publicFile(wallpaper.thumb)), wallpaper.thumb);
    }
    if (temporaryAssetsPresent) {
      assert.ok(existsSync(publicFile('/assistant/rover/map.png')));
      assert.ok(existsSync(publicFile('/assistant/rover/agent.json')));
    }
    assert.equal(automaticWallpaperFor(10), 'forest');
    assert.equal(automaticWallpaperFor(22), 'night-peak');
  });

  void it('has playable music entries', () => {
    assert.ok(musicTracks.length > 0);
    for (const track of musicTracks) assert.ok(track.src || track.demo, track.id);
  });
});

void describe('Rover assistant', () => {
  void it('executes only known action tokens', () => {
    const reply = parseAssistantReply(
      'Открываю. [[open:calculator]] [[open:root-shell]] [[wallpaper:next]] [[theme:toggle]] [[rm:all]]',
    );
    assert.equal(reply.text, 'Открываю. [[rm:all]]');
    assert.deepEqual(reply.actions, [
      { type: 'open', app: 'calculator' },
      { type: 'wallpaper-next' },
      { type: 'theme-toggle' },
    ]);
  });

  void it('finds apps by title and keywords offline', () => {
    assert.equal(findApp('открой сапер', 'ru'), 'minesweeper');
    assert.equal(findApp('где резюме', 'ru'), 'cv');
    assert.equal(findApp('open the calculator', 'en'), 'calculator');
    assert.equal(findApp('погода', 'ru'), null);
  });

  void it('answers navigation questions without the network', () => {
    assert.deepEqual(answerLocally('смени обои', 'ru').actions, [{ type: 'wallpaper-next' }]);
    assert.deepEqual(answerLocally('запусти winamp', 'ru').actions, [{ type: 'open', app: 'winamp' }]);
    assert.equal(answerLocally('что ты умеешь?', 'ru').actions.length, 0);
  });
});

void describe('utility logic', () => {
  void it('calculates without binary noise and guards division by zero', () => {
    assert.equal(applyOperator(0.1, 0.2, '+'), 0.3);
    assert.equal(applyOperator(7, 5, '*'), 35);
    assert.ok(Number.isNaN(applyOperator(1, 0, '/')));
    assert.equal(formatNumber(Number.NaN, 'ru'), 'Ошибка');
    assert.equal(formatNumber(1.5, 'ru', '1.50'), '1,50');
  });

  void it('never places a mine on or next to the first click', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      let state = seed + 1;
      const random = () => {
        state = (state * 16807) % 2147483647;
        return state / 2147483647;
      };
      const board = plantMines(emptyBoard(9, 9), 10, 4, 4, random);
      const mines = board.flat().filter((cell) => cell.mine).length;
      assert.equal(mines, 10);
      for (let r = 3; r <= 5; r += 1)
        for (let c = 3; c <= 5; c += 1) assert.equal(board[r][c].mine, false);
      const opened = reveal(board, 4, 4);
      assert.ok(opened[4][4].open);
      assert.equal(isWon(opened), opened.flat().every((cell) => cell.mine || cell.open));
    }
  });

  void it('fills a closed region only', () => {
    const width = 4;
    const height = 3;
    const data = new Uint8ClampedArray(width * height * 4).fill(255);
    // A black vertical wall in column 2.
    for (let y = 0; y < height; y += 1) data.set([0, 0, 0, 255], (y * width + 2) * 4);
    floodFill({ data, width, height }, 0, 0, '#ff0000');
    assert.deepEqual(Array.from(data.subarray(0, 4)), [255, 0, 0, 255]);
    assert.deepEqual(Array.from(data.subarray(3 * 4, 3 * 4 + 4)), [255, 255, 255, 255]);
  });
});
