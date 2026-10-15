/**
 * v43 smoke: idle hub (種田/打鐵/挖掘/副本) + AUTO moved off story toolbar
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (full, href) => {
  const rel = href.split('?')[0];
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) return '<!-- missing ' + rel + ' -->';
  return '<style>\n' + fs.readFileSync(fp, 'utf8') + '\n</style>';
});
const scriptRe = /<script src="([^"]+)"><\/script>/g;
const tags = [];
let m;
while ((m = scriptRe.exec(html))) tags.push(m[1].split('?')[0]);
let bundled = '';
for (const rel of tags) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error('missing ' + rel);
  bundled += '\n;' + fs.readFileSync(p, 'utf8') + '\n';
}
html = html.replace(scriptRe, '');
html = html.replace('</body>', '<script>' + bundled + '</script></body>');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'https://oceanson17.github.io/qianmo-4a31242d/',
  beforeParse(window) {
    window.alert = () => {};
    window.confirm = () => true;
    let rafN = 0;
    window.requestAnimationFrame = (cb) => { if (rafN++ > 8) return 0; return setTimeout(() => cb(Date.now()), 16); };
    window.cancelAnimationFrame = (id) => clearTimeout(id);
    window.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
    window.HTMLCanvasElement.prototype.getContext = function () {
      const noop = () => {};
      return new Proxy({ canvas: this, fillStyle: '', strokeStyle: '', font: '', globalAlpha: 1,
        measureText(){ return { width: 0 }; },
        getImageData(){ return { data: new Uint8ClampedArray(4) }; },
        createImageData(){ return { data: new Uint8ClampedArray(4) }; }
      }, { get(t, p){ if (p in t) return t[p]; return noop; } });
    };
  }
});
const { window } = dom;
const document = window.document;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await sleep(140);
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
  const gameSrc = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const style = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  assert(gameSrc.includes("GAME_VERSION = '43'"), 'version 43');
  assert(idx.includes('?v=43'), 'cache bust 43');
  assert(idx.includes('tab-idle') && idx.includes('sheet-idle'), 'idle tab+sheet');
  assert(idx.includes('idle-cat-farm') && idx.includes('idle-cat-forge'), 'idle cats farm/forge');
  assert(idx.includes('idle-cat-mine') && idx.includes('idle-cat-dungeon'), 'idle cats mine/dungeon');
  assert(idx.includes('btn-idle-auto'), 'idle AUTO btn');
  assert(!idx.includes('id="q-auto"'), 'story AUTO removed');
  assert(idx.includes('story-free-input'), 'keep free input');
  assert(style.includes('v43') && style.includes('idle-cats'), 'v43 css');
  assert(gameSrc.includes('openIdleSheet') && gameSrc.includes('toggleIdleAuto'), 'idle wired');
  assert(gameSrc.includes('idleAutoArmed'), 'idle armed lock');
  assert(gameSrc.includes('IDLE_DUNGEONS'), 'dungeon list');

  // DOM presence
  assert(document.getElementById('tab-idle'), 'dom tab-idle');
  assert(document.getElementById('sheet-idle'), 'dom sheet-idle');
  assert(document.getElementById('btn-idle-auto'), 'dom btn-idle-auto');
  assert(!document.getElementById('q-auto'), 'no q-auto in DOM');
  assert(document.getElementById('story-free-input'), 'free input still there');
  assert(document.getElementById('q-log') && document.getElementById('q-save'), '回顧/存檔 kept');

  // open idle sheet via click
  document.getElementById('tab-idle').click();
  await sleep(40);
  assert(!document.getElementById('sheet-idle').hidden, 'sheet-idle opens');

  // select dungeon category shows picks
  document.getElementById('idle-cat-dungeon').click();
  await sleep(20);
  assert(!document.getElementById('idle-dungeon-pick').hidden, 'dungeon pick visible');

  document.getElementById('idle-cat-farm').click();
  await sleep(20);
  assert(!document.getElementById('idle-farm-dirs').hidden, 'farm dirs visible');

  console.log('smoke_v43 OK');
})().catch((e) => { console.error(e); process.exit(1); });
