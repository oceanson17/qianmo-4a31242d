/* 青阡 · 場景工人：Q 版 char_* 小人走動（原創圖，非抄圖） */
(() => {
  'use strict';

  const MAX = 14;
  const ASSET_V = '24';
  const SPRITE_KEYS = {
    farm: ['farmer_m', 'farmer_f', 'farmer_m', 'farmer_f'],
    market: ['merchant', 'merchant', 'farmer_m', 'farmer_f'],
    clinic: ['doctor', 'doctor', 'farmer_f', 'farmer_m', 'scholar', 'farmer_f', 'doctor', 'merchant'],
    village: ['scholar', 'farmer_m', 'farmer_f', 'merchant'],
    drill: ['soldier', 'soldier', 'farmer_m'],
    wild: ['soldier', 'soldier', 'farmer_f'],
    garden: ['scholar', 'farmer_f', 'merchant', 'farmer_m'],
    swim: ['farmer_f', 'farmer_m', 'scholar'],
    moon: ['merchant', 'scholar', 'farmer_f', 'soldier'],
    mine: ['farmer_m', 'soldier', 'farmer_f', 'merchant'],
    post: ['merchant', 'soldier', 'scholar', 'farmer_m'],
    tavern: ['merchant', 'farmer_f', 'soldier', 'scholar'],
    academy: ['scholar', 'scholar', 'farmer_m', 'doctor'],
    frontier: ['soldier', 'soldier', 'farmer_m', 'merchant'],
    xianyang: ['merchant', 'scholar', 'soldier', 'farmer_m'],
    palace: ['soldier', 'soldier', 'scholar', 'farmer_f', 'soldier', 'merchant', 'scholar'],
    xiangbang: ['merchant', 'scholar', 'merchant', 'soldier', 'farmer_m', 'scholar', 'merchant', 'farmer_f'],
    taihou: ['farmer_f', 'scholar', 'soldier', 'merchant', 'farmer_f', 'scholar'],
    guowei: ['soldier', 'scholar', 'soldier', 'farmer_m'],
    keguan: ['scholar', 'merchant', 'farmer_f', 'soldier'],
    guanshi: ['merchant', 'merchant', 'farmer_m', 'soldier'],
    hejin: ['farmer_m', 'merchant', 'soldier', 'farmer_f'],
    cimiao: ['scholar', 'doctor', 'farmer_f', 'farmer_m'],
    ying: ['soldier', 'soldier', 'farmer_m', 'merchant', 'soldier', 'farmer_m', 'soldier'],
    hut: ['farmer_m', 'farmer_f', 'scholar'],
    ruins: ['soldier', 'farmer_m', 'scholar', 'soldier', 'merchant'],
    crypt: ['soldier', 'scholar', 'doctor', 'soldier'],
    marsh: ['farmer_m', 'farmer_f', 'soldier', 'merchant'],
    tea: ['scholar', 'merchant', 'farmer_f', 'doctor'],
    forge: ['soldier', 'farmer_m', 'merchant', 'farmer_m'],
    wood: ['farmer_m', 'farmer_f', 'merchant', 'scholar'],
    incense: ['doctor', 'scholar', 'farmer_f', 'merchant'],
    weave: ['farmer_f', 'farmer_f', 'merchant', 'scholar'],
    study: ['scholar', 'scholar', 'doctor', 'farmer_m'],
    yard: ['farmer_f', 'scholar', 'farmer_m', 'merchant'],
    wish: ['scholar', 'doctor', 'farmer_f', 'soldier'],
    persimmon: ['farmer_m', 'farmer_f', 'scholar', 'merchant'],
    canal: ['merchant', 'farmer_m', 'soldier', 'merchant'],
    bridge: ['scholar', 'merchant', 'soldier', 'farmer_f'],
    terraces: ['farmer_m', 'farmer_f', 'merchant', 'scholar'],
    iron_league: ['soldier', 'farmer_m', 'merchant', 'soldier'],
    stargaze: ['scholar', 'doctor', 'scholar', 'farmer_f'],
    poplar: ['farmer_m', 'farmer_f', 'merchant', 'soldier'],
    dragon_bridge: ['scholar', 'merchant', 'soldier', 'farmer_f'],
    canal_hq: ['merchant', 'soldier', 'farmer_m', 'merchant'],
    tea_master: ['scholar', 'merchant', 'farmer_f', 'doctor'],
    sword_wash: ['soldier', 'scholar', 'farmer_m', 'soldier'],
    gorge: ['soldier', 'farmer_m', 'scholar', 'soldier'],
    paper: ['scholar', 'farmer_f', 'merchant', 'doctor'],
    rain_hut: ['scholar', 'farmer_f', 'doctor', 'merchant'],
    ink_pool: ['scholar', 'scholar', 'doctor', 'farmer_m'],
    dye: ['farmer_f', 'merchant', 'farmer_m', 'scholar'],
    rainy_tea: ['scholar', 'merchant', 'farmer_f', 'doctor'],
    brewery: ['merchant', 'farmer_m', 'soldier', 'farmer_f'],
    pharmacy: ['doctor', 'scholar', 'farmer_f', 'merchant'],
    stone_forest: ['soldier', 'scholar', 'farmer_m', 'doctor'],
    garden_water: ['scholar', 'farmer_f', 'merchant', 'farmer_m']
  };
  const ROLES = [
    { id: 'hoe', label: '耕', carry: false },
    { id: 'water', label: '澆', carry: false },
    { id: 'basket', label: '擔', carry: true },
    { id: 'cart', label: '車', carry: true },
    { id: 'seed', label: '播', carry: false }
  ];

  const PATHS = {
    farm: [
      /* 主路：屋前 → 水車 → 牛車 */
      [[0.42, 0.42], [0.52, 0.50], [0.62, 0.58], [0.72, 0.68], [0.82, 0.78], [0.70, 0.72], [0.55, 0.60], [0.45, 0.50]],
      /* 稻田區 */
      [[0.12, 0.62], [0.22, 0.68], [0.32, 0.72], [0.28, 0.78], [0.18, 0.74], [0.14, 0.68]],
      /* 菜園／籬笆 */
      [[0.58, 0.48], [0.68, 0.52], [0.76, 0.48], [0.70, 0.58], [0.60, 0.54]],
      /* 倉棚往田 */
      [[0.22, 0.40], [0.30, 0.48], [0.38, 0.56], [0.28, 0.60], [0.18, 0.52]],
      /* 河邊小徑 */
      [[0.78, 0.42], [0.84, 0.52], [0.88, 0.62], [0.80, 0.70], [0.72, 0.58]]
    ],
    market: [
      [[0.10, 0.70], [0.30, 0.68], [0.50, 0.72], [0.70, 0.68], [0.88, 0.74], [0.65, 0.78], [0.40, 0.74], [0.20, 0.76]],
      [[0.15, 0.60], [0.40, 0.58], [0.65, 0.62], [0.85, 0.58], [0.55, 0.66], [0.28, 0.64]]
    ],
    clinic: [
      [[0.18, 0.72], [0.35, 0.70], [0.55, 0.74], [0.72, 0.70], [0.50, 0.78], [0.28, 0.76]],
      [[0.22, 0.62], [0.45, 0.60], [0.68, 0.64], [0.48, 0.68], [0.30, 0.66]],
      [[0.40, 0.55], [0.55, 0.58], [0.65, 0.55], [0.52, 0.62], [0.38, 0.60]],
      [[0.25, 0.48], [0.38, 0.52], [0.50, 0.48], [0.42, 0.56], [0.28, 0.54]]
    ],
    village: [
      [[0.12, 0.68], [0.28, 0.72], [0.48, 0.68], [0.68, 0.74], [0.85, 0.70], [0.55, 0.66], [0.32, 0.70]],
      [[0.18, 0.58], [0.42, 0.56], [0.62, 0.60], [0.80, 0.56], [0.50, 0.62]]
    ],
    drill: [
      [[0.15, 0.70], [0.35, 0.68], [0.55, 0.72], [0.75, 0.68], [0.60, 0.76], [0.35, 0.74]],
      [[0.22, 0.60], [0.45, 0.58], [0.70, 0.62], [0.48, 0.66]]
    ],
    wild: [
      [[0.12, 0.72], [0.32, 0.68], [0.55, 0.74], [0.78, 0.70], [0.58, 0.78], [0.30, 0.76]],
      [[0.20, 0.58], [0.48, 0.56], [0.72, 0.60], [0.42, 0.64]]
    ],
    garden: [
      [[0.14, 0.70], [0.35, 0.66], [0.55, 0.72], [0.75, 0.68], [0.50, 0.76], [0.28, 0.74]],
      [[0.20, 0.58], [0.45, 0.56], [0.70, 0.60], [0.42, 0.64]]
    ],
    swim: [
      [[0.16, 0.74], [0.38, 0.70], [0.60, 0.76], [0.82, 0.72], [0.55, 0.80], [0.30, 0.78]],
      [[0.22, 0.62], [0.48, 0.60], [0.72, 0.64], [0.40, 0.68]]
    ],
    moon: [
      [[0.12, 0.68], [0.32, 0.72], [0.55, 0.68], [0.78, 0.74], [0.60, 0.78], [0.35, 0.74]],
      [[0.18, 0.56], [0.42, 0.54], [0.68, 0.58], [0.45, 0.62]]
    ],
    mine: [
      [[0.15, 0.72], [0.35, 0.70], [0.55, 0.76], [0.75, 0.70], [0.50, 0.80], [0.28, 0.78]],
      [[0.20, 0.60], [0.45, 0.58], [0.70, 0.62], [0.42, 0.66]]
    ],
    post: [
      [[0.10, 0.70], [0.30, 0.68], [0.55, 0.72], [0.80, 0.68], [0.60, 0.76], [0.35, 0.74]],
      [[0.18, 0.58], [0.45, 0.56], [0.72, 0.60], [0.40, 0.64]]
    ],
    tavern: [
      [[0.14, 0.72], [0.35, 0.70], [0.58, 0.74], [0.80, 0.70], [0.55, 0.78], [0.30, 0.76]],
      [[0.22, 0.60], [0.48, 0.58], [0.70, 0.62], [0.42, 0.66]]
    ],
    academy: [
      [[0.16, 0.70], [0.38, 0.68], [0.58, 0.72], [0.78, 0.68], [0.52, 0.76], [0.28, 0.74]],
      [[0.24, 0.58], [0.48, 0.56], [0.70, 0.60], [0.44, 0.64]]
    ],
    frontier: [
      [[0.12, 0.74], [0.32, 0.70], [0.55, 0.76], [0.78, 0.72], [0.58, 0.80], [0.30, 0.78]],
      [[0.20, 0.60], [0.48, 0.58], [0.72, 0.62], [0.40, 0.66]]
    ],
    xianyang: [
      [[0.10, 0.70], [0.30, 0.68], [0.55, 0.72], [0.80, 0.68], [0.60, 0.76], [0.35, 0.74]],
      [[0.18, 0.58], [0.45, 0.56], [0.72, 0.60], [0.40, 0.64]]
    ],
    palace: [
      [[0.20, 0.72], [0.40, 0.70], [0.60, 0.74], [0.78, 0.70], [0.50, 0.78], [0.30, 0.76]],
      [[0.25, 0.60], [0.50, 0.58], [0.70, 0.62], [0.45, 0.66]]
    ],
    xiangbang: [
      [[0.14, 0.70], [0.35, 0.68], [0.58, 0.72], [0.80, 0.68], [0.55, 0.76], [0.32, 0.74]],
      [[0.22, 0.58], [0.48, 0.56], [0.72, 0.60], [0.42, 0.64]],
      [[0.18, 0.48], [0.40, 0.46], [0.62, 0.50], [0.78, 0.46], [0.50, 0.54], [0.28, 0.52]],
      [[0.30, 0.78], [0.50, 0.82], [0.70, 0.78], [0.55, 0.70], [0.38, 0.74]]
    ],
    taihou: [
      [[0.16, 0.72], [0.38, 0.70], [0.60, 0.74], [0.78, 0.70], [0.52, 0.78], [0.28, 0.76]],
      [[0.24, 0.60], [0.50, 0.58], [0.70, 0.62], [0.44, 0.66]]
    ],
    guowei: [
      [[0.12, 0.72], [0.35, 0.70], [0.58, 0.74], [0.78, 0.70], [0.50, 0.78], [0.30, 0.76]],
      [[0.20, 0.60], [0.48, 0.58], [0.70, 0.62], [0.40, 0.66]]
    ],
    keguan: [
      [[0.14, 0.70], [0.36, 0.68], [0.58, 0.72], [0.80, 0.68], [0.55, 0.76], [0.32, 0.74]],
      [[0.22, 0.58], [0.48, 0.56], [0.70, 0.60], [0.42, 0.64]]
    ],
    guanshi: [
      [[0.10, 0.72], [0.32, 0.70], [0.55, 0.74], [0.80, 0.70], [0.58, 0.78], [0.30, 0.76]],
      [[0.18, 0.60], [0.45, 0.58], [0.72, 0.62], [0.40, 0.66]]
    ],
    hejin: [
      [[0.12, 0.74], [0.35, 0.70], [0.58, 0.76], [0.80, 0.72], [0.55, 0.80], [0.28, 0.78]],
      [[0.22, 0.62], [0.48, 0.60], [0.70, 0.64], [0.42, 0.68]]
    ],
    cimiao: [
      [[0.18, 0.72], [0.40, 0.70], [0.60, 0.74], [0.78, 0.70], [0.50, 0.78], [0.30, 0.76]],
      [[0.25, 0.60], [0.50, 0.58], [0.70, 0.62], [0.45, 0.66]]
    ],
    ying: [
      [[0.12, 0.72], [0.35, 0.70], [0.58, 0.74], [0.78, 0.70], [0.50, 0.78], [0.28, 0.76]],
      [[0.20, 0.60], [0.48, 0.58], [0.72, 0.62], [0.40, 0.66]]
    ],
    hut: [
      [[0.30, 0.70], [0.50, 0.68], [0.65, 0.72], [0.45, 0.76]],
      [[0.35, 0.58], [0.55, 0.56], [0.60, 0.62]]
    ],
    ruins: [
      [[0.12, 0.74], [0.35, 0.70], [0.58, 0.76], [0.80, 0.72], [0.50, 0.80], [0.28, 0.78]],
      [[0.20, 0.58], [0.48, 0.56], [0.72, 0.60], [0.40, 0.64]],
      [[0.25, 0.48], [0.50, 0.46], [0.70, 0.50], [0.45, 0.54]]
    ],
    crypt: [
      [[0.18, 0.72], [0.40, 0.70], [0.62, 0.74], [0.78, 0.70], [0.48, 0.78]],
      [[0.28, 0.58], [0.52, 0.56], [0.70, 0.60], [0.42, 0.64]]
    ],
    marsh: [
      [[0.14, 0.76], [0.38, 0.72], [0.60, 0.78], [0.82, 0.74], [0.50, 0.82], [0.30, 0.80]],
      [[0.22, 0.62], [0.48, 0.60], [0.72, 0.64], [0.40, 0.68]]
    ],
    tea: [
      [[0.20, 0.70], [0.40, 0.68], [0.60, 0.72], [0.78, 0.68], [0.55, 0.76], [0.32, 0.74]],
      [[0.25, 0.58], [0.50, 0.56], [0.70, 0.60], [0.45, 0.64]]
    ],
    forge: [
      [[0.18, 0.72], [0.35, 0.70], [0.55, 0.74], [0.72, 0.70], [0.48, 0.78]],
      [[0.30, 0.60], [0.50, 0.58], [0.68, 0.62], [0.42, 0.66]]
    ],
    wood: [
      [[0.15, 0.70], [0.40, 0.68], [0.65, 0.72], [0.80, 0.68], [0.50, 0.76]],
      [[0.22, 0.58], [0.48, 0.56], [0.70, 0.60]]
    ],
    incense: [
      [[0.25, 0.70], [0.45, 0.68], [0.65, 0.72], [0.50, 0.78], [0.30, 0.74]],
      [[0.35, 0.58], [0.55, 0.56], [0.70, 0.60]]
    ],
    weave: [
      [[0.18, 0.72], [0.40, 0.70], [0.62, 0.74], [0.78, 0.70], [0.48, 0.78]],
      [[0.28, 0.60], [0.52, 0.58], [0.70, 0.62]]
    ],
    study: [
      [[0.22, 0.70], [0.45, 0.68], [0.68, 0.72], [0.50, 0.76], [0.30, 0.74]],
      [[0.30, 0.58], [0.55, 0.56], [0.72, 0.60]]
    ],
    yard: [
      [[0.20, 0.68], [0.40, 0.72], [0.60, 0.68], [0.80, 0.72], [0.55, 0.78], [0.30, 0.74]],
      [[0.28, 0.55], [0.50, 0.58], [0.72, 0.55], [0.48, 0.62]]
    ],
    wish: [
      [[0.25, 0.72], [0.45, 0.68], [0.65, 0.74], [0.50, 0.80], [0.32, 0.76]],
      [[0.35, 0.58], [0.55, 0.56], [0.70, 0.60]]
    ],
    persimmon: [
      [[0.15, 0.70], [0.35, 0.68], [0.55, 0.72], [0.75, 0.68], [0.50, 0.78]],
      [[0.22, 0.58], [0.48, 0.56], [0.70, 0.60]]
    ],
    canal: [
      [[0.12, 0.72], [0.30, 0.68], [0.50, 0.74], [0.70, 0.70], [0.88, 0.72], [0.60, 0.78], [0.35, 0.76]],
      [[0.20, 0.58], [0.45, 0.56], [0.70, 0.60], [0.40, 0.64]]
    ],
    bridge: [
      [[0.15, 0.65], [0.35, 0.62], [0.55, 0.65], [0.75, 0.62], [0.90, 0.66], [0.60, 0.70], [0.30, 0.68]],
      [[0.25, 0.55], [0.50, 0.52], [0.75, 0.55]]
    ]
,

    terraces: [
      [[0.15, 0.70], [0.35, 0.68], [0.55, 0.72], [0.75, 0.68], [0.50, 0.76]],
      [[0.22, 0.58], [0.45, 0.56], [0.68, 0.60], [0.42, 0.64]]
    ],
    iron_league: [
      [[0.18, 0.70], [0.40, 0.68], [0.60, 0.72], [0.80, 0.68], [0.50, 0.78]],
      [[0.25, 0.58], [0.48, 0.56], [0.70, 0.60], [0.45, 0.64]]
    ],
    stargaze: [
      [[0.20, 0.68], [0.40, 0.66], [0.60, 0.70], [0.75, 0.66], [0.50, 0.74]],
      [[0.30, 0.55], [0.50, 0.54], [0.68, 0.58]]
    ],
    poplar: [
      [[0.15, 0.72], [0.35, 0.70], [0.55, 0.74], [0.75, 0.70], [0.50, 0.78]],
      [[0.25, 0.60], [0.48, 0.58], [0.70, 0.62]]
    ],
    dragon_bridge: [
      [[0.30, 0.55], [0.40, 0.52], [0.50, 0.50], [0.60, 0.52], [0.70, 0.55], [0.50, 0.60]],
      [[0.25, 0.70], [0.45, 0.72], [0.65, 0.70], [0.50, 0.76]]
    ],
    canal_hq: [
      [[0.12, 0.70], [0.30, 0.68], [0.50, 0.72], [0.70, 0.68], [0.88, 0.74], [0.55, 0.78]],
      [[0.20, 0.58], [0.45, 0.56], [0.70, 0.60], [0.40, 0.64]]
    ],
    tea_master: [
      [[0.20, 0.68], [0.40, 0.66], [0.60, 0.70], [0.75, 0.66], [0.50, 0.74]],
      [[0.30, 0.55], [0.50, 0.54], [0.68, 0.58]]
    ],
    sword_wash: [
      [[0.18, 0.70], [0.40, 0.68], [0.60, 0.72], [0.78, 0.68], [0.50, 0.76]],
      [[0.28, 0.58], [0.48, 0.56], [0.68, 0.60]]
    ],
    gorge: [
      [[0.25, 0.48], [0.40, 0.50], [0.55, 0.48], [0.70, 0.50], [0.50, 0.55]],
      [[0.20, 0.70], [0.40, 0.72], [0.60, 0.70], [0.45, 0.76]]
    ],
    paper: [
      [[0.18, 0.70], [0.40, 0.68], [0.60, 0.72], [0.78, 0.68], [0.50, 0.76]],
      [[0.28, 0.58], [0.50, 0.56], [0.70, 0.60]]
    ],
    rain_hut: [
      [[0.20, 0.68], [0.42, 0.66], [0.62, 0.70], [0.78, 0.66], [0.50, 0.74]],
      [[0.30, 0.55], [0.52, 0.54], [0.70, 0.58]]
    ],
    ink_pool: [
      [[0.22, 0.68], [0.42, 0.66], [0.62, 0.70], [0.75, 0.66], [0.50, 0.74]],
      [[0.32, 0.55], [0.52, 0.54], [0.68, 0.58]]
    ],
    dye: [
      [[0.18, 0.70], [0.40, 0.68], [0.60, 0.72], [0.78, 0.68], [0.50, 0.76]],
      [[0.28, 0.58], [0.50, 0.56], [0.70, 0.60]]
    ],
    rainy_tea: [
      [[0.20, 0.68], [0.42, 0.66], [0.62, 0.70], [0.75, 0.66], [0.50, 0.74]],
      [[0.30, 0.55], [0.52, 0.54], [0.70, 0.58]]
    ],
    brewery: [
      [[0.15, 0.70], [0.35, 0.68], [0.55, 0.72], [0.75, 0.68], [0.50, 0.76]],
      [[0.25, 0.58], [0.48, 0.56], [0.68, 0.60]]
    ],
    pharmacy: [
      [[0.20, 0.68], [0.40, 0.66], [0.60, 0.70], [0.78, 0.66], [0.50, 0.74]],
      [[0.28, 0.55], [0.50, 0.54], [0.70, 0.58]]
    ],
    stone_forest: [
      [[0.18, 0.72], [0.38, 0.70], [0.58, 0.74], [0.78, 0.70], [0.50, 0.78]],
      [[0.28, 0.58], [0.50, 0.56], [0.70, 0.60]]
    ],
    garden_water: [
      [[0.18, 0.68], [0.40, 0.66], [0.60, 0.70], [0.78, 0.66], [0.50, 0.74]],
      [[0.28, 0.55], [0.50, 0.54], [0.70, 0.58]]
    ]
  };

  const imgCache = {};
  let agents = [];
  let lastMode = '';
  let dripAcc = 0;
  let farmAgents = [];

  function spriteUrl(key) {
    return 'assets/char_' + key + '.webp?v=' + ASSET_V;
  }
  function getImg(key) {
    if (!key) return null;
    if (imgCache[key]) return imgCache[key];
    const im = new Image();
    im.decoding = 'async';
    im.src = spriteUrl(key);
    imgCache[key] = im;
    return im;
  }
  // preload all
  ['farmer_m', 'farmer_f', 'merchant', 'doctor', 'scholar', 'soldier', 'hero'].forEach(getImg);

  function pickSprite(mode, i) {
    const pool = SPRITE_KEYS[mode] || SPRITE_KEYS.farm;
    return pool[i % pool.length];
  }

  function targetCount(S, mode) {
    if (!S) return 0;
    if (!SPRITE_KEYS[mode]) return 0;
    const plots = S.plotCount || 8;
    const fame = S.fame || 0;
    const gold = S.gold || 0;
    const hands = S.hands || 0;
    let n = 3;
    n += Math.floor(plots / 4);
    n += Math.floor(fame / 18);
    n += Math.floor(gold / 220);
    n += Math.min(4, hands);
    if (mode === 'market') n = Math.max(5, Math.floor(n * 0.75));
    if (mode === 'clinic') n = Math.max(6, Math.floor(n * 0.85)); /* 學徒＋病患 */
    if (mode === 'village') n = Math.max(5, Math.floor(n * 0.7));
    if (mode === 'drill' || mode === 'wild') n = Math.max(4, Math.min(10, Math.floor(n * 0.65)));
    if (mode === 'garden' || mode === 'swim') n = Math.max(4, Math.floor(n * 0.6));
    if (mode === 'moon') n = Math.max(5, Math.floor(n * 0.85));
    if (mode === 'mine') n = Math.max(4, Math.floor(n * 0.55));
    if (mode === 'post') n = Math.max(4, Math.floor(n * 0.6));
    if (mode === 'tavern') n = Math.max(5, Math.floor(n * 0.75));
    if (mode === 'academy') n = Math.max(4, Math.floor(n * 0.55));
    if (mode === 'frontier') n = Math.max(4, Math.min(10, Math.floor(n * 0.7)));
    if (mode === 'xiangbang' || mode === 'xianyang' || mode === 'guanshi') n = Math.max(7, Math.floor(n * 0.95));
    if (mode === 'palace' || mode === 'taihou' || mode === 'guowei' || mode === 'ying') n = Math.max(6, Math.floor(n * 0.8));
    if (mode === 'keguan' || mode === 'hejin' || mode === 'cimiao') n = Math.max(5, Math.floor(n * 0.7));
    if (mode === 'hut') n = Math.max(2, Math.min(4, Math.floor(n * 0.35)));
    if (mode === 'ruins' || mode === 'crypt' || mode === 'marsh') n = Math.max(5, Math.floor(n * 0.75));
    return Math.max(4, Math.min(MAX, n));
  }

  function spawnOne(mode, i) {
    const paths = PATHS[mode] || PATHS.farm;
    const path = paths[i % paths.length];
    const role = ROLES[i % ROLES.length];
    const wp = Math.floor(Math.random() * path.length);
    const sprite = pickSprite(mode, i);
    getImg(sprite);
    return {
      path, wp, t: Math.random(),
      x: path[wp][0], y: path[wp][1],
      speed: 0.016 + Math.random() * 0.02,
      role, sprite,
      bob: Math.random() * Math.PI * 2,
      scale: 0.9 + (i % 3) * 0.06,
      dir: 1, pause: 0, workFrame: 0
    };
  }

  function ensure(S, mode) {
    const n = targetCount(S, mode);
    if (mode !== lastMode) {
      agents = [];
      lastMode = mode;
    }
    while (agents.length < n) agents.push(spawnOne(mode, agents.length));
    while (agents.length > n) agents.pop();
    // refresh sprites if mode pool changed mid-life
    agents.forEach((a, i) => {
      if (!a.sprite) a.sprite = pickSprite(mode, i);
    });
    return n;
  }

  function ensureFarmMini(S, cols, rows) {
    const n = Math.min(MAX, Math.max(2, Math.floor(targetCount(S, 'farm') * 0.7)));
    while (farmAgents.length < n) {
      const i = farmAgents.length;
      const sprite = pickSprite('farm', i);
      getImg(sprite);
      farmAgents.push({
        col: Math.floor(Math.random() * cols),
        row: Math.floor(Math.random() * rows),
        tx: 0, ty: 0,
        x: Math.random(), y: Math.random(),
        speed: 0.32 + Math.random() * 0.38,
        role: ROLES[i % ROLES.length],
        sprite,
        bob: Math.random() * 6,
        wait: 0,
        dir: 1,
        scale: 0.92 + (i % 3) * 0.05
      });
      const a = farmAgents[i];
      a.tx = (a.col + 0.5) / cols;
      a.ty = (a.row + 0.5) / rows;
      a.x = a.tx; a.y = a.ty;
    }
    while (farmAgents.length > n) farmAgents.pop();
  }

  function stepAgent(a, dt) {
    a.bob += dt * 8;
    a.workFrame += dt * 6;
    if (a.pause > 0) {
      a.pause -= dt;
      return;
    }
    const path = a.path;
    const i0 = a.wp;
    const i1 = (i0 + 1) % path.length;
    const p0 = path[i0], p1 = path[i1];
    a.t += a.speed * dt;
    if (a.t >= 1) {
      a.t = 0;
      a.wp = i1;
      if (Math.random() < 0.28) a.pause = 0.4 + Math.random() * 0.9;
      return;
    }
    const nx = p0[0] + (p1[0] - p0[0]) * a.t;
    const ny = p0[1] + (p1[1] - p0[1]) * a.t;
    a.dir = nx >= a.x ? 1 : -1;
    a.x = nx;
    a.y = ny;
  }

  function stepFarmMini(a, dt, cols, rows, plots) {
    a.bob += dt * 9;
    if (a.wait > 0) {
      a.wait -= dt;
      return;
    }
    const dx = a.tx - a.x, dy = a.ty - a.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.02) {
      a.wait = 0.5 + Math.random() * 1.2;
      let tries = 8;
      while (tries--) {
        const c = Math.floor(Math.random() * cols);
        const r = Math.floor(Math.random() * rows);
        const idx = r * cols + c;
        if (!plots || !plots[idx] || plots[idx].unlocked) {
          a.col = c; a.row = r;
          a.tx = (c + 0.35 + Math.random() * 0.3) / cols;
          a.ty = (r + 0.4 + Math.random() * 0.3) / rows;
          break;
        }
      }
      return;
    }
    a.dir = dx >= 0 ? 1 : -1;
    const step = a.speed * dt;
    a.x += (dx / dist) * Math.min(step, dist);
    a.y += (dy / dist) * Math.min(step, dist);
  }

  /** 畫 Q 版 char_* 小人 + 頭頂圓形臉（保證睇到樣貌） */
  function faceUrl(key) {
    return 'assets/face_' + key + '.webp?v=' + ASSET_V;
  }
  const faceImgs = Object.create(null);
  function getFaceImg(key) {
    if (!faceImgs[key]) {
      const im = new Image();
      im.decoding = 'async';
      im.src = faceUrl(key);
      faceImgs[key] = im;
    }
    return faceImgs[key];
  }
  function drawSprite(g, x, y, a, cssPxTall, dpr) {
    const d = dpr || 1;
    const tall = (cssPxTall || 48) * (a.scale || 1) * d;
    const bob = Math.sin(a.bob) * 1.4 * ((a.pause > 0 || a.wait > 0) ? 0.25 : 1);
    const dir = a.dir || 1;
    const key = a.sprite || 'farmer_m';
    const im = getImg(key);
    g.save();
    g.translate(x, y + bob);
    // 影
    g.fillStyle = 'rgba(40,25,15,.22)';
    g.beginPath();
    g.ellipse(0, 2 * d, tall * 0.28, tall * 0.07, 0, 0, Math.PI * 2);
    g.fill();

    if (im && im.complete && im.naturalWidth > 0) {
      const ratio = im.naturalWidth / im.naturalHeight;
      const h = tall;
      const w = h * ratio;
      g.save();
      g.scale(dir, 1);
      g.drawImage(im, -w / 2, -h, w, h);
      g.restore();
    } else {
      g.fillStyle = '#5d4037';
      g.fillRect(-4 * d, -18 * d, 8 * d, 16 * d);
    }
    // 圓形臉：固定可讀尺寸（約 28–34 CSS px）
    const faceIm = getFaceImg(key);
    const faceR = Math.max(16 * d, Math.min(22 * d, tall * 0.48));
    const fy = -tall - faceR * 0.08;
    g.beginPath();
    g.arc(0, fy, faceR + 1.5 * d, 0, Math.PI * 2);
    g.fillStyle = 'rgba(201,163,90,.95)';
    g.fill();
    g.save();
    g.beginPath();
    g.arc(0, fy, faceR, 0, Math.PI * 2);
    g.clip();
    if (faceIm && faceIm.complete && faceIm.naturalWidth > 0) {
      const s = faceR * 2;
      g.drawImage(faceIm, -faceR, fy - faceR, s, s);
    } else {
      g.fillStyle = '#f0d5b8';
      g.fillRect(-faceR, fy - faceR, faceR * 2, faceR * 2);
    }
    g.restore();
    g.beginPath();
    g.arc(0, fy, faceR, 0, Math.PI * 2);
    g.strokeStyle = 'rgba(201,163,90,.9)';
    g.lineWidth = 1.5 * d;
    g.stroke();
    g.restore();
  }

  function resizeLayer(cv) {
    if (!cv) return;
    const stage = cv.parentElement;
    if (!stage) return;
    const w = stage.clientWidth || 360;
    const h = stage.clientHeight || 640;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const bw = Math.floor(w * dpr);
    const bh = Math.floor(h * dpr);
    if (cv.width !== bw || cv.height !== bh) {
      cv.width = bw;
      cv.height = bh;
      cv.style.width = w + 'px';
      cv.style.height = h + 'px';
    }
    return { w: bw, h: bh, dpr, cssW: w };
  }

  function drawScene(cv, S, mode) {
    if (!cv) return;
    const g = cv.getContext('2d');
    if (!g) return;
    const sz = resizeLayer(cv);
    if (!sz) return;
    g.clearRect(0, 0, sz.w, sz.h);
    if (!S || !SPRITE_KEYS[mode]) return;
    ensure(S, mode);
    const sorted = agents.slice().sort((a, b) => a.y - b.y);
    // ~40 CSS px tall on a ~390 wide phone
    const base = (mode === 'farm') ? 52 : 48;
    const cssTall = Math.max(40, Math.min(64, base * (sz.cssW / 390)));
    sorted.forEach((a) => {
      drawSprite(g, a.x * sz.w, a.y * sz.h, a, cssTall, sz.dpr);
    });
  }

  function drawOnFarmCanvas() {
    /* 已棄用：工人唔再畫入田格 canvas */
  }

  function update(dt, S, mode, cols, rows) {
    if (!S) return { drip: 0 };
    let drip = 0;
    if (SPRITE_KEYS[mode]) {
      ensure(S, mode);
      agents.forEach((a) => stepAgent(a, dt));
      dripAcc += dt * agents.length * 0.025;
      if (dripAcc >= 1) {
        drip = Math.floor(dripAcc);
        dripAcc -= drip;
      }
    } else {
      agents = [];
      lastMode = mode;
    }
    // 田莊工人只喺主場景 worker-layer 走，唔再綁田格格子
    return { drip, count: agents.length };
  }

  function maybeHire(S) {
    if (!S) return false;
    S.hands = (S.hands || 0);
    if (S.hands < 4 && Math.random() < 0.35) {
      S.hands++;
      return true;
    }
    return false;
  }

  function count(S, mode) {
    return targetCount(S, mode);
  }

  window.QianWorkers = {
    MAX,
    update,
    drawScene,
    drawOnFarmCanvas,
    maybeHire,
    count,
    ensure,
    spriteUrl,
    ASSET_V
  };
})();
