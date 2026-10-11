/* 青阡 · NPC 自主：時段日程、走動、行動、編年；有 AI Key 可潤色動向 */
(function (global) {
  'use strict';

  var PERIODS = ['晨', '午', '暮', '夜'];

  /* 預設日程：晨午暮夜 → 地點偏好（可隨機微偏） */
  var SCHEDULE = {
    he: ['village', 'village', 'farm', 'hut'],
    su: ['clinic', 'clinic', 'village', 'hut'],
    zhao: ['market', 'guanshi', 'tavern', 'market'],
    lin: ['farm', 'farm', 'village', 'hut'],
    wu: ['drill', 'ying', 'village', 'frontier'],
    cheng: ['academy', 'study', 'garden', 'academy'],
    yingzheng: ['palace', 'palace', 'guowei', 'palace'],
    lubuwei: ['xiangbang', 'xiangbang', 'keguan', 'xiangbang'],
    zhaoji: ['taihou', 'taihou', 'wish', 'taihou'],
    laoai: ['taihou', 'taihou', 'tavern', 'taihou'],
    lisi: ['keguan', 'study', 'xiangbang', 'keguan'],
    wangjian: ['ying', 'drill', 'frontier', 'ying'],
    mengtian: ['frontier', 'ying', 'drill', 'frontier'],
    mengyi: ['guowei', 'study', 'academy', 'guowei'],
    zhengguo: ['hejin', 'canal', 'hejin', 'hut'],
    menke: ['xiangbang', 'tavern', 'tea', 'xiangbang'],
    changping: ['keguan', 'bridge', 'keguan', 'tavern'],
    chu_envoy: ['keguan', 'tea', 'market', 'keguan'],
    guren: ['guanshi', 'canal', 'market', 'guanshi'],
    shili: ['guanshi', 'forge', 'market', 'tavern'],
    neishi: ['xianyang', 'guowei', 'xianyang', 'study'],
    xueshi: ['academy', 'study', 'wish', 'academy'],
    tiejiang: ['forge', 'forge', 'tavern', 'hut'],
    munong: ['wood', 'farm', 'wood', 'hut'],
    zhifu: ['weave', 'village', 'weave', 'hut'],
    chashi: ['tea', 'tea', 'garden', 'tea'],
  };

  var DEFAULT_CYCLE = ['village', 'market', 'garden', 'tavern'];

  var ACTIONS = {
    farm: ['耕種', '澆水', '閑談收成'],
    village: ['串門', '議里事', '歇腳'],
    market: ['買賣', '探行情', '與賈人論價'],
    clinic: ['採藥', '診脈', '配劑'],
    drill: ['演武', '較技', '整械'],
    wild: ['巡山', '採藥', '狩獵'],
    garden: ['遊園', '賞花', '清談'],
    swim: ['洗濯', '觀魚', '歇息'],
    moon: ['赴宴', '敬酒', '聽曲'],
    mine: ['開掘', '運礦', '歇息'],
    post: ['傳書', '問驛', '歇馬'],
    tavern: ['飲酒', '聽謠', '對飲'],
    academy: ['誦讀', '辯論', '抄書'],
    frontier: ['戍望', '巡邊', '整戈'],
    xianyang: ['觀市', '打聽', '投刺'],
    palace: ['覲見外圍', '候命', '緘默'],
    xiangbang: ['謁見', '貨殖', '門客清談'],
    taihou: ['進貢', '待命', '退避'],
    guowei: ['報功', '領差', '習軍法'],
    keguan: ['宴客', '刺探', '結賓'],
    guanshi: ['互市', '校秤', '販貨'],
    hejin: ['渡船', '問渠', '運糧'],
    cimiao: ['祈福', '賽祭', '靜思'],
    ying: ['操練', '領餉', '守夜'],
    hut: ['歸家', '歇息', '進食'],
    tea: ['品茗', '聽雲海謠', '清談'],
    forge: ['打鐵', '淬刃', '論兵械'],
    wood: ['刨木', '製器', '晒材'],
    incense: ['燃香', '調香', '靜坐'],
    weave: ['織布', '染紗', '量尺'],
    study: ['研讀', '作文', '校簡'],
    yard: ['掃庭', '賞景', '對弈'],
    wish: ['掛籤', '祈願', '添香'],
    persimmon: ['摘柿', '晒果', '閑話霜秋'],
    canal: ['裝船', '點貨', '談漕運'],
    bridge: ['憑欄', '偶遇', '遠望'],
    ruins: ['探墟', '警戒', '搜物'],
    crypt: ['探墓', '鎮邪', '退縮'],
    marsh: ['涉澤', '採藥', '避毒']
  };

  function periodIndex(S) {
    /* 用過日次數推時段；亦可存 S.period */
    if (S.period != null && PERIODS.indexOf(S.period) >= 0) return PERIODS.indexOf(S.period);
    return ((S.day || 1) - 1) % 4;
  }
  function periodName(S) {
    return PERIODS[periodIndex(S)];
  }

  function ensure(S) {
    if (!S.npcAI) S.npcAI = { loc: {}, lastTickDay: 0, log: [], interrupted: {} };
    if (!S.npcAI.loc) S.npcAI.loc = {};
    if (!S.npcAI.log) S.npcAI.log = [];
    if (!S.npcAI.interrupted) S.npcAI.interrupted = {};
    return S.npcAI;
  }

  function preferredLoc(id, S) {
    var sch = SCHEDULE[id] || DEFAULT_CYCLE;
    var p = periodIndex(S);
    var base = sch[p % sch.length];
    /* 微偏：10% 去休閒 */
    if (Math.random() < 0.1) {
      var leisure = ['tea', 'garden', 'yard', 'wish', 'bridge', 'tavern'];
      return leisure[Math.floor(Math.random() * leisure.length)];
    }
    return base;
  }

  function castList(S) {
    if (global.QianWorld && global.QianWorld.castForTalk) return global.QianWorld.castForTalk(S);
    return (global.QianWorld && global.QianWorld.CAST) || [];
  }

  function known(S, id) {
    return !!(S.npcs && S.npcs[id] && S.npcs[id].known);
  }

  function doAction(S, n, loc) {
    var acts = ACTIONS[loc] || ['徘徊', '觀望', '歇息'];
    var act = acts[Math.floor(Math.random() * acts.length)];
    var line = n.name + '在' + (locLabel(loc)) + act;
    /* 對玩家感受：若玩家曾到此地／認識，微調 */
    if (known(S, n.id) && S.npcs[n.id]) {
      var feel = S.npcs[n.id].feel || (S.npcs[n.id].feel = { respect: 0, fear: 0, suspicion: 0, gratitude: 0 });
      if (S.flags && S.flags['visited_' + loc] && Math.random() < 0.25) {
        S.npcs[n.id].aff = Math.min(100, (S.npcs[n.id].aff || 0) + (Math.random() < 0.5 ? 1 : 0));
        if (Math.random() < 0.4) feel.respect = Math.min(100, (feel.respect || 0) + 1);
        line += '，隱約念及你';
      }
      if (S.npcs[n.id].log) {
        S.npcs[n.id].log.unshift({ t: '自主', text: act + '於' + locLabel(loc), day: S.day });
        if (S.npcs[n.id].log.length > 24) S.npcs[n.id].log = S.npcs[n.id].log.slice(0, 24);
      }
    }
    return { id: n.id, name: n.name, loc: loc, act: act, line: line };
  }

  function locLabel(id) {
    var M = {
      farm: '田莊', village: '村落', market: '市井', clinic: '藥廬', drill: '校場', wild: '山野',
      garden: '園林', swim: '水塘', moon: '夜宴', mine: '礦坑', post: '驛道', tavern: '酒肆',
      academy: '書塾', frontier: '邊關', xianyang: '咸陽', palace: '宮城外', xiangbang: '相邦府',
      taihou: '太后宮外', guowei: '國尉府', keguan: '客館', guanshi: '關市', hejin: '河津',
      cimiao: '祠廟', ying: '軍營', hut: '陋室', ruins: '廢墟', crypt: '古墓', marsh: '澤地',
      tea: '云海茶寮', forge: '鐵鋪', wood: '木作坊', incense: '香鋪', weave: '織坊',
      study: '書齋', yard: '庭院', wish: '祈願樹', persimmon: '霜柿山居', canal: '漕幫碼頭', bridge: '長橋'
    };
    return M[id] || id;
  }

  /** 過日／AUTO 時呼叫：移動並行動一批 NPC */
  function tick(S, opts) {
    opts = opts || {};
    var ai = ensure(S);
    var cast = castList(S);
    var results = [];
    var maxN = opts.max || 14;
    var shuffled = cast.slice().sort(function () { return Math.random() - 0.5; });
    var nDone = 0;
    for (var i = 0; i < shuffled.length && nDone < maxN; i++) {
      var n = shuffled[i];
      if (ai.interrupted[n.id]) continue; /* 玩家正在對話則跳過 */
      var loc = preferredLoc(n.id, S);
      ai.loc[n.id] = loc;
      var r = doAction(S, n, loc);
      results.push(r);
      nDone++;
    }
    ai.lastTickDay = S.day || 1;
    ai.lastPeriod = periodName(S);
    var lines = results.slice(0, 6).map(function (r) { return r.line; });
    var summary = (periodName(S) + '時 · ') + lines.join('；');
    ai.log.unshift({ day: S.day, period: periodName(S), text: summary, at: Date.now() });
    if (ai.log.length > 40) ai.log = ai.log.slice(0, 40);
    if (S.chronicle) {
      S.chronicle.unshift({
        id: 'npcai_' + S.day + '_' + periodIndex(S),
        title: '人物動向',
        text: summary.slice(0, 120),
        day: S.day,
        changed: false,
        at: (global.QianWorld && global.QianWorld.eraLabel) ? global.QianWorld.eraLabel(S.day) : ('第' + S.day + '日')
      });
      if (S.chronicle.length > 40) S.chronicle = S.chronicle.slice(0, 40);
    }
    return { results: results, summary: summary, period: periodName(S) };
  }

  function advancePeriod(S) {
    var i = periodIndex(S);
    S.period = PERIODS[(i + 1) % 4];
    if (S.period === '晨') {
      /* 晨＝新一日由 nextDay 處理；此處僅轉時段 */
    }
    return tick(S, { max: 12 });
  }

  function atLocation(S, mode) {
    ensure(S);
    var cast = castList(S);
    var here = [];
    cast.forEach(function (n) {
      var loc = S.npcAI.loc[n.id];
      if (!loc) {
        loc = preferredLoc(n.id, S);
        S.npcAI.loc[n.id] = loc;
      }
      if (loc === mode) here.push(n);
    });
    return here;
  }

  function interrupt(S, id) {
    ensure(S);
    S.npcAI.interrupted[id] = 1;
  }
  function resume(S, id) {
    ensure(S);
    delete S.npcAI.interrupted[id];
  }
  function resumeAll(S) {
    ensure(S);
    S.npcAI.interrupted = {};
  }

  /** 可選：有 AI Key 時潤色今日動向（非阻塞由外部 await） */
  function aiPrompt(S, summary) {
    return '你是秦王政元年的編年吏。用兩句文言白話潤色以下人物動向，勿加英文，勿超 60 字：\n' + summary;
  }

  function logHtml(S, escapeHtml) {
    ensure(S);
    if (!S.npcAI.log.length) return '<p class="muted">人物尚未自主行動。過日或 AUTO 後可見動向。</p>';
    return S.npcAI.log.slice(0, 10).map(function (L) {
      return '<div class="chron-item"><b>' + escapeHtml(L.period || '') + '</b>' +
        '<span class="muted"> · 第' + (L.day || '') + '日</span><p>' + escapeHtml(L.text || '') + '</p></div>';
    }).join('');
  }

  global.QianNpcAI = {
    PERIODS: PERIODS,
    SCHEDULE: SCHEDULE,
    ensure: ensure,
    tick: tick,
    advancePeriod: advancePeriod,
    atLocation: atLocation,
    preferredLoc: preferredLoc,
    periodName: periodName,
    interrupt: interrupt,
    resume: resume,
    resumeAll: resumeAll,
    aiPrompt: aiPrompt,
    locLabel: locLabel,
    logHtml: logHtml
  };
})(window);
