// مقارنة أداء الجلسات والساعات تاريخياً (كلها بتوقيت UTC، وبغداد = UTC+3) من شموع الزوج المحمّلة (حتى 10,000 شمعة).
// المقاييس لكل فترة: عدد العينات (أيام/ساعات)، متوسط المدى بالنقاط (التذبذب)، الاتجاهية (صافي الحركة ÷ المدى)، نسبة الصعود، وميل الاتجاه بعد إزالة ميل السوق العام
// مع اختبار t حتى ما نسمي ميلاً "حاسماً" إلا إذا كان له دلالة إحصائية (|t| >= 2). ما فيه أي معلومة من المستقبل: كلها بيانات ماضية.
(function (root) {
  'use strict';
  const HR = 36e5;
  const SESS = [['آسيا', 0, 7], ['لندن', 7, 12], ['تداخل لندن+نيويورك', 12, 16], ['نيويورك', 16, 21], ['سيدني', 21, 24]];
  const FULL = [['لندن كاملة', 7, 16], ['نيويورك كاملة', 12, 21]];
  const TFM = { '1min': 1, '5min': 5, '15min': 15, '30min': 30, '1h': 60 };
  const pad = x => String(x).padStart(2, '0');
  const bgd = h => pad((h + 3) % 24);
  const sesOf = h => (SESS.find(s => h >= s[1] && h < s[2]) || ['-'])[0];
  const mean = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);
  function stat(net, rng, adj) {
    const n = net.length; if (!n) return { n: 0 };
    const m = mean(adj), sd = Math.sqrt(adj.reduce((s, x) => s + (x - m) * (x - m), 0) / Math.max(1, n - 1)), ar = mean(rng), an = mean(net.map(Math.abs));
    return { n, range: ar, absNet: an, eff: ar ? an / ar : 0, bull: net.filter(x => x > 0).length / n, adj: m, t: n > 2 && sd > 0 ? m / (sd / Math.sqrt(n)) : 0 };
  }
  function build(cs, unit, tfm) {
    const per = 60 / tfm, bars = new Map();
    for (const x of cs) {
      const t = Date.parse(String(x.datetime).replace(' ', 'T') + 'Z'); if (!isFinite(t)) continue;
      const k = Math.floor(t / HR), o = +x.open, h = +x.high, l = +x.low, c = +x.close;
      let b = bars.get(k); if (!b) { b = { k, o, h, l, c, cnt: 0 }; bars.set(k, b); }
      b.cnt++; b.c = c; if (h > b.h) b.h = h; if (l < b.l) b.l = l;
    }
    const hb = [...bars.values()].filter(b => b.cnt === per).sort((x, y) => x.k - y.k);
    if (hb.length < 200) return null;
    const mu = mean(hb.map(b => (b.c - b.o) / unit)), byH = Array.from({ length: 24 }, () => ({ net: [], rng: [], adj: [] })), byDay = new Map();
    for (const b of hb) {
      const hr = ((b.k % 24) + 24) % 24, net = (b.c - b.o) / unit, rg = (b.h - b.l) / unit, e = byH[hr];
      e.net.push(net); e.rng.push(rg); e.adj.push(net - mu);
      const d = Math.floor(b.k / 24); if (!byDay.has(d)) byDay.set(d, []); byDay.get(d).push({ hr, b });
    }
    const periods = [...SESS, ...FULL].map(([name, a, z]) => {
      const net = [], rng = [], adj = [], need = z - a;
      for (const arr of byDay.values()) {
        const sel = arr.filter(x => x.hr >= a && x.hr < z).sort((x, y) => x.hr - y.hr); if (sel.length < need) continue;
        const o = sel[0].b.o, c = sel[sel.length - 1].b.c, hi = Math.max(...sel.map(x => x.b.h)), lo = Math.min(...sel.map(x => x.b.l)), nt = (c - o) / unit;
        net.push(nt); rng.push((hi - lo) / unit); adj.push(nt - mu * need);
      }
      return Object.assign({ name, a, z }, stat(net, rng, adj));
    });
    const hours = byH.map((e, hr) => Object.assign({ hr }, stat(e.net, e.rng, e.adj)));
    return { periods, hours, mu, nBars: hb.length, from: new Date(hb[0].k * HR).toISOString().slice(0, 10), to: new Date(hb[hb.length - 1].k * HR).toISOString().slice(0, 10) };
  }
  const CACHE = {};
  function stats(cs, unit, tf) {
    const tfm = TFM[tf]; if (!tfm || !cs || cs.length < 100) return null;
    const key = tf + '|' + cs.length + '|' + cs[cs.length - 1].datetime;
    if (!(key in CACHE)) CACHE[key] = build(cs, unit, tfm);
    return CACHE[key];
  }
  const fm = x => Math.round(x).toLocaleString('en'), pc = x => Math.round(x * 100) + '%', sgn = x => (x >= 0 ? '+' : '') + Math.round(x);
  const verdict = s => s.n < 15 ? 'عينة قليلة' : Math.abs(s.t) >= 2 ? (s.adj > 0 ? '<b class="t-buy">ميل شراء</b>' : '<b class="t-sell">ميل بيع</b>') : 'غير حاسم';
  function html(cs, pr, tf, nowMs) {
    const nowH = new Date(nowMs || Date.now()).getUTCHours();
    if (!TFM[tf]) return '<h3>مقارنة الجلسات والساعات تاريخياً</h3><div class="hs"><p>هذي المقارنة تحتاج فريم ساعة أو أقل (M5 أو M15 أو H1)، لأن شموع 4 ساعات ما تعطي تفاصيل الساعات.</p></div>';
    if (!cs) return '<h3>مقارنة الجلسات والساعات تاريخياً</h3><div class="hs"><p>جاري تحميل التاريخ...</p></div>';
    const S = stats(cs, pr.pip / 10, tf);
    if (!S) return '<h3>مقارنة الجلسات والساعات تاريخياً</h3><div class="hs"><p>الشموع المتاحة ما تكفي لمقارنة موثوقة (تحتاج 200 ساعة كاملة على الأقل).</p></div>';
    const pr1 = S.periods.filter(p => p.n);
    const rank = (k, desc) => pr1.slice().sort((a, b) => desc ? b[k] - a[k] : a[k] - b[k]);
    const top = rank('range', true)[0], low = rank('range', false)[0], eff = rank('eff', true)[0];
    const hrs = S.hours.filter(h => h.n >= 15), topH = hrs.slice().sort((a, b) => b.range - a.range).slice(0, 3).map(h => pad(h.hr) + ':00').join('، ');
    const sig = hrs.filter(h => Math.abs(h.t) >= 2).sort((a, b) => Math.abs(b.t) - Math.abs(a.t)).slice(0, 3);
    const curS = SESS.find(s => nowH >= s[1] && nowH < s[2]);
    const row = p => `<tr${curS && p.name === curS[0] ? ' class="hl"' : ''}><td>${p.name}<br><small class="nt">${pad(p.a)}-${pad(p.z)} UTC (${bgd(p.a)}-${bgd(p.z)} بغداد)</small></td><td>${p.n}</td><td>${p.n ? fm(p.range) : '-'}</td><td>${p.n ? pc(p.eff) : '-'}</td><td>${p.n ? pc(p.bull) : '-'}</td><td dir="ltr">${p.n ? sgn(p.adj) : '-'}</td><td>${p.n ? verdict(p) : '-'}</td></tr>`;
    const hrow = h => `<tr${h.hr === nowH ? ' class="hl"' : ''}><td dir="ltr">${pad(h.hr)}:00</td><td dir="ltr">${bgd(h.hr)}:00</td><td>${sesOf(h.hr)}</td><td>${h.n}</td><td>${h.n ? fm(h.range) : '-'}</td><td>${h.n ? pc(h.bull) : '-'}</td><td dir="ltr">${h.n ? sgn(h.adj) : '-'}</td><td>${h.n ? verdict(h) : '-'}</td></tr>`;
    const unitName = pr.pip >= 0.1 ? 'نقطة (0.01$)' : 'نقطة';
    return `<h3>مقارنة أداء الجلسات والساعات تاريخياً</h3><div class="hs">
<p class="nt">من ${S.nBars.toLocaleString('en')} ساعة كاملة (${S.from} إلى ${S.to}). الأوقات UTC وبجنبها توقيت بغداد. الصف المظلل = الفترة الحالية.</p>
<div class="wrap"><table><thead><tr><th>الجلسة</th><th>أيام</th><th>متوسط المدى (${unitName})</th><th>اتجاهية</th><th>صعود</th><th>الميل (نقطة)</th><th>الحكم</th></tr></thead><tbody>${S.periods.map(row).join('')}</tbody></table></div>
<ul style="margin:8px 22px;font-size:14.5px">${top && low ? `<li>الأعلى تذبذباً: <b>${top.name}</b> (${fm(top.range)} نقطة)، والأهدأ: <b>${low.name}</b> (${fm(low.range)} نقطة).</li>` : ''}${eff ? `<li>الأنظف اتجاهاً (حركتها أقرب لخط مستقيم): <b>${eff.name}</b> (${pc(eff.eff)} من مداها يتحول لحركة صافية).</li>` : ''}${topH ? `<li>أعلى ثلاث ساعات تذبذباً (UTC): ${topH}.</li>` : ''}<li>${sig.length ? 'ساعات لها ميل ذو دلالة: ' + sig.map(h => `${pad(h.hr)}:00 (${h.adj > 0 ? 'شراء' : 'بيع'}، t=${h.t.toFixed(1)})`).join('، ') + '. انتبه: مع 24 ساعة يطلع تقريباً واحدة بالصدفة، فلا تعتمد عليها لحالها.' : 'ما فيه ساعة لها ميل اتجاهي حاسم إحصائياً بهذي البيانات (وهذا الطبيعي: الفرق الواضح عادة بالتذبذب مو بالاتجاه).'}</li></ul>
<details><summary>الساعات الفردية (24 ساعة)</summary><div class="wrap"><table><thead><tr><th>UTC</th><th>بغداد</th><th>الجلسة</th><th>عينات</th><th>مدى</th><th>صعود</th><th>الميل</th><th>الحكم</th></tr></thead><tbody>${S.hours.map(hrow).join('')}</tbody></table></div></details>
<p class="nt">«الميل» = متوسط حركة الفترة بعد إزالة ميل السوق العام (ترند الذهب خلال الفترة) حتى ما يطلع كل شي «شراء» لمجرد أن الذهب صاعد. «اتجاهية» = صافي الحركة ÷ المدى: كل ما زادت فالفترة أنظف اتجاهاً. «حاسم» = |t| ≥ 2. أحجام العينات مكتوبة: كل ما قلّت (أقل من 60) فالنتيجة أقل ثقة. للمزيد من الأيام استخدم فريم H1 (10,000 شمعة تغطي أكثر من سنة).</p></div>`;
  }
  const API = { stats, html };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.Sess = API;
})(typeof window !== 'undefined' ? window : this);
