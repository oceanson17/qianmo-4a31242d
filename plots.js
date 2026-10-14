/* 青阡 · 屬性門檻劇情／支線（含呂不韋改史） */
(function (global) {
  'use strict';

  function attrsOf(S) {
    if (global.heroAttrsFull) return global.heroAttrsFull(S);
    var a = (S && S.attrs) || {};
    var g = { wu: 0, hu: 0, shen: 0, zhi: 0, bian: 0, yun: 0 };
    if (S && S.gear && S.equipped && global.QianEquip) {
      g = global.QianEquip.heroAttrsFromGear(S.gear, S.equipped);
    }
    return {
      wu: (a.wu || 0) + (g.wu || 0),
      hu: (a.hu || 0) + (g.hu || 0),
      shen: (a.shen || 0) + (g.shen || 0),
      zhi: (a.zhi || 0) + (g.zhi || 0),
      bian: (a.bian || 0) + (g.bian || 0),
      yun: (a.yun || 0) + (g.yun || 0)
    };
  }

  function needOk(S, need) {
    if (!need) return true;
    var a = attrsOf(S);
    var keys = Object.keys(need);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if ((a[k] || 0) < need[k]) return false;
    }
    return true;
  }

  function needTip(S, need) {
    if (!need) return '';
    var a = attrsOf(S);
    var LAB = { wu: '武力', hu: '護體', shen: '身法', zhi: '智計', bian: '辯才', yun: '氣運' };
    var parts = [];
    Object.keys(need).forEach(function (k) {
      parts.push(LAB[k] + '≥' + need[k] + '（現' + (a[k] || 0) + '）');
    });
    return parts.join(' · ');
  }

  function makeEvent(id, title, body, choices, extra) {
    var ev = { id: id, title: title, body: body, choices: choices, plot: true };
    if (extra) Object.keys(extra).forEach(function (k) { ev[k] = extra[k]; });
    return ev;
  }

  /** 動態加鎖標籤 */
  function gateChoices(S, raw) {
    return raw.map(function (c) {
      var locked = c.need && !needOk(S, c.need);
      var label = c.label;
      if (c.need) {
        label = locked
          ? '🔒 ' + c.label + '（' + needTip(S, c.need) + '）'
          : c.label + '（' + needTip(S, c.need) + '）';
      }
      return Object.assign({}, c, { label: label, locked: locked, tip: c.need ? needTip(S, c.need) : '' });
    });
  }

  /**
   * 掃描可觸發劇情（一天最多推一個）
   */
  function poll(S) {
    if (!S || S.pendingEvent) return null;
    if (!S.seenEvents) S.seenEvents = {};
    if (!S.flags) S.flags = {};
    if (!S.plotFlags) S.plotFlags = {};
    var day = S.day || 1;
    var joined = S.joined;

    // —— 呂不韋被追殺（改史核心）——
    if (!S.seenEvents.lu_hunt && day >= 45 && (joined === 'lu' || (S.factions && S.factions.lu >= 35))) {
      var body = '夜半急報：少年王下令清查相邦私黨，甲士已圍相邦府外巷。呂不韋遣門客來求——「若君尚念舊恩，今夜或有一線生機。」\n'
        + '你屬性：' + fmtAttrs(S) + '\n（高武力可硬闖；高智計可調虎離山；高辯才可緩兵；氣運影響僥倖。）';
      return makeEvent('lu_hunt', '相邦府外夜圍', body, gateChoices(S, [
        { id: 'lu_kill', label: '揮刃殺開血路', need: { wu: 8 }, effect: 'lu_save_force' },
        { id: 'lu_divert', label: '調虎離山引走甲士', need: { zhi: 7 }, effect: 'lu_save_trick' },
        { id: 'lu_talk', label: '以辯才緩兵一夜', need: { bian: 6 }, effect: 'lu_save_talk' },
        { id: 'lu_luck', label: '趁亂潛送密信', need: { yun: 5, shen: 4 }, effect: 'lu_save_luck' },
        { id: 'lu_watch', label: '袖手旁觀', effect: 'lu_abandon' },
        { id: 'lu_betray', label: '向王府告密求賞', effect: 'lu_betray' }
      ]), { face: 'merchant', faction: 'lu' });
    }

    // —— 嫪毐之亂影（太后宮）——
    if (!S.seenEvents.laoai_chaos && day >= 55 && (S.flags.visited_taihou || (S.access && S.access.taihou))) {
      return makeEvent('laoai_chaos', '太后宮外兵變影',
        '私門甲士與王府衛卒衝突將起。你可助王、助后黨，或以民心勸和。\n' + fmtAttrs(S),
        gateChoices(S, [
          { id: 'la_qin', label: '助王府先發制人', need: { wu: 6 }, effect: 'laoai_qin' },
          { id: 'la_lu', label: '為呂／后黨通風', need: { bian: 5 }, effect: 'laoai_lu' },
          { id: 'la_peace', label: '智計勸雙方暫退', need: { zhi: 8 }, effect: 'laoai_peace' },
          { id: 'la_flee', label: '帶鄉民避禍', need: { shen: 5 }, effect: 'laoai_folk' },
          { id: 'la_none', label: '事不關己', effect: 'noop' }
        ]), { face: 'soldier' });
    }

    // —— 鄭國渠辯 ——
    if (!S.seenEvents.zhengguo_debate && day >= 25 && (S.flags.canal_ask || (S.npcs && S.npcs.zhengguo && S.npcs.zhengguo.known))) {
      return makeEvent('zhengguo_debate', '渠議廷爭',
        '朝野爭論鄭國開渠是疲秦還是利農。你若有辯才／智計，可影響走向。\n' + fmtAttrs(S),
        gateChoices(S, [
          { id: 'zg_farm', label: '力陳利農灌田', need: { bian: 5, zhi: 3 }, effect: 'zg_pro' },
          { id: 'zg_spy', label: '揭疲秦之計', need: { zhi: 7 }, effect: 'zg_anti' },
          { id: 'zg_silence', label: '沉默不語', effect: 'noop' }
        ]), { face: 'farmer_m' });
    }

    // —— 李斯說法 ——
    if (!S.seenEvents.lisi_law && day >= 40 && (joined === 'qin' || (S.factions && S.factions.qin >= 25))) {
      return makeEvent('lisi_law', '客卿李斯說法',
        '李斯問你：私門與王權，何者當先？高辯才可折其鋒，高智計可兩全其說。\n' + fmtAttrs(S),
        gateChoices(S, [
          { id: 'ls_agree', label: '附議強王權', need: { bian: 4 }, effect: 'lisi_agree' },
          { id: 'ls_balance', label: '智計調和公私', need: { zhi: 7 }, effect: 'lisi_balance' },
          { id: 'ls_lu', label: '為私門辯護', need: { bian: 6 }, effect: 'lisi_lu' },
          { id: 'ls_pass', label: '不敢置喙', effect: 'noop' }
        ]), { face: 'scholar', faction: 'qin' });
    }

    // —— 邊關夜襲 ——
    if (!S.seenEvents.border_raid && day >= 20 && ((S.frontBest || 0) >= 2 || (S.explore && S.explore.bosses && S.explore.bosses.frontier))) {
      return makeEvent('border_raid', '邊關夜襲',
        '胡騎夜襲關市。武力可力戰，身法可傳烽，智計可設伏。\n' + fmtAttrs(S),
        gateChoices(S, [
          { id: 'br_fight', label: '率眾力戰', need: { wu: 7, hu: 4 }, effect: 'border_win' },
          { id: 'br_fire', label: '身法傳烽求救', need: { shen: 6 }, effect: 'border_signal' },
          { id: 'br_ambush', label: '智計設伏', need: { zhi: 6 }, effect: 'border_ambush' },
          { id: 'br_run', label: '護商隊撤退', effect: 'border_retreat' }
        ]), { face: 'soldier', faction: 'qin' });
    }

    // —— 觀星異象 ——
    if (!S.seenEvents.star_omen && day >= 30 && (S.flags.visited_stargaze || S.plotFlags.stargaze)) {
      return makeEvent('star_omen', '觀星隱廬異象',
        '方士言紫微有變。氣運／智計可解星象，或趁機改史。\n' + fmtAttrs(S),
        gateChoices(S, [
          { id: 'st_read', label: '智計解星象', need: { zhi: 6, yun: 3 }, effect: 'star_read' },
          { id: 'st_fake', label: '辯才偽作讖語助己', need: { bian: 7 }, effect: 'star_fake' },
          { id: 'st_quiet', label: '焚香不問', effect: 'noop' }
        ]), { face: 'scholar' });
    }

    // —— 鐵盟試煉 ——
    if (!S.seenEvents.iron_trial && day >= 15 && (S.flags.visited_iron_league || (S.skills && S.skills.craft >= 2))) {
      return makeEvent('iron_trial', '鐵盟試煉',
        '鐵盟坊主以爐火試你。護體耐熱、武力擊錘、智計控火——擇一。\n' + fmtAttrs(S),
        gateChoices(S, [
          { id: 'ir_hammer', label: '武力連錘百下', need: { wu: 5 }, effect: 'iron_hammer' },
          { id: 'ir_endure', label: '護體近爐不退', need: { hu: 5 }, effect: 'iron_endure' },
          { id: 'ir_temp', label: '智計控火候', need: { zhi: 5 }, effect: 'iron_temp' },
          { id: 'ir_fail', label: '知難而退', effect: 'noop' }
        ]), { face: 'soldier' });
    }

    // —— 成蟜勸叛影 ——
    if (!S.seenEvents.chengjiao_plot && day >= 60 && (S.access && S.access.palace)) {
      return makeEvent('chengjiao_plot', '長安君密信',
        '成蟜使人密邀：若助其「分國自保」，許邊地之利。辯才可拒，智計可陽奉陰違，武力可擒來使。\n' + fmtAttrs(S),
        gateChoices(S, [
          { id: 'cj_catch', label: '武力擒使獻王', need: { wu: 6 }, effect: 'cj_loyal' },
          { id: 'cj_fake', label: '智計陽奉陰違', need: { zhi: 7 }, effect: 'cj_double' },
          { id: 'cj_join', label: '暗中應允', need: { bian: 4 }, effect: 'cj_rebel' },
          { id: 'cj_burn', label: '焚信不問', effect: 'noop' }
        ]), { face: 'farmer_m', faction: 'qin' });
    }

    // —— 澤地毒瘴（副本連動）——
    if (!S.seenEvents.marsh_plague && (S.explore && (S.explore.marshBest || 0) >= 2)) {
      return makeEvent('marsh_plague', '澤地毒瘴',
        '澤中瘴氣侵村。護體可抗毒探源，智計可配解药，辯才可組織撤离。\n' + fmtAttrs(S),
        gateChoices(S, [
          { id: 'mp_tank', label: '護體探源斬怪', need: { hu: 6, wu: 4 }, effect: 'marsh_clear' },
          { id: 'mp_med', label: '智計配解药', need: { zhi: 5 }, effect: 'marsh_cure' },
          { id: 'mp_evac', label: '辯才組織撤離', need: { bian: 5 }, effect: 'marsh_evac' },
          { id: 'mp_none', label: '無力相助', effect: 'noop' }
        ]), { face: 'doctor' });
    }

    return null;
  }

  function fmtAttrs(S) {
    var a = attrsOf(S);
    return '武' + a.wu + ' 護' + a.hu + ' 身' + a.shen + ' 智' + a.zhi + ' 辯' + a.bian + ' 運' + a.yun;
  }

  function bumpAttr(S, key, n) {
    if (!S.attrs) S.attrs = { wu: 0, hu: 0, shen: 0, zhi: 0, bian: 0, yun: 0 };
    S.attrs[key] = Math.max(0, (S.attrs[key] || 0) + n);
  }

  function diverge(S, id, note) {
    if (global.QianWorld && global.QianWorld.markDiverged) {
      global.QianWorld.markDiverged(S, id, note);
    } else {
      if (!S.diverged) S.diverged = [];
      S.diverged.push({ id: id, note: note, day: S.day });
      if (!S.histFlags) S.histFlags = {};
      S.histFlags[id] = 'changed';
    }
  }

  function applyChoice(S, event, choiceId) {
    if (!S.seenEvents) S.seenEvents = {};
    if (!S.flags) S.flags = {};
    if (!S.plotFlags) S.plotFlags = {};
    var ch = null;
    (event.choices || []).forEach(function (c) { if (c.id === choiceId) ch = c; });
    if (!ch) return { toast: '……', line: '' };
    if (ch.locked || (ch.need && !needOk(S, ch.need))) {
      return { toast: '屬性不足，無法如此', line: '你心有餘而力不足——' + needTip(S, ch.need) };
    }
    S.seenEvents[event.id] = true;
    S.pendingEvent = null;
    var effect = ch.effect || 'noop';
    var line = '';
    var toast = '';
    var F = global.QianFactions;

    function bump(fac, n) { if (F) F.bump(S, fac, n); else if (fac === 'fame' || fac === 'people') S[fac] = (S[fac] || 0) + n; else if (S.factions) S.factions[fac] = (S.factions[fac] || 0) + n; }

    switch (effect) {
      case 'lu_save_force':
        S.plotFlags.lu_saved = 'force';
        bump('lu', 25); bump('qin', -15); bump('fame', 8);
        bumpAttr(S, 'wu', 1);
        S.gold = (S.gold || 0) + 80;
        if (global.QianEquip) {
          var g = global.QianEquip.spawn('lu_shi_yin', (S.gearSeq = (S.gearSeq || 1) + 1), 'shi');
          if (g) S.gear.push(g);
        }
        diverge(S, 'lu_fate', '呂不韋得門客武力救出，未即敗亡');
        line = '你殺開血路，护送呂不韋連夜出咸陽。史冊或將改寫——相邦未亡於此次圍捕。';
        toast = '改史·呂氏得脫（武）';
        break;
      case 'lu_save_trick':
        S.plotFlags.lu_saved = 'trick';
        bump('lu', 22); bump('qin', -10); bump('fame', 6);
        bumpAttr(S, 'zhi', 1);
        S.gold = (S.gold || 0) + 60;
        diverge(S, 'lu_fate', '呂不韋藉調虎離山得脫');
        line = '你散布「東門走私車隊」假線報，甲士傾巢而去。呂不韋從西巷潛走。智計改史。';
        toast = '改史·調虎離山';
        break;
      case 'lu_save_talk':
        S.plotFlags.lu_saved = 'talk';
        bump('lu', 18); bump('qin', -6); bump('fame', 5);
        bumpAttr(S, 'bian', 1);
        diverge(S, 'lu_fate', '呂不韋得緩兵一夜，從容佈置');
        line = '你以利害說動監門校尉暫緩搜查。一夜之間，相邦府密檔已空。';
        toast = '改史·緩兵';
        break;
      case 'lu_save_luck':
        S.plotFlags.lu_saved = 'luck';
        bump('lu', 15); bump('yun', 0); bump('fame', 4);
        bumpAttr(S, 'yun', 1); bumpAttr(S, 'shen', 1);
        diverge(S, 'lu_fate', '密信得達，呂黨外線接應成功');
        line = '你身法穿巷，氣運也佳——密信竟未落入敵手。城外已有車仗接應。';
        toast = '改史·密信';
        break;
      case 'lu_abandon':
        S.plotFlags.lu_saved = false;
        bump('lu', -12); bump('qin', 5);
        line = '你袖手。黎明鼓聲中，相邦府火光衝天。呂氏大勢去矣。';
        toast = '旁觀·呂黨勢衰';
        break;
      case 'lu_betray':
        S.plotFlags.lu_betrayed = true;
        bump('qin', 20); bump('lu', -30); bump('fame', 3);
        S.gold = (S.gold || 0) + 120;
        if (S.joined === 'lu') S.joined = 'qin';
        line = '你向王府告密。賞銀沉重，呂門客眼中的刀光更重。';
        toast = '告密·賞銀+120';
        break;
      case 'laoai_qin':
        bump('qin', 15); bump('lu', -10); bumpAttr(S, 'wu', 1);
        diverge(S, 'laoai', '你助王府先發，亂萌被壓');
        line = '你助衛卒先控制甲仗庫。兵變未成氣候。';
        toast = '助王·亂止';
        break;
      case 'laoai_lu':
        bump('lu', 12); bump('qin', -8);
        line = '你通風報信，私門得以收縮。后黨記你一功。';
        toast = '通風·后黨';
        break;
      case 'laoai_peace':
        bump('people', 8); bump('fame', 5); bumpAttr(S, 'zhi', 1);
        diverge(S, 'laoai', '智計勸和，宮變化為暗流');
        line = '你指出兩敗俱傷之害，雙方暫退。亂事化為暗流。';
        toast = '勸和·智計';
        break;
      case 'laoai_folk':
        bump('people', 12); bumpAttr(S, 'shen', 1);
        line = '你帶鄉民從側門撤走。民心归你。';
        toast = '護民';
        break;
      case 'zg_pro':
        bump('people', 6); bump('qin', 4); bumpAttr(S, 'bian', 1);
        S.flags.zhengguo_pro = 1;
        diverge(S, 'zhengguo', '渠議偏利農，工程得更多支持');
        line = '你力陳灌田之利，田戶鼓掌。渠議偏向開工。';
        toast = '利農辯成';
        break;
      case 'zg_anti':
        bump('qin', 8); bump('lu', -3); bumpAttr(S, 'zhi', 1);
        S.flags.zhengguo_anti = 1;
        diverge(S, 'zhengguo', '疲秦之計被揭，韓使受審');
        line = '你指出疲秦之疑。廷議轉為審查水工來歷。';
        toast = '揭計';
        break;
      case 'lisi_agree':
        bump('qin', 12); bump('lu', -8);
        line = '你附議強王權。李斯頷首，記你一筆。';
        toast = '附議李斯';
        break;
      case 'lisi_balance':
        bump('qin', 6); bump('lu', 4); bump('fame', 4); bumpAttr(S, 'zhi', 1);
        diverge(S, 'lisi', '公私調和之說得傳');
        line = '你提出「農戰為先、私門有限」的折中。兩造皆未全怒。';
        toast = '調和';
        break;
      case 'lisi_lu':
        bump('lu', 10); bump('qin', -6);
        line = '你為私門辯護。呂黨喜，王府記恨。';
        toast = '辯護私門';
        break;
      case 'border_win':
        bump('qin', 10); bump('fame', 6); bumpAttr(S, 'wu', 1); bumpAttr(S, 'hu', 1);
        S.gold = (S.gold || 0) + 50;
        if (global.QianEquip) {
          var g2 = global.QianEquip.spawn('bian_jun_kai', (S.gearSeq = (S.gearSeq || 1) + 1), 'liang');
          if (g2) S.gear.push(g2);
        }
        line = '你力戰至鼓聲再起。胡騎退去，關市送上邊軍鎧。';
        toast = '邊關大捷';
        break;
      case 'border_signal':
        bump('qin', 6); bump('fame', 3); bumpAttr(S, 'shen', 1);
        line = '你飛身傳烽，援軍及時。關市保全。';
        toast = '傳烽成功';
        break;
      case 'border_ambush':
        bump('qin', 8); bump('sai', 4); bumpAttr(S, 'zhi', 1);
        S.gold = (S.gold || 0) + 40;
        line = '你設伏於隘口，胡騎損折而退。';
        toast = '設伏成功';
        break;
      case 'border_retreat':
        bump('sai', 6); bump('people', 4);
        line = '你護商隊撤退，邊市盟記你人情。';
        toast = '護商';
        break;
      case 'star_read':
        bump('fame', 5); bumpAttr(S, 'zhi', 1); bumpAttr(S, 'yun', 1);
        S.plotFlags.star_read = 1;
        diverge(S, 'star_omen', '星象解讀影響朝議氣氛');
        line = '你解得「王氣漸盛、私門當斂」。方士傳語入宮。';
        toast = '解星';
        break;
      case 'star_fake':
        bump('fame', 3); bump('lu', 5); bumpAttr(S, 'bian', 1);
        S.flags.fake_omen = 1;
        line = '你偽作有利於己的讖語。日後或有識破風險。';
        toast = '偽讖';
        break;
      case 'iron_hammer':
        bumpAttr(S, 'wu', 1); bump('fame', 2);
        if (global.QianEquip) {
          var g3 = global.QianEquip.spawn('qinggang_dao', (S.gearSeq = (S.gearSeq || 1) + 1), 'liang');
          if (g3) S.gear.push(g3);
        }
        S.flags.iron_member = 1;
        line = '鐵盟認你臂力。青鋼刀相贈，坊主記名。';
        toast = '鐵盟·錘煉通過';
        break;
      case 'iron_endure':
        bumpAttr(S, 'hu', 1);
        if (global.QianEquip) {
          var g4 = global.QianEquip.spawn('tie_kai', (S.gearSeq = (S.gearSeq || 1) + 1), 'liang');
          if (g4) S.gear.push(g4);
        }
        S.flags.iron_member = 1;
        line = '你近爐不退。鐵札甲相贈。';
        toast = '鐵盟·護體通過';
        break;
      case 'iron_temp':
        bumpAttr(S, 'zhi', 1); S.skills = S.skills || {}; S.skills.craft = Math.min(8, (S.skills.craft || 0) + 1);
        S.flags.iron_member = 1;
        S.gold = (S.gold || 0) + 35;
        line = '你控火精準。坊主嘆服，工藝精進。';
        toast = '鐵盟·火候通過';
        break;
      case 'cj_loyal':
        bump('qin', 15); bump('fame', 5); bumpAttr(S, 'wu', 1);
        diverge(S, 'chengjiao', '密使被擒，長安君陰謀暴露');
        line = '你擒使獻王。王府賞識，成蟜側目。';
        toast = '擒使·忠王';
        break;
      case 'cj_double':
        bump('qin', 4); bump('fame', 2); bumpAttr(S, 'zhi', 1);
        S.flags.cj_double = 1;
        line = '你虛應之，暗中留證。進退皆有餘地。';
        toast = '陽奉陰違';
        break;
      case 'cj_rebel':
        bump('qin', -12); S.flags.cj_rebel = 1; bump('fame', 3);
        line = '你暗中應允。此乃險途——一旦敗露，誅族之禍。';
        toast = '暗通長安君';
        break;
      case 'marsh_clear':
        bump('people', 8); bump('fame', 4); bumpAttr(S, 'hu', 1);
        if (S.explore && S.explore.bosses) S.explore.bosses.marsh = (S.explore.bosses.marsh || 0) + 1;
        line = '你抗毒探源，斬斷瘴眼。澤地稍安。';
        toast = '斬瘴';
        break;
      case 'marsh_cure':
        bump('people', 10); S.bag = S.bag || {}; S.bag.potion = (S.bag.potion || 0) + 3; bumpAttr(S, 'zhi', 1);
        line = '你配出解毒湯散，施於里人。';
        toast = '解毒';
        break;
      case 'marsh_evac':
        bump('people', 12); bumpAttr(S, 'bian', 1);
        line = '你組織撤離有序，無人踩踏。民心大增。';
        toast = '撤離得法';
        break;
      default:
        line = '你未插手此事。風潮自過。';
        toast = '作罷';
    }
    S.worldLine = (S.worldLine || '') + (S.plotFlags.lu_saved ? '　呂氏命運已改。' : '');
    return { toast: toast, line: line };
  }

  function ensure(S) {
    if (!S) return S;
    if (!S.attrs) S.attrs = { wu: 0, hu: 0, shen: 0, zhi: 0, bian: 0, yun: 0 };
    if (!S.plotFlags) S.plotFlags = {};
    if (!S.seenEvents) S.seenEvents = {};
    return S;
  }

  /** 職業開局基礎屬性 */
  var CAREER_ATTRS = {
    farmer:    { wu: 1, hu: 1, shen: 1, zhi: 1, bian: 1, yun: 2 },
    healer:    { wu: 0, hu: 1, shen: 1, zhi: 2, bian: 1, yun: 2 },
    merchant:  { wu: 0, hu: 0, shen: 1, zhi: 1, bian: 3, yun: 2 },
    soldier:   { wu: 3, hu: 2, shen: 1, zhi: 0, bian: 0, yun: 1 },
    scholar:   { wu: 0, hu: 0, shen: 1, zhi: 3, bian: 2, yun: 1 },
    craftsman: { wu: 1, hu: 2, shen: 0, zhi: 2, bian: 1, yun: 1 },
    hunter:    { wu: 2, hu: 1, shen: 2, zhi: 1, bian: 0, yun: 1 },
    ranger:    { wu: 2, hu: 1, shen: 2, zhi: 1, bian: 1, yun: 2 }
  };

  function initAttrsFromCareer(S, careerId) {
    ensure(S);
    var base = CAREER_ATTRS[careerId] || CAREER_ATTRS.farmer;
    S.attrs = {
      wu: base.wu, hu: base.hu, shen: base.shen,
      zhi: base.zhi, bian: base.bian, yun: base.yun
    };
    // skills soft bonus already separate; small migrate from skills
    var sk = S.skills || {};
    S.attrs.wu += Math.floor((sk.mart || 0) / 2);
    S.attrs.zhi += Math.floor((sk.lit || 0) / 2) + Math.floor((sk.med || 0) / 3);
    S.attrs.bian += Math.floor((sk.trade || 0) / 2);
    S.attrs.shen += Math.floor((sk.agi || 0) / 2);
    S.attrs.hu += Math.floor((sk.craft || 0) / 3);
    return S.attrs;
  }

  global.QianPlots = {
    poll: poll,
    applyChoice: applyChoice,
    ensure: ensure,
    attrsOf: attrsOf,
    needOk: needOk,
    needTip: needTip,
    fmtAttrs: fmtAttrs,
    initAttrsFromCareer: initAttrsFromCareer,
    CAREER_ATTRS: CAREER_ATTRS,
    gateChoices: gateChoices
  };
})(typeof window !== 'undefined' ? window : globalThis);
