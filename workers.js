/* 青阡 · 田莊／坊市／藥廬 原創工人層（canvas 點繪，非抄圖） */
(() => {
  'use strict';

  const MAX = 12;
  const ROLES = [
    { id: 'hoe', label: '耕', carry: false },
    { id: 'water', label: '澆', carry: false },
    { id: 'basket', label: '擔', carry: true },
    { id: 'cart', label: '車', carry: true },
    { id: 'seed', label: '播', carry: false }
  ];
  // 國風衣色（土褐／靛青／硃砂／葵綠）
  const PALETTES = [
    { body: '#5d4037', sash: '#c9a227', hat: '#3e2723', skin: '#f0d5b8' },
    { body: '#37474f', sash: '#b8323a', hat: '#263238', skin: '#e8c4a0' },
    { body: '#556b2f', sash: '#c9a227', hat: '#3e4a28', skin: '#f2d8bc' },
    { body: '#6d4c41', sash: '#4a6741', hat: '#4e342e', skin: '#edd0b0' },
    { body: '#455a64', sash: '#c9a227', hat: '#1c313a', skin: '#f5dcc0' },
    { body: '#8d6e63', sash: '#b8323a', hat: '#5d4037', skin: '#eac4a2' }
  ];

  const PATHS = {
    farm: [
      [[0.08, 0.72], [0.22, 0.68], [0.38, 0.74], [0.55, 0.70], [0.72, 0.76], [0.88, 0.70], [0.72, 0.62], [0.45, 0.66], [0.22, 0.60]],
      [[0.12, 0.58], [0.30, 0.55], [0.48, 0.58], [0.65, 0.52], [0.82, 0.56], [0.70, 0.64], [0.40, 0.60], [0.18, 0.64]],
      [[0.18, 0.78], [0.35, 0.82], [0.55, 0.78], [0.75, 0.84], [0.90, 0.78], [0.60, 0.72], [0.35, 0.76]],
      [[0.25, 0.48], [0.42, 0.52], [0.60, 0.48], [0.78, 0.50], [0.55, 0.56], [0.32, 0.54]]
    ],
    market: [
      [[0.10, 0.70], [0.30, 0.68], [0.50, 0.72], [0.70, 0.68], [0.88, 0.74], [0.65, 0.78], [0.40, 0.74], [0.20, 0.76]],
      [[0.15, 0.60], [0.40, 0.58], [0.65, 0.62], [0.85, 0.58], [0.55, 0.66], [0.28, 0.64]]
    ],
    clinic: [
      [[0.18, 0.72], [0.35, 0.70], [0.55, 0.74], [0.72, 0.70], [0.50, 0.78], [0.28, 0.76]],
      [[0.22, 0.62], [0.45, 0.60], [0.68, 0.64], [0.48, 0.68], [0.30, 0.66]]
    ]
  };

  let agents = [];
  let lastMode = '';
  let dripAcc = 0;
  let lastTs = 0;
  let farmAgents = []; // 田畦 canvas 上的小人

  function targetCount(S, mode) {
    if (!S) return 0;
    if (mode !== 'farm' && mode !== 'market' && mode !== 'clinic') return 0;
    const plots = S.plotCount || 8;
    const fame = S.fame || 0;
    const gold = S.gold || 0;
    const hands = S.hands || 0;
    let n = 3;
    n += Math.floor(plots / 4);          // 擴田
    n += Math.floor(fame / 18);          // 名聲
    n += Math.floor(gold / 220);         // 家資
    n += Math.min(4, hands);            // 僱工
    if (mode === 'market') n = Math.max(2, Math.floor(n * 0.55));
    if (mode === 'clinic') n = Math.max(2, Math.floor(n * 0.4));
    return Math.max(3, Math.min(MAX, n));
  }

  function spawnOne(mode, i) {
    const paths = PATHS[mode] || PATHS.farm;
    const path = paths[i % paths.length];
    const role = ROLES[i % ROLES.length];
    const pal = PALETTES[i % PALETTES.length];
    const wp = Math.floor(Math.random() * path.length);
    return {
      path,
      wp,
      t: Math.random(),
      x: path[wp][0],
      y: path[wp][1],
      speed: 0.018 + Math.random() * 0.022,
      role,
      pal,
      bob: Math.random() * Math.PI * 2,
      scale: 0.85 + (i % 3) * 0.08,
      dir: 1,
      pause: 0,
      workFrame: 0
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
    return n;
  }

  function ensureFarmMini(S, cols, rows) {
    const n = Math.min(MAX, Math.max(2, Math.floor(targetCount(S, 'farm') * 0.7)));
    while (farmAgents.length < n) {
      const i = farmAgents.length;
      farmAgents.push({
        col: Math.floor(Math.random() * cols),
        row: Math.floor(Math.random() * rows),
        tx: 0, ty: 0,
        x: Math.random(), y: Math.random(),
        speed: 0.35 + Math.random() * 0.4,
        role: ROLES[i % ROLES.length],
        pal: PALETTES[i % PALETTES.length],
        bob: Math.random() * 6,
        wait: 0
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
      // 偶爾停下來「幹活」
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
      // 揀下一塊已開田
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
    const step = a.speed * dt;
    a.x += (dx / dist) * Math.min(step, dist);
    a.y += (dy / dist) * Math.min(step, dist);
  }

  /** 畫一個迷你國風工人（頭＋身＋笠／籃） */
  function drawChibi(g, x, y, a, pxScale) {
    const s = (a.scale || 1) * pxScale;
    const bob = Math.sin(a.bob) * 1.2 * (a.pause > 0 ? 0.3 : 1);
    const face = a.dir || 1;
    g.save();
    g.translate(x, y + bob);
    g.scale(face, 1);

    // 影
    g.fillStyle = 'rgba(40,25,15,.22)';
    g.beginPath();
    g.ellipse(0, 2, 5 * s, 1.6 * s, 0, 0, Math.PI * 2);
    g.fill();

    // 身
    g.fillStyle = a.pal.body;
    g.fillRect(-3.5 * s, -10 * s, 7 * s, 10 * s);
    // 腰帶
    g.fillStyle = a.pal.sash;
    g.fillRect(-3.5 * s, -4 * s, 7 * s, 1.6 * s);

    // 頭
    g.fillStyle = a.pal.skin;
    g.beginPath();
    g.arc(0, -13 * s, 3.4 * s, 0, Math.PI * 2);
    g.fill();

    // 斗笠
    g.fillStyle = a.pal.hat;
    g.beginPath();
    g.moveTo(-5.5 * s, -14.5 * s);
    g.lineTo(0, -18 * s);
    g.lineTo(5.5 * s, -14.5 * s);
    g.closePath();
    g.fill();

    // 擔物／籃
    if (a.role && a.role.carry) {
      const swing = Math.sin(a.bob * 1.3) * 1.5;
      g.strokeStyle = '#5d4037';
      g.lineWidth = 1.2 * s;
      g.beginPath();
      g.moveTo(-7 * s, -8 * s + swing);
      g.lineTo(7 * s, -8 * s - swing);
      g.stroke();
      g.fillStyle = '#c9a227';
      g.beginPath();
      g.ellipse(-7 * s, -6 * s + swing, 2.4 * s, 2 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.ellipse(7 * s, -6 * s - swing, 2.4 * s, 2 * s, 0, 0, Math.PI * 2);
      g.fill();
      // 籃裡小綠點（菜／藥）
      g.fillStyle = a.role.id === 'cart' ? '#8d6e63' : '#66bb6a';
      g.fillRect(-8 * s, -7.5 * s + swing, 2 * s, 2 * s);
      g.fillRect(6 * s, -7.5 * s - swing, 2 * s, 2 * s);
    } else if (a.pause > 0 || (a.wait && a.wait > 0)) {
      // 幹活：揮鋤／澆
      const ang = Math.sin(a.workFrame || a.bob) * 0.6;
      g.save();
      g.translate(4 * s, -6 * s);
      g.rotate(ang);
      g.strokeStyle = '#5d4037';
      g.lineWidth = 1.4 * s;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(0, 8 * s);
      g.stroke();
      g.fillStyle = a.role && a.role.id === 'water' ? '#64b5f6' : '#90a4ae';
      g.fillRect(-2 * s, 7 * s, 5 * s, 2.5 * s);
      g.restore();
    }

    // 腳（走路）
    if (!(a.pause > 0) && !(a.wait > 0)) {
      const leg = Math.sin(a.bob * 2) * 2 * s;
      g.fillStyle = '#3e2723';
      g.fillRect(-2.8 * s, 0, 2 * s, 3 * s + leg);
      g.fillRect(0.8 * s, 0, 2 * s, 3 * s - leg);
    } else {
      g.fillStyle = '#3e2723';
      g.fillRect(-2.5 * s, 0, 2.2 * s, 3 * s);
      g.fillRect(0.5 * s, 0, 2.2 * s, 3 * s);
    }

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
    return { w: bw, h: bh, dpr };
  }

  function drawScene(cv, S, mode) {
    if (!cv) return;
    const g = cv.getContext('2d');
    const sz = resizeLayer(cv);
    if (!sz) return;
    g.clearRect(0, 0, sz.w, sz.h);
    if (!S || (mode !== 'farm' && mode !== 'market' && mode !== 'clinic')) return;
    ensure(S, mode);
    // 深度排序
    const sorted = agents.slice().sort((a, b) => a.y - b.y);
    const px = 1.15 * sz.dpr * (sz.w / 390);
    sorted.forEach((a) => {
      drawChibi(g, a.x * sz.w, a.y * sz.h, a, px);
    });
  }

  function drawOnFarmCanvas(g, W, H, S, cols, rows) {
    if (!S || !g) return;
    ensureFarmMini(S, cols, rows);
    const sorted = farmAgents.slice().sort((a, b) => a.y - b.y);
    sorted.forEach((a) => {
      drawChibi(g, a.x * W, a.y * H, a, 0.95);
    });
  }

  function update(dt, S, mode, cols, rows) {
    if (!S) return { drip: 0 };
    let drip = 0;
    if (mode === 'farm' || mode === 'market' || mode === 'clinic') {
      ensure(S, mode);
      agents.forEach((a) => stepAgent(a, dt));
      // 輕微銀兩滴漏：每人約每 40 秒 +1，總量有上限感
      dripAcc += dt * agents.length * 0.025;
      if (dripAcc >= 1) {
        drip = Math.floor(dripAcc);
        dripAcc -= drip;
      }
    } else {
      agents = [];
      lastMode = mode;
    }
    if (mode === 'farm') {
      ensureFarmMini(S, cols || 6, rows || 4);
      farmAgents.forEach((a) => stepFarmMini(a, dt, cols || 6, rows || 4, S.plots));
    }
    return { drip, count: agents.length };
  }

  function maybeHire(S) {
    // 擴田時偶爾多一個長工名額
    if (!S) return;
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
    ensure
  };
})();
