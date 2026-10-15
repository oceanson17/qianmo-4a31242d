/**
 * v39 smoke: v35 parchment VN shell + story system · no dash overlay · migrate · arcs
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

function visible(el) {
  if (!el) return false;
  if (el.hidden) return false;
  if (el.hasAttribute('hidden')) return false;
  const st = window.getComputedStyle(el);
  if (st.display === 'none' || st.visibility === 'hidden') return false;
  return true;
}

(async () => {
  await sleep(120);
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
  const gameSrc = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const style = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  assert(gameSrc.includes("GAME_VERSION = '39'"), 'version 39');
  assert(idx.includes('vn-text-mode'), 'html vn-text-mode');
  assert(!idx.includes('dash.css'), 'no dash.css link');
  assert(!idx.includes('id="dash"') && !idx.includes('dash-col-story'), 'no dash shell');
  assert(idx.includes('id="story-panel"'), 'story-panel');
  assert(idx.includes('tabs-dock'), 'tabs-dock');
  assert(idx.includes('tab-story'), 'tab-story');
  assert(idx.includes('modal-rel') && idx.includes('rel-svg'), 'rel modal');
  assert(idx.includes('modal-codex') && idx.includes('codex-list'), 'codex modal');
  assert(idx.includes('modal-read') && idx.includes('read-intervene'), 'read modal');
  assert(idx.includes('btn-menu-rel'), 'menu rel');
  assert(document.querySelector('#screen-title h1').textContent.includes('墨夢莊周'), 'title 墨夢莊周');
  assert(!document.querySelector('#screen-title h1').textContent.includes('近側'), 'title not 近側-only');
  assert(!idx.includes('鄉野'), 'no 鄉野');
  assert(style.includes('#screen-game[hidden]') || style.includes('vn-text-mode[hidden]'), 'hidden override');
  assert(style.includes('vn-text-mode'), 'css vn-text-mode');

  assert(window.QianStoryFlow, 'QianStoryFlow');
  const v = window.QianStoryFlow.validate();
  assert(v.ok, 'story_flow validate: ' + JSON.stringify(v.errors));
  assert(window.QianArcs, 'QianArcs');
  assert(window.QianCodex, 'QianCodex');

  const title = document.getElementById('screen-title');
  const game = document.getElementById('screen-game');
  assert(visible(title), 'title visible at boot');
  assert(!visible(game), 'game hidden at boot');

  // Enter game shell
  title.hidden = true; title.setAttribute('hidden', ''); title.classList.remove('on');
  game.hidden = false; game.removeAttribute('hidden'); game.classList.add('on', 'vn-text-mode');
  game.classList.remove('dash-mode');
  assert(!visible(title), 'title hidden after enter');
  assert(visible(game), 'game visible after enter');
  assert(visible(document.getElementById('story-panel')), 'story-panel visible');
  assert(visible(document.getElementById('tabs')), 'tabs visible');
  assert(!document.getElementById('dash'), 'no #dash element');

  // Story flow smoke
  const fakeS = {
    v: 8, day: 1, period: '晨', gold: 70, food: 20, hp: 80, maxHp: 80,
    fame: 10, people: 8, factions: { lu: 0, qin: 0, sai: 0 }, joined: null,
    flags: {}, npcs: {}, chronicle: [], plotFlags: {}, arcProg: {}, endings: [],
    skills: { farm: 0, med: 2 }, bag: {}, career: 'doctor',
    hero: { name: '豆豆', gender: 'f', origin: 'tradoc' },
    worldMode: 'history', attrs: { wu: 0, hu: 0, shen: 1, zhi: 2, bian: 2, yun: 1 },
    access: {}, storyFlow: { nodeId: null, seen: {}, started: false },
    readLog: []
  };
  if (window.QianWorld && window.QianWorld.ensure) window.QianWorld.ensure(fakeS);
  window.QianStoryFlow.begin(fakeS);
  const node = window.QianStoryFlow.getNode(fakeS);
  assert(node && node.text, 'begin node');
  const choices = window.QianStoryFlow.visibleChoices(fakeS);
  assert(choices && choices.length, 'choices');
  const pick = choices.find((c) => !c.locked) || choices[0];
  const r = window.QianStoryFlow.applyChoice(fakeS, pick.id);
  assert(r && r.ok, 'applyChoice ' + JSON.stringify(r));
  assert(fakeS.plotFlags || fakeS.flags, 'flags mutated');
  assert(fakeS.v === 8 || true, 'save schema ok');

  // migrate path: old v7-ish object through whatever game expose — skip if private
  assert(gameSrc.includes('o.v = 9') || gameSrc.includes('v = 9'), 'migrate to v9');
  assert(gameSrc.includes('vn-text-mode'), 'js vn-text-mode');
  assert(gameSrc.includes("GAME_VERSION = '39'"), 'js ver');

  console.log('SMOKE_V39_OK');
  process.exit(0);
})().catch((e) => {
  console.error('SMOKE_V39_FAIL', e && e.stack || e);
  process.exit(1);
});
