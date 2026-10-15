/* 青阡 · 秦際勢力／來訪／結局 */
(function (global) {
  'use strict';

  var FACTIONS = {
    lu: {
      id: 'lu',
      name: '呂黨',
      short: '呂',
      full: '呂氏門客網',
      desc: '相國呂不韋門下商賈與客卿。善貨殖、遊說、安插鄉里。',
      color: '#8b6914',
      recruiter: { name: '程賈', role: '呂門舍人' },
      joinLine: '呂相國聞君能事，願延為門下客。銀貨可通，人情可結——唯需為呂氏張目。',
      refuseLine: '程賈拱手：既無意，他日有緣再敘。',
      questTitle: '呂門貨單',
      autoHint: '多走動坊市、多賺錢'
    },
    qin: {
      id: 'qin',
      name: '王府',
      short: '秦',
      full: '王府／秦廷',
      desc: '嬴政左右與內史吏屬。重軍功、秩序、鄉里編戶。',
      color: '#b8323a',
      recruiter: { name: '內史吏', role: '王府小吏' },
      joinLine: '王府有令：秦王新政，邊野亦屬編戶。君若效力，校場山野皆可記功；若抗命，則另當別論。',
      refuseLine: '小吏冷笑一聲：編戶自便。只是……官府眼線，無處不在。',
      questTitle: '王府差遣',
      autoHint: '多練兵、多入山'
    },
    sai: {
      id: 'sai',
      name: '邊市盟',
      short: '塞',
      full: '塞北邊市盟',
      desc: '匈奴邊市與楚齊流商結成的鬆散盟約。重互市、庇護流民，疾苛法。',
      color: '#4a6b6a',
      recruiter: { name: '拓跋客', role: '塞上互市使' },
      joinLine: '塞上風硬，卻自由。盟中要貨、要藥、要刀——你若入盟，互市與庇護皆可議；秦法到不了之處，我們到得了。',
      refuseLine: '拓跋客笑：不入也無妨。邊市的門，永遠為朋友開。',
      questTitle: '邊市密約',
      autoHint: '多買賣、多採藥、適度入山'
    }
  };

  var ENDINGS = [
    {
      id: 'mid_rich',
      tier: 'mid',
      name: '阡陌富戶',
      when: '銀兩豐足、名聲漸起，卻未入任何勢力。',
      check: function (S) {
        return !S.joined && (S.fame || 0) >= 35 && (S.gold || 0) >= 350;
      }
    },
    {
      id: 'mid_lu_guest',
      tier: 'mid',
      name: '呂門清客',
      when: '已入呂黨，商路漸開。',
      check: function (S) {
        return S.joined === 'lu' && (S.factions.lu || 0) >= 40 && (S.fame || 0) >= 30;
      }
    },
    {
      id: 'mid_qin_retainer',
      tier: 'mid',
      name: '王府編外',
      when: '效力王府，軍功與編戶漸為人所知。',
      check: function (S) {
        return S.joined === 'qin' && (S.factions.qin || 0) >= 40 && (S.wins || 0) >= 5;
      }
    },
    {
      id: 'mid_sai_broker',
      tier: 'mid',
      name: '邊市仲介',
      when: '與塞北邊市盟互通有無。',
      check: function (S) {
        return S.joined === 'sai' && (S.factions.sai || 0) >= 40 && (S.soldGold || 0) >= 200;
      }
    },
    {
      id: 'late_leader',
      tier: 'late',
      name: '眾望所歸',
      when: '民心極高——鄉鄰推你主事，甚至可號召一隅。',
      check: function (S) {
        return (S.people || 0) >= 78 && (S.fame || 0) >= 55 && (S.flags.savedFolk || 0) >= 1;
      }
    },
    {
      id: 'late_claim',
      tier: 'late',
      name: '稱王野心',
      when: '拒秦廷、結邊市或擁民心，山野兵刃在手——隱有反秦自立之念。',
      check: function (S) {
        var anti = S.joined === 'sai' || (S.flags.refusedQin && (S.people || 0) >= 60);
        return anti && (S.fame || 0) >= 70 && (S.wildBest || 0) >= 4 && (S.wins || 0) >= 12;
      }
    },
    {
      id: 'late_retire',
      tier: 'late',
      name: '墨夢隱退',
      when: '日久年深，銀糧俱足，放下刀與黨爭，歸田自守。',
      check: function (S) {
        return (S.day || 0) >= 60 && (S.gold || 0) >= 400 && (S.food || 0) >= 30 &&
          (S.fame || 0) >= 40 && !(S.flags.ambition || false);
      }
    }
  ];

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function ensure(S) {
    if (!S.factions) S.factions = { lu: 0, qin: 0, sai: 0 };
    ['lu', 'qin', 'sai'].forEach(function (k) {
      if (S.factions[k] == null) S.factions[k] = 0;
    });
    if (S.fame == null) S.fame = 0;
    if (S.fameBonus == null) S.fameBonus = 0;
    if (S.people == null) S.people = 8;
    if (S.joined === undefined) S.joined = null;
    if (!S.worldLine) S.worldLine = '秦王政元年，少年王即位，呂不韋為相邦。';
    if (!S.endings) S.endings = [];
    if (!S.seenEvents) S.seenEvents = {};
    if (!S.dayActs) S.dayActs = { farm: 0, sell: 0, gift: 0, heal: 0, fight: 0, trade: 0, order: 0 };
    if (!S.flags) S.flags = {};
    if (!S.factionQuest) S.factionQuest = null;
    if (S.pendingEvent === undefined) S.pendingEvent = null;
    if (!S.arcProg) S.arcProg = {};
    if (!S.plotFlags) S.plotFlags = {};
    return S;
  }

  function recomputeFame(S) {
    var g = S.gold || 0;
    var sold = S.soldGold || 0;
    var wins = S.wins || 0;
    var plots = S.plotCount || 8;
    var raw = Math.floor(g / 12) + Math.floor(sold / 25) + wins * 2 + Math.max(0, plots - 8) * 2;
    if (S.fameBonus == null) S.fameBonus = 0;
    // 財富戰功為底，事件加成為 bonus；名聲只升不因公式驟降
    var merged = raw + S.fameBonus;
    S.fame = clamp(Math.max(merged, S.fame || 0), 0, 100);
    return S.fame;
  }

  function bump(S, key, n) {
    ensure(S);
    n = Math.round(n * 10) / 10;
    if (key === 'fame') {
      if (S.fameBonus == null) S.fameBonus = 0;
      S.fameBonus += n;
      S.fame = clamp((S.fame || 0) + n, 0, 100);
    } else if (key === 'people') S.people = clamp((S.people || 0) + n, 0, 100);
    else if (S.factions[key] != null) S.factions[key] = clamp((S.factions[key] || 0) + n, 0, 100);
  }

  function noteAct(S, kind) {
    ensure(S);
    if (!S.dayActs[kind]) S.dayActs[kind] = 0;
    S.dayActs[kind]++;
  }

  function worldTick(S) {
    ensure(S);
    var a = S.dayActs || {};
    // soft shifts
    if (a.farm || a.order) {
      bump(S, 'people', a.order ? 2 : 1);
      bump(S, 'qin', 0.5);
    }
    if (a.sell || a.trade) {
      bump(S, 'lu', 1 + (a.sell > 1 ? 1 : 0));
      bump(S, 'sai', 0.5);
      bump(S, 'fame', 0); // fame recomputed
    }
    if (a.gift || a.heal) {
      bump(S, 'people', 1 + (a.heal ? 1 : 0));
      bump(S, 'sai', a.heal ? 1 : 0);
      if (a.heal >= 2) S.flags.savedFolk = (S.flags.savedFolk || 0) + 1;
    }
    if (a.fight) {
      bump(S, 'qin', 1);
      bump(S, 'lu', -0.3);
      if (S.joined === 'sai') bump(S, 'sai', 0.5);
    }
    // faction tension: strongest pulls opposite down slightly
    var ids = ['lu', 'qin', 'sai'];
    var top = ids.slice().sort(function (x, y) { return (S.factions[y] || 0) - (S.factions[x] || 0); })[0];
    ids.forEach(function (id) {
      if (id !== top && (S.factions[top] || 0) > 45) bump(S, id, -0.4);
    });
    if (S.joined) bump(S, S.joined, 0.6);

    recomputeFame(S);
    S.worldLine = composeWorldLine(S);
    S.dayActs = { farm: 0, sell: 0, gift: 0, heal: 0, fight: 0, trade: 0, order: 0 };
    checkEndings(S);
    return S.worldLine;
  }

  function composeWorldLine(S) {
    var f = S.factions;
    var parts = [];
    if ((f.qin || 0) >= (f.lu || 0) && (f.qin || 0) >= (f.sai || 0)) {
      parts.push((f.qin || 0) > 55 ? '秦廷威壓漸重' : '官府編戶尚寬');
    } else if ((f.lu || 0) >= (f.sai || 0)) {
      parts.push((f.lu || 0) > 55 ? '呂氏商網縱橫' : '市賈多議呂門');
    } else {
      parts.push((f.sai || 0) > 55 ? '塞上互市暗盛' : '邊市風聲漸起');
    }
    if ((S.people || 0) >= 60) parts.push('民心向君');
    else if ((S.people || 0) < 25) parts.push('鄉里語冷');
    if ((S.fame || 0) >= 50) parts.push('聲名遠近皆聞');
    if (S.joined === 'lu') parts.push('君掛呂黨');
    else if (S.joined === 'qin') parts.push('君效力王府');
    else if (S.joined === 'sai') parts.push('君通邊市盟');
    else parts.push('君仍獨立');
    if (S.flags.ambition) parts.push('隱有非常之志');
    if (window.QianArcs) {
      var fs = window.QianArcs.fateSummary(S);
      if (fs) parts.push(fs);
    } else if (S.plotFlags) {
      if (S.plotFlags.fate_ying === 'confidant') parts.push('秦王耳目');
      if (S.plotFlags.fate_lu === 'patron') parts.push('呂氏門客');
      if (S.plotFlags.lu_saved) parts.push('呂氏命運已改');
    }
    return parts.join('·') + '。';
  }

  function pickRecruitEvent(S) {
    ensure(S);
    recomputeFame(S);
    var fame = S.fame || 0;
    var gold = S.gold || 0;
    var day = S.day || 1;

    // Leadership visit: high people
    if (!S.seenEvents.folk_push && (S.people || 0) >= 70 && fame >= 40) {
      var eFolk = makeEvent('folk_push', '鄉鄰聯名',
        '何伯率數人叩門：近日劫匪與苛征並起，里中無主。眾人願推你暫攝里務——可救一村，亦可為日後自立張本。',
        [
          { id: 'accept_lead', label: '受推攝事', effect: 'lead' },
          { id: 'refuse_lead', label: '婉謝歸田', effect: 'humble' }
        ]);
      eFolk.face = 'scholar';
      return eFolk;
    }

    // Ambition whisper
    if (!S.seenEvents.ambition_whisper && fame >= 65 && (S.wildBest || 0) >= 3 && (S.joined === 'sai' || S.flags.refusedQin)) {
      var eAmb = makeEvent('ambition_whisper', '夜訪密語',
        '蒙面客低聲：秦法日苛，六國遺民與塞上皆望新主。君若有意……山野刀槍、邊市貨線，皆可暗助。',
        [
          { id: 'ambition_yes', label: '默許此念', effect: 'ambition' },
          { id: 'ambition_no', label: '斥為妄言', effect: 'loyal_quiet' }
        ]);
      eAmb.face = 'soldier';
      return eAmb;
    }

    // Recruitment order by thresholds
    var offers = [
      { id: 'recruit_lu', fac: 'lu', needFame: 22, needGold: 180, dayMin: 5 },
      { id: 'recruit_qin', fac: 'qin', needFame: 28, needGold: 150, dayMin: 8 },
      { id: 'recruit_sai', fac: 'sai', needFame: 32, needGold: 200, dayMin: 10 }
    ];
    // shuffle priority: who likes player more approaches first if tied
    offers.sort(function (a, b) {
      return (S.factions[b.fac] || 0) - (S.factions[a.fac] || 0);
    });

    for (var i = 0; i < offers.length; i++) {
      var o = offers[i];
      if (S.seenEvents[o.id]) continue;
      if (S.joined && S.joined !== o.fac) {
        // still allow one rival offer later
        if (fame < o.needFame + 15) continue;
      }
      if (fame >= o.needFame && gold >= o.needGold && day >= o.dayMin) {
        var F = FACTIONS[o.fac];
        var extra = S.joined && S.joined !== o.fac
          ? '\n（對方似乎知你另有所屬，試探你是否願意……另結一線。）'
          : '';
        var ev = makeEvent(o.id, F.recruiter.name + '來訪',
          F.recruiter.role + '「' + F.recruiter.name + '」登門：\n' + F.joinLine + extra,
          [
            { id: 'join_' + o.fac, label: '加入' + F.name, effect: 'join', fac: o.fac },
            { id: 'refuse_' + o.fac, label: '婉拒獨立', effect: 'refuse', fac: o.fac },
            { id: 'double_' + o.fac, label: '虛與委蛇', effect: 'double', fac: o.fac }
          ]);
        ev.faction = o.fac;
        ev.face = o.fac === 'lu' ? 'merchant' : (o.fac === 'qin' ? 'soldier' : 'scholar');
        return ev;
      }
    }

    // Independent rare: wealthy farmer peace
    if (!S.seenEvents.peace_offer && !S.joined && fame >= 45 && gold >= 400 && day >= 25) {
      var ePeace = makeEvent('peace_offer', '富戶宴請',
        '鄰里設席賀你田莊殷實。有人勸你出頭入黨，有人勸你閉門耕讀。今夜只問：你要的是什麼？',
        [
          { id: 'stay_free', label: '安於阡陌', effect: 'stay_free' },
          { id: 'seek_name', label: '再求聲名', effect: 'seek_name' }
        ]);
      ePeace.face = 'farmer_m';
      return ePeace;
    }
    return null;
  }

  function makeEvent(id, title, body, choices) {
    return { id: id, title: title, body: body, choices: choices };
  }

  function applyChoice(S, event, choiceId) {
    ensure(S);
    var ch = null;
    (event.choices || []).forEach(function (c) { if (c.id === choiceId) ch = c; });
    if (!ch) return { toast: '……', line: '' };
    S.seenEvents[event.id] = true;
    S.pendingEvent = null;
    var line = '';
    var toast = '';

    if (ch.effect === 'join') {
      S.joined = ch.fac;
      bump(S, ch.fac, 18);
      bump(S, 'fame', 5);
      S.factionQuest = rollFactionQuest(ch.fac, S);
      line = '你歸於「' + FACTIONS[ch.fac].name + '」。' + FACTIONS[ch.fac].autoHint + '。';
      toast = '加入' + FACTIONS[ch.fac].name;
      // rivals sour slightly
      ['lu', 'qin', 'sai'].forEach(function (k) {
        if (k !== ch.fac) bump(S, k, -6);
      });
    } else if (ch.effect === 'refuse') {
      bump(S, ch.fac, -4);
      bump(S, 'people', 2);
      if (ch.fac === 'qin') S.flags.refusedQin = true;
      line = FACTIONS[ch.fac].refuseLine + ' 你仍走獨立一路。';
      toast = '婉拒' + FACTIONS[ch.fac].name;
    } else if (ch.effect === 'double') {
      bump(S, ch.fac, 8);
      bump(S, 'fame', 2);
      S.flags['double_' + ch.fac] = true;
      // not formally joined
      if (!S.joined) {
        line = '你未明言歸屬，卻收下對方薄禮。兩邊都不算徹底。日後恐難兩全。';
      } else {
        line = '你已屬' + FACTIONS[S.joined].name + '，卻對' + FACTIONS[ch.fac].name + '虛與委蛇。險棋。';
        bump(S, S.joined, -3);
        S.flags.ambition = true;
      }
      toast = '虛與委蛇';
    } else if (ch.effect === 'lead') {
      bump(S, 'people', 12);
      bump(S, 'fame', 8);
      bump(S, 'qin', -5);
      bump(S, 'sai', 4);
      S.flags.savedFolk = (S.flags.savedFolk || 0) + 1;
      S.flags.leaderPath = true;
      line = '你受推攝事。里中有難，先找你；官府聞之，亦側目。';
      toast = '眾望所歸';
    } else if (ch.effect === 'humble') {
      bump(S, 'people', 4);
      bump(S, 'fame', -2);
      line = '你歸田不問政事。鄉鄰歎息，卻也敬你淡泊。';
      toast = '婉謝攝事';
    } else if (ch.effect === 'ambition') {
      S.flags.ambition = true;
      bump(S, 'sai', 10);
      bump(S, 'qin', -12);
      bump(S, 'fame', 5);
      line = '你默許非常之念。此後一舉一動，皆可能被寫入史冊——或罪冊。';
      toast = '野心暗生';
    } else if (ch.effect === 'loyal_quiet') {
      bump(S, 'qin', 6);
      S.flags.ambition = false;
      line = '你斥妄言。夜客遁去。秦法之下，你仍想做個安分的人。';
      toast = '斥退密謀';
    } else if (ch.effect === 'stay_free') {
      bump(S, 'people', 5);
      line = '你舉杯：但求田土安穩。滿座稱善。獨立之路，更堅。';
      toast = '安於阡陌';
    } else if (ch.effect === 'seek_name') {
      bump(S, 'fame', 6);
      bump(S, 'lu', 3);
      bump(S, 'qin', 3);
      line = '你意不止於田畝。席間有人默記此言，他日或有車馬再來。';
      toast = '再求聲名';
    }

    recomputeFame(S);
    S.worldLine = composeWorldLine(S);
    checkEndings(S);
    return { toast: toast, line: line };
  }

  function rollFactionQuest(fac, S) {
    if (fac === 'lu') {
      return { id: 'fq_lu', title: '呂門貨單', desc: '累計賣銀再得 120', needFlag: 'soldGold', base: S.soldGold || 0, needVal: (S.soldGold || 0) + 120, gold: 80, food: 4, fac: 'lu', done: false };
    }
    if (fac === 'qin') {
      return { id: 'fq_qin', title: '王府差遣', desc: '再戰勝 4 場', needFlag: 'wins', base: S.wins || 0, needVal: (S.wins || 0) + 4, gold: 70, food: 3, fac: 'qin', done: false };
    }
    return { id: 'fq_sai', title: '邊市密約', desc: '製回春散 3 帖並賣銀+80', needFlag: 'sai_mix', needVal: 1, gold: 90, food: 5, fac: 'sai', done: false, potionNeed: 3, soldNeed: (S.soldGold || 0) + 80 };
  }

  function checkFactionQuest(S) {
    var q = S.factionQuest;
    if (!q || q.done) return false;
    var ok = false;
    if (q.needFlag === 'soldGold') ok = (S.soldGold || 0) >= q.needVal;
    else if (q.needFlag === 'wins') ok = (S.wins || 0) >= q.needVal;
    else if (q.needFlag === 'sai_mix') {
      ok = (S.flags.saiPotion || 0) >= (q.potionNeed || 3) && (S.soldGold || 0) >= (q.soldNeed || 0);
    }
    if (!ok) return false;
    q.done = true;
    S.gold += q.gold;
    S.food += q.food || 0;
    bump(S, q.fac, 10);
    bump(S, 'fame', 4);
    // roll next
    S.factionQuest = rollFactionQuest(q.fac, S);
    return q;
  }

  function checkEndings(S) {
    ensure(S);
    var all = ENDINGS.slice();
    if (window.QianArcs && window.QianArcs.endingListExtra) {
      all = all.concat(window.QianArcs.endingListExtra());
    }
    all.forEach(function (e) {
      if (S.endings.indexOf(e.id) >= 0) return;
      try {
        if (e.check(S)) S.endings.push(e.id);
      } catch (err) {}
    });
    if (window.QianArcs && window.QianArcs.checkArcEndings) {
      window.QianArcs.checkArcEndings(S);
    }
  }

  function endingList(S) {
    ensure(S);
    var all = ENDINGS.slice();
    if (window.QianArcs && window.QianArcs.endingListExtra) {
      all = all.concat(window.QianArcs.endingListExtra());
    }
    return all.map(function (e) {
      return {
        id: e.id,
        tier: e.tier,
        name: e.name,
        when: e.when,
        unlocked: S.endings.indexOf(e.id) >= 0
      };
    });
  }

  function stanceText(S) {
    ensure(S);
    var j = S.joined ? FACTIONS[S.joined].full : '無黨無派（獨立）';
    return '勢力歸屬：' + j +
      '；好感 呂黨' + Math.floor(S.factions.lu) +
      '／王府' + Math.floor(S.factions.qin) +
      '／邊市盟' + Math.floor(S.factions.sai) +
      '；名聲' + Math.floor(S.fame) + ' 民心' + Math.floor(S.people) +
      '；天下大勢：' + S.worldLine;
  }

  function autoPriority(S) {
    if (!S || !S.joined) return null;
    if (S.joined === 'lu') return 'market';
    if (S.joined === 'qin') return 'wild';
    if (S.joined === 'sai') return 'clinic';
    return null;
  }

  global.QianFactions = {
    FACTIONS: FACTIONS,
    ENDINGS: ENDINGS,
    ensure: ensure,
    recomputeFame: recomputeFame,
    bump: bump,
    noteAct: noteAct,
    worldTick: worldTick,
    composeWorldLine: composeWorldLine,
    pickRecruitEvent: pickRecruitEvent,
    applyChoice: applyChoice,
    checkFactionQuest: checkFactionQuest,
    checkEndings: checkEndings,
    endingList: endingList,
    stanceText: stanceText,
    autoPriority: autoPriority,
    rollFactionQuest: rollFactionQuest
  };
})(window);
