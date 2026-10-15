/* 墨夢莊周 · 戰鬥資料表（v34） */
(function (global) {
  'use strict';

  var RARITIES = {
    white:  { id: 'white',  name: '凡', className: 'rarity-white',  mult: 1,   sell: 8 },
    green:  { id: 'green',  name: '良', className: 'rarity-green',  mult: 1.4, sell: 18 },
    blue:   { id: 'blue',   name: '珍', className: 'rarity-blue',   mult: 1.9, sell: 40 },
    purple: { id: 'purple', name: '史', className: 'rarity-purple', mult: 2.6, sell: 90 },
    gold:   { id: 'gold',   name: '傳說', className: 'rarity-gold',   mult: 3.5, sell: 200 }
  };
  var RARITY_ORDER = ['white', 'green', 'blue', 'purple', 'gold'];
  var ENEMIES_DRILL = [
    { name: '木人樁', hp: 22, atk: 4 },
    { name: '校場教習', hp: 30, atk: 6 },
    { name: '遊卒', hp: 36, atk: 7 },
    { name: '鐵甲教頭', hp: 48, atk: 9 }
  ];
  var ENEMIES_WILD = [
    { name: '山鼠', hp: 28, atk: 5 },
    { name: '野狼', hp: 40, atk: 8 },
    { name: '伏匪', hp: 48, atk: 9 },
    { name: '山魅', hp: 60, atk: 11 },
    { name: '岩傀', hp: 80, atk: 12 },
    { name: '蒼獠', hp: 95, atk: 14 }
  ];
  var ENEMIES_MINE = [
    { name: '礦鼠', hp: 26, atk: 5 },
    { name: '洞蝠', hp: 34, atk: 7 },
    { name: '礦妖', hp: 50, atk: 10 },
    { name: '岩甲蟲', hp: 70, atk: 12 }
  ];
  var ENEMIES_FRONT = [
    { name: '哨騎', hp: 45, atk: 9 },
    { name: '邊匪', hp: 58, atk: 11 },
    { name: '胡騎', hp: 72, atk: 13 },
    { name: '狼主', hp: 95, atk: 15 },
    { name: '邊關妖物', hp: 120, atk: 17 }
  ];
  var ENEMIES_RUINS = [
    { name: '碎瓦怪', hp: 32, atk: 6 },
    { name: '廢墟遊魂', hp: 48, atk: 9 },
    { name: '銅戈俑', hp: 65, atk: 11 },
    { name: '殘垣巨傀', hp: 90, atk: 14 }
  ];
  var ENEMIES_CRYPT = [
    { name: '墓鼠', hp: 30, atk: 6 },
    { name: '掛屍', hp: 52, atk: 10 },
    { name: '青銅守卫', hp: 78, atk: 13 },
    { name: '陰火狐', hp: 100, atk: 15 }
  ];
  var ENEMIES_GORGE = [
    { name: '縫蝠', hp: 34, atk: 8 },
    { name: '岩隙刺客', hp: 55, atk: 11 },
    { name: '炎縫蜥蜴', hp: 72, atk: 13 },
    { name: '赤瞳守衛', hp: 95, atk: 16 }
  ];
  var ENEMIES_STONE = [
    { name: '石鼠', hp: 30, atk: 6 },
    { name: '苔衣傀', hp: 50, atk: 10 },
    { name: '石矛兵', hp: 70, atk: 12 },
    { name: '岩甲獸', hp: 92, atk: 15 }
  ];
  var ENEMIES_MARSH = [
    { name: '澤蛇', hp: 28, atk: 7 },
    { name: '毒蟾', hp: 44, atk: 9 },
    { name: '蘆影刺客', hp: 60, atk: 12 },
    { name: '淤泥獸', hp: 88, atk: 14 }
  ];
  var BOSSES = {
    ruins: { name: '廢墟魁首·石將軍', hp: 160, atk: 18 },
    crypt: { name: '鎮墓獸·玄獒', hp: 190, atk: 20 },
    marsh: { name: '澤中巨物·黿王', hp: 175, atk: 17 },
    mine: { name: '礦脈主·岩魔', hp: 150, atk: 16 },
    wild: { name: '山君·蒼獠王', hp: 170, atk: 19 },
    frontier: { name: '邊關妖物·狼吞', hp: 200, atk: 21 },
    gorge: { name: '縫底炎魔·赭瞳', hp: 185, atk: 19 },
    stone_forest: { name: '石林石精·巖翁', hp: 170, atk: 18 }
  };

  function enemiesFor(where) {
    if (where === 'wild') return ENEMIES_WILD;
    if (where === 'mine') return ENEMIES_MINE;
    if (where === 'frontier') return ENEMIES_FRONT;
    if (where === 'ruins') return ENEMIES_RUINS;
    if (where === 'crypt') return ENEMIES_CRYPT;
    if (where === 'marsh') return ENEMIES_MARSH;
    if (where === 'gorge') return ENEMIES_GORGE;
    if (where === 'stone_forest') return ENEMIES_STONE;
    return ENEMIES_DRILL;
  }

  function bossFor(where) {
    return BOSSES[where] || null;
  }

  global.QianCombat = {
    RARITIES: RARITIES,
    RARITY_ORDER: RARITY_ORDER,
    ENEMIES_DRILL: ENEMIES_DRILL,
    ENEMIES_WILD: ENEMIES_WILD,
    ENEMIES_MINE: ENEMIES_MINE,
    ENEMIES_FRONT: ENEMIES_FRONT,
    ENEMIES_RUINS: ENEMIES_RUINS,
    ENEMIES_CRYPT: ENEMIES_CRYPT,
    ENEMIES_GORGE: ENEMIES_GORGE,
    ENEMIES_STONE: ENEMIES_STONE,
    ENEMIES_MARSH: ENEMIES_MARSH,
    BOSSES: BOSSES,
    enemiesFor: enemiesFor,
    bossFor: bossFor
  };
})(typeof window !== 'undefined' ? window : global);
