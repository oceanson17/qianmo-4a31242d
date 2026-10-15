/* 墨夢莊周 · v37 人物百科／世界書／關係資料（全原創條目，無版權小說出處連結） */
(function (global) {
  'use strict';

  var PEOPLE = [
    { id: 'yingzheng', name: '嬴政', title: '少年秦王', tags: ['王府', '近側'], blurb: '剛即位的少年君主。寡言、審慎，對私門與邊野皆存疑。關係遠近會改寫命運弧。' },
    { id: 'lubuwei', name: '呂不韋', title: '相邦', tags: ['呂黨'], blurb: '總攬政事的相邦。用人重「價值」。接近他會牽動府網與王府張力。' },
    { id: 'zhaoji', name: '趙姬', title: '太后', tags: ['后黨'], blurb: '太后宮外風聲不斷。少聽少傳——你的選擇可能成為霜或繩。' },
    { id: 'lisi', name: '李斯', title: '客卿／法術', tags: ['法術'], blurb: '倡強法安農戰。與你辯論會定下「宣法／折中／對立」等旗標。' },
    { id: 'mengtian', name: '蒙恬', title: '邊將子弟', tags: ['軍營', '塞上'], blurb: '北境與關內之間的袍澤線索。供輸、刀穗與退路皆可選。' },
    { id: 'yiguan', name: '太醫署吏', title: '署廊吏員', tags: ['太醫署', '近側'], blurb: '原創職稱角色。把關「藥性」與「嘴嚴」，是入廷縫隙之一。' },
    { id: 'su', name: '蘇娘', title: '鄉里醫', tags: ['藥廬'], blurb: '教你望而止言。跟診會種下醫士旗標。' },
    { id: 'he', name: '何伯', title: '鄉長輩', tags: ['鄉野'], blurb: '把宮裡風說短、把叮囑說長。' },
    { id: 'feng', name: '賈人馮', title: '市井牙人', tags: ['關市'], blurb: '賣縫與情報。咸陽缺的是能進門又不惹事的人。' },
    { id: 'hero', name: '你', title: '旅人／近側候補', tags: ['主角'], blurb: '可自選身世與志向。本版主軸為文字選擇與人物緣分，而非田莊。' }
  ];

  var PLACES = [
    { id: 'village', name: '鄉野村落', blurb: '備廷起點：採藥、跟診、自薦信。' },
    { id: 'xianyang', name: '咸陽', blurb: '宮牆與市井並列。主樞紐。' },
    { id: 'palace', name: '宮城外／殿角', blurb: '近側初見與命運弧常在此叩門。' },
    { id: 'clinic_court', name: '太醫署', blurb: '藥香與分寸。原創署廊場景。' },
    { id: 'xiangbang', name: '相邦府', blurb: '門客如織，價值秤人。' },
    { id: 'taihou', name: '太后宮外', blurb: '傳聞多於真相。' },
    { id: 'keguan', name: '客館', blurb: '候召、六國口音與平行支線的溫床。' }
  ];

  var FACTIONS = [
    { id: 'qin', name: '王府／秦廷', blurb: '親政之心與符節、近側之用。' },
    { id: 'lu', name: '呂黨', blurb: '相邦門客網與長線奇貨。' },
    { id: 'sai', name: '塞北邊市盟', blurb: '關市、皮貨與邊營供輸。' },
    { id: 'med', name: '太醫署脈絡', blurb: '非正式勢力：藥與口風構成的進階縫。' }
  ];

  var EVENTS = [
    { id: 'ink_dream', name: '墨夢初醒', blurb: '序章：藥香與冠影的預兆感。' },
    { id: 'court_healer', name: '入署求進', blurb: '太醫署記下你——近側候選。' },
    { id: 'ying_first_meet', name: '殿角初見', blurb: '少年王一眼。專業／進言／溫言會分岔。' },
    { id: 'ying_arc', name: '少年秦王·夜問', blurb: '命運弧：心腹／外牆／疏遠／伴側／敬畏／改史。' },
    { id: 'history_nudge', name: '緩賦顫軌', blurb: '改史倖存線的世界震顫（旗標）。' }
  ];

  function affOf(S, id) {
    return (S && S.npcs && S.npcs[id] && S.npcs[id].aff) || 0;
  }

  function relNodes(S) {
    var ids = ['yingzheng', 'lubuwei', 'zhaoji', 'lisi', 'mengtian', 'yiguan', 'su', 'he', 'feng'];
    return ids.map(function (id, i) {
      var p = PEOPLE.filter(function (x) { return x.id === id; })[0] || { name: id };
      var known = !!(S && S.npcs && S.npcs[id] && (S.npcs[id].known || S.npcs[id].aff));
      var aff = affOf(S, id);
      var ang = (i / ids.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id: id,
        name: p.name,
        aff: aff,
        known: known || aff > 0,
        x: 0.5 + Math.cos(ang) * 0.36,
        y: 0.5 + Math.sin(ang) * 0.36
      };
    });
  }

  function relEdges(S) {
    var center = 'hero';
    return relNodes(S).filter(function (n) { return n.known; }).map(function (n) {
      return { from: center, to: n.id, w: Math.max(1, Math.min(10, Math.round((n.aff || 0) / 10))) };
    });
  }

  function tipFor(nodeId, enabled) {
    if (!enabled) return '';
    var TIPS = {
      pro_01: '史注：秦王政元年，嬴政即位尚幼，相邦呂不韋主政（可關）。',
      pro_02: '史注：太后居深宮，外朝多委相邦；宮爭傳聞需慎。',
      ch1_clinic: '史注：太醫署屬宮廷醫療系統，民間醫者入廷極難，多靠薦舉。',
      xy_taiyi: '史注：近臣／侍醫類職任重口風與可靠，非僅醫術。',
      xy_near_meet: '史注：史書對「少年王性格」記載簡略；本作以原創關係推進。',
      xy_palace: '史注：咸陽宮城象徵王權中心，無符節不得妄入。'
    };
    return TIPS[nodeId] || '';
  }

  function exportClip(S, lines) {
    var name = (S && S.hero && S.hero.name) || (S && S.name) || '旅人';
    var day = S && S.day != null ? S.day : '?';
    var fate = (global.QianArcs && global.QianArcs.fateSummary) ? global.QianArcs.fateSummary(S) : '';
    var body = (lines || []).join('\n');
    return '【墨夢莊周·精彩橋段】\n主角：' + name + '　日序：' + day +
      (fate ? '\n命運旗標：' + fate : '') +
      '\n——\n' + body +
      '\n——\n（原創文字冒險節錄，歡迎複製分享）';
  }

  global.QianCodex = {
    PEOPLE: PEOPLE,
    PLACES: PLACES,
    FACTIONS: FACTIONS,
    EVENTS: EVENTS,
    relNodes: relNodes,
    relEdges: relEdges,
    tipFor: tipFor,
    exportClip: exportClip,
    affOf: affOf
  };
})(typeof window !== 'undefined' ? window : globalThis);
