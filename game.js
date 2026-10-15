// v38 romance VN · codex · AI storyteller · no-farm · juice
(() => {
  'use strict';

  const SAVE_KEY = 'qianmo_v4';
  const SAVE_KEY_OLD = 'qianmo_v3';
  const SAVE_KEY_OLDER = 'qianmo_v2';
  const SAVE_KEY_OLDEST = 'qianmo_v1';
  const GAME_VERSION = '42';
  const ASSET_V = '?v=' + GAME_VERSION;
  const SEASONS = ['春', '夏', '秋', '冬'];
  const COLS = 6, ROWS = 4;

  const CAREERS = {
    farmer: {
      id: 'farmer', name: '農夫', desc: '田畝起家，種稼為先。起始糧種充裕，農藝較高。',
      gold: 70, food: 20, hp: 80, atk: 6, def: 2,
      skills: { farm: 3, med: 0, trade: 1, mart: 1, lit: 0 },
      bag: { rice: 4, veg: 2, wheat: 2 },
      quest: { id: 'q_farm', title: '春耕首穫', desc: '收成稻 6 束', need: { rice: 6 }, gold: 40, food: 4 }
    },
    healer: {
      id: 'healer', name: '醫者', desc: '懸壺青廬，採藥救人。藥術與草藥較豐。',
      gold: 90, food: 12, hp: 75, atk: 5, def: 2,
      skills: { farm: 1, med: 3, trade: 1, mart: 0, lit: 1 },
      bag: { herb: 5, rice: 2, flower: 3 },
      quest: { id: 'q_med', title: '青廬初診', desc: '煉成回春散 2 帖', need: { potion: 2 }, gold: 50, food: 2 }
    },
    merchant: {
      id: 'merchant', name: '商賈', desc: '坊市往來，銀兩較厚，買賣更利。',
      gold: 160, food: 10, hp: 70, atk: 5, def: 1,
      skills: { farm: 1, med: 0, trade: 3, mart: 0, lit: 1 },
      bag: { flower: 3, rice: 2 },
      quest: { id: 'q_trade', title: '坊市第一單', desc: '累計賣出得銀 80', needFlag: 'soldGold', needVal: 80, gold: 45, food: 3 }
    },
    soldier: {
      id: 'soldier', name: '武卒', desc: '校場出身，身強力壯，攜桐木劍開局。',
      gold: 60, food: 14, hp: 100, atk: 10, def: 4,
      skills: { farm: 0, med: 0, trade: 0, mart: 3, lit: 0 },
      bag: { rice: 2 },
      startGear: { slot: 'weapon', name: '桐木劍', atk: 3, def: 0, hp: 0, rarity: 'white' },
      quest: { id: 'q_fight', title: '校場初勝', desc: '戰勝 3 場', needFlag: 'wins', needVal: 3, gold: 55, food: 2 }
    },
    scholar: {
      id: 'scholar', name: '書生', desc: '通文識禮，鄉鄰好感較易提升。',
      gold: 85, food: 12, hp: 70, atk: 4, def: 1,
      skills: { farm: 1, med: 1, trade: 1, mart: 0, lit: 3 },
      bag: { flower: 4, rice: 2 },
      quest: { id: 'q_friend', title: '以文會友', desc: '任一鄉鄰好感達 30', needFlag: 'maxAff', needVal: 30, gold: 50, food: 2 }
    },
    craftsman: {
      id: 'craftsman', name: '工匠', desc: '鍛礦製器，坊市製物更利，開局帶礦石。',
      gold: 95, food: 12, hp: 85, atk: 7, def: 3,
      skills: { farm: 1, med: 0, trade: 2, mart: 1, lit: 0, craft: 3 },
      bag: { ore: 4, rice: 2, wheat: 1 },
      quest: { id: 'q_craft', title: '爐火初成', desc: '累計持有礦石 8', need: { ore: 8 }, gold: 55, food: 2 }
    },
    hunter: {
      id: 'hunter', name: '獵戶', desc: '山野採獵為生，開局身健，擅入山。',
      gold: 65, food: 16, hp: 95, atk: 9, def: 3,
      skills: { farm: 1, med: 1, trade: 0, mart: 2, lit: 0 },
      bag: { herb: 3, rice: 2, wheat: 2 },
      startGear: { slot: 'weapon', name: '獵弓', atk: 4, def: 0, hp: 0, rarity: 'white' },
      quest: { id: 'q_hunt', title: '山徑首獲', desc: '戰勝 4 場', needFlag: 'wins', needVal: 4, gold: 50, food: 3 }
    },
    ranger: {
      id: 'ranger', name: '遊俠', desc: '遊走邊塞坊市，戰力與名聲並重。',
      gold: 100, food: 12, hp: 90, atk: 11, def: 3,
      skills: { farm: 0, med: 0, trade: 1, mart: 3, lit: 1 },
      bag: { rice: 2, flower: 2, potion: 1 },
      startGear: { slot: 'accessory', name: '行旅佩', atk: 2, def: 1, hp: 6, rarity: 'green' },
      quest: { id: 'q_ranger', title: '邊塵初試', desc: '邊塞最深達 3', needFlag: 'frontBest', needVal: 3, gold: 60, food: 2 }
    }
  };

  const CROPS = {
    rice:   { name: '稻', grow: 5, waterNeed: true,  sell: 8,  food: 6, seedCost: 3, color: '#8bc34a', ripe: '#fdd835' },
    veg:    { name: '菜', grow: 4, waterNeed: true,  sell: 10, food: 3, seedCost: 4, color: '#66bb6a', ripe: '#43a047' },
    flower: { name: '花', grow: 3, waterNeed: false, sell: 14, food: 0, seedCost: 5, color: '#ec407a', ripe: '#f48fb1' },
    wheat:  { name: '麥', grow: 4, waterNeed: false, sell: 7,  food: 5, seedCost: 3, color: '#dce775', ripe: '#fbc02d' }
  };
  const DIRS = {
    grain:  { label: '多種糧', prefer: ['rice', 'wheat'], sellFoodKeep: 20, expandBias: 0.2 },
    money:  { label: '多賺錢', prefer: ['flower', 'veg'], sellFoodKeep: 8, expandBias: 0.35 },
    expand: { label: '擴田優先', prefer: ['flower', 'veg'], sellFoodKeep: 10, expandBias: 0.95 },
    winter: { label: '存糧過冬', prefer: ['wheat', 'rice'], sellFoodKeep: 40, expandBias: 0.1 }
  };
  /* ---- v34：場景表由 modes.js（QianModes）載入 ---- */
  const SCENE_ART = window.QianModes.SCENE_ART;
  const MODE_LABELS = window.QianModes.MODE_LABELS;
  const ALL_MODES = window.QianModes.ALL_MODES;
  const WORK_MODES = window.QianModes.WORK_MODES;
  const EXPLORE_MODES = window.QianModes.EXPLORE_MODES;
  const DUNGEON_MODES = window.QianModes.DUNGEON_MODES;
  const LEISURE_MODES = window.QianModes.LEISURE_MODES;
  const CRAFT_MODES = window.QianModes.CRAFT_MODES;
  const BEAUTY_MODES = window.QianModes.BEAUTY_MODES;
  const QIN_COURT_MODES = window.QianModes.QIN_COURT_MODES;
  const TRAVEL_COST = window.QianModes.TRAVEL_COST;
  const SCENE_CAPS = window.QianModes.SCENE_CAPS;
  const PERIODS = window.QianModes.PERIODS;
  let storyLines = [];

  /* ---- v34：戰鬥表由 combat_data.js（QianCombat）載入 ---- */
  const RARITIES = window.QianCombat.RARITIES;
  const RARITY_ORDER = window.QianCombat.RARITY_ORDER;
  const ENEMIES_DRILL = window.QianCombat.ENEMIES_DRILL;
  const ENEMIES_WILD = window.QianCombat.ENEMIES_WILD;
  const ENEMIES_MINE = window.QianCombat.ENEMIES_MINE;
  const ENEMIES_FRONT = window.QianCombat.ENEMIES_FRONT;
  const ENEMIES_RUINS = window.QianCombat.ENEMIES_RUINS;
  const ENEMIES_CRYPT = window.QianCombat.ENEMIES_CRYPT;
  const ENEMIES_GORGE = window.QianCombat.ENEMIES_GORGE;
  const ENEMIES_STONE = window.QianCombat.ENEMIES_STONE;
  const ENEMIES_MARSH = window.QianCombat.ENEMIES_MARSH;
  const BOSSES = window.QianCombat.BOSSES;
  const SHOP_ITEMS = [
    { id: 'seed', name: '種子包', desc: '稻2菜1麥1', gold: 15, buy: () => {} },
    { id: 'food', name: '糧包', desc: '存糧+6', gold: 10 },
    { id: 'herb', name: '草藥束', desc: '草藥×2', gold: 12 },
    { id: 'flower', name: '山花束', desc: '花卉×2', gold: 10 },
    { id: 'ore', name: '礦石袋', desc: '礦石×2', gold: 18 },
    { id: 'potion', name: '回春散', desc: '藥劑×1', gold: 28 },
    { id: 'hire', name: '僱長工', desc: '田莊人手+1', gold: 0 }
  ];
  const FACE_V = GAME_VERSION;
  function allNpcs() {
    if (window.QianWorld && window.QianWorld.CAST) return window.QianWorld.CAST;
    return [];
  }
  function liveNpcs() {
    const list = allNpcs();
    if (!S || !window.QianWorld) return list;
    return window.QianWorld.castForTalk(S);
  }
  // compat alias used throughout file
  let NPCS = allNpcs();
  function refreshNpcs() { NPCS = liveNpcs(); return NPCS; }

  const FACTION_FACE = { lu: 'merchant', qin: 'soldier', sai: 'scholar' };
  function faceUrl(key) {
    return 'assets/face_' + key + '.webp?v=' + FACE_V;
  }
  /** 頭像：女／不顯→face_hero；男→職業臉；男扮女裝→face_hero_f；女扮男裝→職業男臉 */
  function careerFaceKey(careerId, gender) {
    const g = gender || (S && S.hero && S.hero.gender) || 'x';
    const h = S && S.hero;
    const map = {
      farmer: 'farmer_m',
      healer: 'doctor',
      merchant: 'merchant',
      soldier: 'soldier',
      scholar: 'scholar',
      craftsman: 'craftsman',
      hunter: 'hunter',
      ranger: 'ranger'
    };
    if (h && h.gender === 'm' && h.disguise === 'female') return 'hero_f';
    if (h && h.gender === 'f' && h.disguise === 'male') return map[careerId] || 'farmer_m';
    if (g === 'f' || g === 'x') return 'hero';
    return map[careerId] || 'hero';
  }
  /** 擇業立繪仍按職業／性別變體（與 HUD 頭像分開） */
  function careerCharKey(careerId, gender) {
    const g = gender || (S && S.hero && S.hero.gender) || 'x';
    const map = {
      farmer: g === 'f' ? 'farmer_f' : (g === 'x' ? 'hero' : 'farmer_m'),
      healer: 'doctor',
      merchant: 'merchant',
      soldier: 'soldier',
      scholar: 'scholar',
      craftsman: 'craftsman',
      hunter: 'hunter',
      ranger: 'ranger'
    };
    return map[careerId] || 'hero';
  }
  function careerTitle(careerId) {
    const titles = {
      farmer: '田畝小道', healer: '懸壺小道', merchant: '坊市行賈',
      soldier: '校場武卒', scholar: '青衿書生', craftsman: '爐邊工匠',
      hunter: '山徑獵戶', ranger: '遊俠浪客'
    };
    return titles[careerId] || '修仙小道';
  }
  function heroLevel() {
    if (!S) return 1;
    const sk = S.skills || {};
    const sum = (sk.farm||0)+(sk.med||0)+(sk.trade||0)+(sk.mart||0)+(sk.lit||0)+(sk.craft||0);
    const wins = (S.flags && S.flags.wins) || S.wins || 0;
    return Math.max(1, 1 + Math.floor(((S.day || 1) - 1) / 10) + Math.floor(sum / 4) + Math.floor(wins / 4));
  }
  function combatPower() {
    const st = stats();
    const a = st.attrs || {};
    const fame = Math.floor(S.fame || 0);
    const people = Math.floor(S.people || 0);
    return Math.max(100,
      st.atk * 120 + st.def * 80 + st.maxHp * 6 +
      (a.wu||0)*40 + (a.hu||0)*30 + (a.shen||0)*25 + (a.zhi||0)*20 + (a.bian||0)*15 + (a.yun||0)*10 +
      fame * 12 + people * 8 + heroLevel() * 50
    );
  }
  function npcFaceKey(n) {
    return (n && n.face) || 'farmer_m';
  }
  const RECIPES = [
    { id: 'riceBall', name: '稻香糰', scene: 'market', needs: { rice: 2 }, out: { food: 8 }, desc: '回復存糧' },
    { id: 'vegSoup', name: '青菜湯', scene: 'market', needs: { veg: 2, wheat: 1 }, out: { food: 4 }, heal: 18, desc: '戰鬥回血 18' },
    { id: 'potion', name: '回春散', scene: 'clinic', needs: { herb: 2, flower: 1 }, out: { potion: 1 }, heal: 0, desc: '藥劑 · 可服回血 35' },
    { id: 'pickaxe', name: '鐵鎬頭', scene: 'market', needs: { ore: 3, wheat: 1 }, out: { food: 0 }, gold: 20, desc: '換成銀20 · 工匠+5' },
    { id: 'salve', name: '金創膏', scene: 'clinic', needs: { herb: 3, ore: 1 }, out: { potion: 2 }, desc: '雙份藥劑' },
    { id: 'anesthetic', name: '麻醉藥', scene: 'clinic', needs: { herb: 4, flower: 1 }, out: { anesthetic: 1 }, desc: '迷倒門衛 · 需藥理' },
    { id: 'blade', name: '百煉刃', scene: 'forge', needs: { ore: 4 }, out: {}, gold: 28, desc: '鍛刀換銀 · 工+機率' },
    { id: 'armorKit', name: '皮甲片', scene: 'forge', needs: { ore: 2, wheat: 1 }, out: {}, gold: 18, desc: '甲片換銀' },
    { id: 'stool', name: '桐木凳', scene: 'wood', needs: { wheat: 1, rice: 1 }, out: {}, gold: 14, desc: '傢什換銀' },
    { id: 'chest', name: '樟木匣', scene: 'wood', needs: { wheat: 2, flower: 1 }, out: {}, gold: 22, desc: '精匣換銀' },
    { id: 'incenseStick', name: '安神香', scene: 'incense', needs: { flower: 2, herb: 1 }, out: {}, heal: 12, desc: '燃香回體12' },
    { id: 'spiritIncense', name: '清心香', scene: 'incense', needs: { flower: 3, herb: 2 }, out: {}, gold: 16, desc: '貢香換銀·名聲' },
    { id: 'cloth', name: '粗布', scene: 'weave', needs: { flower: 1, wheat: 1 }, out: { cloth: 1 }, desc: '織布·可送禮' },
    { id: 'silk', name: '絹帛', scene: 'weave', needs: { flower: 3, wheat: 2 }, out: { cloth: 2 }, gold: 12, desc: '細絹·銀與布' },
    { id: 'scroll', name: '抄本', scene: 'study', needs: { flower: 1 }, out: {}, gold: 8, desc: '抄書換銀·文才' },
    { id: 'canalOrder', name: '漕運單', scene: 'canal', needs: { rice: 2 }, out: {}, gold: 24, desc: '運糧交單' }
  ];
  const ORDER_POOL = [
    { need: { rice: 4 }, rewardGold: 40, rewardFood: 2, title: '糧行急單' },
    { need: { veg: 3 }, rewardGold: 38, rewardFood: 1, title: '菜攤補貨' },
    { need: { flower: 3 }, rewardGold: 48, rewardFood: 0, title: '花市訂購' },
    { need: { herb: 3 }, rewardGold: 42, rewardFood: 0, title: '藥廬草料' },
    { need: { wheat: 4 }, rewardGold: 36, rewardFood: 2, title: '磨坊麥單' }
  ];

  let S = null;
  let mode = 'hut';
  let autoOn = false;
  let selectedCrop = 'rice';
  let directive = 'grain';
  let selectedNpc = 'he';
  let sayMode = 'say';
  let battle = null;
  let battleLockUntil = 0; // after defeat/flee, block auto re-fight briefly
  let toastTimer = 0;
  let lastTick = 0;

  const $ = (id) => document.getElementById(id);
  const canvas = () => $('farm');
  const ctx = () => canvas() && canvas().getContext('2d');

  function toast(msg, kind) {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('ok', 'err', 'toast-pop');
    if (kind === 'ok' || kind === 'err') el.classList.add(kind);
    el.hidden = false;
    // restart pop animation
    void el.offsetWidth;
    el.classList.add('toast-pop');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
      el.classList.remove('toast-pop', 'ok', 'err');
    }, 2200);
  }

  /* ---- Juice: shake / flash / dmg / tap ---- */
  let juiceTrauma = 0;
  let juiceShakeRaf = 0;
  let juiceHitStopUntil = 0;
  function juiceReduceMotion() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }
  function juiceBaseTransform() {
    try {
      if (window.matchMedia && window.matchMedia('(min-width:421px)').matches) return 'translateY(-50%)';
    } catch (e) {}
    return '';
  }
  function juiceShake(amount) {
    if (juiceReduceMotion()) return;
    juiceTrauma = Math.min(1, juiceTrauma + (amount || 0.35));
    if (juiceShakeRaf) return;
    const app = $('app') || document.getElementById('app');
    if (!app) return;
    const tick = () => {
      juiceTrauma = Math.max(0, juiceTrauma * 0.86 - 0.004);
      if (juiceTrauma <= 0.01) {
        juiceTrauma = 0;
        app.style.transform = juiceBaseTransform();
        juiceShakeRaf = 0;
        return;
      }
      const t = juiceTrauma * juiceTrauma;
      const ang = Date.now() / 18;
      const x = Math.sin(ang * 1.7) * t * 7;
      const y = Math.cos(ang * 2.1) * t * 5;
      const base = juiceBaseTransform();
      app.style.transform = (base ? base + ' ' : '') + 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
      juiceShakeRaf = requestAnimationFrame(tick);
    };
    juiceShakeRaf = requestAnimationFrame(tick);
  }
  function juiceFlash() {
    if (juiceReduceMotion()) return;
    let el = document.getElementById('battle-flash');
    if (!el) {
      el = document.createElement('div');
      el.id = 'battle-flash';
      el.className = 'battle-flash';
      el.setAttribute('aria-hidden', 'true');
      (document.body || document.documentElement).appendChild(el);
    }
    el.classList.remove('on');
    void el.offsetWidth;
    el.classList.add('on');
    setTimeout(() => { el.classList.remove('on'); }, 140);
  }
  function juiceDmgFloat(text, opts) {
    if (juiceReduceMotion()) return;
    opts = opts || {};
    const n = document.createElement('div');
    n.className = 'dmg-float' + (opts.crit ? ' crit' : '') + (opts.hurt ? ' hurt' : '') + (opts.heal ? ' heal' : '');
    n.textContent = text;
    const app = $('app');
    const r = (app && app.getBoundingClientRect()) || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const cx = opts.x != null ? opts.x : (r.left + r.width * (opts.hurt ? 0.28 : 0.72));
    const cy = opts.y != null ? opts.y : (r.top + r.height * 0.38);
    n.style.left = cx + 'px';
    n.style.top = cy + 'px';
    document.body.appendChild(n);
    setTimeout(() => { try { n.remove(); } catch (e) {} }, 750);
  }
  function juiceHitStop(ms) {
    if (juiceReduceMotion()) return;
    const dur = Math.max(0, ms || 0);
    if (dur < 30) return;
    // wall-clock timer — never depend on timeScale
    juiceHitStopUntil = Date.now() + dur;
  }
  function juiceHit(dmg, opts) {
    opts = opts || {};
    const big = !!opts.crit || dmg >= 12 || !!opts.boss;
    const label = (opts.crit ? '會心 ' : '') + (opts.hurt ? '-' : '') + dmg;
    juiceFlash();
    juiceDmgFloat(label, { crit: !!opts.crit, hurt: !!opts.hurt });
    juiceShake(big ? 0.55 : (opts.hurt ? 0.4 : 0.28));
    if (big) juiceHitStop(opts.crit ? 70 : 45);
    try {
      if (navigator.vibrate) navigator.vibrate(big ? [12, 30, 12] : 8);
    } catch (e) {}
  }

  function tapFeel(el, ev) {
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
    if (!el) return;
    if (ev && ev.clientX != null) {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--rx', ((ev.clientX - r.left) / Math.max(1, r.width) * 100) + '%');
      el.style.setProperty('--ry', ((ev.clientY - r.top) / Math.max(1, r.height) * 100) + '%');
    }
    el.classList.add('pressed', 'ripple');
    setTimeout(() => { el.classList.remove('pressed', 'ripple'); }, 180);
  }
  function bindTapFeel(root) {
    const scope = root || document;
    const sel = '.quick-replies button, .event-choice, .event-choices .btn, .choice-tap, #gate-choices .btn, .chip-card, .career-card, .btn, .tbtn, #tabs button';
    scope.querySelectorAll(sel).forEach((b) => {
      if (b.dataset.tapBound) return;
      b.dataset.tapBound = '1';
      b.addEventListener('click', (ev) => tapFeel(b, ev), { passive: true });
    });
  }
  function storyEnsure() {
    if (window.QianStory && S) window.QianStory.ensure(S);
  }
  function npcKnown(id) {
    if (!S) return false;
    if (window.QianStory) return window.QianStory.isKnown(S, id);
    return true;
  }
  function markNpcKnown(id, why) {
    if (window.QianStory) return window.QianStory.markKnown(S, id, why);
    if (S.npcs[id]) S.npcs[id].known = true;
  }
  function logNpcAct(id, text, feels) {
    if (!S || !id) return;
    if (window.QianStory) {
      window.QianStory.logNpc(S, id, text);
      if (feels) Object.keys(feels).forEach((k) => window.QianStory.bumpFeel(S, id, k, feels[k]));
    } else if (S.npcs[id]) {
      S.npcs[id].mem = S.npcs[id].mem || [];
      S.npcs[id].mem.push(text.slice(0, 24));
    }
  }
  function disguiseOn() {
    return !!(window.QianStory && window.QianStory.disguiseActive(S));
  }
  function disguiseFemaleOn() {
    return !!(window.QianStory && window.QianStory.disguiseFemaleActive
      ? window.QianStory.disguiseFemaleActive(S)
      : (S && S.hero && S.hero.gender === 'm' && S.hero.disguise === 'female'));
  }
  function heroPresentingMale() {
    if (!S || !S.hero) return false;
    if (window.QianStory && window.QianStory.presentingAsMale) return window.QianStory.presentingAsMale(S);
    if (S.hero.gender === 'm' && !disguiseFemaleOn()) return true;
    return disguiseOn();
  }
  function heroPresentingFemale() {
    if (!S || !S.hero) return false;
    if (window.QianStory && window.QianStory.presentingAsFemale) return window.QianStory.presentingAsFemale(S);
    if (S.hero.gender === 'f' && !disguiseOn()) return true;
    return disguiseFemaleOn();
  }

  function status(msg) {
    const el = $('status-text');
    if (el) el.textContent = msg;
    pushStory(msg, 'nar');
  }
  function pushStory(msg, cls) {
    if (!msg) return;
    storyLines.push({ t: msg, c: cls || 'nar', at: Date.now() });
    if (storyLines.length > 80) storyLines = storyLines.slice(-80);
    const log = $('story-log');
    if (!log) return;
    const div = document.createElement('div');
    div.className = 'line ' + (cls || 'nar');
    div.textContent = msg;
    log.appendChild(div);
    while (log.children.length > 6) log.removeChild(log.firstChild);
    const box = $('txt');
    if (box) box.scrollTop = box.scrollHeight;
  }
  function openLogReview() {
    const body = $('log-body');
    if (!body) return;
    body.innerHTML = storyLines.slice().reverse().map((x) =>
      '<div class="line ' + x.c + '">' + x.t.replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])) + '</div>'
    ).join('') || '<div class="line nar">尚無記錄</div>';
    $('modal-log').hidden = false;
  }
  function dayStr() {
    if (!S) return '';
    if (window.QianModes) window.QianModes.ensurePeriod(S);
    const season = SEASONS[((S.day || 1) - 1) % 4];
    const per = S.period || '晨';
    return '第' + S.day + '日 · ' + per + ' · ' + season;
  }
  function seasonIdx() {
    return Math.floor((S.day - 1) / 28) % 4;
  }

  function emptyPlot() {
    return { crop: null, grow: 0, watered: false, unlocked: false };
  }
  function makePlots(n) {
    const plots = [];
    for (let i = 0; i < COLS * ROWS; i++) {
      const p = emptyPlot();
      p.unlocked = i < n;
      plots.push(p);
    }
    return plots;
  }

  function newState(careerId) {
    const C = CAREERS[careerId];
    const gear = [];
    const equipped = { weapon: null, armor: null, accessory: null };
    if (C.startGear) {
      let g = Object.assign({ id: 'g0', slot: C.startGear.slot }, C.startGear);
      if (window.QianEquip) {
        const def = window.QianEquip.getDef(g.name) || window.QianEquip.getDef(g.tableId);
        if (def) {
          g = window.QianEquip.spawn(def.id, 0, g.rarity || def.rarity) || g;
          g.id = 'g0';
        }
      }
      if (!g.icon) g.icon = (g.slot === 'weapon' ? 'jian' : g.slot === 'armor' ? 'jia' : 'pei');
      gear.push(g);
      equipped[g.slot === 'tool' ? 'accessory' : g.slot] = g.id;
    }
    /* 開局再贈一冊農器／凡品，方便行囊看見新圖鑑 */
    if (window.QianEquip) {
      const extras = ['mu_chu', 'cao_huan', 'qian_dai'];
      extras.forEach((tid) => {
        if (gear.some((x) => x.tableId === tid)) return;
        const inst = window.QianEquip.spawn(tid, gear.length, 'fan');
        if (inst) { gear.push(inst); }
      });
      /* 依職業再贈一件良品 */
      const careerGift = {
        farmer: 'tie_chu', healer: 'yao_dai', scholar: 'wen_bi', merchant: 'sai_shi_huan',
        soldier: 'bian_jun_kai', craftsman: 'ge_dai', hunter: 'shan_gong', ranger: 'pi_lv'
      };
      const gid = careerGift[careerId];
      if (gid) {
        const inst = window.QianEquip.spawn(gid, gear.length, 'liang');
        if (inst) gear.push(inst);
      }
    }
    const quest = Object.assign({ done: false, progress: 0 }, C.quest);
    const cast = (window.QianWorld && window.QianWorld.CAST) || [];
    const st = {
      v: 9,
      career: careerId,
      name: (window.__createDraft && window.__createDraft.name) || '旅人',
      day: 1,
      period: '晨',
      npcAI: { loc: {}, state: {}, intent: {}, log: [], interrupted: {} },
      gold: C.gold,
      food: C.food,
      hp: C.hp,
      maxHp: C.hp,
      baseAtk: C.atk,
      baseDef: C.def,
      skills: Object.assign({}, C.skills),
      bag: Object.assign({ rice: 0, veg: 0, flower: 0, wheat: 0, herb: 0, ore: 0, potion: 0, anesthetic: 0 }, C.bag),
      plots: makePlots(8 + (C.skills.farm || 0)),
      plotCount: 8 + (C.skills.farm || 0),
      auto: false,
      directive: 'grain',
      npcs: cast.reduce((a, n) => {
        a[n.id] = { aff: C.id === 'scholar' ? 8 : 0, mem: [], talked: 0, known: false,
          feel: { respect: 0, fear: 0, suspicion: 0, gratitude: 0 }, log: [] };
        return a;
      }, {}),
      order: rollOrder(1),
      orderDone: false,
      gear,
      equipped,
      gearSeq: 1,
      wildFloor: 1,
      wildBest: 0,
      mineFloor: 1,
      frontFloor: 1,
      frontBest: 0,
      fishSpot: 1,
      wins: 0,
      soldGold: 0,
      quest,
      flags: {},
      fame: Math.min(20, Math.floor(C.gold / 20)),
      people: C.id === 'scholar' ? 14 : (C.id === 'healer' ? 12 : 8),
      factions: { lu: 0, qin: C.id === 'soldier' ? 6 : 0, sai: C.id === 'merchant' ? 4 : 0 },
      joined: null,
      worldLine: '秦王政元年，少年王即位，呂不韋為相邦。',
      endings: [],
      seenEvents: {},
      dayActs: { farm: 0, sell: 0, gift: 0, heal: 0, fight: 0, trade: 0, order: 0 },
      factionQuest: null,
      pendingEvent: null,
      hands: 0,
      hero: {
        name: (window.__createDraft && window.__createDraft.name) || '旅人',
        gender: (window.__createDraft && window.__createDraft.gender) || 'x',
        origin: (window.__createDraft && window.__createDraft.origin) || 'farm',
        goal: (window.__createDraft && window.__createDraft.goal) || ''
      },
      worldMode: (window.__createDraft && window.__createDraft.worldMode) || 'history',
      chronicle: [],
      histFlags: {},
      diverged: [],
      seenChronicle: {},
      eraYear: 1,
      access: {},
      quests: {},
      explore: { ruins: 1, crypt: 1, marsh: 1, gorge: 1, stone_forest: 1, ruinsBest: 0, cryptBest: 0, marshBest: 0, gorgeBest: 0, stone_forestBest: 0, bosses: {} },
      attrs: { wu: 0, hu: 0, shen: 0, zhi: 0, bian: 0, yun: 0 },
      plotFlags: {},
      arcProg: {},
      storyFlow: { nodeId: null, seen: {}, started: false },
      dash: { filterNoise: false, x2: false, realm: 'home', col: 'world' },
      dashLog: []
    };
    if (window.QianStoryFlow) window.QianStoryFlow.ensure(st);
    if (window.QianStory) {
      window.QianStory.ensure(st);
      if (window.__createDraft && window.__createDraft.disguise && st.hero.gender === 'f') {
        st.hero.disguise = 'male';
      }
      if (window.__createDraft && window.__createDraft.disguiseM && st.hero.gender === 'm') {
        st.hero.disguise = 'female';
      }
    }
    if (window.QianWorld) {
      window.QianWorld.ensure(st);
      window.QianWorld.applyOrigin(st, st.hero.origin);
      st.name = st.hero.name;
      st.worldLine = st.worldMode === 'free'
        ? '高度自由世界：史實僅作背景，天下隨你與隨機推動。'
        : '史實軌道：秦王政元年，少年王即位，呂不韋輔政。';
    }
    if (window.QianFactions) window.QianFactions.ensure(st);
    if (window.QianPlots) {
      window.QianPlots.ensure(st);
      window.QianPlots.initAttrsFromCareer(st, careerId);
    }
    return st;
  }

  function rollOrder(day) {
    const o = ORDER_POOL[day % ORDER_POOL.length];
    return JSON.parse(JSON.stringify(o));
  }

  function migrateSave(o) {
    if (!o) return null;
    if (o.v === 1) {
      o.v = 2;
      o.fame = o.fame != null ? o.fame : Math.min(40, Math.floor((o.gold || 0) / 15) + Math.floor((o.soldGold || 0) / 30));
      o.people = o.people != null ? o.people : 10;
      o.factions = o.factions || { lu: 0, qin: 0, sai: 0 };
      o.joined = o.joined !== undefined ? o.joined : null;
      o.worldLine = o.worldLine || '舊檔續寫，天下局勢未明。';
      o.endings = o.endings || [];
      o.seenEvents = o.seenEvents || {};
      o.dayActs = o.dayActs || { farm: 0, sell: 0, gift: 0, heal: 0, fight: 0, trade: 0, order: 0 };
      o.factionQuest = o.factionQuest || null;
      o.pendingEvent = o.pendingEvent || null;
      o.flags = o.flags || {};
      if (o.hands == null) o.hands = 0;
    }
    if (o.v === 2 || o.v === 3 || o.v === 4 || o.v === 5 || o.v === 6 || o.v === 7) {
      if (o.hands == null) o.hands = 0;
      if (o.mineFloor == null) o.mineFloor = 1;
      if (o.frontFloor == null) o.frontFloor = 1;
      if (o.frontBest == null) o.frontBest = 0;
      if (o.fishSpot == null) o.fishSpot = 1;
      if (!o.skills) o.skills = {};
      if (o.skills.craft == null) o.skills.craft = 0;
      if (o.skills.agi == null) o.skills.agi = Math.min(4, Math.floor((o.skills.mart || 0) / 2));
      if (!o.bag) o.bag = {};
      if (o.bag.anesthetic == null) o.bag.anesthetic = 0;
      if (!o.npcs) o.npcs = {};
      const cast = (window.QianWorld && window.QianWorld.CAST) || [];
      cast.forEach(function (n) {
        if (!o.npcs[n.id]) o.npcs[n.id] = { aff: 0, mem: [], talked: 0, known: false, feel: { respect: 0, fear: 0, suspicion: 0, gratitude: 0 }, log: [] };
        if (o.npcs[n.id].known == null) o.npcs[n.id].known = false;
        if (!o.npcs[n.id].feel) o.npcs[n.id].feel = { respect: 0, fear: 0, suspicion: 0, gratitude: 0 };
        if (!o.npcs[n.id].log) o.npcs[n.id].log = [];
        if (!Array.isArray(o.npcs[n.id].mem)) o.npcs[n.id].mem = [];
        if (o.npcs[n.id].aff == null) o.npcs[n.id].aff = 0;
      });
      if (!CAREERS[o.career]) o.career = 'farmer';
      if (!o.hero) {
        o.hero = { name: o.name || '旅人', gender: 'x', origin: 'tradoc', goal: '' };
      }
      if (o.hero.disguise === undefined) o.hero.disguise = null;
      if (!o.worldMode) o.worldMode = 'history';
      if (!o.chronicle) o.chronicle = [];
      if (!o.histFlags) o.histFlags = {};
      if (!o.diverged) o.diverged = [];
      if (!o.arcProg) o.arcProg = {};
      if (!o.plotFlags) o.plotFlags = {};
      if (!o.seenChronicle) o.seenChronicle = {};
      if (!o.access) o.access = {};
      if (!o.quests) o.quests = {};
      if (!o.explore) o.explore = { ruins: 1, crypt: 1, marsh: 1, ruinsBest: 0, cryptBest: 0, marshBest: 0, bosses: {} };
      ['ruins','crypt','marsh','gorge','stone_forest'].forEach(function (k) {
        if (o.explore[k] == null) o.explore[k] = 1;
        if (o.explore[k + 'Best'] == null) o.explore[k + 'Best'] = 0;
      });
      if (!o.explore.bosses) o.explore.bosses = {};
      /* v15：為舊裝備補圖示／目錄屬性 */
      if (Array.isArray(o.gear) && window.QianEquip) {
        o.gear = o.gear.map(function (g) {
          if (!g) return g;
          var def = window.QianEquip.getDef(g.tableId) || window.QianEquip.getDef(g.name);
          if (def) {
            if (!g.tableId) g.tableId = def.id;
            if (!g.icon) g.icon = def.icon;
            if (g.wu == null) g.wu = def.wu || 0;
            if (g.hu == null) g.hu = def.hu || 0;
            if (g.shen == null) g.shen = def.shen || 0;
            if (g.zhi == null) g.zhi = def.zhi || 0;
            if (g.bian == null) g.bian = def.bian || 0;
            if (g.yun == null) g.yun = def.yun || 0;
            if (g.farmBonus == null) g.farmBonus = def.farmBonus || 0;
            if (!g.desc) g.desc = def.desc || '';
            if (g.name === '木劍') g.name = '桐木劍';
            if (g.name === '皮甲') g.name = '牛皮甲';
            if (g.name === '鐵鎧') g.name = '鐵札甲';
            if (g.name === '玉佩') g.name = '青玉佩';
          } else if (!g.icon) {
            g.icon = g.slot === 'armor' ? 'jia' : (g.slot === 'weapon' ? 'jian' : 'pei');
          }
          return g;
        });
      }
      if (o.period == null || (window.QianModes && window.QianModes.PERIODS.indexOf(o.period) < 0)) {
        o.period = (window.QianModes ? window.QianModes.PERIODS : ['晨','午','暮','夜'])[((o.day || 1) - 1) % 4];
      }
      if (!o.npcAI) o.npcAI = { loc: {}, state: {}, intent: {}, log: [], interrupted: {} };
      if (!o.npcAI.state) o.npcAI.state = {};
      if (!o.npcAI.intent) o.npcAI.intent = {};
      if (!o.storyFlow) o.storyFlow = { nodeId: null, seen: {}, started: false };
      if (!o.storyFlow.seen) o.storyFlow.seen = {};
      if (!o.dash) o.dash = { filterNoise: false, x2: false, realm: 'home', col: 'world' };
      o.v = 8;
      if (window.QianWorld) window.QianWorld.ensure(o);
      if (window.QianStory) window.QianStory.ensure(o);
      if (window.QianStoryFlow) window.QianStoryFlow.ensure(o);
      if (window.QianFactions) window.QianFactions.ensure(o);
      if (window.QianPlots) {
        window.QianPlots.ensure(o);
        if (!o.attrs || (o.attrs.wu == null && o.attrs.zhi == null)) {
          window.QianPlots.initAttrsFromCareer(o, o.career || 'farmer');
        }
      }
      return o;
    }
    if (o.v === 7 || o.v === 8 || o.v === 9) {
      if (!o.storyFlow) o.storyFlow = { nodeId: null, seen: {}, started: false };
      if (!o.storyFlow.seen) o.storyFlow.seen = {};
      if (!o.dash) o.dash = { filterNoise: false, x2: false, realm: 'home', col: 'world' };
      if (!o.plotFlags) o.plotFlags = {};
      if (!o.arcProg) o.arcProg = {};
      if (!o.readLog) o.readLog = [];
      if (!o.chronicle) o.chronicle = [];
      if (window.QianStoryFlow) window.QianStoryFlow.ensure(o);
      if (window.QianArcs && window.QianArcs.ensure) try { window.QianArcs.ensure(o); } catch (e) {}
      o.v = 9;
      return o;
    }
    return null;
  }
  function save() {
    if (!S) return;
    S.auto = autoOn;
    S.directive = directive;
    S.v = 9;
    if (window.QianStoryFlow) window.QianStoryFlow.ensure(S);
    if (window.QianFactions) window.QianFactions.ensure(S);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); toast('已存檔'); } catch (e) { toast('存檔失敗'); }
  }
  function load() {
    try {
      let o = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (!o) {
        let old = JSON.parse(localStorage.getItem(SAVE_KEY_OLD) || 'null');
        if (!old && typeof SAVE_KEY_OLDER !== 'undefined') {
          old = JSON.parse(localStorage.getItem(SAVE_KEY_OLDER) || 'null');
          if (!old && typeof SAVE_KEY_OLDEST !== 'undefined') old = JSON.parse(localStorage.getItem(SAVE_KEY_OLDEST) || 'null');
        }
        o = migrateSave(old);
        if (o) {
          try { localStorage.setItem(SAVE_KEY, JSON.stringify(o)); } catch (e) {}
        }
      } else {
        o = migrateSave(o);
      }
      if (!o) return false;
      S = o;
      autoOn = !!S.auto;
      directive = S.directive || 'grain';
      refreshNpcs();
      return true;
    } catch (e) { return false; }
  }
  function hasSave() {
    try {
      const o = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (o && (o.v === 1 || o.v === 2 || o.v === 3 || o.v === 4 || o.v === 5 || o.v === 6)) return true;
      const old = JSON.parse(localStorage.getItem(SAVE_KEY_OLD) || 'null');
      if (old && (old.v === 1 || old.v === 2 || old.v === 3)) return true;
      if (typeof SAVE_KEY_OLDER !== 'undefined') {
        const older = JSON.parse(localStorage.getItem(SAVE_KEY_OLDER) || 'null');
        return !!(older && older.v === 1);
      }
      return false;
    } catch (e) { return false; }
  }

  function gearBonus() {
    const b = { atk: 0, def: 0, hp: 0, wu: 0, hu: 0, shen: 0, zhi: 0, bian: 0, yun: 0, farmBonus: 0 };
    if (!S) return b;
    ['weapon', 'armor', 'accessory'].forEach((slot) => {
      const id = S.equipped[slot];
      if (!id) return;
      const g = S.gear.find((x) => x.id === id);
      if (!g) return;
      const r = RARITIES[g.rarity] || RARITIES.white;
      b.atk += Math.round((g.atk || 0) * r.mult);
      b.def += Math.round((g.def || 0) * r.mult);
      b.hp += Math.round((g.hp || 0) * r.mult);
      b.wu += (g.wu || 0);
      b.hu += (g.hu || 0);
      b.shen += (g.shen || 0);
      b.zhi += (g.zhi || 0);
      b.bian += (g.bian || 0);
      b.yun += (g.yun || 0);
      b.farmBonus += (g.farmBonus || 0);
    });
    return b;
  }
  function baseHeroAttrs() {
    if (!S) return { wu: 0, hu: 0, shen: 0, zhi: 0, bian: 0, yun: 0 };
    if (!S.attrs) S.attrs = { wu: 0, hu: 0, shen: 0, zhi: 0, bian: 0, yun: 0 };
    return S.attrs;
  }
  function heroAttrs() {
    const base = baseHeroAttrs();
    const b = gearBonus();
    return {
      wu: (base.wu || 0) + (b.wu || 0),
      hu: (base.hu || 0) + (b.hu || 0),
      shen: (base.shen || 0) + (b.shen || 0),
      zhi: (base.zhi || 0) + (b.zhi || 0),
      bian: (base.bian || 0) + (b.bian || 0),
      yun: (base.yun || 0) + (b.yun || 0),
      farmBonus: b.farmBonus || 0
    };
  }
  // expose for plots.js
  window.heroAttrsFull = function (state) {
    const prev = S; S = state || S;
    try { return heroAttrs(); } finally { S = prev; }
  };
  function stats() {
    const b = gearBonus();
    const a = heroAttrs();
    const maxHp = S.maxHp + b.hp + a.hu * 2 + Math.floor(a.yun / 2);
    const atk = S.baseAtk + b.atk + (S.skills.mart || 0) + a.wu + Math.floor(a.shen / 3);
    const def = S.baseDef + b.def + Math.floor(a.hu / 2) + Math.floor(a.zhi / 4);
    return {
      atk, def, maxHp,
      hp: Math.min(S.hp, maxHp),
      attrs: a
    };
  }

  function bagCount(k) { return (S.bag[k] || 0); }
  function addBag(k, n) { S.bag[k] = Math.max(0, (S.bag[k] || 0) + n); }

  function renderHUD() {
    if (!S) return;
    const st = stats();
    if (window.QianModes) window.QianModes.ensurePeriod(S);
    const season = SEASONS[seasonIdx()];
    const per = S.period || PERIODS[(S.day - 1) % 4] || '晨';
    // 頂欄精簡：印已有年號，日期只顯示「季 · 第N日 · 時」
    const dIn = ((S.day - 1) % 28) + 1;
    $('hud-day').textContent = season + ' · 第' + dIn + '日 · ' + per;
    if ($('hDaySeal')) {
      if (window.QianWorld) {
        const y = window.QianWorld.yearNum(S.day);
        $('hDaySeal').textContent = y <= 1 ? '政元' : ('政' + y);
      } else $('hDaySeal').textContent = season;
    }
    if ($('hPer')) $('hPer').textContent = per;
    $('hud-gold').textContent = String(S.gold);
    $('hud-food').textContent = String(S.food);
    $('hud-combat').textContent = st.hp + '/' + st.maxHp + ' ·' + st.atk;
    if ($('hud-attrs')) {
      const a = st.attrs || {};
      $('hud-attrs').textContent = '武' + (a.wu||0) + ' 護' + (a.hu||0) + ' 身' + (a.shen||0) + ' 智' + (a.zhi||0) + ' 辯' + (a.bian||0) + ' 運' + (a.yun||0);
    }
    $('hud-career').textContent = (CAREERS[S.career] || CAREERS.farmer).name;
    if ($('hud-title')) $('hud-title').textContent = careerTitle(S.career);
    if ($('hud-lv')) $('hud-lv').textContent = heroLevel() + '級';
    if ($('hud-power')) $('hud-power').textContent = String(combatPower());
    if ($('hud-avatar')) {
      const fk = careerFaceKey(S.career, S.hero && S.hero.gender);
      const src = faceUrl(fk);
      if ($('hud-avatar').getAttribute('src') !== src) $('hud-avatar').src = src;
    }
    if ($('auto-label')) {
      $('auto-label').textContent = autoOn ? 'AUTO 開' : 'AUTO 關';
      $('auto-label').className = autoOn ? 'auto-on' : 'auto-off';
    }
    document.querySelectorAll('.auto-btn').forEach((b) => b.classList.toggle('on', autoOn));
    if ($('q-auto')) $('q-auto').classList.toggle('on', autoOn);
    $('season-tint').dataset.season = String(seasonIdx());
    const q = S.quest;
    if ($('quest-dot')) $('quest-dot').hidden = !q || q.done;
    // meters
    const foodPct = Math.max(8, Math.min(100, (S.food / 40) * 100));
    const hpPct = Math.max(4, Math.min(100, (st.hp / Math.max(1, st.maxHp)) * 100));
    const atkPct = Math.max(8, Math.min(100, (st.atk / 30) * 100));
    if ($('m-food')) $('m-food').style.width = foodPct + '%';
    if ($('m-hp')) {
      $('m-hp').style.width = hpPct + '%';
      $('m-hp').style.height = hpPct + '%';
    }
    if ($('m-atk')) $('m-atk').style.width = atkPct + '%';
    const mtHp = $('m-hp') && $('m-hp').closest('.mt');
    if (mtHp) mtHp.classList.toggle('low', hpPct < 35);
    if ($('map-date')) $('map-date').textContent = dayStr();
    if ($('np-name') && !$('nameplate').classList.contains('npc')) {
      $('np-name').textContent = S.name || '你';
    }
    if (window.QianFactions) {
      window.QianFactions.ensure(S);
      window.QianFactions.recomputeFame(S);
      if ($('hud-fame')) $('hud-fame').textContent = String(Math.floor(S.fame));
      if ($('hud-people')) $('hud-people').textContent = String(Math.floor(S.people));
      if ($('m-fame')) $('m-fame').style.width = Math.max(4, Math.min(100, S.fame)) + '%';
      if ($('m-people')) $('m-people').style.width = Math.max(4, Math.min(100, S.people)) + '%';
      if ($('world-line')) $('world-line').textContent = S.worldLine || '';
      const F = window.QianFactions.FACTIONS;
      if ($('hud-faction')) {
        $('hud-faction').textContent = S.joined ? F[S.joined].short : '獨';
      }
    }
  
    try { updateDayGuide(); } catch (e) {}
    try { renderDash(); } catch (e) {}
  }

  function setSceneArt(m) {
    const art = SCENE_ART[m] || SCENE_ART.village;
    $('scene-webp').srcset = art.webp + ASSET_V;
    $('scene-img').src = (art.jpg || art.webp) + ASSET_V;
    $('scene-img').alt = art.alt;
    const caps = {
      farm: ['春光滿阡', '夏畦茂盛', '秋穫將至', '冬雪守田'],
      village: ['春光滿村', '夏日邨景', '秋色入村', '冬雪覆簷'],
      market: ['咸陽市井', '夏日商影', '秋成買賣', '冬市炭香'],
      clinic: ['藥廬青煙', '夏草芬芳', '秋採山藥', '冬爐煎劑'],
      drill: ['校場塵起', '夏日練兵', '秋風習武', '冬日對樁'],
      wild: ['邊崖晨霧', '夏嶺虫鳴', '秋崖葉紅', '冬嶺寂寂'],
      garden: ['園林春色', '夏蔭清幽', '秋桂滿庭', '冬梅疏影'],
      swim: ['水塘春暖', '夏日濯足', '秋水澄明', '冬塘薄冰'],
      moon: ['花朝夜宴', '夏夜賞月', '中秋團圓', '冬夜燈影'],
      mine: ['礦洞燈火', '夏礦潮熱', '秋礦風乾', '冬礦寒砭'],
      post: ['驛道晨發', '夏日馬塵', '秋驛落葉', '冬驛炭暖'],
      tavern: ['酒旗初揚', '夏夜喧聲', '秋釀新熟', '冬爐對酌'],
      academy: ['書聲朗朗', '夏窗風涼', '秋燈夜讀', '冬硯凝墨'],
      frontier: ['邊關晨號', '夏塞塵黃', '秋關葉赤', '冬塞雪硬'],
      xianyang: ['咸陽晨鐘', '夏陌車塵', '秋市燈火', '冬城閉戶'],
      palace: ['宮牆春柳', '夏殿影深', '秋禁門肅', '冬燎沉沉'],
      xiangbang: ['相府春宴', '夏門客聚', '秋貨滿庫', '冬燭論計'],
      taihou: ['宮外春寂', '夏簾影搖', '秋私門密', '冬炭香暖'],
      guowei: ['尉府傳符', '夏甲光白', '秋令如風', '冬鼓沉沉'],
      keguan: ['客館春雨', '夏夜清談', '秋使團至', '冬爐對酒'],
      guanshi: ['關市開閘', '夏貨如山', '秋稅清冊', '冬市早歇'],
      hejin: ['河津春漲', '夏渡船忙', '秋糧下水', '冬冰初合'],
      cimiao: ['祠前香火', '夏樹陰涼', '秋賽社鼓', '冬雪覆階'],
      ying: ['軍營曉角', '夏操滿場', '秋甲堆垛', '冬灶炊飯']
    };
    $('scene-caption').textContent = (caps[m] || caps.village)[seasonIdx()];
  }

  const MODE_BLURB = window.QianModes.MODE_BLURB;
  function showMode(m) {
    mode = m;
    document.querySelectorAll('.mode-tab').forEach((t) => t.classList.toggle('active', t.dataset.mode === m));
    document.querySelectorAll('#map-pins .pin').forEach((p) => p.classList.toggle('cur', p.dataset.mode === m));
    const isQinPanel = QIN_COURT_MODES.includes(m) || m === 'guanshi' || m === 'hejin' || m === 'ying';
    const isBeauty = typeof BEAUTY_MODES !== 'undefined' && BEAUTY_MODES.includes(m);
    ALL_MODES.forEach((id) => {
      const el = $(id + '-panel');
      if (!el) return;
      if (isQinPanel && (QIN_COURT_MODES.includes(id) || id === 'guanshi' || id === 'hejin' || id === 'ying')) {
        el.hidden = true;
      } else if (isBeauty && BEAUTY_MODES.includes(id)) {
        el.hidden = true;
      } else {
        el.hidden = id !== m;
      }
    });
    if ($('qin-shared-panel')) $('qin-shared-panel').hidden = !isQinPanel;
    if ($('beauty-shared-panel')) $('beauty-shared-panel').hidden = !isBeauty;
    const plot = $('plot-card');
    if (plot) plot.style.display = m === 'farm' ? '' : 'none';
    const sheetAct = $('sheet-act');
    if (sheetAct) sheetAct.dataset.mode = m;
    if ($('act-title')) $('act-title').textContent = MODE_LABELS[m] || '行事';
    const scene = $('adventure-scene');
    if (scene) {
      scene.classList.toggle('mode-farm', m === 'farm');
      scene.classList.toggle('mode-work', WORK_MODES.includes(m));
      scene.classList.toggle('in-battle', !!(battle && DUNGEON_MODES.includes(m)));
    }
    setSceneArt(m);
    if ($('place-chip-label')) $('place-chip-label').textContent = MODE_LABELS[m] || '';
    updateActScene(m);
    updatePortraitForMode(m);
    if ($('status-text') && MODE_BLURB[m]) $('status-text').textContent = MODE_BLURB[m];
    refreshNpcs();
    if (m === 'farm') drawFarm();
    if (m === 'village') renderVillage();
    if (m === 'market') { renderShop(); renderCraft(); }
    if (m === 'clinic') { renderClinicInv(); renderCraft(); }
    if (m === 'drill' || m === 'wild' || m === 'frontier' || m === 'mine' || m === 'ying' || m === 'ruins' || m === 'crypt' || m === 'marsh' || m === 'gorge' || m === 'stone_forest') renderCombatPanel();
    if (LEISURE_MODES.includes(m)) renderLeisure(m);
    if (m === 'post') renderPost();
    if (m === 'tavern') renderTavern();
    if (m === 'academy') renderAcademy();
    if (m === 'swim') renderFishSpots();
    if (m === 'garden') renderGardenAff();
    if (QIN_COURT_MODES.includes(m) || m === 'guanshi' || m === 'hejin' || m === 'ying') renderQinPanel(m);
    if (m === 'hut') renderHut();
    if (m === 'ruins' || m === 'crypt' || m === 'marsh' || m === 'gorge' || m === 'stone_forest') renderCombatPanel();
    if (BEAUTY_MODES.includes(m)) renderBeauty(m);
    if (m === 'drill' || m === 'wild' || m === 'frontier' || m === 'mine' || m === 'ruins' || m === 'crypt' || m === 'marsh') {
      const scene = $('adventure-scene');
      if (scene) scene.classList.toggle('in-battle', !!(battle && battle.where === m));
    }
    renderHUD();
    paintWorkers(true);
  }
  function updateActScene(m) {
    const art = SCENE_ART[m] || SCENE_ART.village;
    const img = $('act-scene-img');
    const cap = $('act-scene-cap');
    if (img) {
      img.src = (art.webp || art.jpg) + ASSET_V;
      img.alt = art.alt || (MODE_LABELS[m] || '');
    }
    if (cap) cap.textContent = SCENE_CAPS[m] || '場景人物走動';
  }
  function travelTo(m) {
    if (!S) return;
    if (battle) {
      // softlock escape: 陋室／過日類目的地可強制脫戰；否則提示地圖「結束戰鬥」
      const hud = $('battle-hud');
      const hudHidden = !hud || hud.hidden;
      if (m === 'hut' || hudHidden || S.hp <= 1) {
        autoOn = false; syncAutoUi();
        battleLockUntil = Date.now() + 2500;
        forceClearBattle();
        toast('已結束戰鬥');
      } else {
        toast('戰鬥中不可遠行 · 可先「結束戰鬥／逃回」');
        const bar = $('map-battle-bar');
        if (bar) bar.hidden = false;
        return;
      }
    }
    if (m === mode) { openActSheet(); return; }
    storyEnsure();
    if (window.QianModes) {
      const gate = window.QianModes.travelAllowed(S, m);
      if (!gate.ok) { toast(gate.msg || '尚未可往'); return; }
    }
    if (window.QianStory && window.QianStory.gateInfo(m) && !window.QianStory.hasAccess(S, m)) {
      openGateModal(m);
      return;
    }
    const cost = TRAVEL_COST[m] || 2;
    if (m !== 'hut' && S.hp <= cost) {
      toast('體力不足（需' + cost + '，現有' + S.hp + '）· 點地圖「陋室」免費歇息');
      if (m !== 'hut') highlightHutHint();
      return;
    }
    if (cost > 0) {
      S.hp = Math.max(1, S.hp - cost);
      toast('前往' + (MODE_LABELS[m] || '') + ' · 體力-' + cost);
    }
    finishTravel(m);
  }
  function finishTravel(m) {
    if (S.flags) S.flags['visited_' + m] = 1;
    showMode(m);
    closeSheets();
    openActSheet();
    
    // plot visit flags
    if (m === 'stargaze') { S.flags = S.flags || {}; S.flags.visited_stargaze = 1; S.plotFlags = S.plotFlags || {}; S.plotFlags.stargaze = 1; }
    if (m === 'iron_league') { S.flags = S.flags || {}; S.flags.visited_iron_league = 1; }
    if (m === 'rain_hut') { S.flags = S.flags || {}; S.flags.rain_hut = 1; }
    if (m === 'garden' || m === 'garden_water') { S.flags = S.flags || {}; /* visit only */ }
    if (m === 'xiangbang' || m === 'palace') { S.flags = S.flags || {}; }
    pushStory('前往' + (MODE_LABELS[m] || '') + '。', 'sys');
    if (window.QianStory) {
      const done = window.QianStory.checkStoryQuests(S);
      done.forEach((q) => toast('差事可領獎：' + q.title));
    }
    renderHUD();
    saveQuiet();
  }
  function highlightHutHint() {
    const note = $('map-note');
    if (note) note.textContent = '體力過低！點「陋室」免費歇息回體。';
  }
  function openGateModal(m) {
    const ST = window.QianStory;
    if (!ST) return;
    const g = ST.gateInfo(m);
    $('gate-title').textContent = (g.name || MODE_LABELS[m]) + ' · 門禁';
    $('gate-blurb').textContent = g.blurb + (disguiseOn() ? '（你正女扮男裝，門路略寬）' : (disguiseFemaleOn() ? '（你正男扮女裝，女眷之所略易近）' : ''));
    const sk = $('gate-skills');
    if (sk) {
      sk.innerHTML = '武' + (S.skills.mart||0) + ' · 輕功' + (S.skills.agi||0) +
        ' · 藥理' + (S.skills.med||0) + ' · 麻醉藥×' + (S.bag.anesthetic||0) +
        ' · 銀' + S.gold;
    }
    const box = $('gate-choices');
    const opts = ST.gateOptions(S, m);
    box.innerHTML = opts.map((o) =>
      '<button type="button" class="btn event-choice' + (o.ok ? '' : ' locked') + '" data-gate="' + m + '" data-method="' + o.id + '"' +
      (o.ok ? '' : ' title="' + o.reason + '"') + '>' + o.label +
      '<small>' + o.tip + (o.ok ? '' : ' · ' + o.reason) + '</small></button>'
    ).join('') + '<button type="button" class="btn ghost" data-gate-cancel="1">改去別處</button>';
    box.querySelectorAll('[data-method]').forEach((b) => {
      b.addEventListener('click', () => {
        tapFeel(b);
        if (b.classList.contains('locked')) { toast(b.title || '條件未足'); return; }
        const r = ST.tryOpenGate(S, b.dataset.gate, b.dataset.method);
        if (!r.ok) { toast(r.msg || '失敗'); return; }
        toast(r.msg || '已入');
        $('modal-gate').hidden = true;
        const cost = TRAVEL_COST[m] || 2;
        if (cost > 0) S.hp = Math.max(1, S.hp - cost);
        finishTravel(m);
      });
    });
    box.querySelectorAll('[data-gate-cancel]').forEach((b) => {
      b.addEventListener('click', () => { $('modal-gate').hidden = true; openMapSheet(); });
    });
    bindTapFeel(box);
    $('modal-gate').hidden = false;
    closeSheets();
  }
  function renderLeisure(m) {
    if (!S) return;
    const st = $('leisure-stat-' + m) || $('leisure-stat');
    if (st) {
      let line = '體力 ' + S.hp + '/' + S.maxHp + ' · 銀' + S.gold + ' · 民心' + (S.people || 0);
      if (m === 'moon') {
        line += S.gold >= 12 ? ' · 可辦宴' : ' · 銀不足（需12）';
      }
      st.textContent = line;
    }
    if (m === 'moon') renderMoonGuests();
    if (m === 'garden') renderGardenAff();
    if (m === 'swim') renderFishSpots();
  }
  function doLeisure(kind) {
    if (!S) return;
    if (kind === 'garden') {
      S.hp = Math.min(S.maxHp, S.hp + 8);
      if (window.QianFactions) window.QianFactions.bump(S, 'people', 1);
      S.flags = S.flags || {}; S.flags.garden_walk = 1;
      toast('園林閒步 · 體力回復');
      pushStory('你在園林信步，心神稍定。', 'nar');
    } else if (kind === 'garden_meet') {
      gardenMeet();
      return;
    } else if (kind === 'garden_flower') {
      if (bagCount('flower') < 1) { toast('沒有花卉可賞／獻'); return; }
      addBag('flower', -1);
      if (window.QianFactions) {
        window.QianFactions.bump(S, 'people', 1);
        window.QianFactions.bump(S, 'fame', 1);
        window.QianFactions.recomputeFame(S);
      } else {
        S.people = Math.min(100, (S.people || 0) + 1);
        S.fame = Math.min(100, (S.fame || 0) + 1);
      }
      toast('賞花獻鄰 · 民心名聲↑');
      pushStory('折花分贈路人，園中笑語。', 'nar');
    } else if (kind === 'swim') {
      S.hp = Math.min(S.maxHp, S.hp + 14);
      if (S.food > 0 && Math.random() < 0.3) { S.food -= 1; }
      S.flags = S.flags || {}; S.flags.swim_bath = 1;
      toast('水塘洗濯 · 體力大復');
      pushStory('清波濯足，暑氣盡去。', 'nar');
    } else if (kind === 'fish') {
      fishPond();
      return;
    } else if (kind === 'moon') {
      const cost = 12;
      if (S.gold < cost) {
        toast('銀兩不足辦宴（需' + cost + '，現有' + S.gold + '）');
        pushStory('囊中羞澀，夜宴只得作罷。先去坊市或田莊積銀罷。', 'sys');
        renderLeisure('moon');
        return;
      }
      S.gold -= cost;
      if (window.QianFactions) {
        window.QianFactions.bump(S, 'fame', 2);
        window.QianFactions.bump(S, 'people', 2);
        window.QianFactions.recomputeFame(S);
        window.QianFactions.noteAct(S, 'banquet');
      } else {
        S.fame = Math.min(100, (S.fame || 0) + 2);
        S.people = Math.min(100, (S.people || 0) + 2);
      }
      Object.keys(S.npcs || {}).forEach((id) => {
        if (Math.random() < 0.45) S.npcs[id].aff = Math.min(100, (S.npcs[id].aff || 0) + 1);
      });
      toast('夜宴辦成 · 名聲民心↑');
      pushStory('燈影月華，席間談笑。有人記起了你的名字。', 'nar');
      updatePortraitForMode('moon');
    }
    renderLeisure(mode);
    renderHUD();
    saveQuiet();
  }
  function gardenMeet() {
    if (!S) return;
    const n = NPCS[Math.floor(Math.random() * NPCS.length)];
    selectedNpc = n.id;
    const st = S.npcs[n.id] || (S.npcs[n.id] = { aff: 0, mem: [] });
    st.aff = Math.min(100, (st.aff || 0) + 2 + Math.floor(Math.random() * 3));
    st.mem = st.mem || [];
    st.mem.push('園林偶遇');
    if (st.mem.length > 8) st.mem = st.mem.slice(-8);
    if (window.QianFactions) window.QianFactions.bump(S, 'people', 1);
    showFacePortrait(npcFaceKey(n), n.name, true);
    toast('偶遇' + n.name + ' · 好感' + st.aff);
    pushStory('園中小徑，遇' + n.name + '，寒暄片刻。', 'nar');
    if (typeof markNpcKnown === 'function') markNpcKnown(n.id, '園林偶遇');
    if (window.QianStory) window.QianStory.logNpc(S, n.id, '園林偶遇');
    renderHUD();
    saveQuiet();
  }
  function fishPond() {
    if (!S) return;
    if (S.hp < 4) { toast('體力過低，先洗濯或休息'); return; }
    S.hp = Math.max(1, S.hp - 3);
    const spot = S.fishSpot|0;
    let roll = Math.random();
    // spot bias: 0 food, 1 gold, 2 herb
    if (spot === 0) roll -= 0.12;
    if (spot === 1) roll += 0.08;
    if (spot === 2) roll += 0.18;
    if (roll < 0.38) {
      const food = 1 + Math.floor(Math.random() * 2) + (spot === 0 ? 1 : 0);
      S.food += food;
      toast('釣得鮮魚 · 糧+' + food);
      pushStory('浮標輕顫，提竿得魚。', 'nar');
    } else if (roll < 0.58) {
      const g = 3 + Math.floor(Math.random() * 6) + (spot === 1 ? 3 : 0);
      S.gold += g;
      toast('釣得小物換銀 +' + g);
      pushStory('塘邊閒人買了你的漁獲。', 'nar');
    } else if (roll < 0.78) {
      addBag('herb', 1 + (spot === 2 ? 1 : 0));
      toast('岸邊拾得草藥');
      pushStory('釣興闌珊，卻在岸草中發現藥株。', 'nar');
    } else {
      toast('水面無波，空手而歸');
      pushStory('半晌無魚，你收了竿。', 'nar');
    }
    renderLeisure('swim');
    renderFishSpots();
    renderHUD();
    saveQuiet();
  }
  function forageWild() {
    if (!S) return;
    if (battle) { toast('戰鬥中'); return; }
    if (S.hp < 5) { toast('體力不足'); return; }
    S.hp -= 4;
    const got = [];
    if (Math.random() < 0.7) { const n = 1 + Math.floor(Math.random() * 2); addBag('herb', n); got.push('草藥×' + n); }
    if (Math.random() < 0.45) { const n = 1 + Math.floor(Math.random() * 2); addBag('ore', n); got.push('礦石×' + n); }
    if (Math.random() < 0.25) { addBag('flower', 1); got.push('山花×1'); }
    if (!got.length) toast('山徑空空，一無所獲');
    else toast('採集：' + got.join('、'));
    if (window.QianFactions) window.QianFactions.noteAct(S, 'forage');
    pushStory(got.length ? '你在山野採得' + got.join('、') + '。' : '崖岸風急，空手而回。', 'nar');
    renderCombatPanel();
    renderHUD();
    saveQuiet();
  }
  function hireHand() {
    if (!S) return;
    const cost = 40 + (S.hands || 0) * 15;
    if (S.gold < cost) { toast('僱工需銀' + cost); return; }
    if ((S.hands || 0) >= 6) { toast('長工已滿'); return; }
    S.gold -= cost;
    S.hands = (S.hands || 0) + 1;
    toast('僱得長工 · 共' + S.hands + '人');
    pushStory('坊市口說定一名長工，田莊人手更齊。', 'nar');
    if (window.QianFactions) window.QianFactions.noteAct(S, 'trade');
    updateHandsHint();
    paintWorkers(true);
    renderHUD();
    saveQuiet();
  }
  function buyFoodPack() {
    if (!S) return;
    if (S.gold < 10) { toast('銀不足'); return; }
    S.gold -= 10;
    S.food += 6;
    toast('買得糧包 · 糧+6');
    renderHUD();
    saveQuiet();
  }
  function clinicCharity() {
    if (!S) return;
    if (bagCount('potion') < 1) { toast('無回春散可施'); return; }
    addBag('potion', -1);
    if (window.QianFactions) {
      window.QianFactions.bump(S, 'people', 3);
      window.QianFactions.noteAct(S, 'heal');
      window.QianFactions.recomputeFame(S);
    } else {
      S.people = Math.min(100, (S.people || 0) + 3);
    }
    // 隨機鄉鄰好感
    const n = NPCS[Math.floor(Math.random() * NPCS.length)];
    if (S.npcs[n.id]) S.npcs[n.id].aff = Math.min(100, (S.npcs[n.id].aff || 0) + 2);
    toast('義診施藥 · 民心↑');
    pushStory('藥廬門前，你為鄉鄰施了一劑回春散。', 'nar');
    S.flags.charity = 1;
    markNpcKnown('yiguan', '義診');
    if (window.QianStory) window.QianStory.checkStoryQuests(S);
    renderCraft();
    renderHUD();
    saveQuiet();
  }
  /* 肖像規則：唔再喺每個場景疊巨大 char_hero。
     - 田莊／忙碌工作地：隱藏大立繪，只得工人
     - 對話／人脈選中：細頭像 face-mode
     - 夜宴／勢力來訪：細頭像（賓客／來使），從唔用紅披風全身
     - 其餘場景：隱藏立繪，淨係睇背景 + 場景工人 */
  function hideScenePortrait() {
    const char = $('vn-char');
    const img = $('portrait-img');
    const plate = $('nameplate');
    const np = $('np-name');
    if (char) {
      char.hidden = true;
      char.classList.remove('npc', 'face-mode', 'showing', 'tint-su', 'tint-zhao');
    }
    if (plate) plate.classList.remove('npc');
    if (np) np.textContent = (S && S.name) || '你';
    if (img) { img.removeAttribute('src'); img.alt = ''; }
  }
  function showFacePortrait(faceKey, name, isNpc) {
    const char = $('vn-char');
    const img = $('portrait-img');
    const plate = $('nameplate');
    const np = $('np-name');
    if (!char || !img) return;
    char.hidden = false;
    char.removeAttribute('hidden');
    char.classList.remove('tint-su', 'tint-zhao');
    char.classList.add('face-mode', 'showing');
    char.classList.toggle('npc', !!isNpc);
    img.src = faceUrl(faceKey);
    img.alt = name || '';
    if (plate) plate.classList.toggle('npc', !!isNpc);
    if (np) np.textContent = name || ((S && S.name) || '你');
  }
  function updatePortraitForMode(m) {
    const np = $('np-name');
    // 村落：選中鄉鄰時先顯示細頭像
    if (m === 'village' && selectedNpc) {
      const n = NPCS.find((x) => x.id === selectedNpc);
      if (n) {
        showFacePortrait(npcFaceKey(n), n.name, true);
        return;
      }
    }
    // 夜宴：顯示賓客細頭像（書生／商賈輪換），唔用英雄全身
    if (m === 'moon') {
      const guests = ['scholar', 'merchant', 'farmer_f', 'soldier'];
      const g = guests[(S && S.day ? S.day : 0) % guests.length];
      const names = { scholar: '席間賓客', merchant: '商賈來賓', farmer_f: '鄰里來客', soldier: '守望來客' };
      showFacePortrait(g, names[g] || '賓客', true);
      renderMoonGuests();
      return;
    }
    // 其餘所有場景（含田莊）：唔顯示中央大立繪
    hideScenePortrait();
    if (np) np.textContent = (S && S.name) || '你';
  }
  function renderMoonGuests() {
    const el = $('moon-guests');
    if (!el) return;
    const keys = ['scholar', 'merchant', 'farmer_f', 'soldier', 'doctor', 'farmer_m'];
    el.innerHTML = keys.map((k) =>
      '<img class="guest-face" src="' + faceUrl(k) + '" alt="" width="52" height="52" decoding="async">'
    ).join('');
  }
  function setTalkFace(n) {
    const el = $('talk-face');
    if (!el) return;
    if (!n) { el.hidden = true; return; }
    el.hidden = false;
    el.src = faceUrl(npcFaceKey(n));
    el.alt = n.name;
  }
  function setEventFace(factionId) {
    const el = $('event-face');
    if (!el) return;
    const key = FACTION_FACE[factionId] || 'scholar';
    el.hidden = false;
    el.src = faceUrl(key);
    el.alt = '來訪';
  }
  function faceThumbHtml(faceKey, name) {
    return '<img class="face-thumb" src="' + faceUrl(faceKey) + '" alt="' + (name || '') + '" width="52" height="52" decoding="async">';
  }
  function openSheet(id) {
    ['sheet-map', 'sheet-act'].forEach((x) => { if ($(x)) $(x).hidden = true; });
    if ($(id)) $(id).hidden = false;
  }
  function closeSheets() {
    ['sheet-map', 'sheet-act'].forEach((x) => { if ($(x)) $(x).hidden = true; });
  }
  function openActSheet() {
    if ($('act-title')) $('act-title').textContent = MODE_LABELS[mode] || '行事';
    updateActScene(mode);
    openSheet('sheet-act');
    if (mode === 'farm') requestAnimationFrame(drawFarm);
    paintWorkers(true);
  }
  function openMapSheet() {
    if ($('map-date')) $('map-date').textContent = dayStr();
    if (S && S.hp < Math.max(10, (S.maxHp || 80) * 0.3)) highlightHutHint();
    else if ($('map-note')) $('map-note').textContent = '秦王政元年輿圖。點「宮城外」可入宮（門禁：收買／輕功／麻醉／扮相，同舊秦風）。禁地需過關。陋室可回體／更衣。';
    const bar = $('map-battle-bar');
    if (bar) {
      bar.hidden = !battle;
      if (battle && $('map-note')) $('map-note').textContent = '戰鬥殘留中——請先結束戰鬥或逃回陋室，以免卡住。';
    }
    document.querySelectorAll('#map-pins .pin').forEach((p) => {
      p.classList.toggle('cur', p.dataset.mode === mode);
      let costEl = p.querySelector('.pcost');
      const cost = TRAVEL_COST[p.dataset.mode] || 0;
      if (!costEl) {
        costEl = document.createElement('span');
        costEl.className = 'pcost';
        p.appendChild(costEl);
      }
      costEl.textContent = cost ? ('體-' + cost) : '本處';
      // v25: original pin icons for common locales
      const PIN_ART = {
        farm: 'farm', hut: 'hut', village: 'village', market: 'market',
        clinic: 'clinic', drill: 'drill', wild: 'wild', garden: 'garden'
      };
      const art = PIN_ART[p.dataset.mode];
      if (art) {
        p.classList.add('pin-art');
        p.dataset.art = art;
      }
    });
    openSheet('sheet-map');
  }
  function renderPplModal() {
    if (!S) return;
    refreshNpcs();
    storyEnsure();
    const list = $('ppl-list');
    if (!list || !S) return;
    const cast = allNpcs().filter((n) => !n.unlockDay || (S.day || 1) >= n.unlockDay);
    const known = cast.filter((n) => npcKnown(n.id));
    const unknown = cast.filter((n) => !npcKnown(n.id)).slice(0, 8);
    let html = '<div class="face-grid">';
    html += known.map((n) => {
      const st = S.npcs[n.id] || { aff: 0 };
      return '<button type="button" class="face-cell' + (selectedNpc === n.id ? ' active' : '') + '" data-npc="' + n.id + '">' +
        faceThumbHtml(npcFaceKey(n), n.name) + '<span>' + n.name + '</span><span class="tiny muted">好感' + (st.aff||0) + '</span></button>';
    }).join('');
    html += unknown.map((n) =>
      '<button type="button" class="face-cell unknown" disabled title="劇情見過才能相識"><span class="face-q">？</span><span>？？？</span><span class="tiny muted">未識</span></button>'
    ).join('');
    html += '</div>';
    html += known.map((n) => {
      const st = S.npcs[n.id] || { aff: 0, feel: {} };
      const pct = Math.min(100, st.aff);
      const where = n.meet ? (' · 常見於' + (MODE_LABELS[n.meet] || n.meet)) : '';
      const feel = window.QianStory ? window.QianStory.feelLine(S, n.id) : '';
      return '<button type="button" class="villager-card' + (selectedNpc === n.id ? ' active' : '') + '" data-npc="' + n.id + '">' +
        '<div class="villager-row">' + faceThumbHtml(npcFaceKey(n), n.name) +
        '<div class="villager-meta"><b>' + n.name + '</b> <span class="muted">' + n.role + where + '</span>' +
        (n.bio ? '<div class="tiny muted">' + n.bio + '</div>' : '') +
        (feel ? '<div class="tiny muted">' + feel + '</div>' : '') +
        '<div class="aff-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="aff-num">好感 ' + st.aff + '</div></div></div></button>';
    }).join('');
    list.innerHTML = html || '<p class="muted">尚無人脈</p>';
    list.querySelectorAll('[data-npc]').forEach((b) => {
      b.addEventListener('click', () => {
        tapFeel(b);
        selectedNpc = b.dataset.npc;
        renderPplModal();
        updatePortraitForMode(mode);
      });
    });
  }
  function freeSend() {
    /* v42：有劇情自由欄時優先走自由行動；否則退回對談 */
    const storyIn = $('story-free-input');
    const logIn = $('free-input');
    const text = ((storyIn && storyIn.value) || (logIn && logIn.value) || '').trim();
    if (!text) { toast('請先輸入'); return; }
    if (storyIn && document.getElementById('story-panel') && !document.getElementById('story-panel').hidden) {
      storyIn.value = text;
      if (logIn) logIn.value = '';
      storyFreeSend();
      return;
    }
    const chip = $('mode-chip');
    if (chip) sayMode = chip.dataset.say || 'say';
    if (mode !== 'village') showMode('village');
    if ($('talk-input')) $('talk-input').value = text;
    if (logIn) logIn.value = '';
    if ($('modal-talk') && $('modal-talk').hidden) openTalk();
    sendTalk();
  }

  let freeActMode = 'say';
  function setFreeActMode(m) {
    freeActMode = m === 'do' ? 'do' : 'say';
    const say = $('free-mode-say');
    const dob = $('free-mode-do');
    if (say) say.classList.toggle('active', freeActMode === 'say');
    if (dob) dob.classList.toggle('active', freeActMode === 'do');
    const inp = $('story-free-input');
    if (inp) inp.placeholder = freeActMode === 'do' ? '想做什麼？（例：賂門衛／潛入／贈藥）…' : '想說什麼？（例：請安／試探／表態）…';
  }

  async function storyFreeSend() {
    if (!S || !window.QianFreeAct) { toast('自由行動未載入'); return; }
    const input = $('story-free-input');
    if (!input) return;
    const text = (input.value || '').trim();
    if (!text) { toast('請先輸入想說／想做'); return; }
    input.value = '';
    input.disabled = true;
    const sendBtn = $('story-free-send');
    if (sendBtn) sendBtn.disabled = true;
    const beatEl = $('story-ai-beat');
    if (beatEl) { beatEl.hidden = false; beatEl.textContent = freeActMode === 'do' ? '天下因你的行動微顫…' : '對方沉吟中…'; }
    pushStory('你' + (freeActMode === 'do' ? '（做）' : '（說）') + '：' + text, 'me');
    try {
      const r = await window.QianFreeAct.resolve(S, text, freeActMode);
      if (!r || !r.ok) {
        toast((r && r.toast) || '無法行動');
        if (beatEl) beatEl.textContent = '';
        return;
      }
      if (r.aiNote) toast(r.aiNote + (r.offline ? ' → 離線反應' : ''));
      if (r.narration) {
        if (beatEl) beatEl.textContent = r.narration;
        pushStory(r.narration, 'nar');
        status(r.narration);
      }
      if (r.reply) {
        const who = r.npcName || '對方';
        pushStory(who + '：' + r.reply, 'npc');
        const sp = $('story-speaker');
        if (sp) sp.textContent = who;
        const extra = document.createElement('div');
        extra.className = 'story-free-echo';
        extra.innerHTML = '<b>' + escapeHtml(who) + '</b>：' + escapeHtml(r.reply);
        if (beatEl && beatEl.parentNode) {
          let echo = $('story-free-echo');
          if (!echo) {
            echo = document.createElement('div');
            echo.id = 'story-free-echo';
            echo.className = 'story-free-echo';
            beatEl.parentNode.insertBefore(echo, beatEl.nextSibling);
          }
          echo.innerHTML = '<b>' + escapeHtml(who) + '</b>：' + escapeHtml(r.reply);
          echo.hidden = false;
        }
      }
      if (r.toast) toast(r.toast);
      if (r.advance === 'period' || r.advance === 'day') {
        try {
          if (r.advance === 'day') {
            let guard = 0; const day0 = S.day;
            while (guard++ < 6) { nextDay(); if (S.day !== day0) break; }
          } else nextDay();
        } catch (e) {}
      }
      pushDashLog('free', (r.narration || r.reply || text).slice(0, 80), { noise: false });
      renderStoryPanel();
      renderHUD();
      saveQuiet();
      /* 自由行動後若條件滿足，可叩命運弧 */
      if (S.plotFlags && (S.plotFlags.free_actions || 0) >= 2) {
        S.flags = S.flags || {};
        S.flags.poll_arc = 1;
        setTimeout(maybeTriggerVisit, 320);
      }
    } catch (e) {
      toast('自由行動失敗');
      if (beatEl) beatEl.textContent = '墨夢一滯，稍後再試。';
    } finally {
      input.disabled = false;
      if (sendBtn) sendBtn.disabled = false;
      try { input.focus(); } catch (e) {}
    }
  }

  /* ---- Farm canvas ---- */
  function drawFarm() {
    const c = canvas();
    if (!c || !S) return;
    const g = ctx();
    if (!g) return;
    const W = c.width, H = c.height;
    const tw = W / COLS, th = H / ROWS;
    g.clearRect(0, 0, W, H);
    S.plots.forEach((p, i) => {
      const x = (i % COLS) * tw, y = Math.floor(i / COLS) * th;
      if (!p.unlocked) {
        g.fillStyle = 'rgba(40,30,20,.55)';
        roundRect(g, x + 3, y + 3, tw - 6, th - 6, 6);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,.35)';
        g.font = '11px sans-serif';
        g.textAlign = 'center';
        g.fillText('鎖', x + tw / 2, y + th / 2 + 4);
        return;
      }
      // soil tile (compact control grid under scene)
      const pad = 1.5;
      const grd = g.createLinearGradient(x, y, x, y + th);
      grd.addColorStop(0, '#8d6e63');
      grd.addColorStop(0.55, '#6d4c41');
      grd.addColorStop(1, '#4e342e');
      g.fillStyle = grd;
      roundRect(g, x + pad, y + pad, tw - pad * 2, th - pad * 2, 5);
      g.fill();
      g.strokeStyle = 'rgba(201,163,90,.75)';
      g.lineWidth = 1;
      g.stroke();
      // stone rim hint
      g.strokeStyle = 'rgba(255,255,255,.12)';
      g.lineWidth = 1;
      roundRect(g, x + pad + 1, y + pad + 1, tw - pad * 2 - 2, th - pad * 2 - 2, 4);
      g.stroke();
      if (p.watered) {
        g.fillStyle = 'rgba(90,170,255,.30)';
        roundRect(g, x + pad, y + pad, tw - pad * 2, th - pad * 2, 5);
        g.fill();
      }
      if (p.crop) {
        const crop = CROPS[p.crop];
        const ripe = p.grow >= crop.grow;
        const prog = Math.min(1, p.grow / crop.grow);
        g.fillStyle = ripe ? crop.ripe : crop.color;
        const r = 3 + prog * 6;
        g.beginPath();
        g.arc(x + tw / 2, y + th / 2 + 1, r, 0, Math.PI * 2);
        g.fill();
        if (ripe) {
          g.fillStyle = 'rgba(255,236,150,.85)';
          g.beginPath();
          g.arc(x + tw / 2 + 5, y + th / 2 - 5, 2.5, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = ripe ? '#fffde7' : 'rgba(255,248,225,.92)';
        g.font = 'bold 9px sans-serif';
        g.textAlign = 'center';
        g.fillText(crop.name, x + tw / 2, y + 10);
      }
    });
    // 工人只喺主場景圖上走，唔再畫入田格
    updateHandsHint();
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function plotAt(mx, my) {
    const c = canvas();
    const rect = c.getBoundingClientRect();
    const x = (mx - rect.left) * (c.width / rect.width);
    const y = (my - rect.top) * (c.height / rect.height);
    const col = Math.floor(x / (c.width / COLS));
    const row = Math.floor(y / (c.height / ROWS));
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1;
    return row * COLS + col;
  }
  function tapPlot(i) {
    if (!S || i < 0) return;
    const p = S.plots[i];
    if (!p.unlocked) { toast('尚未開墾'); return; }
    if (!p.crop) {
      const crop = CROPS[selectedCrop];
      const cost = Math.max(1, crop.seedCost - Math.floor((S.skills.farm || 0) / 2));
      if (S.gold < cost) { toast('銀兩不足'); return; }
      S.gold -= cost;
      p.crop = selectedCrop;
      p.grow = 0;
      p.watered = false;
      status('播下' + crop.name);
    } else if (p.grow >= CROPS[p.crop].grow) {
      harvestOne(p);
    } else if (CROPS[p.crop].waterNeed && !p.watered) {
      p.watered = true;
      status('已澆水');
    } else {
      status(CROPS[p.crop].name + ' 成長 ' + p.grow + '/' + CROPS[p.crop].grow);
    }
    drawFarm();
    renderHUD();
  }
  function harvestOne(p) {
    S.flags = S.flags || {}; S.flags.harvested = 1;
    const crop = CROPS[p.crop];
    const farmGear = (stats().attrs && stats().attrs.farmBonus) || 0;
    const bonus = 1 + Math.floor((S.skills.farm || 0) / 3) + Math.floor(farmGear / 2);
    addBag(p.crop, bonus);
    if (crop.food) S.food += Math.floor(crop.food / 2);
    status('收成 ' + crop.name + ' ×' + bonus);
    p.crop = null; p.grow = 0; p.watered = false;
    if (window.QianFactions) window.QianFactions.noteAct(S, 'farm');
    checkQuest();
  }
  function waterAll() {
    S.plots.forEach((p) => {
      if (p.unlocked && p.crop && CROPS[p.crop].waterNeed) p.watered = true;
    });
    toast('全田已澆');
    drawFarm();
  }
  function harvestAll() {
    let n = 0;
    S.plots.forEach((p) => {
      if (p.unlocked && p.crop && p.grow >= CROPS[p.crop].grow) { harvestOne(p); n++; }
    });
    toast(n ? '收成 ' + n + ' 畦' : '無可收');
    drawFarm(); renderHUD();
  }
  function sellCrops() {
    const keep = (DIRS[directive] || DIRS.grain).sellFoodKeep;
    let gained = 0;
    ['flower', 'veg', 'wheat', 'rice'].forEach((k) => {
      let n = bagCount(k);
      if (k === 'rice' || k === 'wheat') {
        const can = Math.max(0, n - Math.ceil(keep / 4));
        n = can;
      }
      if (n <= 0) return;
      const price = CROPS[k].sell * (1 + (S.skills.trade || 0) * 0.08);
      const gold = Math.floor(n * price);
      addBag(k, -n);
      S.gold += gold;
      S.soldGold = (S.soldGold || 0) + gold;
      gained += gold;
    });
    toast(gained ? '賣得銀 ' + gained : '沒什麼可賣');
    if (gained && window.QianFactions) {
      window.QianFactions.noteAct(S, 'sell');
      window.QianFactions.recomputeFame(S);
    }
    checkQuest();
    renderHUD();
  }
  function expandPlot() {
    const locked = S.plots.findIndex((p) => !p.unlocked);
    if (locked < 0) { toast('田已盡開'); return; }
    const cost = 25 + S.plotCount * 8;
    if (S.gold < cost) { toast('需銀 ' + cost); return; }
    S.gold -= cost;
    S.plots[locked].unlocked = true;
    S.plotCount++;
    let hireMsg = '';
    if (window.QianWorkers && window.QianWorkers.maybeHire(S)) {
      hireMsg = ' · 多一名長工';
    }
    toast('開墾一畦（-' + cost + '銀）' + hireMsg);
    drawFarm(); renderHUD();
  }
  function growDay() {
    S.plots.forEach((p) => {
      if (!p.unlocked || !p.crop) return;
      const c = CROPS[p.crop];
      if (c.waterNeed && !p.watered) return;
      p.grow++;
      p.watered = false;
    });
  }

  function collectArcHints() {
    const hints = [];
    if (!S || !window.QianArcs) return hints;
    const cast = (window.QianWorld && window.QianWorld.CAST) || [];
    for (let i = 0; i < cast.length && hints.length < 3; i++) {
      const n = cast[i];
      if (!S.npcs || !S.npcs[n.id] || !S.npcs[n.id].known) continue;
      const hook = window.QianArcs.talkHook(S, n.id);
      if (!hook) continue;
      const loc = (window.QianNpcAI && window.QianNpcAI.preferredLoc)
        ? window.QianNpcAI.preferredLoc(n.id, S)
        : (n.meet || 'village');
      hints.push({
        name: n.name,
        label: (hook.label || '').replace(/^深談：|^續談：/, ''),
        mode: loc,
        id: n.id
      });
    }
    return hints;
  }
  function updateDayGuide() {
    if (!S) return;
    if (window.QianModes) window.QianModes.ensurePeriod(S);
    const el = $('day-guide');
    const statusEl = $('status-text');
    const arcHints = collectArcHints();
    let landmark = '';
    const tut = window.QianModes ? window.QianModes.tutorialTip(S) : null;
    if (tut && tut.suggest && tut.suggest[0]) {
      landmark = (MODE_LABELS[tut.suggest[0]] || tut.suggest[0]);
    } else if (arcHints[0] && arcHints[0].mode) {
      landmark = MODE_LABELS[arcHints[0].mode] || arcHints[0].mode;
    }
    let npcLine = '';
    if (window.QianNpcAI) {
      const sum = window.QianNpcAI.stateSummary(S);
      const parts = [];
      if (sum.work) parts.push('事' + sum.work);
      if (sum.travel) parts.push('行' + sum.travel);
      if (sum.react) parts.push('念' + sum.react);
      if (parts.length) npcLine = '眾人：' + parts.join('·');
    }
    const text = window.QianModes
      ? window.QianModes.dayGuide(S, { arcHints: arcHints, landmark: landmark, npcLine: npcLine })
      : dayStr();
    if (el) el.textContent = text;
    /* 新手時段把引導寫入 status，唔蓋過進行中對白 */
    if (statusEl && (S.day || 1) <= 3 && !S.pendingEvent) {
      statusEl.textContent = text;
    }
    const chip = $('place-chip-label');
    if (chip && S.period) {
      const base = MODE_LABELS[mode] || chip.textContent.replace(/·.*/, '');
      chip.textContent = base + ' · ' + S.period;
    }
  }

  function nextDay() {
    if (!S) return;
    if (battle) {
      autoOn = false; syncAutoUi();
      battleLockUntil = Date.now() + 2000;
      forceClearBattle();
      toast('已結束殘留戰鬥 · 過時段');
    }
    if (window.QianModes) window.QianModes.ensurePeriod(S);
    const beforePeriod = S.period;
    const adv = window.QianModes
      ? window.QianModes.advancePeriod(S)
      : { period: S.period, newDay: true };
    const newDay = !!adv.newDay;

    if (newDay) {
      growDay();
      if (window.QianFactions) {
        window.QianFactions.noteAct(S, 'farm');
        const line = window.QianFactions.worldTick(S);
        pushStory('天下大勢：' + line, 'sys');
      }
      if (window.QianWorld) {
        window.QianWorld.ensure(S);
        const chron = window.QianWorld.tick(S, window.QianFactions || null);
        if (chron) pushStory('〔天下動向〕' + chron, 'sys');
      }
      S.orderDone = false;
      S.order = rollOrder(S.day);
      S.food = Math.max(0, S.food - 1);
      if (S.food === 0 && S.gold >= 5) { S.gold -= 5; S.food += 3; toast('無糧，市買粗食 -5銀'); }
      const st = stats();
      S.hp = Math.min(st.maxHp, S.hp + 8);
    } else {
      /* 時段內輕回體 */
      const st = stats();
      S.hp = Math.min(st.maxHp, S.hp + (S.period === '夜' ? 4 : 2));
    }

    if (window.QianNpcAI) {
      const aiR = window.QianNpcAI.tick(S, { max: 12 });
      if (aiR && aiR.summary) pushStory('〔人物動向〕' + aiR.summary, 'sys');
      maybeNpcAIPolish(aiR && aiR.summary);
    }

    toast(dayStr() + (newDay ? ' · 新日' : ' · ' + beforePeriod + '→' + S.period));
    try {
      if (newDay) { juiceFlash(); juiceShake(0.25); }
      else juiceShake(0.12);
    } catch (e) {}

    refreshNpcs();
    checkQuest();
    updateDayGuide();
    try { drawFarm(); } catch (e) {}
    try { renderVillage(); } catch (e) {}
    renderHUD();
    saveQuiet();
    maybeTriggerVisit();
  }
  function maybeTriggerVisit() {
    if (!S || !window.QianFactions) return;
    if (S.pendingEvent) { openEventModal(S.pendingEvent); return; }
    if (window.QianArcs) {
      window.QianArcs.ensure(S);
      const aev = window.QianArcs.poll(S);
      if (aev) { S.pendingEvent = aev; openEventModal(aev); renderHUD(); saveQuiet(); return; }
    }
    if (window.QianPlots) {
      window.QianPlots.ensure(S);
      const pev = window.QianPlots.poll(S);
      if (pev) { S.pendingEvent = pev; openEventModal(pev); renderHUD(); saveQuiet(); return; }
    }
    if (battle) return;
    const ev = window.QianFactions.pickRecruitEvent(S);
    if (ev) {
      S.pendingEvent = ev;
      openEventModal(ev);
    }
  }
  function openEventModal(ev) {
    if (!ev) return;
    const title = $('event-title');
    const body = $('event-body');
    const choices = $('event-choices');
    if (!title || !body || !choices) {
      pushStory('【來訪】' + ev.title + '——' + ev.body.replace(/\n/g, ' '), 'sys');
      return;
    }
    let faceKey = ev.face || null;
    if (!faceKey && ev.faction) faceKey = FACTION_FACE[ev.faction] || 'scholar';
    else if (!faceKey && ev.id && ev.id.indexOf('recruit_') === 0) faceKey = FACTION_FACE[ev.id.replace('recruit_', '')] || 'scholar';
    else if (!faceKey) faceKey = 'scholar';
    if (ev.face) {
      const el = $('event-face');
      if (el) { el.hidden = false; el.src = faceUrl(ev.face); el.alt = ev.title || '來訪'; }
    } else if (ev.faction) {
      setEventFace(ev.faction);
    } else if (ev.id && ev.id.indexOf('recruit_') === 0) {
      setEventFace(ev.id.replace('recruit_', ''));
    } else {
      setEventFace('scholar');
    }
    // 主畫面亦用細頭像示來使，從不疊 char_hero
    showFacePortrait(faceKey, (ev.title || '來訪').slice(0, 8), true);
    title.textContent = ev.title;
    body.textContent = ev.body;
    choices.innerHTML = (ev.choices || []).map((c) =>
      '<button type="button" class="btn event-choice' + (c.locked ? ' locked' : '') + '" data-eid="' + ev.id + '" data-cid="' + c.id + '"' +
      (c.locked ? ' disabled aria-disabled="true"' : '') + '>' + c.label + '</button>'
    ).join('');
    choices.querySelectorAll('[data-cid]').forEach((b) => {
      b.addEventListener('click', (evClick) => {
        tapFeel(b, evClick);
        if (b.disabled) { toast('屬性不足'); return; }
        resolveEventChoice(ev, b.dataset.cid);
      });
    });
    bindTapFeel(choices);
    $('modal-event').hidden = false;
    pushStory('【來訪】' + ev.title, 'sys');
  }
  function resolveEventChoice(ev, choiceId) {
    let r = null;
    const isArc = !!(ev && ev.arc && window.QianArcs);
    const isPlot = !!(ev && (ev.plot || (ev.id && /^(lu_hunt|laoai_chaos|zhengguo_debate|lisi_law|border_raid|star_omen|iron_trial|chengjiao_plot|marsh_plague)$/.test(ev.id))));
    if (isArc) r = window.QianArcs.applyChoice(S, ev, choiceId);
    else if (isPlot && window.QianPlots) r = window.QianPlots.applyChoice(S, ev, choiceId);
    else if (window.QianFactions) r = window.QianFactions.applyChoice(S, ev, choiceId);
    else return;
    if (r && (r.toast === '屬性不足，無法如此' || r.toast === '條件未足' || r.toast === '民心不足')) {
      toast(r.toast);
      if (r.line) pushStory(r.line, 'sys');
      try { juiceShake(0.15); } catch (e) {}
      return;
    }
    /* 弧線多節點：不關 modal，直接開下一節 */
    if (r && r.continueEvent) {
      if (r.line) { status(r.line); pushStory(r.line, 'nar'); }
      openEventModal(r.continueEvent);
      bindTapFeel($('event-choices'));
      try { juiceDmgFloat('……', {}); } catch (e) {}
      renderHUD();
      saveQuiet();
      return;
    }
    $('modal-event').hidden = true;
    if (r.line) { status(r.line); pushStory(r.line, 'nar'); }
    if (r.toast) toast(r.toast);
    try { juiceShake(0.2); } catch (e) {}
    if (r && r.arcDone) {
      try { juiceFlash(); juiceShake(0.55); juiceHitStop(80); juiceDmgFloat(r.toast || '命運', { crit: true }); } catch (e) {}
      if (window.QianArcs) window.QianArcs.checkArcEndings(S);
      if (window.QianFactions) window.QianFactions.checkEndings(S);
    }
    // 加入勢力後微調 AUTO 方針
    if (S.joined === 'lu') {
      directive = 'money';
      document.querySelectorAll('.dir').forEach((d) => d.classList.toggle('active', d.dataset.dir === 'money'));
    } else if (S.joined === 'qin') {
      directive = 'expand';
      document.querySelectorAll('.dir').forEach((d) => d.classList.toggle('active', d.dataset.dir === 'expand'));
    } else if (S.joined === 'sai') {
      directive = 'winter';
      document.querySelectorAll('.dir').forEach((d) => d.classList.toggle('active', d.dataset.dir === 'winter'));
    }
    renderHUD();
    renderVillage();
    saveQuiet();
  }
  function openWorldModal() {
    if (!S) return;
    if (window.QianFactions) {
      window.QianFactions.ensure(S);
      window.QianFactions.recomputeFame(S);
    }
    if (window.QianWorld) window.QianWorld.ensure(S);
    const box = $('world-body');
    if (!box) return;
    let html = '';
    if (window.QianWorld) html += window.QianWorld.worldModalHtml(S, escapeHtml);
    if (window.QianNpcAI) {
      window.QianNpcAI.ensure(S);
      html += '<div class="quest-item"><strong>人物自主</strong>' + window.QianNpcAI.logHtml(S, escapeHtml) + '</div>';
    }
    if (window.QianFactions) {
      const F = window.QianFactions.FACTIONS;
      const joined = S.joined ? F[S.joined].full : '無（獨立耕織）';
      html +=
        '<div class="quest-item"><strong>財富名聲</strong><div class="aff-bar"><i style="width:' + S.fame + '%"></i></div><p>' + S.fame + '／100 · 銀' + S.gold + '</p></div>' +
        '<div class="quest-item"><strong>民心</strong><div class="aff-bar"><i style="width:' + S.people + '%"></i></div><p>' + S.people + '／100</p></div>' +
        '<div class="quest-item"><strong>歸屬</strong><p>' + escapeHtml(joined) + '</p></div>' +
        Object.keys(F).map((k) => {
          const f = F[k];
          const v = Math.floor(S.factions[k] || 0);
          return '<div class="quest-item"><strong>' + f.name + '</strong> <span class="muted">' + f.full + '</span>' +
            '<div class="aff-bar"><i style="width:' + v + '%;background:' + f.color + '"></i></div>' +
            '<p>影響力 ' + v + ' · ' + escapeHtml(f.desc) + '</p></div>';
        }).join('');
    }
    box.innerHTML = html;
    $('modal-world').hidden = false;
  }
  function openEndingsModal() {
    if (!S || !window.QianFactions) return;
    window.QianFactions.checkEndings(S);
    const list = window.QianFactions.endingList(S);
    const box = $('endings-body');
    if (!box) return;
    if (window.QianArcs) window.QianArcs.checkArcEndings(S);
    box.innerHTML = list.map((e) =>
      '<div class="quest-item' + (e.unlocked ? ' done' : '') + '">' +
      '<strong>' + (e.unlocked ? '✓ ' : '？ ') + e.name + '</strong>' +
      '<span class="muted"> · ' + (e.tier === 'late' ? '遠途' : (e.tier === 'arc' ? '人物命運' : '中途')) + '</span>' +
      '<p>' + (e.unlocked ? escapeHtml(e.when) : '條件未顯……') + '</p></div>'
    ).join('');
    $('modal-endings').hidden = false;
  }
  function saveQuiet() {
    if (!S) return;
    S.auto = autoOn; S.directive = directive; S.v = 9;
    if (window.QianFactions) window.QianFactions.ensure(S);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
  }

  /* ---- AUTO farm ---- */
  function autoFarmStep() {
    if (!S || mode !== 'farm') return;
    const dir = DIRS[directive] || DIRS.grain;
    // harvest
    S.plots.forEach((p) => {
      if (p.unlocked && p.crop && p.grow >= CROPS[p.crop].grow) harvestOne(p);
    });
    // water
    S.plots.forEach((p) => {
      if (p.unlocked && p.crop && CROPS[p.crop].waterNeed && !p.watered) p.watered = true;
    });
    // plant
    const prefer = dir.prefer;
    S.plots.forEach((p) => {
      if (!p.unlocked || p.crop) return;
      for (let i = 0; i < prefer.length; i++) {
        const k = prefer[i];
        const cost = Math.max(1, CROPS[k].seedCost - Math.floor((S.skills.farm || 0) / 2));
        if (S.gold >= cost) {
          S.gold -= cost;
          p.crop = k; p.grow = 0; p.watered = false;
          break;
        }
      }
    });
    // expand
    if (Math.random() < dir.expandBias * 0.15) {
      const locked = S.plots.findIndex((p) => !p.unlocked);
      const cost = 25 + S.plotCount * 8;
      if (locked >= 0 && S.gold >= cost + 20) expandPlot();
    }
    // sell overflow
    if (Math.random() < 0.25) sellCrops();
    drawFarm();
    renderHUD();
  }

  /* ---- Village / NPC / Orders ---- */
  function renderVillage() {
    if (!S) return;
    refreshNpcs();
    const board = $('order-board');
    if (S.orderDone) {
      board.innerHTML = '<strong>今日日令</strong><p>已交付，明日再來。</p>';
    } else {
      const need = Object.keys(S.order.need).map((k) => itemName(k) + '×' + S.order.need[k] + '（有' + bagCount(k) + '）').join('、');
      board.innerHTML = '<strong>' + S.order.title + '</strong><p>需：' + need + '</p><p>酬：銀' + S.order.rewardGold + (S.order.rewardFood ? ' · 糧' + S.order.rewardFood : '') + '</p>';
    }
    const list = $('npc-list');
    storyEnsure();
    const cast = allNpcs().filter((n) => !n.meet || n.meet === 'village' || !n.meet);
    const local = allNpcs().filter((n) => {
      if (n.unlockDay && (S.day||1) < n.unlockDay) return false;
      return !n.meet || n.meet === 'village' || ['he','su','zhao','lin','wu','cheng','sefu'].includes(n.id);
    });
    list.innerHTML = '<div class="face-grid">' + local.map((n) => {
      if (!npcKnown(n.id)) return '<button type="button" class="face-cell unknown" disabled><span class="face-q">？</span><span>？？？</span></button>';
      const st = S.npcs[n.id] || { aff: 0 };
      return '<button type="button" class="face-cell' + (n.id===selectedNpc?' active':'') + '" data-npc="' + n.id + '">' +
        faceThumbHtml(npcFaceKey(n), n.name) + '<span>' + n.name + '</span><span class="tiny">好感' + (st.aff||0) + '</span></button>';
    }).join('') + '</div>';
    list.querySelectorAll('[data-npc]').forEach((b) => {
      b.addEventListener('click', () => { tapFeel(b); selectedNpc = b.dataset.npc; renderVillage(); updatePortraitForMode('village'); });
    });
  }
  function itemName(k) {
    if (CROPS[k]) return CROPS[k].name;
    if (k === 'herb') return '草藥';
    if (k === 'ore') return '礦石';
    if (k === 'potion') return '回春散';
    if (k === 'cloth') return '粗布';
    if (k === 'anesthetic') return '麻醉藥';
    return k;
  }
  function submitOrder() {
    if (S.orderDone) { toast('今日已交'); return; }
    for (const k of Object.keys(S.order.need)) {
      if (bagCount(k) < S.order.need[k]) { toast('材料不足'); return; }
    }
    Object.keys(S.order.need).forEach((k) => addBag(k, -S.order.need[k]));
    let gold = S.order.rewardGold;
    if (S.npcs.zhao && S.npcs.zhao.aff >= 25) gold = Math.floor(gold * 1.15);
    S.gold += gold;
    S.food += S.order.rewardFood || 0;
    S.soldGold = (S.soldGold || 0) + gold;
    S.orderDone = true;
    toast('日令完成 +' + gold + '銀');
    if (window.QianFactions) {
      window.QianFactions.noteAct(S, 'order');
      window.QianFactions.bump(S, 'people', 2);
      window.QianFactions.recomputeFame(S);
    }
    checkQuest();
    renderVillage();
    renderHUD();
  }
  function giftNpc() {
    const n = NPCS.find((x) => x.id === selectedNpc);
    const st = S.npcs[selectedNpc];
    let given = null;
    for (const like of n.likes) {
      if (bagCount(like) > 0) { given = like; break; }
    }
    if (!given) {
      // any flower/rice
      for (const k of ['flower', 'rice', 'herb', 'veg']) {
        if (bagCount(k) > 0) { given = k; break; }
      }
    }
    if (!given) { toast('沒有可送之物'); return; }
    addBag(given, -1);
    const boost = n.likes.includes(given) ? n.giftBoost : 4;
    const lit = S.skills.lit || 0;
    st.aff = Math.min(100, st.aff + boost + Math.floor(lit / 2));
    st.mem.push('曾受贈' + itemName(given));
    if (st.mem.length > 8) st.mem = st.mem.slice(-8);
    toast('贈' + n.name + itemName(given) + ' · 好感' + st.aff);
    logNpcAct(n.id, '受贈' + itemName(given), { gratitude: 3, respect: 1, suspicion: -1 });
    markNpcKnown(n.id, '餽贈');
    if (window.QianFactions) {
      window.QianFactions.noteAct(S, 'gift');
      window.QianFactions.bump(S, 'people', 1);
    }
    checkQuest();
    renderVillage();
    renderHUD();
  }

  /* ---- Talk ---- */
  function openTalk() {
    refreshNpcs();
    storyEnsure();
    let n = NPCS.find((x) => x.id === selectedNpc) || allNpcs().find((x) => x.id === selectedNpc);
    if (!n) { toast('無可談之人'); return; }
    if (!npcKnown(n.id)) {
      toast('尚未相識——須在劇情中見過');
      return;
    }
    markNpcKnown(n.id, '對談');
    $('talk-npc-name').textContent = n.name + ' · ' + n.role;
    setTalkFace(n);
    showFacePortrait(npcFaceKey(n), n.name, true);
    pushStory('與' + n.name + '相對而坐……', 'sys');
    const log = $('talk-log');
    log.innerHTML = '<div class="talk-line sys">與' + n.name + '相對而坐……</div>';
    const st = S.npcs[selectedNpc] || { aff: 0, mem: [], feel: {} };
    if (window.QianStory) {
      log.innerHTML += '<div class="talk-line sys">情感：好感' + (st.aff||0) + ' · ' + window.QianStory.feelLine(S, n.id) + '</div>';
      const fm = window.QianStory.fullMem(S, n.id);
      if (fm) log.innerHTML += '<div class="talk-line sys">往來：' + escapeHtml(fm) + '</div>';
    } else if (st.mem && st.mem.length) {
      log.innerHTML += '<div class="talk-line sys">記憶：' + st.mem.slice(-3).join('；') + '</div>';
    }
    renderTalkPresent(n);
    renderTalkChoices(n);
    $('modal-talk').hidden = false;
  }
  function renderTalkPresent(cur) {
    const row = $('talk-present');
    if (!row) return;
    const here = allNpcs().filter((x) => {
      if (!npcKnown(x.id)) return false;
      if (!x.meet) return mode === 'village' || mode === 'farm' || mode === 'hut';
      return x.meet === mode;
    }).slice(0, 12);
    if (!here.length) { row.innerHTML = ''; return; }
    row.innerHTML = here.map((x) =>
      '<button type="button" class="present-chip' + (x.id === cur.id ? ' active' : '') + '" data-switch-npc="' + x.id + '">' +
      faceThumbHtml(npcFaceKey(x), x.name) + '<span>' + x.name + '</span></button>'
    ).join('');
    row.querySelectorAll('[data-switch-npc]').forEach((b) => {
      b.addEventListener('click', () => {
        tapFeel(b);
        selectedNpc = b.dataset.switchNpc;
        openTalk();
      });
    });
  }
  function renderTalkChoices(n) {
    const ST = window.QianStory;
    const choices = ST ? ST.talkChoices(S, n, mode) : [
      { id: 'greet', label: '近日可好？', text: '近日可好？' },
      { id: 'bye', label: '告辭', text: '告辭' }
    ];
    if (window.QianArcs) {
      const hook = window.QianArcs.talkHook(S, n.id);
      if (hook) {
        choices.splice(Math.max(0, choices.length - 1), 0, {
          id: hook.id, label: '📜 ' + hook.label, text: hook.label, arcId: hook.arcId
        });
      }
    }
    const box = $('quick-replies');
    box.innerHTML = choices.map((c) =>
      '<button type="button" class="choice-tap' + (c.locked ? ' locked' : '') + '" data-qid="' + c.id + '" data-q="' + escapeHtml(c.text) + '"' +
      (c.arcId ? ' data-arc="' + c.arcId + '"' : '') +
      (c.locked ? ' title="' + escapeHtml(c.reason || '未解鎖') + '"' : '') + '>' + escapeHtml(c.label) + '</button>'
    ).join('');
    box.querySelectorAll('[data-qid]').forEach((b) => {
      b.addEventListener('click', () => {
        tapFeel(b);
        if (b.classList.contains('locked')) { toast(b.title || '尚未解鎖'); return; }
        const id = b.dataset.qid;
        if (id === 'bye') { $('modal-talk').hidden = true; if (window.QianNpcAI && selectedNpc) window.QianNpcAI.resume(S, selectedNpc); return; }
        if (id === 'gift') { giftNpc(); openTalk(); return; }
        if (id === 'duel') {
          logNpcAct(n.id, '約戰', { respect: 1, fear: 1 });
          $('modal-talk').hidden = true;
          startBattle(mode === 'ying' ? 'drill' : (EXPLORE_MODES.includes(mode) ? mode : 'drill'));
          return;
        }
        if (id.indexOf('arc_') === 0 && window.QianArcs) {
          const arcId = b.dataset.arc || id.replace(/^arc_(start|continue)_/, '');
          const ev = window.QianArcs.beginFromTalk(S, arcId);
          if (ev) {
            $('modal-talk').hidden = true;
            openEventModal(ev);
            toast('深談開啟');
            try { juiceFlash(); } catch (e) {}
            saveQuiet();
            return;
          }
          toast('此刻難開此談');
          return;
        }
        $('talk-input').value = b.dataset.q;
        sendTalk();
      });
    });
    bindTapFeel(box);
  }
  function appendTalk(who, text, cls) {
    const log = $('talk-log');
    const div = document.createElement('div');
    div.className = 'talk-line ' + (cls || '');
    div.innerHTML = '<span class="who">' + who + '：</span> ' + escapeHtml(text);
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    const kind = cls === 'sys' ? 'sys' : (who === '你' || cls === 'you' || cls === 'me' ? 'me' : 'npc');
    if (cls !== 'sys' || text !== '沉吟中') pushStory(who + '：' + text, kind);
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function offlineReply(npc, text, modeCmd) {
    const st = S.npcs[npc.id];
    const pool = npc.lines;
    let line = pool[Math.floor(Math.random() * pool.length)];
    if (modeCmd) {
      if (/送|贈|禮/.test(text)) line = '若有心物，拿來便是；我心領了。';
      else if (/教|學|問/.test(text)) line = '且聽我一言：' + pool[0];
      else line = '既然吩咐，我記下了。——' + pool[Math.floor(Math.random() * pool.length)];
      st.aff = Math.min(100, st.aff + 2);
    } else {
      if (/好|安|久/.test(text)) { line = '托福安好。' + line; st.aff = Math.min(100, st.aff + 1); }
      else if (/告辭|再見/.test(text)) line = '去罷，有事再來。';
      else line = line + '（好感 ' + st.aff + '）';
    }
    st.talked++;
    st.mem.push((modeCmd ? '指令：' : '談：') + text.slice(0, 20));
    if (st.mem.length > 8) st.mem = st.mem.slice(-8);
    return line;
  }
  async function sendTalk() {
    const input = $('talk-input');
    const text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    const npc = NPCS.find((x) => x.id === selectedNpc);
    appendTalk('你', text, 'you');
    const AI = window.QianAI;
    if (AI && AI.ready()) {
      appendTalk('…', '沉吟中', 'sys');
      try {
        const st = S.npcs[selectedNpc];
        let discNote = '';
        if (disguiseOn() && (st.feel && st.feel.suspicion >= 18 || st.aff >= 40 && Math.random() < 0.12)) {
          discNote = '（對方似乎在打量你的裝束……）';
          if (window.QianStory) window.QianStory.bumpFeel(S, npc.id, 'suspicion', 3);
        }
        const r = await AI.npcReply({
          npcName: npc.name, npcRole: npc.role, aff: st.aff,
          mem: (window.QianStory ? window.QianStory.fullMem(S, npc.id) : st.mem.slice(-6).join('；')),
          feel: window.QianStory ? window.QianStory.feelLine(S, npc.id) : '',
          disguise: disguiseOn() ? '女扮男裝中' : (disguiseFemaleOn() ? '男扮女裝中' : (S.hero && S.hero.gender === 'f' ? '女裝' : (S.hero && S.hero.gender === 'm' ? '男子' : '不顯'))),
          mode: sayMode === 'cmd' ? 'cmd' : 'say',
          text: text + discNote, career: CAREERS[S.career].name, dayStr: dayStr(),
          bio: npc.bio || '',
          heroCtx: window.QianWorld ? window.QianWorld.heroContext(S) : '',
          worldMode: S.worldMode === 'free' ? '高度自由' : '史實軌道',
          factionStance: window.QianFactions ? window.QianFactions.stanceText(S) : '',
          fateSummary: window.QianArcs ? window.QianArcs.fateSummary(S) : ''
        });
        // remove sys
        const log = $('talk-log');
        if (log.lastChild && log.lastChild.classList.contains('sys')) log.removeChild(log.lastChild);
        appendTalk(npc.name, r.text);
        st.aff = Math.min(100, st.aff + (sayMode === 'cmd' ? 2 : 1));
        logNpcAct(npc.id, (sayMode === 'cmd' ? '指令：' : '談：') + text.slice(0, 24), { respect: sayMode === 'cmd' ? 1 : 0, gratitude: 0 });
        st.talked++;
        markNpcKnown(npc.id, '對談');
      } catch (e) {
        const log = $('talk-log');
        if (log.lastChild && log.lastChild.classList.contains('sys')) log.removeChild(log.lastChild);
        appendTalk('系統', 'AI 失敗：' + AI.errMsg(e) + '，改用離線對白', 'sys');
        appendTalk(npc.name, offlineReply(npc, text, sayMode === 'cmd'));
      }
    } else {
      appendTalk(npc.name, offlineReply(npc, text, sayMode === 'cmd'));
    }
    checkQuest();
    renderVillage();
    renderHUD();
  }

  /* ---- Craft ---- */
  function craftMissing(r) {
    const miss = [];
    Object.keys(r.needs).forEach((k) => {
      const have = bagCount(k);
      const need = r.needs[k];
      if (have < need) miss.push(itemName(k) + '×' + (need - have));
    });
    return miss;
  }
  function renderCraft() {
    const listId = mode === 'clinic' ? 'clinic-list' : 'craft-list';
    const list = $(listId);
    if (!list) return;
    const show = mode === 'clinic' ? RECIPES.filter((r) => r.scene === 'clinic') : RECIPES.filter((r) => r.scene === 'market');
    list.innerHTML = show.map((r) => {
      const need = Object.keys(r.needs).map((k) => itemName(k) + ' ' + bagCount(k) + '/' + r.needs[k]).join(' ');
      const short = craftMissing(r).length > 0 || (r.id === 'anesthetic' && (S.skills.med || 0) < 1);
      return '<button type="button" class="craft-item' + (short ? ' short' : '') + '" data-craft="' + r.id + '"><strong>' + r.name + '</strong><span>' + r.desc + '</span><span class="need">' + need + (short ? ' · 點按看缺料' : ' · 點按煉成') + '</span></button>';
    }).join('');
    list.querySelectorAll('[data-craft]').forEach((b) => {
      b.addEventListener('click', (ev) => { tapFeel(b, ev); doCraft(b.dataset.craft); });
    });
  }
  function doCraft(id) {
    const r = RECIPES.find((x) => x.id === id);
    if (!r) return;
    if (id === 'anesthetic' && (S.skills.med || 0) < 1) { toast('藥理尚淺，難成麻醉藥'); return; }
    const miss = craftMissing(r);
    if (miss.length) {
      toast('缺：' + miss.join('、') + (mode === 'clinic' ? '（可採花／市井買花礦）' : ''));
      return;
    }
    Object.keys(r.needs).forEach((k) => addBag(k, -r.needs[k]));
    if (r.out) Object.keys(r.out).forEach((k) => {
      if (k === 'food') S.food += r.out[k];
      else if (r.out[k]) addBag(k, r.out[k]);
    });
    if (r.gold) {
      let ggain = r.gold + (S.career === 'craftsman' ? 5 : 0) + (S.skills.craft || 0) * 2;
      S.gold += ggain;
      S.soldGold = (S.soldGold || 0) + ggain;
      toast('製成 ' + r.name + ' · +' + ggain + '銀');
    }
    if (r.heal) {
      const st = stats();
      S.hp = Math.min(st.maxHp, S.hp + r.heal);
    }
    if (S.career === 'healer' && id === 'potion') addBag('potion', 1);
    if (S.career === 'craftsman' && id === 'pickaxe') S.skills.craft = Math.min(8, (S.skills.craft || 0) + 1);
    if (id === 'potion' && S.flags) S.flags.saiPotion = (S.flags.saiPotion || 0) + 1 + (S.career === 'healer' ? 1 : 0);
    if (id === 'anesthetic') {
      S.flags.crafted_anesthetic = 1;
      if (window.QianStory) window.QianStory.checkStoryQuests(S).forEach((q) => toast('差事完成：' + q.title));
    }
    if (window.QianFactions) {
      window.QianFactions.noteAct(S, id === 'potion' ? 'heal' : 'trade');
      const fq = window.QianFactions.checkFactionQuest(S);
      if (fq) toast('勢力差事完成：' + fq.title);
    }
    if (id === 'spiritIncense' && window.QianFactions) window.QianFactions.bump(S, 'fame', 2);
    if ((id === 'blade' || id === 'scroll') && Math.random() < 0.45) {
      if (id === 'blade') S.skills.craft = Math.min(8, (S.skills.craft || 0) + 1);
      if (id === 'scroll') S.skills.lit = Math.min(8, (S.skills.lit || 0) + 1);
    }
    if (!r.gold && !r.heal) toast('製成 ' + r.name);
    checkQuest();
    renderCraft();
    if (mode === 'clinic') renderClinicInv();
    if (mode === 'market') renderShop();
    if (typeof BEAUTY_MODES !== 'undefined' && BEAUTY_MODES.includes(mode)) renderBeauty(mode);
    renderHUD();
  }
  function gatherHerb() {
    const n = 1 + Math.floor(Math.random() * 2) + (S.skills.med > 1 ? 1 : 0);
    addBag('herb', n);
    let msg = '採得草藥 ×' + n;
    if (Math.random() < 0.28) { addBag('flower', 1); msg += ' · 山花×1'; }
    toast(msg);
    renderCraft();
    renderClinicInv();
    renderHUD();
  }
  function gatherFlower() {
    const n = 1 + (Math.random() < 0.35 ? 1 : 0) + (S.skills.med > 2 ? 1 : 0);
    addBag('flower', n);
    toast('採得花卉 ×' + n);
    renderCraft();
    renderClinicInv();
    renderHUD();
  }
  function usePotion() {
    if (bagCount('potion') <= 0) { toast('無回春散'); return; }
    addBag('potion', -1);
    const st = stats();
    S.hp = Math.min(st.maxHp, S.hp + 35);
    toast('服藥 · HP ' + S.hp);
    if (window.QianFactions) window.QianFactions.noteAct(S, 'heal');
    renderHUD();
  }


  /* ---- Shop / clinic / leisure panels ---- */
  function renderShop() {
    if (!S) return;
    const grid = $('shop-grid');
    const st = $('market-stat');
    if (st) st.textContent = '銀' + S.gold + ' · 僱工' + (S.hands || 0);
    if (!grid) return;
    const hireCost = 40 + (S.hands || 0) * 15;
    const items = [
      { id: 'seed', name: '種子包', desc: '稻2·菜1·麥1', gold: 15 },
      { id: 'food', name: '糧包', desc: '存糧+6', gold: 10 },
      { id: 'herb', name: '草藥束', desc: '草藥×2', gold: 12 },
      { id: 'flower', name: '山花束', desc: '花卉×2', gold: 10 },
      { id: 'ore', name: '礦石袋', desc: '礦石×2', gold: 18 },
      { id: 'potion', name: '回春散', desc: '藥劑×1', gold: 28 },
      { id: 'hire', name: '僱長工', desc: '人手+1', gold: hireCost }
    ];
    grid.innerHTML = items.map((it) =>
      '<button type="button" class="shop-item" data-shop="' + it.id + '"' + (S.gold < it.gold ? ' disabled' : '') + '>' +
      '<b>' + it.name + '</b>' + it.desc + '<br><span class="price">' + it.gold + '銀</span></button>'
    ).join('');
    grid.querySelectorAll('[data-shop]').forEach((b) => {
      b.addEventListener('click', () => buyShop(b.dataset.shop));
    });
  }
  function buyShop(id) {
    if (!S) return;
    if (id === 'seed') {
      if (S.gold < 15) { toast('銀不足'); return; }
      S.gold -= 15; addBag('rice', 2); addBag('veg', 1); addBag('wheat', 1);
      toast('買得種子包');
    } else if (id === 'food') { buyFoodPack(); renderShop(); return; }
    else if (id === 'herb') {
      if (S.gold < 12) { toast('銀不足'); return; }
      S.gold -= 12; addBag('herb', 2); toast('買得草藥×2');
    } else if (id === 'flower') {
      if (S.gold < 10) { toast('銀不足'); return; }
      S.gold -= 10; addBag('flower', 2); toast('買得花卉×2');
    } else if (id === 'ore') {
      if (S.gold < 18) { toast('銀不足'); return; }
      S.gold -= 18; addBag('ore', 2); toast('買得礦石×2');
    } else if (id === 'potion') {
      if (S.gold < 28) { toast('銀不足'); return; }
      S.gold -= 28; addBag('potion', 1); toast('買得回春散');
    } else if (id === 'hire') { hireHand(); renderShop(); return; }
    if (window.QianFactions) window.QianFactions.noteAct(S, 'trade');
    renderShop(); renderCraft(); renderHUD(); saveQuiet();
  }
  function renderClinicInv() {
    if (!S) return;
    const el = $('clinic-inv');
    if (el) el.textContent = '草藥' + bagCount('herb') + ' · 散' + bagCount('potion') + ' · 花' + bagCount('flower');
    const chips = $('herb-chips');
    if (chips) {
      chips.innerHTML = [
        ['草藥', bagCount('herb')],
        ['花卉', bagCount('flower')],
        ['回春散', bagCount('potion')],
        ['麻醉藥', bagCount('anesthetic')],
        ['礦石', bagCount('ore')]
      ].map((x) => '<span class="chip">' + x[0] + ' ×' + x[1] + '</span>').join('');
    }
  }
  function renderFishSpots() {
    if (!S) return;
    const box = $('fish-spots');
    if (!box) return;
    const spots = [
      { id: 0, name: '淺灘', tip: '易釣糧' },
      { id: 1, name: '深潭', tip: '易得銀' },
      { id: 2, name: '蘆岸', tip: '偶得藥' }
    ];
    box.innerHTML = spots.map((s) =>
      '<button type="button" class="fish-spot' + ((S.fishSpot|0) === s.id ? ' active' : '') + '" data-spot="' + s.id + '">' +
      s.name + '<br><span class="tiny">' + s.tip + '</span></button>'
    ).join('');
    box.querySelectorAll('[data-spot]').forEach((b) => {
      b.addEventListener('click', () => {
        S.fishSpot = +b.dataset.spot;
        renderFishSpots();
        toast('選釣點：' + spots[S.fishSpot].name);
      });
    });
  }
  function renderGardenAff() {
    if (!S) return;
    const box = $('garden-aff');
    if (!box) return;
    const top = NPCS.slice().sort((a, b) => (S.npcs[b.id]?.aff||0) - (S.npcs[a.id]?.aff||0)).slice(0, 4);
    box.innerHTML = top.map((n) => {
      const aff = (S.npcs[n.id] && S.npcs[n.id].aff) || 0;
      return '<div class="aff-mini">' + faceThumbHtml(npcFaceKey(n), n.name) +
        '<span>' + n.name + '</span><div class="aff-bar"><i style="width:' + Math.min(100, aff) + '%"></i></div>' +
        '<b>' + aff + '</b></div>';
    }).join('');
  }
  function renderPost() {
    if (!S) return;
    const st = $('post-stat');
    if (st) st.textContent = '體力 ' + S.hp + '/' + S.maxHp + ' · 名' + Math.floor(S.fame||0);
    const rum = $('post-rumors');
    if (!rum) return;
    const lines = [
      '西北邊塞有胡騎蹤跡。',
      '坊市糧價微漲，可多囤稻麥。',
      '藥廬蘇娘缺新鮮草藥。',
      '呂黨門客近日或來訪田莊。',
      '礦坑下層據說埋有舊甲。'
    ];
    const line = lines[(S.day + (S.flags.postRumor|0)) % lines.length];
    rum.innerHTML = '<strong>驛卒傳言</strong><p>' + line + '</p>';
  }
  function postRest() {
    if (!S) return;
    S.hp = Math.min(S.maxHp, S.hp + 12);
    toast('歇腳 · 體力回復');
    pushStory('你在驛站廊下打了個盹。', 'nar');
    renderPost(); renderHUD(); saveQuiet();
  }
  function postRumor() {
    if (!S) return;
    if (S.hp < 3) { toast('太累，聽不進'); return; }
    S.hp -= 2;
    S.flags.postRumor = (S.flags.postRumor || 0) + 1;
    if (window.QianFactions) window.QianFactions.bump(S, 'fame', 1);
    toast('打聽得新消息');
    pushStory('驛亭茶攤，你聽來一則江湖消息。', 'nar');
    renderPost(); renderHUD(); S.flags.post_rumor = 1; markNpcKnown('tingzhang', '驛站'); if (window.QianStory) window.QianStory.checkStoryQuests(S); saveQuiet();
  }
  function postCourier() {
    if (!S) return;
    if (S.gold < 8) { toast('託書需8銀'); return; }
    S.gold -= 8;
    if (window.QianFactions) {
      window.QianFactions.bump(S, 'fame', 2);
      window.QianFactions.recomputeFame(S);
    }
    Object.keys(S.npcs||{}).forEach((id) => {
      if (Math.random() < 0.3) S.npcs[id].aff = Math.min(100, (S.npcs[id].aff||0) + 1);
    });
    toast('託書遠寄 · 名聲↑');
    pushStory('一紙書信隨驛馬遠去，有人將記起你的名字。', 'nar');
    renderPost(); renderHUD(); saveQuiet();
  }
  function renderTavern() {
    if (!S) return;
    const st = $('tavern-stat');
    if (st) st.textContent = '銀' + S.gold + ' · 民' + Math.floor(S.people||0);
    const board = $('tavern-board');
    if (!board) return;
    board.innerHTML = '<strong>今日酒旗</strong><p>沽酒可增民心；聽談或得線索；小賭看運氣（慎）。</p>';
  }
  function tavernDrink() {
    if (!S) return;
    if (S.gold < 6) { toast('沽酒需6銀'); return; }
    S.gold -= 6;
    S.hp = Math.min(S.maxHp, S.hp + 6);
    if (window.QianFactions) window.QianFactions.bump(S, 'people', 2);
    toast('沽酒暢飲 · 民心↑');
    pushStory('酒肆燈暖，你與鄰座碰了一杯。', 'nar');
    renderTavern(); renderHUD(); saveQuiet();
  }
  function tavernListen() {
    if (!S) return;
    const lines = [
      '有人說山野深處有蒼獠出沒。',
      '商賈趙三郎今日壓低花價。',
      '邊塞要壯丁，賞銀不薄。',
      '書塾先生開講《商君書》殘卷。'
    ];
    const line = lines[Math.floor(Math.random() * lines.length)];
    if (window.QianFactions) window.QianFactions.bump(S, 'fame', 1);
    toast('聽得：' + line.slice(0, 14) + '…');
    pushStory('酒肆耳語：' + line, 'nar');
    renderTavern(); renderHUD(); saveQuiet();
  }
  function tavernGamble() {
    if (!S) return;
    if (S.gold < 5) { toast('至少需5銀'); return; }
    S.gold -= 5;
    if (Math.random() < 0.42) {
      const win = 8 + Math.floor(Math.random() * 10);
      S.gold += win;
      toast('小賭得勝 +' + win + '銀');
      pushStory('骰子落地，你竟贏了一小注。', 'nar');
    } else {
      toast('小賭失利 -5銀');
      pushStory('骰點不濟，銀兩少了五枚。', 'nar');
    }
    renderTavern(); renderHUD(); saveQuiet();
  }
  function renderAcademy() {
    if (!S) return;
    const lit = S.skills.lit || 0;
    const st = $('academy-stat');
    if (st) st.textContent = '文才' + lit + ' · 名' + Math.floor(S.fame||0);
    const chips = $('academy-skills');
    if (chips) {
      const sk = S.skills;
      chips.innerHTML = [
        ['農', sk.farm], ['醫', sk.med], ['商', sk.trade], ['武', sk.mart], ['輕功', sk.agi||0], ['文', sk.lit], ['工', sk.craft||0]
      ].map((x) => '<span class="chip">' + x[0] + ' ' + x[1] + '</span>').join('');
    }
  }
  function academyStudy() {
    if (!S) return;
    if (S.hp < 4) { toast('體力不足'); return; }
    S.hp -= 3;
    if (Math.random() < 0.55 + (S.career === 'scholar' ? 0.2 : 0)) {
      S.skills.lit = Math.min(8, (S.skills.lit || 0) + 1);
      toast('讀有所得 · 文才' + S.skills.lit);
    } else toast('讀卷半日，尚無進境');
    if (window.QianFactions) window.QianFactions.bump(S, 'fame', 1);
    pushStory('書塾窗下，你翻開一冊舊卷。', 'nar');
    renderAcademy(); renderHUD(); saveQuiet();
  }
  function academyDebate() {
    if (!S) return;
    if (S.hp < 5) { toast('體力不足'); return; }
    S.hp -= 4;
    const ok = Math.random() < 0.4 + (S.skills.lit || 0) * 0.08;
    if (ok) {
      if (window.QianFactions) {
        window.QianFactions.bump(S, 'fame', 2);
        window.QianFactions.bump(S, 'people', 1);
      }
      toast('論辯佔上風 · 名聲↑');
    } else toast('論辯落了下風，再讀再來');
    pushStory('堂上問難，你與同窗往復數合。', 'nar');
    renderAcademy(); renderHUD(); saveQuiet();
  }
  function academyTeach() {
    if (!S) return;
    if ((S.skills.lit || 0) < 1) { toast('文才尚淺，難以為師'); return; }
    if (S.hp < 4) { toast('體力不足'); return; }
    S.hp -= 3;
    const n = NPCS[Math.floor(Math.random() * NPCS.length)];
    if (S.npcs[n.id]) S.npcs[n.id].aff = Math.min(100, (S.npcs[n.id].aff || 0) + 3);
    if (window.QianFactions) window.QianFactions.bump(S, 'people', 2);
    toast('授' + n.name + '一二 · 好感↑');
    pushStory('你為' + n.name + '講解數句，對方拱手稱謝。', 'nar');
    checkQuest();
    renderAcademy(); renderHUD(); saveQuiet();
  }
  function mineDig() {
    if (!S) return;
    if (battle) { toast('戰鬥中'); return; }
    if (S.hp < 5) { toast('體力不足'); return; }
    const floor = S.mineFloor || 1;
    S.hp -= 4 + Math.floor(floor / 2);
    const craft = S.skills.craft || 0;
    const hunter = S.career === 'hunter' || S.career === 'craftsman' ? 1 : 0;
    let ore = 1 + Math.floor(Math.random() * 2) + (craft > 1 ? 1 : 0) + hunter;
    if (Math.random() < 0.15 + floor * 0.03) ore += 1;
    addBag('ore', ore);
    const got = ['礦石×' + ore];
    if (Math.random() < 0.2) { addBag('herb', 1); got.push('洞菇×1'); }
    if (Math.random() < 0.12 + floor * 0.02) {
      S.gold += 3 + floor;
      got.push('碎銀+' + (3 + floor));
    }
    toast('開掘：' + got.join('、'));
    pushStory('礦燈搖曳，你刨得' + got.join('、') + '。', 'nar');
    if (window.QianFactions) window.QianFactions.noteAct(S, 'forage');
    // chance ambush
    if (Math.random() < 0.12 + floor * 0.03) {
      toast('礦道異響……');
      setTimeout(() => startBattle('mine'), 400);
    }
    renderCombatPanel(); renderHUD(); checkQuest(); saveQuiet();
  }
  function mineDeeper() {
    if (!S || battle) { toast(battle ? '戰鬥中' : ''); return; }
    S.mineFloor = (S.mineFloor || 1) + 1;
    toast('下至礦層 ' + S.mineFloor);
    renderCombatPanel(); saveQuiet();
  }
  function dungeonDeeper(where) {
    if (!S || battle) { toast(battle ? '戰鬥中' : ''); return; }
    if (!S.explore) S.explore = {};
    S.explore[where] = (S.explore[where] || 1) + 1;
    toast('深入' + (MODE_LABELS[where] || '') + ' 層' + S.explore[where]);
    renderCombatPanel(); saveQuiet();
  }
  function frontScout() {
    if (!S) return;
    if (battle) { toast('戰鬥中'); return; }
    if (S.hp < 6) { toast('體力不足'); return; }
    S.hp -= 5;
    const floor = S.frontFloor || 1;
    if (Math.random() < 0.5) {
      const g = 5 + floor * 3;
      S.gold += g;
      toast('斥候繳獲 +' + g + '銀');
    } else if (Math.random() < 0.5) {
      addBag('ore', 1); addBag('herb', 1);
      toast('斥候拾得物資');
    } else {
      toast('斥候無功而返');
    }
    if (window.QianFactions) window.QianFactions.bump(S, 'fame', 1);
    renderCombatPanel(); renderHUD(); saveQuiet();
  }

  /* ---- Combat ---- */
  function powerLine() {
    const st = stats();
    const a = st.attrs || {};
    return '戰力 ATK' + st.atk + ' DEF' + st.def + ' HP' + st.hp + ' ·武' + (a.wu||0) + '智' + (a.zhi||0);
  }
  function previewEnemyHtml(where) {
    const floor = battleFloor(where);
    const pool = enemyPool(where);
    const idx = Math.min(pool.length - 1, floor - 1);
    const e = pool[idx];
    const scale = (where === 'drill') ? 1 : 1 + (floor - 1) * 0.18;
    const boss = BOSSES[where];
    if (battle && battle.where === where) {
      return '<strong>交戰中</strong> · ' + battle.enemy.name + ' HP ' + battle.enemy.hp + '/' + battle.enemy.maxHp +
        '<br>波次 ' + battle.wave + '/' + battle.maxWave + (battle.isBoss ? ' · Boss' : '');
    }
    return '<strong>可能遭遇</strong> · ' + e.name +
      '<br>約 HP' + Math.floor(e.hp * scale) + ' · ATK' + Math.floor(e.atk * scale) +
      ' · 層/場 ' + floor +
      (boss ? '<br><strong>Boss</strong> · ' + boss.name + ' HP' + boss.hp : '');
  }
  function renderCombatPanel() {
    if (!S) return;
    if ($('drill-stat')) $('drill-stat').textContent = battle && battle.where === 'drill' ? '對練中' : '校場練兵';
    if ($('drill-gear')) $('drill-gear').textContent = '裝備 ' + S.gear.length;
    if ($('drill-power')) $('drill-power').textContent = powerLine();
    if ($('drill-enemy')) $('drill-enemy').innerHTML = previewEnemyHtml('drill');
    if ($('wild-floor')) $('wild-floor').textContent = '山層 ' + (S.wildFloor || 1);
    if ($('wild-best')) $('wild-best').textContent = '最深 ' + (S.wildBest || 0);
    if ($('wild-gear')) $('wild-gear').textContent = '裝備 ' + S.gear.length;
    if ($('wild-power')) $('wild-power').textContent = powerLine();
    if ($('wild-enemy')) $('wild-enemy').innerHTML = previewEnemyHtml('wild');
    if ($('forage-loot')) {
      $('forage-loot').innerHTML = [
        ['草藥', bagCount('herb')], ['礦石', bagCount('ore')], ['花', bagCount('flower')]
      ].map((x) => '<span class="chip">' + x[0] + '×' + x[1] + '</span>').join('');
    }
    if ($('mine-depth')) $('mine-depth').textContent = '礦層 ' + (S.mineFloor || 1);
    if ($('mine-ore')) $('mine-ore').textContent = '礦石 ' + bagCount('ore');
    if ($('mine-fatigue')) $('mine-fatigue').textContent = '體力 ' + S.hp + '/' + S.maxHp;
    if ($('mine-loot')) {
      $('mine-loot').innerHTML = '<span class="chip">開掘耗體 · 層愈深產愈豐 · 偶遇礦妖</span>';
    }
    if ($('front-floor')) $('front-floor').textContent = '邊層 ' + (S.frontFloor || 1);
    if ($('front-best')) $('front-best').textContent = '最深 ' + (S.frontBest || 0);
    if ($('front-gear')) $('front-gear').textContent = '裝備 ' + S.gear.length;
    if ($('front-power')) $('front-power').textContent = powerLine();
    if ($('front-enemy')) $('front-enemy').innerHTML = previewEnemyHtml('frontier');
    if (S.explore) {
      ['ruins','crypt','marsh','gorge','stone_forest'].forEach((k) => {
        if ($(k + '-floor')) $(k + '-floor').textContent = ({ruins:'廢墟層 ',crypt:'墓層 ',marsh:'澤層 ',gorge:'谷層 ',stone_forest:'石林層 '}[k]) + (S.explore[k] || 1);
        if ($(k + '-best')) $(k + '-best').textContent = '最深 ' + (S.explore[k + 'Best'] || 0);
        if ($(k + '-gear')) $(k + '-gear').textContent = '裝備 ' + S.gear.length;
        if ($(k + '-power')) $(k + '-power').textContent = powerLine();
        if ($(k + '-enemy')) $(k + '-enemy').innerHTML = previewEnemyHtml(k);
      });
    }
    const inB = !!battle;
    if ($('btn-flee-drill')) $('btn-flee-drill').hidden = !(inB && battle.where === 'drill');
    if ($('btn-flee-wild')) $('btn-flee-wild').hidden = !(inB && battle.where === 'wild');
    if ($('btn-flee-front')) $('btn-flee-front').hidden = !(inB && battle.where === 'frontier');
    if ($('btn-flee-ruins')) $('btn-flee-ruins').hidden = !(inB && battle.where === 'ruins');
    if ($('btn-flee-crypt')) $('btn-flee-crypt').hidden = !(inB && battle.where === 'crypt');
    if ($('btn-flee-marsh')) $('btn-flee-marsh').hidden = !(inB && battle.where === 'marsh');
    if ($('btn-flee-mine')) $('btn-flee-mine').hidden = !(inB && battle.where === 'mine');
    if ($('btn-flee-gorge')) $('btn-flee-gorge').hidden = !(inB && battle.where === 'gorge');
    if ($('btn-flee-stone')) $('btn-flee-stone').hidden = !(inB && battle.where === 'stone_forest');
    if ($('battle-hud')) $('battle-hud').hidden = !inB;
    const bar = $('map-battle-bar');
    if (bar && !$('sheet-map').hidden) bar.hidden = !inB;
  }

  function enemyPool(where) {
    if (where === 'wild') return ENEMIES_WILD;
    if (where === 'mine') return ENEMIES_MINE;
    if (where === 'frontier') return ENEMIES_FRONT;
    if (where === 'ruins') return ENEMIES_RUINS;
    if (where === 'crypt') return ENEMIES_CRYPT;
    if (where === 'marsh') return ENEMIES_MARSH;
    if (where === 'gorge') return ENEMIES_GORGE;
    if (where === 'stone_forest') return ENEMIES_STONE;
    return ENEMIES_DRILL;
  }
  function battleFloor(where) {
    if (where === 'wild') return S.wildFloor || 1;
    if (where === 'mine') return S.mineFloor || 1;
    if (where === 'frontier') return S.frontFloor || 1;
    if (where === 'ruins') return (S.explore && S.explore.ruins) || 1;
    if (where === 'crypt') return (S.explore && S.explore.crypt) || 1;
    if (where === 'marsh') return (S.explore && S.explore.marsh) || 1;
    if (where === 'gorge') return (S.explore && S.explore.gorge) || 1;
    if (where === 'stone_forest') return (S.explore && S.explore.stone_forest) || 1;
    return 1;
  }
  function startBattle(where, asBoss) {
    if (battle) return;
    if (Date.now() < battleLockUntil) { toast('剛脫戰 · 稍候再戰'); return; }
    if (S.hp < 8 && where !== 'drill') {
      toast('體力過低難戰（需≥8）· 先回陋室歇息');
      highlightHutHint();
      return;
    }
    storyEnsure();
    const floor = battleFloor(where);
    let base, scale, maxWave, isBoss = !!asBoss;
    if (isBoss && BOSSES[where]) {
      base = BOSSES[where];
      scale = 1 + (floor - 1) * 0.12;
      maxWave = 1;
    } else {
      const pool = enemyPool(where);
      const idx = Math.min(pool.length - 1, floor - 1 + Math.floor(Math.random() * 2));
      base = pool[idx];
      scale = where === 'drill' ? 1 : 1 + (floor - 1) * 0.18;
      maxWave = where === 'frontier' || where === 'crypt' || where === 'gorge' ? 4 : (where === 'wild' || where === 'mine' || where === 'ruins' || where === 'marsh' || where === 'stone_forest' ? 3 : 2);
    }
    const st = stats();
    S.hp = Math.min(S.hp, st.maxHp);
    battle = {
      where,
      wave: 1,
      maxWave,
      isBoss,
      enemy: { name: base.name, maxHp: Math.floor(base.hp * scale), hp: Math.floor(base.hp * scale), atk: Math.floor(base.atk * scale) },
      log: [],
      autoTimer: 0
    };
    if (['mine','frontier','ruins','crypt','marsh','wild','gorge','stone_forest'].includes(where) && mode !== where) showMode(where);
    // close overlay sheets so battle HUD / 攻擊 are tappable on Safari
    try { closeSheets(); } catch (e) {}
    const scene = $('adventure-scene');
    if (scene) scene.classList.add('in-battle');
    const hud = $('battle-hud');
    if (hud) hud.hidden = false;
    updateBattleHUD((isBoss ? 'Boss戰：' : '遇敵：') + battle.enemy.name + ' · 撳「攻擊」');
    renderCombatPanel();
    toast((isBoss ? 'Boss：' : '遇敵：') + battle.enemy.name + ' · 撳攻擊／撤退');
  }
  function updateBattleHUD(msg) {
    if (!battle) return;
    const st = stats();
    $('enemy-name').textContent = battle.enemy.name;
    $('enemy-hp-fill').style.width = Math.max(0, 100 * battle.enemy.hp / battle.enemy.maxHp) + '%';
    $('enemy-hp-num').textContent = battle.enemy.hp + '/' + battle.enemy.maxHp;
    $('player-hp-fill').style.width = Math.max(0, 100 * S.hp / st.maxHp) + '%';
    $('player-hp-num').textContent = S.hp + '/' + st.maxHp;
    $('wave-label').textContent = '第 ' + battle.wave + '／' + battle.maxWave + ' 波';
    if (msg) {
      battle.log.push(msg);
      $('battle-log').textContent = battle.log.slice(-3).join(' · ');
    }
  }
  function playerAttack() {
    if (!battle) return;
    if (Date.now() < juiceHitStopUntil) return;
    const st = stats();
    const a = st.attrs || {};
    let dmg = Math.max(1, st.atk - Math.floor(battle.enemy.atk * 0.05) + Math.floor(Math.random() * 4));
    let note = '你造成 ' + dmg + ' 傷';
    let crit = false;
    if ((a.wu || 0) + (a.yun || 0) >= 6 && Math.random() < Math.min(0.3, 0.05 + (a.wu + a.yun) * 0.015)) {
      dmg = Math.floor(dmg * 1.5) + 1;
      note = '會心！' + dmg + ' 傷';
      crit = true;
    }
    battle.enemy.hp = Math.max(0, battle.enemy.hp - dmg);
    juiceHit(dmg, { crit: crit, boss: !!battle.isBoss });
    updateBattleHUD(note);
    if (battle.enemy.hp <= 0) { onEnemyDown(); return; }
    const delay = Math.max(0, juiceHitStopUntil - Date.now());
    if (delay > 0) {
      setTimeout(() => { if (battle) enemyAttack(); }, delay);
    } else {
      enemyAttack();
    }
  }
  function enemyAttack() {
    if (!battle) return;
    const st = stats();
    const a = st.attrs || {};
    if ((a.shen || 0) >= 4 && Math.random() < Math.min(0.35, 0.08 + a.shen * 0.02)) {
      updateBattleHUD('身法閃避！');
      renderHUD();
      return;
    }
    const dmg = Math.max(1, battle.enemy.atk - st.def + Math.floor(Math.random() * 3) - Math.floor((a.hu || 0) / 5));
    S.hp = Math.max(0, S.hp - dmg);
    juiceHit(dmg, { hurt: true });
    updateBattleHUD(battle.enemy.name + '擊你 ' + dmg);
    if (S.hp <= 0) {
      toast('戰敗…快回陋室休養', 'err');
      S.hp = Math.max(1, Math.floor(st.maxHp * 0.3));
      autoOn = false;
      syncAutoUi();
      battleLockUntil = Date.now() + 4000;
      forceClearBattle();
      highlightHutHint();
      const bar = $('map-battle-bar');
      if (bar) bar.hidden = true;
      saveQuiet();
    }
    renderHUD();
  }
  function onEnemyDown() {
    updateBattleHUD('擊敗 ' + battle.enemy.name);
    if (battle.wave >= battle.maxWave) {
      winBattle();
    } else {
      battle.wave++;
      const pool = enemyPool(battle.where);
      const floor = battleFloor(battle.where);
      const base = pool[Math.min(pool.length - 1, battle.wave + floor - 2)];
      const scale = battle.where === 'drill' ? 1 : 1 + (floor - 1) * 0.18;
      battle.enemy = { name: base.name, maxHp: Math.floor(base.hp * scale * 1.05), hp: Math.floor(base.hp * scale * 1.05), atk: Math.floor(base.atk * scale) };
      updateBattleHUD('下一波：' + battle.enemy.name);
    }
  }
  function winBattle() {
    S.wins = (S.wins || 0) + 1;
    const where = battle.where;
    const floor = battleFloor(where);
    const isBoss = !!battle.isBoss;
    let gold = 12 + floor * 6 + Math.floor(Math.random() * 10);
    if (where === 'frontier') gold = Math.floor(gold * 1.45);
    if (where === 'mine') gold = Math.floor(gold * 0.85);
    if (where === 'ruins' || where === 'crypt') gold = Math.floor(gold * 1.25);
    if (where === 'marsh') gold = Math.floor(gold * 1.1);
    if (isBoss) gold = Math.floor(gold * 2.2) + 30;
    if (S.skills.trade) gold += S.skills.trade * 2;
    S.gold += gold;
    S.soldGold = (S.soldGold || 0) + gold;
    let gear = rollDrop(where, floor, isBoss);
    if (gear) S.gear.push(gear);
    if (isBoss) {
      const g2 = rollDrop(where, floor + 2, true);
      if (g2) { S.gear.push(g2); gear = gear || g2; }
      if (!S.explore) S.explore = { bosses: {} };
      if (!S.explore.bosses) S.explore.bosses = {};
      S.explore.bosses[where] = (S.explore.bosses[where] || 0) + 1;
      toast('Boss 討伐成功');
    }
    if (where === 'drill' && Math.random() < 0.35) S.skills.agi = Math.min(8, (S.skills.agi || 0) + 1);
    if (where === 'wild') S.wildBest = Math.max(S.wildBest || 0, S.wildFloor || 1);
    if (where === 'frontier') S.frontBest = Math.max(S.frontBest || 0, S.frontFloor || 1);
    if (S.explore && (where === 'ruins' || where === 'crypt' || where === 'marsh' || where === 'gorge' || where === 'stone_forest')) {
      S.explore[where + 'Best'] = Math.max(S.explore[where + 'Best'] || 0, S.explore[where] || 1);
    }
    if (Math.random() < 0.4 || isBoss) addBag('ore', 1 + Math.floor(Math.random() * 2) + (isBoss ? 2 : 0));
    if (Math.random() < 0.3 || where === 'marsh') addBag('herb', 1 + (isBoss ? 1 : 0));
    if (where === 'mine' && Math.random() < 0.55) addBag('ore', 2);
    if (where === 'crypt' && Math.random() < 0.35) addBag('flower', 1);
    showLoot(gold, gear);
    endBattle(true);
    if (window.QianFactions) {
      window.QianFactions.noteAct(S, 'fight');
      window.QianFactions.recomputeFame(S);
      window.QianFactions.checkFactionQuest(S);
    }
    if (window.QianStory) window.QianStory.checkStoryQuests(S).forEach((q) => toast('差事完成：' + q.title));
    checkQuest();
  }
  function rollDrop(where, floor, isBoss) {
    const roll = Math.random();
    let rarity = 'white';
    let bonus = 0;
    if (where === 'wild') bonus = floor * 0.03;
    if (where === 'frontier') bonus = floor * 0.045;
    if (where === 'mine') bonus = floor * 0.02;
    if (where === 'ruins') bonus = floor * 0.04;
    if (where === 'crypt') bonus = floor * 0.05;
    if (where === 'marsh') bonus = floor * 0.035;
    if (where === 'gorge') bonus = floor * 0.045;
    if (where === 'stone_forest') bonus = floor * 0.04;
    if (isBoss) bonus += 0.18;
    if (roll > 0.97 - bonus) rarity = 'gold';
    else if (roll > 0.90 - bonus) rarity = 'purple';
    else if (roll > 0.75 - bonus) rarity = 'blue';
    else if (roll > 0.50 - bonus) rarity = 'green';
    if (where === 'drill' && (rarity === 'gold' || rarity === 'purple')) rarity = 'blue';
    if (isBoss && rarity === 'white') rarity = 'green';
    const slots = ['weapon', 'armor', 'accessory'];
    const slot = slots[Math.floor(Math.random() * slots.length)];
    S.gearSeq++;
    if (window.QianEquip && window.QianEquip.rollFromPool) {
      const inst = window.QianEquip.rollFromPool(slot, rarity, S.gearSeq);
      if (inst) return inst;
    }
    const base = GEAR_BASE[slot][Math.min(GEAR_BASE[slot].length - 1, Math.floor(Math.random() * (1 + floor / 2)))];
    return {
      id: 'g' + S.gearSeq,
      slot,
      name: base.name,
      icon: base.icon || 'jian',
      tableId: base.tableId || null,
      atk: base.atk, def: base.def, hp: base.hp,
      rarity
    };
  }
  function showLoot(gold, gear) {
    $('loot-body').textContent = '銀 +' + gold + (gear ? '' : ' · 無裝備掉落');
    const box = $('loot-gear');
    if (gear) {
      const r = RARITIES[gear.rarity] || RARITIES.white;
      const ico = (window.QianEquip && window.QianEquip.iconPath(gear.icon)) || ('assets/equip/' + (gear.icon || 'jian') + '.webp');
      const statsTxt = window.QianEquip ? window.QianEquip.formatStats({
        atk: Math.round((gear.atk || 0) * r.mult),
        def: Math.round((gear.def || 0) * r.mult),
        hp: Math.round((gear.hp || 0) * r.mult),
        wu: gear.wu, hu: gear.hu, shen: gear.shen, zhi: gear.zhi, bian: gear.bian, yun: gear.yun
      }) : ('ATK+' + Math.round(gear.atk * r.mult) + ' DEF+' + Math.round(gear.def * r.mult) + ' HP+' + Math.round(gear.hp * r.mult));
      box.innerHTML = '<div class="gear-card ' + r.className + '"><img class="eq-ico" src="' + ico + ASSET_V + '" alt=""><div class="eq-txt"><b>【' + r.name + '】' + gear.name + '</b><span>' + (SLOT_LABEL[gear.slot] || '') + ' · ' + statsTxt + '</span></div></div>';
    } else box.innerHTML = '';
    $('modal-loot').hidden = false;
  }
  function forceClearBattle(reason) {
    if (battle && battle.autoTimer) {
      try { clearTimeout(battle.autoTimer); } catch (e) {}
    }
    juiceTrauma = 0;
    juiceHitStopUntil = 0;
    try {
      const app = $('app');
      if (app) app.style.transform = juiceBaseTransform();
    } catch (e) {}
    battle = null;
    const hud = $('battle-hud');
    if (hud) hud.hidden = true;
    const scene = $('adventure-scene');
    if (scene) scene.classList.remove('in-battle');
    document.querySelectorAll('[id^="btn-flee-"]').forEach((b) => { b.hidden = true; });
    const bar = $('map-battle-bar');
    if (bar) bar.hidden = true;
    document.querySelectorAll('.mode-panel .combat-lock').forEach((el) => { el.hidden = true; });
    try { renderCombatPanel(); } catch (e) {}
    try { renderHUD(); } catch (e) {}
    if (reason) { /* optional toast handled by caller */ }
  }
  function endBattle(won) {
    forceClearBattle();
    saveQuiet();
    return !!won;
  }
  function fleeBattle() {
    if (!battle) { forceClearBattle(); return; }
    toast('撤退 · 逃離戰陣');
    autoOn = false;
    syncAutoUi();
    battleLockUntil = Date.now() + 2500;
    endBattle(false);
  }
  function escapeBattleToHut() {
    autoOn = false;
    syncAutoUi();
    battleLockUntil = Date.now() + 2500;
    forceClearBattle();
    toast('逃回陋室 · 戰鬥已結束');
    finishTravel('hut');
    saveQuiet();
  }
  function syncAutoUi() {
    if ($('auto-label')) {
      $('auto-label').textContent = autoOn ? 'AUTO 開' : 'AUTO 關';
      $('auto-label').className = autoOn ? 'auto-on' : 'auto-off';
    }
    document.querySelectorAll('.auto-btn').forEach((b) => b.classList.toggle('on', autoOn));
    if ($('q-auto')) $('q-auto').classList.toggle('on', autoOn);
  }
  function autoFightStep() {
    if (Date.now() < battleLockUntil) return;
    if (!battle) {
      if (mode === 'drill' || mode === 'wild' || mode === 'frontier' || mode === 'ruins' || mode === 'crypt' || mode === 'marsh') startBattle(mode);
      else if (mode === 'mine') startBattle('mine');
      return;
    }
    // potion if low
    const st = stats();
    if (S.hp < st.maxHp * 0.35 && bagCount('potion') > 0) {
      usePotion();
      updateBattleHUD('服藥');
      return;
    }
    playerAttack();
  }

  /* ---- Bag / Gear / Quest ---- */
  function gearIconSrc(g) {
    const key = (g && g.icon) || (g && g.slot === 'armor' ? 'jia' : g && g.slot === 'weapon' ? 'jian' : 'pei');
    if (window.QianEquip) return window.QianEquip.iconPath(key) + ASSET_V;
    return 'assets/equip/' + key + '.webp' + ASSET_V;
  }
  function openBag() {
    const st = stats();
    const attrs = (typeof heroAttrs === 'function' ? heroAttrs() : ((window.QianEquip && window.QianEquip.heroAttrsFromGear(S.gear, S.equipped)) || {}));
    $('combat-summary').textContent = '命 ' + st.hp + '/' + st.maxHp + ' · 攻 ' + st.atk + ' · 防 ' + st.def +
      (attrs.wu || attrs.hu || attrs.shen || attrs.zhi || attrs.bian || attrs.yun
        ? ' · 武' + (attrs.wu||0) + ' 護' + (attrs.hu||0) + ' 身' + (attrs.shen||0) + ' 智' + (attrs.zhi||0) + ' 辯' + (attrs.bian||0) + ' 運' + (attrs.yun||0)
        : '');
    $('equip-slots').innerHTML = ['weapon', 'armor', 'accessory'].map((slot) => {
      const id = S.equipped[slot];
      const g = id && S.gear.find((x) => x.id === id);
      if (!g) {
        return '<div class="equip-slot"><img class="eq-ico" src="assets/equip/' + (slot==='weapon'?'jian':slot==='armor'?'jia':'pei') + '.webp' + ASSET_V + '" alt="" style="opacity:.35"><div class="eq-meta"><strong>' + (SLOT_LABEL[slot] || slot) + '</strong><small>空</small></div></div>';
      }
      const r = RARITIES[g.rarity] || RARITIES.white;
      const statsTxt = window.QianEquip ? window.QianEquip.formatStats(g) : ('攻+' + g.atk + ' 防+' + g.def);
      return '<div class="equip-slot"><img class="eq-ico" src="' + gearIconSrc(g) + '" alt=""><div class="eq-meta"><strong>' + g.name + '（' + r.name + '）</strong><small>' + statsTxt + (g.desc ? ' · ' + g.desc : '') + '</small></div></div>';
    }).join('');
    $('bag-grid').innerHTML = Object.keys(S.bag).filter((k) => S.bag[k] > 0).map((k) =>
      '<div class="bag-item">' + itemName(k) + ' <b>×' + S.bag[k] + '</b></div>'
    ).join('') || '<p class="muted">空空如也</p>';
    $('gear-list').innerHTML = S.gear.map((g) => {
      const r = RARITIES[g.rarity] || RARITIES.white;
      const slotKey = g.slot === 'tool' ? 'accessory' : g.slot;
      const on = S.equipped[slotKey] === g.id;
      const statsTxt = window.QianEquip ? window.QianEquip.formatStats(g) : '';
      return '<button type="button" class="gear-card ' + r.className + (on ? ' on' : '') + '" data-gid="' + g.id + '">' +
        '<img class="eq-ico" src="' + gearIconSrc(g) + '" alt="">' +
        '<div class="eq-txt"><b>' + (on ? '【裝】' : '') + '【' + r.name + '】' + g.name + '</b><span>' + (SLOT_LABEL[slotKey] || slotKey) + (statsTxt ? ' · ' + statsTxt : '') + '</span></div></button>';
    }).join('') || '<p class="muted">尚無裝備</p>';
    /* 圖鑑：展示完整秦風裝備目錄（未擁有半透明） */
    let dex = document.getElementById('equip-dex');
    if (!dex) {
      dex = document.createElement('div');
      dex.id = 'equip-dex';
      const title = document.createElement('h3');
      title.className = 'bag-section-title';
      title.id = 'equip-dex-title';
      title.textContent = '兵器圖鑑';
      const list = $('gear-list');
      list.parentNode.insertBefore(title, list.nextSibling);
      list.parentNode.insertBefore(dex, title.nextSibling);
    }
    if (window.QianEquip) {
      const owned = new Set(S.gear.map((g) => g.tableId || g.name));
      const all = Object.values(window.QianEquip.EQUIP_TABLE);
      const tEl = document.getElementById('equip-dex-title');
      if (tEl) tEl.textContent = '秦風圖鑑 · ' + all.length + ' 件';
      dex.innerHTML = '<div class="gear-list">' + all.map((def) => {
        const have = owned.has(def.id) || owned.has(def.name);
        const rKey = window.QianEquip.normalizeRarity(def.rarity);
        const r = RARITIES[rKey] || RARITIES.white;
        return '<div class="gear-card ' + r.className + '" style="opacity:' + (have ? '1' : '.45') + ';cursor:default">' +
          '<img class="eq-ico" src="' + window.QianEquip.iconPath(def.icon) + ASSET_V + '" alt="">' +
          '<div class="eq-txt"><b>【' + r.name + '】' + def.name + '</b><span>' + (have ? '已入庫 · ' : '未得 · ') + (window.QianEquip.SLOT_LABEL[def.slot] || def.slot) + '</span></div></div>';
      }).join('') + '</div>';
    } else {
      dex.innerHTML = '';
    }
    $('gear-list').querySelectorAll('[data-gid]').forEach((b) => {
      b.addEventListener('click', () => {
        const g = S.gear.find((x) => x.id === b.dataset.gid);
        if (!g) return;
        const slotKey = g.slot === 'tool' ? 'accessory' : g.slot;
        if (S.equipped[slotKey] === g.id) S.equipped[slotKey] = null;
        else S.equipped[slotKey] = g.id;
        const st2 = stats();
        S.hp = Math.min(S.hp, st2.maxHp);
        openBag();
        renderHUD();
        saveQuiet();
      });
    });
    syncBagDisguiseBtn();
    $('modal-bag').hidden = false;
  }
  function openQuest() {
    checkQuest();
    if (window.QianFactions) window.QianFactions.checkFactionQuest(S);
    const q = S.quest;
    let body = '<div class="quest-item' + (q.done ? ' done' : '') + '"><strong>【出身】' + q.title + '</strong><p>' + q.desc + '</p>';
    if (q.done) body += '<p class="ok">已完成</p>';
    else body += '<p class="quest-reward">酬：銀' + q.gold + ' · 糧' + q.food + '</p>';
    body += '</div>';
    if (S.factionQuest) {
      const fq = S.factionQuest;
      body += '<div class="quest-item' + (fq.done ? ' done' : '') + '"><strong>【勢力】' + fq.title + '</strong><p>' + fq.desc + '</p>';
      body += '<p class="quest-reward">酬：銀' + fq.gold + (fq.food ? ' · 糧' + fq.food : '') + '</p></div>';
    } else if (!S.joined) {
      body += '<div class="quest-item"><strong>勢力</strong><p>尚未加入任何一方。聲名漸起時，呂黨／王府／邊市盟或將來訪。</p></div>';
    }
    body += '<div class="quest-item"><strong>累計</strong><p>勝場 ' + (S.wins || 0) + ' · 賣銀 ' + (S.soldGold || 0) + ' · 山層' + S.wildBest + ' · 邊層' + (S.frontBest||0) +
      ' · 名' + Math.floor(S.fame || 0) + ' · 民' + Math.floor(S.people || 0) + '</p></div>';
    if (S.worldLine) body += '<div class="quest-item"><strong>天下大勢</strong><p>' + escapeHtml(S.worldLine) + '</p></div>';
    if (window.QianStory) {
      window.QianStory.ensure(S);
      const newly = window.QianStory.checkStoryQuests(S);
      if (newly && newly.length) newly.forEach((qq) => toast('差事可領獎：' + qq.title));
      body += window.QianStory.questListHtml(S, escapeHtml);
      const claimable = window.QianStory.hasClaimable && window.QianStory.hasClaimable(S);
      if ($('quest-dot')) $('quest-dot').hidden = !window.QianStory.hasOpenStory(S) && (!S.quest || S.quest.done) && !claimable;
    }
    const sk = S.skills || {};
    const ha = (typeof heroAttrs === 'function' ? heroAttrs() : {});
    body += '<div class="quest-item"><strong>六維屬性</strong><p>' + (window.QianPlots ? window.QianPlots.fmtAttrs(S) : ('武'+(ha.wu||0)+' 護'+(ha.hu||0)+' 身'+(ha.shen||0)+' 智'+(ha.zhi||0)+' 辯'+(ha.bian||0)+' 運'+(ha.yun||0))) + '（含裝備）</p></div>';
    body += '<div class="quest-item"><strong>技能</strong><p>農' + (sk.farm||0) + ' 醫/藥理' + (sk.med||0) + ' 商' + (sk.trade||0) +
      ' 武' + (sk.mart||0) + ' 輕功' + (sk.agi||0) + ' 文' + (sk.lit||0) + ' 工' + (sk.craft||0) +
      (disguiseOn() ? ' · 女扮男裝中' : (disguiseFemaleOn() ? ' · 男扮女裝中' : '')) + '</p></div>';
    $('quest-list').innerHTML = body;
    $('modal-quest').hidden = false;
    const ql = $('quest-list');
    if (ql && !ql._claimBound) {
      ql._claimBound = true;
      ql.addEventListener('click', (ev) => {
        const btn = ev.target && ev.target.closest && ev.target.closest('.btn-claim-quest');
        if (!btn) return;
        const id = btn.getAttribute('data-qid');
        if (!id || !window.QianStory || !window.QianStory.claimStoryQuest) return;
        const r = window.QianStory.claimStoryQuest(S, id);
        if (!r.ok) { toast(r.msg || '無法領獎'); return; }
        toast('領獎：' + r.quest.title + (r.tip ? ' · ' + r.tip : ''));
        renderHUD();
        saveQuiet();
        openQuest();
      });
    }
  }
  function checkQuest() {
    const q = S.quest;
    if (!q || q.done) return;
    let ok = false;
    if (q.need) {
      ok = Object.keys(q.need).every((k) => bagCount(k) >= q.need[k]);
    } else if (q.needFlag === 'soldGold') ok = (S.soldGold || 0) >= q.needVal;
    else if (q.needFlag === 'wins') ok = (S.wins || 0) >= q.needVal;
    else if (q.needFlag === 'maxAff') {
      ok = Math.max(...Object.values(S.npcs).map((n) => n.aff)) >= q.needVal;
    } else if (q.needFlag === 'frontBest') {
      ok = (S.frontBest || 0) >= q.needVal;
    }
    if (ok) {
      q.done = true;
      if (q.need) Object.keys(q.need).forEach((k) => addBag(k, -q.need[k]));
      S.gold += q.gold;
      S.food += q.food;
      toast('差事完成：' + q.title);
      if (window.QianFactions) {
        window.QianFactions.bump(S, 'fame', 4);
        window.QianFactions.bump(S, 'people', 2);
      }
      if ($('quest-dot')) $('quest-dot').hidden = true;
    }
    if (window.QianFactions) {
      const fq = window.QianFactions.checkFactionQuest(S);
      if (fq) toast('勢力差事完成：' + fq.title);
    }
  }

  /* ---- AUTO loop ---- */
  function autoVillageStep() {
    if (!S.orderDone) {
      let can = true;
      for (const k of Object.keys(S.order.need)) if (bagCount(k) < S.order.need[k]) can = false;
      if (can) submitOrder();
    }
    // gift occasionally
    if (Math.random() < 0.2) giftNpc();
  }
  function autoMarketStep() {
    // craft if possible
    const list = RECIPES.filter((r) => r.scene === 'market');
    for (const r of list) {
      let ok = true;
      for (const k of Object.keys(r.needs)) if (bagCount(k) < r.needs[k]) ok = false;
      if (ok) { doCraft(r.id); return; }
    }
    sellCrops();
  }
  function autoClinicStep() {
    if (bagCount('herb') < 2) gatherHerb();
    else {
      const r = RECIPES.find((x) => x.id === 'potion');
      let ok = true;
      for (const k of Object.keys(r.needs)) if (bagCount(k) < r.needs[k]) ok = false;
      if (ok) doCraft('potion');
      else gatherHerb();
    }
  }

  let lastWorkerTs = 0;
  let workerDripGold = 0;
  function updateHandsHint() {
    const el = $('plot-hint');
    if (!el || !S || !window.QianWorkers) return;
    const n = window.QianWorkers.count(S, 'farm');
    el.textContent = '點畦操作 · 田上工人 ' + n + '／' + window.QianWorkers.MAX +
      (S.hands ? '（僱' + S.hands + '）' : '');
  }
  function paintWorkers(force) {
    if (!window.QianWorkers) return;
    const cv = $('worker-layer');
    if (!cv) return;
    const gameOn = $('screen-game') && !$('screen-game').hidden;
    if (!gameOn) {
      const g = cv.getContext('2d');
      if (g) g.clearRect(0, 0, cv.width, cv.height);
      return;
    }
    window.QianWorkers.drawScene(cv, S, mode);
    const actCv = $('act-worker-layer');
    const sheetAct = $('sheet-act');
    if (sheetAct) sheetAct.dataset.mode = mode;
    if (actCv && sheetAct && !sheetAct.hidden) {
      window.QianWorkers.drawScene(actCv, S, mode);
    }
    if (force && mode === 'farm') drawFarm();
  }
  function tick(ts) {
    requestAnimationFrame(tick);
    // 工人動畫（唔使開 AUTO 都會郁）
    if (S && $('screen-game') && !$('screen-game').hidden) {
      if (!lastWorkerTs) lastWorkerTs = ts;
      let dt = Math.min(0.05, (ts - lastWorkerTs) / 1000);
      lastWorkerTs = ts;
      if (window.QianWorkers) {
        const res = window.QianWorkers.update(dt, S, mode, COLS, ROWS);
        if (res && res.drip > 0) {
          workerDripGold += res.drip;
          // 累滿約 3 銀先入帳，避免狂 toast
          if (workerDripGold >= 3) {
            const give = Math.floor(workerDripGold);
            workerDripGold -= give;
            S.gold += give;
            if (Math.random() < 0.35) toast('長工零活 +' + give + '銀');
            renderHUD();
          }
        }
        // ~20fps 重畫夠 peasy；田畦 canvas 跟住刷新小人
        if ((ts | 0) % 2 === 0) {
          paintWorkers(false);
          if (mode === 'farm') {
            const sheet = $('sheet-act');
            if (sheet && !sheet.hidden) drawFarm();
          }
        }
      }
    } else {
      lastWorkerTs = ts;
    }

    if (!S || !autoOn) return;
    if (ts - lastTick < 900) return;
    lastTick = ts;
    if (S.pendingEvent) return; // wait for player choice
    if (battle) { autoFightStep(); return; }
    // faction AUTO bias: occasionally move to preferred scene
    if (S.hp < Math.max(10, S.maxHp * 0.28) && mode !== 'hut' && !battle) {
      showMode('hut'); hutRest(false); return;
    }
    if (window.QianFactions && Math.random() < 0.04) {
      const pref = window.QianFactions.autoPriority(S);
      if (pref && pref !== mode) showMode(pref);
    }
    if (mode === 'farm') autoFarmStep();
    else if (mode === 'village') autoVillageStep();
    else if (mode === 'market') autoMarketStep();
    else if (mode === 'clinic') autoClinicStep();
    else if (mode === 'drill' || mode === 'wild' || mode === 'frontier' || mode === 'ruins' || mode === 'crypt' || mode === 'marsh') autoFightStep();
    else if (mode === 'hut') { if (S.hp < S.maxHp) hutRest(false); }
    else if (mode === 'mine') {
      if (Math.random() < 0.55) mineDig();
      else if (Math.random() < 0.25) mineDeeper();
      else autoFightStep();
    }
    else if (mode === 'post') {
      if (Math.random() < 0.5) postRest();
      else postRumor();
    }
    else if (mode === 'tavern') {
      if (S.gold >= 6 && Math.random() < 0.5) tavernDrink();
      else tavernListen();
    }
    else if (mode === 'academy') {
      if (Math.random() < 0.5) academyStudy();
      else academyDebate();
    }
    else if (LEISURE_MODES.includes(mode) && Math.random() < 0.35) doLeisure(mode);
    else if (CRAFT_MODES.includes(mode) && Math.random() < 0.4) autoBeautyStep(mode);
    else if (BEAUTY_MODES.includes(mode) && Math.random() < 0.35) autoBeautyStep(mode);
    else if ((QIN_COURT_MODES.includes(mode) || mode === 'guanshi' || mode === 'hejin' || mode === 'ying') && Math.random() < 0.4) {
      const conf = QIN_PANEL[mode];
      if (conf && conf.acts.length) doQinAct(mode, conf.acts[Math.floor(Math.random() * conf.acts.length)].id);
    }
    // slow day advance while farming auto
    if (mode === 'farm' && Math.random() < 0.08) nextDay();
    else if (BEAUTY_MODES.includes(mode) && Math.random() < 0.05) nextDay();
  }


  /* ---- 美化場景：茶寮／工坊／庭院等 ---- */
  const BEAUTY_PANEL = {
    tea: { blurb: '云海茶寮：品茗歇息、聽謠、略提名聲。', acts: [
      { id: 'sip', label: '品茗', tip: '銀3 · 回體' }, { id: 'gossip', label: '聽謠', tip: '體力-2' }, { id: 'tip', label: '賞茶博士', tip: '銀6 · 名' }
    ]},
    forge: { blurb: '鐵鋪爐火正旺。耗礦打造。', acts: [
      { id: 'craft', label: '開爐打造', tip: '配方' }, { id: 'sparks', label: '幫錘', tip: '體力-3 · 工' }, { id: 'buyOre', label: '買礦', tip: '銀10 · 礦2' }
    ]},
    wood: { blurb: '木作坊刨花滿地。', acts: [
      { id: 'craft', label: '製器', tip: '配方' }, { id: 'sand', label: '打磨', tip: '體力-2 · 銀' }, { id: 'learn', label: '學藝', tip: '體力-3 · 工' }
    ]},
    incense: { blurb: '香鋪煙篆。燃香靜心。', acts: [
      { id: 'craft', label: '調香', tip: '配方' }, { id: 'burn', label: '靜坐燃香', tip: '銀4 · 回體' }, { id: 'offer', label: '貢香', tip: '花2 · 民心' }
    ]},
    weave: { blurb: '織坊機杼聲。', acts: [
      { id: 'craft', label: '織布', tip: '配方' }, { id: 'dye', label: '染紗', tip: '花1 · 布' }, { id: 'giftCloth', label: '送布鄰里', tip: '布1 · 好感' }
    ]},
    study: { blurb: '書齋簡冊飄香。', acts: [
      { id: 'craft', label: '抄書', tip: '配方' }, { id: 'read', label: '研讀', tip: '體力-3 · 文' }, { id: 'agi', label: '讀輕功殘篇', tip: '體力-4 · 輕功' }
    ]},
    yard: { blurb: '庭院深深。掃葉賞景。', acts: [
      { id: 'sweep', label: '掃庭', tip: '回體' }, { id: 'meet', label: '偶遇', tip: '體力-2' }, { id: 'chess', label: '對弈', tip: '銀2 · 文' }
    ]},
    wish: { blurb: '祈願古樹，紅籤垂落。', acts: [
      { id: 'tag', label: '掛籤祈願', tip: '銀5 · 民心' }, { id: 'incense', label: '添香', tip: '花1' }, { id: 'readTags', label: '讀他籤', tip: '體力-1 · 謠' }
    ]},
    persimmon: { blurb: '霜柿山居，秋色正濃。', acts: [
      { id: 'pick', label: '摘柿', tip: '體力-3 · 糧' }, { id: 'dry', label: '晒柿餅', tip: '糧→銀' }, { id: 'chat', label: '閑話霜秋', tip: '好感' }
    ]},
    canal: { blurb: '漕幫碼頭，貨船往來。', acts: [
      { id: 'craft', label: '接運單', tip: '配方' }, { id: 'load', label: '裝船幫工', tip: '體力-4 · 銀' }, { id: 'rumor', label: '聽漕謠', tip: '體力-2' }
    ]},
    bridge: { blurb: '長橋如龍，憑欄可遇各方人。', acts: [
      { id: 'gaze', label: '憑欄', tip: '回體' }, { id: 'meet', label: '偶遇', tip: '體力-2' }, { id: 'toll', label: '助守橋', tip: '體力-3 · 銀' }
    ]},
    terraces: { blurb: '層田拾級，水鏡映天。可助耕、觀稼。', acts: [
      { id: 'help', label: '助耕', tip: '體力-3 · 糧' }, { id: 'gaze', label: '觀稼', tip: '回體' }, { id: 'meet', label: '遇田戶', tip: '體力-2' }
    ]},
    iron_league: { blurb: '鐵盟坊：秦風鍛造同盟。可試煉、開爐。', acts: [
      { id: 'craft', label: '開爐', tip: '配方' }, { id: 'trial', label: '請試煉', tip: '觸發劇情機率' }, { id: 'sparks', label: '幫錘', tip: '體力-3 · 工' }
    ]},
    stargaze: { blurb: '觀星隱廬：月井映宿。可觀星、問讖。', acts: [
      { id: 'star', label: '觀星', tip: '體力-2 · 運' }, { id: 'well', label: '臨井', tip: '回體' }, { id: 'ask', label: '問方士', tip: '銀5 · 智' }
    ]},
    poplar: { blurb: '胡楊洲：沙風楊影。可探路、歇蔭。', acts: [
      { id: 'shade', label: '歇蔭', tip: '回體' }, { id: 'scout', label: '探路', tip: '體力-4 · 銀' }, { id: 'meet', label: '遇賈隊', tip: '體力-2' }
    ]},
    dragon_bridge: { blurb: '雙龍橋：雙拱臥波。', acts: [
      { id: 'gaze', label: '憑欄', tip: '回體' }, { id: 'meet', label: '偶遇', tip: '體力-2' }, { id: 'toll', label: '助守', tip: '體力-3 · 銀' }
    ]},
    canal_hq: { blurb: '漕幫總壇：漕運樞紐。', acts: [
      { id: 'craft', label: '運單', tip: '配方' }, { id: 'load', label: '裝船', tip: '體力-4 · 銀' }, { id: 'rumor', label: '聽總壇謠', tip: '體力-2' }
    ]},
    tea_master: { blurb: '品茗室：茶師瀹器。', acts: [
      { id: 'sip', label: '品鑒', tip: '銀5 · 回體名' }, { id: 'learn', label: '學茶', tip: '體力-3 · 辯' }, { id: 'gossip', label: '茶語', tip: '體力-2' }
    ]},
    sword_wash: { blurb: '浣劍居：溪石滌刃。', acts: [
      { id: 'wash', label: '浣劍', tip: '體力-2 · 武微' }, { id: 'meditate', label: '面水靜坐', tip: '回體' }, { id: 'spar', label: '切磋', tip: '體力-5 · 開戰' }
    ]},
    paper: { blurb: '紙坊：抄造晾箋。', acts: [
      { id: 'craft', label: '抄造', tip: '花1→銀' }, { id: 'dry', label: '晾紙', tip: '體力-2 · 文' }, { id: 'buy', label: '買箋', tip: '銀8 · 花' }
    ]},
    rain_hut: { blurb: '聽雨廬：雨聲如訴。', acts: [
      { id: 'listen', label: '聽雨', tip: '回體' }, { id: 'write', label: '雨中書', tip: '體力-2 · 文' }, { id: 'meet', label: '遇避雨人', tip: '體力-2' }
    ]},
    ink_pool: { blurb: '墨池齋：臨池學書。', acts: [
      { id: 'ink', label: '研墨', tip: '體力-2 · 文智' }, { id: 'copy', label: '臨帖', tip: '體力-3 · 辯' }, { id: 'gaze', label: '觀池', tip: '回體' }
    ]},
    dye: { blurb: '染坊：青絲藍布。', acts: [
      { id: 'craft', label: '浸染', tip: '花→布' }, { id: 'hang', label: '晾布', tip: '體力-2 · 銀' }, { id: 'learn', label: '學色', tip: '體力-3 · 工' }
    ]},
    rainy_tea: { blurb: '雨亭茶寮：煙雨一盞。', acts: [
      { id: 'sip', label: '雨中品', tip: '銀4 · 回體' }, { id: 'gossip', label: '聽雨謠', tip: '體力-2' }, { id: 'tip', label: '賞茶博士', tip: '銀6 · 名' }
    ]},
    brewery: { blurb: '酒坊：甕香撲鼻。', acts: [
      { id: 'drink', label: '試釀', tip: '銀3 · 回體' }, { id: 'help', label: '幫釀', tip: '體力-3 · 銀' }, { id: 'meet', label: '酒逢知己', tip: '體力-2' }
    ]},
    pharmacy: { blurb: '藥鋪：柜上百草。', acts: [
      { id: 'craft', label: '配藥', tip: '配方' }, { id: 'buy', label: '買藥', tip: '銀12 · 藥' }, { id: 'learn', label: '問藥理', tip: '體力-3 · 醫' }
    ]},
    garden_water: { blurb: '水榭園：亭影入池。', acts: [
      { id: 'gaze', label: '憑欄', tip: '回體' }, { id: 'meet', label: '偶遇', tip: '體力-2' }, { id: 'boat', label: '池上舟', tip: '銀4 · 運' }
    ]}
  };

  function renderBeauty(m) {
    if (!S) return;
    const conf = BEAUTY_PANEL[m];
    const blurb = $('beauty-blurb');
    const acts = $('beauty-acts');
    const meet = $('beauty-meet');
    const craft = $('beauty-craft');
    const stat = $('beauty-stat');
    if ($('beauty-shared-panel')) $('beauty-shared-panel').hidden = false;
    // hide empty shells
    BEAUTY_MODES.forEach((id) => { const el = $(id + '-panel'); if (el) el.hidden = true; });
    if (stat) stat.textContent = '體力 ' + S.hp + '/' + S.maxHp + ' · 銀' + S.gold + (window.QianNpcAI ? ' · ' + window.QianNpcAI.periodName(S) : '');
    if (blurb && conf) blurb.textContent = conf.blurb;
    if (acts && conf) {
      acts.innerHTML = conf.acts.map((a, i) =>
        '<button type="button" class="btn' + (i === 0 ? ' primary' : '') + ' choice-tap" data-beauty="' + m + '" data-bact="' + a.id + '">' +
        a.label + '<small class="act-tip">' + a.tip + '</small></button>'
      ).join('');
      acts.querySelectorAll('[data-beauty]').forEach((b) => {
        b.addEventListener('click', (ev) => { tapFeel(b, ev); doBeautyAct(b.dataset.beauty, b.dataset.bact); });
      });
    }
    if (craft) {
      if (CRAFT_MODES.includes(m)) {
        craft.hidden = false;
        const show = RECIPES.filter((r) => r.scene === m);
        craft.innerHTML = '<div class="panel-h-row"><span class="panel-h">本地製物</span></div><div class="craft-list">' +
          show.map((r) => {
            const need = Object.keys(r.needs).map((k) => itemName(k) + ' ' + bagCount(k) + '/' + r.needs[k]).join(' ');
            const short = craftMissing(r).length > 0;
            return '<button type="button" class="craft-item' + (short ? ' short' : '') + '" data-craft="' + r.id + '"><strong>' + r.name + '</strong><span>' + r.desc + '</span><span class="need">' + need + '</span></button>';
          }).join('') + '</div>';
        craft.querySelectorAll('[data-craft]').forEach((b) => {
          b.addEventListener('click', (ev) => { tapFeel(b, ev); doCraft(b.dataset.craft); renderBeauty(m); });
        });
      } else {
        craft.hidden = true;
        craft.innerHTML = '';
      }
    }
    if (meet) {
      storyEnsure();
      let allHere = [];
      if (window.QianNpcAI) allHere = window.QianNpcAI.atLocation(S, m) || [];
      if (!allHere.length) {
        meet.innerHTML = '<p class="tiny muted">此刻此處無人——過日後人物會依日程到來。</p>';
      } else {
        meet.innerHTML = '<div class="panel-h-row"><span class="panel-h">可見之人</span><span class="tiny">' + allHere.length + '</span></div>' +
          '<div class="face-grid">' + allHere.map((n) => {
            if (!npcKnown(n.id)) {
              return '<button type="button" class="face-cell unknown" data-meet-unk="' + n.id + '"><span class="face-q">？</span><span>？？？</span></button>';
            }
            const aff = (S.npcs[n.id] && S.npcs[n.id].aff) || 0;
            return '<button type="button" class="face-cell" data-meet-npc="' + n.id + '">' +
              faceThumbHtml(npcFaceKey(n), n.name) + '<span>' + n.name + '</span><span class="tiny muted">' + n.role + ' ·' + aff + '</span></button>';
          }).join('') + '</div>';
        meet.querySelectorAll('[data-meet-npc]').forEach((b) => {
          b.addEventListener('click', () => {
            tapFeel(b);
            selectedNpc = b.dataset.meetNpc;
            if (window.QianNpcAI) window.QianNpcAI.interrupt(S, selectedNpc);
            openTalk();
          });
        });
        meet.querySelectorAll('[data-meet-unk]').forEach((b) => {
          b.addEventListener('click', () => toast('尚未相識'));
        });
      }
    }
  }

  function doBeautyAct(m, act) {
    if (!S || battle) { toast(battle ? '戰鬥中' : ''); return; }
    const bump = (k, n) => { if (window.QianFactions) window.QianFactions.bump(S, k, n); };
    const needHp = (n) => { if (S.hp < n) { toast('體力不足'); return false; } S.hp -= n; return true; };
    const needGold = (n) => { if (S.gold < n) { toast('銀不足'); return false; } S.gold -= n; return true; };

    if (act === 'craft') { renderBeauty(m); toast('揀下方配方'); return; }

    if (m === 'tea') {
      if (act === 'sip') {
        if (!needGold(3)) return;
        S.hp = Math.min(S.maxHp, S.hp + 10); bump('fame', 1);
        S.flags = S.flags || {}; S.flags.tea_sip = 1;
        toast('云海一盞 · 回體'); pushStory('茶煙與云海一色，你心神稍定。', 'nar');
      } else if (act === 'gossip') {
        if (!needHp(2)) return;
        const lines = ['相邦府夜宴門客。', '漕幫要人手運糧。', '祈願樹新掛紅籤。', '鐵鋪新到精礦。'];
        const L = lines[Math.floor(Math.random() * lines.length)];
        toast('聽得：' + L); pushStory('茶寮偶語：' + L, 'nar');
      } else if (act === 'tip') {
        if (!needGold(6)) return;
        bump('fame', 2); bump('people', 1); toast('賞茶博士 · 名↑');
        pushStory('你多賞了茶博士，座中有人記住你的臉。', 'nar');
      }
    } else if (m === 'forge') {
      if (act === 'sparks') {
        if (!needHp(3)) return;
        S.skills.craft = Math.min(8, (S.skills.craft || 0) + (Math.random() < 0.5 ? 1 : 0));
        S.gold += 3; S.flags = S.flags || {}; S.flags.forge_sparks = 1;
        toast('幫錘 · 工藝有進'); pushStory('火花四濺，你幫打了數錘。', 'nar');
      } else if (act === 'buyOre') {
        if (!needGold(10)) return;
        addBag('ore', 2); toast('買礦×2'); 
      }
    } else if (m === 'wood') {
      if (act === 'sand') {
        if (!needHp(2)) return;
        S.gold += 4 + (S.skills.craft || 0); toast('打磨得銀'); pushStory('桐木清香，你打磨了一午後售出。', 'nar');
      } else if (act === 'learn') {
        if (!needHp(3)) return;
        S.skills.craft = Math.min(8, (S.skills.craft || 0) + 1); toast('學藝 · 工+'); 
      }
    } else if (m === 'incense') {
      if (act === 'burn') {
        if (!needGold(4)) return;
        S.hp = Math.min(S.maxHp, S.hp + 14); bump('fame', 1);
        S.flags = S.flags || {}; S.flags.incense_burn = 1; toast('靜坐燃香'); 
      } else if (act === 'offer') {
        if (bagCount('flower') < 1) { toast('缺花卉'); return; }
        addBag('flower', -1); bump('people', 2); toast('貢香 · 民心↑');
      }
    } else if (m === 'weave') {
      if (act === 'dye') {
        if (bagCount('flower') < 1) { toast('缺花'); return; }
        addBag('flower', -1); addBag('cloth', 1); toast('染得粗布×1');
      } else if (act === 'giftCloth') {
        if (bagCount('cloth') < 1) { toast('無布'); return; }
        addBag('cloth', -1);
        const ns = liveNpcs().filter((n) => npcKnown(n.id));
        const n = ns[Math.floor(Math.random() * Math.max(1, ns.length))];
        if (n && S.npcs[n.id]) {
          S.npcs[n.id].aff = Math.min(100, (S.npcs[n.id].aff || 0) + 5);
          logNpcAct(n.id, '贈布', { gratitude: 2 });
          toast('送布予' + n.name); pushStory('你將新織布疋贈予' + n.name + '。', 'nar');
        } else toast('送布鄰里 · 無人在側');
      }
    } else if (m === 'study') {
      if (act === 'read') {
        if (!needHp(3)) return;
        S.skills.lit = Math.min(8, (S.skills.lit || 0) + (Math.random() < 0.55 ? 1 : 0));
        S.flags = S.flags || {}; S.flags.study_read = 1;
        toast('研讀有所得'); pushStory('書齋燈下，你又翻過一冊。', 'nar');
      } else if (act === 'agi') {
        if (!needHp(4)) return;
        S.skills.agi = Math.min(8, (S.skills.agi || 0) + (Math.random() < 0.5 ? 1 : 0));
        toast('輕功殘篇'); 
      }
    } else if (m === 'yard') {
      if (act === 'sweep') {
        S.hp = Math.min(S.maxHp, S.hp + 8); S.flags = S.flags || {}; S.flags.yard_sweep = 1; toast('掃庭 · 回體'); 
      } else if (act === 'meet') {
        if (!needHp(2)) return;
        gardenMeet(); return;
      } else if (act === 'chess') {
        if (!needGold(2)) return;
        S.skills.lit = Math.min(8, (S.skills.lit || 0) + (Math.random() < 0.4 ? 1 : 0));
        toast('對弈一局'); 
      }
    } else if (m === 'wish') {
      if (act === 'tag') {
        if (!needGold(5)) return;
        bump('people', 3); bump('fame', 1); S.flags.wish_tag = 1;
        toast('掛籤祈願'); pushStory('紅籤垂落，你默祝一事。', 'nar');
      } else if (act === 'incense') {
        if (bagCount('flower') < 1) { toast('缺花'); return; }
        addBag('flower', -1); bump('people', 1); toast('添香');
      } else if (act === 'readTags') {
        if (!needHp(1)) return;
        toast('他籤多祝豐年與安邊'); pushStory('你讀過幾枚他籤，字跡各異。', 'nar');
      }
    } else if (m === 'persimmon') {
      if (act === 'pick') {
        if (!needHp(3)) return;
        const n = 2 + Math.floor(Math.random() * 3); S.food += n; toast('摘柿 · 糧+' + n);
        S.flags.persimmon = 1;
      } else if (act === 'dry') {
        if (S.food < 3) { toast('糧不足'); return; }
        S.food -= 3; const g = 10 + Math.floor(Math.random() * 8); S.gold += g; toast('晒柿餅售出 +' + g);
      } else if (act === 'chat') {
        const ns = (window.QianNpcAI ? window.QianNpcAI.atLocation(S, 'persimmon') : []).filter((n) => npcKnown(n.id));
        if (ns.length && S.npcs[ns[0].id]) {
          S.npcs[ns[0].id].aff = Math.min(100, (S.npcs[ns[0].id].aff || 0) + 3);
          toast('與' + ns[0].name + '閑話'); 
        } else toast('山風作伴，無人閑話');
      }
    } else if (m === 'canal') {
      if (act === 'load') {
        if (!needHp(4)) return;
        const g = 8 + Math.floor(Math.random() * 10) + (S.skills.trade || 0) * 2;
        S.gold += g; bump('lu', 1); S.flags = S.flags || {}; S.flags.canal_load = 1;
        toast('裝船 +' + g + '銀'); markNpcKnown('zhao', '碼頭');
      } else if (act === 'rumor') {
        if (!needHp(2)) return;
        toast('漕謠：關東要糧'); pushStory('碼頭艄公說關東急徵軍糧。', 'nar');
      }
    } else if (m === 'bridge') {
      if (act === 'gaze') {
        S.hp = Math.min(S.maxHp, S.hp + 6); toast('憑欄遠望'); 
      } else if (act === 'meet') {
        if (!needHp(2)) return;
        gardenMeet(); return;
      } else if (act === 'toll') {
        if (!needHp(3)) return;
        S.gold += 5; bump('qin', 1); toast('助守橋 +5銀');
      }

    } else if (m === 'terraces') {
      if (act === 'help') {
        if (!needHp(3)) return;
        addBag('rice', 1); S.food += 1; toast('助耕得稻'); bump('people', 1);
      } else if (act === 'gaze') { S.hp = Math.min(stats().maxHp, S.hp + 8); toast('觀稼心安'); }
      else if (act === 'meet') { if (!needHp(2)) return; gardenMeet(); return; }
    } else if (m === 'iron_league') {
      if (act === 'trial') {
        if (window.QianPlots && !S.seenEvents.iron_trial) {
          S.flags = S.flags || {}; S.flags.visited_iron_league = 1;
          const ev = window.QianPlots.poll(S);
          if (ev && ev.id === 'iron_trial') { S.pendingEvent = ev; openEventModal(ev); return; }
        }
        toast('坊主曰：他日再試'); bump('fame', 1);
      } else if (act === 'sparks') {
        if (!needHp(3)) return;
        S.skills.craft = Math.min(8, (S.skills.craft || 0) + (Math.random() < 0.5 ? 1 : 0));
        S.gold += 4; S.flags = S.flags || {}; S.flags.forge_sparks = 1; toast('鐵盟幫錘');
      }
    } else if (m === 'stargaze') {
      S.plotFlags = S.plotFlags || {}; S.plotFlags.stargaze = 1; S.flags = S.flags || {}; S.flags.visited_stargaze = 1;
      if (act === 'star') {
        if (!needHp(2)) return;
        if (!S.attrs) S.attrs = {}; S.attrs.yun = (S.attrs.yun || 0) + (Math.random() < 0.4 ? 1 : 0);
        toast('觀星 · 氣運微動');
      } else if (act === 'well') { S.hp = Math.min(stats().maxHp, S.hp + 10); toast('臨井清心'); }
      else if (act === 'ask') {
        if (!needGold(5)) return;
        if (!S.attrs) S.attrs = {}; S.attrs.zhi = (S.attrs.zhi || 0) + (Math.random() < 0.35 ? 1 : 0);
        toast('方士指點 · 智計');
      }
    } else if (m === 'poplar' || m === 'dragon_bridge' || m === 'garden_water' || m === 'rain_hut' || m === 'brewery') {
      if (m === 'rain_hut') { S.flags = S.flags || {}; S.flags.rain_hut = 1; }
      if (m === 'garden_water' && (act === 'gaze' || act === 'meet' || act === 'boat' || act === 'shade')) {
        S.flags = S.flags || {}; S.flags.garden_walk = 1;
      }
      if (act === 'shade' || act === 'gaze' || act === 'listen' || act === 'meditate' || act === 'well') {
        S.hp = Math.min(stats().maxHp, S.hp + 8); toast('稍憩回體');
      } else if (act === 'meet' || act === 'chat') {
        if (!needHp(2)) return; gardenMeet(); return;
      } else if (act === 'scout' || act === 'toll' || act === 'load' || act === 'help') {
        if (!needHp(act === 'scout' ? 4 : 3)) return;
        S.gold += 4 + Math.floor(Math.random() * 5); toast('奔走得銀');
      } else if (act === 'drink') {
        if (!needGold(3)) return; S.hp = Math.min(stats().maxHp, S.hp + 12); toast('酒暖');
      } else if (act === 'write') {
        if (!needHp(2)) return; S.skills.lit = Math.min(8, (S.skills.lit || 0) + 1); toast('雨中書 · 文');
      } else if (act === 'boat') {
        if (!needGold(4)) return;
        if (!S.attrs) S.attrs = {}; S.attrs.yun = (S.attrs.yun || 0) + (Math.random() < 0.3 ? 1 : 0);
        toast('池上舟');
      } else if (act === 'rumor' || act === 'gossip') {
        if (!needHp(2)) return; toast('聽得一則江湖謠');
      }
    } else if (m === 'canal_hq') {
      if (act === 'load') { if (!needHp(4)) return; S.gold += 8; bump('lu', 1); S.flags = S.flags || {}; S.flags.canal_load = 1; toast('總壇裝船'); }
      else if (act === 'rumor') { if (!needHp(2)) return; toast('漕幫密語'); }
    } else if (m === 'tea_master' || m === 'rainy_tea') {
      if (act === 'sip') {
        if (!needGold(m === 'tea_master' ? 5 : 4)) return;
        S.hp = Math.min(stats().maxHp, S.hp + 12); bump('fame', 1);
        S.flags = S.flags || {}; S.flags.tea_sip = 1; toast('好茶回體');
      } else if (act === 'learn') {
        if (!needHp(3)) return;
        if (!S.attrs) S.attrs = {}; S.attrs.bian = (S.attrs.bian || 0) + (Math.random() < 0.4 ? 1 : 0);
        toast('學茶 · 辯才');
      } else if (act === 'gossip') { if (!needHp(2)) return; toast('茶語一陣'); }
      else if (act === 'tip') { if (!needGold(6)) return; bump('fame', 2); toast('賞茶博士'); }
    } else if (m === 'sword_wash') {
      if (act === 'wash') {
        if (!needHp(2)) return;
        if (!S.attrs) S.attrs = {}; if (Math.random() < 0.35) S.attrs.wu = (S.attrs.wu || 0) + 1;
        toast('浣劍 · 刃心微明');
      } else if (act === 'meditate') { S.hp = Math.min(stats().maxHp, S.hp + 10); toast('面水靜坐'); }
      else if (act === 'spar') { if (!needHp(5)) return; startBattle('drill'); return; }
    } else if (m === 'paper' || m === 'dye' || m === 'ink_pool' || m === 'pharmacy') {
      if (act === 'dry' || act === 'hang') {
        if (!needHp(2)) return; S.gold += 5; if (m === 'paper') S.skills.lit = Math.min(8, (S.skills.lit || 0) + 1);
        toast('完工得銀');
      } else if (act === 'ink' || act === 'copy') {
        if (!needHp(act === 'copy' ? 3 : 2)) return;
        if (!S.attrs) S.attrs = {};
        if (act === 'ink') { S.attrs.zhi = (S.attrs.zhi || 0) + (Math.random() < 0.3 ? 1 : 0); S.skills.lit = Math.min(8, (S.skills.lit || 0) + 1); }
        else S.attrs.bian = (S.attrs.bian || 0) + (Math.random() < 0.3 ? 1 : 0);
        toast(act === 'ink' ? '研墨' : '臨帖');
      } else if (act === 'buy') {
        if (m === 'pharmacy') { if (!needGold(12)) return; addBag('potion', 1); toast('買得回春散'); }
        else { if (!needGold(8)) return; addBag('flower', 2); toast('買箋花飾'); }
      } else if (act === 'learn') {
        if (!needHp(3)) return;
        if (m === 'pharmacy') S.skills.med = Math.min(8, (S.skills.med || 0) + 1);
        else S.skills.craft = Math.min(8, (S.skills.craft || 0) + 1);
        toast('學藝有進');
      } else if (act === 'gaze') { S.hp = Math.min(stats().maxHp, S.hp + 8); toast('稍憩'); }
    }

    if (window.QianStory) window.QianStory.checkStoryQuests(S).forEach((q) => toast('差事完成：' + q.title));
    renderBeauty(m); renderHUD(); saveQuiet();
  }

  function autoBeautyStep(m) {
    const conf = BEAUTY_PANEL[m];
    if (!conf) return;
    if (CRAFT_MODES.includes(m) && Math.random() < 0.45) {
      const rs = RECIPES.filter((r) => r.scene === m && craftMissing(r).length === 0);
      if (rs.length) { doCraft(rs[Math.floor(Math.random() * rs.length)].id); renderBeauty(m); return; }
    }
    const a = conf.acts[Math.floor(Math.random() * conf.acts.length)];
    if (a.id !== 'craft') doBeautyAct(m, a.id);
  }

  function maybeNpcAIPolish(summary) {
    if (!summary || !window.QianAI || !window.QianAI.ready()) return;
    if (S._npcAiPolishing) return;
    S._npcAiPolishing = true;
    const prompt = window.QianNpcAI.aiPrompt(S, summary);
    window.QianAI.call([{ role: 'user', content: prompt }], { maxTok: 120, timeout: 25 }).then((res) => {
      S._npcAiPolishing = false;
      const txt = res && res.text;
      if (!txt) return;
      const line = String(txt).replace(/\s+/g, ' ').trim().slice(0, 80);
      if (line && S.npcAI && S.npcAI.log && S.npcAI.log[0]) {
        S.npcAI.log[0].text = line;
        pushStory('〔AI潤色動向〕' + line, 'sys');
      }
    }).catch(() => { S._npcAiPolishing = false; });
  }


  /* ---- Settings UI ---- */
  function openSettings() {
    const AI = window.QianAI;
    const SET = AI.getSet();
    $('set-provider').value = SET.preset || 'deepseek';
    fillModels();
    $('set-model').value = SET.model;
    $('set-key').value = SET.key || '';
    $('set-base').value = SET.base || '';
    $('set-ai-on').checked = !!SET.ai;
    $('set-base-wrap').hidden = SET.preset !== 'custom';
    $('ai-test-result').textContent = '';
    $('modal-settings').hidden = false;
  }
  function fillModels() {
    const AI = window.QianAI;
    const SET = AI.getSet();
    const p = AI.presets[SET.preset] || AI.presets.deepseek;
    const sel = $('set-model');
    if (SET.preset === 'deepseek' || (p.models && p.models.length)) {
      sel.innerHTML = (p.models.length ? p.models : ['deepseek-chat']).map((m) =>
        '<option value="' + m + '">' + m + '</option>').join('');
    } else {
      sel.innerHTML = '<option value="' + (SET.model || '') + '">' + (SET.model || '自訂') + '</option>';
    }
  }
  function applySettingsFromUI() {
    const AI = window.QianAI;
    const SET = AI.getSet();
    SET.preset = $('set-provider').value;
    AI.applyPreset(SET.preset);
    SET.model = $('set-model').value || SET.model;
    SET.key = $('set-key').value.trim();
    if (SET.preset === 'custom') SET.base = $('set-base').value.trim();
    SET.ai = $('set-ai-on').checked;
    AI.save();
  }
  function saveSettingsFromUI() {
    applySettingsFromUI();
    toast('設定已存');
    $('modal-settings').hidden = true;
  }


  /* ---- Qin court / map panels ---- */
  const QIN_PANEL = {
    xianyang: {
      blurb: '咸陽：秦都街巷。可聽詔、投刺求見、觀市口風向。',
      acts: [
        { id: 'listen', label: '聽詔', tip: '體力-2 · 聞朝議' },
        { id: 'card', label: '投刺', tip: '銀8 · 名↑' },
        { id: 'watch', label: '觀市口', tip: '打聽勢力' }
      ]
    },
    palace: {
      blurb: '宮城外：衛士森嚴。可打聽王位、投書、慎與衛士周旋。',
      acts: [
        { id: 'rumor', label: '打聽王位', tip: '體力-3' },
        { id: 'letter', label: '投書內廷', tip: '銀12 · 秦廷↑' },
        { id: 'guard', label: '與衛士話', tip: '體力-2 · 或得罪' }
      ]
    },
    xiangbang: {
      blurb: '相邦府：呂不韋門下。拜謁、貨殖請託、門客清談。',
      acts: [
        { id: 'visit', label: '拜謁', tip: '體力-3 · 呂黨↑' },
        { id: 'trade', label: '貨殖請託', tip: '銀10 · 或得利' },
        { id: 'chat', label: '門客清談', tip: '體力-2 · 名↑' }
      ]
    },
    taihou: {
      blurb: '太后宮外：進貢討喜，打聽宮爭，勿多嘴。',
      acts: [
        { id: 'gift', label: '進貢', tip: '花/藥或銀' },
        { id: 'spy', label: '打聽宮爭', tip: '體力-3 · 險' },
        { id: 'quiet', label: '緘默退', tip: '民心微↑' }
      ]
    },
    guowei: {
      blurb: '國尉府：軍政文書處。報功、領差、習軍法。',
      acts: [
        { id: 'report', label: '報功', tip: '需勝場' },
        { id: 'duty', label: '領差', tip: '體力-4 · 銀' },
        { id: 'law', label: '習軍法', tip: '體力-3 · 武/文' }
      ]
    },
    keguan: {
      blurb: '客館：六國使者與賓客投宿。宴客、刺探、結交。',
      acts: [
        { id: 'banquet', label: '宴客', tip: '銀15 · 塞↑' },
        { id: 'probe', label: '刺探合縱', tip: '體力-3' },
        { id: 'befriend', label: '結賓客', tip: '體力-2 · 好感' }
      ]
    },
    guanshi: {
      blurb: '關市：校度量、征市租、邊貨互市。',
      acts: [
        { id: 'buy', label: '買邊貨', tip: '銀14 · 礦/花' },
        { id: 'sell', label: '售山貨', tip: '賣礦藥' },
        { id: 'tax', label: '助市吏', tip: '體力-3 · 秦↑' }
      ]
    },
    hejin: {
      blurb: '河津：渡口與水工往來。渡船、問渠、運糧。',
      acts: [
        { id: 'ferry', label: '渡船', tip: '銀4 · 復體' },
        { id: 'canal', label: '問水工', tip: '體力-3 · 史跡' },
        { id: 'haul', label: '運糧', tip: '糧-2 · 銀' }
      ]
    },
    cimiao: {
      blurb: '祠廟：祈社稷、賽祭安民。',
      acts: [
        { id: 'pray', label: '祈福', tip: '銀5 · 民心' },
        { id: 'fest', label: '賽祭', tip: '銀10 · 名民' },
        { id: 'meditate', label: '靜思', tip: '體力-2 · 文' }
      ]
    },
    ying: {
      blurb: '軍營：操練、領餉差、與校場互補。可對練。',
      acts: [
        { id: 'drill', label: '營中操練', tip: '體力-4 · 武' },
        { id: 'pay', label: '領餉差', tip: '體力-3 · 銀' },
        { id: 'fight', label: '營內對練', tip: '開戰' }
      ]
    }
  };

  function renderQinPanel(m) {
    if (!S) return;
    const conf = QIN_PANEL[m];
    const blurb = $('qin-blurb');
    const acts = $('qin-acts');
    const meet = $('qin-meet');
    const stat = $('qin-stat');
    if (stat) stat.textContent = '體力 ' + S.hp + '/' + S.maxHp + ' · 銀' + S.gold;
    if (blurb && conf) blurb.textContent = conf.blurb;
    if (acts && conf) {
      acts.innerHTML = conf.acts.map((a) =>
        '<button type="button" class="btn' + (a.id === conf.acts[0].id ? ' primary' : '') + '" data-qin="' + m + '" data-act="' + a.id + '">' +
        a.label + '<small class="act-tip">' + a.tip + '</small></button>'
      ).join('');
      acts.querySelectorAll('[data-qin]').forEach((b) => {
        b.addEventListener('click', () => doQinAct(b.dataset.qin, b.dataset.act));
      });
    }
    if (meet) {
      storyEnsure();
      let allHere = allNpcs().filter((n) => n.meet === m && (!n.unlockDay || (S.day||1) >= n.unlockDay));
      if (window.QianNpcAI) {
        const aiHere = window.QianNpcAI.atLocation(S, m) || [];
        const seen = {};
        allHere.forEach((n) => { seen[n.id] = 1; });
        aiHere.forEach((n) => { if (!seen[n.id]) allHere.push(n); });
      }
      if (!allHere.length) {
        meet.innerHTML = '<p class="tiny muted">此處暫無面孔，可至人脈找秦人。</p>';
      } else {
        meet.innerHTML = '<div class="panel-h-row"><span class="panel-h">可見之人</span><span class="tiny">' + allHere.length + '人影</span></div>' +
          '<div class="face-grid">' + allHere.map((n) => {
            if (!npcKnown(n.id)) {
              return '<button type="button" class="face-cell unknown" data-meet-unk="' + n.id + '"><span class="face-q">？</span><span>？？？</span><span class="tiny muted">未識</span></button>';
            }
            const aff = (S.npcs[n.id] && S.npcs[n.id].aff) || 0;
            return '<button type="button" class="face-cell" data-meet-npc="' + n.id + '">' +
              faceThumbHtml(npcFaceKey(n), n.name) + '<span>' + n.name + '</span><span class="tiny muted">' + n.role + ' ·' + aff + '</span></button>';
          }).join('') + '</div>';
        meet.querySelectorAll('[data-meet-npc]').forEach((b) => {
          b.addEventListener('click', () => { tapFeel(b); selectedNpc = b.dataset.meetNpc; openTalk(); });
        });
        meet.querySelectorAll('[data-meet-unk]').forEach((b) => {
          b.addEventListener('click', () => toast('尚未相識——完成相關劇情或進入此處方能見面'));
        });
      }
    }
  }

  function doQinAct(m, act) {
    if (!S || battle) { toast(battle ? '戰鬥中' : '…'); return; }
    const bump = (k, n) => { if (window.QianFactions) window.QianFactions.bump(S, k, n); };
    const diverge = (id, note) => { if (window.QianWorld) window.QianWorld.markDiverge(S, id, note); };
    const needHp = (n) => { if (S.hp < n) { toast('體力不足'); return false; } S.hp -= n; return true; };
    const needGold = (n) => { if (S.gold < n) { toast('銀不足'); return false; } S.gold -= n; return true; };

    if (m === 'xianyang') {
      if (act === 'listen') {
        if (!needHp(2)) return;
        const lines = ['內史清查編戶。', '相邦府夜宴門客。', '少年王問邊關糧草。', '六國使團將至客館。'];
        const L = lines[(S.day + act.length) % lines.length];
        bump('fame', 1); toast('聽得：' + L); pushStory('咸陽街口：' + L, 'nar');
      } else if (act === 'card') {
        if (!needGold(8)) return;
        bump('fame', 3); bump('qin', 1); toast('投刺求見 · 名聲↑'); pushStory('你投刺於府門，小吏記下名字。', 'nar');
      } else if (act === 'watch') {
        if (!needHp(2)) return;
        const top = ['lu', 'qin', 'sai'].slice().sort((a, b) => (S.factions[b]||0) - (S.factions[a]||0))[0];
        const names = { lu: '呂黨', qin: '王府', sai: '邊市' };
        toast('市口多議' + names[top]); pushStory('咸陽市口，人多議「' + names[top] + '」風向。', 'nar');
      }
    } else if (m === 'palace') {
      if (act === 'rumor') {
        if (!needHp(3)) return;
        bump('qin', 1); toast('聞宮中語'); pushStory('宮牆外有人竊語：王年雖幼，目光已漸利。', 'nar');
        markNpcKnown('yingzheng', '宮外傳聞');
      } else if (act === 'letter') {
        if (!needGold(12)) return;
        bump('qin', 4); bump('fame', 2); toast('投書內廷'); pushStory('一封書信送入內廷——不知是否有人拆閱。', 'nar');
        diverge('qin_rule', '你向王府投書，加速親政傳聞');
      } else if (act === 'guard') {
        if (!needHp(2)) return;
        if (Math.random() < 0.55) { bump('qin', 2); toast('衛士點頭'); }
        else { bump('qin', -1); S.hp = Math.max(1, S.hp - 4); toast('衛士不悅 · 被喝退'); }
        pushStory('你與宮門衛士搭話。', 'nar');
      }
    } else if (m === 'xiangbang') {
      if (act === 'visit') {
        if (!needHp(3)) return;
        bump('lu', 3); bump('fame', 1); toast('拜謁相邦府'); pushStory('相邦府門客引你入側廳，茶香與算盤聲並起。', 'nar');
        markNpcKnown('lubuwei', '拜謁'); markNpcKnown('menke', '拜謁');
      } else if (act === 'trade') {
        if (!needGold(10)) return;
        if (Math.random() < 0.6) { const w = 16 + Math.floor(Math.random()*12); S.gold += w; bump('lu', 2); toast('貨殖得利 +' + w); }
        else { toast('請託無果'); }
        pushStory('你在相邦府外圍做了一筆貨殖請託。', 'nar');
      } else if (act === 'chat') {
        if (!needHp(2)) return;
        bump('lu', 1); bump('fame', 1); toast('門客清談'); pushStory('舍人程賈與你清談「奇貨可居」。', 'nar');
      }
    } else if (m === 'taihou') {
      if (act === 'gift') {
        if (bagCount('flower') >= 1) { addBag('flower', -1); bump('lu', 2); bump('people', 1); toast('鮮花進貢'); }
        else if (bagCount('herb') >= 1) { addBag('herb', -1); bump('lu', 1); toast('草藥進貢'); }
        else if (needGold(10)) { bump('lu', 2); toast('銀帛進貢'); }
        else return;
        pushStory('你在太后宮外投下薄禮。', 'nar');
      } else if (act === 'spy') {
        if (!needHp(3)) return;
        if (Math.random() < 0.5) {
          bump('fame', 2); toast('聽得宮爭影'); S.flags.taihou_spy = 1;
          diverge('laoai', '你探得太后宮私門養士之風');
          pushStory('宮婢低聲：私門養士，漸與相邦府分庭。', 'nar');
          markNpcKnown('zhaoji', '宮爭傳聞');
        } else { bump('lu', -2); toast('險些惹禍'); pushStory('你打聽太過，被人冷眼逐出牆外。', 'nar'); }
      } else if (act === 'quiet') {
        bump('people', 1); toast('緘默而退'); pushStory('你拱手退開，不多一言。', 'nar');
      }
    } else if (m === 'guowei') {
      if (act === 'report') {
        if ((S.wins || 0) < 2) { toast('勝場不足，無可報'); return; }
        bump('qin', 3); bump('fame', 2); S.gold += 8; toast('報功獲賞 +8銀'); pushStory('國尉府小吏記下你的戰功。', 'nar');
      } else if (act === 'duty') {
        if (!needHp(4)) return;
        const g = 6 + Math.floor(Math.random() * 8); S.gold += g; bump('qin', 1); toast('領差得銀' + g);
        pushStory('你替國尉府跑了一趟文書差。', 'nar');
      } else if (act === 'law') {
        if (!needHp(3)) return;
        if (Math.random() < 0.5) S.skills.mart = Math.min(8, (S.skills.mart || 0) + 1);
        else S.skills.lit = Math.min(8, (S.skills.lit || 0) + 1);
        toast('習軍法有所得'); pushStory('尉府廊下，你研讀軍法殘篇。', 'nar');
      }
    } else if (m === 'keguan') {
      if (act === 'banquet') {
        if (!needGold(15)) return;
        bump('sai', 3); bump('fame', 2); bump('people', 1); toast('宴客成功'); S.flags.visited_keguan = 1;
        pushStory('客館夜宴，楚使與齊客舉杯。', 'nar');
        markNpcKnown('changping', '宴客'); markNpcKnown('chu_envoy', '宴客');
      } else if (act === 'probe') {
        if (!needHp(3)) return;
        bump('sai', 1); bump('fame', 1); toast('刺探合縱傳聞');
        diverge('six_states', '你介入六國合縱傳聞的傳播');
        pushStory('你從使團隨員口中套得合縱隻言片語。', 'nar');
      } else if (act === 'befriend') {
        if (!needHp(2)) return;
        const guests = liveNpcs().filter((n) => n.meet === 'keguan');
        const n = guests[Math.floor(Math.random() * Math.max(1, guests.length))] || liveNpcs()[0];
        if (n && S.npcs[n.id]) S.npcs[n.id].aff = Math.min(100, (S.npcs[n.id].aff || 0) + 4);
        toast('結識' + (n ? n.name : '賓客')); pushStory('客館廊下，你與賓客交換名刺。', 'nar');
      }
    } else if (m === 'guanshi') {
      if (act === 'buy') {
        if (!needGold(14)) return;
        addBag('ore', 2); addBag('flower', 1); toast('買得邊貨'); pushStory('關市上你購下皮毛換來的礦與花。', 'nar');
      } else if (act === 'sell') {
        let g = 0;
        if (bagCount('ore') >= 1) { const n = Math.min(3, bagCount('ore')); addBag('ore', -n); g += n * 7; }
        if (bagCount('herb') >= 1) { const n = Math.min(2, bagCount('herb')); addBag('herb', -n); g += n * 5; }
        if (!g) { toast('無山貨可售'); return; }
        S.gold += g; S.soldGold += g; bump('lu', 1); bump('sai', 1); toast('售出 +' + g + '銀'); S.flags.guanshi_deal = 1;
        markNpcKnown('guren', '關市交易'); markNpcKnown('shili', '關市');
      } else if (act === 'tax') {
        if (!needHp(3)) return;
        bump('qin', 2); S.gold += 4; toast('助市吏 · +4銀'); pushStory('你協助市吏校秤半日。', 'nar');
      }
    } else if (m === 'hejin') {
      if (act === 'ferry') {
        if (!needGold(4)) return;
        S.hp = Math.min(S.maxHp, S.hp + 10); toast('渡船歇息'); pushStory('津渡船搖，河風吹散疲憊。', 'nar');
      } else if (act === 'canal') {
        if (!needHp(3)) return;
        bump('fame', 1); bump('people', 1); toast('聞渠議');
        diverge('zhengguo', '你過問鄭國渠議，影響農田輿論'); S.flags.canal_ask = 1;
        pushStory('水工言：渠成則關中畝產可倍——亦或疲民。', 'nar');
        markNpcKnown('zhengguo', '問渠');
        if (S.npcs.zhengguo) S.npcs.zhengguo.aff = Math.min(100, (S.npcs.zhengguo.aff || 0) + 3);
      } else if (act === 'haul') {
        if (S.food < 2) { toast('存糧不足'); return; }
        S.food -= 2; const g = 10 + Math.floor(Math.random() * 8); S.gold += g; bump('qin', 1);
        toast('運糧得銀' + g); pushStory('你幫津吏運了一船糧。', 'nar');
      }
    } else if (m === 'cimiao') {
      if (act === 'pray') {
        if (!needGold(5)) return;
        bump('people', 3); toast('祈福 · 民心↑'); S.flags.cimiao_pray = 1; pushStory('祠廟香火，你默祝田稼平安。', 'nar');
      } else if (act === 'fest') {
        if (!needGold(10)) return;
        bump('people', 4); bump('fame', 2); toast('賽祭熱鬧'); pushStory('社祭鼓響，鄉鄰見你出銀，紛紛拱手。', 'nar');
      } else if (act === 'meditate') {
        if (!needHp(2)) return;
        if (Math.random() < 0.45) S.skills.lit = Math.min(8, (S.skills.lit || 0) + 1);
        toast('靜思片刻'); pushStory('你在祠階上閉目片刻，心神略定。', 'nar');
      }
    } else if (m === 'ying') {
      if (act === 'drill') {
        if (!needHp(4)) return;
        S.skills.mart = Math.min(8, (S.skills.mart || 0) + (Math.random() < 0.6 ? 1 : 0));
        bump('qin', 1); toast('營中操練'); pushStory('軍營校場，你隨卒伍出了數身汗。', 'nar');
      } else if (act === 'pay') {
        if (!needHp(3)) return;
        const g = 5 + Math.floor(Math.random() * 6); S.gold += g; bump('qin', 1); toast('餉差 +' + g);
        pushStory('軍候派你送一趟餉冊。', 'nar');
      } else if (act === 'fight') {
        startBattle('drill'); return;
      }
    }
    if (window.QianStory) window.QianStory.checkStoryQuests(S).forEach((q) => toast('差事完成：' + q.title));
    renderQinPanel(m); renderHUD(); saveQuiet();
  }


  /* ---- 陋室／探索層 ---- */
  function renderHut() {
    if (!S) return;
    const st = $('hut-stat');
    if (st) st.textContent = '體力 ' + S.hp + '/' + S.maxHp + ' · 糧' + S.food;
    const hint = $('hut-hint');
    if (hint) {
      hint.textContent = S.hp < Math.max(12, S.maxHp * 0.35)
        ? '體力偏低——建議立即歇息。'
        : '可免費歇息回體，或小憩半日（過半日）。';
    }
    const btnD = $('btn-hut-disguise');
    if (btnD) {
      const g = S.hero && S.hero.gender;
      const show = g === 'f' || g === 'm';
      btnD.hidden = !show;
      if (g === 'f') btnD.textContent = disguiseOn() ? '卸下男裝' : '更衣：女扮男裝';
      else if (g === 'm') btnD.textContent = disguiseFemaleOn() ? '卸下女裝' : '更衣：男扮女裝';
    }
    const blurb = $('hut-blurb');
    if (blurb) {
      if (disguiseOn()) blurb.textContent = '陋室燈下，男子裝束疊於床頭。外面仍當你是漢子。';
      else if (disguiseFemaleOn()) blurb.textContent = '陋室燈下，女衫與花鈿備妥。外面或當你是閨中人。';
      else blurb.textContent = '自家陋室。可免費歇息回體，亦可小憩半日。更衣扮相可改頭像。';
    }
  }
  function hutRest(full) {
    if (!S) return;
    if (battle) {
      autoOn = false; syncAutoUi();
      battleLockUntil = Date.now() + 2500;
      forceClearBattle();
      toast('回陋室 · 戰鬥已解除');
    }
    const st = stats();
    S.hp = st.maxHp;
    S.flags.hut_rest = 1;
    if (full) {
      /* 小憩：過半日 */
      S.day = (S.day || 1) + 0; // keep day but mark period advance via nextDay soft
      if (typeof nextDay === 'function' && Math.random() < 0.01) {}
      // advance half: consume 0 food sometimes restore food feel
      toast('小憩半日 · 體力已滿');
      pushStory('你回陋室躺下半日，醒來精神尚可。', 'nar');
      // light day progress without full nextDay penalties: bump chronicle chance tiny
      if (window.QianWorld && Math.random() < 0.2) window.QianWorld.tick(S);
    } else {
      toast('歇息完畢 · 體力已滿');
      pushStory('陋室一眠，氣力盡復。', 'nar');
    }
    if (window.QianStory) window.QianStory.checkStoryQuests(S).forEach((q) => toast('差事完成：' + q.title));
    renderHut(); renderHUD(); saveQuiet();
  }
  function hutNap() {
    if (!S) return;
    if (battle) {
      autoOn = false; syncAutoUi();
      battleLockUntil = Date.now() + 2500;
      forceClearBattle();
    }
    hutRest(true);
    // skip half day: call nextDay but refund food if nextDay ate
    const foodBefore = S.food;
    const dayBefore = S.day;
    if (typeof nextDay === 'function') {
      nextDay();
      // if nextDay consumed too much, soften: ensure at least foodBefore-1
      if (S.food < foodBefore - 1) S.food = Math.max(0, foodBefore - 1);
    }
    S.hp = stats().maxHp;
    toast('小憩過日 · 體力已滿');
    renderHut(); renderHUD();
  }
  function hutEat() {
    if (!S) return;
    if (S.food < 1) { toast('存糧不足'); return; }
    S.food -= 1;
    S.hp = Math.min(stats().maxHp, S.hp + 20);
    toast('進食 · 體力+20');
    renderHut(); renderHUD(); saveQuiet();
  }
  function toggleDisguise() {
    if (!S || !S.hero) return;
    const g = S.hero.gender;
    if (g === 'f') {
      if (disguiseOn()) {
        S.hero.disguise = null;
        toast('已卸男裝，恢復女裝');
        pushStory('你換回女裝。', 'sys');
      } else {
        S.hero.disguise = 'male';
        toast('女扮男裝 · 禁地門路略寬，然有識破之險');
        pushStory('你換上男子裝束，束髮改顏。', 'sys');
      }
    } else if (g === 'm') {
      if (disguiseFemaleOn()) {
        S.hero.disguise = null;
        toast('已卸女裝，恢復男裝');
        pushStory('你換回男子裝束。', 'sys');
      } else {
        S.hero.disguise = 'female';
        toast('男扮女裝 · 女眷／后宮外略易近，然有識破之險');
        pushStory('你換上女衫，改了眉目。', 'sys');
      }
    } else {
      toast('不顯性別者暫無更衣扮相');
      return;
    }
    renderHut();
    updateDisguiseMenu();
    syncBagDisguiseBtn();
    renderHUD();
    saveQuiet();
  }
  function disguiseBtnLabel() {
    if (!S || !S.hero) return '更衣扮相';
    if (S.hero.gender === 'f') return disguiseOn() ? '卸下男裝' : '女扮男裝';
    if (S.hero.gender === 'm') return disguiseFemaleOn() ? '卸下女裝' : '男扮女裝';
    return '更衣扮相';
  }
  function updateDisguiseMenu() {
    const b = $('btn-toggle-disguise');
    if (!b || !S || !S.hero) return;
    const g = S.hero.gender;
    b.hidden = !(g === 'f' || g === 'm');
    if (!b.hidden) b.textContent = disguiseBtnLabel();
  }
  function syncBagDisguiseBtn() {
    const b = $('btn-bag-disguise');
    if (!b || !S || !S.hero) return;
    const g = S.hero.gender;
    b.hidden = !(g === 'f' || g === 'm');
    if (!b.hidden) b.textContent = disguiseBtnLabel();
  }
  function exploreDeeper(where) {
    if (!S || battle) { toast(battle ? '戰鬥中' : ''); return; }
    storyEnsure();
    if (!S.explore) S.explore = { ruins: 1, crypt: 1, marsh: 1, ruinsBest: 0, cryptBest: 0, marshBest: 0, bosses: {} };
    S.explore[where] = (S.explore[where] || 1) + 1;
    toast('深入' + (MODE_LABELS[where] || '') + ' 層' + S.explore[where]);
    renderCombatPanel(); saveQuiet();
  }

  /* ---- Screens (exclusive stack; never overlay title on dash) ---- */
  const SCREEN_IDS = ['screen-title', 'screen-create', 'screen-career', 'screen-game'];
  function showScreen(id) {
    SCREEN_IDS.forEach((sid) => {
      const el = $(sid);
      if (!el) return;
      const on = sid === id;
      el.hidden = !on;
      if (on) {
        el.removeAttribute('hidden');
        el.classList.add('on');
      } else {
        el.setAttribute('hidden', '');
        el.classList.remove('on');
      }
    });
    if ($('app')) $('app').classList.remove('dash-live');
  }
  function showTitle() {
    showScreen('screen-title');
    closeSheets();
    try { closeStoryModal(); } catch (e) {}
    if ($('btn-continue')) $('btn-continue').hidden = !hasSave();
  }
  function showCreate() {
    showScreen('screen-create');
    fillCreateForm();
  }
  function fillCreateForm() {
    const d = window.__createDraft || { name: '豆豆', gender: 'x', origin: 'farm', goal: '', worldMode: 'history' };
    window.__createDraft = d;
    if ($('create-name')) $('create-name').value = d.name || '';
    if ($('create-goal')) $('create-goal').value = d.goal || '';
    document.querySelectorAll('[data-gender]').forEach((b) => b.classList.toggle('active', b.dataset.gender === d.gender));
    document.querySelectorAll('[data-origin]').forEach((b) => b.classList.toggle('active', b.dataset.origin === d.origin));
    document.querySelectorAll('[data-wmode]').forEach((b) => b.classList.toggle('active', b.dataset.wmode === d.worldMode));
    if ($('disguise-field')) $('disguise-field').hidden = d.gender !== 'f';
    if ($('create-disguise')) $('create-disguise').checked = !!d.disguise;
    if ($('disguise-m-field')) $('disguise-m-field').hidden = d.gender !== 'm';
    if ($('create-disguise-m')) $('create-disguise-m').checked = !!d.disguiseM;
    const og = $('origin-grid');
    if (og && window.QianWorld && !og.dataset.ready) {
      og.innerHTML = window.QianWorld.ORIGINS.map((o) =>
        '<button type="button" class="chip-card' + (d.origin === o.id ? ' active' : '') + '" data-origin="' + o.id + '">' +
        '<strong>' + o.name + '</strong><span>' + o.desc + '</span></button>'
      ).join('');
      og.dataset.ready = '1';
      og.querySelectorAll('[data-origin]').forEach((b) => {
        b.addEventListener('click', (ev) => {
          tapFeel(b, ev);
          window.__createDraft.origin = b.dataset.origin;
          og.querySelectorAll('[data-origin]').forEach((x) => x.classList.toggle('active', x === b));
        });
      });
      bindTapFeel(og);
    }
  }
  function readCreateDraft() {
    const d = window.__createDraft || {};
    d.name = (($('create-name') && $('create-name').value.trim()) || '旅人').slice(0, 8);
    d.goal = (($('create-goal') && $('create-goal').value.trim()) || '').slice(0, 24);
    d.gender = d.gender || 'x';
    d.origin = d.origin || 'tradoc';
    d.worldMode = d.worldMode || 'history';
    d.disguise = !!(d.gender === 'f' && $('create-disguise') && $('create-disguise').checked);
    d.disguiseM = !!(d.gender === 'm' && $('create-disguise-m') && $('create-disguise-m').checked);
    window.__createDraft = d;
    return d;
  }
  function showCareer() {
    readCreateDraft();
    showScreen('screen-career');
    const grid = $('career-grid');
    const blurb = $('career-blurb');
    if (blurb && window.__createDraft) {
      const o = window.QianWorld ? window.QianWorld.originById(window.__createDraft.origin) : { name: '農家' };
      const g = window.__createDraft.gender === 'm' ? '男' : (window.__createDraft.gender === 'f' ? '女' : '不顯');
      blurb.textContent = '秦王政元年。' + window.__createDraft.name + '（' + g + '·' + o.name + '）——汝欲以何業立足？' +
        (window.__createDraft.worldMode === 'free' ? '〔高度自由〕' : '〔史實軌道〕');
    }
    const draft = window.__createDraft || {};
    const strip = [
      ['farmer_m','農夫'],['doctor','醫者'],['merchant','商賈'],['soldier','武卒'],
      ['craftsman','工匠'],['hunter','獵戶'],['ranger','遊俠']
    ].map(function (pair) {
      return '<figure><img src="assets/char_' + pair[0] + '.webp' + ASSET_V + '" alt=""><figcaption>' + pair[1] + '</figcaption></figure>';
    }).join('');
    grid.innerHTML = '<div class="career-strip-embed" aria-hidden="true">' + strip + '</div>' +
      Object.values(CAREERS).map((c) => {
        const ck = careerCharKey(c.id, draft.gender);
        return '<button type="button" class="career-card" data-career="' + c.id + '">' +
          '<img class="career-art" src="assets/char_' + ck + '.webp' + ASSET_V + '" alt="" decoding="async">' +
          '<div class="career-body"><h3>' + c.name + '</h3><p>' + c.desc + '</p>' +
          '<div class="stats">銀' + c.gold + ' · 糧' + c.food + ' · HP' + c.hp + ' · ATK' + c.atk + '</div></div></button>';
      }).join('');
    grid.querySelectorAll('[data-career]').forEach((b) => {
      b.addEventListener('click', (ev) => { tapFeel(b, ev); startGame(b.dataset.career); });
    });
    bindTapFeel(grid);
  }
  function startGame(careerId) {
    readCreateDraft();
    S = newState(careerId);
    autoOn = false;
    directive = 'grain';
    mode = 'hut';
    refreshNpcs();
    showScreen('screen-game');
    document.querySelectorAll('.dir').forEach((d) => d.classList.toggle('active', d.dataset.dir === directive));
    if ($('screen-game')) {
      $('screen-game').classList.remove('dash-mode');
      $('screen-game').classList.add('vn-text-mode');
    }
    if ($('app')) $('app').classList.remove('dash-live');
    updateDisguiseMenu();
    const h = S.hero || {};
    const o = window.QianWorld ? window.QianWorld.originById(h.origin) : { name: '' };
    const modeTxt = S.worldMode === 'free' ? '高度自由世界' : '史實軌道';
    status('秦王政元年。你是' + (h.name || '旅人') + '，出身' + (o.name || '') + '，以' + CAREERS[careerId].name + '立足墨夢。（' + modeTxt + '）' +
      (h.disguise === 'male' ? '女扮男裝潛行江湖。' : (h.disguise === 'female' ? '男扮女裝行走江湖。' : '')) + '點選劇情選項，改寫人物關係與結局。');
    toast('開局 · 文字劇情 · ' + CAREERS[careerId].name + (h.disguise === 'male' ? ' · 男裝' : (h.disguise === 'female' ? ' · 女裝' : '')));
    if (window.QianStoryFlow) {
      window.QianStoryFlow.begin(S);
      applyStoryScene();
      renderStoryPanel();
    }
    saveQuiet();
    renderHUD();
  }
  function continueGame() {
    if (!load()) { toast('無存檔'); return; }
    showScreen('screen-game');
    document.querySelectorAll('.dir').forEach((d) => d.classList.toggle('active', d.dataset.dir === directive));
    refreshNpcs();
    if ($('screen-game')) {
      $('screen-game').classList.remove('dash-mode');
      $('screen-game').classList.add('vn-text-mode');
    }
    if ($('app')) $('app').classList.remove('dash-live');
    updateDisguiseMenu();
    toast('繼續 · ' + dayStr());
    pushStory('續寫 · ' + dayStr(), 'sys');
    if (S.worldLine) pushStory('天下大勢：' + S.worldLine, 'sys');
    if (window.QianStoryFlow) {
      window.QianStoryFlow.ensure(S);
      if (!S.storyFlow.started || !S.storyFlow.nodeId) {
        window.QianStoryFlow.begin(S, { fromSave: true });
      } else {
        window.QianStoryFlow.begin(S, { resume: true });
      }
      applyStoryScene();
      renderStoryPanel();
    }
    setTimeout(maybeTriggerVisit, 600);
    renderHUD();
  }

  function toggleAuto() {
    autoOn = !autoOn;
    renderHUD();
    toast(autoOn ? 'AUTO 開' : 'AUTO 關');
  }


  /* ---- v35 文字劇情面板 ---- */
  const CHAPTER_LABEL = {
    prologue: '序·墨夢',
    ch1: '一·備廷',
    ch2: '二·驛道',
    xianyang: '三·咸陽',
    court: '四·近側',
    resume: '續卷'
  };
  function applyStoryScene() {
    if (!S || !window.QianStoryFlow) return;
    const bg = window.QianStoryFlow.sceneFor(S) || 'hut';
    try {
      mode = bg;
      if (typeof setSceneArt === 'function') setSceneArt(bg);
      if ($('place-chip-label')) $('place-chip-label').textContent = (MODE_LABELS && MODE_LABELS[bg]) || bg;
      const scene = $('adventure-scene');
      if (scene) {
        scene.classList.remove('mode-farm', 'mode-work', 'in-battle');
      }
      /* 文遊模式隱藏所有操作面板 */
      if (typeof ALL_MODES !== 'undefined') {
        ALL_MODES.forEach((id) => {
          const el = $(id + '-panel');
          if (el) el.hidden = true;
        });
      }
      if ($('qin-shared-panel')) $('qin-shared-panel').hidden = true;
      if ($('beauty-shared-panel')) $('beauty-shared-panel').hidden = true;
      const plot = $('plot-card');
      if (plot) plot.style.display = 'none';
    } catch (e) {}
  }
  function renderStoryPanel() {
    if (!S || !window.QianStoryFlow) return;
    window.QianStoryFlow.ensure(S);
    const node = window.QianStoryFlow.getNode(S);
    const panel = $('story-panel');
    const textEl = $('story-text');
    const sp = $('story-speaker');
    const ch = $('story-chapter');
    const box = $('story-choices');
    if (!panel || !textEl || !box) return;
    if (!node) {
      textEl.textContent = '（劇情未載入）';
      box.innerHTML = '';
      return;
    }
    if (ch) ch.textContent = CHAPTER_LABEL[node.chapter] || node.chapter || '劇情';
    if (sp) sp.textContent = node.speaker || '旁白';
    textEl.textContent = node.text || '';
    const choices = window.QianStoryFlow.visibleChoices(S);
    box.innerHTML = choices.map((c) =>
      '<button type="button" class="btn story-choice' + (c.locked ? ' locked' : '') + '" data-sid="' + c.id + '"' +
      (c.locked ? ' disabled aria-disabled="true"' : '') + '>' + escapeHtml(c.text) + '</button>'
    ).join('');
    box.querySelectorAll('[data-sid]').forEach((b) => {
      b.addEventListener('click', (ev) => {
        tapFeel(b, ev);
        if (b.disabled) { toast('條件不足'); return; }
        pickStoryChoice(b.dataset.sid);
      });
    });
    bindTapFeel(box);
    const np = $('np-name');
    if (np) np.textContent = node.speaker || '旁白';
    applyStoryScene();
    syncDashStoryInline();
  }
  function syncDashStoryInline() {
    if (!S || !window.QianStoryFlow) return;
    window.QianStoryFlow.ensure(S);
    const node = window.QianStoryFlow.getNode(S);
    const ch = $('dash-story-chapter');
    const sp = $('dash-story-speaker');
    const textEl = $('dash-story-text');
    const box = $('dash-story-choices');
    if (!textEl || !box) return;
    if (!node) {
      textEl.textContent = '（劇情未載入）';
      box.innerHTML = '';
      return;
    }
    if (ch) ch.textContent = CHAPTER_LABEL[node.chapter] || node.chapter || '劇情';
    if (sp) sp.textContent = node.speaker || '旁白';
    textEl.textContent = node.text || '';
    const choices = window.QianStoryFlow.visibleChoices(S);
    box.innerHTML = choices.map((c) =>
      '<button type="button" class="story-choice' + (c.locked ? ' locked' : '') + '" data-sid="' + c.id + '"' +
      (c.locked ? ' disabled aria-disabled="true"' : '') + '>' + escapeHtml(c.text) + '</button>'
    ).join('');
    box.querySelectorAll('[data-sid]').forEach((b) => {
      b.addEventListener('click', (ev) => {
        tapFeel(b, ev);
        if (b.disabled) { toast('條件不足'); return; }
        pickStoryChoice(b.dataset.sid);
      });
    });
    bindTapFeel(box);
  }
  function flagLine(S0) {
    const pf = (S0 && S0.plotFlags) || {};
    return Object.keys(pf).filter((k) => pf[k]).slice(0, 14).map((k) => k + '=' + pf[k]).join('；');
  }
  function affLine(S0) {
    if (!S0 || !S0.npcs) return '';
    return Object.keys(S0.npcs).slice(0, 10).map((id) => id + ':' + Math.floor(S0.npcs[id].aff || 0)).join(' ');
  }
  async function applyStoryAiBeat(r) {
    const beatEl = $('story-ai-beat');
    const panel = $('story-panel');
    let host = beatEl;
    if (!host && panel) {
      host = document.createElement('div');
      host.id = 'story-ai-beat';
      host.className = 'story-ai-beat';
      const box = $('story-choices');
      if (box && box.parentNode) box.parentNode.insertBefore(host, box);
      else panel.appendChild(host);
    }
    if (!host) return;
    host.hidden = false;
    const AI = window.QianAI;
    const fate = window.QianArcs ? window.QianArcs.fateSummary(S) : '';
    if (AI && AI.ready() && AI.storyBeat) {
      host.textContent = '說書人沉吟中…';
      try {
        const out = await AI.storyBeat({
          choiceText: r.choiceText || '',
          nextLine: r.line || '',
          fateSummary: fate,
          flags: flagLine(S),
          affLine: affLine(S),
          mode: S.worldMode === 'free' ? '高度自由' : '史實軌道'
        });
        host.textContent = out.text;
        if (!S.readLog) S.readLog = [];
        S.readLog.push(out.text);
        if (S.readLog.length > 40) S.readLog = S.readLog.slice(-40);
      } catch (e) {
        host.textContent = (window.QianStoryFlow && window.QianStoryFlow.offlineBeat)
          ? window.QianStoryFlow.offlineBeat(S, r.choiceText, r.line)
          : '墨夢紀事又多了一筆。';
      }
    } else {
      host.textContent = (window.QianStoryFlow && window.QianStoryFlow.offlineBeat)
        ? window.QianStoryFlow.offlineBeat(S, r.choiceText, r.line)
        : '墨夢紀事又多了一筆。';
    }
    /* 邊玩邊學小注 */
    const tip = $('story-learn-tip');
    const d = ensureDash(S);
    const node = window.QianStoryFlow && window.QianStoryFlow.getNode(S);
    const tipText = (window.QianCodex && node) ? window.QianCodex.tipFor(node.id, !!d.tips) : '';
    if (tipText) {
      let el = tip;
      if (!el && panel) {
        el = document.createElement('div');
        el.id = 'story-learn-tip';
        el.className = 'read-tip';
        panel.appendChild(el);
      }
      if (el) { el.hidden = false; el.textContent = tipText; }
    } else if (tip) tip.hidden = true;
  }
  function pickStoryChoice(choiceId) {
    if (!S || !window.QianStoryFlow) return;
    const r = window.QianStoryFlow.applyChoice(S, choiceId);
    if (!r || !r.ok) {
      toast((r && r.toast) || '無法選擇');
      try { juiceShake(0.15); } catch (e) {}
      return;
    }
    if (r.toast) toast(r.toast);
    if (r.line) {
      pushStory((r.speaker ? '【' + r.speaker + '】' : '') + r.line.replace(/\n/g, ' '), 'nar');
      status(r.line.split('\n')[0]);
    }
    try { juiceShake(0.18); } catch (e) {}
    if (r.advance === 'period' || r.advance === 'day') {
      try {
        if (r.advance === 'day') {
          let guard = 0;
          const day0 = S.day;
          while (guard++ < 6) {
            nextDay();
            if (S.day !== day0) break;
          }
        } else {
          nextDay();
        }
      } catch (e) {}
    }
    pushDashLog('story', (r.line || '選擇推進').split('\n')[0], { noise: false });
    renderStoryPanel();
    renderHUD();
    applyStoryAiBeat(r);
    saveQuiet();
    if (r.pollArc || (S.flags && (S.flags.poll_arc || S.flags.want_arc))) {
      S.flags.poll_arc = 0;
      S.flags.want_arc = 0;
      setTimeout(maybeTriggerVisit, 280);
    }
  }

  /* ---- v36 儀表板 ---- */
  function gameMonth(day) {
    return Math.max(1, Math.ceil((day || 1) / 10));
  }
  function ensureDash(S0) {
    if (!S0.dash) S0.dash = { filterNoise: false, x2: false, realm: 'home', col: 'story', tips: false, parallel: false };
    if (S0.dash.tips == null) S0.dash.tips = false;
    if (S0.dash.parallel == null) S0.dash.parallel = false;
    if (!S0.dashLog) S0.dashLog = [];
    if (!S0.readLog) S0.readLog = [];
    return S0.dash;
  }
  function pushDashLog(kind, text, opts) {
    if (!S) return;
    ensureDash(S);
    const noise = !!(opts && opts.noise);
    S.dashLog.unshift({
      kind: kind || 'sys',
      text: String(text || '').slice(0, 120),
      day: S.day,
      month: gameMonth(S.day),
      period: S.period || '',
      noise: noise,
      at: Date.now()
    });
    if (S.dashLog.length > 80) S.dashLog = S.dashLog.slice(0, 80);
  }
  function openStoryModal() {
    /* v39：無 dash 殼時＝聚焦常駐劇情面板 */
    focusStoryPanel();
  }
  function closeStoryModal() {
    const panel = $('story-panel');
    const bd = $('dash-story-backdrop');
    if (panel) panel.classList.remove('dash-story-open');
    if (bd) { bd.classList.remove('on'); bd.hidden = true; }
  }
  function focusStoryPanel() {
    const panel = $('story-panel');
    if (panel) {
      panel.hidden = false;
      panel.classList.remove('dash-story-open');
      try { panel.scrollTop = 0; } catch (e) {}
      try { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { try { panel.scrollIntoView(true); } catch (e2) {} }
    }
    renderStoryPanel();
    toast('劇情');
  }
  function setDashCol(col) {
    if (!$('dash-col-story') && !$('dash-mobile-tabs')) return;
    if (!S) return;
    const d = ensureDash(S);
    d.col = col || 'story';
    document.querySelectorAll('.dash-mobile-tabs button').forEach((b) => {
      b.classList.toggle('on', b.dataset.col === d.col);
    });
    document.querySelectorAll('.dash-col').forEach((c) => {
      const id = c.getAttribute('data-col');
      c.classList.toggle('on', id === d.col);
    });
    if (d.col === 'story') {
      syncDashStoryInline();
    } else {
      try { closeStoryModal(); } catch (e) {}
    }
  }
  function dashRealmNpcs() {
    refreshNpcs();
    const realm = (S && S.dash && S.dash.realm) || 'home';
    const homeMeet = new Set([undefined, null, 'hut', 'farm', 'village', 'market', 'clinic', 'drill', 'wild', 'garden', 'swim', 'moon', 'mine', 'post', 'tavern', 'academy', 'wish', 'yard', 'study', 'forge', 'wood', 'incense', 'weave', 'persimmon', 'canal', 'bridge', 'terraces', 'tea', 'brewery', 'pharmacy', 'paper', 'dye', 'rain_hut', 'ink_pool', 'rainy_tea']);
    const courtMeet = new Set(['xianyang', 'palace', 'xiangbang', 'taihou', 'guowei', 'keguan', 'guanshi', 'hejin', 'cimiao', 'ying', 'frontier']);
    const cast = (window.QianWorld && window.QianWorld.castForTalk)
      ? window.QianWorld.castForTalk(S)
      : (window.QianWorld && window.QianWorld.CAST) || [];
    return cast.filter((n) => {
      if (!npcKnown(n.id) && !(S.npcs && S.npcs[n.id] && (S.npcs[n.id].aff || 0) > 0)) {
        /* still show village cores lightly known after day 1 */
        if ((S.day || 1) < 2 && !n.meet) return true;
        if (!n.meet && (S.day || 1) >= 1) return true;
        return false;
      }
      if (realm === 'court') return courtMeet.has(n.meet);
      return !n.meet || homeMeet.has(n.meet);
    }).slice(0, 16);
  }
  function renderDash() {
    if (!$('dash-shell') && !$('dash-col-story')) return; /* v39 無儀表板殼 */
    if (!S || !$('dash')) return;
    const d = ensureDash(S);
    const st = stats();
    const h = S.hero || {};
    const o = window.QianWorld ? window.QianWorld.originById(h.origin || 'farm') : { name: '出身' };
    const career = (CAREERS[S.career] || CAREERS.farmer);
    const placeRaw = (MODE_LABELS && MODE_LABELS[mode]) || '';
    const placeMap = { '鄉野': '近側', '陋室': '近側客館', '田莊': '驛館', '村落': '鄉亭' };
    const place = placeMap[placeRaw] || placeRaw || '近側';
    const era = window.QianWorld ? window.QianWorld.eraLabel(S.day) : dayStr();
    if ($('dash-loc')) $('dash-loc').textContent = '墨夢 · ' + place + ' · ' + era;
    if ($('dash-hp')) $('dash-hp').textContent = String(Math.floor(st.hp));
    if ($('dash-hpmax')) $('dash-hpmax').textContent = String(Math.floor(st.maxHp));
    if ($('dash-name')) $('dash-name').textContent = h.name || S.name || '旅人';
    if ($('dash-avatar')) {
      const src = faceUrl(careerFaceKey(S.career, h.gender));
      if ($('dash-avatar').getAttribute('src') !== src) $('dash-avatar').src = src;
      if ($('dash-top-avatar') && $('dash-top-avatar').getAttribute('src') !== src) $('dash-top-avatar').src = src;
    }
    if ($('dash-gold')) $('dash-gold').textContent = String(S.gold);
    if ($('dash-food')) $('dash-food').textContent = String(S.food);
    if ($('dash-lv')) $('dash-lv').textContent = heroLevel() + '級';
    if ($('dash-hero-name')) $('dash-hero-name').textContent = h.name || S.name || '旅人';
    if ($('dash-tags')) {
      const g = h.gender === 'm' ? '男' : (h.gender === 'f' ? '女' : '不顯');
      const tags = [g, o.name || '出身', career.name, S.joined ? ((window.QianFactions && window.QianFactions.FACTIONS[S.joined] && window.QianFactions.FACTIONS[S.joined].short) || S.joined) : '遊士'];
      if (h.disguise === 'male') tags.push('男裝');
      if (h.disguise === 'female') tags.push('女裝');
      $('dash-tags').innerHTML = tags.map((t) => '<span class="dash-tag">' + escapeHtml(t) + '</span>').join('');
    }
    if ($('dash-attrs')) {
      const a = st.attrs || {};
      const rows = [
        ['體力', st.hp + ' / ' + st.maxHp, st.hp / Math.max(1, st.maxHp)],
        ['銀兩', String(S.gold), Math.min(1, S.gold / 200)],
        ['戰力', String(combatPower()), Math.min(1, combatPower() / 5000)],
        ['武力', String(a.wu || 0), Math.min(1, (a.wu || 0) / 20)],
        ['智略', String(a.zhi || 0), Math.min(1, (a.zhi || 0) / 20)],
        ['辯才', String(a.bian || 0), Math.min(1, (a.bian || 0) / 20)],
        ['身法', String(a.shen || 0), Math.min(1, (a.shen || 0) / 20)],
        ['護體', String(a.hu || 0), Math.min(1, (a.hu || 0) / 20)],
        ['氣運', String(a.yun || 0), Math.min(1, (a.yun || 0) / 20)],
        ['名望', String(Math.floor(S.fame || 0)), Math.min(1, (S.fame || 0) / 100)],
        ['民心', String(Math.floor(S.people || 0)), Math.min(1, (S.people || 0) / 100)],
        ['境界', careerTitle(S.career) + ' · ' + heroLevel() + '級', Math.min(1, heroLevel() / 20)],
        ['壽元（日）', String(S.day || 1) + ' · 第' + gameMonth(S.day) + '旬', Math.min(1, ((S.day || 1) % 112) / 112)]
      ];
      $('dash-attrs').innerHTML = rows.map((r) =>
        '<div class="dash-attr-row" data-k="' + escapeHtml(r[0]) + '"><div class="lab"><span>' + escapeHtml(r[0]) + '</span><b>' + escapeHtml(r[1]) + '</b></div>' +
        '<div class="dash-bar"><i style="width:' + Math.max(4, Math.floor((r[2] || 0) * 100)) + '%"></i></div></div>'
      ).join('');
    }
    if ($('dash-fame')) $('dash-fame').textContent = String(Math.floor(S.fame || 0));
    if ($('dash-people')) $('dash-people').textContent = String(Math.floor(S.people || 0));
    if ($('dash-rumor-text')) {
      const rum = S.worldLine || '暫無重要消息…';
      $('dash-rumor-text').textContent = rum;
    }
    // realm tabs
    document.querySelectorAll('.dash-tabs button').forEach((b) => {
      b.classList.toggle('on', b.dataset.realm === d.realm);
    });
    const x2 = $('dash-x2');
    if (x2) x2.classList.toggle('on', !!d.x2);
    const fn = $('dash-filter-noise');
    if (fn) fn.classList.toggle('on', !!d.filterNoise);

    // NPCs
    const list = $('dash-npc-list');
    if (list) {
      const npcs = dashRealmNpcs();
      if ($('dash-npc-count')) $('dash-npc-count').textContent = String(npcs.length);
      if (!npcs.length) {
        list.innerHTML = '<p class="dash-empty">此處暫無可互動之人。可遊歷或推進劇情。</p>';
      } else {
        list.innerHTML = npcs.map((n) => {
          const stn = (S.npcs && S.npcs[n.id]) || { aff: 0 };
          const pin = n.meet ? ((MODE_LABELS && MODE_LABELS[n.meet]) || n.meet) : '鄉里';
          const line = (n.lines && n.lines[0]) || n.bio || '';
          const aff = Math.floor(stn.aff || 0);
          return '<button type="button" class="dash-npc" data-dash-npc="' + n.id + '">' +
            '<img src="' + faceUrl(npcFaceKey(n)) + '" alt="" width="48" height="48" decoding="async">' +
            '<div class="meta"><div class="nm">' + escapeHtml(n.name) +
            ' <span class="aff">♥ ' + aff + '</span></div>' +
            '<div class="role">' + escapeHtml(n.role || '') + ' · 📍' + escapeHtml(pin) + '</div>' +
            '<div class="blurb">' + escapeHtml(line) + '</div></div></button>';
        }).join('');
        // fix broken toFixed ternary — rewrite simpler below if needed
        list.querySelectorAll('[data-dash-npc]').forEach((b) => {
          b.addEventListener('click', () => {
            selectedNpc = b.dataset.dashNpc;
            openTalk();
          });
        });
      }
    }

    // chronicle merge world + dashLog
    const chron = $('dash-chron-list');
    if (chron) {
      const items = [];
      (S.chronicle || []).forEach((c) => {
        items.push({
          when: '【第' + gameMonth(c.day || S.day) + '旬】',
          title: (c.changed ? '【史已改】' : '') + (c.title || '動向'),
          text: c.text || '',
          noise: false,
          changed: !!c.changed,
          day: c.day || 0
        });
      });
      (S.dashLog || []).forEach((e) => {
        items.push({
          when: '【第' + (e.month || gameMonth(e.day)) + '旬】',
          title: e.kind === 'stat' ? '數值' : (e.kind === 'story' ? '劇情' : '行事'),
          text: e.text,
          noise: !!e.noise,
          changed: false,
          day: e.day || 0
        });
      });
      items.sort((a, b) => (b.day || 0) - (a.day || 0));
      const view = items.slice(0, 40);
      if (!view.length) {
        chron.innerHTML = '<p class="dash-empty">過日或靜養後，動向將記入此處。</p>';
      } else {
        chron.innerHTML = view.map((it) =>
          '<div class="dash-chron-item' + (it.noise ? ' noise' : '') + (it.changed ? ' changed' : '') +
          (d.filterNoise && it.noise ? ' filtered' : '') + '">' +
          '<div class="when">' + escapeHtml(it.when) + '</div>' +
          '<div class="ttl">' + escapeHtml(it.title) + '</div>' +
          '<div>' + escapeHtml(it.text) + '</div></div>'
        ).join('');
      }
    }

    // mobile col
    if (window.matchMedia && window.matchMedia('(min-width:820px)').matches) {
      document.querySelectorAll('.dash-col').forEach((c) => c.classList.add('on'));
    } else {
      setDashCol(d.col || 'story');
    }
  }
  function dashCultivate() {
    if (!S) return;
    ensureDash(S);
    const steps = S.dash.x2 ? 2 : 1; /* 日數：一按過一日；二倍速過兩日 */
    const hp0 = S.hp, gold0 = S.gold, food0 = S.food;
    for (let i = 0; i < steps; i++) {
      let guard = 0;
      const day0 = S.day;
      while (guard++ < 8) {
        nextDay();
        if (S.day !== day0) break;
      }
    }
    const dHp = S.hp - hp0, dG = S.gold - gold0, dF = S.food - food0;
    pushDashLog('stat', '過日靜養 · 體力' + (dHp >= 0 ? '+' : '') + dHp + ' · 銀' + (dG >= 0 ? '+' : '') + dG + ' · 藥/糧' + (dF >= 0 ? '+' : '') + dF, { noise: true });
    if (S.worldLine) pushDashLog('sys', S.worldLine, { noise: false });
    try { juiceFlash(); juiceShake(0.2); } catch (e) {}
    toast('過日 · ' + dayStr());
    renderDash();
    renderStoryPanel();
    saveQuiet();
    /* AI 紀事摘要（無 key 則本地） */
    (async function () {
      const AI = window.QianAI;
      const fate = window.QianArcs ? window.QianArcs.fateSummary(S) : '';
      const recent = (S.dashLog || []).slice(0, 6).map((e) => e.text).join('／');
      if (AI && AI.ready() && AI.chronicleDigest) {
        try {
          const out = await AI.chronicleDigest({
            fateSummary: fate, flags: flagLine(S), recent: recent, dayStr: dayStr()
          });
          S.worldLine = out.text;
          pushDashLog('sys', out.text, { noise: false });
          if ($('dash-rumor-text')) $('dash-rumor-text').textContent = out.text;
          saveQuiet();
        } catch (e) { /* keep worldLine */ }
      } else {
        const local = (window.QianStoryFlow && window.QianStoryFlow.offlineBeat)
          ? ('〔紀事〕' + window.QianStoryFlow.offlineBeat(S, '過日', S.worldLine || ''))
          : (S.worldLine || '咸陽風聞暫歇。');
        S.worldLine = local;
        if ($('dash-rumor-text')) $('dash-rumor-text').textContent = local;
      }
      renderDash();
    })();
  }



  /* ---- v37 關係圖／百科／閱讀／分享 ---- */
  let relZoom = 1, relPanX = 0, relPanY = 0;
  function openModal(id) {
    const el = $(id); if (!el) return;
    el.hidden = false;
    try { juiceFlash(); } catch (e) {}
  }
  function closeModal(id) {
    const el = $(id); if (el) el.hidden = true;
  }
  function renderRelGraph() {
    if (!S || !window.QianCodex) return;
    const svg = $('rel-svg');
    if (!svg) return;
    const nodes = window.QianCodex.relNodes(S);
    const edges = window.QianCodex.relEdges(S);
    const hx = 50, hy = 50;
    let eSvg = edges.map((e) => {
      const n = nodes.find((x) => x.id === e.to);
      if (!n) return '';
      const x2 = n.x * 100, y2 = n.y * 100;
      const sw = 0.3 + e.w * 0.15;
      return '<line class="rel-edge" x1="' + hx + '" y1="' + hy + '" x2="' + x2 + '" y2="' + y2 + '" stroke-width="' + sw + '"/>';
    }).join('');
    let nSvg = '<g class="rel-center"><circle cx="' + hx + '" cy="' + hy + '" r="4.5"/><text x="' + hx + '" y="' + (hy + 7) + '" font-size="3.2" text-anchor="middle" fill="#1a1205">你</text></g>';
    nSvg += nodes.map((n) => {
      const x = n.x * 100, y = n.y * 100;
      const r = 2.2 + Math.min(4, (n.aff || 0) / 20);
      const dim = n.known ? '' : ' dim';
      return '<g class="rel-node' + dim + '"><circle cx="' + x + '" cy="' + y + '" r="' + r + '"/><text x="' + x + '" y="' + (y + 6) + '">' + escapeHtml(n.name) + (n.known ? ' ' + Math.floor(n.aff) : '') + '</text></g>';
    }).join('');
    svg.innerHTML = eSvg + nSvg;
    svg.style.transform = 'translate(' + relPanX + 'px,' + relPanY + 'px) scale(' + relZoom + ')';
  }
  function openRel() {
    relZoom = 1; relPanX = 0; relPanY = 0;
    openModal('modal-rel');
    renderRelGraph();
  }
  let codexTab = 'people';
  function renderCodex() {
    const list = $('codex-list');
    if (!list || !window.QianCodex) return;
    const C = window.QianCodex;
    document.querySelectorAll('.codex-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.codex === codexTab));
    let rows = [];
    if (codexTab === 'people') rows = C.PEOPLE;
    else if (codexTab === 'places') rows = C.PLACES;
    else if (codexTab === 'factions') rows = C.FACTIONS;
    else rows = C.EVENTS;
    list.innerHTML = rows.map((it) => {
      const tags = (it.tags || []).map((x) => escapeHtml(x)).join(' · ');
      const sub = it.title ? escapeHtml(it.title) : '';
      return '<article class="codex-item"><h3>' + escapeHtml(it.name) + (sub ? ' · ' + sub : '') + '</h3>' +
        (tags ? '<div class="tags">' + tags + '</div>' : '') +
        '<p>' + escapeHtml(it.blurb || '') + '</p></article>';
    }).join('');
  }
  function openCodex() { openModal('modal-codex'); renderCodex(); }
  function syncReadBody() {
    const body = $('read-body');
    if (!body || !S) return;
    const node = window.QianStoryFlow && window.QianStoryFlow.getNode(S);
    const parts = [];
    if (node) parts.push('【' + (node.speaker || '旁白') + '】\n' + (node.text || ''));
    (S.readLog || []).slice(-6).forEach((l) => parts.push(l));
    body.textContent = parts.join('\n\n') || '尚無閱讀內容。請先推進劇情。';
    const tip = $('read-tip');
    const d = ensureDash(S);
    if ($('read-tips')) $('read-tips').checked = !!d.tips;
    if ($('read-parallel')) $('read-parallel').checked = !!d.parallel;
    const tipText = (window.QianCodex && node) ? window.QianCodex.tipFor(node.id, !!d.tips) : '';
    if (tip) {
      if (tipText) { tip.hidden = false; tip.textContent = tipText; }
      else tip.hidden = true;
    }
  }
  function openRead() { openModal('modal-read'); syncReadBody(); }
  async function storytellerRun(intervene) {
    if (!S) return;
    const AI = window.QianAI;
    const promptEl = $('read-prompt');
    const prompt = (promptEl && promptEl.value || '').trim();
    const d = ensureDash(S);
    const fate = window.QianArcs ? window.QianArcs.fateSummary(S) : '';
    const rel = window.QianCodex ? window.QianCodex.relNodes(S).filter((n) => n.known).map((n) => n.name + n.aff).join('、') : '';
    const recent = (S.readLog || []).slice(-3).join('／');
    const body = $('read-body');
    if (body) body.textContent = (body.textContent || '') + '\n\n……說書人沉吟中……';
    let text = '';
    if (AI && AI.ready() && AI.storytellerContinue) {
      try {
        const out = await AI.storytellerContinue({
          intervene: !!intervene,
          parallel: !!d.parallel,
          prompt: prompt || (intervene ? '玩家想介入改劇情。' : '沿主線接寫。'),
          fateSummary: fate,
          flags: flagLine(S),
          relLine: rel,
          recent: recent,
          customNpc: intervene && /自建|角色/.test(prompt) ? prompt.slice(0, 24) : ''
        });
        text = out.text;
      } catch (e) {
        text = offlineStoryteller(intervene, prompt);
      }
    } else {
      text = offlineStoryteller(intervene, prompt);
    }
    if (!S.readLog) S.readLog = [];
    S.readLog.push(text);
    if (S.readLog.length > 40) S.readLog = S.readLog.slice(-40);
    pushDashLog('story', text.slice(0, 80), { noise: false });
    if (intervene && prompt) {
      S.plotFlags = S.plotFlags || {};
      S.plotFlags.read_intervene = (S.plotFlags.read_intervene || 0) + 1;
      if (/疏遠|冷/.test(prompt)) S.plotFlags.ying_read_cool = 1;
      if (/親近|伴側|溫/.test(prompt)) S.plotFlags.ying_read_warm = 1;
      if (/平行/.test(prompt) || d.parallel) S.plotFlags.parallel_ok = 1;
    }
    syncReadBody();
    try { juiceShake(0.12); } catch (e) {}
    saveQuiet();
    toast(intervene ? '已介入' : '已接寫');
  }
  function offlineStoryteller(intervene, prompt) {
    const pf = (S && S.plotFlags) || {};
    const bits = [];
    if (intervene) {
      bits.push('你抬手打斷說書人：「且換一筆。」');
      if (prompt) bits.push('你望向既定軌道之外——「' + prompt.slice(0, 36) + '」——旗標微微一顫，卻未崩斷。');
      else bits.push('廊風換嚮，近側的燈影斜了一寸。');
    } else {
      bits.push('說書人接著道：咸陽夜色如墨，藥香與戈戟並陳。');
      if (pf.court_healer) bits.push('太醫署的名在冊上未擦。');
      if (pf.ying_first_meet) bits.push('少年王那一眼，仍懸在殿角。');
      if (pf.fate_ying) bits.push('命運已寫下「' + pf.fate_ying + '」——後文只能沿此生枝，不可腰斬。');
    }
    return bits.join('');
  }
  function openShare() {
    if (!S || !window.QianCodex) return;
    const lines = [];
    const node = window.QianStoryFlow && window.QianStoryFlow.getNode(S);
    if (node) lines.push('【' + (node.speaker || '') + '】' + (node.text || '').replace(/\n/g, ' '));
    (S.readLog || []).slice(-5).forEach((l) => lines.push(l));
    (S.dashLog || []).filter((e) => e.kind === 'story').slice(0, 5).forEach((e) => lines.push(e.text));
    const clip = window.QianCodex.exportClip(S, lines);
    const ta = $('share-text');
    if (ta) ta.value = clip;
    openModal('modal-share');
  }
  async function copyShare() {
    const ta = $('share-text');
    if (!ta) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(ta.value);
      else { ta.select(); document.execCommand('copy'); }
      toast('已複製');
      try { juiceFlash(); } catch (e) {}
    } catch (e) {
      ta.select();
      toast('請手動複製');
    }
  }

  /* ---- Bind ---- */
  function bind() {

    $('btn-new').addEventListener('click', showCreate);
    $('btn-continue').addEventListener('click', continueGame);
    $('btn-career-back').addEventListener('click', showCreate);
    if ($('btn-create-back')) $('btn-create-back').addEventListener('click', showTitle);
    if ($('btn-create-next')) $('btn-create-next').addEventListener('click', showCareer);
    // Safari：輸入時鍵盤遮住「確定」——捲動並釘住底部按鈕
    (function bindCreateKb(){
      var sc = $('screen-create');
      var acts = $('create-actions');
      if (!sc || !acts) return;
      function pin(){
        try {
          acts.scrollIntoView({ block: 'end', behavior: 'smooth' });
        } catch (e) {
          acts.scrollIntoView(false);
        }
        sc.classList.add('create-kb');
      }
      function unpin(){ sc.classList.remove('create-kb'); }
      ['create-name', 'create-goal'].forEach(function(id){
        var el = $(id); if (!el) return;
        el.addEventListener('focus', function(){ setTimeout(pin, 50); setTimeout(pin, 320); });
        el.addEventListener('blur', function(){ setTimeout(unpin, 120); });
      });
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function(){
          if (sc.hidden) return;
          var ae = document.activeElement;
          if (ae && (ae.id === 'create-name' || ae.id === 'create-goal')) pin();
        });
      }
    })();
    document.querySelectorAll('[data-gender]').forEach((b) => {
      b.addEventListener('click', () => {
        window.__createDraft = window.__createDraft || {};
        window.__createDraft.gender = b.dataset.gender;
        document.querySelectorAll('#gender-row [data-gender]').forEach((x) => x.classList.toggle('active', x === b));
        const df = $('disguise-field');
        if (df) df.hidden = b.dataset.gender !== 'f';
        if (b.dataset.gender !== 'f' && $('create-disguise')) $('create-disguise').checked = false;
        const dm = $('disguise-m-field');
        if (dm) dm.hidden = b.dataset.gender !== 'm';
        if (b.dataset.gender !== 'm' && $('create-disguise-m')) $('create-disguise-m').checked = false;
      });
    });
    document.querySelectorAll('[data-wmode]').forEach((b) => {
      b.addEventListener('click', () => {
        window.__createDraft = window.__createDraft || {};
        window.__createDraft.worldMode = b.dataset.wmode;
        document.querySelectorAll('[data-wmode]').forEach((x) => x.classList.toggle('active', x === b));
      });
    });
    function paintVersionLabels() {
      const label = '版本 v' + GAME_VERSION;
      const short = 'v' + GAME_VERSION;
      const gv = $('game-version'); if (gv) gv.textContent = label;
      const mv = $('menu-version'); if (mv) mv.textContent = label;
      const sv = $('set-version'); if (sv) sv.textContent = label;
      const hv = $('hud-ver'); if (hv) hv.textContent = short;
    }
    paintVersionLabels();
    $('btn-settings-title').addEventListener('click', openSettings);
    $('btn-settings-game').addEventListener('click', () => { $('modal-menu').hidden = true; openSettings(); });
    $('btn-menu').addEventListener('click', () => { updateDisguiseMenu(); $('modal-menu').hidden = false; });
    $('btn-close-menu').addEventListener('click', () => { $('modal-menu').hidden = true; });
    $('btn-save').addEventListener('click', () => { save(); $('modal-menu').hidden = true; });
    $('btn-title').addEventListener('click', () => { saveQuiet(); $('modal-menu').hidden = true; showTitle(); });
    $('btn-close-settings').addEventListener('click', () => { $('modal-settings').hidden = true; });
    $('btn-save-settings').addEventListener('click', saveSettingsFromUI);
    $('set-provider').addEventListener('change', () => {
      const AI = window.QianAI;
      AI.applyPreset($('set-provider').value);
      fillModels();
      $('set-base-wrap').hidden = $('set-provider').value !== 'custom';
    });
    $('btn-test-ai').addEventListener('click', async () => {
      applySettingsFromUI();
      const AI = window.QianAI;
      const SET = AI.getSet();
      SET.ai = true; AI.save();
      $('ai-test-result').textContent = '測試中…';
      if (!SET.key && SET.preset !== 'custom') {
        $('ai-test-result').textContent = '請先填 API Key';
        return;
      }
      try {
        const r = await AI.test();
        $('ai-test-result').textContent = '成功：' + r.text.slice(0, 40);
      } catch (e) {
        $('ai-test-result').textContent = AI.errMsg(e);
      }
    });

    document.querySelectorAll('.mode-tab').forEach((t) => {
      t.addEventListener('click', () => showMode(t.dataset.mode));
    });
    document.querySelectorAll('.dir').forEach((d) => {
      d.addEventListener('click', () => {
        directive = d.dataset.dir;
        document.querySelectorAll('.dir').forEach((x) => x.classList.toggle('active', x === d));
      });
    });
    document.querySelectorAll('.crop-btn').forEach((b) => {
      b.addEventListener('click', () => {
        selectedCrop = b.dataset.crop;
        document.querySelectorAll('.crop-btn').forEach((x) => x.classList.toggle('active', x === b));
      });
    });

    canvas().addEventListener('click', (e) => tapPlot(plotAt(e.clientX, e.clientY)));

    ['btn-auto', 'btn-auto-v', 'btn-auto-mkt', 'btn-auto-clinic', 'btn-auto-drill', 'btn-auto-wild', 'btn-auto-garden', 'btn-auto-swim', 'btn-auto-moon', 'btn-auto-mine', 'btn-auto-post', 'btn-auto-tavern', 'btn-auto-academy', 'btn-auto-frontier', 'btn-auto-qin', 'btn-auto-beauty'].forEach((id) => {
      const el = $(id); if (el) el.addEventListener('click', toggleAuto);
    });
    $('btn-water-all').addEventListener('click', waterAll);
    $('btn-harvest').addEventListener('click', harvestAll);
    $('btn-sell').addEventListener('click', sellCrops);
    $('btn-expand').addEventListener('click', expandPlot);
    $('btn-nextday').addEventListener('click', nextDay);

    $('btn-talk-npc').addEventListener('click', openTalk);
    if ($('btn-garden')) $('btn-garden').addEventListener('click', () => doLeisure('garden'));
    if ($('btn-swim')) $('btn-swim').addEventListener('click', () => doLeisure('swim'));
    if ($('btn-moon')) $('btn-moon').addEventListener('click', () => doLeisure('moon'));
    document.querySelectorAll('[data-leisure]').forEach((b) => {
      b.addEventListener('click', () => doLeisure(b.dataset.leisure));
    });
    if ($('btn-garden-meet')) $('btn-garden-meet').addEventListener('click', gardenMeet);
    if ($('btn-garden-flower')) $('btn-garden-flower').addEventListener('click', () => doLeisure('garden_flower'));
    if ($('btn-fish')) $('btn-fish').addEventListener('click', fishPond);
    if ($('btn-forage')) $('btn-forage').addEventListener('click', forageWild);
    if ($('btn-hire')) $('btn-hire').addEventListener('click', hireHand);
    if ($('btn-buy-food')) $('btn-buy-food').addEventListener('click', buyFoodPack);
    if ($('btn-clinic-charity')) $('btn-clinic-charity').addEventListener('click', clinicCharity);
    $('btn-gift-npc').addEventListener('click', giftNpc);
    $('btn-submit-order').addEventListener('click', submitOrder);
    $('btn-close-talk').addEventListener('click', () => { $('modal-talk').hidden = true; if (window.QianNpcAI && selectedNpc) window.QianNpcAI.resume(S, selectedNpc); });
    $('btn-talk-send').addEventListener('click', sendTalk);
    $('talk-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendTalk(); });
    document.querySelectorAll('.talk-mode .seg').forEach((s) => {
      s.addEventListener('click', () => {
        sayMode = s.dataset.say;
        document.querySelectorAll('.talk-mode .seg').forEach((x) => x.classList.toggle('active', x === s));
        $('talk-input').placeholder = sayMode === 'cmd' ? '指令（要對方做什麼）…' : '對他說……';
      });
    });

    $('btn-sell-all').addEventListener('click', () => { sellCrops(); if (bagCount('ore')) { const n = bagCount('ore'); S.gold += n * 6; addBag('ore', -n); S.soldGold += n * 6; toast('礦亦售出'); } renderHUD(); });
    $('btn-buy-seed').addEventListener('click', () => {
      if (S.gold < 15) { toast('銀不足'); return; }
      S.gold -= 15; addBag('rice', 2); addBag('veg', 1); addBag('wheat', 1);
      toast('買得種子包'); renderHUD();
    });
    $('btn-gather-herb').addEventListener('click', gatherHerb);
    $('btn-heal-self').addEventListener('click', usePotion);

    $('btn-drill-fight').addEventListener('click', () => startBattle('drill'));
    $('btn-wild-fight').addEventListener('click', () => startBattle('wild'));
    $('btn-flee-drill').addEventListener('click', fleeBattle);
    $('btn-flee-wild').addEventListener('click', fleeBattle);
    if ($('btn-flee-mine')) $('btn-flee-mine').addEventListener('click', fleeBattle);
    if ($('btn-map-end-battle')) $('btn-map-end-battle').addEventListener('click', () => {
      autoOn = false; syncAutoUi(); battleLockUntil = Date.now() + 2500; forceClearBattle(); toast('已結束戰鬥'); openMapSheet();
    });
    if ($('btn-map-flee-hut')) $('btn-map-flee-hut').addEventListener('click', escapeBattleToHut);
    $('btn-deeper').addEventListener('click', () => {
      if (battle) { toast('戰鬥中'); return; }
      S.wildFloor++;
      toast('深入山層 ' + S.wildFloor);
      renderCombatPanel();
    });
    // v16 dungeons
    ['ruins','crypt','marsh','gorge','stone_forest'].forEach((k) => {
      const fight = $('btn-' + (k === 'stone_forest' ? 'stone' : k) + '-fight');
      const flee = $('btn-flee-' + (k === 'stone_forest' ? 'stone' : k));
      const deeper = $('btn-' + (k === 'stone_forest' ? 'stone' : k) + '-deeper');
      const boss = $('btn-' + (k === 'stone_forest' ? 'stone' : k) + '-boss');
      if (fight) fight.addEventListener('click', () => startBattle(k));
      if (flee) flee.addEventListener('click', fleeBattle);
      if (deeper) deeper.addEventListener('click', () => dungeonDeeper(k));
      if (boss) boss.addEventListener('click', () => startBattle(k, true));
    });


    // manual attack while in battle: tap scene OR HUD buttons
    $('adventure-scene').addEventListener('click', () => {
      if (battle && !autoOn) playerAttack();
    });
    if ($('btn-battle-atk')) $('btn-battle-atk').addEventListener('click', (e) => {
      e.stopPropagation();
      if (battle && !autoOn) playerAttack();
    });
    if ($('btn-battle-potion')) $('btn-battle-potion').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!battle) return;
      if (bagCount('potion') <= 0) { toast('無回春散'); return; }
      usePotion();
      updateBattleHUD('服藥');
    });
    if ($('btn-battle-flee')) $('btn-battle-flee').addEventListener('click', (e) => {
      e.stopPropagation();
      fleeBattle();
    });

    if ($('btn-mine-dig')) $('btn-mine-dig').addEventListener('click', mineDig);
    if ($('btn-mine-deeper')) $('btn-mine-deeper').addEventListener('click', mineDeeper);
    if ($('btn-mine-fight')) $('btn-mine-fight').addEventListener('click', () => startBattle('mine'));
    if ($('btn-post-rest')) $('btn-post-rest').addEventListener('click', postRest);
    if ($('btn-post-rumor')) $('btn-post-rumor').addEventListener('click', postRumor);
    if ($('btn-post-courier')) $('btn-post-courier').addEventListener('click', postCourier);
    if ($('btn-tavern-drink')) $('btn-tavern-drink').addEventListener('click', tavernDrink);
    if ($('btn-tavern-listen')) $('btn-tavern-listen').addEventListener('click', tavernListen);
    if ($('btn-tavern-gamble')) $('btn-tavern-gamble').addEventListener('click', tavernGamble);
    if ($('btn-academy-study')) $('btn-academy-study').addEventListener('click', academyStudy);
    if ($('btn-academy-debate')) $('btn-academy-debate').addEventListener('click', academyDebate);
    if ($('btn-academy-teach')) $('btn-academy-teach').addEventListener('click', academyTeach);
    if ($('btn-front-fight')) $('btn-front-fight').addEventListener('click', () => startBattle('frontier'));
    if ($('btn-front-scout')) $('btn-front-scout').addEventListener('click', frontScout);
    if ($('btn-flee-front')) $('btn-flee-front').addEventListener('click', fleeBattle);
    if ($('btn-front-deeper')) $('btn-front-deeper').addEventListener('click', () => {
      if (battle) { toast('戰鬥中'); return; }
      S.frontFloor = (S.frontFloor || 1) + 1;
      toast('深入邊層 ' + S.frontFloor);
      renderCombatPanel();
    });

    $('btn-bag').addEventListener('click', openBag);
    $('btn-close-bag').addEventListener('click', () => { $('modal-bag').hidden = true; });
    $('btn-bag-sell').addEventListener('click', () => { sellCrops(); openBag(); });
    $('btn-quest').addEventListener('click', openQuest);
    $('btn-close-quest').addEventListener('click', () => { $('modal-quest').hidden = true; });
    $('btn-close-loot').addEventListener('click', () => { $('modal-loot').hidden = true; });

    // block weixin links
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a && /^weixin:/i.test(a.getAttribute('href') || '')) { e.preventDefault(); toast('已攔截微信連結'); }
    }, true);

    // Guofeng chrome
    if ($('tab-story')) $('tab-story').addEventListener('click', () => { focusStoryPanel(); });
    if ($('btn-menu-story')) $('btn-menu-story').addEventListener('click', () => { closeModal('modal-menu'); focusStoryPanel(); });
    if ($('btn-menu-rel')) $('btn-menu-rel').addEventListener('click', () => { closeModal('modal-menu'); openRel(); });
    if ($('btn-menu-codex')) $('btn-menu-codex').addEventListener('click', () => { closeModal('modal-menu'); openCodex(); });
    if ($('btn-menu-read')) $('btn-menu-read').addEventListener('click', () => { closeModal('modal-menu'); openRead(); });

    /* v36 dash binds */
    if ($('dash-cultivate')) $('dash-cultivate').addEventListener('click', (ev) => { tapFeel($('dash-cultivate'), ev); dashCultivate(); });
    if ($('dash-save')) $('dash-save').addEventListener('click', () => { save(); });
    if ($('dash-load')) $('dash-load').addEventListener('click', () => {
      if (!load()) { toast('無存檔'); return; }
      refreshNpcs();
      if (window.QianStoryFlow) {
        window.QianStoryFlow.ensure(S);
        if (!S.storyFlow.started || !S.storyFlow.nodeId) window.QianStoryFlow.begin(S, { fromSave: true });
        else window.QianStoryFlow.begin(S, { resume: true });
        applyStoryScene();
        renderStoryPanel();
      }
      renderHUD();
      toast('已讀檔 · ' + dayStr());
      pushDashLog('sys', '讀取存檔', { noise: true });
    });
    if ($('dash-x2')) $('dash-x2').addEventListener('click', () => {
      if (!S) return; ensureDash(S); S.dash.x2 = !S.dash.x2;
      $('dash-x2').classList.toggle('on', S.dash.x2);
      $('dash-x2').setAttribute('aria-pressed', S.dash.x2 ? 'true' : 'false');
      toast(S.dash.x2 ? '二倍速 · 靜養過兩日' : '常速 · 靜養過一日');
    });
    if ($('dash-filter-noise')) $('dash-filter-noise').addEventListener('click', () => {
      if (!S) return; ensureDash(S); S.dash.filterNoise = !S.dash.filterNoise;
      renderDash();
    });
    document.querySelectorAll('.dash-mobile-tabs button').forEach((b) => {
      b.addEventListener('click', () => {
        if (!S) return;
        ensureDash(S);
        S.dash.col = b.dataset.col;
        setDashCol(S.dash.col);
      });
    });
    document.querySelectorAll('.dash-tabs button').forEach((b) => {
      b.addEventListener('click', () => {
        if (!S) return; ensureDash(S); S.dash.realm = b.dataset.realm || 'home';
        renderDash();
      });
    });
    if ($('dash-travel')) $('dash-travel').addEventListener('click', () => {
      const sm = $('sheet-map'); if (sm) sm.hidden = false;
    });
    if ($('dash-story-btn')) $('dash-story-btn').addEventListener('click', () => openStoryModal());
    if ($('dash-rel')) $('dash-rel').addEventListener('click', () => openRel());
    if ($('dash-codex')) $('dash-codex').addEventListener('click', () => openCodex());
    if ($('dash-rel-profile')) $('dash-rel-profile').addEventListener('click', () => openRel());
    if ($('dash-codex-profile')) $('dash-codex-profile').addEventListener('click', () => openCodex());
    if ($('dash-story-expand')) $('dash-story-expand').addEventListener('click', () => openStoryModal());
    if ($('dash-read')) $('dash-read').addEventListener('click', () => openRead());
    if ($('dash-share')) $('dash-share').addEventListener('click', () => openShare());
    document.querySelectorAll('[data-close]').forEach((b) => {
      b.addEventListener('click', () => closeModal(b.getAttribute('data-close')));
    });
    document.querySelectorAll('.codex-tabs button').forEach((b) => {
      b.addEventListener('click', () => { codexTab = b.dataset.codex; renderCodex(); });
    });
    if ($('rel-zoom-in')) $('rel-zoom-in').addEventListener('click', () => { relZoom = Math.min(2.5, relZoom + 0.2); renderRelGraph(); });
    if ($('rel-zoom-out')) $('rel-zoom-out').addEventListener('click', () => { relZoom = Math.max(0.5, relZoom - 0.2); renderRelGraph(); });
    if ($('rel-zoom-reset')) $('rel-zoom-reset').addEventListener('click', () => { relZoom = 1; relPanX = 0; relPanY = 0; renderRelGraph(); });
    (function bindRelPan() {
      const vp = $('rel-viewport'); if (!vp) return;
      let dragging = false, lx = 0, ly = 0;
      vp.addEventListener('pointerdown', (ev) => { dragging = true; lx = ev.clientX; ly = ev.clientY; try { vp.setPointerCapture(ev.pointerId); } catch (e) {} });
      vp.addEventListener('pointermove', (ev) => {
        if (!dragging) return;
        relPanX += (ev.clientX - lx); relPanY += (ev.clientY - ly);
        lx = ev.clientX; ly = ev.clientY; renderRelGraph();
      });
      vp.addEventListener('pointerup', () => { dragging = false; });
      vp.addEventListener('wheel', (ev) => {
        ev.preventDefault();
        relZoom = Math.max(0.5, Math.min(2.5, relZoom + (ev.deltaY < 0 ? 0.1 : -0.1)));
        renderRelGraph();
      }, { passive: false });
    })();
    if ($('read-tips')) $('read-tips').addEventListener('change', () => { if (S) { ensureDash(S).tips = !!$('read-tips').checked; syncReadBody(); saveQuiet(); } });
    if ($('read-parallel')) $('read-parallel').addEventListener('change', () => { if (S) { ensureDash(S).parallel = !!$('read-parallel').checked; saveQuiet(); } });
    if ($('read-continue')) $('read-continue').addEventListener('click', () => storytellerRun(false));
    if ($('read-intervene')) $('read-intervene').addEventListener('click', () => storytellerRun(true));
    if ($('read-to-story')) $('read-to-story').addEventListener('click', () => { closeModal('modal-read'); openStoryModal(); });
    if ($('share-copy')) $('share-copy').addEventListener('click', () => copyShare());
    if ($('dash-talk-open')) $('dash-talk-open').addEventListener('click', () => {
      refreshNpcs();
      const first = dashRealmNpcs()[0];
      if (first) { selectedNpc = first.id; openTalk(); }
      else toast('暫無可談之人');
    });
    if ($('dash-ppl')) $('dash-ppl').addEventListener('click', () => { try { renderPplModal(); } catch (e) {} if ($('modal-ppl')) $('modal-ppl').hidden = false; });
    if ($('dash-bag')) $('dash-bag').addEventListener('click', () => { if ($('btn-bag')) $('btn-bag').click(); });
    if ($('dash-quest')) $('dash-quest').addEventListener('click', () => { if ($('btn-quest')) $('btn-quest').click(); });
    if ($('dash-shop')) $('dash-shop').addEventListener('click', () => { if ($('btn-bag')) $('btn-bag').click(); });
    if ($('dash-set')) $('dash-set').addEventListener('click', () => { if ($('btn-menu')) $('btn-menu').click(); });
    if ($('dash-ach')) $('dash-ach').addEventListener('click', () => { if ($('btn-quest')) $('btn-quest').click(); else toast('差事／成就'); });
    if ($('dash-story-close')) $('dash-story-close').addEventListener('click', () => closeStoryModal());
    if ($('dash-story-backdrop')) $('dash-story-backdrop').addEventListener('click', () => closeStoryModal());

    if ($('tab-map')) $('tab-map').addEventListener('click', openMapSheet);
    if ($('q-act')) $('q-act').addEventListener('click', openActSheet);
    if ($('hSeal')) $('hSeal').addEventListener('click', openActSheet);
    if ($('map-x')) $('map-x').addEventListener('click', closeSheets);
    if ($('act-x')) $('act-x').addEventListener('click', closeSheets);
    document.querySelectorAll('#map-pins .pin').forEach((p) => {
      p.addEventListener('click', () => travelTo(p.dataset.mode));
    });
    if ($('q-auto')) $('q-auto').addEventListener('click', toggleAuto);
    if ($('q-save')) $('q-save').addEventListener('click', () => save());
    if ($('q-log')) $('q-log').addEventListener('click', openLogReview);
    if ($('btn-close-log')) $('btn-close-log').addEventListener('click', () => { $('modal-log').hidden = true; });
    if ($('mode-chip')) $('mode-chip').addEventListener('click', () => {
      const chip = $('mode-chip');
      const next = chip.dataset.say === 'cmd' ? 'say' : 'cmd';
      chip.dataset.say = next;
      sayMode = next;
      chip.textContent = next === 'cmd' ? '⚡指令' : '💬說';
      chip.classList.toggle('cmd', next === 'cmd');
      if ($('free-input')) $('free-input').placeholder = next === 'cmd' ? '指令（要對方做什麼）…' : '對眼前的人說…';
    });
    if ($('free-send')) $('free-send').addEventListener('click', freeSend);
    if ($('free-input')) $('free-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') freeSend(); });
    if ($('story-free-send')) $('story-free-send').addEventListener('click', (e) => { tapFeel(e.currentTarget, e); storyFreeSend(); });
    if ($('story-free-input')) $('story-free-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); storyFreeSend(); } });
    document.querySelectorAll('#story-free [data-free]').forEach((b) => {
      b.addEventListener('click', (e) => { tapFeel(b, e); setFreeActMode(b.dataset.free); });
    });
    setFreeActMode('say');
    if ($('tab-ppl')) $('tab-ppl').addEventListener('click', () => {
      if (mode !== 'village') showMode('village');
      renderPplModal();
      $('modal-ppl').hidden = false;
    });
    if ($('btn-close-ppl')) $('btn-close-ppl').addEventListener('click', () => { $('modal-ppl').hidden = true; });
    if ($('btn-ppl-talk')) $('btn-ppl-talk').addEventListener('click', () => {
      $('modal-ppl').hidden = true; openTalk();
    });
    if ($('btn-ppl-gift')) $('btn-ppl-gift').addEventListener('click', () => {
      giftNpc(); renderPplModal();
    });
    if ($('btn-world')) $('btn-world').addEventListener('click', () => { $('modal-menu').hidden = true; openWorldModal(); });
    if ($('btn-endings')) $('btn-endings').addEventListener('click', () => { $('modal-menu').hidden = true; openEndingsModal(); });
    if ($('btn-close-world')) $('btn-close-world').addEventListener('click', () => { $('modal-world').hidden = true; });
    if ($('btn-close-endings')) $('btn-close-endings').addEventListener('click', () => { $('modal-endings').hidden = true; });
    if ($('btn-close-event')) $('btn-close-event').addEventListener('click', () => {
      // must pick a choice; if forced close, treat as refuse soft
      if (S && S.pendingEvent) toast('請先選擇應對');
    });
    if ($('btn-close-gate')) $('btn-close-gate').addEventListener('click', () => { $('modal-gate').hidden = true; });
    if ($('btn-hut-rest')) $('btn-hut-rest').addEventListener('click', (e) => { tapFeel(e.currentTarget, e); hutRest(false); });
    if ($('btn-hut-nap')) $('btn-hut-nap').addEventListener('click', (e) => { tapFeel(e.currentTarget, e); hutNap(); });
    if ($('btn-hut-eat')) $('btn-hut-eat').addEventListener('click', (e) => { tapFeel(e.currentTarget, e); hutEat(); });
    if ($('btn-hut-disguise')) $('btn-hut-disguise').addEventListener('click', (e) => { tapFeel(e.currentTarget, e); toggleDisguise(); });
    if ($('btn-toggle-disguise')) $('btn-toggle-disguise').addEventListener('click', () => { $('modal-menu').hidden = true; toggleDisguise(); });
    if ($('btn-bag-disguise')) $('btn-bag-disguise').addEventListener('click', (e) => { tapFeel(e.currentTarget, e); toggleDisguise(); openBag(); });
    [['ruins','btn-ruins-fight','btn-ruins-boss','btn-ruins-deeper','btn-flee-ruins'],
     ['crypt','btn-crypt-fight','btn-crypt-boss','btn-crypt-deeper','btn-flee-crypt'],
     ['marsh','btn-marsh-fight','btn-marsh-boss','btn-marsh-deeper','btn-flee-marsh']].forEach((row) => {
      const where = row[0];
      if ($(row[1])) $(row[1]).addEventListener('click', () => startBattle(where));
      if ($(row[2])) $(row[2]).addEventListener('click', () => startBattle(where, true));
      if ($(row[3])) $(row[3]).addEventListener('click', () => exploreDeeper(where));
      if ($(row[4])) $(row[4]).addEventListener('click', fleeBattle);
    });
    // mine / wild / frontier boss shortcuts if buttons exist later
    document.querySelectorAll('.event-choices').forEach((box) => {
      box.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (b) tapFeel(b, e);
      }, true);
    });
    bindTapFeel(document);
    // gender disguise field
    document.querySelectorAll('#gender-row [data-gender]').forEach((b) => {
      b.addEventListener('click', () => {
        setTimeout(() => {
          const g = document.querySelector('#gender-row .chip-card.active');
          const f = $('disguise-field');
          if (f) f.hidden = !(g && g.dataset.gender === 'f');
          const fm = $('disguise-m-field');
          if (fm) fm.hidden = !(g && g.dataset.gender === 'm');
          if (g && g.dataset.gender !== 'm' && $('create-disguise-m')) $('create-disguise-m').checked = false;
        }, 0);
      });
    });
  }

  // villager-card style inject if missing
  function ensureExtraCss() { /* guofeng styles live in style.css */ }

  window.render_game_to_text = function () {
    if (!S) return JSON.stringify({ ok: false });
    const npcStates = (window.QianNpcAI && window.QianNpcAI.stateSummary) ? window.QianNpcAI.stateSummary(S) : {};
    return JSON.stringify({
      ok: true,
      v: GAME_VERSION,
      saveV: S.v,
      day: S.day,
      period: S.period || null,
      mode: mode,
      gold: S.gold,
      hp: S.hp,
      food: S.food,
      fame: S.fame,
      people: S.people,
      joined: S.joined,
      battle: !!battle,
      battleLock: typeof battleLockUntil !== 'undefined' && Date.now() < battleLockUntil,
      fate: window.QianArcs ? window.QianArcs.fateSummary(S) : '',
      plotFlags: S.plotFlags || {},
      arcProg: S.arcProg || {},
      endings: S.endings || [],
      pending: S.pendingEvent && S.pendingEvent.id,
      npcStates: npcStates,
      guide: ($('day-guide') && $('day-guide').textContent) || '',
      story: window.QianStoryFlow ? window.QianStoryFlow.summary(S) : null,
      dash: !!$('dash'),
      month: gameMonth(S.day),
      chronLen: (S.chronicle || []).length,
      codex: !!window.QianCodex,
      readLogLen: (S.readLog || []).length,
      romance: true,
      noFarm: true,
      dashLogLen: (S.dashLog || []).length
    });
  };

  ensureExtraCss();
  bind();
  showTitle();
  requestAnimationFrame(tick);
})();

