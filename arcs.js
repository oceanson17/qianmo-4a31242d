/* 墨夢莊周 · 秦人物靈感分支劇情（原創節點圖，非小說原文）
 * 契約：節點 line／choices{text,to,if,set,need}／end＋endingKey
 * 旗標寫入 S.plotFlags／S.flags／S.arcProg；結局由 checkEndings 讀取
 */
(function (global) {
  'use strict';

  /** 條件：讀 S 上路徑；支援 plotFlags.x / flags.x / arcProg.id.ended / factions.qin / day / joined / known:npc / access:gate / aff:npc */
  function readPath(S, path) {
    if (!S || !path) return undefined;
    if (path.indexOf('known:') === 0) {
      var kid = path.slice(6);
      return !!(S.npcs && S.npcs[kid] && S.npcs[kid].known);
    }
    if (path.indexOf('access:') === 0) {
      var aid = path.slice(7);
      return !!(S.access && S.access[aid]);
    }
    if (path.indexOf('aff:') === 0) {
      var nid = path.slice(4);
      return (S.npcs && S.npcs[nid] && S.npcs[nid].aff) || 0;
    }
    var parts = String(path).split('.');
    var cur = S;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function condOk(S, cond) {
    if (!cond) return true;
    if (typeof cond === 'function') {
      try { return !!cond(S); } catch (e) { return false; }
    }
    var keys = Object.keys(cond);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var want = cond[k];
      var got = readPath(S, k);
      if (typeof want === 'boolean') {
        if (!!got !== want) return false;
      } else if (typeof want === 'number') {
        if ((got || 0) < want) return false;
      } else if (want === null) {
        if (got != null && got !== false && got !== '') return false;
      } else {
        if (got !== want) return false;
      }
    }
    return true;
  }

  function attrsOf(S) {
    if (global.QianPlots && global.QianPlots.attrsOf) return global.QianPlots.attrsOf(S);
    return (S && S.attrs) || {};
  }
  function needOk(S, need) {
    if (!need) return true;
    if (global.QianPlots && global.QianPlots.needOk) return global.QianPlots.needOk(S, need);
    var a = attrsOf(S);
    return Object.keys(need).every(function (k) { return (a[k] || 0) >= need[k]; });
  }
  function needTip(S, need) {
    if (global.QianPlots && global.QianPlots.needTip) return global.QianPlots.needTip(S, need);
    return '';
  }

  function setPath(S, path, val) {
    if (!path) return;
    if (path.indexOf('aff:') === 0) {
      var id = path.slice(4);
      if (!S.npcs) S.npcs = {};
      if (!S.npcs[id]) S.npcs[id] = { aff: 0, mem: [], talked: 0, known: true };
      S.npcs[id].aff = Math.max(0, Math.min(100, (S.npcs[id].aff || 0) + (typeof val === 'number' ? val : 0)));
      S.npcs[id].known = true;
      return;
    }
    if (path.indexOf('feel:') === 0) {
      var parts = path.slice(5).split('.');
      var nid = parts[0], fk = parts[1] || 'respect';
      if (global.QianStory && global.QianStory.bumpFeel) {
        global.QianStory.bumpFeel(S, nid, fk, typeof val === 'number' ? val : 1);
      }
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

  function applySet(S, setObj) {
    if (!setObj) return;
    Object.keys(setObj).forEach(function (k) {
      setPath(S, k, setObj[k]);
    });
  }

  function applyRewards(S, rew) {
    if (!rew) return;
    if (rew.gold) S.gold = (S.gold || 0) + rew.gold;
    if (rew.food) S.food = (S.food || 0) + rew.food;
    if (rew.fame && global.QianFactions) global.QianFactions.bump(S, 'fame', rew.fame);
    else if (rew.fame) { S.fameBonus = (S.fameBonus || 0) + rew.fame; S.fame = (S.fame || 0) + rew.fame; }
    if (rew.people && global.QianFactions) global.QianFactions.bump(S, 'people', rew.people);
    else if (rew.people) S.people = (S.people || 0) + rew.people;
    if (rew.faction) {
      Object.keys(rew.faction).forEach(function (f) {
        if (global.QianFactions) global.QianFactions.bump(S, f, rew.faction[f]);
        else if (S.factions) S.factions[f] = (S.factions[f] || 0) + rew.faction[f];
      });
    }
    if (rew.attrs) {
      if (!S.attrs) S.attrs = { wu: 0, hu: 0, shen: 0, zhi: 0, bian: 0, yun: 0 };
      Object.keys(rew.attrs).forEach(function (k) {
        S.attrs[k] = Math.max(0, (S.attrs[k] || 0) + rew.attrs[k]);
      });
    }
    if (rew.bag) {
      S.bag = S.bag || {};
      Object.keys(rew.bag).forEach(function (k) {
        S.bag[k] = (S.bag[k] || 0) + rew.bag[k];
      });
    }
    if (rew.item && global.QianEquip) {
      var g = global.QianEquip.spawn(rew.item, (S.gearSeq = (S.gearSeq || 1) + 1), rew.itemRarity || 'liang');
      if (g) {
        if (!S.gear) S.gear = [];
        S.gear.push(g);
      }
    }
    if (rew.diverge) {
      if (global.QianWorld && global.QianWorld.markDiverged) {
        global.QianWorld.markDiverged(S, rew.diverge.id, rew.diverge.note);
      } else if (global.QianWorld && global.QianWorld.markDiverge) {
        global.QianWorld.markDiverge(S, rew.diverge.id, rew.diverge.note);
      } else {
        if (!S.diverged) S.diverged = [];
        S.diverged.push({ id: rew.diverge.id, note: rew.diverge.note, day: S.day });
        if (!S.histFlags) S.histFlags = {};
        S.histFlags[rew.diverge.id] = 'changed';
      }
    }
    if (rew.aff) {
      Object.keys(rew.aff).forEach(function (id) {
        setPath(S, 'aff:' + id, rew.aff[id]);
      });
    }
  }

  function ensure(S) {
    if (!S) return S;
    if (!S.plotFlags) S.plotFlags = {};
    if (!S.flags) S.flags = {};
    if (!S.arcProg) S.arcProg = {};
    if (!S.seenEvents) S.seenEvents = {};
    if (!S.endings) S.endings = [];
    return S;
  }

  /**
   * 五條原創弧（靈感：嬴政／呂不韋／趙姬／李斯／蒙恬 人物張力，非小說情節複製）
   * 每弧 ≥2 結局；選擇寫真旗標，供 AI／編年／結局冊讀取
   */
  var ARCS = [
    {
      id: 'arc_ying',
      title: '少年秦王·夜問邊野',
      npc: 'yingzheng',
      face: 'scholar',
      faction: 'qin',
      startIf: { day: 10, 'known:yingzheng': true, 'arcProg.arc_ying.ended': null },
      altStartIf: { day: 8, 'plotFlags.court_healer': true, 'arcProg.arc_ying.ended': null },
      altStartIf2: { day: 14, 'access:palace': true, 'arcProg.arc_ying.ended': null },
      nodes: {
        start: {
          line: '宮牆外燈火稀疏。少年秦王並未升座，只立於影中問你：「邊野編戶，可曾厭官府？仲父總事——鄉里怎麼說寡人？」\n（你的回答，或成日後王心裡的一枚釘。）',
          choices: [
            { id: 'y_honest', text: '實言：民畏賦役，亦畏私門', to: 'counsel', set: { 'plotFlags.ying_heard_folk': 1 }, need: { bian: 3 } },
            { id: 'y_flatter', text: '稱頌王德、淡化私門', to: 'flatter_path', set: { 'plotFlags.ying_flattered': 1 } },
            { id: 'y_guard', text: '謹慎不答，只言耕織', to: 'cold_seed' },
            { id: 'y_probe', text: '反問王欲親政否', to: 'counsel', set: { 'plotFlags.ying_probe': 1 }, need: { zhi: 5 } },
            { id: 'y_pulse', text: '以診脈分寸進言（近側醫）', to: 'near_ask', set: { 'plotFlags.ying_pulse': 1 },
              if: { 'plotFlags.court_healer': true } }
          ]
        },
        counsel: {
          line: '王沉默片刻：「若有一日，寡人要收回印璽……君願為耳目，還是為牆？」',
          choices: [
            { id: 'y_ear', text: '願為耳目，通邊野實情', to: 'end_confidant', set: { 'plotFlags.ying_ear': 1 } },
            { id: 'y_wall', text: '願為牆，擋私門風雨', to: 'end_shield', need: { hu: 4 } },
            { id: 'y_both', text: '智計兩全：耳目有限、牆亦有門', to: 'end_confidant', need: { zhi: 6 }, set: { 'plotFlags.ying_balanced': 1 } },
            { id: 'y_refuse', text: '田畝之人，不敢預朝爭', to: 'end_wary' },
            { id: 'y_near', text: '若王許近側藥囊……', to: 'near_ask', set: { 'plotFlags.ying_near_ask': 1 },
              if: { 'plotFlags.court_healer': true } }
          ]
        },
        flatter_path: {
          line: '王淡淡一笑，卻未喜：「諛詞，寡人聽得多了。去罷。」侍從目送你退——此夜之後，宮門或更難叩。',
          choices: [
            { id: 'y_f_leave', text: '告退', to: 'end_wary' },
            { id: 'y_f_fix', text: '補上一句真話挽回', to: 'counsel', need: { bian: 6 }, set: { 'plotFlags.ying_redeem': 1 } }
          ]
        },
        cold_seed: {
          line: '王點頭：「耕織也好。」語氣已遠。你離開時，聽見他對內侍低語：「再觀之。」',
          choices: [
            { id: 'y_c_ok', text: '就此退場', to: 'end_wary' },
            { id: 'y_c_letter', text: '翌日投書陳民間疾苦', to: 'end_confidant', need: { bian: 4 }, set: { 'flags.qin_letter': 1 } }
          ]
        },
        end_confidant: {
          end: true,
          endingKey: 'ying_confidant',
          fate: { 'plotFlags.fate_ying': 'confidant' },
          line: '自此，王府偶有密使問邊野糧價與私門貨影。少年王記住了你的名字——史冊或將多一筆「野士通王」。',
          toast: '秦王線·心腹',
          rewards: {
            gold: 45, fame: 6, faction: { qin: 14, lu: -4 },
            attrs: { bian: 1 }, aff: { yingzheng: 18 },
            diverge: { id: 'ying_fate', note: '少年秦王以邊野之士為耳目，親政之心漸堅' }
          }
        },
        end_shield: {
          end: true,
          endingKey: 'ying_shield',
          fate: { 'plotFlags.fate_ying': 'shield' },
          line: '王賜一小印：「擋得住風雨時，再來見寡人。」你成了王府外圍的一堵矮牆——不高，卻有用。',
          toast: '秦王線·外牆',
          rewards: {
            gold: 35, fame: 5, faction: { qin: 12 },
            attrs: { hu: 1 }, aff: { yingzheng: 12 },
            item: 'yu_pei',
            diverge: { id: 'ying_fate', note: '王府外牆得人，私門勢稍斂於耳目' }
          }
        },
        end_wary: {
          end: true,
          endingKey: 'ying_wary',
          fate: { 'plotFlags.fate_ying': 'wary' },
          line: '宮門在身後合上。少年王未必恨你，只是不再問。有些命運，因沉默而岔開。',
          toast: '秦王線·疏遠',
          rewards: {
            fame: 1, faction: { qin: -2 },
            aff: { yingzheng: -4 },
            diverge: { id: 'ying_fate', note: '王與邊野之士緣淺，耳目另擇他人' }
          }
        },
        /* v37：近側／伴側／敬畏／改史 —— 原創，非小說情節 */
        near_ask: {
          line: '又一個深夜，王忽然問：「若寡人要你常侍藥囊於側——非寵，是用。你敢否？」燈影顫了一下。',
          choices: [
            { id: 'y_comp', text: '願伴側，守分寸', to: 'end_companion', set: { 'plotFlags.ying_companion': 1 } },
            { id: 'y_awe', text: '不敢近褻，只願遠承王命', to: 'end_awe', set: { 'plotFlags.ying_awe': 1 } },
            { id: 'y_alter', text: '勸王先改一樁苛斂，再談近側', to: 'alter_seed', need: { bian: 5 }, set: { 'plotFlags.ying_alter_ask': 1 } },
            { id: 'y_back', text: '仍願為耳目／外牆，不入近側', to: 'counsel' }
          ]
        },
        alter_seed: {
          line: '王沉默良久：「改史……從一樁賦役起？」他目光如刃，「你敢署名，寡人便敢試。成，你進近側；敗，你先承擔。」',
          choices: [
            { id: 'y_al_yes', text: '署名承擔', to: 'end_alter', set: { 'plotFlags.ying_alter': 1 } },
            { id: 'y_al_no', text: '退一步，只求伴側不涉政', to: 'end_companion', set: { 'plotFlags.ying_companion': 1 } },
            { id: 'y_al_flee', text: '膽怯告退', to: 'end_wary' }
          ]
        },
        end_companion: {
          end: true,
          endingKey: 'ying_companion',
          fate: { 'plotFlags.fate_ying': 'companion' },
          line: '自此你常以藥囊侍於廊側。王不多言溫軟，卻在召見之間，把「你」二字說得極準。伴側非佳話——是一根細而韌的線。',
          toast: '秦王線·伴側',
          rewards: {
            gold: 50, fame: 8, faction: { qin: 16, lu: -6 },
            attrs: { bian: 1 }, aff: { yingzheng: 22 },
            diverge: { id: 'ying_fate', note: '近側醫士常侍，王府私語多一雙耳目與一味藥' }
          }
        },
        end_awe: {
          end: true,
          endingKey: 'ying_awe',
          fate: { 'plotFlags.fate_ying': 'awe' },
          line: '王點頭：「遠承也好。」他賜你一枚無字小印——不必近，卻須在。敬畏長於溫存，亦是一種緣。',
          toast: '秦王線·疏離敬畏',
          rewards: {
            gold: 30, fame: 5, faction: { qin: 10 },
            aff: { yingzheng: 10 },
            diverge: { id: 'ying_fate', note: '王與近側保持距離，敬多於親' }
          }
        },
        end_alter: {
          end: true,
          endingKey: 'ying_alter',
          fate: { 'plotFlags.fate_ying': 'alter', 'flags.history_nudge': 1 },
          line: '一紙緩賦令自王府出。史冊軌道微微一顫——也許不足改寫百年，卻夠改寫你與他的距離。你倖存於署名之後，近側之門半開。',
          toast: '秦王線·改史倖存',
          rewards: {
            gold: 40, fame: 10, people: 6, faction: { qin: 12, lu: -8 },
            attrs: { zhi: 1, bian: 1 }, aff: { yingzheng: 16 },
            diverge: { id: 'ying_fate', note: '緩賦一令改寫局部軌道，近側醫士之名入王冊' }
          }
        }
      }
    },
    {
      id: 'arc_lu',
      title: '相邦呂氏·奇貨之外',
      npc: 'lubuwei',
      face: 'merchant',
      faction: 'lu',
      startIf: { day: 10, 'known:lubuwei': true, 'arcProg.arc_lu.ended': null },
      altStartIf: { day: 12, 'access:xiangbang': true, 'arcProg.arc_lu.ended': null },
      nodes: {
        start: {
          line: '相邦府廊下，呂不韋把玩一枚舊錢：「奇貨可居——人亦然。君自邊野來，可願做一筆『長線』？」\n門客側目，似在秤你的分量。',
          choices: [
            { id: 'l_talent', text: '願以才具相報，非僅貨殖', to: 'talent', need: { zhi: 4 } },
            { id: 'l_trade', text: '願通商路、辦貨單', to: 'trade_path' },
            { id: 'l_refuse', text: '只求安耕，不入府網', to: 'end_distant' },
            { id: 'l_warn', text: '提醒：王年漸長，奇貨或變', to: 'warn_path', need: { bian: 5 } }
          ]
        },
        talent: {
          line: '呂不韋大笑：「好。才具比絹帛耐存。」他壓低聲音：「若有日王府要清門客——君站哪邊？」',
          choices: [
            { id: 'l_stand_lu', text: '站相邦，護府脈', to: 'end_patron' },
            { id: 'l_stand_mid', text: '站中道，兩邊留線', to: 'end_broker', need: { zhi: 6 } },
            { id: 'l_stand_qin', text: '暗示可通王府', to: 'end_double', need: { bian: 6 } }
          ]
        },
        trade_path: {
          line: '一紙貨單落入你手：關中絲、邊市皮、河津糧。辦得成，府中記名；辦不成，也只是少一枚棋子。',
          choices: [
            { id: 'l_do', text: '接下貨單', to: 'end_merchant' },
            { id: 'l_ask_more', text: '要求分潤與護照', to: 'end_merchant', need: { bian: 4 }, set: { 'plotFlags.lu_better_deal': 1 } },
            { id: 'l_back', text: '退回，另謀', to: 'end_distant' }
          ]
        },
        warn_path: {
          line: '相邦眼神一凜，隨即恢復笑意：「君倒敢言。記住這句話的人，將來或活得久些——或死得快些。」',
          choices: [
            { id: 'l_w_ally', text: '願助其佈退路', to: 'end_patron', set: { 'plotFlags.lu_exit_plan': 1 } },
            { id: 'l_w_leave', text: '言盡於此，告退', to: 'end_distant' },
            { id: 'l_w_sell', text: '暗中把警告賣給王府線', to: 'end_double', need: { shen: 4 }, set: { 'plotFlags.lu_leak': 1 } }
          ]
        },
        end_patron: {
          end: true,
          endingKey: 'lu_patron',
          fate: { 'plotFlags.fate_lu': 'patron' },
          line: '呂不韋親為你斟酒：「門下又多一人。」日後圍捕之夜，或有人記得今夜之諾——命運已與呂氏綁緊。',
          toast: '呂氏線·門客',
          rewards: {
            gold: 70, fame: 5, faction: { lu: 18, qin: -6 },
            aff: { lubuwei: 20, menke: 8 },
            bag: { flower: 2 },
            diverge: { id: 'lu_bond', note: '玩家成為呂氏長線門客，相邦府多一條活路' }
          }
        },
        end_merchant: {
          end: true,
          endingKey: 'lu_merchant',
          fate: { 'plotFlags.fate_lu': 'merchant' },
          line: '貨路一開，銀兩與情報同流。你未必稱門客，卻已是呂網上一結——可富，亦可被剪。',
          toast: '呂氏線·商脈',
          rewards: {
            gold: 90, fame: 4, faction: { lu: 12, sai: 3 },
            aff: { lubuwei: 10, guren: 8 },
            diverge: { id: 'lu_bond', note: '呂氏商網多一邊野節點' }
          }
        },
        end_broker: {
          end: true,
          endingKey: 'lu_broker',
          fate: { 'plotFlags.fate_lu': 'broker' },
          line: '你兩邊留線。相邦知而不怒，只道：「中道之人，雨來時最難站。」——此乃險棋，亦是活棋。',
          toast: '呂氏線·雙線',
          rewards: {
            gold: 50, fame: 6, faction: { lu: 8, qin: 6 },
            attrs: { zhi: 1 }, aff: { lubuwei: 8, yingzheng: 4 },
            diverge: { id: 'lu_bond', note: '雙線仲介使呂／王情報同時流動' }
          }
        },
        end_double: {
          end: true,
          endingKey: 'lu_leak',
          fate: { 'plotFlags.fate_lu': 'leaked', 'plotFlags.lu_betrayed': true },
          line: '密語如刃。王府記你一功，呂門客眼中刀光更亮。奇貨易居，人心難居。',
          toast: '呂氏線·賣線',
          rewards: {
            gold: 110, fame: 3, faction: { qin: 16, lu: -22 },
            aff: { lubuwei: -25, yingzheng: 10 },
            diverge: { id: 'lu_bond', note: '相邦府佈局被泄，圍捕之夜或更早到來' }
          }
        },
        end_distant: {
          end: true,
          endingKey: 'lu_distant',
          fate: { 'plotFlags.fate_lu': 'distant' },
          line: '呂不韋揮袖：「安耕也好。天下少一個門客，多一個納稅之人。」你走出府門，奇貨故事與你無緣——暫且。',
          toast: '呂氏線·緣淺',
          rewards: {
            fame: 1, faction: { lu: -3 },
            aff: { lubuwei: -2 },
            people: 2
          }
        }
      }
    },
    {
      id: 'arc_zhaoji',
      title: '宮闈·太后眉目',
      npc: 'zhaoji',
      face: 'farmer_f',
      faction: 'lu',
      startIf: { day: 22, 'flags.visited_taihou': 1, 'arcProg.arc_zhaoji.ended': null },
      altStartIf: { day: 25, 'known:zhaoji': true, 'arcProg.arc_zhaoji.ended': null },
      nodes: {
        start: {
          line: '太后宮外柳絲垂地。趙姬並未正面看你，只道：「政兒尚幼。宮外有人養士、有人傳謠——君來，是為他，還是為別的什麼？」\n私門甲影在牆角一閃。',
          choices: [
            { id: 'z_son', text: '為王平安而來', to: 'mother', set: { 'plotFlags.zhaoji_son_first': 1 } },
            { id: 'z_court', text: '為探宮爭風向', to: 'intrigue', need: { zhi: 4 } },
            { id: 'z_gift', text: '獻花藥，求安居', to: 'soft', set: { 'plotFlags.zhaoji_gift': 1 } },
            { id: 'z_threat', text: '直言私門養士可危社稷', to: 'clash', need: { bian: 6 } }
          ]
        },
        mother: {
          line: '太后眸光柔一瞬：「若真心為他……可願擋住那些想借太后之名生事的人？」',
          choices: [
            { id: 'z_m_shield', text: '願暗中護宮、抑私門', to: 'end_shield' },
            { id: 'z_m_king', text: '應先告王，勿使母子離心', to: 'end_warn', need: { bian: 5 } },
            { id: 'z_m_out', text: '民力有限，只能遠觀', to: 'end_neutral' }
          ]
        },
        intrigue: {
          line: '她輕笑：「打聽的人，近來真多。」一角倖臣氣息逼近——你必須表態。',
          choices: [
            { id: 'z_i_post', text: '站太后側，換情報', to: 'end_shield', set: { 'plotFlags.zhaoji_spy': 1 } },
            { id: 'z_i_qin', text: '把宮爭賣給王府', to: 'end_warn', set: { 'flags.taihou_spy': 1 } },
            { id: 'z_i_flee', text: '抽身離宮', to: 'end_neutral' }
          ]
        },
        soft: {
          line: '花藥被收下。太后道：「柔順的人，宮裡不缺。若只想安居，便莫再靠近深門。」',
          choices: [
            { id: 'z_s_ok', text: '受教告退', to: 'end_neutral' },
            { id: 'z_s_deeper', text: '再進一言：民心可作后盾', to: 'mother', if: { people: 20 } }
          ]
        },
        clash: {
          line: '殿中氣溫驟降。趙姬緩緩道：「危言——有時是忠，有時是刀。你持的是哪一把？」',
          choices: [
            { id: 'z_c_loyal', text: '忠於社稷與王', to: 'end_warn' },
            { id: 'z_c_soft', text: '收回鋒芒，改為勸和', to: 'end_shield', need: { bian: 7 } },
            { id: 'z_c_out', text: '謝罪退出', to: 'end_neutral' }
          ]
        },
        end_shield: {
          end: true,
          endingKey: 'zhaoji_shield',
          fate: { 'plotFlags.fate_zhaoji': 'shield' },
          line: '太后記你一功。私門氣焰未消，卻多了一道「外臣勸斂」的軟繩——宮事變數，已與你有關。',
          toast: '太后線·護宮',
          rewards: {
            gold: 40, fame: 4, faction: { lu: 10, qin: 2 },
            aff: { zhaoji: 16 }, people: 3,
            bag: { herb: 2, flower: 1 },
            diverge: { id: 'zhaoji_fate', note: '太后得外援勸斂私門，宮爭轉入暗流' }
          }
        },
        end_warn: {
          end: true,
          endingKey: 'zhaoji_warn',
          fate: { 'plotFlags.fate_zhaoji': 'warn_king', 'flags.taihou_spy': 1 },
          line: '你把宮牆內的影告到王府耳中。母子之間多了一層薄霜——史或因此少一場血，或多一段恨。',
          toast: '太后線·告王',
          rewards: {
            gold: 55, fame: 5, faction: { qin: 14, lu: -10 },
            aff: { zhaoji: -12, yingzheng: 10 },
            attrs: { zhi: 1 },
            diverge: { id: 'zhaoji_fate', note: '王早知后黨暗湧，先手或落在王府' }
          }
        },
        end_neutral: {
          end: true,
          endingKey: 'zhaoji_neutral',
          fate: { 'plotFlags.fate_zhaoji': 'neutral' },
          line: '宮門深似海。你退回阡陌，只當今夜是一場夢。然夢亦會在日後潮聲裡醒來。',
          toast: '太后線·抽身',
          rewards: {
            fame: 1, people: 2,
            aff: { zhaoji: 2 }
          }
        }
      }
    },
    {
      id: 'arc_lisi',
      title: '客卿李斯·法術勢',
      npc: 'lisi',
      face: 'scholar',
      faction: 'qin',
      startIf: { day: 24, 'known:lisi': true, 'arcProg.arc_lisi.ended': null },
      altStartIf: { day: 28, 'flags.visited_keguan': 1, 'arcProg.arc_lisi.ended': null },
      nodes: {
        start: {
          line: '客館燈下，李斯展一卷殘簡：「法、術、勢。私門不除，王權難張——君在邊野，寧願田畝有主，還是王令如山？」',
          choices: [
            { id: 'ls_law', text: '附議：強法以安農戰', to: 'legal', set: { 'plotFlags.lisi_law_side': 1 } },
            { id: 'ls_limit', text: '主張：限私門而不絕商農', to: 'balance', need: { zhi: 5 } },
            { id: 'ls_lu', text: '私門亦有養士之功', to: 'oppose', need: { bian: 5 } },
            { id: 'ls_quiet', text: '只聽不辯', to: 'end_observer' }
          ]
        },
        legal: {
          line: '李斯點頭：「君可為王府外宣之舌。若遇呂黨貨網……可敢斷其一指？」',
          choices: [
            { id: 'ls_cut', text: '敢。以法斷私網', to: 'end_legalist' },
            { id: 'ls_slow', text: '宜緩進，先實倉廩', to: 'end_restrain', need: { zhi: 4 } },
            { id: 'ls_back', text: '舌可借，刀不借', to: 'end_restrain' }
          ]
        },
        balance: {
          line: '「調和？」李斯冷笑又止，「調和常成兩面不討好。君可願承擔？」',
          choices: [
            { id: 'ls_b_yes', text: '願承擔，寫〈農戰與私門〉短策', to: 'end_restrain', set: { 'plotFlags.lisi_essay': 1 } },
            { id: 'ls_b_law', text: '再思之後，仍偏強法', to: 'end_legalist' },
            { id: 'ls_b_no', text: '不敢承此名', to: 'end_observer' }
          ]
        },
        oppose: {
          line: '李斯收卷：「既如此，他日廷爭，恐為對手。」空氣裡有刀紙之聲。',
          choices: [
            { id: 'ls_o_soft', text: '補一句：農戰仍為先', to: 'end_restrain', need: { bian: 6 } },
            { id: 'ls_o_stand', text: '堅持私門有限之益', to: 'end_oppose' },
            { id: 'ls_o_exit', text: '告退', to: 'end_observer' }
          ]
        },
        end_legalist: {
          end: true,
          endingKey: 'lisi_legalist',
          fate: { 'plotFlags.fate_lisi': 'legalist' },
          line: '李斯記名於簡：「可與謀。」王權之鼓動，多了一個邊野回聲——呂黨門下，將更不安。',
          toast: '李斯線·強法',
          rewards: {
            gold: 40, fame: 6, faction: { qin: 16, lu: -12 },
            attrs: { bian: 1 }, aff: { lisi: 18 },
            diverge: { id: 'lisi_fate', note: '客卿得外援宣法，弱私門之議提前傳開' }
          }
        },
        end_restrain: {
          end: true,
          endingKey: 'lisi_restrain',
          fate: { 'plotFlags.fate_lisi': 'restrain' },
          line: '你的「限而不絕」流入客卿與相邦之間的縫。兩造皆未全怒——這縫，便是你的活路。',
          toast: '李斯線·節制',
          rewards: {
            gold: 35, fame: 5, faction: { qin: 8, lu: 4 },
            attrs: { zhi: 1 }, aff: { lisi: 10, lubuwei: 4 },
            diverge: { id: 'lisi_fate', note: '法術勢之爭出現折中聲，廷議氣氛稍緩' }
          }
        },
        end_oppose: {
          end: true,
          endingKey: 'lisi_oppose',
          fate: { 'plotFlags.fate_lisi': 'oppose' },
          line: '李斯拱手如冰：「他日堂上見。」你為私門爭得片刻聲——亦在王府冊上記下一筆。',
          toast: '李斯線·對立',
          rewards: {
            gold: 20, fame: 3, faction: { lu: 12, qin: -10 },
            aff: { lisi: -14, lubuwei: 10 },
            diverge: { id: 'lisi_fate', note: '客卿視玩家為廷爭對手' }
          }
        },
        end_observer: {
          end: true,
          endingKey: 'lisi_observer',
          fate: { 'plotFlags.fate_lisi': 'observer' },
          line: '你未落子。李斯也不強留：「觀棋者，有時比落子者活得久。」',
          toast: '李斯線·旁觀',
          rewards: { fame: 1, aff: { lisi: 2 } }
        }
      }
    },
    {
      id: 'arc_meng',
      title: '邊將蒙恬·塞上約',
      npc: 'mengtian',
      face: 'soldier',
      faction: 'qin',
      startIf: { day: 16, 'known:mengtian': true, 'arcProg.arc_meng.ended': null },
      altStartIf: { day: 20, 'flags.visited_frontier': 1, 'arcProg.arc_meng.ended': null },
      nodes: {
        start: {
          line: '邊風割面。少年軍候蒙恬按劍：「胡騎窺關，軍中缺糧缺藥。你從關內來——是送貨的，還是送命的？」\n營外有遊俠氣息一閃（荊姓輕俠曾過此）。',
          choices: [
            { id: 'm_supply', text: '願籌糧藥，做後勤', to: 'supply' },
            { id: 'm_fight', text: '願隨巡，較刀鋒', to: 'fight', need: { wu: 5 } },
            { id: 'm_plan', text: '獻設伏／烽火之策', to: 'plan', need: { zhi: 5 } },
            { id: 'm_peace', text: '勸互市緩兵', to: 'trade', need: { bian: 4 } }
          ]
        },
        supply: {
          line: '蒙恬鬆肩：「糧藥比口号有用。」他記你一筆軍功簿外的名——塞上人情，往往比朝議真。',
          choices: [
            { id: 'm_s_more', text: '約定長期供輸', to: 'end_comrade', set: { 'plotFlags.meng_supply': 1 } },
            { id: 'm_s_once', text: '只助這一遭', to: 'end_supply' },
            { id: 'm_s_sai', text: '順便為邊市盟留線', to: 'end_broker_border', need: { bian: 5 } }
          ]
        },
        fight: {
          line: '校場塵起。你與蒙恬拆了三招——他認臂力，亦認膽色：「他日夜襲，可呼你。」',
          choices: [
            { id: 'm_f_oath', text: '與之約：同守一關', to: 'end_comrade' },
            { id: 'm_f_honor', text: '受刀穗之贈，各回本職', to: 'end_supply', set: { 'plotFlags.meng_token': 1 } },
            { id: 'm_f_leave', text: '刀利不如歸田', to: 'end_retreat' }
          ]
        },
        plan: {
          line: '沙盤上，蒙恬按你的烽火點：「智者不必親刃。此策若成，胡騎少踏一程。」',
          choices: [
            { id: 'm_p_go', text: '定策，列入巡規', to: 'end_comrade', set: { 'plotFlags.meng_plan': 1 } },
            { id: 'm_p_share', text: '要求關市開一縫作酬', to: 'end_broker_border', need: { bian: 4 } }
          ]
        },
        trade: {
          line: '蒙恬皺眉：「互市養敵？」又頓，「……若真能少流血，軍候亦可聽。」邊市盟與王府之間，又多一根繩。',
          choices: [
            { id: 'm_t_deal', text: '促成有限互市', to: 'end_broker_border' },
            { id: 'm_t_back', text: '改口：仍以守備為先', to: 'end_supply' }
          ]
        },
        end_comrade: {
          end: true,
          endingKey: 'meng_comrade',
          fate: { 'plotFlags.fate_meng': 'comrade' },
          line: '塞上多一個名字在軍候冊外。蒙恬視你為可託之人——邊關命運，與關內阡陌從此牽線。',
          toast: '蒙恬線·袍澤',
          rewards: {
            gold: 50, fame: 6, faction: { qin: 12, sai: 4 },
            attrs: { wu: 1 }, aff: { mengtian: 20, wangjian: 4 },
            item: 'bian_jun_kai',
            diverge: { id: 'meng_fate', note: '邊軍得多一路糧藥與智策，北境稍穩' }
          }
        },
        end_supply: {
          end: true,
          endingKey: 'meng_supply',
          fate: { 'plotFlags.fate_meng': 'supply' },
          line: '一車糧藥入營。蒙恬不多謝，只道：「欠你的，戰場上還。」——這筆債，比銀兩沉。',
          toast: '蒙恬線·糧藥',
          rewards: {
            gold: 30, fame: 4, faction: { qin: 8 },
            aff: { mengtian: 12 }, bag: { herb: 1 },
            people: 2,
            diverge: { id: 'meng_fate', note: '邊營補給改善，徵丁壓力略減於鄉里' }
          }
        },
        end_broker_border: {
          end: true,
          endingKey: 'meng_broker',
          fate: { 'plotFlags.fate_meng': 'broker' },
          line: '關市開一縫，刀與貨並流。蒙恬黙許，邊市盟記你人情——你走在王法與馬蹄之間。',
          toast: '蒙恬線·邊市縫',
          rewards: {
            gold: 65, fame: 5, faction: { sai: 12, qin: 4 },
            aff: { mengtian: 8, sai_envoy: 10, youxia: 6 },
            diverge: { id: 'meng_fate', note: '有限互市使邊釁暫緩，亦使情報南流' }
          }
        },
        end_retreat: {
          end: true,
          endingKey: 'meng_retreat',
          fate: { 'plotFlags.fate_meng': 'retreat' },
          line: '蒙恬一拱手：「歸田亦是勇。塞上風，不強留人。」你們緣淺，但未結怨。',
          toast: '蒙恬線·歸田',
          rewards: {
            fame: 1, people: 3,
            aff: { mengtian: 3 }
          }
        }
      }
    }
  ];

  var ARC_BY_ID = {};
  ARCS.forEach(function (a) { ARC_BY_ID[a.id] = a; });

  /** 結局冊條目（人物命運） */
  var ARC_ENDINGS = [
    { id: 'ying_confidant', tier: 'arc', name: '秦王心腹（邊野耳目）', when: '少年秦王以你為邊野耳目，親政之心漸堅。', fate: 'confidant', npc: 'ying' },
    { id: 'ying_shield', tier: 'arc', name: '王府外牆', when: '你成王府外圍屏障，私門稍斂。', fate: 'shield', npc: 'ying' },
    { id: 'ying_wary', tier: 'arc', name: '秦王緣淺', when: '宮門一合，王不再問邊野之士。', fate: 'wary', npc: 'ying' },
    { id: 'ying_companion', tier: 'arc', name: '伴側長隨', when: '藥囊侍廊側，近側細線韌而長。', fate: 'companion', npc: 'ying' },
    { id: 'ying_awe', tier: 'arc', name: '疏離敬畏', when: '王賜無字印：不必近，卻須在。', fate: 'awe', npc: 'ying' },
    { id: 'ying_alter', tier: 'arc', name: '改史倖存', when: '緩賦一令顫動軌道，署名者倖存近側。', fate: 'alter', npc: 'ying' },
    { id: 'lu_patron', tier: 'arc', name: '呂氏門客', when: '相邦府記你為長線門客，命運與呂氏相綁。', fate: 'patron', npc: 'lu' },
    { id: 'lu_merchant', tier: 'arc', name: '呂網商結', when: '你成呂氏商網上的邊野節點。', fate: 'merchant', npc: 'lu' },
    { id: 'lu_broker', tier: 'arc', name: '呂／王雙線', when: '中道留線，雨來時最難站——亦最活。', fate: 'broker', npc: 'lu' },
    { id: 'lu_leak', tier: 'arc', name: '賣線王府', when: '密語入王府，呂門刀光指向你。', fate: 'leaked', npc: 'lu' },
    { id: 'lu_distant', tier: 'arc', name: '不過奇貨', when: '你拒入府網，奇貨故事暫與你無緣。', fate: 'distant', npc: 'lu' },
    { id: 'zhaoji_shield', tier: 'arc', name: '太后外援', when: '后黨得勸斂之繩，宮爭轉暗。', fate: 'shield', npc: 'zhaoji' },
    { id: 'zhaoji_warn', tier: 'arc', name: '告王宮影', when: '母子之間多一層霜，王府先手在握。', fate: 'warn_king', npc: 'zhaoji' },
    { id: 'zhaoji_neutral', tier: 'arc', name: '抽身宮門', when: '你退回阡陌，深宮如夢。', fate: 'neutral', npc: 'zhaoji' },
    { id: 'lisi_legalist', tier: 'arc', name: '宣法之舌', when: '客卿得你外宣，弱私門之議早傳。', fate: 'legalist', npc: 'lisi' },
    { id: 'lisi_restrain', tier: 'arc', name: '法術折中', when: '限而不絕之說成縫，兩造稍緩。', fate: 'restrain', npc: 'lisi' },
    { id: 'lisi_oppose', tier: 'arc', name: '客卿對手', when: '你為私門爭聲，李斯視你為廷爭敵。', fate: 'oppose', npc: 'lisi' },
    { id: 'lisi_observer', tier: 'arc', name: '觀棋客卿', when: '你未落子，只作觀棋之人。', fate: 'observer', npc: 'lisi' },
    { id: 'meng_comrade', tier: 'arc', name: '塞上袍澤', when: '蒙恬託你糧策與刀，北境牽線關內。', fate: 'comrade', npc: 'meng' },
    { id: 'meng_supply', tier: 'arc', name: '邊營供輸', when: '一車糧藥，換戰場上的人情債。', fate: 'supply', npc: 'meng' },
    { id: 'meng_broker', tier: 'arc', name: '關市縫人', when: '刀與貨並流，你走在王法與馬蹄間。', fate: 'broker', npc: 'meng' },
    { id: 'meng_retreat', tier: 'arc', name: '塞上歸田', when: '蒙恬不強留，緣淺無怨。', fate: 'retreat', npc: 'meng' }
  ];

  function prog(S, arcId) {
    ensure(S);
    if (!S.arcProg[arcId]) S.arcProg[arcId] = { started: false, node: null, ended: null, seen: {} };
    return S.arcProg[arcId];
  }

  function canStart(S, arc) {
    ensure(S);
    var p = prog(S, arc.id);
    if (p.ended) return false;
    if (p.started && p.node) return false; /* 進行中由 pollContinue 處理 */
    if (condOk(S, arc.startIf)) return true;
    if (arc.altStartIf && condOk(S, arc.altStartIf)) return true;
    if (arc.altStartIf2 && condOk(S, arc.altStartIf2)) return true;
    return false;
  }

  function nodeToEvent(arc, nodeId) {
    var node = arc.nodes[nodeId];
    if (!node) return null;
    var choices = (node.choices || []).map(function (c) {
      return {
        id: c.id,
        label: c.text,
        text: c.text,
        to: c.to,
        need: c.need,
        set: c.set,
        if: c.if,
        effect: 'arc_step'
      };
    });
    return {
      id: 'arc:' + arc.id + ':' + nodeId,
      arcId: arc.id,
      nodeId: nodeId,
      title: arc.title,
      body: node.line,
      choices: choices,
      plot: true,
      arc: true,
      face: arc.face,
      faction: arc.faction,
      npc: arc.npc
    };
  }

  function gateArcChoices(S, ev) {
    if (!ev || !ev.choices) return ev;
    var arc = ARC_BY_ID[ev.arcId];
    var node = arc && arc.nodes[ev.nodeId];
    ev.choices = (ev.choices || []).map(function (c) {
      var raw = null;
      if (node && node.choices) {
        for (var i = 0; i < node.choices.length; i++) {
          if (node.choices[i].id === c.id) { raw = node.choices[i]; break; }
        }
      }
      var locked = false;
      var tip = '';
      if (raw && raw.if && !condOk(S, raw.if)) {
        locked = true;
        tip = '條件未足';
      }
      if (raw && raw.need && !needOk(S, raw.need)) {
        locked = true;
        tip = needTip(S, raw.need) || '屬性不足';
      }
      /* people 等非屬性 need 已在 cond；這裡處理 need.people 特例 */
      if (raw && raw.need && raw.need.people != null && (S.people || 0) < raw.need.people) {
        locked = true;
        tip = '民心≥' + raw.need.people;
      }
      var label = c.label || c.text;
      if (raw && raw.need && global.QianPlots) {
        label = locked
          ? '🔒 ' + (c.text || c.label) + '（' + (tip || needTip(S, raw.need)) + '）'
          : (c.text || c.label) + (tip ? '' : '');
      } else if (locked) {
        label = '🔒 ' + (c.text || c.label);
      }
      return Object.assign({}, c, { label: label, locked: locked, tip: tip, to: (raw && raw.to) || c.to, set: (raw && raw.set) || c.set });
    }).filter(function (c) {
      /* 隱藏 if 失敗且標 hidden */
      var raw = null;
      var node2 = arc && arc.nodes[ev.nodeId];
      if (node2) {
        for (var j = 0; j < (node2.choices || []).length; j++) {
          if (node2.choices[j].id === c.id) raw = node2.choices[j];
        }
      }
      if (raw && raw.hiddenIf && condOk(S, raw.hiddenIf)) return false;
      if (raw && raw.if && raw.hide && !condOk(S, raw.if)) return false;
      return true;
    });
    return ev;
  }

  function pollContinue(S) {
    ensure(S);
    for (var i = 0; i < ARCS.length; i++) {
      var arc = ARCS[i];
      var p = prog(S, arc.id);
      if (p.started && p.node && !p.ended) {
        var ev = nodeToEvent(arc, p.node);
        if (ev) return gateArcChoices(S, ev);
      }
    }
    return null;
  }

  function poll(S) {
    if (!S || S.pendingEvent) return null;
    ensure(S);
    var cont = pollContinue(S);
    if (cont) return cont;
    /* 一天最多新開一弧：優先日深／已相識 */
    var day = S.day || 1;
    var candidates = ARCS.filter(function (a) { return canStart(S, a); });
    if (!candidates.length) return null;
    candidates.sort(function (a, b) {
      var pa = prog(S, a.id).started ? 1 : 0;
      var pb = prog(S, b.id).started ? 1 : 0;
      return pa - pb;
    });
    /* 分散：用 day 與弧序取模，避免總開同一條 */
    var pick = candidates[(day + candidates.length) % candidates.length] || candidates[0];
    var p = prog(S, pick.id);
    p.started = true;
    p.node = 'start';
    if (pick.npc && global.QianStory) global.QianStory.markKnown(S, pick.npc, '劇情相識');
    return gateArcChoices(S, nodeToEvent(pick, 'start'));
  }

  /** 對談入口：若該 NPC 有可開／進行中弧，回傳提示選項 */
  function talkHook(S, npcId) {
    ensure(S);
    for (var i = 0; i < ARCS.length; i++) {
      var arc = ARCS[i];
      if (arc.npc !== npcId) continue;
      var p = prog(S, arc.id);
      if (p.ended) continue;
      if (p.started && p.node) {
        return { id: 'arc_continue_' + arc.id, label: '續談：' + arc.title.replace(/·.*/, ''), arcId: arc.id };
      }
      if (canStart(S, arc)) {
        return { id: 'arc_start_' + arc.id, label: '深談：' + arc.title.replace(/·.*/, ''), arcId: arc.id };
      }
    }
    return null;
  }

  function beginFromTalk(S, arcId) {
    ensure(S);
    var arc = ARC_BY_ID[arcId];
    if (!arc) return null;
    var p = prog(S, arcId);
    if (p.ended) return null;
    if (!p.started) {
      if (!canStart(S, arc) && !(p.node)) {
        /* 對談放寬：已識 NPC 即可開 */
        if (!(S.npcs && S.npcs[arc.npc] && S.npcs[arc.npc].known) && !condOk(S, arc.startIf) && !condOk(S, arc.altStartIf || {})) {
          return null;
        }
      }
      p.started = true;
      p.node = p.node || 'start';
    }
    if (arc.npc && global.QianStory) global.QianStory.markKnown(S, arc.npc, '深談');
    var ev = gateArcChoices(S, nodeToEvent(arc, p.node || 'start'));
    S.pendingEvent = ev;
    return ev;
  }

  function applyChoice(S, event, choiceId) {
    ensure(S);
    if (!event || !event.arc) return null;
    var arc = ARC_BY_ID[event.arcId];
    if (!arc) return { toast: '……', line: '' };
    var node = arc.nodes[event.nodeId];
    if (!node) return { toast: '……', line: '' };
    var ch = null;
    (node.choices || []).forEach(function (c) { if (c.id === choiceId) ch = c; });
    if (!ch) return { toast: '……', line: '' };

    /* 重鎖檢查 */
    if (ch.if && !condOk(S, ch.if)) {
      return { toast: '條件未足', line: '此刻尚不能如此。' };
    }
    if (ch.need) {
      var fakeNeed = Object.assign({}, ch.need);
      var peopleNeed = fakeNeed.people;
      delete fakeNeed.people;
      if (peopleNeed != null && (S.people || 0) < peopleNeed) {
        return { toast: '民心不足', line: '民心未及，難以說動。' };
      }
      if (Object.keys(fakeNeed).length && !needOk(S, fakeNeed)) {
        return { toast: '屬性不足，無法如此', line: '你心有餘而力不足——' + needTip(S, fakeNeed) };
      }
    }

    var p = prog(S, arc.id);
    /* seen-flag 防重入：同節點同選只套用一次 set */
    var seenKey = event.nodeId + ':' + choiceId;
    if (!p.seen[seenKey]) {
      p.seen[seenKey] = 1;
      applySet(S, ch.set);
    }

    var nextId = ch.to;
    var next = arc.nodes[nextId];
    if (!next) {
      S.pendingEvent = null;
      return { toast: '劇情中斷', line: '話頭一岔，眾人散去。' };
    }

    if (next.end) {
      p.ended = next.endingKey || nextId;
      p.node = null;
      S.pendingEvent = null;
      if (!p.seen['end:' + nextId]) {
        p.seen['end:' + nextId] = 1;
        applySet(S, next.fate);
        applySet(S, next.set);
        applyRewards(S, next.rewards);
        if (next.endingKey) {
          if (S.endings.indexOf(next.endingKey) < 0) S.endings.push(next.endingKey);
        }
        /* 任務完成旗 */
        S.flags['arc_done_' + arc.id] = 1;
        if (global.QianFactions && global.QianFactions.checkEndings) {
          global.QianFactions.checkEndings(S);
        }
        if (global.QianFactions && global.QianFactions.composeWorldLine) {
          S.worldLine = global.QianFactions.composeWorldLine(S);
        }
        if (arc.npc && global.QianStory) {
          global.QianStory.logNpc(S, arc.npc, '深談收束：' + (next.toast || next.endingKey || ''));
        }
      }
      return { toast: next.toast || '命運已定', line: next.line || '', arcDone: true, endingKey: next.endingKey };
    }

    /* 續節點 */
    p.node = nextId;
    var cont = gateArcChoices(S, nodeToEvent(arc, nextId));
    S.pendingEvent = cont;
    return {
      toast: '……',
      line: '',
      continueEvent: cont,
      soft: true
    };
  }

  function fateSummary(S) {
    ensure(S);
    var pf = S.plotFlags || {};
    var parts = [];
    var map = {
      fate_ying: { confidant: '秦王耳目', shield: '王府外牆', wary: '與王緣淺' },
      fate_lu: { patron: '呂氏門客', merchant: '呂網商結', broker: '呂王雙線', leaked: '已賣呂線', distant: '不過呂府' },
      fate_zhaoji: { shield: '太后外援', warn_king: '告王宮影', neutral: '遠宮闈' },
      fate_lisi: { legalist: '宣法之舌', restrain: '法術折中', oppose: '客卿對手', observer: '觀棋客卿' },
      fate_meng: { comrade: '塞上袍澤', supply: '邊營供輸', broker: '關市縫人', retreat: '塞上歸田' }
    };
    Object.keys(map).forEach(function (k) {
      var v = pf[k];
      if (v && map[k][v]) parts.push(map[k][v]);
    });
    if (pf.lu_saved) parts.push('呂氏曾救');
    if (pf.lu_betrayed) parts.push('曾賣呂黨');
    return parts.length ? parts.join('·') : '';
  }

  function checkArcEndings(S) {
    ensure(S);
    ARC_ENDINGS.forEach(function (e) {
      if (S.endings.indexOf(e.id) >= 0) return;
      /* 若 arcProg 已 ended 對應 key */
      var found = false;
      Object.keys(S.arcProg || {}).forEach(function (aid) {
        if (S.arcProg[aid] && S.arcProg[aid].ended === e.id) found = true;
      });
      if (found) S.endings.push(e.id);
    });
  }

  function endingListExtra() {
    return ARC_ENDINGS.map(function (e) {
      return {
        id: e.id,
        tier: e.tier || 'arc',
        name: e.name,
        when: e.when,
        check: function (S) {
          ensure(S);
          if (S.endings.indexOf(e.id) >= 0) return true;
          var ok = false;
          Object.keys(S.arcProg || {}).forEach(function (aid) {
            if (S.arcProg[aid] && S.arcProg[aid].ended === e.id) ok = true;
          });
          return ok;
        }
      };
    });
  }

  /** 自測：每弧每選可達 end */
  function validate() {
    var errors = [];
    ARCS.forEach(function (arc) {
      if (!arc.nodes.start) errors.push(arc.id + ': missing start');
      var ends = 0;
      Object.keys(arc.nodes).forEach(function (nid) {
        var n = arc.nodes[nid];
        if (n.end) {
          ends++;
          if (!n.endingKey) errors.push(arc.id + '/' + nid + ': end missing endingKey');
          if (!n.fate) errors.push(arc.id + '/' + nid + ': end missing fate');
        } else {
          (n.choices || []).forEach(function (c) {
            if (!c.to || !arc.nodes[c.to]) errors.push(arc.id + '/' + nid + ' choice ' + c.id + ' bad to=' + c.to);
          });
          if (!(n.choices && n.choices.length)) errors.push(arc.id + '/' + nid + ': no choices');
        }
      });
      if (ends < 2) errors.push(arc.id + ': need ≥2 endings, got ' + ends);
    });
    return errors;
  }

  function listArcs() {
    return ARCS.map(function (a) {
      var ends = Object.keys(a.nodes).filter(function (k) { return a.nodes[k].end; });
      return { id: a.id, title: a.title, npc: a.npc, endings: ends.length, endingKeys: ends.map(function (k) { return a.nodes[k].endingKey; }) };
    });
  }

  global.QianArcs = {
    ARCS: ARCS,
    ARC_ENDINGS: ARC_ENDINGS,
    ensure: ensure,
    poll: poll,
    applyChoice: applyChoice,
    talkHook: talkHook,
    beginFromTalk: beginFromTalk,
    fateSummary: fateSummary,
    checkArcEndings: checkArcEndings,
    endingListExtra: endingListExtra,
    validate: validate,
    listArcs: listArcs,
    condOk: condOk,
    prog: prog
  };
})(typeof window !== 'undefined' ? window : globalThis);
