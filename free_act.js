/* 墨夢莊周 · v45 自由行動（出身／職業影響意圖）
 * AI／離線模板 → 旗標／好感／NPC 行動／劇情節點推進（jump／匹配選項）
 * 原創對白與規則，不抄錄任何小說原文。
 */
(function (global) {
  'use strict';

  var SPEAKER_NPC = {
    '何伯': 'he', '蘇娘': 'su', '趙三郎': 'zhao', '林嫂': 'lin', '伍叔': 'wu', '成郎': 'cheng',
    '嬴政': 'yingzheng', '少年秦王': 'yingzheng', '秦王': 'yingzheng',
    '呂不韋': 'lubuwei', '相邦': 'lubuwei', '趙姬': 'zhaoji', '太后': 'zhaoji',
    '嫪毐': 'laoai', '李斯': 'lisi', '王翦': 'wangjian', '蒙恬': 'mengtian', '蒙毅': 'mengyi',
    '太醫署吏': 'yiguan', '賈人馮': 'feng', '門客': 'menke', '衛士': 'wu', '侍史': 'neishi',
    '路人': 'cheng', '關吏': 'zhao', '驛卒': 'wu'
  };

  var LOC_CAST = {
    hut: ['he', 'lin'], village: ['he', 'lin', 'cheng'], farm: ['lin', 'he'],
    clinic: ['su', 'yiguan'], market: ['zhao', 'feng'], wild: ['wu', 'su'],
    tavern: ['zhao', 'cheng'], academy: ['cheng', 'xueshi'], post: ['wu', 'zhao'],
    xianyang: ['zhao', 'neishi', 'lisi'], palace: ['yingzheng', 'neishi', 'wu'],
    xiangbang: ['lubuwei', 'menke'], taihou: ['zhaoji', 'laoai'], keguan: ['lisi', 'chu_envoy'],
    frontier: ['mengtian', 'wangjian'], ying: ['wangjian', 'mengtian'], study: ['cheng', 'lisi'],
    guowei: ['mengyi'], guanshi: ['zhao', 'guren'], tea: ['cheng', 'chashi']
  };

  var ACTION_LABEL = {
    leave: '離去', gift: '回贈', follow: '願隨', open_gate: '開門放行',
    attack: '拔刃相對', invite: '邀約同行', schedule_meet: '約期再見', none: '無行動'
  };

  function castById(id) {
    var C = (global.QianWorld && global.QianWorld.CAST) || [];
    for (var i = 0; i < C.length; i++) if (C[i].id === id) return C[i];
    return null;
  }

  function ensureNpc(S, id) {
    if (!S.npcs) S.npcs = {};
    if (!S.npcs[id]) S.npcs[id] = { aff: 0, mem: [], talked: 0, known: false };
    return S.npcs[id];
  }

  function nodeOk(id) {
    return !!(global.QianStoryFlow && global.QianStoryFlow.NODES && global.QianStoryFlow.NODES[id]);
  }

  function curNodeId(S) {
    return (S.storyFlow && S.storyFlow.nodeId) || '';
  }

  function chapterOf(S) {
    var n = global.QianStoryFlow && global.QianStoryFlow.getNode(S);
    return (n && n.chapter) || '';
  }

  function pickFocusNpc(S) {
    var node = global.QianStoryFlow && global.QianStoryFlow.getNode(S);
    var speaker = node && node.speaker;
    if (speaker && SPEAKER_NPC[speaker]) {
      var n0 = castById(SPEAKER_NPC[speaker]);
      if (n0) return n0;
    }
    var bg = (node && node.bg) || (S.mode) || 'village';
    var list = LOC_CAST[bg] || LOC_CAST.village;
    for (var i = 0; i < list.length; i++) {
      var c = castById(list[i]);
      if (c) return c;
    }
    return castById('he') || { id: 'he', name: '何伯', role: '里正', lines: ['嗯。'], bio: '' };
  }

  function disguiseLine(S) {
    if (!S || !S.hero) return '不顯';
    if (S.hero.disguise === 'male' && S.hero.gender === 'f') return '女扮男裝中';
    if (S.hero.disguise === 'female' && S.hero.gender === 'm') return '男扮女裝中';
    if (S.hero.gender === 'f') return '女裝';
    if (S.hero.gender === 'm') return '男子';
    return '不顯';
  }

  function locConstraints(S) {
    var bits = [];
    var access = S.access || {};
    if (access.palace) bits.push('已通宮城門禁');
    else bits.push('未通宮城門禁（需收買／輕功／麻醉／扮相）');
    if (access.xiangbang) bits.push('可近相邦府');
    if (access.ying) bits.push('軍營有通行痕跡');
    var node = global.QianStoryFlow && global.QianStoryFlow.getNode(S);
    if (node) bits.push('當前劇情：' + (node.chapter || '') + '/' + (node.id || '') + ' · 在場口吻「' + (node.speaker || '旁白') + '」');
    bits.push('地點氛圍：' + ((node && node.bg) || S.mode || 'village'));
    return bits.join('；');
  }

  function flagDigest(S) {
    var pf = S.plotFlags || {};
    var keys = Object.keys(pf).filter(function (k) { return pf[k]; }).slice(0, 18);
    return keys.map(function (k) { return k + '=' + pf[k]; }).join('；') || '無';
  }

  function memLine(S, id) {
    if (global.QianStory && global.QianStory.fullMem) return global.QianStory.fullMem(S, id);
    var st = S.npcs && S.npcs[id];
    return st && st.mem ? st.mem.slice(-6).join('；') : '';
  }

  function choiceDigest(S) {
    if (!global.QianStoryFlow || !global.QianStoryFlow.visibleChoices) return '';
    return global.QianStoryFlow.visibleChoices(S).map(function (c) {
      return c.id + ':' + c.text + (c.locked ? '(鎖)' : '');
    }).slice(0, 10).join('｜');
  }

  function buildContext(S, mode, text) {
    var npc = pickFocusNpc(S);
    var st = ensureNpc(S, npc.id);
    return {
      mode: mode === 'do' ? 'do' : 'say',
      text: String(text || '').slice(0, 160),
      npcId: npc.id,
      npcName: npc.name,
      npcRole: npc.role || '',
      bio: npc.bio || '',
      linesHint: (npc.lines || []).slice(0, 3).join('／'),
      aff: Math.floor(st.aff || 0),
      mem: memLine(S, npc.id),
      feel: global.QianStory && global.QianStory.feelLine ? global.QianStory.feelLine(S, npc.id) : '',
      disguise: disguiseLine(S),
      loc: locConstraints(S),
      flags: flagDigest(S),
      choices: choiceDigest(S),
      nodeId: curNodeId(S),
      fateSummary: global.QianArcs && global.QianArcs.fateSummary ? global.QianArcs.fateSummary(S) : '',
      career: (S.career || '') + '',
      origin: (S.hero && S.hero.origin) || '',
      dayStr: global.QianWorld && global.QianWorld.dayLabel ? global.QianWorld.dayLabel(S.day || 1) : ('第' + (S.day || 1) + '日'),
      worldMode: S.worldMode === 'free' ? '高度自由' : '史實軌道',
      heroCtx: global.QianWorld && global.QianWorld.heroContext ? global.QianWorld.heroContext(S) : '',
      factionStance: global.QianFactions && global.QianFactions.stanceText ? global.QianFactions.stanceText(S) : '',
      palaceAccess: !!(S.access && S.access.palace),
      gold: S.gold || 0
    };
  }

  /** 離線意圖分類 */
  function classify(text, mode) {
    var t = String(text || '');
    if (/贈|送禮|獻|奉上|送你|送件|回禮/.test(t)) return 'gift';
    if (/賄|收買|塞銀|打點|買通/.test(t)) return 'bribe';
    if (/打|殺|威脅|恐嚇|拔刀|動手|砍/.test(t)) return 'threat';
    if (/表白|傾心|愛你|喜歡你|嫁|娶|同心|終身/.test(t)) return 'confess';
    if (/愛|喜歡|親近|溫存|昨夜|枕|吻|懷|勾引|調笑/.test(t)) return 'flirt';
    if (/入宮|進宮|宮門|宮城|覲見|求見王|通宮/.test(t)) return 'palace';
    if (/潛|偷|溜|翻牆|夜探|窺/.test(t)) return 'sneak';
    if (/醫|診|藥|敷|治傷|把脈|夜診/.test(t)) return 'heal';
    if (/身份|其實我是|女扮|男扮|卸裝|真面目/.test(t)) return 'reveal';
    if (/投靠|效命|追隨|願為|願隨|入府|入門|跟你/.test(t)) return 'join';
    if (/約|改日|再見|再會|後日|明日見|約在/.test(t)) return 'schedule';
    if (/請|邀|一道|同行|跟我來|來客棧/.test(t)) return 'invite';
    if (/運糧|幫林嫂|假秤|夜診|支線|密語|關市|皮貨|書塾|辯法|無名書|代送|巡夜|毒草|水車|洗名|換馬|戶籍|抄籍/.test(t)) return 'side';
    if (/太醫署|署吏|自薦/.test(t)) return 'taiyi';
    if (/相邦|呂不韋|呂府/.test(t)) return 'xiangbang';
    if (/太后|趙姬/.test(t)) return 'taihou';
    if (/咸陽|赴京|上路|啟程/.test(t)) return 'xianyang';
    if (/採藥|上山/.test(t)) return 'herb';
    if (/打聽|問|請問|何事|緣故|傳聞|風聲/.test(t)) return 'ask';
    if (/告辭|離開|走了|回去|失陪|退下/.test(t)) return 'leave';
    if (/道歉|恕罪|抱歉|得罪/.test(t)) return 'apologize';
    if (/見|找|尋|拜見|求見/.test(t) && /蘇|何伯|林嫂|秦王|嬴|賈人|成郎|蒙|李斯/.test(t)) return 'meet';
    if (mode === 'do' && /走|去|往|尋|找/.test(t)) return 'go';
    if (mode === 'do') return 'act';
    return 'chat';
  }

  function coldish(npc) {
    return /yingzheng|lubuwei|zhaoji|lisi|laoai|mengtian|wangjian|neishi/.test(npc && npc.id);
  }

  function toneReply(npc, intent, S) {
    var role = (npc.role || '') + (npc.id || '');
    var base = (npc.lines && npc.lines[0]) || '……';
    var cold = /秦王|相邦|太后|客卿|軍候|將/.test(role) || coldish(npc);
    var warm = /藥婆|田戶|書生|里正/.test(role) || /su|lin|cheng|he/.test(npc.id);
    var map = {
      gift: cold ? '你的心意，收下了。別指望一次饋贈便換國事。' : (warm ? '有心了。這份情，我記在心裏。' : '物到情到。往後共事，也好說話。'),
      bribe: cold ? '銀兩可通小路，通不了人心。收了——但別以為買得了名分。' : '銀兩入袖。此事我替你通融一分，可別張揚。',
      threat: cold ? '刀已經出鞘了？退下。再進一步，你連姓名都不會留在冊上。' : '你嚇誰？里中不是江湖，收起這套。',
      flirt: cold ? '……放肆。再有半句，逐出廊外。' : (warm ? '你——這話太急。我……先記下，別逼我此刻應承。' : '風月與時局，別混一談。收一收。'),
      confess: cold ? '……你把情字說得太滿。本座／寡人只聽「用」。' : (warm ? '你既說到這地步……我不敢輕諾，但也不忍推開。' : '情義重大。容我思量三日。'),
      palace: '宮門如獄。無符節、無門路，空言入宮——只會惹衛士盯梢。',
      sneak: cold ? '禁地夜行，九死一生。你若被擒，莫說與我有舊。' : '翻牆不是兒戲。被看見，連累一村。',
      heal: /醫|藥|太醫/.test(role) || npc.id === 'su' || npc.id === 'yiguan'
        ? '把脈、辨色。你若誠心學，我教你三分火候。'
        : '我非醫者。傷了，去藥廬找蘇娘。',
      reveal: '裝束之事……我略有所疑。你若還想走這條路，就別把底細當酒話。',
      join: cold ? '願效命？先拿出能辦事的證據，再談名分。' : '你肯來幫襯，也好。先從眼前小事做起。',
      schedule: warm ? '好。後日此處見——別失約。' : '可。時辰一到，自己來。',
      invite: warm ? '既邀，我走一程。' : '……隨你。別惹麻煩。',
      side: '這樁事，我聽進去了。你若真要做，便去做。',
      taiyi: '太醫署門檻不低。你有藥樣與跟診痕跡，或可敲門。',
      xiangbang: '相邦府看「用」。空手去，只怕門客連名刺都不接。',
      taihou: '太后宮外，少聽少傳——你自己掂量。',
      xianyang: '咸陽路遠。備妥藥、名、或一紙薄薦，再上路不遲。',
      herb: '山徑露濕。小心蛇蟲，辨葉脈再下手。',
      meet: '要見的人，未必在此。你可往對應之處尋。',
      ask: base + '——你問的這樁，我知三分，說三分。',
      leave: '去罷。有事，再來。',
      apologize: warm ? '既然知錯，便罷。別把同樣的錯再犯一次。' : '知道了。下不為例。',
      go: '去吧。路在腳下，禍福自擔。',
      act: cold ? '你要做的事，我看在眼裏。成敗，以後再算。' : '你既要做，我便不攔。小心些。',
      chat: base
    };
    var line = map[intent] || base;
    if (npc.id === 'yingzheng') {
      if (intent === 'flirt' || intent === 'confess') line = '……放肆。廊外風大，你退下。';
      if (intent === 'gift') line = '收下。別以為一次獻物，便能走近側。';
      if (intent === 'join') line = '效命？先把話說短，把事做實。';
      if (intent === 'ask') line = '邊野亦是秦土。你問的，寡人聽了——未必答。';
      if (intent === 'palace') line = '宮門自有符節。你若已通，便進來；未通，莫空言。';
    }
    if (npc.id === 'su' && (intent === 'flirt' || intent === 'confess' || intent === 'heal')) {
      if (intent === 'heal') line = '伸手。讓我看傷口深淺。';
      else line = '藥香裡說這種話……我臉熱。你若真心，便用行動護一護這青廬。';
    }
    if (npc.id === 'lubuwei' && intent === 'join') {
      line = '奇貨可居，人才亦然。你若有用，相邦府不拒客——先報一件實事來。';
    }
    if ((intent === 'palace' || intent === 'bribe') && S.access && S.access.palace) {
      line = '門禁你已通。再往宮城，便是你的腳步。';
    }
    /* v45：出身／職業微調語氣 */
    var origin = (S.hero && S.hero.origin) || '';
    var career = S.career || '';
    if (intent === 'bribe' && (/merchant|guest|steppe/.test(origin) || /merchant|agent|courier/.test(career))) {
      line = '你袖中銀兩份量，我識得。通融可以——別張揚。';
    }
    if (intent === 'heal' && (/tradoc|shaman/.test(origin) || /healer|herbalist/.test(career))) {
      line = '醫門／採藥路數，我聞得出。坐，把脈。';
    }
    if (intent === 'join' && (/clerk|gentry|fallennoble/.test(origin) || /scribe|scholar/.test(career))) {
      line = '你文墨尚可。先辦一件文書實事，再談名分。';
    }
    if (intent === 'threat' && (/soldier|outlaw/.test(origin) || /soldier|ranger|boatman/.test(career))) {
      line = '你身上有刀氣。收住——此處不是野路。';
    }
    if (intent === 'sneak' && (origin === 'outlaw' || career === 'agent')) {
      line = '夜影是你的熟路。別在禁地炫技。';
    }
    return line;
  }

  /** 把玩家輸入對到當前節點可見選項（推進同一條邊） */
  function matchVisibleChoice(S, text, intent) {
    if (!global.QianStoryFlow || !global.QianStoryFlow.visibleChoices) return null;
    var choices;
    try {
      choices = global.QianStoryFlow.visibleChoices(S).filter(function (c) { return !c.locked; });
    } catch (e) { return null; }
    if (!choices.length) return null;
    var t = String(text || '');
    var best = null;
    var bestScore = 0;
    var intentHints = {
      palace: /入宮|宮門|門禁|宮城|覲見/,
      bribe: /收買|賄|銀|打點/,
      heal: /醫|診|藥|敷|跟診/,
      herb: /採藥|上山/,
      side: /運糧|假秤|夜診|支線|密語|關市|書塾|無名書/,
      taiyi: /太醫|署吏/,
      xiangbang: /相邦|呂/,
      taihou: /太后/,
      xianyang: /咸陽|啟程|上路/,
      join: /效命|追隨|投靠/,
      leave: /退|回|告辭|離開/,
      flirt: /溫|親|慰/,
      confess: /表白|傾心|愛/,
      meet: /見|尋|找|訪/,
      go: /去|往|走/,
      sneak: /潛|翻牆|輕功/,
      ask: /問|打聽/
    };
    for (var i = 0; i < choices.length; i++) {
      var c = choices[i];
      var score = 0;
      var ct = c.text || '';
      /* 字面重疊 */
      var chunks = t.replace(/[，。！？、\s]/g, ' ').split(/\s+/).filter(function (x) { return x.length >= 2; });
      for (var j = 0; j < chunks.length; j++) {
        if (ct.indexOf(chunks[j]) >= 0) score += 3;
      }
      if (intentHints[intent] && intentHints[intent].test(ct)) score += 5;
      if (intent === 'palace' && /入宮|門禁|宮城|設法入宮|再入宮/.test(ct)) score += 4;
      if (intent === 'palace' && /設法入宮|再入宮|門禁/.test(ct)) score += 6;
      if (intent === 'palace' && /觀望/.test(ct) && /入宮/.test(t)) score -= 3;
      if (intent === 'bribe' && /收買|銀/.test(ct)) score += 4;
      if (intent === 'side' && /運糧|假秤|夜診|支線|密語|關市|書塾|無名書/.test(ct)) score += 6;
      if (intent === 'heal' && /跟診|藥|醫|診/.test(ct)) score += 4;
      if (intent === 'herb' && /採藥/.test(ct)) score += 5;
      if (intent === 'xianyang' && /咸陽|啟程/.test(ct)) score += 5;
      if (intent === 'taiyi' && /太醫/.test(ct)) score += 5;
      if (intent === 'leave' && /退|回|回去|暫/.test(ct)) score += 3;
      if (score > bestScore) { bestScore = score; best = c; }
    }
    if (best && bestScore >= 5) return best.id;
    return null;
  }

  /** 依意圖建議跳轉節點（當匹配不到當前選項時） */
  function suggestJump(S, text, intent) {
    var t = String(text || '');
    var ch = chapterOf(S);
    var nid = curNodeId(S);
    var access = S.access || {};
    var flags = S.flags || {};
    var inVil = /prologue|ch1|side/.test(ch) && !/xianyang|court/.test(ch) && !/^xy_|^ch2_|^side_scale|^side_night|^side_inn|^side_pass|^side_school|^side_letter/.test(nid);
    var inXy = /xianyang|court|resume/.test(ch) || /^xy_|^ch2_arrive|^resume_/.test(nid) || !!flags.visited_xianyang;

    function ok(id) { return nodeOk(id) ? id : null; }

    /* 入宮 */
    if (intent === 'palace' || (/入宮|宮門|宮城/.test(t))) {
      if (access.palace) return ok('xy_palace_in');
      if (inXy || flags.visited_xianyang || nid.indexOf('xy_') === 0) return ok('xy_palace_gate');
      if (flags.ch1_ready || flags.left_village) return ok('ch2_road');
      return ok('ch1_hub');
    }
    /* 支線關鍵字 */
    if (intent === 'side' || /運糧|林嫂/.test(t)) {
      if (!flags.side_vil_grain && (inVil || ch === 'ch1' || nid === 'ch1_hub')) return ok('side_vil_grain');
    }
    if (/假秤/.test(t) && !flags.side_scale && (inXy || nid === 'xy_side' || nid === 'xy_hub')) return ok('side_scale');
    if (/夜診/.test(t) && !flags.side_clinic && (inXy || nid === 'xy_side')) return ok('side_nightclinic');
    if (/密語|客館/.test(t) && !flags.side_inn && inXy) return ok('side_inn');
    if (/關市|皮貨/.test(t) && !flags.side_pass && inXy) return ok('side_pass');
    if (/書塾|辯法|成郎/.test(t) && !flags.side_school && inXy) return ok('side_school');
    if (/無名書|代送/.test(t) && !flags.side_letter && inXy) return ok('side_letter');
    if (/巡夜|校場幫哨|幫哨/.test(t) && !flags.side_drill) return ok('side_drill_help');
    if (/毒草|辨草/.test(t) && !flags.side_witch) return ok('side_witch_herb');
    if (/水車|渠軸|修軸/.test(t) && !flags.side_canal) return ok('side_canal_labor');
    if (/洗名|貼告/.test(t) && !flags.side_exile) return ok('side_exile_mark');
    if (/換馬|邊市皮/.test(t) && !flags.side_sai && (inXy || flags.visited_xianyang)) return ok('side_sai_trade');
    if (/戶籍|抄籍/.test(t) && !flags.side_clerk && (inXy || flags.visited_xianyang)) return ok('side_clerk_doc');
    /* 出身／職業偏向：自由輸入「支線」時優先推相關節點 */
    if (intent === 'side') {
      var origin = (S.hero && S.hero.origin) || '';
      var career = S.career || '';
      if (inVil || ch === 'ch1') {
        if (!flags.side_drill && (/soldier|outlaw/.test(origin) || /soldier|boatman|ranger|hunter/.test(career))) return ok('side_drill_help');
        if (!flags.side_witch && (/tradoc|shaman/.test(origin) || /healer|herbalist|diviner/.test(career))) return ok('side_witch_herb');
        if (!flags.side_canal && (origin === 'artisan' || /craftsman|smith/.test(career))) return ok('side_canal_labor');
        if (!flags.side_exile && origin === 'exile') return ok('side_exile_mark');
        if (!flags.side_vil_grain) return ok('side_vil_grain');
      }
      if (inXy || flags.visited_xianyang) {
        if (!flags.side_sai && (/steppe|guest|outlaw/.test(origin) || /ranger|courier|agent/.test(career))) return ok('side_sai_trade');
        if (!flags.side_clerk && (/clerk|gentry|fallennoble/.test(origin) || /scribe|scholar|diviner/.test(career))) return ok('side_clerk_doc');
        if (!flags.side_clinic && (/tradoc|shaman/.test(origin) || /healer|herbalist/.test(career))) return ok('side_nightclinic');
        if (!flags.side_scale && (/merchant|guest/.test(origin) || career === 'merchant')) return ok('side_scale');
        if (!flags.side_school && (/gentry|clerk|fallennoble/.test(origin) || /scholar|scribe|diviner/.test(career))) return ok('side_school');
        return ok('xy_side');
      }
      return ok('ch1_hub');
    }
    if (intent === 'side' && inXy) return ok('xy_side');
    if (intent === 'side' && inVil) return ok('ch1_hub');

    if (intent === 'taiyi' || /太醫署/.test(t)) {
      if (inXy || flags.visited_xianyang) return ok('xy_taiyi');
      if (!flags.ch1_letter_done) return ok('ch1_letter');
      return ok('ch1_hub');
    }
    if (intent === 'xiangbang' || /相邦|呂府/.test(t)) {
      if (inXy || flags.visited_xianyang) return ok('xy_xiangbang');
    }
    if (intent === 'taihou' || /太后/.test(t)) {
      if (inXy || access.palace) return ok('xy_taihou');
    }
    if (intent === 'herb' || /採藥|上山/.test(t)) {
      if (!flags.ch1_herb_done && (inVil || ch === 'ch1')) return ok('ch1_herb');
    }
    if (intent === 'heal' || /跟診|藥廬|蘇娘/.test(t)) {
      if (!flags.ch1_med_done && (inVil || ch === 'ch1')) return ok('ch1_clinic');
      if (inXy && !flags.side_clinic) return ok('side_nightclinic');
      if (inXy) return ok('xy_taiyi');
    }
    if (intent === 'xianyang' || /赴咸陽|啟程|上路去咸陽/.test(t)) {
      if (flags.ch1_ready || flags.left_village) return ok('ch2_road');
      if (inVil) return ok('ch1_hub');
      if (inXy) return ok('xy_hub');
    }
    if (intent === 'meet' || intent === 'go') {
      if (/秦王|嬴政|少年王|近側/.test(t)) {
        if (access.palace || flags.near_side) return ok('xy_near_wait');
        if (inXy) return ok('xy_palace');
      }
      if (/蘇娘|藥廬/.test(t)) return (!flags.ch1_med_done && inVil) ? ok('ch1_clinic') : (inXy ? ok('side_nightclinic') : ok('ch1_clinic'));
      if (/林嫂/.test(t) && !flags.side_vil_grain) return ok('side_vil_grain');
      if (/何伯/.test(t)) return ok('ch1_hub');
      if (/賈人|馮/.test(t)) return inXy ? ok('side_scale') : ok('ch1_market');
      if (/成郎/.test(t)) return inXy ? ok('side_school') : ok('ch1_hub');
      if (/呂|相邦/.test(t)) return ok('xy_xiangbang');
    }
    if (intent === 'sneak' && (inXy || /宮/.test(t))) return access.palace ? ok('xy_palace_in') : ok('xy_palace_gate');
    return null;
  }

  /** NPC 具體行動（對白之外） */
  function planNpcAction(S, intent, npc, text) {
    var aff = (S.npcs && S.npcs[npc.id] && S.npcs[npc.id].aff) || 0;
    var cold = coldish(npc);
    var warm = !cold && aff >= 8;
    var act = { type: 'none', label: ACTION_LABEL.none, detail: '', npcId: npc.id, npcName: npc.name };

    if (intent === 'leave') {
      act = { type: 'leave', label: ACTION_LABEL.leave, detail: npc.name + '拱手退去。', npcId: npc.id, npcName: npc.name };
    } else if (intent === 'threat') {
      if (cold || /衛|軍|將|秦王/.test(npc.role || '')) {
        act = { type: 'attack', label: ACTION_LABEL.attack, detail: npc.name + '眼神一凜，按住刃柄——空氣陡峭。', npcId: npc.id, npcName: npc.name, hpDelta: -6 };
      } else {
        act = { type: 'leave', label: ACTION_LABEL.leave, detail: npc.name + '臉色一變，轉身離去。', npcId: npc.id, npcName: npc.name };
      }
    } else if (intent === 'gift') {
      if (warm || aff >= 12) {
        act = { type: 'gift', label: ACTION_LABEL.gift, detail: npc.name + '回贈一小物，以示不忘。', npcId: npc.id, npcName: npc.name, goldDelta: 2 };
      } else {
        act = { type: 'none', label: '收下', detail: npc.name + '收下你的心意，未立刻回贈。', npcId: npc.id, npcName: npc.name };
      }
    } else if (intent === 'bribe') {
      if ((S.gold || 0) >= 12 || (S.access && S.access.palace)) {
        if (/宮|門|衛|入宮/.test(text) || intent === 'palace' || npc.id === 'wu' || npc.id === 'neishi') {
          act = { type: 'open_gate', label: ACTION_LABEL.open_gate, detail: npc.name + '示意門道可通——門禁鬆了一線。', npcId: npc.id, npcName: npc.name };
        }
      }
    } else if (intent === 'palace') {
      if (S.access && S.access.palace) {
        act = { type: 'open_gate', label: ACTION_LABEL.open_gate, detail: '門禁已通。' + npc.name + '點頭，示意你可入。', npcId: npc.id, npcName: npc.name };
      } else if (/衛|門/.test(npc.role || '') || npc.id === 'wu' || npc.id === 'neishi') {
        act = { type: 'none', label: '攔阻', detail: npc.name + '横戈攔路：無符節，不得入。', npcId: npc.id, npcName: npc.name };
      }
    } else if (intent === 'join') {
      if (warm || aff >= 15 || !cold) {
        act = { type: 'follow', label: ACTION_LABEL.follow, detail: npc.name + '暫允同行／聽用一程。', npcId: npc.id, npcName: npc.name };
      } else {
        act = { type: 'invite', label: ACTION_LABEL.invite, detail: npc.name + '沉吟：「先辦一件實事，再談追隨。」', npcId: npc.id, npcName: npc.name };
      }
    } else if (intent === 'invite') {
      if (!cold || aff >= 10) {
        act = { type: 'follow', label: ACTION_LABEL.follow, detail: npc.name + '應邀，與你同行片刻。', npcId: npc.id, npcName: npc.name };
      }
    } else if (intent === 'schedule' || intent === 'confess') {
      act = { type: 'schedule_meet', label: ACTION_LABEL.schedule_meet, detail: npc.name + '與你約了改日再見。', npcId: npc.id, npcName: npc.name, meetDay: (S.day || 1) + 1, place: (global.QianStoryFlow && global.QianStoryFlow.getNode(S) && global.QianStoryFlow.getNode(S).bg) || 'village' };
    } else if (intent === 'flirt' && warm) {
      act = { type: 'invite', label: ACTION_LABEL.invite, detail: npc.name + '耳根微熱，暗示可再談。', npcId: npc.id, npcName: npc.name };
    } else if (intent === 'heal' && (npc.id === 'su' || npc.id === 'yiguan')) {
      act = { type: 'gift', label: '授藥', detail: npc.name + '塞你一包救急散。', npcId: npc.id, npcName: npc.name, bag: { herb: 1 } };
    } else if (intent === 'ask' && aff >= 5) {
      act = { type: 'none', label: '指點', detail: npc.name + '低聲指了一條可行的路。', npcId: npc.id, npcName: npc.name };
    }

    act.label = act.label || ACTION_LABEL[act.type] || act.type;
    return act;
  }

  function applyNpcAction(S, act) {
    if (!S || !act || !act.type || act.type === 'none') {
      if (act && act.detail) {
        if (!S.npcActs) S.npcActs = [];
        S.npcActs.push({ t: Date.now(), type: act.type || 'none', label: act.label, detail: act.detail, npcId: act.npcId, npcName: act.npcName, day: S.day || 1 });
        if (S.npcActs.length > 16) S.npcActs = S.npcActs.slice(-16);
      }
      return act;
    }
    var id = act.npcId;
    if (id) ensureNpc(S, id);
    if (!S.npcActs) S.npcActs = [];
    S.npcActs.push({ t: Date.now(), type: act.type, label: act.label, detail: act.detail, npcId: id, npcName: act.npcName, day: S.day || 1 });
    if (S.npcActs.length > 16) S.npcActs = S.npcActs.slice(-16);
    S.lastNpcAct = act;

    switch (act.type) {
      case 'leave':
        if (id) {
          S.npcs[id].away = true;
          S.npcs[id].awayUntil = (S.day || 1) + 1;
        }
        break;
      case 'gift':
        if (act.goldDelta) S.gold = Math.max(0, (S.gold || 0) + act.goldDelta);
        if (act.bag) {
          if (!S.bag) S.bag = {};
          Object.keys(act.bag).forEach(function (k) {
            S.bag[k] = Math.max(0, (S.bag[k] || 0) + act.bag[k]);
          });
        }
        break;
      case 'follow':
        if (!S.followers) S.followers = {};
        if (id) S.followers[id] = 1;
        if (id) S.npcs[id].following = true;
        break;
      case 'open_gate':
        if (!S.access) S.access = {};
        S.access.palace = true;
        if (!S.flags) S.flags = {};
        S.flags.visited_palace = 1;
        break;
      case 'attack':
        if (act.hpDelta) {
          var maxHp = S.maxHp != null ? S.maxHp : 80;
          S.hp = Math.max(1, Math.min(maxHp, (S.hp || maxHp) + act.hpDelta));
        }
        if (!S.plotFlags) S.plotFlags = {};
        S.plotFlags.free_attacked = 1;
        break;
      case 'invite':
        if (!S.flags) S.flags = {};
        if (!S.flags.invited_by) S.flags.invited_by = {};
        if (id) S.flags.invited_by[id] = 1;
        break;
      case 'schedule_meet':
        if (!S.pendingMeets) S.pendingMeets = [];
        S.pendingMeets.push({
          npcId: id,
          npcName: act.npcName,
          day: act.meetDay || ((S.day || 1) + 1),
          place: act.place || 'village',
          note: act.detail || '約期再見'
        });
        if (S.pendingMeets.length > 8) S.pendingMeets = S.pendingMeets.slice(-8);
        if (!S.plotFlags) S.plotFlags = {};
        S.plotFlags.free_meet_sched = (S.plotFlags.free_meet_sched || 0) + 1;
        break;
      default:
        break;
    }
    return act;
  }

  function offlineResolve(S, text, mode) {
    var ctx = buildContext(S, mode, text);
    var npc = castById(ctx.npcId) || { id: ctx.npcId, name: ctx.npcName, role: ctx.npcRole, lines: [] };
    var intent = classify(text, mode);
    var sets = {};
    var aff = {};
    var toast = null;
    var narration = '';
    var advance = null;
    var goldDelta = 0;
    var choiceId = null;
    var jumpTo = null;

    switch (intent) {
      case 'gift':
        aff[npc.id] = 3;
        sets['plotFlags.free_gift_' + npc.id] = 1;
        narration = '你奉上一點心意。' + npc.name + '神色微動。';
        toast = '好感＋';
        break;
      case 'bribe':
        if ((S.gold || 0) >= 12) {
          goldDelta = -12;
          aff[npc.id] = 2;
          sets['plotFlags.free_bribe'] = (S.plotFlags && S.plotFlags.free_bribe || 0) + 1;
          if (/palace|宮|門/.test(text) || (S.storyFlow && /palace/.test(S.storyFlow.nodeId || ''))) {
            sets['access.palace'] = true;
            sets['flags.visited_palace'] = 1;
            toast = '門路略通 · −12銀';
          } else toast = '−12銀 · 人情入袖';
          narration = '銀兩低調換手。空氣裡多了一分可以商量的縫。';
        } else {
          narration = '囊中羞澀，對方只淡淡看你一眼。';
          toast = '銀兩不足';
          aff[npc.id] = -1;
        }
        break;
      case 'threat':
        aff[npc.id] = -6;
        sets['plotFlags.free_threat'] = 1;
        if (global.QianStory && global.QianStory.bumpFeel) global.QianStory.bumpFeel(S, npc.id, 'fear', 4);
        narration = '語氣一冷，氣氛陡峭。';
        toast = '關係惡化';
        break;
      case 'flirt':
        aff[npc.id] = coldish(npc) ? -2 : 4;
        sets['plotFlags.free_flirt_' + npc.id] = 1;
        if (!coldish(npc)) sets['plotFlags.bond_' + npc.id] = 1;
        narration = coldish(npc) ? '你把話說得太近。對方目光如霜。' : '你把心意說薄了一層紙。對方耳根微熱。';
        toast = coldish(npc) ? '碰壁' : '情愫＋';
        break;
      case 'confess':
        aff[npc.id] = coldish(npc) ? -3 : 6;
        sets['plotFlags.confess_' + npc.id] = 1;
        if (!coldish(npc)) sets['plotFlags.bond_' + npc.id] = 1;
        narration = coldish(npc) ? '你把情意說盡。對方只回你一個「放肆」。' : '你把心意說破。空氣裡多了一縷未決的約。';
        toast = coldish(npc) ? '碰壁' : '表白落子';
        break;
      case 'palace':
        if (S.access && S.access.palace) {
          sets['flags.seek_palace'] = 1;
          narration = '你已有門禁痕跡，再往宮城一程，並非難事。';
          toast = '可再入宮';
        } else {
          sets['plotFlags.want_palace'] = 1;
          narration = '入宮之念浮上心頭——門禁仍在：收買、輕功、麻醉、或扮相。';
          toast = '尚缺門禁';
        }
        break;
      case 'sneak':
        sets['plotFlags.free_sneak'] = 1;
        if (global.QianStory && global.QianStory.bumpFeel) global.QianStory.bumpFeel(S, npc.id, 'suspicion', 5);
        narration = '你打量暗處與屋脊。有人似乎察覺你的腳步。';
        toast = '行跡可疑';
        aff[npc.id] = -1;
        break;
      case 'heal':
        aff[npc.id] = 2;
        sets['plotFlags.healer_seed'] = 1;
        sets['plotFlags.free_heal'] = 1;
        narration = '藥香與布帛之間，你做了一件救人的小事。';
        toast = '醫緣＋';
        break;
      case 'reveal':
        sets['plotFlags.disguise_talk'] = 1;
        if (global.QianStory && global.QianStory.bumpFeel) global.QianStory.bumpFeel(S, npc.id, 'suspicion', 8);
        narration = '你幾乎把裝束底細揭開。對方眼神深了幾分。';
        toast = '識破風險↑';
        break;
      case 'join':
        aff[npc.id] = 3;
        sets['plotFlags.offer_' + npc.id] = 1;
        if (npc.faction === 'qin') sets['factions.qin'] = (S.factions && S.factions.qin || 0) + 1;
        if (npc.faction === 'lu') sets['factions.lu'] = (S.factions && S.factions.lu || 0) + 1;
        narration = '你表明願意站到對方一邊。名分未定，意向已落子。';
        toast = '表態';
        break;
      case 'schedule':
        aff[npc.id] = 2;
        sets['plotFlags.free_sched'] = 1;
        narration = '你與對方約了改日之期。';
        toast = '約期';
        break;
      case 'invite':
        aff[npc.id] = 2;
        sets['plotFlags.free_invite'] = 1;
        narration = '你發出邀約。對方目光一動。';
        toast = '邀約';
        break;
      case 'side':
        sets['plotFlags.free_side_seek'] = 1;
        narration = '你把一樁支線小事說上心頭——路，就在眼前的選擇裡。';
        toast = '支線意向';
        break;
      case 'taiyi':
        sets['flags.seek_taiyi'] = 1;
        sets['plotFlags.healer_seed'] = 1;
        narration = '太醫署的門檻，在你心裡又近了一寸。';
        toast = '求見太醫署';
        break;
      case 'xiangbang':
        sets['flags.seek_xiangbang'] = 1;
        narration = '相邦府的門庭，似乎可以一試。';
        toast = '近相邦';
        break;
      case 'taihou':
        sets['plotFlags.taihou_rumor'] = 1;
        narration = '太后宮外的風聲，你記下三分。';
        break;
      case 'xianyang':
        sets['flags.aim_court'] = 1;
        narration = '咸陽在遠方發光。你開始盤算上路之事。';
        toast = '志在咸陽';
        break;
      case 'herb':
        sets['plotFlags.healer_seed'] = 1;
        narration = '你想往山徑採藥——葉脈與氣味，是入廷的一紙薄薦。';
        break;
      case 'meet':
        sets['plotFlags.free_meet'] = 1;
        narration = '你想尋見某人。腳步與選擇，會把你帶過去。';
        toast = '求見';
        break;
      case 'ask':
        aff[npc.id] = 1;
        sets['plotFlags.free_ask'] = (S.plotFlags && S.plotFlags.free_ask || 0) + 1;
        narration = '你把疑問拋出。風聲與人情，換來幾句半真半假。';
        break;
      case 'leave':
        narration = '你拱手告退。';
        break;
      case 'apologize':
        aff[npc.id] = 2;
        narration = '你放低身段。僵局鬆了一線。';
        break;
      case 'go':
        sets['plotFlags.free_go'] = 1;
        narration = '你依自己的主意邁步。天地很大，腳步聲很輕。';
        advance = 'period';
        break;
      case 'act':
        sets['plotFlags.free_act'] = (S.plotFlags && S.plotFlags.free_act || 0) + 1;
        aff[npc.id] = 1;
        narration = '你按自己的意思做了一件事。旁人看在眼裏。';
        break;
      default:
        aff[npc.id] = 1;
        sets['plotFlags.free_chat'] = (S.plotFlags && S.plotFlags.free_chat || 0) + 1;
        narration = '你把話說出。空氣微微一顫，又歸於平靜。';
    }

    /* 劇情推進：先匹配當前選項，否則建議跳轉 */
    choiceId = matchVisibleChoice(S, text, intent);
    if (!choiceId) jumpTo = suggestJump(S, text, intent);

    var reply = toneReply(npc, intent, S);
    var npcAction = planNpcAction(S, intent, npc, text);

    return {
      ok: true,
      offline: true,
      intent: intent,
      narration: narration,
      npcId: npc.id,
      npcName: npc.name,
      reply: reply,
      sets: sets,
      aff: aff,
      goldDelta: goldDelta,
      toast: toast,
      advance: advance,
      choiceId: choiceId,
      jumpTo: jumpTo,
      npcAction: npcAction
    };
  }

  function parseAiPayload(raw) {
    if (!raw) return null;
    var s = String(raw).trim();
    var m = s.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      var o = JSON.parse(m[0]);
      if (!o || typeof o !== 'object') return null;
      var act = null;
      if (o.npcAction && typeof o.npcAction === 'object') {
        var t = String(o.npcAction.type || o.npcAction.action || 'none');
        if (!ACTION_LABEL[t]) t = 'none';
        act = {
          type: t,
          label: String(o.npcAction.label || ACTION_LABEL[t] || t).slice(0, 24),
          detail: String(o.npcAction.detail || o.npcAction.text || '').slice(0, 120),
          npcId: o.npcAction.npcId || o.npcId || '',
          npcName: String(o.npcAction.npcName || o.npcName || '').slice(0, 24),
          goldDelta: typeof o.npcAction.goldDelta === 'number' ? o.npcAction.goldDelta : undefined,
          hpDelta: typeof o.npcAction.hpDelta === 'number' ? o.npcAction.hpDelta : undefined,
          meetDay: o.npcAction.meetDay,
          place: o.npcAction.place,
          bag: (o.npcAction.bag && typeof o.npcAction.bag === 'object') ? o.npcAction.bag : undefined
        };
      }
      var jump = o.jumpTo || o.jump || o.nodeId || null;
      if (jump && typeof jump === 'string') jump = jump.replace(/[^a-z0-9_]/gi, '');
      else jump = null;
      var choiceId = o.choiceId || o.pickChoice || null;
      if (choiceId) choiceId = String(choiceId).slice(0, 32);
      return {
        narration: String(o.narration || o.旁白 || '').slice(0, 220),
        npcId: o.npcId || o.npc || '',
        npcName: String(o.npcName || o.name || '').slice(0, 24),
        reply: String(o.reply || o.對白 || o.text || '').slice(0, 220),
        sets: (o.sets && typeof o.sets === 'object') ? o.sets : {},
        aff: (o.aff && typeof o.aff === 'object') ? o.aff : {},
        toast: o.toast ? String(o.toast).slice(0, 40) : null,
        advance: o.advance === 'period' || o.advance === 'day' ? o.advance : null,
        goldDelta: typeof o.goldDelta === 'number' ? o.goldDelta : 0,
        jumpTo: jump,
        choiceId: choiceId,
        npcAction: act,
        intent: o.intent ? String(o.intent).slice(0, 24) : null
      };
    } catch (e) {
      return null;
    }
  }

  function applySetPath(S, path, val) {
    if (!path) return;
    if (path.indexOf('aff:') === 0) {
      var id = path.slice(4);
      var st = ensureNpc(S, id);
      st.aff = Math.max(0, Math.min(100, (st.aff || 0) + (typeof val === 'number' ? val : 0)));
      st.known = true;
      return;
    }
    if (path.indexOf('factions.') === 0 && global.QianFactions) {
      global.QianFactions.bump(S, path.slice(10), typeof val === 'number' ? val : 1);
      return;
    }
    if (path === 'access.palace' || path === 'access.xiangbang' || path === 'access.ying' || path === 'access.guanshi') {
      if (!S.access) S.access = {};
      S.access[path.split('.')[1]] = !!val;
      return;
    }
    var segs = String(path).split('.');
    var cur = S;
    for (var i = 0; i < segs.length - 1; i++) {
      if (!cur[segs[i]] || typeof cur[segs[i]] !== 'object') cur[segs[i]] = {};
      cur = cur[segs[i]];
    }
    cur[segs[segs.length - 1]] = val;
  }

  function applyResult(S, r) {
    if (!S || !r) return r;
    if (!S.plotFlags) S.plotFlags = {};
    if (!S.flags) S.flags = {};
    if (r.sets) {
      Object.keys(r.sets).forEach(function (k) {
        if (/^plotFlags\.fate_/.test(k) || /endingKey|arcProg\..*\.ended/.test(k)) return;
        applySetPath(S, k, r.sets[k]);
      });
    }
    if (r.aff) {
      Object.keys(r.aff).forEach(function (id) {
        var st = ensureNpc(S, id);
        st.aff = Math.max(0, Math.min(100, (st.aff || 0) + (r.aff[id] | 0)));
        st.known = true;
        st.talked = (st.talked || 0) + 1;
        if (!st.mem) st.mem = [];
        st.mem.push('自由：' + String((r._playerText || '')).slice(0, 18));
        if (st.mem.length > 10) st.mem = st.mem.slice(-10);
      });
    }
    if (r.goldDelta) S.gold = Math.max(0, (S.gold || 0) + r.goldDelta);
    if (r.npcId) {
      var st2 = ensureNpc(S, r.npcId);
      st2.known = true;
      if (!r.aff || r.aff[r.npcId] == null) {
        st2.talked = (st2.talked || 0) + 1;
      }
    }
    if (r.npcAction) {
      if (!r.npcAction.npcId && r.npcId) r.npcAction.npcId = r.npcId;
      if (!r.npcAction.npcName && r.npcName) r.npcAction.npcName = r.npcName;
      applyNpcAction(S, r.npcAction);
    }
    S.plotFlags.free_actions = (S.plotFlags.free_actions || 0) + 1;
    return r;
  }

  /** 套用劇情推進：choiceId 優先，否則 jumpTo */
  function applyPlotAdvance(S, r) {
    if (!S || !r || !global.QianStoryFlow) return r;
    var Flow = global.QianStoryFlow;
    var plot = null;

    try {
    if (r.choiceId && Flow.applyChoice) {
      var cr = Flow.applyChoice(S, r.choiceId);
      if (cr && cr.ok) {
        plot = { via: 'choice', choiceId: r.choiceId, fromId: cr.fromId, nodeId: cr.node && cr.node.id, line: cr.line, speaker: cr.speaker, advance: cr.advance };
        if (cr.advance && !r.advance) r.advance = cr.advance;
        if (cr.toast && !r.toast) r.toast = cr.toast;
      }
    }
    if (!plot && r.jumpTo && Flow.jumpTo && nodeOk(r.jumpTo)) {
      /* 避免無意義跳到自己 */
      if (r.jumpTo !== curNodeId(S)) {
        var jr = Flow.jumpTo(S, r.jumpTo, { toast: r.toast });
        if (jr && jr.ok && jr.jumped) {
          plot = { via: 'jump', fromId: jr.fromId, nodeId: jr.nodeId, line: jr.line, speaker: jr.speaker };
        }
      }
    }
    } catch (eAdv) { plot = plot || null; }
    if (plot) {
      r.plotAdvance = plot;
      var who = plot.speaker ? ('（' + plot.speaker + '）') : '';
      var note = plot.via === 'choice'
        ? '劇情因你的言行推進至下一節' + who + '。'
        : '你的言行把腳步帶向「' + plot.nodeId + '」' + who + '。';
      r.narration = (r.narration ? (r.narration + ' ') : '') + note;
      if (!r.toast) r.toast = plot.via === 'choice' ? '劇情推進' : '轉场・' + plot.nodeId;
    }
    return r;
  }

  function resolveOffline(S, text, mode) {
    var r = offlineResolve(S, text, mode);
    r._playerText = text;
    applyResult(S, r);
    applyPlotAdvance(S, r);
    return r;
  }

  function resolve(S, text, mode) {
    text = String(text || '').trim();
    mode = mode === 'do' ? 'do' : 'say';
    if (!text) return Promise.resolve({ ok: false, toast: '請先輸入' });
    var ctx = buildContext(S, mode, text);
    var intentHint = classify(text, mode);
    var AI = global.QianAI;
    if (AI && AI.ready() && AI.freeAct) {
      return AI.freeAct(ctx).then(function (out) {
        var parsed = parseAiPayload(out.text);
        if (!parsed || !parsed.reply) {
          var fb = resolveOffline(S, text, mode);
          fb.aiFailed = true;
          fb.aiNote = 'AI 格式不佳，改用離線';
          return fb;
        }
        if (!parsed.npcId) parsed.npcId = ctx.npcId;
        if (!parsed.npcName) parsed.npcName = ctx.npcName;
        if (!parsed.narration) {
          parsed.narration = mode === 'do' ? '你依自己的主意行動。' : '你把話說出。';
        }
        if (!parsed.intent) parsed.intent = intentHint;
        /* AI 未給推進時，離線補上 choice／jump 建議（不重跑 aff） */
        if (!parsed.choiceId) parsed.choiceId = matchVisibleChoice(S, text, parsed.intent || intentHint);
        if (!parsed.jumpTo && !parsed.choiceId) parsed.jumpTo = suggestJump(S, text, parsed.intent || intentHint);
        if (!parsed.npcAction) {
          var npc = castById(parsed.npcId) || { id: parsed.npcId, name: parsed.npcName, role: '' };
          parsed.npcAction = planNpcAction(S, parsed.intent || intentHint, npc, text);
        }
        parsed.ok = true;
        parsed.offline = false;
        parsed._playerText = text;
        applyResult(S, parsed);
        applyPlotAdvance(S, parsed);
        return parsed;
      }).catch(function (e) {
        var fb = resolveOffline(S, text, mode);
        fb.aiFailed = true;
        fb.aiNote = (AI.errMsg && AI.errMsg(e)) || 'AI 失敗';
        return fb;
      });
    }
    return Promise.resolve(resolveOffline(S, text, mode));
  }

  global.QianFreeAct = {
    buildContext: buildContext,
    pickFocusNpc: pickFocusNpc,
    classify: classify,
    matchVisibleChoice: matchVisibleChoice,
    suggestJump: suggestJump,
    planNpcAction: planNpcAction,
    applyNpcAction: applyNpcAction,
    offlineResolve: offlineResolve,
    resolveOffline: resolveOffline,
    resolve: resolve,
    applyResult: applyResult,
    applyPlotAdvance: applyPlotAdvance,
    parseAiPayload: parseAiPayload,
    ACTION_LABEL: ACTION_LABEL
  };
})(typeof window !== 'undefined' ? window : globalThis);
