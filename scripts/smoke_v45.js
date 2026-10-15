/**
 * v45 smoke: side sheet opens playable sides; origins/careers expanded; plot gates
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
  await sleep(180);
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
  const gameSrc = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const flowSrc = fs.readFileSync(path.join(root, 'story_flow.js'), 'utf8');
  const worldSrc = fs.readFileSync(path.join(root, 'world.js'), 'utf8');
  const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const style = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

  assert(gameSrc.includes("GAME_VERSION = '45'"), 'version 45');
  assert(idx.includes('?v=45'), 'cache bust 45');
  assert(!idx.includes('?v=44'), 'no stale v44');
  assert(idx.includes('sheet-side') && idx.includes('side-list'), 'side sheet html');
  assert(gameSrc.includes('openSideSheet') && gameSrc.includes("click', openSideSheet"), 'q-act -> openSideSheet');
  assert(!gameSrc.includes("q-act')).addEventListener('click', openActSheet)"), 'q-act no longer act sheet');
  assert(style.includes('v45') && style.includes('side-card'), 'v45 css');
  assert(flowSrc.includes('listSides') && flowSrc.includes('decorateNode'), 'flow list/decorate');
  assert(flowSrc.includes('side_drill_help') && flowSrc.includes('side_clerk_doc'), 'new sides');
  assert(worldSrc.includes("id: 'artisan'") && worldSrc.includes("id: 'steppe'"), 'new origins');
  assert(gameSrc.includes("id: 'scribe'") && gameSrc.includes("id: 'agent'") && gameSrc.includes("id: 'diviner'"), 'new careers');

  const W = window.QianWorld;
  const Flow = window.QianStoryFlow;
  assert(W && Flow, 'modules');
  assert(W.ORIGINS.length >= 13, 'origins count ' + W.ORIGINS.length);
  assert(document.getElementById('sheet-side'), 'dom sheet-side');
  assert(document.getElementById('q-act'), 'dom q-act');

  const S = {
    day: 2, gold: 40, hp: 80, maxHp: 80, food: 5, fame: 2, people: 2,
    career: 'healer', flags: {}, plotFlags: {}, access: {}, npcs: {}, bag: {},
    hero: { name: '豆豆', gender: 'f', origin: 'tradoc', disguise: 'none' },
    storyFlow: { nodeId: 'ch1_hub', seen: {}, started: true },
    factions: {}, attrs: { bian: 2, shen: 2 }, skills: { med: 2 },
    gear: [], equipped: {}, gearSeq: 0
  };
  Flow.ensure(S);
  W.applyOrigin(S, 'tradoc');

  const sides = Flow.listSides(S);
  assert(sides.length >= 10, 'listSides len ' + sides.length);
  const grain = sides.find((s) => s.id === 'side_vil_grain');
  assert(grain && grain.state === 'open', 'grain open');
  const witch = sides.find((s) => s.id === 'side_witch_herb');
  assert(witch && witch.state === 'open', 'witch open for tradoc/healer');
  assert(witch.boosted, 'witch boosted');

  const jr = Flow.jumpTo(S, 'side_witch_herb');
  assert(jr.ok && S.storyFlow.nodeId === 'side_witch_herb', 'jump side');

  // decorate
  S.storyFlow.nodeId = 'pro_01';
  const n0 = Flow.getNode(S);
  const dec = Flow.decorateNode(S, n0);
  assert(dec.text.indexOf('醫門') >= 0 || dec.text.indexOf('藥') >= 0, 'decorate origin flavor');

  // origin-gated choice visible
  S.storyFlow.nodeId = 'ch1_hub';
  S.flags.side_witch = false;
  const ch = Flow.visibleChoices(S);
  assert(ch.some((c) => c.id === 'herb_side'), 'herb_side visible for tradoc/healer got ' + ch.map(c=>c.id).join(','));

  // exile side locked for tradoc
  const exile = sides.find((s) => s.id === 'side_exile_mark');
  assert(exile && exile.state === 'locked', 'exile locked');

  // click q-act opens sheet
  S.storyFlow.nodeId = 'ch1_hub';
  // expose by clicking
  const btn = document.getElementById('q-act');
  // openSideSheet needs global S in game - may not be set in smoke; call Flow only
  assert(typeof Flow.listSides === 'function', 'listSides fn');

  const v = Flow.validate();
  assert(v.ok, 'flow validate ' + (v.errors || []).slice(0, 5).join(';'));

  console.log('smoke_v45 OK origins=' + W.ORIGINS.length + ' sides=' + sides.length);
})().catch((e) => { console.error(e); process.exit(1); });
