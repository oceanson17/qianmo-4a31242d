/* 墨夢莊周 · v39 劇情主循環（接 v37 近側言情節點；UI 殼為 v35 羊皮紙）
 * 節點：id／speaker／text／bg／choices[{id,text,to,if,set,need,reward,advance}]
 * 旗標寫 S.flags／S.plotFlags／好感 aff:npc；時段 advance:'period'|'day'
 * 靈感可參考「近側醫士」題材——全部原創，唔抄任何小說原文／獨特情節句。
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
    if (reward.bag) {
      if (!S.bag) S.bag = {};
      Object.keys(reward.bag).forEach(function (k) {
        S.bag[k] = Math.max(0, (S.bag[k] || 0) + reward.bag[k]);
      });
    }
  }

  /* ---- 原創章回：近側醫士／宮廷言情軸（非小說原文） ---- */
  var NODES = {
    /* 序：墨夢初醒 —— 教練關，提示「選擇會改關係」 */
    pro_01: {
      id: 'pro_01', chapter: 'prologue', speaker: '旁白', bg: 'hut',
      text: '秦王政元年春。你自墨色長夢中醒來——夢裡似有冠影、藥香與未盡之卷。窗外雞啼，陋室爐灰尚溫。\n門外輕叩：「可醒了？鄉里都在等你一句話。」',
      choices: [
        { id: 'a', text: '起身應門', to: 'pro_02', set: { 'flags.woke': 1 } },
        { id: 'b', text: '再閉目片刻，追憶藥香與冠影', to: 'pro_dream', set: { 'flags.dream_linger': 1, 'plotFlags.ink_dream': 1 } }
      ]
    },
    pro_dream: {
      id: 'pro_dream', chapter: 'prologue', speaker: '旁白', bg: 'hut',
      text: '墨濤裡晃過少年王冠影、殿脊金光，與一縷清苦藥香。你說不清那是預兆還是妄念——只知心口發熱，似有未完之緣。',
      choices: [
        { id: 'a', text: '推門出去', to: 'pro_02' }
      ]
    },
    pro_02: {
      id: 'pro_02', chapter: 'prologue', speaker: '何伯', bg: 'village',
      text: '何伯拄杖站在院外，笑紋裡帶憂：「豆豆啊——村里聽說咸陽缺能識藥性的人。少年王剛即位，相邦總事，宮裡暗湧……你若有本事，將來或能入廷；若無，守住這一方安穩也罷。」\n他壓低聲音：「話到嘴邊留三分。」',
      choices: [
        { id: 'a', text: '我想試試入廷之路（近側／醫）', to: 'ch1_hub', set: { 'flags.aim_court': 1, 'flags.heard_court_rumor': 1, 'plotFlags.court_whisper': 1 }, reward: { fame: 1 }, advance: 'period' },
        { id: 'b', text: '追問宮裡風聲', to: 'pro_rumor', set: { 'flags.curious_court': 1, 'aff:he': 2 } },
        { id: 'c', text: '笑說「先把眼前日子過好」', to: 'ch1_hub', set: { 'flags.humble_start': 1, 'flags.aim_court': 1 }, reward: { people: 1 }, advance: 'period' }
      ]
    },
    pro_rumor: {
      id: 'pro_rumor', chapter: 'prologue', speaker: '何伯', bg: 'village',
      text: '「呂相邦門客出入如織，太后宮外也有閒話。」何伯搖頭，「你若識藥、懂分寸，太醫署或關市客館偶爾缺人手——那是進咸陽的縫。記住：宮裡的人，聽的是『用』，不是『情』。」',
      choices: [
        { id: 'a', text: '謹記於心，去準備', to: 'ch1_hub', set: { 'plotFlags.court_whisper': 1, 'flags.aim_court': 1, 'aff:he': 1 }, reward: { fame: 1 }, advance: 'period' }
      ]
    },

    /* 第一章：備廷——節奏教→練；無種田格子 */
    ch1_hub: {
      id: 'ch1_hub', chapter: 'ch1', speaker: '旁白', bg: 'village',
      text: '村口風起。要踏上咸陽，你至少得留下兩樁「能被宮廷或市井記得」的痕跡：藥性、見聞、或一口能說服人的硬氣。\n（選擇會推進時辰，並改寫好感與旗標。）',
      choices: [
        { id: 'herb', text: '上山採藥（文字遭遇）', to: 'ch1_herb', if: { 'flags.ch1_herb_done': false } },
        { id: 'med', text: '往藥廬跟診', to: 'ch1_clinic', if: { 'flags.ch1_med_done': false } },
        { id: 'letter', text: '托人寫信自薦太醫署', to: 'ch1_letter', if: { 'flags.ch1_letter_done': false } },
        { id: 'mkt', text: '市井打聽咸陽缺什麼人', to: 'ch1_market', if: { 'flags.ch1_mkt_done': false } },
        { id: 'rest', text: '回陋室歇息，過一時', to: 'ch1_rest' },
        { id: 'next', text: '準備妥當——啟程赴咸陽', to: 'ch2_road', if: { 'flags.ch1_ready': true }, set: { 'flags.left_village': 1 } }
      ]
    },
    ch1_herb: {
      id: 'ch1_herb', chapter: 'ch1', speaker: '旁白', bg: 'wild',
      text: '山徑露濕。你辨認葉脈與氣味，採下一束可用於金創與熱病的草。忽聞腳步——一名過路客商捂著臂傷。',
      choices: [
        { id: 'a', text: '為他敷藥（得人心）', to: 'ch1_after', set: { 'flags.ch1_herb_done': 1, 'flags.charity': 1, 'plotFlags.healer_seed': 1 }, reward: { people: 3, fame: 2, bag: { herb: 2 } }, advance: 'period' },
        { id: 'b', text: '換他一紙「關市薦條」', to: 'ch1_after', set: { 'flags.ch1_herb_done': 1, 'plotFlags.healer_seed': 1, 'access.guanshi': true }, reward: { fame: 2, bag: { herb: 1 }, gold: 5 }, advance: 'period' },
        { id: 'c', text: '只採藥，不多管', to: 'ch1_after', set: { 'flags.ch1_herb_done': 1 }, reward: { bag: { herb: 3 } }, advance: 'period' }
      ]
    },
    ch1_clinic: {
      id: 'ch1_clinic', chapter: 'ch1', speaker: '蘇娘', bg: 'clinic',
      text: '藥廬青煙裊裊。蘇娘搗藥不抬頭：「外感內傷，皆有藥對。可人的心病——權爭、猜忌——無方可醫。你若肯跟診一回，我教你『望而止言』：宮裡最怕多嘴的醫。」',
      choices: [
        { id: 'a', text: '留下來跟診（醫＋分寸）', to: 'ch1_after', set: { 'flags.ch1_med_done': 1, 'plotFlags.healer_seed': 1, 'aff:su': 5 }, reward: { people: 3, fame: 2, gold: -3 }, advance: 'period' },
        { id: 'b', text: '求一包入廷用的救急散', to: 'ch1_after', set: { 'flags.ch1_med_done': 1, 'plotFlags.healer_seed': 1 }, reward: { gold: -8, bag: { herb: 2 }, fame: 1 }, advance: 'period' }
      ]
    },
    ch1_letter: {
      id: 'ch1_letter', chapter: 'ch1', speaker: '旁白', bg: 'study',
      text: '竹簡上墨未乾。你寫下姓氏、所習藥性，與「願效犬馬於太醫署」一句。何伯搖頭又點頭：「信會到——能不能見人，看緣。」',
      choices: [
        { id: 'a', text: '附上一束自採藥樣', to: 'ch1_after', set: { 'flags.ch1_letter_done': 1, 'plotFlags.self_rec': 1, 'plotFlags.healer_seed': 1 }, reward: { fame: 3, bag: { herb: -1 } }, advance: 'period' },
        { id: 'b', text: '只送信，不多言', to: 'ch1_after', set: { 'flags.ch1_letter_done': 1, 'plotFlags.self_rec': 1 }, reward: { fame: 2, gold: -2 }, advance: 'period' }
      ]
    },
    ch1_market: {
      id: 'ch1_market', chapter: 'ch1', speaker: '賈人馮', bg: 'market',
      text: '市聲嘈雜。賈人馮掂著銅錢：「咸陽缺的不是耕夫，是『能進門又不惹事』的人。太醫署要藥，客館要舌，相邦府要眼——你挑哪條縫？」',
      choices: [
        { id: 'a', text: '藥縫——往太醫署靠', to: 'ch1_after', set: { 'flags.ch1_mkt_done': 1, 'flags.aim_healer': 1, 'aff:feng': 2 }, reward: { gold: 10, fame: 2 }, advance: 'period' },
        { id: 'b', text: '買一張眼線情報（耗銀）', to: 'ch1_after', set: { 'flags.ch1_mkt_done': 1, 'plotFlags.bought_tip': 1 }, reward: { gold: -12, fame: 2 }, advance: 'period', if: { gold: 12 } },
        { id: 'c', text: '只聽不買', to: 'ch1_after', set: { 'flags.ch1_mkt_done': 1 }, reward: { fame: 1 }, advance: 'period' }
      ]
    },
    ch1_rest: {
      id: 'ch1_rest', chapter: 'ch1', speaker: '旁白', bg: 'hut',
      text: '陋室一枕。你夢見殿階很高，藥囊很輕——醒來窗外仍是鄉野月。天下軌道或可被改寫，但改寫者，先要活過眼前這一日。',
      choices: [
        { id: 'a', text: '醒來，繼續準備', to: 'ch1_after', reward: { hp: 12 }, advance: 'period' }
      ]
    },
    ch1_after: {
      id: 'ch1_after', chapter: 'ch1', speaker: '旁白', bg: 'village',
      text: '時辰推移。你盤點所得：藥、名、或一紙薄薦。再多歷練幾樁，便可上路。',
      choices: [
        { id: 'a', text: '回到村口選擇', to: 'ch1_hub', set: { 'flags.ch1_ready': 1 } }
      ]
    },

    /* 第二章：赴咸陽 —— 壓力關 */
    ch2_road: {
      id: 'ch2_road', chapter: 'ch2', speaker: '旁白', bg: 'post',
      text: '驛道揚塵。前方咸陽城闕隱現。忽有腳步雜亂——三五流寇自坡下躥出，刀光一閃。藥囊在腰間一沉。',
      choices: [
        { id: 'fight', text: '拔刀相向（文字衝突）', to: 'ch2_fight' },
        { id: 'talk', text: '曉以利害，試著喝退', to: 'ch2_talk', need: { bian: 1 } },
        { id: 'heal', text: '先擲藥粉迷眼再走', to: 'ch2_arrive', set: { 'flags.road_herb': 1, 'plotFlags.healer_seed': 1 }, reward: { hp: -2, fame: 1 }, advance: 'period' },
        { id: 'bribe', text: '扔下錢袋換路', to: 'ch2_arrive', reward: { gold: -20 }, set: { 'flags.road_bribe': 1 }, advance: 'period' }
      ]
    },
    ch2_fight: {
      id: 'ch2_fight', chapter: 'ch2', speaker: '旁白', bg: 'post',
      text: '刀風掠耳。你必須在一息之間定招——',
      choices: [
        { id: 'slash', text: '猛攻先頭（耗體）', to: 'ch2_fight_ok', reward: { hp: -8, fame: 2 }, set: { 'flags.road_win': 1 } },
        { id: 'guard', text: '守中待變', to: 'ch2_fight_ok', reward: { hp: -4, fame: 1 }, set: { 'flags.road_win': 1 } }
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
    ch2_arrive: {
      id: 'ch2_arrive', chapter: 'ch2', speaker: '旁白', bg: 'xianyang',
      text: '咸陽街市如潮。宮牆高聳處，旗旌獵獵。你想起墨夢裡的冠影——此刻它就在不遠處。少年王、相邦、太后……以及太醫署那扇半開的門。',
      choices: [
        { id: 'a', text: '先找客棧落腳，再尋入廷縫隙', to: 'xy_hub', set: { 'flags.visited_xianyang': 1 }, reward: { gold: -5, fame: 2 }, advance: 'day' }
      ]
    },

    /* 第三章：咸陽樞紐 —— 主玩法：關係／宮廷 */
    xy_hub: {
      id: 'xy_hub', chapter: 'xianyang', speaker: '旁白', bg: 'xianyang',
      text: '咸陽日子以選擇推進。你可赴太醫署求進、宮城外觀望、或在市井／人脈間留下痕跡。靜養過日，命運之弧會自行叩門。',
      choices: [
        { id: 'tai_yi', text: '往太醫署求見署吏', to: 'xy_taiyi' },
        { id: 'palace', text: '往宮城外觀望', to: 'xy_palace' },
        { id: 'enter_palace', text: '設法入宮（門禁：收買／輕功／麻醉／扮相）', to: 'xy_palace_gate',
          if: { 'access.palace': false } },
        { id: 'in_palace', text: '再入宮城（已通門禁）', to: 'xy_palace_in',
          if: { 'access.palace': true } },
        { id: 'xiang', text: '設法近相邦府', to: 'xy_xiangbang' },
        { id: 'tai', text: '聽太后宮外傳聞', to: 'xy_taihou' },
        { id: 'side', text: '遊歷一則短文（支線）', to: 'xy_side' },
        { id: 'people', text: '尋可深談之人', to: 'xy_talk' },
        { id: 'wait', text: '過一時／靜養心神', to: 'xy_wait' },
        { id: 'arc', text: '靜候「命運來訪」（觸發弧）', to: 'xy_arc_wait', set: { 'flags.want_arc': 1 } }
      ]
    },
    xy_taiyi: {
      id: 'xy_taiyi', chapter: 'court', speaker: '太醫署吏', bg: 'clinic',
      text: '署廊藥香沉沉。吏員打量你：「自薦者多。拿得出手的，一是藥性，二是嘴嚴。少年王偶感風寒時，近側缺的是『能進殿又不亂言』的人——你自忖哪一條？」',
      choices: [
        { id: 'a', text: '呈藥樣與跟診經歷', to: 'xy_taiyi_ok', set: { 'flags.visited_taiyi': 1, 'plotFlags.court_healer': 1, 'aff:yiguan': 4 }, reward: { fame: 4 }, advance: 'period',
          if: { 'plotFlags.healer_seed': true } },
        { id: 'b', text: '坦言願守口、效命近側', to: 'xy_taiyi_ok', set: { 'flags.visited_taiyi': 1, 'plotFlags.court_healer': 1, 'aff:yiguan': 3 }, reward: { fame: 3 }, advance: 'period', need: { bian: 2 } },
        { id: 'c', text: '先留下名刺，改日再來', to: 'xy_hub', set: { 'flags.visited_taiyi': 1, 'aff:yiguan': 1 }, reward: { fame: 1 }, advance: 'period' },
        { id: 'd', text: '退回街市', to: 'xy_hub', advance: 'period' }
      ]
    },
    xy_taiyi_ok: {
      id: 'xy_taiyi_ok', chapter: 'court', speaker: '太醫署吏', bg: 'clinic',
      text: '吏員點頭：「記下了。近日若有傳喚，客館留人。切記——殿上無『你以為』，只有『臣謹按』。」他頓了頓：「有時近側要的不是神醫，是一個敢把真話說短的人。」',
      choices: [
        { id: 'a', text: '稱是，退至客館等候', to: 'xy_near_wait', set: { 'access.palace': true, 'flags.await_summon': 1 }, reward: { fame: 2 }, advance: 'period' }
      ]
    },
    xy_near_wait: {
      id: 'xy_near_wait', chapter: 'court', speaker: '旁白', bg: 'keguan',
      text: '客館窗紙微亮。你數著時辰——傳喚或許今夜，或許永不。窗外宮牆如墨。忽然廊下有人低聲：「署裡點了名。帶藥囊，少說話。」',
      choices: [
        { id: 'a', text: '跟去（近側初見）', to: 'xy_near_meet', set: { 'flags.near_side': 1, 'known:yingzheng': true }, advance: 'period' },
        { id: 'b', text: '猶豫——再問一句緣由', to: 'xy_near_meet', set: { 'flags.near_side': 1, 'flags.near_cautious': 1, 'known:yingzheng': true }, advance: 'period' }
      ]
    },
    xy_near_meet: {
      id: 'xy_near_meet', chapter: 'court', speaker: '旁白', bg: 'palace',
      text: '殿角燈火稀疏。少年秦王並未升座，只立於影中。侍史低聲：「診脈、開方，其餘勿問。」王抬眼看你一眼——淡、冷，卻極清醒。\n（此見之後，命運弧『少年秦王』較易叩門；你的遠近，由此起算。）',
      choices: [
        { id: 'a', text: '依診法行事，少言', to: 'xy_near_after', set: { 'plotFlags.ying_first_meet': 1, 'plotFlags.ying_professional': 1, 'aff:yingzheng': 6 }, reward: { fame: 3 }, advance: 'period' },
        { id: 'b', text: '診罷補一句「民間亦畏私門」', to: 'xy_near_after', set: { 'plotFlags.ying_first_meet': 1, 'plotFlags.ying_heard_folk': 1, 'aff:yingzheng': 4 }, reward: { fame: 4 }, advance: 'period', need: { bian: 3 } },
        { id: 'c', text: '刻意溫言寬慰（親近）', to: 'xy_near_after', set: { 'plotFlags.ying_first_meet': 1, 'plotFlags.ying_warm': 1, 'aff:yingzheng': 8 }, reward: { fame: 2 }, advance: 'period' }
      ]
    },
    xy_near_after: {
      id: 'xy_near_after', chapter: 'court', speaker: '侍史', bg: 'palace',
      text: '侍史送你出廊：「王不多誇人。能再召，便是用得。若從此無召——也別怨。」藥囊輕了分兩，心卻重了幾兩。',
      choices: [
        { id: 'a', text: '回到咸陽選擇', to: 'xy_hub', set: { 'flags.poll_arc': 1, 'flags.want_arc': 1 } }
      ]
    },
    xy_palace: {
      id: 'xy_palace', chapter: 'xianyang', speaker: '衛士', bg: 'palace',
      text: '宮城外戈戟如林。衛士冷眼：「無符節者退後三十步。」遠處殿脊金光一閃，似有少年身影掠過回廊。\n（入宮與往日秦風相同：可收買、輕功、麻醉，或憑扮相通融。）',
      choices: [
        { id: 'a', text: '遠遠行禮，留下名帖之意', to: 'xy_hub', set: { 'flags.visited_palace': 1, 'plotFlags.palace_watch': 1, 'aff:yingzheng': 1 }, reward: { fame: 2 }, advance: 'period' },
        { id: 'gate', text: '設法入宮（門禁）', to: 'xy_palace_gate', set: { 'flags.visited_palace': 1 } },
        { id: 'b', text: '買通小吏打聽內情（耗銀，兼得門路）', to: 'xy_palace_in', set: { 'flags.visited_palace': 1, 'access.palace': true }, reward: { gold: -28, fame: 3 }, advance: 'period', if: { gold: 28 } },
        { id: 'c', text: '退回街市', to: 'xy_hub', advance: 'period' }
      ]
    },
    xy_palace_gate: {
      id: 'xy_palace_gate', chapter: 'court', speaker: '衛士', bg: 'palace',
      text: '宮門如獄。衛士横戈：「報出名號，或出示符節——否則退後。」你掂量腰間銀兩、輕功、藥囊，與此刻裝束。\n（與輿圖「宮城外」門禁相同：擇一路通關，即可入宮行事。）',
      choices: [
        { id: 'bribe', text: '收買門衙（銀28；女扮男裝則較廉）', to: 'xy_palace_in', set: { 'access.palace': true, 'flags.visited_palace': 1, 'flags.palace_bribe': 1 }, reward: { gold: -28, fame: 2 }, advance: 'period', if: { gold: 28 } },
        { id: 'bribe_m', text: '以男裝通融收買（銀18）', to: 'xy_palace_in', set: { 'access.palace': true, 'flags.visited_palace': 1, 'flags.palace_bribe': 1 }, reward: { gold: -18, fame: 2 }, advance: 'period',
          if: { gold: 18, 'hero.disguise': 'male' } },
        { id: 'agi', text: '輕功潛入（需輕功≥3、體力充足）', to: 'xy_palace_in', set: { 'access.palace': true, 'flags.visited_palace': 1, 'flags.palace_agi': 1 }, reward: { hp: -4, fame: 3 }, advance: 'period', need: { shen: 2 } },
        { id: 'drug', text: '麻醉迷倒守卒（藥理≥2·麻醉藥×1）', to: 'xy_palace_in', set: { 'access.palace': true, 'flags.visited_palace': 1, 'flags.palace_drug': 1 }, reward: { fame: 3, bag: { anesthetic: -1 } }, advance: 'period',
          if: { 'skills.med': 2, 'bag.anesthetic': 1 } },
        { id: 'disguise_talk', text: '（男裝）以男子之禮請見', to: 'xy_palace_in', set: { 'access.palace': true, 'flags.visited_palace': 1, 'flags.palace_disguise': 1 }, reward: { fame: 2 }, advance: 'period',
          if: { 'hero.disguise': 'male' } },
        { id: 'fem', text: '（女裝）稱入宮探后妃湯藥', to: 'xy_palace_in', set: { 'access.palace': true, 'flags.visited_palace': 1, 'flags.palace_fem': 1, 'plotFlags.taihou_rumor': 1 }, reward: { fame: 2 }, advance: 'period',
          if: { 'hero.disguise': 'female' } },
        { id: 'back', text: '暫且退去', to: 'xy_hub' }
      ]
    },
    xy_palace_in: {
      id: 'xy_palace_in', chapter: 'court', speaker: '旁白', bg: 'palace',
      text: '廊回路轉，宮牆內燈火稀疏。你已入宮城範圍——可打聽王位、投書內廷，或尋近側傳召之縫。少年王的影子，似乎比牆外更近一分。',
      choices: [
        { id: 'rumor', text: '打聽王位傳聞', to: 'xy_hub', set: { 'flags.palace_rumor': 1, 'aff:yingzheng': 2, 'factions.qin': 1 }, reward: { fame: 2 }, advance: 'period' },
        { id: 'letter', text: '投書內廷（耗銀）', to: 'xy_hub', set: { 'flags.palace_letter': 1, 'factions.qin': 3 }, reward: { gold: -12, fame: 3 }, advance: 'period', if: { gold: 12 } },
        { id: 'near', text: '設法近側一見（若已通太醫署更易）', to: 'xy_near_wait', set: { 'flags.await_summon': 1 }, advance: 'period' },
        { id: 'taihou', text: '繞往太后宮外一帶', to: 'xy_taihou', advance: 'period' },
        { id: 'back', text: '退出宮門，回咸陽街市', to: 'xy_hub', advance: 'period' }
      ]
    },
    xy_xiangbang: {
      id: 'xy_xiangbang', chapter: 'xianyang', speaker: '門客', bg: 'xiangbang',
      text: '相邦府門庭若市。門客打量你：「相邦用人，不看出身看價值。你有藥、有嘴、還是有膽？」',
      choices: [
        { id: 'a', text: '呈上鄉間見聞，換一次通報', to: 'xy_hub', set: { 'flags.visited_xiangbang': 1, 'access.xiangbang': true, 'aff:lubuwei': 2, 'factions.lu': 3 }, reward: { fame: 3 }, advance: 'period' },
        { id: 'b', text: '留下名刺，改日再來', to: 'xy_hub', set: { 'flags.visited_xiangbang': 1 }, reward: { fame: 1 }, advance: 'period' },
        { id: 'c', text: '默默記下佈防，轉身離開', to: 'xy_hub', set: { 'flags.visited_xiangbang': 1, 'plotFlags.xiang_spy': 1 }, advance: 'period' }
      ]
    },
    xy_taihou: {
      id: 'xy_taihou', chapter: 'xianyang', speaker: '路人', bg: 'taihou',
      text: '太后宮牆外，兩名婦人以袖掩口。一陣香風掠過，又似什麼都沒發生。你只聽得一句：「……少聽少傳。」',
      choices: [
        { id: 'a', text: '記下傳聞，不多問', to: 'xy_hub', set: { 'flags.visited_taihou': 1, 'flags.taihou_spy': 1, 'plotFlags.taihou_rumor': 1 }, reward: { fame: 1 }, advance: 'period' },
        { id: 'b', text: '故意高聲附和，試探反應', to: 'xy_hub', set: { 'flags.visited_taihou': 1, 'aff:zhaoji': 1 }, reward: { fame: 2, people: -1 }, advance: 'period' }
      ]
    },
    xy_side: {
      id: 'xy_side', chapter: 'xianyang', speaker: '旁白', bg: 'market',
      text: '你在鹽鐵與竹簡之間走了一個時辰。吳越口音、關市皮貨、客館燈火——見聞入袖，薄利入囊。沒有田壟，只有人情與風聲。',
      choices: [
        { id: 'a', text: '回到樞紐', to: 'xy_hub', set: { 'flags.xy_side': 1, 'flags.visited_keguan': 1 }, reward: { gold: 8, fame: 1 }, advance: 'period' }
      ]
    },
    xy_talk: {
      id: 'xy_talk', chapter: 'xianyang', speaker: '旁白', bg: 'tavern',
      text: '酒肆角落，可深談者視你名望與行跡而定。你可主動尋訪——或把機會留給「命運來訪」。',
      choices: [
        { id: 'yz', text: '設法再近少年秦王相關之人', to: 'xy_hub', set: { 'flags.seek_yingzheng': 1 }, reward: { fame: 1 }, advance: 'period' },
        { id: 'yg', text: '再訪太醫署吏', to: 'xy_taiyi', set: { 'flags.seek_taiyi': 1 } },
        { id: 'ls', text: '打聽執法苛吏／李斯門生', to: 'xy_hub', set: { 'flags.seek_lisi': 1, 'aff:lisi': 1 }, advance: 'period' },
        { id: 'mt', text: '軍營外候蒙氏子弟影踪', to: 'xy_hub', set: { 'flags.seek_mengtian': 1, 'aff:mengtian': 1 }, advance: 'period' },
        { id: 'back', text: '暫且回去', to: 'xy_hub' }
      ]
    },
    xy_wait: {
      id: 'xy_wait', chapter: 'xianyang', speaker: '旁白', bg: 'hut',
      text: '光陰如水。你小憩片刻，天下棋盤上的子，似乎又動了一格。近側的召、宮外的風，都可能在下一息降臨。',
      choices: [
        { id: 'a', text: '繼續', to: 'xy_hub', reward: { hp: 8 }, advance: 'period' }
      ]
    },
    xy_arc_wait: {
      id: 'xy_arc_wait', chapter: 'xianyang', speaker: '旁白', bg: 'xianyang',
      text: '你在驛館窗下靜坐。若名望、近側行跡或宮城符節已足夠，命運之弧會自行叩門；若尚未，便再去太醫署、宮城或市井留下痕跡。',
      choices: [
        { id: 'a', text: '回到咸陽選擇', to: 'xy_hub', set: { 'flags.poll_arc': 1 } }
      ]
    },

    /* 舊檔續玩入口 */
    resume_hub: {
      id: 'resume_hub', chapter: 'resume', speaker: '旁白', bg: 'xianyang',
      text: '墨夢續卷。自此刻起，主線以文字選擇推進——近側、入宮門禁、宮爭、人物緣分。底欄「場景」可開輿圖直奔宮城外（門禁如舊秦風）。種田已非主玩法。',
      choices: [
        { id: 'xy', text: '以咸陽／近側為中心繼續', to: 'xy_hub', set: { 'flags.visited_xianyang': 1 } },
        { id: 'vil', text: '先補備廷準備（藥／信）', to: 'ch1_hub' }
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

    /* known:yingzheng via set path known flag — applySet may set on flags; handle known specially */
    if (choice.set && choice.set['known:yingzheng']) {
      if (!S.npcs) S.npcs = {};
      if (!S.npcs.yingzheng) S.npcs.yingzheng = { aff: 0, mem: [], talked: 0, known: true };
      S.npcs.yingzheng.known = true;
    }

    var to = choice.to;
    if (!to || !NODES[to]) return { ok: false, toast: '節點缺失', line: node.text };
    S.storyFlow.nodeId = to;
    var next = NODES[to];

    /* ch1_ready：完成至少兩樁備廷 */
    var done = 0;
    if (S.flags.ch1_herb_done) done++;
    if (S.flags.ch1_med_done) done++;
    if (S.flags.ch1_letter_done) done++;
    if (S.flags.ch1_mkt_done) done++;
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
      choiceText: choice.text,
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

  /** 離線短反應（無 API 時） */
  function offlineBeat(S, choiceText, nextLine) {
    var pf = (S && S.plotFlags) || {};
    var bits = [];
    if (pf.court_healer) bits.push('太醫署的名帖仍在袖中發燙。');
    if (pf.ying_first_meet) bits.push('殿角那一眼，尚未散盡。');
    if (pf.ying_warm) bits.push('你想起自己那句過於溫熱的寬慰——不知是福是禍。');
    if (pf.healer_seed && !pf.court_healer) bits.push('藥香似在提醒：路還在前方。');
    if (!bits.length) bits.push('墨夢紀事又多了一筆。');
    return bits[Math.floor(Math.random() * bits.length)];
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
    condOk: condOk,
    offlineBeat: offlineBeat
  };
})(typeof window !== 'undefined' ? window : globalThis);
