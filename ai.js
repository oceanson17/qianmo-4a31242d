/* 青阡 AI：OpenAI 相容簡版（對白／指令）；無 Key 時由 game 走離線劇本 */
(function (global) {
  'use strict';
  var PRESETS = {
    deepseek: { n: 'DeepSeek', base: 'https://api.deepseek.com/v1', model: 'deepseek-chat', models: ['deepseek-chat', 'deepseek-reasoner'] },
    xai: { n: 'xAI', base: 'https://api.x.ai/v1', model: 'grok-4-fast', models: ['grok-4-fast', 'grok-3-mini'] },
    openai: { n: 'OpenAI', base: 'https://api.openai.com/v1', model: 'gpt-4o-mini', models: ['gpt-4o-mini', 'gpt-4o'] },
    openrouter: { n: 'OpenRouter', base: 'https://openrouter.ai/api/v1', model: 'deepseek/deepseek-chat', models: ['deepseek/deepseek-chat', 'x-ai/grok-4-fast'] },
    custom: { n: '自訂', base: '', model: '', models: [] }
  };
  var SET = { ai: false, key: '', base: 'https://api.deepseek.com/v1', model: 'deepseek-chat', preset: 'deepseek', temp: 0.8, maxTok: 600, aiTimeout: 45 };
  var KEY = 'qianmo_settings_v1';

  function loadSettings() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
      Object.keys(SET).forEach(function (k) { if (o[k] != null) SET[k] = o[k]; });
    } catch (e) {}
    return SET;
  }
  function saveSettings() {
    try { localStorage.setItem(KEY, JSON.stringify(SET)); } catch (e) {}
  }
  function applyPreset(id) {
    var p = PRESETS[id] || PRESETS.deepseek;
    SET.preset = id;
    if (id !== 'custom') {
      SET.base = p.base;
      if (!p.models.includes(SET.model)) SET.model = p.model;
    }
  }

  var AI = {};
  AI.presets = PRESETS;
  AI.getSet = function () { return SET; };
  AI.load = loadSettings;
  AI.save = saveSettings;
  AI.applyPreset = applyPreset;

  AI.ready = function () {
    if (!SET.ai) return false;
    if (SET.preset === 'custom' && SET.base) return true;
    return !!SET.key;
  };
  AI.base = function () {
    return String(SET.base || '').replace(/\s+/g, '').replace(/\/+$/, '').replace(/\/chat\/completions$/, '');
  };
  AI.endpoint = function () { return AI.base() + '/chat/completions'; };
  AI.headers = function () {
    var h = { 'Content-Type': 'application/json' };
    if (SET.key) h.Authorization = 'Bearer ' + SET.key;
    return h;
  };
  AI.isReasoner = function (m) {
    m = String(m != null ? m : SET.model || '');
    return /reasoner|thinking|-r1\b|o1/i.test(m);
  };
  AI.timeoutFetch = function (url, opts, ms) {
    return new Promise(function (res, rej) {
      var done = false, ctrl = null;
      try { ctrl = new AbortController(); opts.signal = ctrl.signal; } catch (e) {}
      var t = setTimeout(function () {
        if (done) return; done = true;
        try { ctrl && ctrl.abort(); } catch (e) {}
        rej({ kind: 'timeout' });
      }, ms);
      fetch(url, opts).then(function (r) {
        if (done) return; done = true; clearTimeout(t); res(r);
      }, function (e) {
        if (done) return; done = true; clearTimeout(t); rej({ kind: 'net', e: e });
      });
    });
  };
  AI.msgText = function (msg) {
    if (!msg || typeof msg !== 'object') return '';
    var c = msg.content;
    if (typeof c === 'string' && c.trim()) return c;
    if (typeof msg.reasoning_content === 'string' && msg.reasoning_content.trim()) return msg.reasoning_content;
    return typeof c === 'string' ? c : '';
  };
  AI.call = function (messages, o) {
    o = o || {};
    var model = o.model || SET.model;
    var reason = AI.isReasoner(model);
    var maxTok = o.maxTok != null ? o.maxTok : SET.maxTok;
    if (reason && maxTok < 1500) maxTok = 2000;
    var toSec = o.timeout != null ? o.timeout : SET.aiTimeout;
    if (reason && toSec < 90) toSec = 90;
    var body = { model: model, messages: messages, stream: false, max_tokens: maxTok };
    if (!reason) body.temperature = o.temp != null ? o.temp : SET.temp;
    return AI.timeoutFetch(AI.endpoint(), {
      method: 'POST', headers: AI.headers(), body: JSON.stringify(body)
    }, toSec * 1000).then(function (r) {
      return r.text().then(function (txt) {
        var j = null;
        try { j = JSON.parse(txt); } catch (e) {}
        if (!r.ok) {
          var ms = String((j && j.error && (j.error.message || j.error)) || txt.slice(0, 160));
          throw { kind: 'http', status: r.status, msg: ms };
        }
        var msg = j && j.choices && j.choices[0] && j.choices[0].message;
        var c = AI.msgText(msg);
        if (!c || !String(c).trim()) throw { kind: 'empty', raw: txt };
        return { text: String(c).trim(), model: model };
      });
    });
  };
  AI.errMsg = function (e) {
    if (!e) return '未知錯誤';
    if (e.kind === 'timeout') return '連線逾時';
    if (e.kind === 'net') return '無法連上 AI 服務（網絡或 CORS）';
    if (e.kind === 'empty') return 'AI 回應為空';
    if (e.kind === 'http') {
      if (e.status === 402) return '餘額不足（402）';
      if (e.status === 401 || e.status === 403) return 'API Key 無效（' + e.status + '）';
      return 'AI 失敗（HTTP ' + e.status + '）' + (e.msg ? '：' + String(e.msg).slice(0, 80) : '');
    }
    return String(e.message || e);
  };
  AI.test = function () {
    return AI.call([
      { role: 'system', content: 'Reply with exactly: OK' },
      { role: 'user', content: 'ping' }
    ], { maxTok: 32, timeout: 25, model: AI.isReasoner() ? 'deepseek-chat' : SET.model });
  };

  /** 章節選項後短反應：必須服從 plotFlags／好感，不可亂改結局 */
  AI.storyBeat = function (ctx) {
    var sys = '你是《墨夢莊周》說書人／旁白。繁體中文，略帶文言，40～90字。' +
      '只寫氣氛與內心餘波，不可宣布新結局，不可推翻既定旗標，不可引入現代事物，不可輸出JSON。' +
      '不可抄錄任何現成小說原文。' +
      (ctx.fateSummary ? '【既定命運旗標】' + ctx.fateSummary + '（必須合乎，勿推翻）' : '') +
      (ctx.flags ? '【劇情旗標】' + ctx.flags : '') +
      (ctx.affLine ? '【人物好感】' + ctx.affLine : '') +
      (ctx.mode ? '【世界模式】' + ctx.mode : '');
    var user = '玩家剛選：「' + (ctx.choiceText || '') + '」\n下一段節點摘要：「' + String(ctx.nextLine || '').slice(0, 160) +
      '」\n請接一句短反應（非重複原文）。';
    return AI.call([
      { role: 'system', content: sys },
      { role: 'user', content: user }
    ], { maxTok: 220, temp: 0.75 });
  };

  /** 紀事／世界線摘要：受旗標約束 */
  AI.chronicleDigest = function (ctx) {
    var sys = '你是《墨夢莊周》史官。繁體中文，一文80～140字。總結近日動向。' +
      '必須合乎既定旗標與好感，不可發明已結束之命運弧結局，不可抄小說原文，不可JSON。' +
      (ctx.fateSummary ? '【命運旗標】' + ctx.fateSummary : '') +
      (ctx.flags ? '【旗標】' + ctx.flags : '') +
      (ctx.recent ? '【近日紀事】' + ctx.recent : '');
    var user = '請寫一則「墨夢紀事」摘要，供儀表板風聞欄。日序：' + (ctx.dayStr || '');
    return AI.call([
      { role: 'system', content: sys },
      { role: 'user', content: user }
    ], { maxTok: 320, temp: 0.7 });
  };

  /** 說書人接寫／介入：沿主線或平行；可自建角色 intervening */
  AI.storytellerContinue = function (ctx) {
    var sys = '你是《墨夢莊周》說書人。秦王政元年前後，繁體中文，略文言。' +
      '根據人物關係、狀態、既往事件接寫 80～160 字。' +
      (ctx.intervene ? '玩家要求介入改劇情：在既定旗標內給出可選分岔暗示，但不可直接鎖定結局鍵。' : '閱讀模式接寫：沿主線推進氣氛，少給結論。') +
      (ctx.parallel ? '允許開平行小支線，但須標明「或然」。' : '') +
      (ctx.customNpc ? '玩家自建角色「' + ctx.customNpc + '」可短暫 intervening，須合乎時代身份。' : '') +
      '不可抄任何小說原文；不可推翻：' + (ctx.fateSummary || '無') +
      '；旗標：' + (ctx.flags || '無');
    var user = (ctx.prompt || '請繼續下一小段。') + '\n【關係】' + (ctx.relLine || '') +
      '\n【近事】' + (ctx.recent || '');
    return AI.call([
      { role: 'system', content: sys },
      { role: 'user', content: user }
    ], { maxTok: 420, temp: 0.8 });
  };

  AI.npcReply = function (ctx) {
    var sys = '你是古風單機遊戲《墨夢莊周》中的人物「' + ctx.npcName + '」（' + ctx.npcRole + '）。' +
      '時代為秦王政元年前後（嬴政剛即位、呂不韋為相邦、太后／私門暗湧、六國尚存）。繁體中文，略帶文言，短句，回覆 40～120 字。' +
      '記住與玩家的往來（好感' + ctx.aff + '）。不可跳出角色，不可提現代事物，不可輸出 JSON。' +
      '可知天下有三方暗流：呂黨（呂不韋門客網）、王府／秦廷、塞北邊市盟（匈奴邊市與楚齊流商）。' +
      '若知玩家勢力立場，對白需合乎人物身份與立場（親秦、親呂、通邊市或中立），勿替玩家做決定。' +
      (ctx.bio ? '【人物小傳】' + ctx.bio : '') +
      (ctx.heroCtx ? '【玩家身世】' + ctx.heroCtx : '') +
      (ctx.worldMode ? '【世界模式】' + ctx.worldMode : '') +
      (ctx.mem ? '【往來全記】' + ctx.mem : '') +
      (ctx.feel ? '【情感】' + ctx.feel : '') +
      (ctx.disguise ? '【玩家扮相】' + ctx.disguise + '（若女扮男裝或男扮女裝，可略疑，但勿一口咬定，除非懷疑很高）' : '') +
      (ctx.factionStance ? '【玩家勢力】' + ctx.factionStance : '') +
      (ctx.fateSummary ? '【人物命運旗標】' + ctx.fateSummary + '（對白須合乎這些已發生之選擇後果，勿推翻既定旗標）' : '');
    var user = (ctx.mode === 'cmd' ? '【指令】玩家要你執行：' : '【對白】玩家說：') + ctx.text +
      '\n玩家職業：' + ctx.career + '，紀年：' + ctx.dayStr;
    return AI.call([
      { role: 'system', content: sys },
      { role: 'user', content: user }
    ], { maxTok: 400, model: AI.isReasoner(SET.model) && SET.preset === 'deepseek' ? 'deepseek-chat' : SET.model });
  };


  /** v44 自由行動：想說／想做 → NPC 對白＋行動＋可推進劇情節點（JSON） */
  AI.freeAct = function (ctx) {
    var sys = '你是《墨夢莊周》世界引擎。秦王政元年前後。繁體中文，略文言。' +
      '玩家在劇情場景中自由輸入「想說」或「想做」。你必須以當前焦點人物身份反應，合乎性格、好感、記憶、扮相與地點門禁。' +
      '禁止抄錄任何現成小說原文；禁止宣布鎖定結局（不可寫死 fate_* 最終鍵）；不可引入現代事物。' +
      '只輸出一個 JSON 物件，無Markdown圍欄，欄位：' +
      'narration(旁白40字內), npcId, npcName, reply(人物對白40～120字), ' +
      'npcAction(物件：type=leave|gift|follow|open_gate|attack|invite|schedule_meet|none，label短標，detail一句行動描述；可選 goldDelta/hpDelta/meetDay/place/bag), ' +
      'choiceId(若玩家意圖明顯對應【當前可選】某項的 id 則填該 id，否則 null), ' +
      'jumpTo(若應轉场到其他劇情 nodeId 且 choiceId 為 null 才填；只許現有節點如 ch1_hub,xy_palace_gate,xy_palace_in,side_vil_grain,side_scale,xy_taiyi,xy_xiangbang 等，不確定则 null), ' +
      'sets(物件，可含 plotFlags.xxx 或 flags.xxx 或 access.palace 布林), ' +
      'aff(物件，npcId→整數加減), toast(可空), advance(null|"period"), goldDelta(整數，賄絡才用負數), intent(短字串)。' +
      'sets 只允許輕量旗標（如 free_*、bond_*、want_palace、healer_seed），不可寫 plotFlags.fate_*。' +
      'NPC 必須有具體行動傾向：不要只說話——可離去、回贈、跟隨、開門、拔刃、邀約、約期。' +
      (ctx.fateSummary ? '【既定命運】' + ctx.fateSummary + '（對白須合乎，勿推翻）' : '') +
      (ctx.flags ? '【旗標】' + ctx.flags : '') +
      (ctx.loc ? '【地點約束】' + ctx.loc : '') +
      (ctx.nodeId ? '【當前節點】' + ctx.nodeId : '') +
      (ctx.choices ? '【當前可選】' + ctx.choices : '') +
      (ctx.disguise ? '【扮相】' + ctx.disguise : '') +
      (ctx.palaceAccess ? '【門禁】已通宮城' : '【門禁】未通宮城') +
      (ctx.factionStance ? '【勢力】' + ctx.factionStance : '') +
      (ctx.worldMode ? '【模式】' + ctx.worldMode : '');
    var user = '【焦點人物】' + ctx.npcName + '（' + ctx.npcRole + '，id=' + ctx.npcId + '，好感' + ctx.aff + '）\n' +
      (ctx.bio ? '小傳：' + ctx.bio + '\n' : '') +
      (ctx.linesHint ? '口吻參考：' + ctx.linesHint + '\n' : '') +
      (ctx.mem ? '往來：' + ctx.mem + '\n' : '') +
      (ctx.feel ? '情感：' + ctx.feel + '\n' : '') +
      (ctx.heroCtx ? '玩家：' + ctx.heroCtx + '\n' : '') +
      '玩家' + (ctx.mode === 'do' ? '想做' : '想說') + '：「' + ctx.text + '」\n' +
      '紀年：' + ctx.dayStr + ' 職業：' + ctx.career + ' 銀兩：' + ctx.gold + '\n請輸出 JSON。';
    return AI.call([
      { role: 'system', content: sys },
      { role: 'user', content: user }
    ], { maxTok: 650, temp: 0.75 });
  };

  loadSettings();
  global.QianAI = AI;
})(window);
