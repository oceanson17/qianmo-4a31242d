/**
 * v37 smoke: romance VN · no farm UI · codex · story_flow · arcs endings · AI hooks present
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
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
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

(async () => {
  await sleep(80);
  const g = window;
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

  assert(g.QianStoryFlow, 'QianStoryFlow');
  assert(g.QianCodex, 'QianCodex');
  assert(g.QianAI && g.QianAI.storyBeat, 'AI.storyBeat');
  assert(g.QianAI.chronicleDigest, 'AI.chronicleDigest');
  assert(g.QianAI.storytellerContinue, 'AI.storytellerContinue');
  const v = g.QianStoryFlow.validate();
  assert(v.ok, 'story validate ' + JSON.stringify(v.errors));
  assert(g.QianArcs, 'QianArcs');
  const av = g.QianArcs.validate();
  assert(Array.isArray(av) && av.length === 0, 'arcs validate ' + JSON.stringify(av));

  // ying endings >= 5 (confidant shield wary companion awe alter)
  const summ = g.QianArcs.listArcs();
  const ying = summ.find((a) => a.id === 'arc_ying');
  assert(ying && ying.endings >= 5, 'ying endings ' + (ying && ying.endings));

  assert(document.getElementById('dash'), 'dash');
  assert(document.getElementById('modal-rel'), 'modal-rel');
  assert(document.getElementById('modal-codex'), 'modal-codex');
  assert(document.getElementById('modal-read'), 'modal-read');
  assert(document.getElementById('modal-share'), 'modal-share');
  assert(document.getElementById('dash-rel'), 'dash-rel');
  assert(document.getElementById('dash-read'), 'dash-read');

  const gameSrc = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  assert(gameSrc.includes("GAME_VERSION = '37'"), 'version 37');
  assert(gameSrc.includes('noFarm') || gameSrc.includes('romance'), 'romance flags');
  // farm hidden in live css
  const css = fs.readFileSync(path.join(root, 'dash.css'), 'utf8');
  assert(css.includes('dash-live #farm-panel'), 'farm hidden css');

  // no farm nodes as main
  assert(!g.QianStoryFlow.NODES.ch1_farm, 'no ch1_farm');
  assert(g.QianStoryFlow.NODES.xy_taiyi, 'xy_taiyi');
  assert(g.QianStoryFlow.NODES.xy_near_meet, 'xy_near_meet');

  const fakeS = {
    v: 8, day: 1, period: '晨', gold: 70, food: 20, hp: 80, maxHp: 80,
    fame: 10, people: 8, factions: { lu: 0, qin: 0, sai: 0 }, joined: null,
    flags: {}, npcs: {}, chronicle: [], plotFlags: {}, arcProg: {}, endings: [],
    skills: { med: 3 }, bag: {}, career: 'healer',
    hero: { name: '豆豆', gender: 'x', origin: 'tradoc' },
    worldMode: 'history', attrs: { wu: 1, hu: 0, shen: 1, zhi: 2, bian: 2, yun: 0 },
    access: {}, storyFlow: { nodeId: null, seen: {}, started: false },
    dash: { filterNoise: false, x2: false, realm: 'home', col: 'world', tips: true }, dashLog: [], readLog: []
  };
  g.QianStoryFlow.begin(fakeS);
  assert(fakeS.storyFlow.nodeId === 'pro_01', 'begin');
  let r = g.QianStoryFlow.applyChoice(fakeS, 'a');
  assert(r.ok, 'choice a');
  r = g.QianStoryFlow.applyChoice(fakeS, 'a');
  assert(fakeS.storyFlow.nodeId === 'ch1_hub', 'ch1_hub');

  // offline beat
  const beat = g.QianStoryFlow.offlineBeat(fakeS, 'test', 'line');
  assert(beat && beat.length > 2, 'offline beat');

  // codex export
  const clip = g.QianCodex.exportClip(fakeS, ['測試橋段']);
  assert(/墨夢莊周/.test(clip) && /測試橋段/.test(clip), 'export clip');

  // UI start
  const btnNew = document.getElementById('btn-new');
  if (btnNew) btnNew.click();
  await sleep(40);
  const nameInput = document.getElementById('create-name');
  if (nameInput) nameInput.value = '豆豆';
  ['btn-create-next', 'btn-create-go'].forEach((id) => {
    const el = document.getElementById(id); if (el) el.click();
  });
  await sleep(60);
  const healer = document.querySelector('[data-career="healer"]');
  if (healer) healer.click();
  else {
    const farmer = document.querySelector('[data-career="farmer"]');
    if (farmer) farmer.click();
  }
  await sleep(150);

  let snap = g.render_game_to_text && JSON.parse(g.render_game_to_text());
  if (snap && snap.ok) {
    assert(String(snap.v) === '37', 'snap v37 got ' + snap.v);
    assert(snap.dash === true, 'dash');
    assert(snap.codex === true, 'codex in snap');
    assert(snap.romance === true, 'romance');
    const btn = document.querySelector('#story-choices .story-choice:not([disabled])');
    if (btn) {
      btn.click();
      await sleep(80);
      const s2 = JSON.parse(g.render_game_to_text());
      assert(s2.story && s2.story.nodeId !== snap.story.nodeId, 'advanced');
    }
    // open rel
    const relBtn = document.getElementById('dash-rel');
    if (relBtn) { relBtn.click(); await sleep(30); assert(document.getElementById('modal-rel').hidden === false, 'rel open'); }
  } else {
    console.log('UI start soft-skip');
  }

  console.log('SMOKE_V37_OK');
  process.exit(0);
})().catch((e) => { console.error('SMOKE_FAIL', e); process.exit(1); });
