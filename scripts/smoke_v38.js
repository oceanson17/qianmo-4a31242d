/**
 * v38 smoke: screen stack exclusivity · dash UI · no title leak · version
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (full, href) => {
  const rel = href.split('?')[0];
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) return '<!-- missing ' + rel + ' -->';
  return '<style>\n' + fs.readFileSync(fp, 'utf8') + '\n</style>';
});
const scriptRe = /<script src="([^"]+)"><\/script>/g;
const tags = [];
let m;
while ((m = scriptRe.exec(html))) tags.push(m[1].split('?')[0]);
let bundled = '';
for (const rel of tags) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error('missing ' + rel);
  bundled += '\n;' + fs.readFileSync(p, 'utf8') + '\n';
}
html = html.replace(scriptRe, '');
html = html.replace('</body>', '<script>' + bundled + '</script></body>');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'https://oceanson17.github.io/qianmo-4a31242d/',
  beforeParse(window) {
    window.alert = () => {};
    window.confirm = () => true;
    let rafN = 0;
    window.requestAnimationFrame = (cb) => { if (rafN++ > 8) return 0; return setTimeout(() => cb(Date.now()), 16); };
    window.cancelAnimationFrame = (id) => clearTimeout(id);
    window.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
    window.HTMLCanvasElement.prototype.getContext = function () {
      const noop = () => {};
      return new Proxy({ canvas: this, fillStyle: '', strokeStyle: '', font: '', globalAlpha: 1,
        measureText(){ return { width: 0 }; },
        getImageData(){ return { data: new Uint8ClampedArray(4) }; },
        createImageData(){ return { data: new Uint8ClampedArray(4) }; }
      }, { get(t, p){ if (p in t) return t[p]; return noop; } });
    };
  }
});
const { window } = dom;
const document = window.document;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function visible(el) {
  if (!el) return false;
  if (el.hidden) return false;
  if (el.hasAttribute('hidden')) return false;
  const st = window.getComputedStyle(el);
  if (st.display === 'none' || st.visibility === 'hidden') return false;
  return true;
}

(async () => {
  await sleep(100);
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
  const gameSrc = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'dash.css'), 'utf8');
  const style = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

  assert(gameSrc.includes("GAME_VERSION = '38'"), 'version 38');
  assert(css.includes('dash-mode[hidden]'), 'dash hidden override');
  assert(style.includes('#screen-game.dash-mode[hidden]') || style.includes('#screen-game[hidden]'), 'style hidden override');
  assert(document.getElementById('dash-col-story'), 'story col');
  assert(document.getElementById('dash-story-inline'), 'story inline');
  assert(document.getElementById('dash-rel-profile'), 'profile rel');
  assert(document.querySelector('#screen-title h1').textContent.includes('近側'), 'title 近側');
  assert(!document.querySelector('#dash-loc').textContent.includes('鄉野'), 'no 鄉野 default');
  assert(document.getElementById('dash-cultivate').textContent.includes('推進'), 'cultivate label');

  // Title screen exclusive at boot
  const title = document.getElementById('screen-title');
  const game = document.getElementById('screen-game');
  assert(visible(title), 'title visible at boot');
  assert(!visible(game), 'game hidden at boot despite dash-mode');

  // Simulate entering game via showScreen path: click continue if available, else new+career
  // Force DOM like continueGame/showScreen
  title.hidden = true; title.setAttribute('hidden', ''); title.classList.remove('on');
  game.hidden = false; game.removeAttribute('hidden'); game.classList.add('on');
  document.getElementById('app').classList.add('dash-live');

  assert(!visible(title), 'title hidden after enter');
  assert(visible(game), 'game visible after enter');

  // Title menu must NOT be inside dash profile
  const profile = document.getElementById('dash-col-profile');
  assert(profile && !profile.querySelector('#btn-new'), 'no start-new inside profile');
  assert(profile && !profile.querySelector('.tmenu'), 'no tmenu inside profile');

  // Bottom tabs exist and story is default on
  const tabs = document.querySelectorAll('.dash-mobile-tabs button');
  assert(tabs.length === 4, '4 mobile tabs');
  const storyTab = document.querySelector('.dash-mobile-tabs button[data-col="story"]');
  assert(storyTab && storyTab.classList.contains('on'), 'story tab default on in HTML');

  // Food pill hidden
  const food = document.getElementById('dash-food-pill');
  assert(food && food.hidden, 'food pill hidden');

  // Side acts hidden
  const side = document.querySelector('.dash-side-acts');
  assert(side && side.hidden, 'bag/quest side hidden');

  // CSS: title menu should not show when dash-live
  assert(css.includes('#app.dash-live #screen-title'), 'dash-live hides title');

  console.log('SMOKE_V38_OK');
})().catch((e) => {
  console.error('SMOKE_V38_FAIL', e && e.stack || e);
  process.exit(1);
});
