(() => {
  'use strict';

  const SAVE_KEY = 'qianmo_v2';
  const SAVE_KEY_OLD = 'qianmo_v1';
  const ASSET_V = '?v=5';
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
      bag: { herb: 5, rice: 2 },
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
      id: 'soldier', name: '武卒', desc: '校場出身，身強力壯，攜木劍開局。',
      gold: 60, food: 14, hp: 100, atk: 10, def: 4,
      skills: { farm: 0, med: 0, trade: 0, mart: 3, lit: 0 },
      bag: { rice: 2 },
      startGear: { slot: 'weapon', name: '木劍', atk: 3, def: 0, hp: 0, rarity: 'white' },
      quest: { id: 'q_fight', title: '校場初勝', desc: '戰勝 3 場', needFlag: 'wins', needVal: 3, gold: 55, food: 2 }
    },
    scholar: {
      id: 'scholar', name: '書生', desc: '通文識禮，鄉鄰好感較易提升。',
      gold: 85, food: 12, hp: 70, atk: 4, def: 1,
      skills: { farm: 1, med: 1, trade: 1, mart: 0, lit: 3 },
      bag: { flower: 4, rice: 2 },
      quest: { id: 'q_friend', title: '以文會友', desc: '任一鄉鄰好感達 30', needFlag: 'maxAff', needVal: 30, gold: 50, food: 2 }
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
  const SCENE_ART = {
    farm:    { webp: 'assets/bg_village.webp', jpg: 'assets/bg_village.jpg', alt: '田莊' },
    village: { webp: 'assets/bg_village.webp', jpg: 'assets/bg_village.jpg', alt: '村落' },
    market:  { webp: 'assets/bg_capital.webp', jpg: 'assets/bg_capital.jpg', alt: '坊市' },
    clinic:  { webp: 'assets/bg_clinic.webp',  jpg: 'assets/bg_clinic.jpg',  alt: '藥廬' },
    drill:   { webp: 'assets/bg_fields.webp',  jpg: 'assets/bg_fields.webp', alt: '校場' },
    wild:    { webp: 'assets/bg_cliff.webp',   jpg: 'assets/bg_cliff.jpg',   alt: '山野' },
    garden:  { webp: 'assets/bg_garden.webp',  jpg: 'assets/bg_garden.jpg',  alt: '園林' },
    swim:    { webp: 'assets/bg_swim.webp',    jpg: 'assets/bg_swim.jpg',    alt: '水塘' },
    moon:    { webp: 'assets/bg_moon.webp',    jpg: 'assets/bg_moon.jpg',    alt: '夜宴' }
  };
  const MODE_LABELS = {
    farm: '田莊', village: '村落', market: '坊市', clinic: '藥廬', drill: '校場', wild: '山野',
    garden: '園林', swim: '水塘', moon: '夜宴'
  };
  const LEISURE_MODES = ['garden', 'swim', 'moon'];
  const PERIODS = ['晨', '午', '暮', '夜'];
  let storyLines = [];

  const RARITIES = {
    white:  { id: 'white',  name: '白', className: 'rarity-white',  mult: 1,   sell: 8 },
    green:  { id: 'green',  name: '綠', className: 'rarity-green',  mult: 1.4, sell: 18 },
    blue:   { id: 'blue',   name: '藍', className: 'rarity-blue',   mult: 1.9, sell: 40 },
    purple: { id: 'purple', name: '紫', className: 'rarity-purple', mult: 2.6, sell: 90 },
    gold:   { id: 'gold',   name: '金', className: 'rarity-gold',   mult: 3.5, sell: 200 }
  };
  const RARITY_ORDER = ['white', 'green', 'blue', 'purple', 'gold'];
  const GEAR_BASE = {
    weapon: [
      { name: '木劍', atk: 3, def: 0, hp: 0 },
      { name: '鐵刃', atk: 5, def: 0, hp: 0 },
      { name: '青鋼刀', atk: 7, def: 0, hp: 2 },
      { name: '霜紋劍', atk: 9, def: 1, hp: 0 }
    ],
    armor: [
      { name: '布衣', atk: 0, def: 2, hp: 8 },
      { name: '皮甲', atk: 0, def: 4, hp: 12 },
      { name: '鐵鎧', atk: 0, def: 6, hp: 18 },
      { name: '玄甲', atk: 1, def: 8, hp: 24 }
    ],
    accessory: [
      { name: '草繩環', atk: 1, def: 0, hp: 4 },
      { name: '玉佩', atk: 1, def: 1, hp: 8 },
      { name: '護心鏡', atk: 2, def: 2, hp: 10 },
      { name: '金絲墜', atk: 3, def: 2, hp: 14 }
    ]
  };
  const SLOT_LABEL = { weapon: '武器', armor: '防具', accessory: '飾品' };
  const ENEMIES_DRILL = [
    { name: '木人樁', hp: 22, atk: 4 },
    { name: '校場教習', hp: 30, atk: 6 },
    { name: '遊卒', hp: 36, atk: 7 }
  ];
  const ENEMIES_WILD = [
    { name: '山鼠', hp: 28, atk: 5 },
    { name: '野狼', hp: 40, atk: 8 },
    { name: '伏匪', hp: 48, atk: 9 },
    { name: '山魅', hp: 60, atk: 11 },
    { name: '岩傀', hp: 80, atk: 12 }
  ];
  const FACE_V = '5';
  const NPCS = [
    { id: 'he', name: '何伯', role: '里正', face: 'scholar', likes: ['rice', 'wheat'], giftBoost: 10,
      lines: ['里中諸事，皆在我眼。', '春耕勿怠，秋穫有望。', '日令之單，速去坊市交來。'] },
    { id: 'su', name: '蘇娘', role: '藥婆', face: 'doctor', likes: ['herb', 'flower'], giftBoost: 12,
      lines: ['草藥貴在新鮮。', '你若傷了，來廬中坐坐。', '回春散一味，可解小恙。'] },
    { id: 'zhao', name: '趙三郎', role: '行商', face: 'merchant', likes: ['flower', 'ore'], giftBoost: 11,
      lines: ['坊市行情，朝夕不同。', '珍貨來得快，銀兩去得也快。', '與我交好，買賣可讓三分。'] },
    { id: 'lin', name: '林嫂', role: '田戶', face: 'farmer_f', likes: ['veg', 'rice'], giftBoost: 9,
      lines: ['田裏一雙手，勝似空談。', '孩子們都去幫你澆水了。', '收成好，心就安。'] },
    { id: 'wu', name: '伍叔', role: '守望', face: 'soldier', likes: ['wheat', 'ore'], giftBoost: 10,
      lines: ['校場刀槍，不可疏忽。', '山野有匪，入夜早歸。', '壯丁齊心，里中自安。'] },
    { id: 'cheng', name: '成郎', role: '書生', face: 'farmer_m', likes: ['flower', 'wheat'], giftBoost: 8,
      lines: ['讀得半卷，耕得半畝。', '名聲這東西，靠一行一行走。', '願聞君近日見聞。'] }
  ];
  const FACTION_FACE = { lu: 'merchant', qin: 'soldier', sai: 'scholar' };
  function faceUrl(key) {
    return 'assets/face_' + key + '.webp?v=' + FACE_V;
  }
  function npcFaceKey(n) {
    return (n && n.face) || 'farmer_m';
  }
  const RECIPES = [
    { id: 'riceBall', name: '稻香糰', scene: 'market', needs: { rice: 2 }, out: { food: 8 }, desc: '回復存糧' },
    { id: 'vegSoup', name: '青菜湯', scene: 'market', needs: { veg: 2, wheat: 1 }, out: { food: 4 }, heal: 18, desc: '戰鬥回血 18' },
    { id: 'potion', name: '回春散', scene: 'clinic', needs: { herb: 2, flower: 1 }, out: { potion: 1 }, heal: 0, desc: '藥劑 · 可服回血 35' }
  ];
  const ORDER_POOL = [
    { need: { rice: 4 }, rewardGold: 40, rewardFood: 2, title: '糧行急單' },
    { need: { veg: 3 }, rewardGold: 38, rewardFood: 1, title: '菜攤補貨' },
    { need: { flower: 3 }, rewardGold: 48, rewardFood: 0, title: '花市訂購' },
    { need: { herb: 3 }, rewardGold: 42, rewardFood: 0, title: '藥廬草料' },
    { need: { wheat: 4 }, rewardGold: 36, rewardFood: 2, title: '磨坊麥單' }
  ];

  let S = null;
  let mode = 'farm';
  let autoOn = false;
  let selectedCrop = 'rice';
  let directive = 'grain';
  let selectedNpc = 'he';
  let sayMode = 'say';
  let battle = null;
  let toastTimer = 0;
  let lastTick = 0;

  const $ = (id) => document.getElementById(id);
  const canvas = () => $('farm');
  const ctx = () => canvas() && canvas().getContext('2d');

  function toast(msg) {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
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
    const season = SEASONS[Math.floor((S.day - 1) / 28) % 4];
    const d = ((S.day - 1) % 28) + 1;
    return season + ' · 第' + d + '日';
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
      const g = Object.assign({ id: 'g0', slot: C.startGear.slot }, C.startGear);
      gear.push(g);
      equipped[g.slot] = g.id;
    }
    const quest = Object.assign({ done: false, progress: 0 }, C.quest);
    const st = {
      v: 2,
      career: careerId,
      name: '豆豆',
      day: 1,
      gold: C.gold,
      food: C.food,
      hp: C.hp,
      maxHp: C.hp,
      baseAtk: C.atk,
      baseDef: C.def,
      skills: Object.assign({}, C.skills),
      bag: Object.assign({ rice: 0, veg: 0, flower: 0, wheat: 0, herb: 0, ore: 0, potion: 0 }, C.bag),
      plots: makePlots(8 + (C.skills.farm || 0)),
      plotCount: 8 + (C.skills.farm || 0),
      auto: false,
      directive: 'grain',
      npcs: NPCS.reduce((a, n) => { a[n.id] = { aff: C.id === 'scholar' ? 8 : 0, mem: [], talked: 0 }; return a; }, {}),
      order: rollOrder(1),
      orderDone: false,
      gear,
      equipped,
      gearSeq: 1,
      wildFloor: 1,
      wildBest: 0,
      wins: 0,
      soldGold: 0,
      quest,
      flags: {},
      fame: Math.min(20, Math.floor(C.gold / 20)),
      people: C.id === 'scholar' ? 14 : (C.id === 'healer' ? 12 : 8),
      factions: { lu: 0, qin: C.id === 'soldier' ? 6 : 0, sai: C.id === 'merchant' ? 4 : 0 },
      joined: null,
      worldLine: '天下初定，邊野尚安。',
      endings: [],
      seenEvents: {},
      dayActs: { farm: 0, sell: 0, gift: 0, heal: 0, fight: 0, trade: 0, order: 0 },
      factionQuest: null,
      pendingEvent: null,
      hands: 0
    };
    if (window.QianFactions) window.QianFactions.ensure(st);
    return st;
  }

  function rollOrder(day) {
    const o = ORDER_POOL[day % ORDER_POOL.length];
    return JSON.parse(JSON.stringify(o));
  }

  function migrateSave(o) {
    if (!o) return null;
    if (o.v === 2) {
      if (o.hands == null) o.hands = 0;
      if (!o.npcs) o.npcs = {};
      NPCS.forEach(function (n) {
        if (!o.npcs[n.id]) o.npcs[n.id] = { aff: 0, mem: [], talked: 0 };
      });
      if (window.QianFactions) window.QianFactions.ensure(o);
      return o;
    }
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
      if (window.QianFactions) window.QianFactions.ensure(o);
      return o;
    }
    return null;
  }
  function save() {
    if (!S) return;
    S.auto = autoOn;
    S.directive = directive;
    S.v = 2;
    if (window.QianFactions) window.QianFactions.ensure(S);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); toast('已存檔'); } catch (e) { toast('存檔失敗'); }
  }
  function load() {
    try {
      let o = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (!o) {
        const old = JSON.parse(localStorage.getItem(SAVE_KEY_OLD) || 'null');
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
      return true;
    } catch (e) { return false; }
  }
  function hasSave() {
    try {
      const o = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (o && (o.v === 1 || o.v === 2)) return true;
      const old = JSON.parse(localStorage.getItem(SAVE_KEY_OLD) || 'null');
      return !!(old && old.v === 1);
    } catch (e) { return false; }
  }

  function gearBonus() {
    const b = { atk: 0, def: 0, hp: 0 };
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
    });
    return b;
  }
  function stats() {
    const b = gearBonus();
    const maxHp = S.maxHp + b.hp;
    return {
      atk: S.baseAtk + b.atk + (S.skills.mart || 0),
      def: S.baseDef + b.def,
      maxHp,
      hp: Math.min(S.hp, maxHp)
    };
  }

  function bagCount(k) { return (S.bag[k] || 0); }
  function addBag(k, n) { S.bag[k] = Math.max(0, (S.bag[k] || 0) + n); }

  function renderHUD() {
    if (!S) return;
    const st = stats();
    const season = SEASONS[seasonIdx()];
    $('hud-day').textContent = dayStr();
    if ($('hDaySeal')) $('hDaySeal').textContent = season;
    if ($('hPer')) $('hPer').textContent = PERIODS[S.day % 4];
    $('hud-gold').textContent = String(S.gold);
    $('hud-food').textContent = String(S.food);
    $('hud-combat').textContent = st.hp + '/' + st.maxHp + ' ·' + st.atk;
    $('hud-career').textContent = CAREERS[S.career].name;
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
    if ($('m-hp')) $('m-hp').style.width = hpPct + '%';
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
  }

  function setSceneArt(m) {
    const art = SCENE_ART[m] || SCENE_ART.village;
    $('scene-webp').srcset = art.webp + ASSET_V;
    $('scene-img').src = (art.jpg || art.webp) + ASSET_V;
    $('scene-img').alt = art.alt;
    const caps = {
      farm: ['春光滿阡', '夏畦茂盛', '秋穫將至', '冬雪守田'],
      village: ['春光滿村', '夏日邨景', '秋色入村', '冬雪覆簷'],
      market: ['京市晨喧', '夏日商影', '秋成買賣', '冬市炭香'],
      clinic: ['藥廬青煙', '夏草芬芳', '秋採山藥', '冬爐煎劑'],
      drill: ['校場塵起', '夏日練兵', '秋風習武', '冬日對樁'],
      wild: ['邊崖晨霧', '夏嶺虫鳴', '秋崖葉紅', '冬嶺寂寂'],
      garden: ['園林春色', '夏蔭清幽', '秋桂滿庭', '冬梅疏影'],
      swim: ['水塘春暖', '夏日濯足', '秋水澄明', '冬塘薄冰'],
      moon: ['花朝夜宴', '夏夜賞月', '中秋團圓', '冬夜燈影']
    };
    $('scene-caption').textContent = (caps[m] || caps.village)[seasonIdx()];
  }

  function showMode(m) {
    mode = m;
    document.querySelectorAll('.mode-tab').forEach((t) => t.classList.toggle('active', t.dataset.mode === m));
    document.querySelectorAll('#map-pins .pin').forEach((p) => p.classList.toggle('cur', p.dataset.mode === m));
    ['farm', 'village', 'market', 'clinic', 'drill', 'wild', 'garden', 'swim', 'moon'].forEach((id) => {
      const el = $(id + '-panel');
      if (el) el.hidden = id !== m;
    });
    const plot = $('plot-card');
    if (plot) plot.style.display = m === 'farm' ? '' : 'none';
    if ($('act-title')) $('act-title').textContent = MODE_LABELS[m] || '行事';
    $('adventure-scene').classList.toggle('mode-farm', m === 'farm');
    $('adventure-scene').classList.toggle('in-battle', !!(battle && (m === 'drill' || m === 'wild')));
    setSceneArt(m);
    updatePortraitForMode(m);
    if (m === 'farm') drawFarm();
    if (m === 'village') renderVillage();
    if (m === 'market' || m === 'clinic') renderCraft();
    if (m === 'drill' || m === 'wild') renderCombatPanel();
    if (LEISURE_MODES.includes(m)) renderLeisure(m);
    renderHUD();
    paintWorkers(true);
  }
  function renderLeisure(m) {
    if (!S) return;
    const st = $('leisure-stat-' + m) || $('leisure-stat');
    if (st) st.textContent = '體力 ' + S.hp + '/' + S.maxHp + ' · 銀' + S.gold + ' · 民心' + (S.people || 0);
  }
  function doLeisure(kind) {
    if (!S) return;
    if (kind === 'garden') {
      S.hp = Math.min(S.maxHp, S.hp + 8);
      if (window.QianFactions) window.QianFactions.bump(S, 'people', 1);
      toast('園林閒步 · 體力回復');
      pushStory('你在園林信步，心神稍定。', 'nar');
    } else if (kind === 'swim') {
      S.hp = Math.min(S.maxHp, S.hp + 14);
      if (S.food > 0 && Math.random() < 0.3) { S.food -= 1; }
      toast('水塘洗濯 · 體力大復');
      pushStory('清波濯足，暑氣盡去。', 'nar');
    } else if (kind === 'moon') {
      const cost = 12;
      if (S.gold < cost) { toast('銀兩不足辦宴'); return; }
      S.gold -= cost;
      if (window.QianFactions) {
        window.QianFactions.bump(S, 'fame', 2);
        window.QianFactions.bump(S, 'people', 2);
        window.QianFactions.recomputeFame(S);
      } else {
        S.fame = Math.min(100, (S.fame || 0) + 2);
        S.people = Math.min(100, (S.people || 0) + 2);
      }
      // 略增鄉鄰好感
      Object.keys(S.npcs || {}).forEach((id) => {
        if (Math.random() < 0.45) S.npcs[id].aff = Math.min(100, (S.npcs[id].aff || 0) + 1);
      });
      toast('夜宴辦成 · 名聲民心↑');
      pushStory('燈影月華，席間談笑。有人記起了你的名字。', 'nar');
    }
    renderLeisure(mode);
    renderHUD();
    saveQuiet();
  }
  function updatePortraitForMode(m) {
    const char = $('vn-char');
    const img = $('portrait-img');
    const plate = $('nameplate');
    const np = $('np-name');
    if (!char || !img) return;
    char.classList.remove('npc', 'face-mode', 'tint-su', 'tint-zhao');
    if (plate) plate.classList.remove('npc');
    if (m === 'village' && selectedNpc) {
      const n = NPCS.find((x) => x.id === selectedNpc);
      if (n) {
        char.classList.add('npc', 'face-mode');
        img.src = faceUrl(npcFaceKey(n));
        img.alt = n.name;
        if (plate) plate.classList.add('npc');
        if (np) np.textContent = n.name;
        return;
      }
    }
    // 場景默認：主角全身（略小），非對話時不佔滿屏
    char.classList.remove('face-mode');
    img.src = 'assets/char_hero.webp?v=' + FACE_V;
    img.alt = (S && S.name) || '你';
    if (np) np.textContent = (S && S.name) || '你';
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
    return '<img class="face-thumb" src="' + faceUrl(faceKey) + '" alt="' + (name || '') + '" width="40" height="40" decoding="async">';
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
    openSheet('sheet-act');
    if (mode === 'farm') requestAnimationFrame(drawFarm);
  }
  function openMapSheet() {
    if ($('map-date')) $('map-date').textContent = dayStr();
    document.querySelectorAll('#map-pins .pin').forEach((p) => p.classList.toggle('cur', p.dataset.mode === mode));
    openSheet('sheet-map');
  }
  function renderPplModal() {
    const list = $('ppl-list');
    if (!list || !S) return;
    list.innerHTML = NPCS.map((n) => {
      const st = S.npcs[n.id] || { aff: 0 };
      const pct = Math.min(100, st.aff);
      return '<button type="button" class="villager-card' + (selectedNpc === n.id ? ' active' : '') + '" data-npc="' + n.id + '">' +
        '<div class="villager-row">' + faceThumbHtml(npcFaceKey(n), n.name) +
        '<div class="villager-meta"><b>' + n.name + '</b> <span class="muted">' + n.role + '</span>' +
        '<div class="aff-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="aff-num">好感 ' + st.aff + '</div></div></div></button>';
    }).join('');
    list.querySelectorAll('[data-npc]').forEach((b) => {
      b.addEventListener('click', () => {
        selectedNpc = b.dataset.npc;
        renderPplModal();
        updatePortraitForMode(mode);
      });
    });
  }
  function freeSend() {
    const input = $('free-input');
    if (!input) return;
    const text = (input.value || '').trim();
    if (!text) { toast('請先輸入'); return; }
    // sync say mode from chip
    const chip = $('mode-chip');
    if (chip) sayMode = chip.dataset.say || 'say';
    // ensure village context for talk
    if (mode !== 'village') {
      showMode('village');
    }
    $('talk-input').value = text;
    input.value = '';
    // open talk UI lightly then send
    if ($('modal-talk').hidden) openTalk();
    sendTalk();
  }

  /* ---- Farm canvas ---- */
  function drawFarm() {
    const c = canvas();
    if (!c || !S) return;
    const g = ctx();
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
      // soil
      const grd = g.createLinearGradient(x, y, x, y + th);
      grd.addColorStop(0, '#a1887f');
      grd.addColorStop(1, '#6d4c41');
      g.fillStyle = grd;
      roundRect(g, x + 2, y + 2, tw - 4, th - 4, 7);
      g.fill();
      g.strokeStyle = '#c9a227';
      g.lineWidth = 1.5;
      g.stroke();
      if (p.watered) {
        g.fillStyle = 'rgba(100,180,255,.28)';
        roundRect(g, x + 2, y + 2, tw - 4, th - 4, 7);
        g.fill();
      }
      if (p.crop) {
        const crop = CROPS[p.crop];
        const ripe = p.grow >= crop.grow;
        const prog = Math.min(1, p.grow / crop.grow);
        g.fillStyle = ripe ? crop.ripe : crop.color;
        const r = 4 + prog * 8;
        g.beginPath();
        g.arc(x + tw / 2, y + th / 2 + 2, r, 0, Math.PI * 2);
        g.fill();
        if (ripe) {
          g.fillStyle = 'rgba(255,236,150,.7)';
          g.beginPath();
          g.arc(x + tw / 2 + 6, y + th / 2 - 6, 3, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = '#fff8e1';
        g.font = 'bold 10px sans-serif';
        g.textAlign = 'center';
        g.fillText(crop.name, x + tw / 2, y + 12);
      }
    });
    if (window.QianWorkers) window.QianWorkers.drawOnFarmCanvas(g, W, H, S, COLS, ROWS);
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
    const crop = CROPS[p.crop];
    const bonus = 1 + Math.floor((S.skills.farm || 0) / 3);
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
  function nextDay() {
    if (battle) { toast('戰鬥中不可過日'); return; }
    growDay();
    if (window.QianFactions) {
      window.QianFactions.noteAct(S, 'farm');
      const line = window.QianFactions.worldTick(S);
      pushStory('天下大勢：' + line, 'sys');
    }
    S.day++;
    S.orderDone = false;
    if ((S.day - 1) % 1 === 0) S.order = rollOrder(S.day);
    // light food drain
    S.food = Math.max(0, S.food - 1);
    if (S.food === 0 && S.gold >= 5) { S.gold -= 5; S.food += 3; toast('無糧，市買粗食 -5銀'); }
    const st = stats();
    S.hp = Math.min(st.maxHp, S.hp + 8);
    toast(dayStr());
    checkQuest();
    drawFarm();
    renderVillage();
    renderHUD();
    saveQuiet();
    maybeTriggerVisit();
  }
  function maybeTriggerVisit() {
    if (!S || !window.QianFactions) return;
    if (S.pendingEvent) { openEventModal(S.pendingEvent); return; }
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
    title.textContent = ev.title;
    body.textContent = ev.body;
    choices.innerHTML = (ev.choices || []).map((c) =>
      '<button type="button" class="btn event-choice" data-eid="' + ev.id + '" data-cid="' + c.id + '">' + c.label + '</button>'
    ).join('');
    choices.querySelectorAll('[data-cid]').forEach((b) => {
      b.addEventListener('click', () => resolveEventChoice(ev, b.dataset.cid));
    });
    $('modal-event').hidden = false;
    pushStory('【來訪】' + ev.title, 'sys');
  }
  function resolveEventChoice(ev, choiceId) {
    if (!window.QianFactions) return;
    const r = window.QianFactions.applyChoice(S, ev, choiceId);
    $('modal-event').hidden = true;
    if (r.line) { status(r.line); pushStory(r.line, 'nar'); }
    if (r.toast) toast(r.toast);
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
    if (!S || !window.QianFactions) return;
    window.QianFactions.ensure(S);
    window.QianFactions.recomputeFame(S);
    const F = window.QianFactions.FACTIONS;
    const box = $('world-body');
    if (!box) return;
    const joined = S.joined ? F[S.joined].full : '無（獨立耕織）';
    box.innerHTML =
      '<div class="quest-item"><strong>天下大勢</strong><p>' + escapeHtml(S.worldLine || '') + '</p></div>' +
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
    $('modal-world').hidden = false;
  }
  function openEndingsModal() {
    if (!S || !window.QianFactions) return;
    window.QianFactions.checkEndings(S);
    const list = window.QianFactions.endingList(S);
    const box = $('endings-body');
    if (!box) return;
    box.innerHTML = list.map((e) =>
      '<div class="quest-item' + (e.unlocked ? ' done' : '') + '">' +
      '<strong>' + (e.unlocked ? '✓ ' : '？ ') + e.name + '</strong>' +
      '<span class="muted"> · ' + (e.tier === 'late' ? '遠途' : '中途') + '</span>' +
      '<p>' + (e.unlocked ? escapeHtml(e.when) : '條件未顯……') + '</p></div>'
    ).join('');
    $('modal-endings').hidden = false;
  }
  function saveQuiet() {
    if (!S) return;
    S.auto = autoOn; S.directive = directive; S.v = 2;
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
    const board = $('order-board');
    if (S.orderDone) {
      board.innerHTML = '<strong>今日日令</strong><p>已交付，明日再來。</p>';
    } else {
      const need = Object.keys(S.order.need).map((k) => itemName(k) + '×' + S.order.need[k] + '（有' + bagCount(k) + '）').join('、');
      board.innerHTML = '<strong>' + S.order.title + '</strong><p>需：' + need + '</p><p>酬：銀' + S.order.rewardGold + (S.order.rewardFood ? ' · 糧' + S.order.rewardFood : '') + '</p>';
    }
    const list = $('npc-list');
    list.innerHTML = NPCS.map((n) => {
      const st = S.npcs[n.id] || { aff: 0 };
      const sel = n.id === selectedNpc ? ' active' : '';
      return '<button type="button" class="villager-card' + sel + '" data-npc="' + n.id + '">' +
        '<div class="villager-row">' + faceThumbHtml(npcFaceKey(n), n.name) +
        '<div class="villager-meta"><strong>' + n.name + '</strong> <span class="muted">' + n.role + '</span>' +
        '<div class="aff-bar"><i style="width:' + Math.min(100, st.aff) + '%"></i></div>' +
        '<span class="aff-num">好感 ' + st.aff + '</span></div></div></button>';
    }).join('');
    list.querySelectorAll('[data-npc]').forEach((b) => {
      b.addEventListener('click', () => { selectedNpc = b.dataset.npc; renderVillage(); updatePortraitForMode('village'); });
    });
  }
  function itemName(k) {
    if (CROPS[k]) return CROPS[k].name;
    if (k === 'herb') return '草藥';
    if (k === 'ore') return '礦石';
    if (k === 'potion') return '回春散';
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
    const n = NPCS.find((x) => x.id === selectedNpc);
    $('talk-npc-name').textContent = n.name + ' · ' + n.role;
    setTalkFace(n);
    updatePortraitForMode('village');
    pushStory('與' + n.name + '相對而坐……', 'sys');
    const log = $('talk-log');
    log.innerHTML = '<div class="talk-line sys">與' + n.name + '相對而坐……</div>';
    const st = S.npcs[selectedNpc];
    if (st.mem.length) {
      log.innerHTML += '<div class="talk-line sys">記憶：' + st.mem.slice(-3).join('；') + '</div>';
    }
    $('quick-replies').innerHTML = [
      '近日可好？', '村里可有新聞？', '請教生計', '告辭'
    ].map((t) => '<button type="button" data-q="' + t + '">' + t + '</button>').join('');
    $('quick-replies').querySelectorAll('[data-q]').forEach((b) => {
      b.addEventListener('click', () => {
        $('talk-input').value = b.dataset.q;
        sendTalk();
      });
    });
    $('modal-talk').hidden = false;
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
        const r = await AI.npcReply({
          npcName: npc.name, npcRole: npc.role, aff: st.aff,
          mem: st.mem.slice(-4).join('；'),
          mode: sayMode === 'cmd' ? 'cmd' : 'say',
          text, career: CAREERS[S.career].name, dayStr: dayStr(),
          factionStance: window.QianFactions ? window.QianFactions.stanceText(S) : ''
        });
        // remove sys
        const log = $('talk-log');
        if (log.lastChild && log.lastChild.classList.contains('sys')) log.removeChild(log.lastChild);
        appendTalk(npc.name, r.text);
        st.aff = Math.min(100, st.aff + (sayMode === 'cmd' ? 2 : 1));
        st.mem.push((sayMode === 'cmd' ? '指令：' : '談：') + text.slice(0, 20));
        if (st.mem.length > 8) st.mem = st.mem.slice(-8);
        st.talked++;
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
  function renderCraft() {
    const listId = mode === 'clinic' ? 'clinic-list' : 'craft-list';
    const list = $(listId);
    if (!list) return;
    const recipes = RECIPES.filter((r) => r.scene === (mode === 'clinic' ? 'clinic' : 'market') || (mode === 'clinic' && r.id === 'potion'));
    const show = mode === 'clinic' ? RECIPES.filter((r) => r.scene === 'clinic') : RECIPES.filter((r) => r.scene === 'market');
    list.innerHTML = show.map((r) => {
      const need = Object.keys(r.needs).map((k) => itemName(k) + bagCount(k) + '/' + r.needs[k]).join(' ');
      return '<button type="button" class="craft-item" data-craft="' + r.id + '"><strong>' + r.name + '</strong><span>' + r.desc + '</span><span class="need">' + need + '</span></button>';
    }).join('');
    list.querySelectorAll('[data-craft]').forEach((b) => {
      b.addEventListener('click', () => doCraft(b.dataset.craft));
    });
  }
  function doCraft(id) {
    const r = RECIPES.find((x) => x.id === id);
    if (!r) return;
    for (const k of Object.keys(r.needs)) {
      if (bagCount(k) < r.needs[k]) { toast('材料不足'); return; }
    }
    Object.keys(r.needs).forEach((k) => addBag(k, -r.needs[k]));
    if (r.out) Object.keys(r.out).forEach((k) => {
      if (k === 'food') S.food += r.out[k];
      else addBag(k, r.out[k]);
    });
    if (r.heal) {
      const st = stats();
      S.hp = Math.min(st.maxHp, S.hp + r.heal);
    }
    // healer bonus
    if (S.career === 'healer' && id === 'potion') addBag('potion', 1);
    if (id === 'potion' && S.flags) S.flags.saiPotion = (S.flags.saiPotion || 0) + 1 + (S.career === 'healer' ? 1 : 0);
    if (window.QianFactions) {
      window.QianFactions.noteAct(S, id === 'potion' ? 'heal' : 'trade');
      const fq = window.QianFactions.checkFactionQuest(S);
      if (fq) toast('勢力差事完成：' + fq.title);
    }
    toast('製成 ' + r.name);
    checkQuest();
    renderCraft();
    renderHUD();
  }
  function gatherHerb() {
    const n = 1 + Math.floor(Math.random() * 2) + (S.skills.med > 1 ? 1 : 0);
    addBag('herb', n);
    toast('採得草藥 ×' + n);
    renderCraft();
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

  /* ---- Combat ---- */
  function renderCombatPanel() {
    $('drill-stat').textContent = battle && battle.where === 'drill' ? '對練中' : '校場練兵';
    $('drill-gear').textContent = '裝備 ' + S.gear.length;
    $('wild-floor').textContent = '山層 ' + S.wildFloor;
    $('wild-best').textContent = '最深 ' + S.wildBest;
    $('wild-gear').textContent = '裝備 ' + S.gear.length;
    const inB = !!battle;
    $('btn-flee-drill').hidden = !(inB && battle.where === 'drill');
    $('btn-flee-wild').hidden = !(inB && battle.where === 'wild');
    $('battle-hud').hidden = !inB;
  }

  function startBattle(where) {
    if (battle) return;
    const floor = where === 'wild' ? S.wildFloor : 1;
    const pool = where === 'wild' ? ENEMIES_WILD : ENEMIES_DRILL;
    const idx = Math.min(pool.length - 1, floor - 1 + Math.floor(Math.random() * 2));
    const base = pool[idx];
    const scale = where === 'wild' ? 1 + (floor - 1) * 0.18 : 1;
    const st = stats();
    S.hp = Math.min(S.hp, st.maxHp);
    battle = {
      where,
      wave: 1,
      maxWave: where === 'wild' ? 3 : 2,
      enemy: { name: base.name, maxHp: Math.floor(base.hp * scale), hp: Math.floor(base.hp * scale), atk: Math.floor(base.atk * scale) },
      log: [],
      autoTimer: 0
    };
    $('adventure-scene').classList.add('in-battle');
    $('battle-hud').hidden = false;
    updateBattleHUD('遇敵：' + battle.enemy.name);
    renderCombatPanel();
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
    const st = stats();
    const dmg = Math.max(1, st.atk - Math.floor(battle.enemy.atk * 0.05) + Math.floor(Math.random() * 4));
    battle.enemy.hp = Math.max(0, battle.enemy.hp - dmg);
    updateBattleHUD('你造成 ' + dmg + ' 傷');
    if (battle.enemy.hp <= 0) { onEnemyDown(); return; }
    enemyAttack();
  }
  function enemyAttack() {
    if (!battle) return;
    const st = stats();
    const dmg = Math.max(1, battle.enemy.atk - st.def + Math.floor(Math.random() * 3));
    S.hp = Math.max(0, S.hp - dmg);
    updateBattleHUD(battle.enemy.name + '擊你 ' + dmg);
    if (S.hp <= 0) {
      toast('戰敗…回村休養');
      S.hp = Math.max(1, Math.floor(st.maxHp * 0.3));
      endBattle(false);
    }
    renderHUD();
  }
  function onEnemyDown() {
    updateBattleHUD('擊敗 ' + battle.enemy.name);
    if (battle.wave >= battle.maxWave) {
      winBattle();
    } else {
      battle.wave++;
      const pool = battle.where === 'wild' ? ENEMIES_WILD : ENEMIES_DRILL;
      const floor = battle.where === 'wild' ? S.wildFloor : 1;
      const base = pool[Math.min(pool.length - 1, battle.wave + floor - 2)];
      const scale = battle.where === 'wild' ? 1 + (floor - 1) * 0.18 : 1;
      battle.enemy = { name: base.name, maxHp: Math.floor(base.hp * scale * 1.05), hp: Math.floor(base.hp * scale * 1.05), atk: Math.floor(base.atk * scale) };
      updateBattleHUD('下一波：' + battle.enemy.name);
    }
  }
  function winBattle() {
    S.wins = (S.wins || 0) + 1;
    const where = battle.where;
    const floor = where === 'wild' ? S.wildFloor : 1;
    let gold = 12 + floor * 6 + Math.floor(Math.random() * 10);
    if (S.skills.trade) gold += S.skills.trade * 2;
    S.gold += gold;
    S.soldGold = (S.soldGold || 0) + gold;
    const gear = rollDrop(where, floor);
    if (gear) S.gear.push(gear);
    if (where === 'wild') S.wildBest = Math.max(S.wildBest, S.wildFloor);
    // chance herb/ore
    if (Math.random() < 0.4) addBag('ore', 1 + Math.floor(Math.random() * 2));
    if (Math.random() < 0.3) addBag('herb', 1);
    showLoot(gold, gear);
    endBattle(true);
    if (window.QianFactions) {
      window.QianFactions.noteAct(S, 'fight');
      window.QianFactions.recomputeFame(S);
      window.QianFactions.checkFactionQuest(S);
    }
    checkQuest();
  }
  function rollDrop(where, floor) {
    const roll = Math.random();
    let rarity = 'white';
    const bonus = where === 'wild' ? floor * 0.03 : 0;
    if (roll > 0.97 - bonus) rarity = 'gold';
    else if (roll > 0.90 - bonus) rarity = 'purple';
    else if (roll > 0.75 - bonus) rarity = 'blue';
    else if (roll > 0.50 - bonus) rarity = 'green';
    if (where === 'drill' && rarity === 'gold') rarity = 'blue';
    const slots = ['weapon', 'armor', 'accessory'];
    const slot = slots[Math.floor(Math.random() * slots.length)];
    const base = GEAR_BASE[slot][Math.min(GEAR_BASE[slot].length - 1, Math.floor(Math.random() * (1 + floor / 2)))];
    S.gearSeq++;
    return {
      id: 'g' + S.gearSeq,
      slot,
      name: base.name,
      atk: base.atk, def: base.def, hp: base.hp,
      rarity
    };
  }
  function showLoot(gold, gear) {
    $('loot-body').textContent = '銀 +' + gold + (gear ? '' : ' · 無裝備掉落');
    const box = $('loot-gear');
    if (gear) {
      const r = RARITIES[gear.rarity];
      box.innerHTML = '<div class="gear-card ' + r.className + '">【' + r.name + '】' + SLOT_LABEL[gear.slot] + ' · ' + gear.name +
        '<br>ATK+' + Math.round(gear.atk * r.mult) + ' DEF+' + Math.round(gear.def * r.mult) + ' HP+' + Math.round(gear.hp * r.mult) + '</div>';
    } else box.innerHTML = '';
    $('modal-loot').hidden = false;
  }
  function endBattle() {
    battle = null;
    $('battle-hud').hidden = true;
    $('adventure-scene').classList.remove('in-battle');
    renderCombatPanel();
    renderHUD();
    saveQuiet();
  }
  function fleeBattle() {
    if (!battle) return;
    toast('撤退');
    endBattle();
  }
  function autoFightStep() {
    if (!battle) {
      if (mode === 'drill' || mode === 'wild') startBattle(mode === 'drill' ? 'drill' : 'wild');
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
  function openBag() {
    const st = stats();
    $('combat-summary').textContent = 'HP ' + st.hp + '/' + st.maxHp + ' · ATK ' + st.atk + ' · DEF ' + st.def;
    $('equip-slots').innerHTML = ['weapon', 'armor', 'accessory'].map((slot) => {
      const id = S.equipped[slot];
      const g = id && S.gear.find((x) => x.id === id);
      return '<div class="equip-slot"><span>' + SLOT_LABEL[slot] + '</span><strong>' + (g ? g.name + '（' + RARITIES[g.rarity].name + '）' : '空') + '</strong></div>';
    }).join('');
    $('bag-grid').innerHTML = Object.keys(S.bag).filter((k) => S.bag[k] > 0).map((k) =>
      '<div class="bag-item">' + itemName(k) + ' <b>×' + S.bag[k] + '</b></div>'
    ).join('') || '<p class="muted">空空如也</p>';
    $('gear-list').innerHTML = S.gear.map((g) => {
      const r = RARITIES[g.rarity];
      const on = S.equipped[g.slot] === g.id;
      return '<button type="button" class="gear-card ' + r.className + (on ? ' on' : '') + '" data-gid="' + g.id + '">' +
        (on ? '【裝】' : '') + '【' + r.name + '】' + g.name + ' · ' + SLOT_LABEL[g.slot] + '</button>';
    }).join('') || '<p class="muted">尚無裝備</p>';
    $('gear-list').querySelectorAll('[data-gid]').forEach((b) => {
      b.addEventListener('click', () => {
        const g = S.gear.find((x) => x.id === b.dataset.gid);
        if (!g) return;
        if (S.equipped[g.slot] === g.id) S.equipped[g.slot] = null;
        else S.equipped[g.slot] = g.id;
        const st2 = stats();
        S.hp = Math.min(S.hp, st2.maxHp);
        openBag();
        renderHUD();
      });
    });
    $('modal-bag').hidden = false;
  }
  function openQuest() {
    checkQuest();
    if (window.QianFactions) window.QianFactions.checkFactionQuest(S);
    const q = S.quest;
    let body = '<div class="quest-item' + (q.done ? ' done' : '') + '"><strong>' + q.title + '</strong><p>' + q.desc + '</p>';
    if (q.done) body += '<p class="ok">已完成</p>';
    else body += '<p>酬：銀' + q.gold + ' · 糧' + q.food + '</p>';
    body += '</div>';
    if (S.factionQuest) {
      const fq = S.factionQuest;
      body += '<div class="quest-item' + (fq.done ? ' done' : '') + '"><strong>【勢力】' + fq.title + '</strong><p>' + fq.desc + '</p>';
      body += '<p>酬：銀' + fq.gold + (fq.food ? ' · 糧' + fq.food : '') + '</p></div>';
    } else if (!S.joined) {
      body += '<div class="quest-item"><strong>勢力</strong><p>尚未加入任何一方。聲名漸起時，呂黨／王府／邊市盟或將來訪。</p></div>';
    }
    body += '<div class="quest-item"><strong>累計</strong><p>勝場 ' + (S.wins || 0) + ' · 賣銀 ' + (S.soldGold || 0) + ' · 最深山層 ' + S.wildBest +
      ' · 名' + Math.floor(S.fame || 0) + ' · 民' + Math.floor(S.people || 0) + '</p></div>';
    if (S.worldLine) body += '<div class="quest-item"><strong>天下大勢</strong><p>' + escapeHtml(S.worldLine) + '</p></div>';
    $('quest-list').innerHTML = body;
    $('modal-quest').hidden = false;
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
    if (window.QianFactions && Math.random() < 0.04) {
      const pref = window.QianFactions.autoPriority(S);
      if (pref && pref !== mode) showMode(pref);
    }
    if (mode === 'farm') autoFarmStep();
    else if (mode === 'village') autoVillageStep();
    else if (mode === 'market') autoMarketStep();
    else if (mode === 'clinic') autoClinicStep();
    else if (mode === 'drill' || mode === 'wild') autoFightStep();
    else if (LEISURE_MODES.includes(mode) && Math.random() < 0.35) doLeisure(mode);
    // slow day advance while farming auto
    if (mode === 'farm' && Math.random() < 0.08) nextDay();
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

  /* ---- Screens ---- */
  function showTitle() {
    $('screen-title').hidden = false;
    $('screen-career').hidden = true;
    $('screen-game').hidden = true;
    closeSheets();
    $('btn-continue').hidden = !hasSave();
  }
  function showCareer() {
    $('screen-title').hidden = true;
    $('screen-career').hidden = false;
    $('screen-game').hidden = true;
    const grid = $('career-grid');
    grid.innerHTML = Object.values(CAREERS).map((c) =>
      '<button type="button" class="career-card" data-career="' + c.id + '">' +
      '<h3>' + c.name + '</h3><p>' + c.desc + '</p>' +
      '<div class="stats">銀' + c.gold + ' · 糧' + c.food + ' · HP' + c.hp + ' · ATK' + c.atk + '</div></button>'
    ).join('');
    grid.querySelectorAll('[data-career]').forEach((b) => {
      b.addEventListener('click', () => startGame(b.dataset.career));
    });
  }
  function startGame(careerId) {
    S = newState(careerId);
    autoOn = false;
    directive = 'grain';
    mode = 'farm';
    $('screen-career').hidden = true;
    $('screen-title').hidden = true;
    $('screen-game').hidden = false;
    document.querySelectorAll('.dir').forEach((d) => d.classList.toggle('active', d.dataset.dir === directive));
    showMode('farm');
    status('以' + CAREERS[careerId].name + '之身，立於青阡。聲名未起時，且耕且讀；名利漸顯，車馬或至。');
    toast('開局 · ' + CAREERS[careerId].name);
    saveQuiet();
    setTimeout(openActSheet, 350);
  }
  function continueGame() {
    if (!load()) { toast('無存檔'); return; }
    $('screen-title').hidden = true;
    $('screen-game').hidden = false;
    document.querySelectorAll('.dir').forEach((d) => d.classList.toggle('active', d.dataset.dir === directive));
    showMode('farm');
    toast('繼續 · ' + dayStr());
    pushStory('續寫 · ' + dayStr(), 'sys');
    if (S.worldLine) pushStory('天下大勢：' + S.worldLine, 'sys');
    setTimeout(maybeTriggerVisit, 600);
  }

  function toggleAuto() {
    autoOn = !autoOn;
    renderHUD();
    toast(autoOn ? 'AUTO 開' : 'AUTO 關');
  }

  /* ---- Bind ---- */
  function bind() {
    $('btn-new').addEventListener('click', showCareer);
    $('btn-continue').addEventListener('click', continueGame);
    $('btn-career-back').addEventListener('click', showTitle);
    $('btn-settings-title').addEventListener('click', openSettings);
    $('btn-settings-game').addEventListener('click', () => { $('modal-menu').hidden = true; openSettings(); });
    $('btn-menu').addEventListener('click', () => { $('modal-menu').hidden = false; });
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

    ['btn-auto', 'btn-auto-v', 'btn-auto-mkt', 'btn-auto-clinic', 'btn-auto-drill', 'btn-auto-wild', 'btn-auto-garden', 'btn-auto-swim', 'btn-auto-moon'].forEach((id) => {
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
    $('btn-gift-npc').addEventListener('click', giftNpc);
    $('btn-submit-order').addEventListener('click', submitOrder);
    $('btn-close-talk').addEventListener('click', () => { $('modal-talk').hidden = true; });
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
    $('btn-deeper').addEventListener('click', () => {
      if (battle) { toast('戰鬥中'); return; }
      S.wildFloor++;
      toast('深入山層 ' + S.wildFloor);
      renderCombatPanel();
    });

    // manual attack while in battle: tap scene
    $('adventure-scene').addEventListener('click', () => {
      if (battle && !autoOn) playerAttack();
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
    if ($('tab-map')) $('tab-map').addEventListener('click', openMapSheet);
    if ($('q-act')) $('q-act').addEventListener('click', openActSheet);
    if ($('hSeal')) $('hSeal').addEventListener('click', openActSheet);
    if ($('map-x')) $('map-x').addEventListener('click', closeSheets);
    if ($('act-x')) $('act-x').addEventListener('click', closeSheets);
    document.querySelectorAll('#map-pins .pin').forEach((p) => {
      p.addEventListener('click', () => {
        showMode(p.dataset.mode);
        closeSheets();
        openActSheet();
        pushStory('前往' + (MODE_LABELS[p.dataset.mode] || '') + '。', 'sys');
      });
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
  }

  // villager-card style inject if missing
  function ensureExtraCss() { /* guofeng styles live in style.css */ }

  ensureExtraCss();
  bind();
  showTitle();
  requestAnimationFrame(tick);
})();
