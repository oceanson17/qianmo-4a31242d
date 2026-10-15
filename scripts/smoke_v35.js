/**
 * v35 smoke: story_flow VN · migrate · arcs · period
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

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
    window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
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
  if (g.QianArcs.validate) {
    const ae = g.QianArcs.validate();
    assert(!ae || !ae.length, 'arcs: ' + JSON.stringify(ae));
  }

  const fakeS = {
    v: 7, day: 1, period: '晨', gold: 70, food: 20, hp: 80, maxHp: 80,
    fame: 10, people: 8, factions: { lu: 0, qin: 0, sai: 0 }, joined: null,
    flags: {}, npcs: {}, chronicle: [], plotFlags: {}, arcProg: {}, endings: [],
    skills: { farm: 3 }, bag: {}, career: 'farmer',
    hero: { name: '豆豆', gender: 'x', origin: 'farm' },
    worldMode: 'history', attrs: { wu: 1, hu: 0, shen: 1, zhi: 0, bian: 1, yun: 0 },
    access: {}, storyFlow: { nodeId: null, seen: {}, started: false }
  };
  if (g.QianWorld && g.QianWorld.ensure) g.QianWorld.ensure(fakeS);
  if (g.QianStory && g.QianStory.ensure) g.QianStory.ensure(fakeS);
  if (g.QianFactions && g.QianFactions.ensure) g.QianFactions.ensure(fakeS);
  if (g.QianArcs && g.QianArcs.ensure) g.QianArcs.ensure(fakeS);

  g.QianStoryFlow.begin(fakeS);
  assert(fakeS.storyFlow.nodeId === 'pro_01', 'begin pro_01');
  let node = g.QianStoryFlow.getNode(fakeS);
  assert(node && /墨色長夢|陋室/.test(node.text), 'prologue text');
  let choices = g.QianStoryFlow.visibleChoices(fakeS);
  assert(choices.length >= 2, 'prologue choices');

  let r = g.QianStoryFlow.applyChoice(fakeS, 'a');
  assert(r.ok && fakeS.storyFlow.nodeId === 'pro_02', 'to pro_02');
  r = g.QianStoryFlow.applyChoice(fakeS, 'a');
  assert(r.ok && fakeS.storyFlow.nodeId === 'ch1_hub', 'to ch1_hub');
  assert(r.advance === 'period', 'period advance flag');

  // farm path
  r = g.QianStoryFlow.applyChoice(fakeS, 'farm');
  assert(r.ok && fakeS.storyFlow.nodeId === 'ch1_farm', 'farm node');
  r = g.QianStoryFlow.applyChoice(fakeS, 'a');
  assert(fakeS.flags.ch1_farm_done, 'farm done');
  assert(fakeS.food >= 20, 'food reward');

  // back to hub via after
  assert(fakeS.storyFlow.nodeId === 'ch1_after', 'after');
  g.QianStoryFlow.applyChoice(fakeS, 'a');
  assert(fakeS.storyFlow.nodeId === 'ch1_hub', 'hub again');

  // market
  g.QianStoryFlow.applyChoice(fakeS, 'mkt');
  g.QianStoryFlow.applyChoice(fakeS, 'a');
  g.QianStoryFlow.applyChoice(fakeS, 'a'); // after -> hub
  assert(fakeS.flags.ch1_ready, 'ch1_ready after 2 acts');

  // skip to road
  const vis = g.QianStoryFlow.visibleChoices(fakeS).map((c) => c.id);
  assert(vis.indexOf('next') >= 0, 'next unlock: ' + vis.join(','));

  // period advance still works
  const a1 = g.QianModes.advancePeriod(fakeS);
  assert(fakeS.period === '午' || a1.period, 'period ok');

  // resume hub
  const old = {
    v: 6, day: 3, period: '暮', gold: 50, food: 10, hp: 70,
    fame: 5, people: 8, factions: { lu: 0, qin: 0, sai: 0 },
    flags: { visited_xianyang: 1 }, npcs: {}, plotFlags: {}, arcProg: {},
    skills: {}, bag: {}, career: 'farmer', hero: { name: '豆豆' },
    worldMode: 'history', attrs: {}, access: {}
  };
  // migrate path is inside game IIFE — test ensure+begin fromSave
  g.QianStoryFlow.ensure(old);
  g.QianStoryFlow.begin(old, { fromSave: true });
  assert(old.storyFlow.nodeId === 'resume_hub', 'resume hub');

  // DOM: story panel exists
  assert(document.getElementById('story-panel'), 'story-panel');
  assert(document.getElementById('story-choices'), 'story-choices');
  assert(document.getElementById('tab-story'), 'tab-story');

  const gameSrc = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  assert(gameSrc.includes("GAME_VERSION = '35'"), 'version 35');
  assert(gameSrc.includes('function renderStoryPanel'), 'renderStoryPanel');
  assert(gameSrc.includes('QianStoryFlow'), 'wired');
  assert(html.includes('story_flow.js') || tags.includes('story_flow.js'), 'script tag');

  // UI start attempt
  const btnNew = document.getElementById('btn-new');
  if (btnNew) btnNew.click();
  await sleep(40);
  const nameInput = document.getElementById('create-name');
  if (nameInput) nameInput.value = '豆豆';
  document.querySelectorAll('button, .chip-card, .career-card').forEach((b) => {
    const t = (b.textContent || '') + (b.dataset.career || '');
    if (/農夫|farmer/.test(t)) b.click();
  });
  ['btn-create-next', 'btn-create-go'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.click();
  });
  await sleep(100);
  let snap = g.render_game_to_text && JSON.parse(g.render_game_to_text());
  if (snap && snap.ok) {
    console.log('UI live', snap.day, snap.story);
    assert(snap.v === '35' || snap.v === 35, 'snap v');
    assert(snap.story && snap.story.nodeId, 'story in snap');
    // click first story choice if present
    const btn = document.querySelector('#story-choices .story-choice:not([disabled])');
    if (btn) {
      btn.click();
      await sleep(40);
      const s2 = JSON.parse(g.render_game_to_text());
      assert(s2.story && s2.story.nodeId !== snap.story.nodeId, 'choice advanced node');
      console.log('advanced to', s2.story.nodeId);
    }
  } else {
    console.log('UI start skipped; module path covered');
  }

  console.log('SMOKE_V35_OK');
  process.exit(0);
})().catch((e) => {
  console.error('SMOKE_FAIL', e);
  process.exit(1);
});
