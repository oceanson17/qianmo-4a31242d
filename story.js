/* 青阡 · 劇情／支線／門檻／相識 */
(function (global) {
  'use strict';

  /* 開局已識：鄉野原班 */
  var START_KNOWN = ['he', 'su', 'zhao', 'lin', 'wu', 'cheng'];

  /* 需劇情／場景見過才「相識」；未識時人脈顯示？？？ */
  var NEED_MEET = [
    'yingzheng', 'lubuwei', 'zhaoji', 'laoai', 'lisi', 'wangjian', 'mengtian', 'mengyi',
    'changping', 'changwen', 'chengjiao', 'zhengguo', 'hanfei_scroll',
    'tingzhang', 'sefu', 'shili', 'junhou', 'yiguan', 'guren', 'gongjiang', 'youxia',
    'sai_envoy', 'chu_envoy', 'qi_guest', 'neishi', 'menke'
  ];

  /* 地點門檻：不能隨便進 */
  var GATES = {
    palace: {
      name: '宮城外',
      blurb: '衛士森嚴，尋常編戶不得近前。',
      bribe: 28, agi: 3, med: 2, anesthetic: 1
    },
    xiangbang: {
      name: '相邦府',
      blurb: '相邦府門客雲集，無名刺者多被攔下。',
      bribe: 22, agi: 2, med: 2, anesthetic: 1
    },
    taihou: {
      name: '太后宮外',
      blurb: '太后宮牆外亦有私門眼線。',
      bribe: 30, agi: 4, med: 3, anesthetic: 1
    },
    guowei: {
      name: '國尉府',
      blurb: '軍政重地，無公文難入。',
      bribe: 20, agi: 3, med: 2, anesthetic: 1
    },
    ying: {
      name: '軍營',
      blurb: '營門盤查嚴，閒人止步。',
      bribe: 18, agi: 2, med: 2, anesthetic: 1
    }
  };

  /* 主線／支線模板 */
  var STORY_QUESTS = [
    {
      id: 'sq_xianyang',
      title: '初入咸陽',
      desc: '前往咸陽一遊，見識都城氣象。',
      type: 'main',
      check: function (S) { return !!(S.flags && S.flags.visited_xianyang); },
      reward: { gold: 25, fame: 3 },
      unlockNpc: ['neishi']
    },
    {
      id: 'sq_xiangbang_gate',
      title: '相邦門檻',
      desc: '設法進入相邦府（收買／輕功／麻醉／通行證皆可）。',
      type: 'main',
      check: function (S) { return !!(S.access && S.access.xiangbang); },
      reward: { gold: 30, fame: 4 },
      unlockNpc: ['menke', 'lubuwei']
    },
    {
      id: 'sq_taihou_rumor',
      title: '太后宮外傳聞',
      desc: '抵達太后宮外，或打聽宮爭影。',
      type: 'main',
      check: function (S) { return !!(S.flags && (S.flags.visited_taihou || S.flags.taihou_spy)); },
      reward: { gold: 20, fame: 3 },
      unlockNpc: ['zhaoji']
    },
    {
      id: 'sq_zhengguo',
      title: '鄭國渠工匠',
      desc: '至河津問水工，或與鄭國相識。',
      type: 'main',
      check: function (S) {
        return !!(S.flags && S.flags.canal_ask) ||
          (S.npcs && S.npcs.zhengguo && S.npcs.zhengguo.known);
      },
      reward: { gold: 35, people: 3 },
      unlockNpc: ['zhengguo']
    },
    {
      id: 'sq_keguan',
      title: '六國客館',
      desc: '造訪客館，結識使團或賓客。',
      type: 'main',
      check: function (S) { return !!(S.flags && S.flags.visited_keguan); },
      reward: { gold: 22, fame: 2 },
      unlockNpc: ['changping', 'chu_envoy']
    },
    {
      id: 'sq_yingzheng',
      title: '少年秦王一見',
      desc: '進入宮城外後，設法與少年秦王對談（或投書後於宮外見一面）。',
      type: 'main',
      check: function (S) {
        return !!(S.npcs && S.npcs.yingzheng && (S.npcs.yingzheng.talked > 0 || S.npcs.yingzheng.known));
      },
      reward: { gold: 50, fame: 8 },
      unlockNpc: ['yingzheng', 'chengjiao']
    },
    {
      id: 'sq_clinic',
      title: '義診施藥',
      desc: '在藥廬完成一次義診。',
      type: 'side',
      check: function (S) { return !!(S.flags && S.flags.charity); },
      reward: { gold: 15, people: 4 },
      unlockNpc: ['yiguan', 'su']
    },
    {
      id: 'sq_smuggle',
      title: '邊市走私影',
      desc: '於關市售出礦／藥，或與賈人馮交易。',
      type: 'side',
      check: function (S) { return !!(S.flags && S.flags.guanshi_deal); },
      reward: { gold: 28 },
      unlockNpc: ['guren', 'shili']
    },
    {
      id: 'sq_drill',
      title: '軍營比武',
      desc: '於校場或軍營戰勝 2 場。',
      type: 'side',
      check: function (S) { return (S.wins || 0) >= 2; },
      reward: { gold: 30, fame: 2 },
      unlockNpc: ['junhou', 'wangjian']
    },
    {
      id: 'sq_cimiao',
      title: '祠廟祈福',
      desc: '至祠廟祈福或賽祭一次。',
      type: 'side',
      check: function (S) { return !!(S.flags && S.flags.cimiao_pray); },
      reward: { gold: 12, people: 3 },
      unlockNpc: []
    },
    {
      id: 'sq_anesthetic',
      title: '麻藥初成',
      desc: '在藥廬煉成麻醉藥一帖。',
      type: 'side',
      check: function (S) { return !!(S.flags && S.flags.crafted_anesthetic); },
      reward: { gold: 18 },
      unlockNpc: ['yiguan']
    },
    {
      id: 'sq_post',
      title: '亭驛風聞',
      desc: '在驛站打聽傳聞一次。',
      type: 'side',
      check: function (S) { return !!(S.flags && S.flags.post_rumor); },
      reward: { gold: 10 },
      unlockNpc: ['tingzhang']
    },
    {
      id: 'sq_ruins_boss',
      title: '廢墟魁首',
      desc: '在廢墟擊敗一隻 Boss。',
      type: 'side',
      check: function (S) { return !!(S.explore && S.explore.bosses && S.explore.bosses.ruins); },
      reward: { gold: 40, fame: 3 },
      unlockNpc: ['youxia']
    },
    {
      id: 'sq_hut_rest',
      title: '陋室歇息',
      desc: '回陋室休息一次恢復體力。',
      type: 'side',
      check: function (S) { return !!(S.flags && S.flags.hut_rest); },
      reward: { gold: 8 },
      unlockNpc: []
    }
  ];

  function ensureNpcState(S, id) {
    if (!S.npcs) S.npcs = {};
    if (!S.npcs[id]) S.npcs[id] = { aff: 0, mem: [], talked: 0, known: false };
    if (S.npcs[id].known == null) S.npcs[id].known = false;
    return S.npcs[id];
  }

  function ensure(S) {
    if (!S) return S;
    if (!S.access) S.access = {};
    if (!S.flags) S.flags = {};
    if (!S.quests) S.quests = {};
    if (!S.skills) S.skills = {};
    if (S.skills.agi == null) {
      /* 輕功：出身／武學衍生 */
      S.skills.agi = Math.min(4, Math.floor((S.skills.mart || 0) / 2) + (S.career === 'ranger' || S.career === 'hunter' ? 1 : 0));
    }
    if (!S.bag) S.bag = {};
    if (S.bag.anesthetic == null) S.bag.anesthetic = 0;
    START_KNOWN.forEach(function (id) {
      var st = ensureNpcState(S, id);
      st.known = true;
    });
    NEED_MEET.forEach(function (id) { ensureNpcState(S, id); });
    Object.keys(S.npcs || {}).forEach(function (id) { ensureFeel(S, id); });
    if (!S.hero) S.hero = {};
    if (S.hero.disguise == null) S.hero.disguise = null;
    if (!S.explore) S.explore = { ruins: 1, crypt: 1, marsh: 1, ruinsBest: 0, cryptBest: 0, marshBest: 0, bosses: {} };
    /* 場景 meet 且已訪問 → 自動相識部分吏員 */
    STORY_QUESTS.forEach(function (q) {
      if (!S.quests[q.id]) {
        S.quests[q.id] = { id: q.id, title: q.title, desc: q.desc, type: q.type, done: false, claimed: false };
      } else {
        S.quests[q.id].title = q.title;
        S.quests[q.id].desc = q.desc;
        S.quests[q.id].type = q.type;
      }
    });
    return S;
  }

  function isKnown(S, id) {
    ensure(S);
    if (START_KNOWN.indexOf(id) >= 0) return true;
    var st = S.npcs && S.npcs[id];
    return !!(st && st.known);
  }

  function markKnown(S, id, why) {
    ensure(S);
    var st = ensureNpcState(S, id);
    if (st.known) return false;
    st.known = true;
    if (why) st.mem.push(String(why).slice(0, 24));
    if (st.mem.length > 8) st.mem = st.mem.slice(-8);
    return true;
  }

  function markKnownMany(S, ids, why) {
    (ids || []).forEach(function (id) { markKnown(S, id, why); });
  }

  function skillAgi(S) { ensure(S); return S.skills.agi || 0; }
  function skillMed(S) { return (S.skills && S.skills.med) || 0; }
  function skillMart(S) { return (S.skills && S.skills.mart) || 0; }

  function gateInfo(mode) { return GATES[mode] || null; }

  function hasAccess(S, mode) {
    ensure(S);
    if (!GATES[mode]) return true;
    return !!S.access[mode];
  }

  function gateOptions(S, mode) {
    var g = GATES[mode];
    if (!g) return [];
    var opts = [];
    var bribeNeed = g.bribe;
    var agiNeed = g.agi;
    if (disguiseActive(S)) { bribeNeed = Math.max(8, Math.floor(bribeNeed * 0.7)); agiNeed = Math.max(1, agiNeed - 1); }
    opts.push({
      id: 'bribe',
      label: '收買門衙' + (disguiseActive(S) ? '（男裝）' : ''),
      tip: '銀' + bribeNeed + (disguiseActive(S) ? ' · 扮男易通' : ''),
      ok: (S.gold || 0) >= bribeNeed,
      reason: (S.gold || 0) >= bribeNeed ? '' : '銀不足（需' + bribeNeed + '）',
      cost: bribeNeed
    });
    opts.push({
      id: 'agi',
      label: '輕功潛入' + (disguiseActive(S) ? '（男裝）' : ''),
      tip: '輕功≥' + agiNeed + '（現' + skillAgi(S) + '）· 體力-4',
      ok: skillAgi(S) >= agiNeed && (S.hp || 0) > 4,
      reason: skillAgi(S) < agiNeed ? ('輕功不足（需' + agiNeed + '）') : ((S.hp || 0) <= 4 ? '體力不足' : ''),
      need: agiNeed
    });
    opts.push({
      id: 'drug',
      label: '麻醉迷倒',
      tip: '藥理≥' + g.med + '（現' + skillMed(S) + '）· 麻醉藥×' + g.anesthetic,
      ok: skillMed(S) >= g.med && (S.bag.anesthetic || 0) >= g.anesthetic,
      reason: skillMed(S) < g.med
        ? ('藥理不足（需' + g.med + '）')
        : ((S.bag.anesthetic || 0) < g.anesthetic ? '缺麻醉藥（藥廬可煉）' : '')
    });
    if (S.flags && S.flags['pass_' + mode]) {
      opts.push({ id: 'pass', label: '出示通行證', tip: '已持令牌／名刺', ok: true, reason: '' });
    }
    return opts;
  }

  function tryOpenGate(S, mode, method) {
    ensure(S);
    var g = GATES[mode];
    if (!g) return { ok: true };
    if (S.access[mode]) return { ok: true, already: true };
    var opts = gateOptions(S, mode);
    var opt = null;
    for (var i = 0; i < opts.length; i++) if (opts[i].id === method) opt = opts[i];
    if (!opt) return { ok: false, msg: '無此法' };
    if (!opt.ok) return { ok: false, msg: opt.reason || '條件未足' };
    if (method === 'bribe') {
      S.gold -= (opt.cost != null ? opt.cost : g.bribe);
    } else if (method === 'agi') {
      S.hp = Math.max(1, S.hp - 4);
      if (Math.random() < 0.25) S.skills.agi = Math.min(8, skillAgi(S) + 1);
    } else if (method === 'drug') {
      S.bag.anesthetic = Math.max(0, (S.bag.anesthetic || 0) - g.anesthetic);
    }
    S.access[mode] = method;
    S.flags['visited_' + mode] = 1;
    /* 進門後相識該地常客影 */
    if (mode === 'xiangbang') markKnownMany(S, ['menke'], '相邦府門前相識');
    if (mode === 'palace') markKnownMany(S, ['neishi'], '宮牆外瞥見');
    if (mode === 'taihou') markKnownMany(S, ['zhaoji'], '太后宮外傳聞');
    if (mode === 'guowei') markKnownMany(S, ['mengyi'], '國尉府廊下');
    if (mode === 'ying') markKnownMany(S, ['junhou'], '營門盤查');
    return { ok: true, msg: '已入' + g.name };
  }

  function checkStoryQuests(S) {
    ensure(S);
    var doneNow = [];
    STORY_QUESTS.forEach(function (q) {
      var st = S.quests[q.id];
      if (!st || st.done) return;
      if (q.check(S)) {
        st.done = true;
        if (!st.claimed) {
          st.claimed = true;
          if (q.reward) {
            if (q.reward.gold) S.gold = (S.gold || 0) + q.reward.gold;
            if (q.reward.fame && global.QianFactions) global.QianFactions.bump(S, 'fame', q.reward.fame);
            else if (q.reward.fame) S.fame = Math.min(100, (S.fame || 0) + q.reward.fame);
            if (q.reward.people && global.QianFactions) global.QianFactions.bump(S, 'people', q.reward.people);
            else if (q.reward.people) S.people = Math.min(100, (S.people || 0) + q.reward.people);
          }
          markKnownMany(S, q.unlockNpc, '差事：' + q.title);
          doneNow.push(q);
        }
      }
    });
    return doneNow;
  }

  function questListHtml(S, escapeHtml) {
    ensure(S);
    checkStoryQuests(S);
    var html = '';
    var mains = STORY_QUESTS.filter(function (q) { return q.type === 'main'; });
    var sides = STORY_QUESTS.filter(function (q) { return q.type === 'side'; });
    function block(title, list) {
      html += '<div class="quest-item"><strong>' + title + '</strong></div>';
      list.forEach(function (q) {
        var st = S.quests[q.id] || {};
        html += '<div class="quest-item' + (st.done ? ' done' : '') + '">';
        html += '<strong>' + (st.done ? '✓ ' : '') + escapeHtml(q.title) + '</strong>';
        html += '<p>' + escapeHtml(q.desc) + '</p>';
        if (st.done) html += '<p class="ok">已完成</p>';
        html += '</div>';
      });
    }
    block('主線影', mains);
    block('支線', sides);
    return html;
  }

  function hasOpenStory(S) {
    ensure(S);
    return STORY_QUESTS.some(function (q) {
      var st = S.quests[q.id];
      return st && !st.done;
    });
  }

  /* 對話快捷：依人物／場景／關係產出 6–10 項 */
  function talkChoices(S, npc, mode) {
    ensure(S);
    if (!npc) return [{ id: 'bye', label: '告辭', text: '告辭' }];
    var st = ensureNpcState(S, npc.id);
    var aff = st.aff || 0;
    var out = [];
    function add(id, label, text, locked, reason) {
      out.push({ id: id, label: label, text: text || label, locked: !!locked, reason: reason || '' });
    }
    add('greet', '近日可好？', '近日可好？');
    add('rumor', mode === 'village' ? '村里可有新聞？' : '此地可有傳聞？',
      mode === 'village' ? '村里可有新聞？' : '此地可有傳聞？');
    add('ask_life', '請教生計', '請教生計');
    add('gift', '餽贈心意', '我想送你一份薄禮。', aff < 0, '印象太差');
    add('favor', '有一事相求', '有一事想請你幫忙。', aff < 12, '好感不足（需12）');
    add('plot', '打聽動向', '近日朝野／鄉里有何動向？');
    if (npc.faction === 'lu' || npc.faction === 'qin' || npc.faction === 'sai') {
      add('faction', '談談勢力', '想聽聽你對當下勢力的看法。', aff < 8, '尚不熟');
    }
    if (npc.role && /醫|藥/.test(npc.role)) {
      add('med', '請教藥理', '想請教一點藥理。');
    }
    if (npc.role && /商|賈|市|貨/.test(npc.role)) {
      add('trade', '談談買賣', '可有買賣可做？');
    }
    if (npc.role && /軍|候|將|卒|守|俠/.test(npc.role)) {
      add('duel', '約一場比試', '可願與我比試一二？', (S.skills.mart || 0) < 1, '武學尚淺');
    }
    if (GATES[mode] && !hasAccess(S, mode)) {
      add('bribe_hint', '門路可通否？', '守門人可通融否？');
    }
    if (aff >= 25 && (npc.faction === 'lu' || npc.id === 'menke')) {
      add('recruit', '門下可容否？', '不知門下可容一席之地？');
    }
    if (disguiseActive(S)) {
      add('disguise_talk', '（以男子之禮）請安', '在下遠來，特來請安。');
    }
    add('bye', '告辭', '告辭');
    /* 上限 10 */
    if (out.length > 10) out = out.slice(0, 9).concat([out[out.length - 1]]);
    return out;
  }


  function ensureFeel(S, id) {
    var st = ensureNpcState(S, id);
    if (!st.feel) st.feel = { respect: 0, fear: 0, suspicion: 0, gratitude: 0 };
    if (!st.log) st.log = [];
    return st;
  }

  function bumpFeel(S, id, key, n) {
    var st = ensureFeel(S, id);
    if (!st.feel[key] && st.feel[key] !== 0) st.feel[key] = 0;
    st.feel[key] = Math.max(-20, Math.min(100, st.feel[key] + n));
    return st.feel[key];
  }

  function logNpc(S, id, text) {
    var st = ensureFeel(S, id);
    st.log.push({ t: text, day: S.day || 1, at: Date.now() });
    if (st.log.length > 40) st.log = st.log.slice(-40);
    st.mem.push(String(text).slice(0, 28));
    if (st.mem.length > 12) st.mem = st.mem.slice(-12);
  }

  function feelLine(S, id) {
    var st = ensureFeel(S, id);
    var f = st.feel;
    return '敬' + (f.respect||0) + ' 懼' + (f.fear||0) + ' 疑' + (f.suspicion||0) + ' 恩' + (f.gratitude||0);
  }

  function fullMem(S, id) {
    var st = ensureFeel(S, id);
    var lines = (st.log || []).slice(-10).map(function (x) { return '第' + (x.day||'?') + '日：' + x.t; });
    if (!lines.length && st.mem && st.mem.length) lines = st.mem.slice(-6);
    return lines.join('；');
  }

  /* 女扮男裝：降低部分門檻銀／輕功需求視作通過檢查加成 */
  function disguiseActive(S) {
    return !!(S && S.hero && S.hero.disguise === 'male' && S.hero.gender === 'f');
  }

  global.QianStory = {
    START_KNOWN: START_KNOWN,
    NEED_MEET: NEED_MEET,
    GATES: GATES,
    STORY_QUESTS: STORY_QUESTS,
    ensure: ensure,
    isKnown: isKnown,
    markKnown: markKnown,
    markKnownMany: markKnownMany,
    skillAgi: skillAgi,
    skillMed: skillMed,
    skillMart: skillMart,
    gateInfo: gateInfo,
    hasAccess: hasAccess,
    gateOptions: gateOptions,
    tryOpenGate: tryOpenGate,
    checkStoryQuests: checkStoryQuests,
    questListHtml: questListHtml,
    hasOpenStory: hasOpenStory,
    talkChoices: talkChoices,
    ensureFeel: ensureFeel,
    bumpFeel: bumpFeel,
    logNpc: logNpc,
    feelLine: feelLine,
    fullMem: fullMem,
    disguiseActive: disguiseActive
  };
})(window);
