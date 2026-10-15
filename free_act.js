/* 墨夢莊周 · v42 自由行動（想說／想做）
 * AI 驅動 NPC 依性格反應；失敗時離線模板 + 旗標／好感更新。
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
    '路人': 'cheng'
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
      fateSummary: global.QianArcs && global.QianArcs.fateSummary ? global.QianArcs.fateSummary(S) : '',
      career: (S.career || '') + '',
      dayStr: global.QianWorld && global.QianWorld.dayLabel ? global.QianWorld.dayLabel(S.day || 1) : ('第' + (S.day || 1) + '日'),
      worldMode: S.worldMode === 'free' ? '高度自由' : '史實軌道',
      heroCtx: global.QianWorld && global.QianWorld.heroContext ? global.QianWorld.heroContext(S) : '',
      factionStance: global.QianFactions && global.QianFactions.stanceText ? global.QianFactions.stanceText(S) : '',
      palaceAccess: !!(S.access && S.access.palace),
      gold: S.gold || 0
    };
  }

  /** 離線意圖 → 模板反應（依 NPC 性格小調） */
  function classify(text, mode) {
    var t = String(text || '');
    if (/贈|送禮|獻|奉上|送你|送件/.test(t)) return 'gift';
    if (/賄|收買|塞銀|打點|買通/.test(t)) return 'bribe';
    if (/打|殺|威脅|恐嚇|拔刀|動手/.test(t)) return 'threat';
    if (/愛|喜歡|傾心|親近|溫存|昨夜|枕|吻|懷/.test(t)) return 'flirt';
    if (/入宮|進宮|宮門|宮城|覲見|求見王/.test(t)) return 'palace';
    if (/潛|偷|溜|翻牆|夜探|窺/.test(t)) return 'sneak';
    if (/醫|診|藥|敷|治傷|把脈/.test(t)) return 'heal';
    if (/身份|其實我是|女扮|男扮|卸裝|真面目/.test(t)) return 'reveal';
    if (/投靠|效命|追隨|願為|願隨|入府|入門/.test(t)) return 'join';
    if (/打聽|問|請問|何事|緣故|傳聞|風聲/.test(t)) return 'ask';
    if (/告辭|離開|走了|回去|失陪/.test(t)) return 'leave';
    if (/道歉|恕罪|抱歉|得罪/.test(t)) return 'apologize';
    if (mode === 'do' && /走|去|往|尋|找/.test(t)) return 'go';
    if (mode === 'do') return 'act';
    return 'chat';
  }

  function toneReply(npc, intent, S) {
    var role = (npc.role || '') + (npc.id || '');
    var base = (npc.lines && npc.lines[0]) || '……';
    var cold = /秦王|相邦|太后|客卿|軍候|將/.test(role) || /yingzheng|lubuwei|zhaoji|lisi|mengtian|wangjian/.test(npc.id);
    var warm = /藥婆|田戶|書生|里正/.test(role) || /su|lin|cheng|he/.test(npc.id);
    var map = {
      gift: cold ? '你的心意，寡人／本座收下了。別指望一次饋贈便換國事。' : (warm ? '有心了。這份情，我記在心裏。' : '物到情到。往後共事，也好說話。'),
      bribe: cold ? '銀兩可通小路，通不了人心。收了——但別以為買得了名分。' : '銀兩入袖。此事我替你通融一分，可別張揚。',
      threat: cold ? '刀已經出鞘了？退下。再進一步，你連姓名都不會留在冊上。' : '你嚇誰？里中不是江湖，收起這套。',
      flirt: cold ? '……放肆。再有半句，逐出廊外。' : (warm ? '你——這話太急。我……先記下，別逼我此刻應承。' : '風月與時局，別混一談。收一收。'),
      palace: '宮門如獄。無符節、無門路，空言入宮——只會惹衛士盯梢。',
      sneak: cold ? '禁地夜行，九死一生。你若被擒，莫說與我有舊。' : '翻牆不是兒戲。被看見，連累一村。',
      heal: /醫|藥|太醫/.test(role) || npc.id === 'su' || npc.id === 'yiguan'
        ? '把脈、辨色。你若誠心學，我教你三分火候。'
        : '我非醫者。傷了，去藥廬找蘇娘。',
      reveal: '裝束之事……我略有所疑。你若還想走這條路，就別把底細當酒話。',
      join: cold ? '願效命？先拿出能辦事的證據，再談名分。' : '你肯來幫襯，也好。先從眼前小事做起。',
      ask: base + '——你問的這樁，我知三分，說三分。',
      leave: '去罷。有事，再來。',
      apologize: warm ? '既然知錯，便罷。別把同樣的錯再犯一次。' : '知道了。下不為例。',
      go: '去吧。路在腳下，禍福自擔。',
      act: cold ? '你要做的事，我看在眼裏。成敗，以後再算。' : '你既要做，我便不攔。小心些。',
      chat: base
    };
    var line = map[intent] || base;
    /* 輕度代入名字，唔改意思 */
    if (npc.id === 'yingzheng') {
      if (intent === 'flirt') line = '……放肆。廊外風大，你退下。';
      if (intent === 'gift') line = '收下。別以為一次獻物，便能走近側。';
      if (intent === 'join') line = '效命？先把話說短，把事做實。';
      if (intent === 'ask') line = '邊野亦是秦土。你問的，寡人聽了——未必答。';
    }
    if (npc.id === 'su' && (intent === 'flirt' || intent === 'heal')) {
      line = intent === 'flirt' ? '藥香裡說這種話……我臉熱。你若真心，便用行動護一護這青廬。' : '伸手。讓我看傷口深淺。';
    }
    if (npc.id === 'lubuwei' && intent === 'join') {
      line = '奇貨可居，人才亦然。你若有用，相邦府不拒客——先報一件實事來。';
    }
    return line;
  }

  function offlineResolve(S, text, mode) {
    var ctx = buildContext(S, mode, text);
    var npc = castById(ctx.npcId) || { id: ctx.npcId, name: ctx.npcName, role: ctx.npcRole, lines: [] };
    var intent = classify(text, mode);
    var st = ensureNpc(S, npc.id);
    var sets = {};
    var aff = {};
    var toast = null;
    var narration = '';
    var advance = null;
    var goldDelta = 0;

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
          if (/palace|宮/.test(text) || (S.storyFlow && /palace/.test(S.storyFlow.nodeId || ''))) {
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

    var reply = toneReply(npc, intent, S);
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
      advance: advance
    };
  }

  function coldish(npc) {
    return /yingzheng|lubuwei|zhaoji|lisi|laoai|mengtian|wangjian|neishi/.test(npc.id);
  }

  function parseAiPayload(raw) {
    if (!raw) return null;
    var s = String(raw).trim();
    var m = s.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      var o = JSON.parse(m[0]);
      if (!o || typeof o !== 'object') return null;
      return {
        narration: String(o.narration || o.旁白 || '').slice(0, 220),
        npcId: o.npcId || o.npc || '',
        npcName: String(o.npcName || o.name || '').slice(0, 24),
        reply: String(o.reply || o.對白 || o.text || '').slice(0, 220),
        sets: (o.sets && typeof o.sets === 'object') ? o.sets : {},
        aff: (o.aff && typeof o.aff === 'object') ? o.aff : {},
        toast: o.toast ? String(o.toast).slice(0, 40) : null,
        advance: o.advance === 'period' || o.advance === 'day' ? o.advance : null,
        goldDelta: typeof o.goldDelta === 'number' ? o.goldDelta : 0
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
        /* 禁止自由行動直接鎖死結局鍵 */
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
    S.plotFlags.free_actions = (S.plotFlags.free_actions || 0) + 1;
    return r;
  }

  function resolveOffline(S, text, mode) {
    var r = offlineResolve(S, text, mode);
    r._playerText = text;
    applyResult(S, r);
    return r;
  }

  function resolve(S, text, mode) {
    text = String(text || '').trim();
    mode = mode === 'do' ? 'do' : 'say';
    if (!text) return Promise.resolve({ ok: false, toast: '請先輸入' });
    var ctx = buildContext(S, mode, text);
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
        parsed.ok = true;
        parsed.offline = false;
        parsed._playerText = text;
        applyResult(S, parsed);
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
    offlineResolve: offlineResolve,
    resolveOffline: resolveOffline,
    resolve: resolve,
    applyResult: applyResult,
    parseAiPayload: parseAiPayload
  };
})(typeof window !== 'undefined' ? window : globalThis);
