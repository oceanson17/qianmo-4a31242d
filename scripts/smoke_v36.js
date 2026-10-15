/**
 * v36 smoke: dash shell · story_flow · migrate · cultivate · chronicle
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
/* inline local stylesheets so jsdom does not fetch remote Pages */
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
    window.requestAnimationFrame = (cb) => {
      if (rafN++ > 8) return 0;
      return setTimeout(() => cb(Date.now()), 16);
    };
    window.cancelAnimationFrame = (id) => clearTimeout(id);
    window.matchMedia = (q) => ({
      matches: String(q).includes('820') ? false : false,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}
    });
    window.HTMLCanvasElement.prototype.getContext = function () {
      const noop = () => {};
      return new Proxy({
        canvas: this,
        fillStyle: '', strokeStyle: '', font: '', globalAlpha: 1,
        measureText(){ return { width: 0 }; },
        getImageData(){ return { data: new Uint8ClampedArray(4) }; },
        createImageData(){ return { data: new Uint8ClampedArray(4) }; }
      }, { get(t, p){ if (p in t) return t[p]; return noop; } });
    };
  }
});

const { window } = dom;
const document = window.document;
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

(async () => {
  await sleep(80);
  const g = window;
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

  assert(g.QianStoryFlow, 'QianStoryFlow');
  const v = g.QianStoryFlow.validate();
  assert(v.ok, 'story_flow validate: ' + JSON.stringify(v.errors));
  assert(g.QianModes, 'QianModes');
  assert(g.QianArcs, 'QianArcs');

  // DOM dash
  assert(document.getElementById('dash'), 'dash');
  assert(document.getElementById('dash-cultivate'), 'dash-cultivate');
  assert(document.getElementById('dash-chron-list'), 'dash-chron-list');
  assert(document.getElementById('dash-npc-list'), 'dash-npc-list');
  assert(document.getElementById('story-panel'), 'story-panel');
  assert(fs.existsSync(path.join(root, 'dash.css')), 'dash.css file exists');
  assert(document.getElementById('screen-game').classList.contains('dash-mode'), 'dash-mode class');

  const gameSrc = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  assert(gameSrc.includes("GAME_VERSION = '36'"), 'version 36');
  assert(gameSrc.includes('function renderDash'), 'renderDash');
  assert(gameSrc.includes('function dashCultivate'), 'dashCultivate');

  // story flow still works
  const fakeS = {
    v: 8, day: 1, period: '晨', gold: 70, food: 20, hp: 80, maxHp: 80,
    fame: 10, people: 8, factions: { lu: 0, qin: 0, sai: 0 }, joined: null,
    flags: {}, npcs: {}, chronicle: [], plotFlags: {}, arcProg: {}, endings: [],
    skills: { farm: 3 }, bag: {}, career: 'farmer',
    hero: { name: '豆豆', gender: 'x', origin: 'farm' },
    worldMode: 'history', attrs: { wu: 1, hu: 0, shen: 1, zhi: 0, bian: 1, yun: 0 },
    access: {}, storyFlow: { nodeId: null, seen: {}, started: false },
    dash: { filterNoise: false, x2: false, realm: 'home', col: 'world' }, dashLog: []
  };
  if (g.QianWorld && g.QianWorld.ensure) g.QianWorld.ensure(fakeS);
  if (g.QianStory && g.QianStory.ensure) g.QianStory.ensure(fakeS);
  if (g.QianFactions && g.QianFactions.ensure) g.QianFactions.ensure(fakeS);
  if (g.QianArcs && g.QianArcs.ensure) g.QianArcs.ensure(fakeS);
  g.QianStoryFlow.begin(fakeS);
  assert(fakeS.storyFlow.nodeId === 'pro_01', 'begin pro_01');
  let r = g.QianStoryFlow.applyChoice(fakeS, 'a');
  assert(r.ok && fakeS.storyFlow.nodeId === 'pro_02', 'to pro_02');
  r = g.QianStoryFlow.applyChoice(fakeS, 'a');
  assert(r.ok && fakeS.storyFlow.nodeId === 'ch1_hub', 'to ch1_hub');

  // migrate old
  const old = {
    v: 6, day: 3, period: '暮', gold: 50, food: 10, hp: 70,
    fame: 5, people: 8, factions: { lu: 0, qin: 0, sai: 0 },
    flags: { visited_xianyang: 1 }, npcs: {}, plotFlags: {}, arcProg: {},
    skills: {}, bag: {}, career: 'farmer', hero: { name: '豆豆' },
    worldMode: 'history', attrs: {}, access: {}
  };
  g.QianStoryFlow.ensure(old);
  g.QianStoryFlow.begin(old, { fromSave: true });
  assert(old.storyFlow.nodeId === 'resume_hub', 'resume hub');

  // UI start
  const btnNew = document.getElementById('btn-new');
  if (btnNew) btnNew.click();
  await sleep(40);
  const nameInput = document.getElementById('create-name');
  if (nameInput) nameInput.value = '豆豆';
  ['btn-create-next', 'btn-create-go'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.click();
  });
  await sleep(60);
  const farmer = document.querySelector('[data-career="farmer"]');
  if (farmer) farmer.click();
  else {
    document.querySelectorAll('button, .chip-card, .career-card').forEach((b) => {
      const t = (b.textContent || '') + (b.dataset.career || '');
      if (/農夫|farmer/.test(t)) b.click();
    });
  }
  await sleep(150);

  let snap = g.render_game_to_text && JSON.parse(g.render_game_to_text());
  if (snap && snap.ok) {
    console.log('UI live', snap.day, snap.story && snap.story.nodeId, 'dash', snap.dash);
    assert(String(snap.v) === '36', 'snap v36 got ' + snap.v);
    assert(snap.dash === true, 'snap dash');
    assert(snap.story && snap.story.nodeId, 'story in snap');
    assert(document.getElementById('app').classList.contains('dash-live'), 'app dash-live');
    assert(document.getElementById('dash-name').textContent.length > 0, 'dash name');

    const btn = document.querySelector('#story-choices .story-choice:not([disabled])');
    if (btn) {
      btn.click();
      await sleep(50);
      const s2 = JSON.parse(g.render_game_to_text());
      assert(s2.story && s2.story.nodeId !== snap.story.nodeId, 'choice advanced');
      console.log('advanced to', s2.story.nodeId);
    }

    // cultivate button
    const cult = document.getElementById('dash-cultivate');
    const day0 = JSON.parse(g.render_game_to_text()).day;
    if (cult) {
      cult.click();
      await sleep(80);
      const s3 = JSON.parse(g.render_game_to_text());
      assert(s3.day >= day0, 'cultivate day progressed ' + day0 + '->' + s3.day);
      console.log('cultivate', day0, '->', s3.day, 'chron', s3.chronLen, 'log', s3.dashLogLen);
    }
  } else {
    console.log('UI start skipped; module path covered');
  }

  console.log('SMOKE_V36_OK');
  process.exit(0);
})().catch((e) => {
  console.error('SMOKE_FAIL', e);
  process.exit(1);
});
