/**
 * v42 smoke: free-act UI + offline resolve + sides + new arcs + v41 shell retained
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
  const flow = fs.readFileSync(path.join(root, 'story_flow.js'), 'utf8');
  const arcs = fs.readFileSync(path.join(root, 'arcs.js'), 'utf8');

  assert(gameSrc.includes("GAME_VERSION = '42'"), 'version 42');
  assert(idx.includes('story-free-input'), 'story free input');
  assert(idx.includes('free-mode-say') && idx.includes('free-mode-do'), '想說／想做');
  assert(idx.includes('free_act.js'), 'free_act script');
  assert(idx.includes('?v=42'), 'cache bust 42');
  assert(style.includes('v41'), 'keep v41 css');
  assert(style.includes('v42'), 'v42 css');
  assert(flow.includes('side_nightclinic') && flow.includes('side_vil_grain'), 'side quests');
  assert(arcs.includes("id: 'arc_su'") && arcs.includes("id: 'arc_cheng'"), 'new arcs');
  assert(gameSrc.includes('storyFreeSend') && gameSrc.includes('QianFreeAct'), 'wired free act');

  assert(window.QianFreeAct, 'QianFreeAct');
  assert(window.QianStoryFlow, 'QianStoryFlow');
  assert(window.QianArcs, 'QianArcs');
  assert(window.QianAI && window.QianAI.freeAct, 'AI.freeAct');

  const v = window.QianStoryFlow.validate();
  assert(v.ok, 'story_flow validate: ' + JSON.stringify(v.errors));
  const ae = window.QianArcs.validate();
  assert(!ae.length, 'arcs validate: ' + JSON.stringify(ae));
  const listed = window.QianArcs.listArcs();
  assert(listed.length >= 7, '≥7 arcs got ' + listed.length);

  const fakeS = {
    v: 9, day: 3, period: '午', gold: 40, food: 10, hp: 80, maxHp: 80,
    fame: 5, people: 5, factions: { lu: 0, qin: 0, sai: 0 }, joined: null,
    flags: {}, npcs: { he: { aff: 5, mem: [], talked: 1, known: true } },
    chronicle: [], plotFlags: {}, arcProg: {}, endings: [],
    skills: { farm: 0, med: 1 }, bag: { herb: 2 }, career: 'doctor',
    hero: { name: '豆豆', gender: 'f', origin: 'tradoc', disguise: null },
    worldMode: 'free', attrs: { wu: 0, hu: 0, shen: 1, zhi: 2, bian: 2, yun: 1 },
    access: {}, storyFlow: { nodeId: 'ch1_hub', seen: {}, started: true },
    mode: 'village', readLog: []
  };
  if (window.QianWorld && window.QianWorld.ensure) window.QianWorld.ensure(fakeS);

  const r1 = await window.QianFreeAct.resolve(fakeS, '請安，願聞村里近況', 'say');
  assert(r1 && r1.ok && r1.reply, 'offline say reply');
  assert(fakeS.plotFlags.free_actions >= 1, 'free_actions flag');
  assert(fakeS.npcs.he && fakeS.npcs.he.aff >= 5, 'aff touched or kept');

  const r2 = await window.QianFreeAct.resolve(fakeS, '我想入宮求見', 'do');
  assert(r2 && r2.ok, 'palace intent');
  assert(fakeS.plotFlags.want_palace || fakeS.flags.seek_palace || r2.intent === 'palace', 'palace flag/intent');

  const r3 = window.QianFreeAct.resolveOffline(fakeS, '送你一束藥草', 'say');
  assert(r3.intent === 'gift', 'gift intent');

  // side quest node reachable
  fakeS.storyFlow.nodeId = 'xy_side';
  const sides = window.QianStoryFlow.visibleChoices(fakeS);
  assert(sides.length >= 5, 'side hub choices');

  assert(document.getElementById('story-free-input'), 'dom free input');
  assert(document.getElementById('story-panel'), 'story-panel');

  console.log('SMOKE_V42_OK arcs=' + listed.length + ' sides=' + sides.length);
  process.exit(0);
})().catch((e) => {
  console.error('SMOKE_V42_FAIL', e && e.stack || e);
  process.exit(1);
});
