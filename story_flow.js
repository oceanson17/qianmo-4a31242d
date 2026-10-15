/* 墨夢莊周 · v45 劇情主循環（支線目錄／出身職業門檻／jumpTo）
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
      } else if (Object.prototype.toString.call(want) === '[object Array]') {
        if (want.indexOf(got) < 0) return false;
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
      text: '村口風起。要踏上咸陽，你至少得留下兩樁「能被宮廷或市井記得」的痕跡：藥性、見聞、或一口能說服人的硬氣。\n（選擇會推進時辰，並改寫好感與旗標。出身與職業會開不同小路。）',
      choices: [
        { id: 'herb', text: '上山採藥（文字遭遇）', to: 'ch1_herb', if: { 'flags.ch1_herb_done': false } },
        { id: 'med', text: '往藥廬跟診', to: 'ch1_clinic', if: { 'flags.ch1_med_done': false } },
        { id: 'letter', text: '托人寫信自薦太醫署', to: 'ch1_letter', if: { 'flags.ch1_letter_done': false } },
        { id: 'mkt', text: '市井打聽咸陽缺什麼人', to: 'ch1_market', if: { 'flags.ch1_mkt_done': false } },
        { id: 'rest', text: '回陋室歇息，過一時', to: 'ch1_rest' },
        { id: 'vil_side', text: '村中支線：幫林嫂運糧', to: 'side_vil_grain', if: { 'flags.side_vil_grain': false } },
        { id: 'drill_side', text: '【出身／職業】幫伍叔巡夜／校場幫哨', to: 'side_drill_help',
          if: function (S) {
            if (S.flags && S.flags.side_drill) return false;
            var o = (S.hero && S.hero.origin) || '';
            var c = S.career || '';
            return /^(soldier|outlaw)$/.test(o) || /^(soldier|boatman|ranger|hunter)$/.test(c);
          } },
        { id: 'herb_side', text: '【出身／職業】辨認毒草一束', to: 'side_witch_herb',
          if: function (S) {
            if (S.flags && S.flags.side_witch) return false;
            var o = (S.hero && S.hero.origin) || '';
            var c = S.career || '';
            return /^(tradoc|shaman)$/.test(o) || /^(healer|herbalist|diviner)$/.test(c);
          } },
        { id: 'craft_side', text: '【出身／職業】替渠量修水車軸', to: 'side_canal_labor',
          if: function (S) {
            if (S.flags && S.flags.side_canal) return false;
            var o = (S.hero && S.hero.origin) || '';
            var c = S.career || '';
            return o === 'artisan' || /^(craftsman|smith)$/.test(c);
          } },
        { id: 'exile_side', text: '【罪謫後人】洗名貼告於里門', to: 'side_exile_mark',
          if: { 'flags.side_exile': false, 'hero.origin': 'exile' } },
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
    side_vil_grain: {
      id: 'side_vil_grain', chapter: 'side', speaker: '林嫂', bg: 'farm',
      text: '林嫂抹汗：「糧袋要運到里倉，人手不夠。你若來幫，後日耕具我借你；若趁機扣下一袋——我也未必查得清。」',
      choices: [
        { id: 'a', text: '老實運完', to: 'ch1_hub', set: { 'flags.side_vil_grain': 1, 'plotFlags.side_honest': 1, 'aff:lin': 5 }, reward: { people: 3, food: 2 }, advance: 'period' },
        { id: 'b', text: '扣下一袋（險）', to: 'ch1_hub', set: { 'flags.side_vil_grain': 1, 'plotFlags.side_theft': 1, 'aff:lin': -3 }, reward: { food: 4, people: -2 }, advance: 'period' },
        { id: 'c', text: '改叫里中少年來幫', to: 'ch1_hub', set: { 'flags.side_vil_grain': 1, 'aff:lin': 2, 'aff:cheng': 1 }, reward: { people: 1 }, advance: 'period' }
      ]
    },
    side_drill_help: {
      id: 'side_drill_help', chapter: 'side', speaker: '伍叔', bg: 'drill',
      text: '伍叔把木矛往你手心一塞：「夜巡兩更。軍戶／武業出身的，腿腳該懂。遇見生人，先喊口令——別先動手。」',
      choices: [
        { id: 'a', text: '認真巡完，帶回一點聲息', to: 'ch1_hub', set: { 'flags.side_drill': 1, 'plotFlags.martial_lean': 1, 'aff:wu': 5, 'access.ying': true }, reward: { fame: 2, people: 1 }, advance: 'period' },
        { id: 'b', text: '偷懶歇在草垛', to: 'ch1_hub', set: { 'flags.side_drill': 1, 'aff:wu': -2 }, reward: { hp: 4 }, advance: 'period' },
        { id: 'c', text: '教里中少年一同巡', to: 'ch1_hub', set: { 'flags.side_drill': 1, 'aff:wu': 3, 'aff:cheng': 2 }, reward: { people: 2 }, advance: 'period' }
      ]
    },
    side_witch_herb: {
      id: 'side_witch_herb', chapter: 'side', speaker: '蘇娘', bg: 'clinic',
      text: '蘇娘攤開兩束似是而非的葉：「醫門／採藥／巫祝的眼，該分得出——哪束救命，哪束要命。」',
      choices: [
        { id: 'a', text: '正確辨出毒草', to: 'ch1_hub', set: { 'flags.side_witch': 1, 'plotFlags.healer_seed': 1, 'plotFlags.healer_lean': 1, 'aff:su': 6 }, reward: { fame: 3, bag: { herb: 2 } }, advance: 'period' },
        { id: 'b', text: '拿不準，請她指點', to: 'ch1_hub', set: { 'flags.side_witch': 1, 'plotFlags.healer_seed': 1, 'aff:su': 3 }, reward: { bag: { herb: 1 }, fame: 1 }, advance: 'period' },
        { id: 'c', text: '誤認——被她敲手背', to: 'ch1_hub', set: { 'flags.side_witch': 1, 'aff:su': 1 }, reward: { hp: -2, bag: { herb: 1 } }, advance: 'period' }
      ]
    },
    side_canal_labor: {
      id: 'side_canal_labor', chapter: 'side', speaker: '工匠頭石', bg: 'hejin',
      text: '石把頭拍水車軸：「百工／工匠的手，不該只會空談。替我修這軸——渠議若起，關中記得幫忙的人。」',
      choices: [
        { id: 'a', text: '修好並記下尺寸', to: 'ch1_hub', set: { 'flags.side_canal': 1, 'plotFlags.craft_lean': 1, 'plotFlags.zhengguo_hint': 1, 'aff:gongjiang': 5 }, reward: { fame: 2, gold: 8, bag: { ore: 1 } }, advance: 'period' },
        { id: 'b', text: '只換工錢，不多問', to: 'ch1_hub', set: { 'flags.side_canal': 1, 'aff:gongjiang': 2 }, reward: { gold: 14 }, advance: 'period' },
        { id: 'c', text: '建議改用別材（險被斥）', to: 'ch1_hub', set: { 'flags.side_canal': 1, 'plotFlags.craft_lean': 1, 'aff:gongjiang': 1 }, reward: { fame: 1 }, advance: 'period' }
      ]
    },
    side_exile_mark: {
      id: 'side_exile_mark', chapter: 'side', speaker: '何伯', bg: 'village',
      text: '何伯壓低聲：「罪謫之後，里門議論未散。你若肯在里門貼一紙自新告示——有人笑，有人讓三分。不貼，也有人永遠側目。」',
      choices: [
        { id: 'a', text: '貼告自新', to: 'ch1_hub', set: { 'flags.side_exile': 1, 'plotFlags.exile_cleared': 1, 'aff:he': 4 }, reward: { people: 4, fame: 2 }, advance: 'period' },
        { id: 'b', text: '不貼，以本事說話', to: 'ch1_hub', set: { 'flags.side_exile': 1, 'plotFlags.exile_proud': 1 }, reward: { fame: 3, people: -1 }, advance: 'period' },
        { id: 'c', text: '只私下請里正一頓酒', to: 'ch1_hub', set: { 'flags.side_exile': 1, 'aff:he': 2 }, reward: { gold: -6, people: 2 }, advance: 'period' }
      ]
    },
    side_sai_trade: {
      id: 'side_sai_trade', chapter: 'side', speaker: '匈奴使節', bg: 'frontier',
      text: '邊市風硬。使節（質譯）打量你：「塞外歸附／遊邊之人，懂馬價。這一車皮貨換關中帛——你幫腔，還是幫關吏？」',
      choices: [
        { id: 'a', text: '幫互市談成', to: 'xy_hub', set: { 'flags.side_sai': 1, 'flags.xy_side': 1, 'plotFlags.side_trade': 1, 'aff:sai_envoy': 5, 'factions.sai': 3 }, reward: { gold: 16, fame: 2 }, advance: 'period' },
        { id: 'b', text: '幫關吏嚴查', to: 'xy_hub', set: { 'flags.side_sai': 1, 'flags.xy_side': 1, 'plotFlags.side_strict': 1, 'factions.qin': 3 }, reward: { fame: 3, gold: 6 }, advance: 'period' },
        { id: 'c', text: '兩不得罪，只作證', to: 'xy_hub', set: { 'flags.side_sai': 1, 'flags.xy_side': 1 }, reward: { fame: 1 }, advance: 'period' }
      ]
    },
    side_clerk_doc: {
      id: 'side_clerk_doc', chapter: 'side', speaker: '內史小吏', bg: 'xianyang',
      text: '小吏把一卷半殘戶籍推過來：「小吏後／書吏的手，該識得官樣。幫我抄清三頁——抄錯，你擔；抄好，我記你一筆。」',
      choices: [
        { id: 'a', text: '仔細抄清', to: 'xy_hub', set: { 'flags.side_clerk': 1, 'flags.xy_side': 1, 'plotFlags.lit_lean': 1, 'aff:neishi': 4, 'factions.qin': 2 }, reward: { fame: 3, gold: 10 }, advance: 'period' },
        { id: 'b', text: '抄快，略有錯字', to: 'xy_hub', set: { 'flags.side_clerk': 1, 'flags.xy_side': 1, 'aff:neishi': 1 }, reward: { gold: 6 }, advance: 'period' },
        { id: 'c', text: '拒抄，怕惹禍', to: 'xy_hub', set: { 'flags.side_clerk': 1, 'flags.xy_side': 1 }, reward: { fame: 1 }, advance: 'period' }
      ]
    },
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
        { id: 'a2', text: '【醫門／醫者／採藥】以出身藥籍自薦', to: 'xy_taiyi_ok', set: { 'flags.visited_taiyi': 1, 'plotFlags.court_healer': 1, 'plotFlags.healer_seed': 1, 'aff:yiguan': 5 }, reward: { fame: 5 }, advance: 'period',
          if: function (S) {
            if (S.plotFlags && S.plotFlags.healer_seed) return false;
            var o = (S.hero && S.hero.origin) || '';
            var c = S.career || '';
            return /^(tradoc|shaman)$/.test(o) || /^(healer|herbalist)$/.test(c);
          } },
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
        { id: 'bribe_trade', text: '【商戶／商賈／客籍】薄賄門衙（銀18）', to: 'xy_palace_in', set: { 'access.palace': true, 'flags.visited_palace': 1, 'flags.palace_bribe': 1 }, reward: { gold: -18, fame: 2 }, advance: 'period',
          if: function (S) {
            if ((S.gold || 0) < 18) return false;
            var o = (S.hero && S.hero.origin) || '';
            var c = S.career || '';
            return /^(merchant|guest|steppe)$/.test(o) || /^(merchant|courier|agent)$/.test(c);
          } },
        { id: 'sneak_agent', text: '【細作／草莽】借夜影潛入（耗體）', to: 'xy_palace_in', set: { 'access.palace': true, 'flags.visited_palace': 1, 'flags.palace_sneak': 1 }, reward: { hp: -10, fame: 2 }, advance: 'period',
          if: function (S) {
            var o = (S.hero && S.hero.origin) || '';
            var c = S.career || '';
            return o === 'outlaw' || c === 'agent' || c === 'ranger';
          } },
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
      id: 'xy_side', chapter: 'side', speaker: '旁白', bg: 'market',
      text: '咸陽支線如蛛網。你可揀一樁淺事：市井人情、藥廬夜診、客館密語、關市皮貨，或書塾清談——每條路都會在旗標裡留痕，他日命運弧或因此叩門。',
      choices: [
        { id: 'mkt', text: '市井：幫賈人辯一樁假秤', to: 'side_scale', if: { 'flags.side_scale': false } },
        { id: 'clinic', text: '藥廬：夜診無名傷者', to: 'side_nightclinic', if: { 'flags.side_clinic': false } },
        { id: 'inn', text: '客館：聽楚齊口音密語', to: 'side_inn', if: { 'flags.side_inn': false } },
        { id: 'pass', text: '關市：護一車皮貨過卡', to: 'side_pass', if: { 'flags.side_pass': false } },
        { id: 'school', text: '書塾：與成郎辯「法與情」', to: 'side_school', if: { 'flags.side_school': false } },
        { id: 'letter', text: '驛道：代送一封無名書', to: 'side_letter', if: { 'flags.side_letter': false } },
        { id: 'sai', text: '【出身／職業】邊市換馬談皮貨', to: 'side_sai_trade',
          if: function (S) {
            if (S.flags && S.flags.side_sai) return false;
            var o = (S.hero && S.hero.origin) || '';
            var c = S.career || '';
            return /^(steppe|guest|outlaw)$/.test(o) || /^(ranger|courier|agent)$/.test(c);
          } },
        { id: 'clerk', text: '【出身／職業】幫抄半殘戶籍', to: 'side_clerk_doc',
          if: function (S) {
            if (S.flags && S.flags.side_clerk) return false;
            var o = (S.hero && S.hero.origin) || '';
            var c = S.career || '';
            return /^(clerk|gentry|fallennoble)$/.test(o) || /^(scribe|scholar|diviner)$/.test(c);
          } },
        { id: 'done', text: '（已遊數則）任意閒逛換薄利', to: 'side_wander', if: { 'flags.xy_side': true } },
        { id: 'back', text: '暫回咸陽樞紐', to: 'xy_hub' }
      ]
    },
    side_scale: {
      id: 'side_scale', chapter: 'side', speaker: '賈人馮', bg: 'market',
      text: '坊市喧嚷。賈人馮拉你袖：「鄰攤假秤坑人。你若敢當眾拆穿，我記一筆人情；你若裝聾，銀兩也能塞你——選。」',
      choices: [
        { id: 'a', text: '當眾拆穿（民心＋）', to: 'xy_side', set: { 'flags.side_scale': 1, 'flags.xy_side': 1, 'plotFlags.side_justice': 1, 'aff:feng': 3 }, reward: { people: 4, fame: 2 }, advance: 'period' },
        { id: 'b', text: '收緘默銀，假作未見', to: 'xy_side', set: { 'flags.side_scale': 1, 'flags.xy_side': 1, 'plotFlags.side_greed': 1 }, reward: { gold: 18, people: -2 }, advance: 'period' },
        { id: 'c', text: '私下勸鄰攤改正', to: 'xy_side', set: { 'flags.side_scale': 1, 'flags.xy_side': 1, 'plotFlags.side_soft': 1, 'aff:feng': 1 }, reward: { fame: 1, people: 1 }, advance: 'period' }
      ]
    },
    side_nightclinic: {
      id: 'side_nightclinic', chapter: 'side', speaker: '蘇娘', bg: 'clinic',
      text: '青廬燈小。蘇娘低聲：「門外有人流血，不敢報官。你幫不幫？幫，便可能惹官差；不幫，今夜或死一命。」',
      choices: [
        { id: 'a', text: '救治並隱其姓名', to: 'xy_side', set: { 'flags.side_clinic': 1, 'flags.xy_side': 1, 'plotFlags.healer_seed': 1, 'plotFlags.side_shelter': 1, 'aff:su': 6 }, reward: { people: 3, fame: 2, bag: { herb: -1 } }, advance: 'period' },
        { id: 'b', text: '救治但報里正備案', to: 'xy_side', set: { 'flags.side_clinic': 1, 'flags.xy_side': 1, 'plotFlags.healer_seed': 1, 'aff:su': 2, 'aff:he': 2 }, reward: { fame: 3 }, advance: 'period' },
        { id: 'c', text: '不敢捲入，只留藥', to: 'xy_side', set: { 'flags.side_clinic': 1, 'flags.xy_side': 1, 'aff:su': -1 }, reward: { bag: { herb: -1 } }, advance: 'period' }
      ]
    },
    side_inn: {
      id: 'side_inn', chapter: 'side', speaker: '旁白', bg: 'keguan',
      text: '客館隔牆，楚齊口音壓得很低：「……王府要耳目，呂門要貨路，邊市要刀。」你聽得三分。要不要再近一步？',
      choices: [
        { id: 'a', text: '買一壺酒混入旁聽', to: 'xy_side', set: { 'flags.side_inn': 1, 'flags.xy_side': 1, 'plotFlags.side_spy': 1, 'flags.visited_keguan': 1 }, reward: { gold: -6, fame: 2 }, advance: 'period', if: { gold: 6 } },
        { id: 'b', text: '記住關鍵字，不上前', to: 'xy_side', set: { 'flags.side_inn': 1, 'flags.xy_side': 1, 'plotFlags.side_rumor': 1 }, reward: { fame: 1 }, advance: 'period' },
        { id: 'c', text: '故意撞翻燈，打斷密談', to: 'xy_side', set: { 'flags.side_inn': 1, 'flags.xy_side': 1, 'plotFlags.side_disrupt': 1 }, reward: { fame: 2, people: 1 }, advance: 'period' }
      ]
    },
    side_pass: {
      id: 'side_pass', chapter: 'side', speaker: '關吏', bg: 'guanshi',
      text: '關市風硬。一車皮貨卡在驗關。關吏打量你：「你作保，貨便過；出了事，連坐到你。」',
      choices: [
        { id: 'a', text: '作保放行（得商路）', to: 'xy_side', set: { 'flags.side_pass': 1, 'flags.xy_side': 1, 'access.guanshi': true, 'plotFlags.side_trade': 1, 'aff:zhao': 4 }, reward: { gold: 12, fame: 2 }, advance: 'period' },
        { id: 'b', text: '幫關吏細查，防夾帶', to: 'xy_side', set: { 'flags.side_pass': 1, 'flags.xy_side': 1, 'plotFlags.side_strict': 1, 'factions.qin': 2 }, reward: { fame: 3, gold: 5 }, advance: 'period' },
        { id: 'c', text: '不沾手', to: 'xy_side', set: { 'flags.side_pass': 1, 'flags.xy_side': 1 }, advance: 'period' }
      ]
    },
    side_school: {
      id: 'side_school', chapter: 'side', speaker: '成郎', bg: 'academy',
      text: '書塾午後。成郎問你：「法嚴則國強，情厚則民附——你走邊野，站哪一邊？」答覆會留下口舌與志向的痕跡。',
      choices: [
        { id: 'a', text: '法為骨，情為膚', to: 'xy_side', set: { 'flags.side_school': 1, 'flags.xy_side': 1, 'plotFlags.side_legal': 1, 'aff:cheng': 3, 'aff:lisi': 1 }, reward: { fame: 2 }, advance: 'period' },
        { id: 'b', text: '民心先於法條', to: 'xy_side', set: { 'flags.side_school': 1, 'flags.xy_side': 1, 'plotFlags.side_folk': 1, 'aff:cheng': 4 }, reward: { people: 3, fame: 1 }, advance: 'period' },
        { id: 'c', text: '兩者皆可權變', to: 'xy_side', set: { 'flags.side_school': 1, 'flags.xy_side': 1, 'plotFlags.side_flex': 1, 'aff:cheng': 2 }, reward: { fame: 2 }, advance: 'period' }
      ]
    },
    side_letter: {
      id: 'side_letter', chapter: 'side', speaker: '驛卒', bg: 'post',
      text: '驛道黃塵。驛卒塞你一封無署名的書：「送到咸陽客館西廂即可。莫拆。拆了——你自己擔。」',
      choices: [
        { id: 'a', text: '原封送達', to: 'xy_side', set: { 'flags.side_letter': 1, 'flags.xy_side': 1, 'plotFlags.side_courier': 1 }, reward: { gold: 10, fame: 1 }, advance: 'period' },
        { id: 'b', text: '私下拆閱再決定', to: 'side_letter_open', set: { 'flags.side_letter': 1, 'plotFlags.side_peek': 1 } },
        { id: 'c', text: '拒送，交回官驛', to: 'xy_side', set: { 'flags.side_letter': 1, 'flags.xy_side': 1, 'factions.qin': 1 }, reward: { fame: 2 }, advance: 'period' }
      ]
    },
    side_letter_open: {
      id: 'side_letter_open', chapter: 'side', speaker: '旁白', bg: 'post',
      text: '蠟封下只有一句：「仲父門下缺邊野眼線。」你捏著竹簡，忽然明白——這不是家書，是網。',
      choices: [
        { id: 'a', text: '仍送達，並記住線索', to: 'xy_side', set: { 'flags.xy_side': 1, 'plotFlags.side_courier': 1, 'plotFlags.lu_eye': 1, 'aff:lubuwei': 1 }, reward: { gold: 10, fame: 2 }, advance: 'period' },
        { id: 'b', text: '改投王府相關耳目', to: 'xy_side', set: { 'flags.xy_side': 1, 'plotFlags.side_leak_qin': 1, 'factions.qin': 3 }, reward: { fame: 3 }, advance: 'period' },
        { id: 'c', text: '燒了', to: 'xy_side', set: { 'flags.xy_side': 1, 'plotFlags.side_burn': 1 }, reward: { fame: 1 }, advance: 'period' }
      ]
    },
    side_wander: {
      id: 'side_wander', chapter: 'side', speaker: '旁白', bg: 'market',
      text: '你已走過多則支線。街市仍在運轉——薄利、見聞、與偶爾一閃的刀光。',
      choices: [
        { id: 'a', text: '再逛一時，換些碎銀', to: 'xy_hub', reward: { gold: 6, fame: 1 }, advance: 'period' },
        { id: 'b', text: '回樞紐', to: 'xy_hub' }
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

  /** 自由行動／腳本：直接跳到合法節點（不經選項） */
  function jumpTo(S, nodeId, opts) {
    ensure(S);
    opts = opts || {};
    if (!nodeId || !NODES[nodeId]) return { ok: false, toast: '節點不存在' };
    var from = S.storyFlow.nodeId;
    if (from === nodeId && !opts.force) {
      return { ok: true, same: true, node: NODES[nodeId], fromId: from };
    }
    S.storyFlow.started = true;
    S.storyFlow.nodeId = nodeId;
    if (!S.storyFlow.seen) S.storyFlow.seen = {};
    var seenKey = 'free::' + (from || '?') + '->' + nodeId;
    if (!S.storyFlow.seen[seenKey]) S.storyFlow.seen[seenKey] = 1;
    if (opts.set) applySet(S, opts.set);
    var next = NODES[nodeId];
    return {
      ok: true,
      jumped: true,
      fromId: from,
      nodeId: nodeId,
      line: next.text,
      speaker: next.speaker,
      bg: next.bg,
      node: next,
      toast: opts.toast || null
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


  var ORIGIN_OPEN = {
    farm: '袖間尚有麥芒刺——農家子弟的夢，也會撞上宮牆。',
    gentry: '案頭餘墨未乾。士族出身，進退之間多一分禮，也多一分自負。',
    merchant: '袖中銅錢輕響。商戶門第教你：人情與銀兩，往往同路。',
    soldier: '掌心還有校場繭。軍戶的血，聞刀風會醒。',
    tradoc: '藥香似從夢裡跟來。醫門子弟，先救人，再談名。',
    guest: '口音未盡改。客籍入秦，靠的是眼界，不是鄉黨。',
    exile: '里門曾有指點與竊語。罪謫之後，你學得更沉。',
    artisan: '指節有鍛打薄繭。百工人家，信手藝勝過空名。',
    clerk: '腦中還轉著官樣套語。小吏之後，懂文書亦懂眉眼。',
    shaman: '裡社香灰似還沾在袖。巫祝之後，問兆與辨草，本來同源。',
    fallennoble: '舊玉佩涼意入骨。沒落公族，名尚在，路要自己重新踩。',
    outlaw: '野路風還在領口。草莽遺脈，先活命，再談是非。',
    steppe: '邊市膻氣未散。塞外歸附者，馬背與互市，都是課本。'
  };
  var CAREER_OPEN = {
    farmer: '你想起田壟上的節奏——先把眼前一季過穩。',
    healer: '指尖還記得把脈的分寸。',
    merchant: '市聲在耳：貴買賤賣，先看人臉色。',
    soldier: '呼吸仍按校場鼓點。',
    scholar: '書卷氣未褪，進退思量比刀快。',
    craftsman: '鐺鐺爐響似還在夢外。',
    hunter: '山風氣味一閃而過。',
    ranger: '江湖路遠，名與刀都要自己背。',
    scribe: '刀筆比刀劍更先出鞘。',
    courier: '驛道塵土，似還沾在靴底。',
    smith: '爐火映過眼底一瞬。',
    agent: '你習慣先看門洞與退路。',
    boatman: '河津潮聲隱隱。',
    herbalist: '藥囊輕響，葉脈圖譜浮上心頭。',
    diviner: '一卦未成，先問自己要什麼結局。'
  };

  function decorateNode(S, node) {
    if (!S || !node) return node;
    var o = (S.hero && S.hero.origin) || 'farm';
    var c = S.career || '';
    var extra = [];
    if (node.id === 'pro_01' || node.id === 'pro_02') {
      if (ORIGIN_OPEN[o]) extra.push(ORIGIN_OPEN[o]);
      if (CAREER_OPEN[c]) extra.push(CAREER_OPEN[c]);
    }
    if (node.id === 'ch1_hub') {
      if (S.plotFlags && S.plotFlags.healer_lean) extra.push('（醫／藥出身：藥廬與太醫署小路更亮。）');
      if (S.plotFlags && S.plotFlags.martial_lean) extra.push('（武／軍出身：校場與門禁或有援。）');
      if (S.plotFlags && S.plotFlags.trade_lean) extra.push('（商／客出身：銀兩與關市更好說話。）');
      if (S.plotFlags && S.plotFlags.lit_lean) extra.push('（文／吏出身：書簡與官署更易近。）');
      if (S.plotFlags && S.plotFlags.craft_lean) extra.push('（百工出身：渠作與礦坊記得你的手。）');
      if (S.plotFlags && S.plotFlags.exile_mark) extra.push('（罪謫陰影未散：或可洗名，或可傲骨到底。）');
      if (S.plotFlags && S.plotFlags.agent_lean) extra.push('（細作路數：夜影與耳目是你的第二呼吸。）');
    }
    if (!extra.length) return node;
    var copy = {};
    for (var k in node) if (Object.prototype.hasOwnProperty.call(node, k)) copy[k] = node[k];
    copy.text = (node.text || '') + '\n' + extra.join('\n');
    return copy;
  }

  /** 支線目錄：供「支線」按鈕列出／跳轉 */
  var SIDE_CATALOG = [
    { id: 'side_vil_grain', title: '幫林嫂運糧', desc: '村中：運糧到里倉。', done: 'side_vil_grain', where: 'vil',
      boostOrigin: ['farm'], boostCareer: ['farmer'] },
    { id: 'side_drill_help', title: '巡夜／校場幫哨', desc: '軍戶／武業相關。', done: 'side_drill', where: 'vil',
      needOrigin: ['soldier', 'outlaw'], needCareer: ['soldier', 'boatman', 'ranger', 'hunter'],
      boostOrigin: ['soldier', 'outlaw'], boostCareer: ['soldier', 'boatman', 'ranger'] },
    { id: 'side_witch_herb', title: '辨認毒草', desc: '醫門／採藥／巫祝相關。', done: 'side_witch', where: 'vil',
      needOrigin: ['tradoc', 'shaman'], needCareer: ['healer', 'herbalist', 'diviner'],
      boostOrigin: ['tradoc', 'shaman'], boostCareer: ['healer', 'herbalist'] },
    { id: 'side_canal_labor', title: '修水車軸', desc: '百工／工匠相關。', done: 'side_canal', where: 'vil',
      needOrigin: ['artisan'], needCareer: ['craftsman', 'smith'],
      boostOrigin: ['artisan'], boostCareer: ['craftsman', 'smith'] },
    { id: 'side_exile_mark', title: '洗名貼告', desc: '罪謫後人專屬。', done: 'side_exile', where: 'vil',
      needOrigin: ['exile'], boostOrigin: ['exile'] },
    { id: 'side_scale', title: '市井假秤', desc: '咸陽：辯一樁假秤。', done: 'side_scale', where: 'xy',
      boostOrigin: ['merchant', 'guest'], boostCareer: ['merchant'] },
    { id: 'side_nightclinic', title: '藥廬夜診', desc: '咸陽：夜診無名傷者。', done: 'side_clinic', where: 'xy',
      boostOrigin: ['tradoc', 'shaman'], boostCareer: ['healer', 'herbalist'] },
    { id: 'side_inn', title: '客館密語', desc: '咸陽：聽楚齊口音。', done: 'side_inn', where: 'xy',
      boostOrigin: ['guest', 'steppe'], boostCareer: ['agent', 'courier', 'ranger'] },
    { id: 'side_pass', title: '關市皮貨', desc: '咸陽：護車過卡。', done: 'side_pass', where: 'xy',
      boostOrigin: ['merchant', 'steppe'], boostCareer: ['merchant', 'courier'] },
    { id: 'side_school', title: '書塾辯法', desc: '咸陽：與成郎辯法與情。', done: 'side_school', where: 'xy',
      boostOrigin: ['gentry', 'clerk', 'fallennoble'], boostCareer: ['scholar', 'scribe', 'diviner'] },
    { id: 'side_letter', title: '代送無名書', desc: '咸陽：驛道送信。', done: 'side_letter', where: 'xy',
      boostCareer: ['courier', 'scribe', 'agent'] },
    { id: 'side_sai_trade', title: '邊市換馬', desc: '塞外／遊邊相關。', done: 'side_sai', where: 'xy',
      needOrigin: ['steppe', 'guest', 'outlaw'], needCareer: ['ranger', 'courier', 'agent'],
      boostOrigin: ['steppe'], boostCareer: ['ranger', 'agent'] },
    { id: 'side_clerk_doc', title: '抄半殘戶籍', desc: '小吏／文業相關。', done: 'side_clerk', where: 'xy',
      needOrigin: ['clerk', 'gentry', 'fallennoble'], needCareer: ['scribe', 'scholar', 'diviner'],
      boostOrigin: ['clerk'], boostCareer: ['scribe'] }
  ];

  function listSides(S) {
    ensure(S);
    var o = (S.hero && S.hero.origin) || '';
    var c = S.career || '';
    var flags = S.flags || {};
    var inXy = !!(flags.visited_xianyang || flags.left_village);
    var out = [];
    for (var i = 0; i < SIDE_CATALOG.length; i++) {
      var s = SIDE_CATALOG[i];
      if (!NODES[s.id]) continue;
      var done = !!(flags[s.done]);
      var state = 'open';
      var lockReason = '';
      if (done) state = 'done';
      else {
        if (s.where === 'xy' && !inXy && !flags.visited_xianyang) {
          /* allow listing as locked until xianyang */
          state = 'locked';
          lockReason = '需先赴咸陽／離開村落';
        }
        if (s.needOrigin || s.needCareer) {
          var okO = s.needOrigin && s.needOrigin.indexOf(o) >= 0;
          var okC = s.needCareer && s.needCareer.indexOf(c) >= 0;
          if (!okO && !okC) {
            state = 'locked';
            lockReason = lockReason || '需對應出身或職業';
          }
        }
      }
      var boosted = false;
      if (s.boostOrigin && s.boostOrigin.indexOf(o) >= 0) boosted = true;
      if (s.boostCareer && s.boostCareer.indexOf(c) >= 0) boosted = true;
      /* 通用村支線在開局即可 */
      if (s.id === 'side_vil_grain' && state === 'locked' && !done) {
        state = 'open'; lockReason = '';
      }
      out.push({
        id: s.id, title: s.title, desc: s.desc, state: state,
        lockReason: lockReason, boosted: boosted, where: s.where
      });
    }
    return out;
  }

  global.QianStoryFlow = {
    NODES: NODES,
    ensure: ensure,
    begin: begin,
    getNode: getNode,
    visibleChoices: visibleChoices,
    applyChoice: applyChoice,
    jumpTo: jumpTo,
    sceneFor: sceneFor,
    validate: validate,
    summary: summary,
    condOk: condOk,
    offlineBeat: offlineBeat,
    listSides: listSides,
    decorateNode: decorateNode,
    SIDE_CATALOG: SIDE_CATALOG
  };
})(typeof window !== 'undefined' ? window : globalThis);
