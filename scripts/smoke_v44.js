/**
 * v44 smoke: freeAct advances plot nodes + NPC actions; idle AUTO still separate
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
  await sleep(160);
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
  const gameSrc = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const freeSrc = fs.readFileSync(path.join(root, 'free_act.js'), 'utf8');
  const flowSrc = fs.readFileSync(path.join(root, 'story_flow.js'), 'utf8');
  const aiSrc = fs.readFileSync(path.join(root, 'ai.js'), 'utf8');
  const style = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  assert(gameSrc.includes("GAME_VERSION = '44'"), 'version 44');
  assert(idx.includes('?v=44'), 'cache bust 44');
  assert(!idx.includes('?v=43'), 'no stale v43 bust');
  assert(idx.includes('story-npc-act'), 'npc act slot');
  assert(idx.includes('tab-idle') && idx.includes('btn-idle-auto'), 'idle AUTO kept');
  assert(!idx.includes('id="q-auto"'), 'story AUTO still removed');
  assert(style.includes('v44') && style.includes('story-npc-act'), 'v44 css');
  assert(freeSrc.includes('applyPlotAdvance') && freeSrc.includes('planNpcAction'), 'free_act plot+npc');
  assert(freeSrc.includes('suggestJump') && freeSrc.includes('matchVisibleChoice'), 'jump/match');
  assert(flowSrc.includes('function jumpTo') && flowSrc.includes('jumpTo: jumpTo'), 'story_flow jumpTo');
  assert(aiSrc.includes('npcAction') && aiSrc.includes('jumpTo'), 'ai freeAct fields');
  assert(gameSrc.includes('showNpcActBanner') && gameSrc.includes('plotAdvance'), 'game wires plot/npc');

  assert(document.getElementById('story-npc-act'), 'dom story-npc-act');
  assert(document.getElementById('story-free-input'), 'free input');
  assert(document.getElementById('btn-idle-auto'), 'idle auto btn');

  const FA = window.QianFreeAct;
  const Flow = window.QianStoryFlow;
  assert(FA && Flow, 'modules loaded');

  // minimal state
  const S = {
    day: 3, gold: 40, hp: 80, maxHp: 80, food: 5, fame: 2, people: 2,
    flags: {}, plotFlags: {}, access: {}, npcs: {}, bag: {}, hero: { gender: 'f', disguise: 'none' },
    storyFlow: { nodeId: 'ch1_hub', seen: {}, started: true },
    factions: {}, attrs: { bian: 2, shen: 2 }, skills: { med: 1 },
    gear: [], equipped: {}, gearSeq: 0
  };
  Flow.ensure(S);

  // classify + suggest jump: 運糧 -> side_vil_grain
  assert(FA.classify('幫林嫂運糧', 'do') === 'side', 'intent side');
  const j1 = FA.suggestJump(S, '幫林嫂運糧', 'side');
  assert(j1 === 'side_vil_grain', 'jump grain got ' + j1);

  // match choice at ch1_hub
  const cid = FA.matchVisibleChoice(S, '往藥廬跟診', 'heal');
  assert(cid === 'med', 'match clinic choice got ' + cid);

  // offline resolve advances plot
  const r1 = FA.resolveOffline(S, '幫林嫂運糧', 'do');
  assert(r1.ok && r1.reply, 'offline reply');
  assert(r1.plotAdvance && r1.plotAdvance.nodeId === 'side_vil_grain', 'plot advance grain ' + JSON.stringify(r1.plotAdvance));
  assert(S.storyFlow.nodeId === 'side_vil_grain', 'node moved');
  assert(r1.npcAction && r1.npcAction.type, 'npc action present');

  // palace jump from xy_hub without access
  S.storyFlow.nodeId = 'xy_hub';
  S.flags.visited_xianyang = 1;
  S.access.palace = false;
  const r2 = FA.resolveOffline(S, '設法入宮通門禁', 'do');
  assert(r2.plotAdvance, 'palace plot advance');
  assert(/xy_palace/.test(r2.plotAdvance.nodeId), 'palace-related node ' + r2.plotAdvance.nodeId);

  // open_gate action when bribing with palace intent + gold
  S.storyFlow.nodeId = 'xy_palace_gate';
  S.gold = 50;
  const r3 = FA.resolveOffline(S, '收買門衛放我入宮', 'do');
  assert(r3.npcAction, 'bribe action');
  assert(S.access.palace === true || (r3.npcAction && r3.npcAction.type === 'open_gate'), 'gate opened or action open_gate');

  // schedule / confess stores pending meet
  S.storyFlow.nodeId = 'ch1_clinic';
  const r4 = FA.resolveOffline(S, '改日再來探望你', 'say');
  assert(r4.npcAction && r4.npcAction.type === 'schedule_meet', 'schedule meet');
  assert(S.pendingMeets && S.pendingMeets.length >= 1, 'pendingMeets stored');

  // jumpTo API
  const jr = Flow.jumpTo(S, 'xy_hub');
  assert(jr.ok && S.storyFlow.nodeId === 'xy_hub', 'jumpTo api');

  console.log('smoke_v44 OK');
})().catch((e) => { console.error(e); process.exit(1); });
