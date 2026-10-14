/* 青阡 · 秦風裝備目錄（原創名目與圖示鍵，供屬性／副本／劇情門檻擴充）
 * stats: wu(武力) hu(護體) shen(身法) zhi(智計) bian(辯才) yun(氣運) ＋ atk/def/hp 兼容舊戰鬥
 * rarity: fan凡 / liang良 / zhen珍 / shi史 / chuan傳說  （兼相容 white/green/blue/purple/gold）
 */
(function (global) {
  const RARITY_MAP = {
    fan: 'white', liang: 'green', zhen: 'blue', shi: 'purple', chuan: 'gold',
    white: 'white', green: 'green', blue: 'blue', purple: 'purple', gold: 'gold'
  };
  const RARITY_LABEL = {
    white: '凡', green: '良', blue: '珍', purple: '史', gold: '傳說'
  };
  const STAT_LABEL = {
    wu: '武力', hu: '護體', shen: '身法', zhi: '智計', bian: '辯才', yun: '氣運',
    atk: '攻', def: '防', hp: '命'
  };
  const SLOT_LABEL = {
    weapon: '兵器', armor: '甲胄', accessory: '配飾', tool: '農器'
  };

  /** @type {Record<string, object>} */
  const EQUIP_TABLE = {
    /* —— 兵器 —— */
    mu_jian: {
      id: 'mu_jian', name: '桐木劍', slot: 'weapon', icon: 'jian', rarity: 'fan',
      atk: 3, def: 0, hp: 0, wu: 1, desc: '村塾習武之用，刃鈍而輕。'
    },
    tie_ren: {
      id: 'tie_ren', name: '鐵刃', slot: 'weapon', icon: 'dao', rarity: 'fan',
      atk: 5, def: 0, hp: 0, wu: 2, desc: '坊間鍛造短刃，利於近搏。'
    },
    qinggang_dao: {
      id: 'qinggang_dao', name: '青鋼刀', slot: 'weapon', icon: 'dao', rarity: 'liang',
      atk: 7, def: 0, hp: 2, wu: 3, desc: '青鋼淬火，刃映寒光。'
    },
    shuangwen_jian: {
      id: 'shuangwen_jian', name: '霜紋劍', slot: 'weapon', icon: 'jian', rarity: 'zhen',
      atk: 9, def: 1, hp: 0, wu: 4, shen: 1, desc: '劍身隱現霜紋，出手迅疾。'
    },
    tong_ge: {
      id: 'tong_ge', name: '青銅戈', slot: 'weapon', icon: 'ge', rarity: 'liang',
      atk: 6, def: 1, hp: 0, wu: 3, desc: '車戰遺制，橫擊可斷馬足。'
    },
    longyuan_jian: {
      id: 'longyuan_jian', name: '龍淵劍', slot: 'weapon', icon: 'jian', rarity: 'shi',
      atk: 12, def: 1, hp: 4, wu: 5, zhi: 1, desc: '歐冶子一系傳說，名聞列國。'
    },
    tai_e: {
      id: 'tai_e', name: '泰阿劍', slot: 'weapon', icon: 'jian', rarity: 'chuan',
      atk: 15, def: 2, hp: 6, wu: 6, yun: 2, desc: '王者之劍，氣吞山河。'
    },
    chang_mao: {
      id: 'chang_mao', name: '丈八矛', slot: 'weapon', icon: 'mao', rarity: 'liang',
      atk: 8, def: 0, hp: 0, wu: 3, shen: -1, desc: '步陣長兵，先發制人。'
    },
    xuan_ji: {
      id: 'xuan_ji', name: '玄鐵戟', slot: 'weapon', icon: 'ji', rarity: 'zhen',
      atk: 10, def: 1, hp: 2, wu: 4, desc: '矛戈合一，可刺可 Hook。'
    },
    qin_nu: {
      id: 'qin_nu', name: '秦弩', slot: 'weapon', icon: 'nu', rarity: 'zhen',
      atk: 11, def: 0, hp: 0, wu: 4, shen: 1, desc: '機括精巧，百步穿楊。'
    },
    shan_gong: {
      id: 'shan_gong', name: '山桑弓', slot: 'weapon', icon: 'gong', rarity: 'liang',
      atk: 6, def: 0, hp: 0, wu: 2, shen: 2, desc: '獵戶常用，彎如滿月。'
    },
    xing_shi_fu: {
      id: 'xing_shi_fu', name: '刑尸斧', slot: 'weapon', icon: 'fu', rarity: 'shi',
      atk: 13, def: 0, hp: 0, wu: 5, bian: -1, desc: '軍法刑具改鍛，殺氣逼人。'
    },
    tong_chui: {
      id: 'tong_chui', name: '鑄銅錘', slot: 'weapon', icon: 'chui', rarity: 'liang',
      atk: 8, def: 1, hp: 4, wu: 3, shen: -1, desc: '重逾十斤，破甲如泥。'
    },
    niu_bian: {
      id: 'niu_bian', name: '牛皮軟鞭', slot: 'weapon', icon: 'bian', rarity: 'fan',
      atk: 4, def: 0, hp: 0, wu: 1, shen: 2, desc: '可纏腕奪兵，亦可驅馬。'
    },
    bi_shou: {
      id: 'bi_shou', name: '魚腸匕', slot: 'weapon', icon: 'bishou', rarity: 'shi',
      atk: 9, def: 0, hp: 0, wu: 3, shen: 3, zhi: 1, desc: '專諸舊式，袖中藏鋒。'
    },
    lie_jian: {
      id: 'lie_jian', name: '獵弓', slot: 'weapon', icon: 'gong', rarity: 'fan',
      atk: 4, def: 0, hp: 0, wu: 2, shen: 1, desc: '出身獵戶，隨行山野。'
    },
    jian_shi_jian: {
      id: 'jian_shi_jian', name: '劍士佩劍', slot: 'weapon', icon: 'jian', rarity: 'zhen',
      atk: 8, def: 1, hp: 2, wu: 3, bian: 1, desc: '遊士腰間常物，見人先見劍。'
    },
    wu_gou: {
      id: 'wu_gou', name: '吳鉤', slot: 'weapon', icon: 'dao', rarity: 'shi',
      atk: 11, def: 0, hp: 2, wu: 4, shen: 2, desc: '彎刃如月，吳越遺風。'
    },
    han_shi_jian: {
      id: 'han_shi_jian', name: '寒矢束', slot: 'weapon', icon: 'arrow', rarity: 'liang',
      atk: 5, def: 0, hp: 0, wu: 2, shen: 1, desc: '精選箭簇，配弓弩用。'
    },
    ju_que: {
      id: 'ju_que', name: '巨闕', slot: 'weapon', icon: 'jian', rarity: 'chuan',
      atk: 16, def: 1, hp: 4, wu: 7, desc: '歐冶子五劍之一，巨刃難當。'
    },

    /* —— 甲胄 —— */
    bu_yi: {
      id: 'bu_yi', name: '布衣', slot: 'armor', icon: 'jia', rarity: 'fan',
      atk: 0, def: 2, hp: 8, hu: 1, desc: '尋常麻布短褐。'
    },
    pi_jia: {
      id: 'pi_jia', name: '牛皮甲', slot: 'armor', icon: 'jia', rarity: 'fan',
      atk: 0, def: 4, hp: 12, hu: 2, desc: '鞣皮綴成，輕便耐磨。'
    },
    tie_kai: {
      id: 'tie_kai', name: '鐵札甲', slot: 'armor', icon: 'kai', rarity: 'liang',
      atk: 0, def: 6, hp: 18, hu: 3, shen: -1, desc: '鐵札層疊，可禦矢石。'
    },
    xuan_jia: {
      id: 'xuan_jia', name: '玄甲', slot: 'armor', icon: 'kai', rarity: 'zhen',
      atk: 1, def: 8, hp: 24, hu: 4, wu: 1, desc: '玄漆鐵甲，軍中精銳所服。'
    },
    tong_dun: {
      id: 'tong_dun', name: '圓形銅盾', slot: 'armor', icon: 'dun', rarity: 'liang',
      atk: 0, def: 5, hp: 10, hu: 3, desc: '盾心飾獸面，擋槍箭。'
    },
    pi_zhou: {
      id: 'pi_zhou', name: '皮胄', slot: 'armor', icon: 'zhou', rarity: 'fan',
      atk: 0, def: 3, hp: 6, hu: 1, desc: '護顱皮盔，農兵常用。'
    },
    tong_zhou: {
      id: 'tong_zhou', name: '青銅胄', slot: 'armor', icon: 'zhou', rarity: 'zhen',
      atk: 0, def: 7, hp: 14, hu: 3, desc: '頂飾紅纓，陣前生威。'
    },
    yu_lin_jia: {
      id: 'yu_lin_jia', name: '魚鱗甲', slot: 'armor', icon: 'kai', rarity: 'shi',
      atk: 1, def: 10, hp: 28, hu: 5, shen: 1, desc: '鱗片細密，如魚遊水。'
    },
    jin_zhou: {
      id: 'jin_zhou', name: '鎏金胄', slot: 'armor', icon: 'zhou', rarity: 'chuan',
      atk: 2, def: 12, hp: 32, hu: 6, yun: 1, bian: 1, desc: '鎏金映日，將印在身。'
    },
    he_zong_jia: {
      id: 'he_zong_jia', name: '合縱軟甲', slot: 'armor', icon: 'jia', rarity: 'zhen',
      atk: 0, def: 6, hp: 16, hu: 3, shen: 2, zhi: 1, desc: '輕甲利行，遊說列國者愛用。'
    },
    bian_jun_kai: {
      id: 'bian_jun_kai', name: '邊軍鎧', slot: 'armor', icon: 'kai', rarity: 'liang',
      atk: 1, def: 7, hp: 20, hu: 3, wu: 1, desc: '邊關鐵卒制式甲。'
    },
    si_jia: {
      id: 'si_jia', name: '絲綿甲', slot: 'armor', icon: 'jia', rarity: 'liang',
      atk: 0, def: 4, hp: 14, hu: 2, shen: 2, desc: '絲棉層疊，可減箭傷。'
    },
    long_wen_dun: {
      id: 'long_wen_dun', name: '龍紋盾', slot: 'armor', icon: 'dun', rarity: 'shi',
      atk: 0, def: 9, hp: 16, hu: 4, yun: 1, desc: '盾面鑄龍，震懾敵膽。'
    },

    /* —— 配飾 —— */
    cao_huan: {
      id: 'cao_huan', name: '草繩環', slot: 'accessory', icon: 'huan', rarity: 'fan',
      atk: 1, def: 0, hp: 4, yun: 1, desc: '山野小兒所結，圖個吉利。'
    },
    yu_pei: {
      id: 'yu_pei', name: '青玉佩', slot: 'accessory', icon: 'pei', rarity: 'liang',
      atk: 1, def: 1, hp: 8, bian: 1, yun: 1, desc: '溫潤如脂，君子比德。'
    },
    hu_xin_jing: {
      id: 'hu_xin_jing', name: '護心鏡', slot: 'accessory', icon: 'mirror', rarity: 'zhen',
      atk: 2, def: 2, hp: 10, hu: 2, wu: 1, desc: '圓鏡護臆，可擋一刀。'
    },
    jin_si_zhui: {
      id: 'jin_si_zhui', name: '金絲墜', slot: 'accessory', icon: 'pei', rarity: 'shi',
      atk: 3, def: 2, hp: 14, bian: 2, yun: 1, desc: '金絲纏玉，貴冑所尚。'
    },
    bi_huan: {
      id: 'bi_huan', name: '和氏璧環', slot: 'accessory', icon: 'yu', rarity: 'chuan',
      atk: 2, def: 2, hp: 12, zhi: 2, bian: 3, yun: 3, desc: '完璧歸趙之餘韻（戲說），氣運非凡。'
    },
    xing_lv_pei: {
      id: 'xing_lv_pei', name: '行旅佩', slot: 'accessory', icon: 'pei', rarity: 'liang',
      atk: 2, def: 1, hp: 6, shen: 1, yun: 1, desc: '遠行者繫於腰間。'
    },
    guan_yin: {
      id: 'guan_yin', name: '半通官印', slot: 'accessory', icon: 'yin', rarity: 'shi',
      atk: 1, def: 1, hp: 8, bian: 2, zhi: 2, desc: '印鈕作虎，見官不卑。'
    },
    wu_fu: {
      id: 'wu_fu', name: '五色符', slot: 'accessory', icon: 'talisman', rarity: 'zhen',
      atk: 1, def: 1, hp: 6, zhi: 2, yun: 2, desc: '方士所書，鎮邪安神。'
    },
    yao_dai: {
      id: 'yao_dai', name: '藥囊', slot: 'accessory', icon: 'dai', rarity: 'liang',
      atk: 0, def: 1, hp: 12, zhi: 1, hu: 1, desc: '內貯草藥，行醫必備。'
    },
    qian_dai: {
      id: 'qian_dai', name: '錢袋', slot: 'accessory', icon: 'dai', rarity: 'fan',
      atk: 0, def: 0, hp: 4, bian: 1, yun: 1, desc: '鼓鼓囊囊，商賈喜歡。'
    },
    yu_bi: {
      id: 'yu_bi', name: '素玉璧', slot: 'accessory', icon: 'yu', rarity: 'zhen',
      atk: 0, def: 2, hp: 10, bian: 2, yun: 2, desc: '圓孔玉璧，朝聘信物。'
    },
    wen_bi: {
      id: 'wen_bi', name: '狼毫筆', slot: 'accessory', icon: 'bi', rarity: 'liang',
      atk: 0, def: 0, hp: 4, zhi: 2, bian: 2, desc: '筆墨隨身，可書可辯。'
    },
    ge_dai: {
      id: 'ge_dai', name: '革帶鉤', slot: 'accessory', icon: 'belt', rarity: 'liang',
      atk: 1, def: 1, hp: 6, hu: 1, shen: 1, desc: '銅鉤束帶，腰肢利落。'
    },
    pi_lv: {
      id: 'pi_lv', name: '麂皮履', slot: 'accessory', icon: 'boots', rarity: 'liang',
      atk: 0, def: 1, hp: 4, shen: 3, desc: '輕履如飛，利於奔走。'
    },
    long_xi_pei: {
      id: 'long_xi_pei', name: '隴西玉璜', slot: 'accessory', icon: 'pei', rarity: 'shi',
      atk: 2, def: 2, hp: 10, zhi: 1, yun: 2, desc: '西陲美玉，邊市奇貨。'
    },
    lu_shi_yin: {
      id: 'lu_shi_yin', name: '呂氏門客符', slot: 'accessory', icon: 'talisman', rarity: 'shi',
      atk: 1, def: 1, hp: 8, bian: 2, zhi: 1, yun: 1, desc: '相邦門下信物，可通關節。'
    },
    wang_fu_pei: {
      id: 'wang_fu_pei', name: '王府賜佩', slot: 'accessory', icon: 'pei', rarity: 'shi',
      atk: 2, def: 2, hp: 10, wu: 1, bian: 1, yun: 2, desc: '少年王近侍所賜。'
    },
    sai_shi_huan: {
      id: 'sai_shi_huan', name: '塞市商環', slot: 'accessory', icon: 'huan', rarity: 'zhen',
      atk: 1, def: 0, hp: 6, bian: 2, yun: 2, desc: '邊市盟互市信物。'
    },

    /* —— 農器（可裝備於 tool 槽，兼作戰鬥微加） —— */
    mu_chu: {
      id: 'mu_chu', name: '木鋤', slot: 'tool', icon: 'chu', rarity: 'fan',
      atk: 1, def: 0, hp: 2, wu: 0, desc: '田間翻土，亦可自衛。', farmBonus: 1
    },
    tie_chu: {
      id: 'tie_chu', name: '鐵鋤', slot: 'tool', icon: 'chu', rarity: 'liang',
      atk: 2, def: 0, hp: 4, wu: 1, desc: '鐵刃入土，事半功倍。', farmBonus: 2
    },
    lian_dao: {
      id: 'lian_dao', name: '月牙鐮', slot: 'tool', icon: 'lian', rarity: 'liang',
      atk: 3, def: 0, hp: 2, wu: 1, shen: 1, desc: '收割利器，刃如新月。', farmBonus: 2
    },
    li_hua: {
      id: 'li_hua', name: '犁鏵', slot: 'tool', icon: 'li', rarity: 'zhen',
      atk: 2, def: 1, hp: 6, hu: 1, desc: '深耕細作，地力倍增。', farmBonus: 3
    },
    jin_lian: {
      id: 'jin_lian', name: '金錯鐮', slot: 'tool', icon: 'lian', rarity: 'shi',
      atk: 4, def: 1, hp: 4, wu: 1, yun: 1, desc: '錯金紋飾，田莊誇示。', farmBonus: 3
    },
    shen_nong_chu: {
      id: 'shen_nong_chu', name: '神農遺鋤', slot: 'tool', icon: 'chu', rarity: 'chuan',
      atk: 5, def: 2, hp: 10, wu: 2, yun: 2, desc: '傳說農帝所用，顆粒滿倉。', farmBonus: 5
    }
  };

  /** 舊 GEAR_BASE 名稱 → 目錄 id，方便掉落與開局銜接 */
  const LEGACY_NAME_TO_ID = {
    '木劍': 'mu_jian', '鐵刃': 'tie_ren', '青鋼刀': 'qinggang_dao', '霜紋劍': 'shuangwen_jian',
    '布衣': 'bu_yi', '皮甲': 'pi_jia', '鐵鎧': 'tie_kai', '玄甲': 'xuan_jia',
    '草繩環': 'cao_huan', '玉佩': 'yu_pei', '護心鏡': 'hu_xin_jing', '金絲墜': 'jin_si_zhui',
    '獵弓': 'lie_jian', '行旅佩': 'xing_lv_pei'
  };

  function normalizeRarity(r) {
    return RARITY_MAP[r] || 'white';
  }

  function rarityLabel(r) {
    return RARITY_LABEL[normalizeRarity(r)] || '凡';
  }

  function iconPath(iconKey) {
    if (!iconKey) return 'assets/equip/jian.webp';
    return 'assets/equip/' + iconKey + '.webp';
  }

  function getDef(idOrName) {
    if (!idOrName) return null;
    if (EQUIP_TABLE[idOrName]) return EQUIP_TABLE[idOrName];
    const mapped = LEGACY_NAME_TO_ID[idOrName];
    return mapped ? EQUIP_TABLE[mapped] : null;
  }

  /** 由目錄生成一件實例（帶唯一 id） */
  function spawn(tableId, seq, rarityOverride) {
    const def = EQUIP_TABLE[tableId];
    if (!def) return null;
    const rarity = normalizeRarity(rarityOverride || def.rarity);
    return {
      id: 'g' + seq,
      tableId: def.id,
      slot: def.slot === 'tool' ? 'accessory' : def.slot, //  interim: tool 暫入飾品槽，待四槽擴充
      name: def.name,
      icon: def.icon,
      atk: def.atk || 0,
      def: def.def || 0,
      hp: def.hp || 0,
      wu: def.wu || 0,
      hu: def.hu || 0,
      shen: def.shen || 0,
      zhi: def.zhi || 0,
      bian: def.bian || 0,
      yun: def.yun || 0,
      farmBonus: def.farmBonus || 0,
      rarity,
      desc: def.desc || ''
    };
  }

  /** 按槽位與稀有度權重抽一件 */
  function rollFromPool(slot, rarity, seq) {
    const pool = Object.values(EQUIP_TABLE).filter((e) => {
      const s = e.slot === 'tool' ? 'accessory' : e.slot;
      return s === slot && normalizeRarity(e.rarity) === rarity;
    });
    // 若該稀有度無對應，放寬至同槽任意
    const use = pool.length ? pool : Object.values(EQUIP_TABLE).filter((e) => {
      const s = e.slot === 'tool' ? 'accessory' : e.slot;
      return s === slot;
    });
    if (!use.length) return null;
    const def = use[Math.floor(Math.random() * use.length)];
    return spawn(def.id, seq, rarity);
  }

  function listBySlot(slot) {
    return Object.values(EQUIP_TABLE).filter((e) => e.slot === slot);
  }

  function formatStats(g) {
    const parts = [];
    if (g.atk) parts.push('攻+' + g.atk);
    if (g.def) parts.push('防+' + g.def);
    if (g.hp) parts.push('命+' + g.hp);
    if (g.wu) parts.push('武+' + g.wu);
    if (g.hu) parts.push('護+' + g.hu);
    if (g.shen) parts.push('身+' + g.shen);
    if (g.zhi) parts.push('智+' + g.zhi);
    if (g.bian) parts.push('辯+' + g.bian);
    if (g.yun) parts.push('運+' + g.yun);
    if (g.farmBonus) parts.push('農+' + g.farmBonus);
    return parts.join(' · ') || '無加成';
  }

  function heroAttrsFromGear(gearList, equipped) {
    const a = { wu: 0, hu: 0, shen: 0, zhi: 0, bian: 0, yun: 0, farmBonus: 0 };
    if (!equipped || !gearList) return a;
    ['weapon', 'armor', 'accessory'].forEach((slot) => {
      const id = equipped[slot];
      if (!id) return;
      const g = gearList.find((x) => x.id === id);
      if (!g) return;
      a.wu += g.wu || 0;
      a.hu += g.hu || 0;
      a.shen += g.shen || 0;
      a.zhi += g.zhi || 0;
      a.bian += g.bian || 0;
      a.yun += g.yun || 0;
      a.farmBonus += g.farmBonus || 0;
    });
    return a;
  }

  // 場景擴充預留（梯田／鐵盟／觀星）
  const SCENE_HOOKS = {
    terraces: { id: 'terraces', name: '層田', bg: 'assets/bg_terraces.webp', status: 'live' },
    iron_league: { id: 'iron_league', name: '鐵盟坊', bg: 'assets/bg_iron_league.webp', status: 'live' },
    stargaze: { id: 'stargaze', name: '觀星隱廬', bg: 'assets/bg_stargaze.webp', status: 'live' },
    gorge: { id: 'gorge', name: '雲縫谷', bg: 'assets/bg_gorge.webp', status: 'live' },
    stone_forest: { id: 'stone_forest', name: '石林', bg: 'assets/bg_stone_forest.webp', status: 'live' }
  };

  global.QianEquip = {
    EQUIP_TABLE,
    RARITY_LABEL,
    STAT_LABEL,
    SLOT_LABEL,
    LEGACY_NAME_TO_ID,
    SCENE_HOOKS,
    normalizeRarity,
    rarityLabel,
    iconPath,
    getDef,
    spawn,
    rollFromPool,
    listBySlot,
    formatStats,
    heroAttrsFromGear,
    count: Object.keys(EQUIP_TABLE).length
  };
})(typeof window !== 'undefined' ? window : globalThis);
