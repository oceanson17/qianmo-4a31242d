// smoke v46: asset presence + version
const fs = require('fs');
const assert = (c,m)=>{ if(!c) throw new Error(m); };
const html = fs.readFileSync('index.html','utf8');
assert(html.includes('style.css?v=46'), 'css v46');
assert(html.includes('hud-ver') && html.includes('v46'), 'hud ver');
const js = fs.readFileSync('game.js','utf8');
assert(js.includes("GAME_VERSION = '46'"), 'GAME_VERSION');
assert(js.includes("scribe: 'scribe'"), 'face map scribe');
assert(js.includes('origin-thumb'), 'origin thumbs');
const keys = ['scribe','courier','smith','agent','boatman','herbalist','diviner','doctor','farmer_m'];
for (const k of keys) {
  assert(fs.existsSync('assets/face_'+k+'.webp'), 'face '+k);
  assert(fs.existsSync('assets/char_'+k+'.webp'), 'char '+k);
}
assert(fs.existsSync('assets/ui/parchment_tile_v46.webp'), 'parchment');
assert(fs.existsSync('assets/ui/dock_bar_v46.webp'), 'dock');
assert(fs.existsSync('assets/raw/chibi_105.png'), 'raw 105');
console.log('smoke_v46 OK');
