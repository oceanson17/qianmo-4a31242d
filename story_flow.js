/* 墨夢莊周 · 文字劇情主循環（visual novel／選擇驅動）
 * 節點：id／speaker／text／bg／choices[{id,text,to,if,set,need,reward,advance,arcHint}]
 * 旗標寫 S.flags／S.plotFlags／好感 aff:npc；時段用 advance:'period'|'day'
 */
(function (global) {
  'use strict';

  function readPath(S, path) {
    if (!S || !path) return undefined;
    if (path.indexOf('known:') === 0) {
      var kid = path.slice(6);
      return !!(S.npcs && S.npcs[kid] && S.npcs[kid].known);
    }
    if (path.indexOf('aff:') === 0) {
      var nid = path.slice(4);
      return (S.npcs && S.npcs[nid] && S.npcs[nid].aff) || 0;
    }
    if (path.indexOf('flags.') === 0) return S.flags && S.flags[path.slice(6)];
    if (path.indexOf('plotFlags.') === 0) return S.plotFlags && S.plotFlags[path.slice(10)];
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
      } else {
        if (got !== want) return false;
      }
    }
    return true;
  }

  function needOk(S, need) {
    if (!need) return true;
    if (global.QianPlots && global.QianPlots.needOk) return global.QianPlots.needOk(S, need);
    var a = (S && S.attrs) || {};
    return Object.keys(need).every(function (k) { return (a[k] || 0) >= need[k]; });
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
    Object.keys(setObj).forEach(function (k) { setPath(S, k, setObj[k]); });
  }

  function applyReward(S, reward) {
    if (!reward) return;
    if (reward.gold) S.gold = (S.gold || 0) + reward.gold;
    if (reward.food) S.food = (S.food || 0) + reward.food;
    if (reward.fame) S.fame = Math.min(100, (S.fame || 0) + reward.fame);
    if (reward.people) S.people = Math.min(100, (S.people || 0) + reward.people);
    if (reward.hp) {
      var maxHp = (S.maxHp != null ? S.maxHp : 80);
      S.hp = Math.max(1, Math.min(maxHp, (S.hp || maxHp) + reward.hp));
    }
    if (reward.bag && S.bag) {
      Object.keys(reward.bag).forEach(function (k) {
        S.bag[k] = (S.bag[k] || 0) + reward.bag[k];
      });
    }
  }

  /* ---- 原創章節節點（非小說原文） ---- */
  var NODES = {
    /* 序：墨夢初醒 */
    pro_01: {
      id: 'pro_01', chapter: 'prologue', speaker: '旁白', bg: 'hut',
      text: '秦王政元年春。你自一場墨色長夢中醒來——窗外雞啼，陋室爐灰尚溫。夢裡似有莊周化蝶，醒來卻仍是編戶齊民。\n門外有人輕叩：「可醒了？鄉里都在等你一句話。」',
      choices: [
        { id: 'a', text: '起身應門', to: 'pro_02', set: { 'flags.woke': 1 } },
        { id: 'b', text: '再閉目片刻，回想夢境', to: 'pro_dream', set: { 'flags.dream_linger': 1, 'plotFlags.ink_dream': 1 } }
      ]
    },
    pro_dream: {
      id: 'pro_dream', chapter: 'prologue', speaker: '旁白', bg: 'hut',
      text: '墨濤裡隱約晃過少年王冠影、相邦府燈火，與一縷陌生的藥香。你說不清那是預兆還是妄念——只知心口發熱，似有未完之卷。',
      choices: [
        { id: 'a', text: '推門出去', to: 'pro_02' }
      ]
    },
    pro_02: {
      id: 'pro_02', chapter: 'prologue', speaker: '何伯', bg: 'village',
      text: '何伯拄杖站在院外，笑紋裡帶憂：「豆豆啊——你既選了立足之業，村里便指望你。田要人耕，市要人走，宮裡的風也吹到咱這窮鄉了。」\n他壓低聲音：「聽說咸陽那邊，少年王與相邦……不太平。」',
      choices: [
        { id: 'a', text: '先安頓生計，再談天下', to: 'ch1_hub', set: { 'flags.heard_court_rumor': 1 }, reward: { people: 1 }, advance: 'period' },
        { id: 'b', text: '追問宮裡風聲', to: 'pro_rumor', set: { 'flags.curious_court': 1, 'aff:he': 2 } },
        { id: 'c', text: '笑說「我只想吃飽」', to: 'ch1_hub', set: { 'flags.humble_start': 1 }, reward: { food: 1 }, advance: 'period' }
      ]
    },
    pro_rumor: {
      id: 'pro_rumor', chapter: 'prologue', speaker: '何伯', bg: 'village',
      text: '「呂相邦門客出入如織，太后宮外也有閒話。」何伯搖頭，「你若有本事，將來或能見世面；若無，守住這畝三分地便好。記住——話到嘴邊留三分。」',
      choices: [
        { id: 'a', text: '謹記於心，去張羅生計', to: 'ch1_hub', set: { 'plotFlags.court_whisper': 1, 'aff:he': 1 }, reward: { fame: 1 }, advance: 'period' }
      ]
    },

    /* 第一章：鄉野生計（文字遭遇，非種田格子） */
    ch1_hub: {
      id: 'ch1_hub', chapter: 'ch1', speaker: '旁白', bg: 'farm',
      text: '晨光落在阡陌。你站在村口，可親手做一件事，也可聽人帶路。每一選擇都會推進時辰，並在墨夢裡留下痕跡。',
      choices: [
        { id: 'farm', text: '下田幫耕（文字耕作）', to: 'ch1_farm', if: { 'flags.ch1_farm_done': false } },
        { id: 'mkt', text: '去市井打聽行情', to: 'ch1_market', if: { 'flags.ch1_mkt_done': false } },
        { id: 'med', text: '往藥廬看看', to: 'ch1_clinic', if: { 'flags.ch1_med_done': false } },
        { id: 'drill', text: '到校場觀武', to: 'ch1_drill', if: { 'flags.ch1_drill_done': false } },
        { id: 'rest', text: '回陋室歇息，過一時', to: 'ch1_rest' },
        { id: 'next', text: '覺得時候差不多了——想到咸陽', to: 'ch2_road', if: { 'flags.ch1_ready': true }, set: { 'flags.left_village': 1 } }
      ]
    },
    ch1_farm: {
      id: 'ch1_farm', chapter: 'ch1', speaker: '旁白', bg: 'farm',
      text: '泥香撲鼻。你彎腰除草、引水，汗水滴進壟溝。鄰人遞來一碗涼茶：「年輕人肯出力，秋來多分一捆稻。」',
      choices: [
        { id: 'a', text: '專心幹完（+糧 +民心）', to: 'ch1_after', set: { 'flags.ch1_farm_done': 1 }, reward: { food: 3, people: 2, gold: 5 }, advance: 'period' },
        { id: 'b', text: '邊幹邊問咸陽路', to: 'ch1_after', set: { 'flags.ch1_farm_done': 1, 'flags.asked_road': 1 }, reward: { food: 2, people: 1 }, advance: 'period' }
      ]
    },
    ch1_market: {
      id: 'ch1_market', chapter: 'ch1', speaker: '賈人馮', bg: 'market',
      text: '市聲嘈雜。賈人馮掂著銅錢：「關市的鹽鐵、客館的六國話，都比村里新鮮。你若有貨，我給路子；若想進相邦府打聽——那可不止一壺酒錢。」',
      choices: [
        { id: 'a', text: '先學買賣，換些銀兩', to: 'ch1_after', set: { 'flags.ch1_mkt_done': 1, 'aff:feng': 3 }, reward: { gold: 18, fame: 1 }, advance: 'period' },
        { id: 'b', text: '買他一張「眼線」情報', to: 'ch1_after', set: { 'flags.ch1_mkt_done': 1, 'plotFlags.bought_tip': 1 }, reward: { gold: -12, fame: 2 }, advance: 'period',
          if: { gold: 12 } },
        { id: 'c', text: '婉拒，只聽不買', to: 'ch1_after', set: { 'flags.ch1_mkt_done': 1 }, reward: { fame: 1 }, advance: 'period' }
      ]
    },
    ch1_clinic: {
      id: 'ch1_clinic', chapter: 'ch1', speaker: '蘇娘', bg: 'clinic',
      text: '藥廬青煙裊裊。蘇娘搗藥不抬頭：「外感內傷，皆有藥對。可人的心病——權爭、猜忌——無方可醫。你若肯義診一回，鄉里記得你。」',
      choices: [
        { id: 'a', text: '留下來義診', to: 'ch1_after', set: { 'flags.ch1_med_done': 1, 'flags.charity': 1, 'aff:su': 4 }, reward: { people: 4, fame: 2, gold: -5 }, advance: 'period' },
        { id: 'b', text: '求一包路上用的金創藥', to: 'ch1_after', set: { 'flags.ch1_med_done': 1 }, reward: { gold: -8, bag: { herb: 2 } }, advance: 'period' }
      ]
    },
    ch1_drill: {
      id: 'ch1_drill', chapter: 'ch1', speaker: '校尉', bg: 'drill',
      text: '校場塵土飛揚。校尉喝道：「站直！秦法賞軍功。你若只是來看熱鬧，便站遠些；若想活命，先學會躲刀，再談殺敵。」',
      choices: [
        { id: 'a', text: '跟練半日（文字校場）', to: 'ch1_spar', set: { 'flags.ch1_drill_done': 1 } },
        { id: 'b', text: '詢問從軍之路', to: 'ch1_after', set: { 'flags.ch1_drill_done': 1, 'flags.ask_enlist': 1, 'factions.qin': 2 }, reward: { fame: 1 }, advance: 'period' }
      ]
    },
    ch1_spar: {
      id: 'ch1_spar', chapter: 'ch1', speaker: '旁白', bg: 'drill',
      text: '木劍相擊。你選擇——',
      choices: [
        { id: 'atk', text: '硬拼直取（武）', to: 'ch1_spar_win', need: { wu: 1 }, reward: { fame: 1, hp: -4 }, set: { 'flags.spar_style': 'wu' } },
        { id: 'dodge', text: '側身卸力（身）', to: 'ch1_spar_win', reward: { hp: -2 }, set: { 'flags.spar_style': 'shen' } },
        { id: 'talk', text: '請求指點而非對打（辯）', to: 'ch1_after', set: { 'flags.ch1_drill_done': 1, 'flags.spar_style': 'bian' }, reward: { fame: 1 }, advance: 'period' }
      ]
    },
    ch1_spar_win: {
      id: 'ch1_spar_win', chapter: 'ch1', speaker: '校尉', bg: 'drill',
      text: '校尉點頭：「有點意思。記住——戰場上無第二招可重來。去吧，別在這耽誤農時。」',
      choices: [
        { id: 'a', text: '拱手退下', to: 'ch1_after', set: { 'flags.ch1_drill_done': 1 }, reward: { gold: 5 }, advance: 'period' }
      ]
    },
    ch1_rest: {
      id: 'ch1_rest', chapter: 'ch1', speaker: '旁白', bg: 'hut',
      text: '陋室一枕，窗外蟲鳴。你養足精神，記起何伯的話：天下軌道，或許可被改寫——但改寫者，先要活過眼前這一日。',
      choices: [
        { id: 'a', text: '醒來，繼續今日', to: 'ch1_after', reward: { hp: 10 }, advance: 'period' }
      ]
    },
    ch1_after: {
      id: 'ch1_after', chapter: 'ch1', speaker: '旁白', bg: 'village',
      text: '時辰推移。村口炊煙升起，你盤點所得，心想：再多歷練幾樁，便可上路。',
      choices: [
        { id: 'a', text: '回到村口選擇', to: 'ch1_hub', set: { 'flags.ch1_ready': 1 } }
      ]
    },

    /* 第二章：赴咸陽路上 */
    ch2_road: {
      id: 'ch2_road', chapter: 'ch2', speaker: '旁白', bg: 'post',
      text: '驛道揚塵。前方咸陽城闕隱現，身後是熟悉的田壟。忽有腳步雜亂——三五流寇自坡下躥出，刀光一閃。',
      choices: [
        { id: 'fight', text: '拔刀相向（文字戰鬥）', to: 'ch2_fight' },
        { id: 'talk', text: '曉以利害，試著喝退', to: 'ch2_talk', need: { bian: 1 } },
        { id: 'flee', text: '棄些銀兩，抽身躲开', to: 'ch2_flee', reward: { gold: -10, hp: -2 } },
        { id: 'bribe', text: '扔下錢袋換路', to: 'ch2_arrive', reward: { gold: -20 }, set: { 'flags.road_bribe': 1 }, advance: 'period' }
      ]
    },
    ch2_fight: {
      id: 'ch2_fight', chapter: 'ch2', speaker: '旁白', bg: 'post',
      text: '刀風掠耳。你必須在一息之間定招——',
      choices: [
        { id: 'slash', text: '猛攻先頭（耗體）', to: 'ch2_fight_ok', reward: { hp: -8, fame: 2 }, set: { 'flags.road_win': 1 } },
        { id: 'guard', text: '守中待變', to: 'ch2_fight_ok', reward: { hp: -4, fame: 1 }, set: { 'flags.road_win': 1 } },
        { id: 'herb', text: '先擲藥粉迷眼再走', to: 'ch2_arrive', set: { 'flags.road_herb': 1 }, reward: { hp: -2, fame: 1 }, advance: 'period' }
      ]
    },
    ch2_fight_ok: {
      id: 'ch2_fight_ok', chapter: 'ch2', speaker: '旁白', bg: 'post',
      text: '流寇潰散。你撿起一枚殘破腰牌——似是某營舊物，或許在軍營或國尉府用得上。',
      choices: [
        { id: 'a', text: '收起腰牌，趕路', to: 'ch2_arrive', set: { 'flags.got_waist_tag': 1, 'access.ying': true }, reward: { gold: 8 }, advance: 'period' }
      ]
    },
    ch2_talk: {
      id: 'ch2_talk', chapter: 'ch2', speaker: '你', bg: 'post',
      text: '你沉聲道：「咸陽城門近在咫尺，殺了過路人，尉吏一查，你們跑得了今天跑不了明日。」對方面面相覷，竟真散了半數。',
      choices: [
        { id: 'a', text: '趁機離開', to: 'ch2_arrive', set: { 'flags.road_talk': 1 }, reward: { fame: 3 }, advance: 'period' }
      ]
    },
    ch2_flee: {
      id: 'ch2_flee', chapter: 'ch2', speaker: '旁白', bg: 'post',
      text: '你跌跌撞撞滾下坡，膝頭擦破，銀兩少了一截——命卻保住了。城闕更近。',
      choices: [
        { id: 'a', text: '咬牙進城', to: 'ch2_arrive', set: { 'flags.road_flee': 1 }, advance: 'period' }
      ]
    },
    ch2_arrive: {
      id: 'ch2_arrive', chapter: 'ch2', speaker: '旁白', bg: 'xianyang',
      text: '咸陽街市如潮。宮牆高聳處，旗旌獵獵。你想起墨夢裡的冠影——此刻它就在不遠處。少年王、相邦、太后……命運之弧，或許正等人來撞。',
      choices: [
        { id: 'a', text: '先找客棧落腳，再定去向', to: 'xy_hub', set: { 'flags.visited_xianyang': 1 }, reward: { gold: -5, fame: 2 }, advance: 'day' }
      ]
    },

    /* 咸陽樞紐：可觸發命運弧／過時段 */
    xy_hub: {
      id: 'xy_hub', chapter: 'xianyang', speaker: '旁白', bg: 'xianyang',
      text: '咸陽日子以選擇推進。你可赴重地試探命運，可在市井支線周旋，亦可小憩過一時——天下大勢與人物日程，會隨之改寫。',
      choices: [
        { id: 'palace', text: '往宮城外觀望', to: 'xy_palace' },
        { id: 'xiang', text: '設法近相邦府', to: 'xy_xiangbang' },
        { id: 'tai', text: '聽太后宮外傳聞', to: 'xy_taihou' },
        { id: 'market', text: '市井走走（支線）', to: 'xy_market' },
        { id: 'people', text: '尋可深談之人（人脈）', to: 'xy_talk' },
        { id: 'wait', text: '過一時／養神', to: 'xy_wait' },
        { id: 'arc', text: '靜候「命運來訪」（觸發弧）', to: 'xy_arc_wait', set: { 'flags.want_arc': 1 } }
      ]
    },
    xy_palace: {
      id: 'xy_palace', chapter: 'xianyang', speaker: '衛士', bg: 'palace',
      text: '宮城外戈戟如林。衛士冷眼：「無符節者退後三十步。」遠處殿脊金光一閃，似有少年身影掠過回廊——看不清面容，只覺氣壓低沉。',
      choices: [
        { id: 'a', text: '遠遠行禮，留下名帖之意', to: 'xy_hub', set: { 'flags.visited_palace': 1, 'plotFlags.palace_watch': 1, 'aff:yingzheng': 1 }, reward: { fame: 2 }, advance: 'period' },
        { id: 'b', text: '買通小吏打聽（耗銀）', to: 'xy_hub', set: { 'flags.visited_palace': 1, 'access.palace': true }, reward: { gold: -28, fame: 3 }, advance: 'period',
          if: { gold: 28 } },
        { id: 'c', text: '退回街市', to: 'xy_hub', advance: 'period' }
      ]
    },
    xy_xiangbang: {
      id: 'xy_xiangbang', chapter: 'xianyang', speaker: '門客', bg: 'xiangbang',
      text: '相邦府門庭若市。門客打量你：「相邦用人，不看出身看價值。你有貨、有嘴、還是有膽？」',
      choices: [
        { id: 'a', text: '呈上鄉間見聞，換一次通報', to: 'xy_hub', set: { 'flags.visited_xiangbang': 1, 'access.xiangbang': true, 'aff:lubuwei': 2, 'factions.lu': 3 }, reward: { fame: 3 }, advance: 'period' },
        { id: 'b', text: '留下名刺，改日再來', to: 'xy_hub', set: { 'flags.visited_xiangbang': 1, 'aff:menke': 1 }, reward: { fame: 1 }, advance: 'period' },
        { id: 'c', text: ' 默默記下佈防，轉身離開', to: 'xy_hub', set: { 'flags.visited_xiangbang': 1, 'plotFlags.xiang_spy': 1 }, advance: 'period' }
      ]
    },
    xy_taihou: {
      id: 'xy_taihou', chapter: 'xianyang', speaker: '路人', bg: 'taihou',
      text: '太后宮牆外，兩名婦人以袖掩口：「……嫪詭什麼的，說不清。只勸你少聽少傳。」一陣香風掠過，又似什麼都沒發生。',
      choices: [
        { id: 'a', text: '記下傳聞，不多問', to: 'xy_hub', set: { 'flags.visited_taihou': 1, 'flags.taihou_spy': 1, 'plotFlags.taihou_rumor': 1 }, reward: { fame: 1 }, advance: 'period' },
        { id: 'b', text: '故意高聲附和，試探反應', to: 'xy_hub', set: { 'flags.visited_taihou': 1, 'aff:zhaoji': 1 }, reward: { fame: 2, people: -1 }, advance: 'period' }
      ]
    },
    xy_market: {
      id: 'xy_market', chapter: 'xianyang', speaker: '旁白', bg: 'market',
      text: '鹽鐵、竹簡、吳越劍客的傳言，在同一條街上碰撞。你用半日換來見聞與薄利——也換來一句提醒：客館裡有六國口音。',
      choices: [
        { id: 'a', text: '收攤，回樞紐', to: 'xy_hub', set: { 'flags.xy_market': 1, 'flags.visited_keguan': 1 }, reward: { gold: 12, fame: 1 }, advance: 'period' }
      ]
    },
    xy_talk: {
      id: 'xy_talk', chapter: 'xianyang', speaker: '旁白', bg: 'tavern',
      text: '酒肆角落，可深談者視你名望與行跡而定。你可主動尋訪——或把機會留給「命運來訪」。',
      choices: [
        { id: 'yz', text: '設法求見少年秦王相關之人', to: 'xy_hub', set: { 'flags.seek_yingzheng': 1 }, reward: { fame: 1 }, advance: 'period' },
        { id: 'ls', text: '打聽執法苛吏／李斯門生', to: 'xy_hub', set: { 'flags.seek_lisi': 1, 'aff:lisi': 1 }, advance: 'period' },
        { id: 'mt', text: '軍營外候蒙氏子弟影踪', to: 'xy_hub', set: { 'flags.seek_mengtian': 1, 'aff:mengtian': 1 }, advance: 'period' },
        { id: 'back', text: '暫且回去', to: 'xy_hub' }
      ]
    },
    xy_wait: {
      id: 'xy_wait', chapter: 'xianyang', speaker: '旁白', bg: 'hut',
      text: '光陰如水。你小憩片刻，天下棋盤上的子，似乎又動了一格。',
      choices: [
        { id: 'a', text: '繼續', to: 'xy_hub', reward: { hp: 6 }, advance: 'period' }
      ]
    },
    xy_arc_wait: {
      id: 'xy_arc_wait', chapter: 'xianyang', speaker: '旁白', bg: 'xianyang',
      text: '你在驛館窗下靜坐。若名望與行跡已足夠，命運之弧會自行叩門；若尚未，便再去宮城、相府或市井留下痕跡。',
      choices: [
        { id: 'a', text: '回到咸陽選擇', to: 'xy_hub', set: { 'flags.poll_arc': 1 } }
      ]
    },

    /* 舊檔續玩入口 */
    resume_hub: {
      id: 'resume_hub', chapter: 'resume', speaker: '旁白', bg: 'xianyang',
      text: '墨夢續卷。舊日耕戰與行跡仍在——自此刻起，主線以文字選擇推進。你可以當自己站在咸陽街口，或退回鄉野再作打算。',
      choices: [
        { id: 'xy', text: '以咸陽為中心繼續', to: 'xy_hub', set: { 'flags.visited_xianyang': 1 } },
        { id: 'vil', text: '先回顧鄉野生計', to: 'ch1_hub' }
      ]
    }
  };

  function ensure(S) {
    if (!S) return;
    if (!S.flags) S.flags = {};
    if (!S.plotFlags) S.plotFlags = {};
    if (!S.storyFlow) {
      S.storyFlow = { nodeId: null, seen: {}, started: false };
    }
    if (!S.storyFlow.seen) S.storyFlow.seen = {};
    return S.storyFlow;
  }

  function begin(S, opts) {
    ensure(S);
    opts = opts || {};
    if (opts.resume && S.storyFlow.nodeId && NODES[S.storyFlow.nodeId]) {
      return getNode(S);
    }
    if (opts.fromSave && !S.storyFlow.started) {
      S.storyFlow.nodeId = 'resume_hub';
      S.storyFlow.started = true;
      return getNode(S);
    }
    if (!S.storyFlow.nodeId || !NODES[S.storyFlow.nodeId]) {
      S.storyFlow.nodeId = 'pro_01';
      S.storyFlow.started = true;
    }
    return getNode(S);
  }

  function getNode(S) {
    ensure(S);
    var id = S.storyFlow.nodeId;
    return NODES[id] || null;
  }

  function visibleChoices(S) {
    var node = getNode(S);
    if (!node) return [];
    return (node.choices || []).filter(function (c) {
      if (c.if && !condOk(S, c.if)) return false;
      /* gold gate in if: { gold: N } means need >= N */
      if (c.if && typeof c.if.gold === 'number' && (S.gold || 0) < c.if.gold) return false;
      return true;
    }).map(function (c) {
      var locked = c.need && !needOk(S, c.need);
      return {
        id: c.id,
        text: c.text + (locked ? '（條件不足）' : ''),
        locked: !!locked,
        raw: c
      };
    });
  }

  function applyChoice(S, choiceId) {
    ensure(S);
    var node = getNode(S);
    if (!node) return { ok: false, toast: '無劇情節點' };
    var choice = null;
    for (var i = 0; i < (node.choices || []).length; i++) {
      if (node.choices[i].id === choiceId) { choice = node.choices[i]; break; }
    }
    if (!choice) return { ok: false, toast: '無效選擇' };
    if (choice.if && !condOk(S, choice.if)) return { ok: false, toast: '條件未足' };
    if (choice.need && !needOk(S, choice.need)) return { ok: false, toast: '屬性不足' };

    var seenKey = node.id + '::' + choice.id;
    var first = !S.storyFlow.seen[seenKey];
    if (first) S.storyFlow.seen[seenKey] = 1;

    if (choice.set) applySet(S, choice.set);
    if (choice.reward && first) applyReward(S, choice.reward);
    else if (choice.reward && !first) {
      /* 重入不重複扣獎；仍允許跳轉 */
    }

    var to = choice.to;
    if (!to || !NODES[to]) return { ok: false, toast: '節點缺失', line: node.text };
    S.storyFlow.nodeId = to;
    var next = NODES[to];

    /* ch1_ready：完成至少兩樁生計 */
    var done = 0;
    if (S.flags.ch1_farm_done) done++;
    if (S.flags.ch1_mkt_done) done++;
    if (S.flags.ch1_med_done) done++;
    if (S.flags.ch1_drill_done) done++;
    if (done >= 2) S.flags.ch1_ready = 1;

    return {
      ok: true,
      line: next.text,
      speaker: next.speaker,
      bg: next.bg,
      toast: first && choice.reward ? rewardToast(choice.reward) : null,
      advance: choice.advance || null,
      node: next,
      choiceId: choiceId,
      fromId: node.id,
      pollArc: !!(S.flags.poll_arc || S.flags.want_arc)
    };
  }

  function rewardToast(r) {
    if (!r) return null;
    var bits = [];
    if (r.gold) bits.push((r.gold > 0 ? '+' : '') + r.gold + '銀');
    if (r.food) bits.push('+' + r.food + '糧');
    if (r.fame) bits.push('+' + r.fame + '名');
    if (r.people) bits.push('+' + r.people + '民');
    if (r.hp) bits.push((r.hp > 0 ? '+' : '') + r.hp + '體');
    return bits.length ? bits.join(' ') : null;
  }

  function sceneFor(S) {
    var n = getNode(S);
    return (n && n.bg) || 'xianyang';
  }

  function validate() {
    var errors = [];
    Object.keys(NODES).forEach(function (nid) {
      var n = NODES[nid];
      if (!(n.choices && n.choices.length)) errors.push(nid + ': no choices');
      (n.choices || []).forEach(function (c) {
        if (!c.to || !NODES[c.to]) errors.push(nid + '/' + c.id + ' bad to=' + c.to);
      });
    });
    return { ok: errors.length === 0, errors: errors };
  }

  function summary(S) {
    ensure(S);
    var n = getNode(S);
    return {
      nodeId: S.storyFlow.nodeId,
      chapter: n && n.chapter,
      speaker: n && n.speaker,
      choices: visibleChoices(S).length,
      started: !!S.storyFlow.started
    };
  }

  global.QianStoryFlow = {
    NODES: NODES,
    ensure: ensure,
    begin: begin,
    getNode: getNode,
    visibleChoices: visibleChoices,
    applyChoice: applyChoice,
    sceneFor: sceneFor,
    validate: validate,
    summary: summary,
    condOk: condOk
  };
})(typeof window !== 'undefined' ? window : globalThis);
