/* 墨夢莊周 · 場景／模式表 + 一日節奏（v34） */
(function (global) {
  'use strict';

  var SCENE_ART = {
    farm:     { webp: 'assets/bg_busy_farm.webp', jpg: 'assets/bg_busy_farm.webp', alt: '田莊' },
    village:  { webp: 'assets/bg_village.webp', jpg: 'assets/bg_village.jpg', alt: '村落' },
    market:   { webp: 'assets/bg_capital.webp', jpg: 'assets/bg_capital.jpg', alt: '市井' },
    clinic:   { webp: 'assets/bg_clinic.webp',  jpg: 'assets/bg_clinic.jpg',  alt: '藥廬' },
    drill:    { webp: 'assets/bg_fields.webp',  jpg: 'assets/bg_fields.webp', alt: '校場' },
    wild:     { webp: 'assets/bg_cliff.webp',   jpg: 'assets/bg_cliff.jpg',   alt: '山野' },
    garden:   { webp: 'assets/bg_garden.webp',  jpg: 'assets/bg_garden.jpg',  alt: '園林' },
    swim:     { webp: 'assets/bg_swim.webp',    jpg: 'assets/bg_swim.jpg',    alt: '水塘' },
    moon:     { webp: 'assets/bg_moon.webp',    jpg: 'assets/bg_moon.jpg',    alt: '夜宴' },
    mine:     { webp: 'assets/bg_mine.webp',    jpg: 'assets/bg_mine.webp',   alt: '礦坑' },
    post:     { webp: 'assets/bg_post.webp',    jpg: 'assets/bg_post.webp',   alt: '驛道' },
    tavern:   { webp: 'assets/bg_tavern.webp',  jpg: 'assets/bg_tavern.webp', alt: '酒肆' },
    academy:  { webp: 'assets/bg_academy.webp', jpg: 'assets/bg_academy.webp',alt: '書塾' },
    frontier: { webp: 'assets/bg_frontier.webp',jpg: 'assets/bg_frontier.webp',alt: '邊關' },
    xianyang: { webp: 'assets/bg_xianyang.webp', jpg: 'assets/bg_xianyang.webp', alt: '咸陽' },
    palace:   { webp: 'assets/bg_palace.webp', jpg: 'assets/bg_palace.webp', alt: '宮城外' },
    xiangbang:{ webp: 'assets/bg_xiangbang.webp', jpg: 'assets/bg_xiangbang.webp', alt: '相邦府' },
    taihou:   { webp: 'assets/bg_taihou.webp', jpg: 'assets/bg_taihou.webp', alt: '太后宮外' },
    guowei:   { webp: 'assets/bg_guowei.webp', jpg: 'assets/bg_guowei.webp', alt: '國尉府' },
    keguan:   { webp: 'assets/bg_keguan.webp', jpg: 'assets/bg_keguan.webp', alt: '客館' },
    guanshi:  { webp: 'assets/bg_guanshi.webp', jpg: 'assets/bg_guanshi.webp', alt: '關市' },
    hejin:    { webp: 'assets/bg_hejin.webp', jpg: 'assets/bg_hejin.webp', alt: '河津' },
    cimiao:   { webp: 'assets/bg_cimiao.webp', jpg: 'assets/bg_cimiao.webp', alt: '祠廟' },
    ying:     { webp: 'assets/bg_ying.webp', jpg: 'assets/bg_ying.webp', alt: '軍營' },
    hut:      { webp: 'assets/bg_homestead.webp', jpg: 'assets/bg_homestead.jpg', alt: '陋室' },
    ruins:    { webp: 'assets/bg_dungeon.webp', jpg: 'assets/bg_dungeon.webp', alt: '廢墟' },
    crypt:    { webp: 'assets/bg_cliff.webp', jpg: 'assets/bg_cliff.jpg', alt: '古墓' },
    marsh:    { webp: 'assets/bg_pond.webp', jpg: 'assets/bg_pond.webp', alt: '澤地' },
    tea:      { webp: 'assets/bg_tea.webp', jpg: 'assets/bg_tea.webp', alt: '云海茶寮' },
    forge:    { webp: 'assets/bg_forge.webp', jpg: 'assets/bg_forge.webp', alt: '鐵鋪' },
    wood:     { webp: 'assets/bg_wood.webp', jpg: 'assets/bg_wood.webp', alt: '木作坊' },
    incense:  { webp: 'assets/bg_incense.webp', jpg: 'assets/bg_incense.webp', alt: '香鋪' },
    weave:    { webp: 'assets/bg_weave.webp', jpg: 'assets/bg_weave.webp', alt: '織坊' },
    study:    { webp: 'assets/bg_study.webp', jpg: 'assets/bg_study.webp', alt: '書齋' },
    yard:     { webp: 'assets/bg_yard.webp', jpg: 'assets/bg_yard.webp', alt: '庭院' },
    wish:     { webp: 'assets/bg_wish.webp', jpg: 'assets/bg_wish.webp', alt: '祈願樹' },
    persimmon:{ webp: 'assets/bg_persimmon.webp', jpg: 'assets/bg_persimmon.webp', alt: '霜柿山居' },
    canal:    { webp: 'assets/bg_canal.webp', jpg: 'assets/bg_canal.webp', alt: '漕幫碼頭' },
    bridge:   { webp: 'assets/bg_bridge.webp', jpg: 'assets/bg_bridge.webp', alt: '長橋' },
    terraces: { webp: 'assets/bg_terraces.webp', jpg: 'assets/bg_terraces.webp', alt: '層田' },
    iron_league: { webp: 'assets/bg_iron_league.webp', jpg: 'assets/bg_iron_league.webp', alt: '鐵盟坊' },
    stargaze: { webp: 'assets/bg_stargaze.webp', jpg: 'assets/bg_stargaze.webp', alt: '觀星隱廬' },
    poplar: { webp: 'assets/bg_poplar.webp', jpg: 'assets/bg_poplar.webp', alt: '胡楊洲' },
    dragon_bridge: { webp: 'assets/bg_dragon_bridge.webp', jpg: 'assets/bg_dragon_bridge.webp', alt: '雙龍橋' },
    canal_hq: { webp: 'assets/bg_canal_hq.webp', jpg: 'assets/bg_canal_hq.webp', alt: '漕幫總壇' },
    tea_master: { webp: 'assets/bg_tea_master.webp', jpg: 'assets/bg_tea_master.webp', alt: '品茗室' },
    sword_wash: { webp: 'assets/bg_sword_wash.webp', jpg: 'assets/bg_sword_wash.webp', alt: '浣劍居' },
    gorge: { webp: 'assets/bg_gorge.webp', jpg: 'assets/bg_gorge.webp', alt: '雲縫谷' },
    paper: { webp: 'assets/bg_paper.webp', jpg: 'assets/bg_paper.webp', alt: '紙坊' },
    rain_hut: { webp: 'assets/bg_rain_hut.webp', jpg: 'assets/bg_rain_hut.webp', alt: '聽雨廬' },
    ink_pool: { webp: 'assets/bg_ink_pool.webp', jpg: 'assets/bg_ink_pool.webp', alt: '墨池齋' },
    dye: { webp: 'assets/bg_dye.webp', jpg: 'assets/bg_dye.webp', alt: '染坊' },
    rainy_tea: { webp: 'assets/bg_rainy_tea.webp', jpg: 'assets/bg_rainy_tea.webp', alt: '雨亭茶寮' },
    brewery: { webp: 'assets/bg_brewery.webp', jpg: 'assets/bg_brewery.webp', alt: '酒坊' },
    pharmacy: { webp: 'assets/bg_pharmacy.webp', jpg: 'assets/bg_pharmacy.webp', alt: '藥鋪' },
    stone_forest: { webp: 'assets/bg_stone_forest.webp', jpg: 'assets/bg_stone_forest.webp', alt: '石林' },
    garden_water: { webp: 'assets/bg_garden_water.webp', jpg: 'assets/bg_garden_water.webp', alt: '水榭園' },
  };
  var MODE_LABELS = {
    farm: '田莊', village: '村落', market: '市井', clinic: '藥廬', drill: '校場', wild: '山野',
    garden: '園林', swim: '水塘', moon: '夜宴',
    mine: '礦坑', post: '驛道', tavern: '酒肆', academy: '書塾', frontier: '邊關',
    xianyang: '咸陽', palace: '宮城外', xiangbang: '相邦府', taihou: '太后宮外',
    guowei: '國尉府', keguan: '客館', guanshi: '關市', hejin: '河津', cimiao: '祠廟', ying: '軍營',
    hut: '陋室', ruins: '廢墟', crypt: '古墓', marsh: '澤地',
    tea: '云海茶寮', forge: '鐵鋪', wood: '木作坊', incense: '香鋪', weave: '織坊',
    study: '書齋', yard: '庭院', wish: '祈願樹', persimmon: '霜柿山居', canal: '漕幫碼頭', bridge: '長橋',
    terraces: '層田', iron_league: '鐵盟坊', stargaze: '觀星隱廬', poplar: '胡楊洲',
    dragon_bridge: '雙龍橋', canal_hq: '漕幫總壇', tea_master: '品茗室', sword_wash: '浣劍居',
    gorge: '雲縫谷', paper: '紙坊', rain_hut: '聽雨廬', ink_pool: '墨池齋', dye: '染坊',
    rainy_tea: '雨亭茶寮', brewery: '酒坊', pharmacy: '藥鋪', stone_forest: '石林', garden_water: '水榭園'
  };
  var ALL_MODES = ['hut','farm','village','market','clinic','drill','wild','garden','swim','moon','mine','post','tavern','academy','frontier',
    'xianyang','palace','xiangbang','taihou','guowei','keguan','guanshi','hejin','cimiao','ying','ruins','crypt','marsh',
    'tea','forge','wood','incense','weave','study','yard','wish','persimmon','canal','bridge',
    'terraces','iron_league','stargaze','poplar','dragon_bridge','canal_hq','tea_master','sword_wash',
    'gorge','paper','rain_hut','ink_pool','dye','rainy_tea','brewery','pharmacy','stone_forest','garden_water'];
  var WORK_MODES = ['farm','market','clinic','drill','wild','mine','frontier','ying','guanshi','hejin','ruins','crypt','marsh','forge','wood','weave','canal','terraces','gorge','stone_forest','iron_league'];
  var EXPLORE_MODES = ['ruins','crypt','marsh','mine','wild','frontier','gorge','stone_forest'];
  var DUNGEON_MODES = ['ruins','crypt','marsh','mine','wild','frontier','gorge','stone_forest','drill'];
  var LEISURE_MODES = ['garden', 'swim', 'moon', 'tea', 'yard', 'wish', 'bridge', 'persimmon', 'stargaze', 'rain_hut', 'sword_wash', 'garden_water', 'poplar', 'dragon_bridge'];
  var CRAFT_MODES = ['forge', 'wood', 'incense', 'weave', 'study', 'canal', 'iron_league', 'paper', 'dye', 'brewery', 'pharmacy'];
  var BEAUTY_MODES = ['tea','forge','wood','incense','weave','study','yard','wish','persimmon','canal','bridge','terraces','iron_league','stargaze','poplar','dragon_bridge','canal_hq','tea_master','sword_wash','paper','rain_hut','ink_pool','dye','rainy_tea','brewery','pharmacy','garden_water'];
  var QIN_COURT_MODES = ['xianyang','palace','xiangbang','taihou','guowei','keguan','cimiao'];
  var TRAVEL_COST = {
    farm: 0, village: 2, market: 3, clinic: 2, drill: 3, wild: 4,
    garden: 2, swim: 2, moon: 3, mine: 4, post: 3, tavern: 2, academy: 2, frontier: 5,
    xianyang: 4, palace: 5, xiangbang: 4, taihou: 5, guowei: 4, keguan: 3, guanshi: 3, hejin: 3, cimiao: 2, ying: 4,
    hut: 0, ruins: 4, crypt: 5, marsh: 4,
    tea: 2, forge: 2, wood: 2, incense: 2, weave: 2, study: 2, yard: 1, wish: 2, persimmon: 3, canal: 3, bridge: 2,
    terraces: 2, iron_league: 3, stargaze: 3, poplar: 4, dragon_bridge: 2, canal_hq: 3, tea_master: 2,
    sword_wash: 3, gorge: 5, paper: 2, rain_hut: 2, ink_pool: 2, dye: 2, rainy_tea: 2, brewery: 2,
    pharmacy: 2, stone_forest: 4, garden_water: 2
  };
  var SCENE_CAPS = {
    farm: '工人喺田莊圖上走動', village: '鄉鄰沿街往來', market: '商販走街串巷',
    clinic: '醫者採藥配劑', drill: '武卒校場演練', wild: '獵戶斥候穿林',
    garden: '遊人園中閒步', swim: '村童塘邊嬉水', moon: '賓客席間往來',
    mine: '礦工挑燈開掘', post: '驛卒快馬傳書', tavern: '酒客推杯換盞',
    academy: '學子書塾誦讀', frontier: '戍卒邊牆巡邏',
    xianyang: '咸陽街巷車馬', palace: '宮牆外衛士巡戈', xiangbang: '門客進出相邦府',
    taihou: '宮婢與私門往來', guowei: '吏卒傳令奔走', keguan: '賓客使節投宿',
    guanshi: '關市賈人校秤', hejin: '津吏渡船往來', cimiao: '香客祠前祈禱', ying: '軍營操練換防',
    hut: '陋室燈火微明', ruins: '廢墟遊魂遊走', crypt: '古墓陰風掠影', marsh: '澤地蟲豸潛行',
    tea: '茶客云海品茗', forge: '鐵匠錘火花濺', wood: '木作刨花飛揚', incense: '香煙裊裊升騰',
    weave: '織娘機杼往來', study: '書生案前沉吟', yard: '庭院掃葉賞景', wish: '香客掛籤祈願',
    persimmon: '山居摘柿晒果', canal: '漕幫裝船點貨', bridge: '橋上憑欄偶遇',
    terraces: '層田農人拾級', iron_league: '鐵盟鍛造火花', stargaze: '觀星客佇立井畔',
    poplar: '駝隊穿行胡楊', dragon_bridge: '橋上行人往來', canal_hq: '總壇點貨裝船',
    tea_master: '茶師瀹茗品鑒', sword_wash: '劍客溪邊滌刃', gorge: '谷風掠過索橋',
    paper: '紙工晾箋抄造', rain_hut: '雨中人影匆匆', ink_pool: '書生臨池研墨',
    dye: '染工晾布換色', rainy_tea: '雨亭茶客低語', brewery: '酒坊抱甕往來',
    pharmacy: '藥鋪配劑抓藥', stone_forest: '石林遊魂穿行', garden_water: '水榭遊人憑欄'
  };
  var MODE_BLURB = {
    farm: '田莊忙碌：圖上工人走動，下方田畦可種、澆、收、賣、擴田。',
    village: '村落：交日令、與鄉鄰／秦人對白送禮；聲名漸起或有勢力來訪。',
    market: '市井：貨架買賣、製物、僱長工壯田莊。',
    clinic: '藥廬：採藥煉劑，可自服或義診增益民心。',
    drill: '校場：對練掉落裝備，練手與測 AUTO。',
    wild: '山野：入山打怪或採集，愈深愈險。',
    garden: '園林：閒步復體、偶遇鄉鄰、賞花增民心。',
    swim: '水塘：洗濯復體，選釣點試釣。',
    moon: '夜宴：銀夠則辦宴增名聲民心。',
    mine: '礦坑：開掘礦石，下層更險，偶遇礦妖。',
    post: '驛道：歇腳復體、打聽消息、託書揚名。',
    tavern: '酒肆：沽酒聽談，或小賭運氣。',
    academy: '書塾：讀卷論辯，讀韓非簡，提升文才。',
    frontier: '邊關：強敵與佳掉落，需體力充足。',
    xianyang: '咸陽：聽詔、投刺、觀市口風向。',
    palace: '宮城外：覲見傳聞、衛士盤問、投書內廷。',
    xiangbang: '相邦府：拜謁呂門、貨殖請託、門客清談。',
    taihou: '太后宮外：進貢、打聽宮爭、慎言。',
    guowei: '國尉府：報功、領差、習軍法。',
    keguan: '客館：宴客、刺探六國、結賓客。',
    guanshi: '關市：互市買賣、校秤納稅、邊貨。',
    hejin: '河津：渡船、問水工、運糧。',
    cimiao: '祠廟：祈福、賽祭、安民心。',
    ying: '軍營：操練、領餉差、準備出征。',
    hut: '陋室：免費歇息回體，體力過低請先回家。',
    ruins: '廢墟：探索遇怪，挑戰魁首可得佳裝。',
    crypt: '古墓：陰冷探墓，鎮墓獸掉落豐。',
    marsh: '澤地：涉澤打怪，草藥與裝備並獲。',
    tea: '云海茶寮：品茗歇息、聽謠、略提名聲。',
    forge: '鐵鋪：耗礦打造兵刃／工具，可強化戰力。',
    wood: '木作坊：耗糧木感製傢什，換銀或家居。',
    incense: '香鋪：燃香靜心，回復與名聲。',
    weave: '織坊：花麥織布，售賣或送人加好感。',
    study: '書齋：研讀提升文才／輕功理論。',
    yard: '庭院：掃庭歇息，偶遇鄉鄰。',
    wish: '祈願樹：掛籤祈願，加民心與好感。',
    persimmon: '霜柿山居：秋收柿子，季節風味。',
    canal: '漕幫碼頭：接運單、運貨賺錢。',
    bridge: '長橋：憑欄遠望，隨機偶遇。',
    terraces: '層田拾級，水光如鏡。',
    iron_league: '鐵盟坊爐火，試煉待君。',
    stargaze: '觀星隱廬，月井映宿。',
    gorge: '雲縫谷深，索橋垂危——副本。',
    stone_forest: '石林如戟，魍魎其間——副本。',
    poplar: '胡楊洲上，沙風獵獵。',
    dragon_bridge: '雙龍橋雙拱臥波。',
    canal_hq: '漕幫總壇，貨船如織。',
    tea_master: '品茗室，茶師瀹器。',
    sword_wash: '浣劍居，溪石滌刃。',
    paper: '紙坊抄造晾箋。',
    rain_hut: '聽雨廬，雨聲如訴。',
    ink_pool: '墨池齋，臨池學書。',
    dye: '染坊青絲藍布。',
    rainy_tea: '雨亭茶寮，煙雨一盞。',
    brewery: '酒坊甕香撲鼻。',
    pharmacy: '藥鋪柜上百草。',
    garden_water: '水榭園，亭影入池。'
  };
  var PERIODS = ['晨', '午', '暮', '夜'];

  /** 時段張弛：0 鬆 → 1 緊 */
  var PERIOD_TENSION = { '晨': 0.2, '午': 0.55, '暮': 0.75, '夜': 0.35 };

  /** 新手教練：前幾日建議場景 */
  var TUTORIAL_DAYS = [
    { day: 1, period: '晨', suggest: ['hut', 'farm'], tip: '先在田莊耕種或陋室歇息，摸熟行事。' },
    { day: 1, period: '午', suggest: ['farm', 'village'], tip: '午間可去村落見鄉鄰、接日令。' },
    { day: 1, period: '暮', suggest: ['market', 'village'], tip: '暮色市井買賣，或回村送禮。' },
    { day: 1, period: '夜', suggest: ['hut', 'tavern'], tip: '夜宜歇息回體；酒肆可聽謠。' },
    { day: 2, period: '晨', suggest: ['farm', 'clinic'], tip: '翌日晨耕或採藥，穩固根基。' },
    { day: 2, period: '午', suggest: ['village', 'market'], tip: '對談鄉鄰可開人脈；市井僱工壯田。' },
    { day: 2, period: '暮', suggest: ['garden', 'swim'], tip: '暮時休閒復體，明日再戰。' },
    { day: 2, period: '夜', suggest: ['hut'], tip: '夜歸陋室；探索／宮廷尚早。' },
    { day: 3, period: '晨', suggest: ['drill', 'farm'], tip: '第三日可試校場演武，仍勿硬闖邊關。' },
    { day: 3, period: '午', suggest: ['wild', 'mine'], tip: '山野／礦坑可淺探；體力不足先回陋室。' },
    { day: 3, period: '暮', suggest: ['village', 'academy'], tip: '暮時對談或書塾，留意深談提示。' },
    { day: 3, period: '夜', suggest: ['hut', 'moon'], tip: '夜宴需銀；否則歇息備戰。' }
  ];

  var COURT_UNLOCK_DAY = 5;
  var EXPLORE_SOFT_DAY = 3;

  function ensurePeriod(S) {
    if (!S) return '晨';
    if (!S.period || PERIODS.indexOf(S.period) < 0) {
      S.period = PERIODS[((S.day || 1) - 1) % 4];
    }
    return S.period;
  }

  function periodIndex(S) {
    return PERIODS.indexOf(ensurePeriod(S));
  }

  /** 推進一時段；由夜→晨時 day++ 並回傳 {newDay:true} */
  function advancePeriod(S) {
    ensurePeriod(S);
    var i = PERIODS.indexOf(S.period);
    var next = PERIODS[(i + 1) % 4];
    var newDay = false;
    if (S.period === '夜' && next === '晨') {
      S.day = (S.day || 1) + 1;
      newDay = true;
    }
    S.period = next;
    return { period: S.period, newDay: newDay, tension: PERIOD_TENSION[S.period] || 0.5 };
  }

  function tutorialTip(S) {
    ensurePeriod(S);
    var d = S.day || 1;
    if (d > 3) return null;
    for (var i = 0; i < TUTORIAL_DAYS.length; i++) {
      var t = TUTORIAL_DAYS[i];
      if (t.day === d && t.period === S.period) return t;
    }
    return { tip: '晨耕午市，暮談夜息——依時段行事更順。', suggest: ['farm', 'village', 'hut'] };
  }

  function travelAllowed(S, mode) {
    ensurePeriod(S);
    var d = S.day || 1;
    if (QIN_COURT_MODES.indexOf(mode) >= 0 && d < COURT_UNLOCK_DAY) {
      var fl = (S && S.flags) || {};
      var acc = (S && S.access) || {};
      var sf = (S && S.storyFlow && S.storyFlow.nodeId) || '';
      var storyOpen = !!(fl.visited_xianyang || fl.left_village || fl.visited_palace || acc.palace ||
        /^(xy_|ch2_)/.test(sf));
      if (!storyOpen) {
        return { ok: false, msg: '宮廷關隘尚遠（約第' + COURT_UNLOCK_DAY + '日後可入，或先循劇情赴咸陽）· 先穩田莊人脈' };
      }
    }
    if (EXPLORE_MODES.indexOf(mode) >= 0 && d < EXPLORE_SOFT_DAY && mode !== 'wild') {
      return { ok: false, msg: '探索尚早（第' + EXPLORE_SOFT_DAY + '日起）· 先熟悉田莊／市井／對談' };
    }
    return { ok: true };
  }

  function encounterBias(S) {
    var t = PERIOD_TENSION[ensurePeriod(S)] || 0.5;
    return t;
  }

  function restHint(S) {
    ensurePeriod(S);
    if (S.period === '夜') return '夜深宜回陋室歇息。';
    if (S.period === '晨') return '晨光正好耕種或打理差事。';
    if (S.period === '午') return '午間市井／村落最熱鬧。';
    return '暮色漸合，可對談或淺探。';
  }

  /**
   * 組一日引導字：時段 + 教練 + 可深談 + 地標
   * opts.arcHints: [{name,label,mode}]
   * opts.npcHere: string[]
   */
  function dayGuide(S, opts) {
    opts = opts || {};
    ensurePeriod(S);
    var parts = [];
    parts.push(S.period + ' · 第' + (S.day || 1) + '日');
    var tut = tutorialTip(S);
    if (tut && tut.tip && (S.day || 1) <= 3) parts.push(tut.tip);
    else parts.push(restHint(S));
    if (opts.arcHints && opts.arcHints.length) {
      var a = opts.arcHints[0];
      parts.push('可深談：' + a.name + (a.label ? '（' + a.label + '）' : '') + (a.mode ? ' · 或往' + (MODE_LABELS[a.mode] || a.mode) : ''));
    }
    if (opts.landmark) parts.push('地標：' + opts.landmark);
    if (opts.npcLine) parts.push(opts.npcLine);
    return parts.join(' ');
  }

  function label(mode) { return MODE_LABELS[mode] || mode; }

  global.QianModes = {
    SCENE_ART: SCENE_ART,
    MODE_LABELS: MODE_LABELS,
    ALL_MODES: ALL_MODES,
    WORK_MODES: WORK_MODES,
    EXPLORE_MODES: EXPLORE_MODES,
    DUNGEON_MODES: DUNGEON_MODES,
    LEISURE_MODES: LEISURE_MODES,
    CRAFT_MODES: CRAFT_MODES,
    BEAUTY_MODES: BEAUTY_MODES,
    QIN_COURT_MODES: QIN_COURT_MODES,
    TRAVEL_COST: TRAVEL_COST,
    SCENE_CAPS: SCENE_CAPS,
    MODE_BLURB: MODE_BLURB,
    PERIODS: PERIODS,
    PERIOD_TENSION: PERIOD_TENSION,
    COURT_UNLOCK_DAY: COURT_UNLOCK_DAY,
    EXPLORE_SOFT_DAY: EXPLORE_SOFT_DAY,
    ensurePeriod: ensurePeriod,
    periodIndex: periodIndex,
    advancePeriod: advancePeriod,
    tutorialTip: tutorialTip,
    travelAllowed: travelAllowed,
    encounterBias: encounterBias,
    restHint: restHint,
    dayGuide: dayGuide,
    label: label
  };
})(typeof window !== 'undefined' ? window : global);
