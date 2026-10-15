/* 青阡 · 秦王政元年世界軌道／編年／出身 */
(function (global) {
  'use strict';

  var ORIGINS = [
    { id: 'farm', name: '農家', desc: '阡陌耕讀，糧種略豐。', bag: { rice: 2, wheat: 1 }, skills: { farm: 1 }, gold: 10, people: 2 },
    { id: 'gentry', name: '士族', desc: '通文識禮，易結鄉賢。', bag: { flower: 1 }, skills: { lit: 1 }, gold: 20, fame: 4, people: 2 },
    { id: 'merchant', name: '商戶', desc: '貨殖門第，開局銀略厚。', bag: { flower: 2 }, skills: { trade: 1 }, gold: 40 },
    { id: 'soldier', name: '軍戶', desc: '編戶壯丁，體魄較佳。', bag: { wheat: 1 }, skills: { mart: 1 }, gold: 5, hp: 8 },
    { id: 'tradoc', name: '醫門', desc: '懸壺傳家，草藥稍備。', bag: { herb: 2 }, skills: { med: 1 }, gold: 15, people: 2 },
    { id: 'guest', name: '客籍', desc: '他鄉入秦，人情淡卻眼界闊。', bag: { rice: 1 }, skills: { trade: 1 }, gold: 25, fame: 2 },
    { id: 'exile', name: '罪謫後人', desc: '家門曾罹禍，民心難開，志或更堅。', bag: { wheat: 1 }, skills: { lit: 1 }, gold: 5, people: -4, fame: -2 },
    { id: 'artisan', name: '百工', desc: '作坊傳藝，礦石與手藝並重。', bag: { ore: 2, wheat: 1 }, skills: { craft: 1 }, gold: 18 },
    { id: 'clerk', name: '小吏後', desc: '刀筆門第，略通官樣文書。', bag: { flower: 1, wheat: 1 }, skills: { lit: 1 }, gold: 22, fame: 3 },
    { id: 'shaman', name: '巫祝後', desc: '里社香火，辨草問兆略知一二。', bag: { herb: 2, flower: 1 }, skills: { med: 1 }, gold: 12, people: 1 },
    { id: 'fallennoble', name: '沒落公族', desc: '舊門餘輝，名尚在而囊漸空。', bag: { flower: 2 }, skills: { lit: 1 }, gold: 8, fame: 8 },
    { id: 'outlaw', name: '草莽遺脈', desc: '野路出身，拳腳硬、鄉望薄。', bag: { wheat: 1, herb: 1 }, skills: { mart: 1 }, gold: 12, people: -2, hp: 6 },
    { id: 'steppe', name: '塞外歸附', desc: '自邊市入關，口音異而眼界闊。', bag: { ore: 1, flower: 1 }, skills: { trade: 1 }, gold: 28, fame: 2 }
  ];

  var GENDERS = [
    { id: 'm', name: '男' },
    { id: 'f', name: '女' },
    { id: 'x', name: '不顯' }
  ];

  /* 秦王政剛即位：約公元前 247／秦王政元年。遊戲內 28 日＝一季，四季＝一年。 */
  function yearNum(day) {
    day = Math.max(1, day | 0);
    return 1 + Math.floor((day - 1) / 112);
  }
  function seasonOf(day) {
    var SEASONS = ['春', '夏', '秋', '冬'];
    return SEASONS[Math.floor((day - 1) / 28) % 4];
  }
  function dayInSeason(day) {
    return ((day - 1) % 28) + 1;
  }
  function eraLabel(day) {
    var y = yearNum(day);
    var s = seasonOf(day);
    if (y <= 1) return '秦王政元年·' + s;
    if (y === 2) return '秦王政二年·' + s;
    if (y === 3) return '秦王政三年·' + s;
    return '秦王政' + y + '年·' + s;
  }
  function dayLabel(day) {
    return eraLabel(day) + ' · 第' + dayInSeason(day) + '日';
  }

  /* 史實摘要表：dayMin 觸發窗口；flags 可被玩家改寫後標「史已改」 */
  var CHRONICLE = [
    { id: 'ascend', dayMin: 1, dayMax: 8, title: '少年秦王即位',
      hist: '莊襄王薨，公子政立，年尚幼。呂不韋為相邦，號「仲父」，總攬國事。太后居深宮，朝野多仰呂門。',
      free: '咸陽新人主，相邦府車馬如織。鄉野尚不知王庭風向，只覺賦役與往年無異。',
      faction: { lu: 2, qin: 1 } },
    { id: 'lu_power', dayMin: 10, dayMax: 22, title: '呂氏權傾',
      hist: '相邦門客三千，貨殖遍關中。客卿多附呂門；王府內史雖執法，亦多觀望。',
      free: '市井多議相邦府買賣。有人說呂黨能通天，有人說少年王未必久居人下。',
      faction: { lu: 3 } },
    { id: 'zhengguo_rumor', dayMin: 18, dayMax: 35, title: '水工入秦傳聞',
      hist: '韓人鄭國入秦，議開渠灌田——或曰疲秦之計，或曰利農之策。關中農家側耳。',
      free: '有客自韓來，談溝渠與畝產。田莊若擴，或可借水工之勢。',
      flagHint: 'zhengguo',
      faction: { qin: 1, lu: 1 } },
    { id: 'six_states', dayMin: 25, dayMax: 45, title: '六國尚存',
      hist: '韓魏趙楚燕齊並立，合縱之議時起時滅。秦以遠交近攻為策，邊關戒嚴。',
      free: '驛道多外國口音。合縱連橫之說，酒肆書塾皆有人爭。',
      faction: { sai: 1, qin: 1 } },
    { id: 'laoai_shadow', dayMin: 40, dayMax: 70, title: '太后宮暗湧',
      hist: '太后寵信漸移，宮外有私門養士之風。相邦與后黨暗中較勁，少年王冷眼旁觀。',
      free: '太后宮外多生人出入。民間竊語：深宮之爭，或波及里閭賦役。',
      flagHint: 'laoai',
      faction: { lu: -1, qin: 1 } },
    { id: 'lis_rise', dayMin: 55, dayMax: 90, title: '客卿議法',
      hist: '楚人李斯遊說入秦，倡強王權、弱私門。呂黨門下始有不安。',
      free: '書塾與客館多談「法術勢」。有人勸你結客卿，有人勸你遠朝爭。',
      flagHint: 'lisi',
      faction: { qin: 2, lu: -1 } },
    { id: 'king_eyes', dayMin: 70, dayMax: 112, title: '秦王漸親政之兆',
      hist: '王年漸長，問政漸頻。相邦雖仍總事，朝會已見少年王目光如炬。',
      free: '王府差遣增多，編戶清查更密。獨立耕織者亦感官府眼線。',
      flagHint: 'qin_rule',
      faction: { qin: 3, lu: -2 } },
    { id: 'year2_canal', dayMin: 113, dayMax: 150, title: '渠議再起',
      hist: '鄭國渠工程議論再熱。農田水利關乎軍糧，王廷與相邦府皆不可忽視。',
      free: '河津與田莊之間，多見量水之人。你若囤糧擴田，或逢其時。',
      faction: { qin: 1, people: 1 } },
    { id: 'border_press', dayMin: 30, dayMax: 200, title: '邊關風硬',
      hist: '匈奴與戎狄時擾北境，軍營徵壯丁。邊市互市或開或禁，視朝廷脾氣。',
      free: '邊塞要刀、要藥、要糧。遊俠與賈人皆視邊關為險途與財路。',
      faction: { sai: 1, qin: 1 } }
  ];

  /* 可對話秦人／鄉野／賓客。face 複用既有 Q 版頭像鍵。 */
  var CAST = [
    /* 鄉野原班 */
    { id: 'he', name: '何伯', role: '里正', face: 'scholar', faction: 'qin', likes: ['rice', 'wheat'], giftBoost: 10, bio: '編戶之長，公事公辦。',
      lines: ['里中諸事，皆在我眼。', '春耕勿怠，秋穫有望。', '日令之單，速去市井交來。'] },
    { id: 'su', name: '蘇娘', role: '藥婆', face: 'doctor', faction: null, likes: ['herb', 'flower'], giftBoost: 12, bio: '村里青廬，治傷採藥。',
      lines: ['草藥貴在新鮮。', '你若傷了，來廬中坐坐。', '回春散一味，可解小恙。'] },
    { id: 'zhao', name: '趙三郎', role: '行商', face: 'merchant', faction: 'lu', likes: ['flower', 'ore'], giftBoost: 11, bio: '往來咸陽與邊市的賈人。',
      lines: ['坊市行情，朝夕不同。', '珍貨來得快，銀兩去得也快。', '與我交好，買賣可讓三分。'] },
    { id: 'lin', name: '林嫂', role: '田戶', face: 'farmer_f', faction: null, likes: ['veg', 'rice'], giftBoost: 9, bio: '田莊鄰里，勤於稼穡。',
      lines: ['田裏一雙手，勝似空談。', '孩子們都去幫你澆水了。', '收成好，心就安。'] },
    { id: 'wu', name: '伍叔', role: '守望', face: 'soldier', faction: 'qin', likes: ['wheat', 'ore'], giftBoost: 10, bio: '退役壯丁，守村夜望。',
      lines: ['校場刀槍，不可疏忽。', '山野有匪，入夜早歸。', '壯丁齊心，里中自安。'] },
    { id: 'cheng', name: '成郎', role: '書生', face: 'farmer_m', faction: null, likes: ['flower', 'wheat'], giftBoost: 8, bio: '半耕半讀的少年。',
      lines: ['讀得半卷，耕得半畝。', '名聲這東西，靠一行一行走。', '願聞君近日見聞。'] },
    /* 王廷／權貴 */
    { id: 'yingzheng', name: '嬴政', role: '秦王', face: 'scholar', faction: 'qin', likes: ['wheat', 'ore'], giftBoost: 6, bio: '少年秦王，剛即位。目光沉靜，喜惡難測。',
      lines: ['寡人年幼，國事多問仲父。', '邊野亦是秦土。', '你……有何能事？'], meet: 'palace' },
    { id: 'lubuwei', name: '呂不韋', role: '相邦', face: 'merchant', faction: 'lu', likes: ['flower', 'ore'], giftBoost: 8, bio: '相邦仲父，門客三千，貨殖通天。',
      lines: ['奇貨可居，人才亦然。', '為秦開疆，亦為門下謀食。', '君若有才，相邦府不拒客。'], meet: 'xiangbang' },
    { id: 'zhaoji', name: '趙姬', role: '太后', face: 'farmer_f', faction: 'lu', likes: ['flower', 'herb'], giftBoost: 7, bio: '太后，深宮主人。寵信與猜忌並存。',
      lines: ['宮外之事，寡人亦有耳目。', '政兒尚幼，莫教他受委屈。', '你進宮，所為何事？'], meet: 'taihou' },
    { id: 'laoai', name: '嫪毐', role: '太后倖臣', face: 'soldier', faction: 'lu', likes: ['wheat', 'ore'], giftBoost: 5, bio: '後起私門，養士尚淺，氣焰已露。年深日久方顯。',
      lines: ['太后面前，少多嘴。', '私門亦需刀槍與糧。', '你是哪一路的？'], meet: 'taihou', unlockDay: 35 },
    { id: 'lisi', name: '李斯', role: '客卿', face: 'scholar', faction: 'qin', likes: ['flower', 'wheat'], giftBoost: 9, bio: '楚人入秦，倡法術勢，欲強王權。',
      lines: ['私門不除，王權難張。', '倉廩實而知禮節——農戰不可廢。', '願聞君在邊野所見。'], meet: 'keguan', unlockDay: 20 },
    { id: 'wangjian', name: '王翦', role: '將門子弟', face: 'soldier', faction: 'qin', likes: ['ore', 'wheat'], giftBoost: 8, bio: '頻陽將門後，少年時已習兵。',
      lines: ['兵者，詭道也——亦重糧道。', '校場一日，邊關一年。', '壯士何必獨耕？'], meet: 'ying' },
    { id: 'mengtian', name: '蒙恬', role: '少年軍候', face: 'soldier', faction: 'qin', likes: ['ore', 'herb'], giftBoost: 8, bio: '蒙氏子弟，年少已隨營見習。',
      lines: ['北境風硬，刀要快。', '軍令如山，情面次之。', '你可曾出過塞？'], meet: 'frontier' },
    { id: 'mengyi', name: '蒙毅', role: '少年文吏', face: 'scholar', faction: 'qin', likes: ['flower', 'wheat'], giftBoost: 8, bio: '蒙恬之弟，偏習律令文書。',
      lines: ['刀筆亦可安邦。', '兄長在邊，我在文書案前。', '願讀君近日見聞。'], meet: 'guowei' },
    { id: 'changping', name: '昌平君', role: '楚公子', face: 'merchant', faction: 'sai', likes: ['flower', 'ore'], giftBoost: 7, bio: '楚國公子質秦，交遊廣。',
      lines: ['秦楚之間，人情比刀槍軟。', '客館夜談，勝過朝會議政。', '君若通邊市，或有一天用得上我。'], meet: 'keguan' },
    { id: 'changwen', name: '昌文君', role: '楚公子', face: 'scholar', faction: 'sai', likes: ['wheat', 'flower'], giftBoost: 7, bio: '與昌平君同質於秦，性較沉靜。',
      lines: ['讀書可以知進退。', '合縱之議，紙上談兵多。', '邊野之人，反而老實。'], meet: 'keguan' },
    { id: 'chengjiao', name: '成蟜', role: '長安君', face: 'farmer_m', faction: 'qin', likes: ['rice', 'wheat'], giftBoost: 6, bio: '秦王異母弟，封長安君。少年氣盛。',
      lines: ['王兄尚幼，國事卻重。', '我亦有部曲，不必事事問相邦。', '你從哪一鄉來？'], meet: 'palace' },
    { id: 'zhengguo', name: '鄭國', role: '水工', face: 'farmer_m', faction: null, likes: ['rice', 'herb'], giftBoost: 10, bio: '韓水工，入秦議渠。或疲秦，或利農——難說。',
      lines: ['水可灌田，亦可誤國——看人怎用。', '關中若得渠，畝產倍之。', '田戶之言，我願聽。'], meet: 'hejin', unlockDay: 12 },
    { id: 'hanfei_scroll', name: '韓非簡', role: '書翰傳聞', face: 'scholar', faction: null, likes: ['flower', 'wheat'], giftBoost: 5, bio: '韓公子非之書簡流傳（其人尚未至秦）。可於書塾讀其殘篇。',
      lines: ['法、術、勢——三者不可廢。', '此簡自韓傳來，真偽難辨。', '讀之可明君臣之際。'], meet: 'academy' },
    /* 職吏／市井／外族 */
    { id: 'tingzhang', name: '亭長', role: '亭長', face: 'soldier', faction: 'qin', likes: ['wheat', 'rice'], giftBoost: 9, bio: '亭驛治安小吏。',
      lines: ['夜不閉戶是夢想，鎖好門是本分。', '匪跡報我，莫自找。', '公文往來，誤不得。'], meet: 'post' },
    { id: 'sefu', name: '鄉嗇夫', role: '嗇夫', face: 'scholar', faction: 'qin', likes: ['rice', 'veg'], giftBoost: 9, bio: '主一鄉賦役會計。',
      lines: ['編戶口數，一筆一畫。', '逃役可惡，荒年可憫。', '你的田畝，我有冊。'], meet: 'village' },
    { id: 'shili', name: '市吏', role: '市吏', face: 'merchant', faction: 'qin', likes: ['ore', 'flower'], giftBoost: 8, bio: '關市校度量、征市租。',
      lines: ['尺秤不平，市則亂。', '關市稅——能少則少，不能無。', '賈人嘴甜，吏眼要硬。'], meet: 'guanshi' },
    { id: 'junhou', name: '軍候', role: '軍候', face: 'soldier', faction: 'qin', likes: ['ore', 'wheat'], giftBoost: 8, bio: '軍營基層武官。',
      lines: ['校場出汗，戰場少流血。', '糧草先於刀槍。', '壯丁若來投，我記一筆。'], meet: 'ying' },
    { id: 'yiguan', name: '醫官', role: '太醫署吏', face: 'doctor', faction: null, likes: ['herb', 'flower'], giftBoost: 11, bio: '出入宮城與藥廬之間。',
      lines: ['宮中要好藥，民間亦要活。', '草藥真偽，我一嗅便知。', '義診——偶可為之。'], meet: 'clinic' },
    { id: 'guren', name: '賈人馮', role: '關市賈', face: 'merchant', faction: 'lu', likes: ['flower', 'ore'], giftBoost: 10, bio: '呂門外圍貨商。',
      lines: ['相邦府要貨，我辦貨。', '邊市皮毛換關中絲帛。', '銀兩說話，比王法快。'], meet: 'guanshi' },
    { id: 'gongjiang', name: '工匠頭石', role: '百工', face: 'farmer_m', faction: null, likes: ['ore', 'wheat'], giftBoost: 10, bio: '礦坑與兵器作坊之間的把頭。',
      lines: ['礦石不好，刀劍就脆。', '官府徵工，私活也要做。', '你有礦，我有手藝。'], meet: 'mine' },
    { id: 'youxia', name: '遊俠荊', role: '遊俠', face: 'soldier', faction: 'sai', likes: ['herb', 'ore'], giftBoost: 9, bio: '輕俠好義，游走邊塞酒肆。',
      lines: ['不平則鳴——有時鳴得太響。', '邊塞夜路，我熟。', '你若被官府盯上，或可找我。'], meet: 'tavern' },
    { id: 'sai_envoy', name: '匈奴使節', role: '外族使', face: 'merchant', faction: 'sai', likes: ['ore', 'flower'], giftBoost: 7, bio: '邊市互市之匈奴使者（質譯）。',
      lines: ['馬快、皮厚、酒烈。', '互市開關，兩邊都有人笑。', '秦法到不了的地方，馬蹄到。'], meet: 'frontier' },
    { id: 'chu_envoy', name: '楚使', role: '六國使者', face: 'scholar', faction: 'sai', likes: ['flower', 'wheat'], giftBoost: 7, bio: '楚國使團隨員，客居咸陽。',
      lines: ['合縱若成，秦亦忌三分。', '客館夜長，宜飲酒。', '邊野之人，意外地有趣。'], meet: 'keguan' },
    { id: 'qi_guest', name: '齊客', role: '賓客', face: 'merchant', faction: 'lu', likes: ['flower', 'rice'], giftBoost: 8, bio: '齊地富商遊秦，喜結客。',
      lines: ['臨淄之富，不在刀而在市。', '呂相邦識貨，我亦識人。', '一席酒，勝過十封書。'], meet: 'tavern' },
    { id: 'neishi', name: '內史小吏', role: '內史吏', face: 'scholar', faction: 'qin', likes: ['wheat', 'rice'], giftBoost: 6, bio: '王府辦事小吏，目光勢利。',
      lines: ['編戶自便——但要造冊。', '相邦府的令，與王府的令，有時打架。', '你名聲若起，自然有人來找。'], meet: 'xianyang' },
    { id: 'menke', name: '呂門舍人程', role: '舍人', face: 'merchant', faction: 'lu', likes: ['flower', 'ore'], giftBoost: 9, bio: '呂不韋門客，專事招攬。',
      lines: ['奇貨可居，說的就是你這種人。', '入門下，銀貨人情皆通。', '婉拒也可以——下次再來。'], meet: 'xiangbang' }
  ];

  function originById(id) {
    for (var i = 0; i < ORIGINS.length; i++) if (ORIGINS[i].id === id) return ORIGINS[i];
    return ORIGINS[0];
  }

  function ensureWorld(S) {
    if (!S) return S;
    if (!S.hero) S.hero = { name: S.name || '旅人', gender: 'x', origin: 'farm', goal: '' };
    if (!S.worldMode) S.worldMode = 'history'; /* history | free */
    if (!S.chronicle) S.chronicle = [];
    if (!S.histFlags) S.histFlags = {};
    if (!S.diverged) S.diverged = [];
    if (!S.seenChronicle) S.seenChronicle = {};
    if (S.eraYear == null) S.eraYear = yearNum(S.day || 1);
    return S;
  }

  function applyOrigin(st, originId) {
    var o = originById(originId);
    st.hero = st.hero || {};
    st.hero.origin = o.id;
    st.gold = (st.gold || 0) + (o.gold || 0);
    if (o.hp) { st.hp = (st.hp || 80) + o.hp; st.maxHp = (st.maxHp || 80) + o.hp; }
    if (o.fame) st.fame = Math.max(0, (st.fame || 0) + o.fame);
    if (o.people) st.people = Math.max(0, (st.people || 8) + o.people);
    if (o.bag) {
      Object.keys(o.bag).forEach(function (k) {
        st.bag[k] = (st.bag[k] || 0) + o.bag[k];
      });
    }
    if (o.skills) {
      Object.keys(o.skills).forEach(function (k) {
        st.skills[k] = (st.skills[k] || 0) + o.skills[k];
      });
    }
    /* v45：出身影響後續劇情／勢力起點 */
    if (!st.flags) st.flags = {};
    if (!st.plotFlags) st.plotFlags = {};
    if (!st.factions) st.factions = { lu: 0, qin: 0, sai: 0 };
    st.flags.origin_id = o.id;
    st.plotFlags['origin_' + o.id] = 1;
    if (o.id === 'tradoc' || o.id === 'shaman') st.plotFlags.healer_lean = 1;
    if (o.id === 'merchant' || o.id === 'guest' || o.id === 'steppe') st.plotFlags.trade_lean = 1;
    if (o.id === 'soldier' || o.id === 'outlaw') st.plotFlags.martial_lean = 1;
    if (o.id === 'gentry' || o.id === 'clerk' || o.id === 'fallennoble') st.plotFlags.lit_lean = 1;
    if (o.id === 'artisan') st.plotFlags.craft_lean = 1;
    if (o.id === 'exile') st.plotFlags.exile_mark = 1;
    if (o.id === 'clerk') st.factions.qin = (st.factions.qin || 0) + 4;
    if (o.id === 'merchant' || o.id === 'guest') st.factions.lu = (st.factions.lu || 0) + 3;
    if (o.id === 'steppe' || o.id === 'outlaw') st.factions.sai = (st.factions.sai || 0) + 4;
    if (o.id === 'soldier') st.factions.qin = (st.factions.qin || 0) + 3;
    if (o.id === 'fallennoble') st.factions.qin = (st.factions.qin || 0) + 2;
    return st;
  }

  function markDiverge(S, id, note) {
    ensureWorld(S);
    if (S.histFlags[id]) return;
    S.histFlags[id] = 'changed';
    S.diverged.push({ id: id, note: note, day: S.day });
    if (S.diverged.length > 40) S.diverged = S.diverged.slice(-40);
  }

  function pushChronicle(S, entry, text, changed) {
    ensureWorld(S);
    S.chronicle.unshift({
      id: entry.id,
      title: entry.title,
      text: text,
      day: S.day,
      changed: !!changed,
      at: eraLabel(S.day)
    });
    if (S.chronicle.length > 30) S.chronicle = S.chronicle.slice(0, 30);
    S.seenChronicle[entry.id] = true;
  }

  function pickChronicle(S) {
    ensureWorld(S);
    var day = S.day || 1;
    var free = S.worldMode === 'free';
    var pool = [];
    for (var i = 0; i < CHRONICLE.length; i++) {
      var e = CHRONICLE[i];
      if (S.seenChronicle[e.id]) continue;
      if (day < e.dayMin || day > e.dayMax) continue;
      // free mode: skip some historical beats randomly
      if (free && Math.random() < 0.55) continue;
      pool.push(e);
    }
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function tick(S, factionsApi) {
    ensureWorld(S);
    S.eraYear = yearNum(S.day);
    var entry = pickChronicle(S);
    var line = '';
    if (entry) {
      var changed = !!(entry.flagHint && S.histFlags[entry.flagHint] === 'changed');
      var text = (S.worldMode === 'free' ? entry.free : entry.hist);
      if (changed) text = '【史已改】' + text + '——因你介入，軌跡偏移。';
      pushChronicle(S, entry, text, changed);
      if (entry.faction && factionsApi) {
        Object.keys(entry.faction).forEach(function (k) {
          var n = entry.faction[k];
          if (S.worldMode === 'free') n = Math.round(n * 0.4);
          if (k === 'people') factionsApi.bump(S, 'people', n);
          else factionsApi.bump(S, k, n);
        });
      }
      line = entry.title + '：' + text.slice(0, 48) + (text.length > 48 ? '…' : '');
      S.worldLine = (changed ? '【史已改】' : '') + entry.title + '·' + (S.worldMode === 'free' ? '自由軌道' : '史實軌道');
    } else if (S.worldMode === 'free' && Math.random() < 0.25) {
      var rum = [
        '邊野流民聚於關市，議論賦役。',
        '相邦府夜宴，門客爭寵。',
        '王府小吏清查編戶，鄉里不安。',
        '匈奴使節滯於邊市，要開互市。',
        '書塾傳抄韓非殘簡，少年爭讀。'
      ];
      var r = rum[Math.floor(Math.random() * rum.length)];
      S.chronicle.unshift({ id: 'free_' + S.day, title: '自由動向', text: r, day: S.day, changed: false, at: eraLabel(S.day) });
      if (S.chronicle.length > 30) S.chronicle = S.chronicle.slice(0, 30);
      line = r;
      S.worldLine = '自由世界·' + r.slice(0, 20);
    }
    return line;
  }

  function heroContext(S) {
    ensureWorld(S);
    var h = S.hero || {};
    var o = originById(h.origin || 'farm');
    var g = h.gender === 'm' ? '男' : (h.gender === 'f' ? '女' : '不顯');
    var careerBit = S.career ? ('，職業鍵' + S.career) : '';
    return '姓名' + (h.name || S.name || '旅人') + '，性別' + g +
      (h.disguise === 'male' && h.gender === 'f' ? '（現女扮男裝）' : (h.disguise === 'female' && h.gender === 'm' ? '（現男扮女裝）' : '')) +
      '，出身' + o.name + careerBit +
      (h.goal ? '，志向「' + h.goal + '」' : '') +
      '，世界模式：' + (S.worldMode === 'free' ? '高度自由' : '史實軌道');
  }

  function npcUnlocked(n, S) {
    if (!n.unlockDay) return true;
    return (S && S.day || 1) >= n.unlockDay;
  }

  function castForTalk(S) {
    return CAST.filter(function (n) { return npcUnlocked(n, S); });
  }

  function worldModalHtml(S, escapeHtml) {
    ensureWorld(S);
    var mode = S.worldMode === 'free' ? '高度自由（史實權重低）' : '史實軌道（可被玩家改寫）';
    var h = S.hero || {};
    var o = originById(h.origin || 'farm');
    var g = h.gender === 'm' ? '男' : (h.gender === 'f' ? '女' : '不顯');
    var html = '';
    html += '<div class="quest-item"><strong>紀年</strong><p>' + escapeHtml(dayLabel(S.day || 1)) + '</p></div>';
    html += '<div class="quest-item"><strong>世界模式</strong><p>' + mode + '</p></div>';
    html += '<div class="quest-item"><strong>主角</strong><p>' + escapeHtml((h.name || S.name || '旅人') + ' · ' + g + ' · ' + o.name + (h.goal ? ' · 志：' + h.goal : '')) + '</p></div>';
    html += '<div class="quest-item"><strong>天下大勢</strong><p>' + escapeHtml(S.worldLine || '') + '</p></div>';
    if (S.diverged && S.diverged.length) {
      html += '<div class="quest-item"><strong>史已改</strong><ul class="tiny-list">' +
        S.diverged.slice().reverse().slice(0, 8).map(function (d) {
          return '<li>' + escapeHtml((d.at || dayLabel(d.day)) + ' · ' + d.note) + '</li>';
        }).join('') + '</ul></div>';
    }
    html += '<div class="quest-item"><strong>本年／近日天下</strong>';
    if (!S.chronicle.length) html += '<p class="muted">尚無編年。過日或 AUTO 後將推演動向。</p>';
    else {
      html += S.chronicle.slice(0, 8).map(function (c) {
        return '<div class="chron-item' + (c.changed ? ' changed' : '') + '"><b>' +
          (c.changed ? '【史已改】' : '') + escapeHtml(c.title) + '</b>' +
          '<span class="muted"> · ' + escapeHtml(c.at || '') + '</span>' +
          '<p>' + escapeHtml(c.text) + '</p></div>';
      }).join('');
    }
    html += '</div>';
    return html;
  }

  global.QianWorld = {
    ORIGINS: ORIGINS,
    GENDERS: GENDERS,
    CAST: CAST,
    CHRONICLE: CHRONICLE,
    yearNum: yearNum,
    eraLabel: eraLabel,
    dayLabel: dayLabel,
    seasonOf: seasonOf,
    ensure: ensureWorld,
    applyOrigin: applyOrigin,
    originById: originById,
    markDiverge: markDiverge,
    markDiverged: markDiverge,
    tick: tick,
    heroContext: heroContext,
    castForTalk: castForTalk,
    npcUnlocked: npcUnlocked,
    worldModalHtml: worldModalHtml
  };
})(window);
