// محرك التحليل: 30 أداة مختارة من مدارس واستراتيجيات الفوركس.
// نفس الملف يستخدمه الموقع (signals.html) وبوت تيليجرام (scripts/gold_signals.mjs).
(function (root) {
  'use strict';
  const ema = (a, p) => { const k = 2 / (p + 1); let e = a[0]; return a.map((v, i) => (e = i ? v * k + e * (1 - k) : v)); };
  const mx = (a, s, e) => { let m = -Infinity; for (let i = s; i <= e; i++) if (a[i] > m) m = a[i]; return m; };
  const mn = (a, s, e) => { let m = Infinity; for (let i = s; i <= e; i++) if (a[i] < m) m = a[i]; return m; };
  function atrS(h, l, c, p = 14) {
    const n = c.length, out = new Array(n).fill(null), t = [null];
    for (let i = 1; i < n; i++) t.push(Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1])));
    let a = 0; for (let i = 1; i <= p; i++) a += t[i]; a /= p; out[p] = a;
    for (let i = p + 1; i < n; i++) { a = (a * (p - 1) + t[i]) / p; out[i] = a; }
    return out;
  }
  function rsiLast(c, p = 14) {
    let g = 0, l = 0;
    for (let i = 1; i <= p; i++) { const d = c[i] - c[i - 1]; d > 0 ? g += d : l -= d; }
    g /= p; l /= p;
    for (let i = p + 1; i < c.length; i++) { const d = c[i] - c[i - 1]; g = (g * (p - 1) + (d > 0 ? d : 0)) / p; l = (l * (p - 1) + (d < 0 ? -d : 0)) / p; }
    return l ? 100 - 100 / (1 + g / l) : 100;
  }
  function adxLast(h, l, c, p = 14) {
    const n = c.length, tr = [], pd = [], md = [];
    for (let i = 1; i < n; i++) {
      const up = h[i] - h[i - 1], dn = l[i - 1] - l[i];
      pd.push(up > dn && up > 0 ? up : 0); md.push(dn > up && dn > 0 ? dn : 0);
      tr.push(Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1])));
    }
    let st = 0, sp = 0, sm = 0;
    for (let i = 0; i < p; i++) { st += tr[i]; sp += pd[i]; sm += md[i]; }
    const dx = [];
    for (let i = p; i < tr.length; i++) {
      if (i > p) { st = st - st / p + tr[i]; sp = sp - sp / p + pd[i]; sm = sm - sm / p + md[i]; }
      const a = 100 * sp / st, b = 100 * sm / st; dx.push(100 * Math.abs(a - b) / ((a + b) || 1));
    }
    let x = 0; for (let i = 0; i < p; i++) x += dx[i]; x /= p;
    for (let i = p; i < dx.length; i++) x = (x * (p - 1) + dx[i]) / p;
    return x;
  }
  function pivots(h, l, n, k = 3) {
    const ph = [], pl = [];
    for (let i = k; i <= n - k; i++) {
      let isH = true, isL = true;
      for (let j = i - k; j <= i + k; j++) { if (h[j] > h[i]) isH = false; if (l[j] < l[i]) isL = false; }
      if (isH) ph.push(i); if (isL) pl.push(i);
    }
    return { ph, pl };
  }

  function analyze(v, pr, now, ctx) {
    const o = v.map(x => +x.open), h = v.map(x => +x.high), l = v.map(x => +x.low), c = v.map(x => +x.close);
    const n = c.length - 1, px = c[n];
    const E20 = ema(c, 20), E50 = ema(c, 50), E100 = ema(c, 100), E200 = ema(c, 200);
    const e20 = E20[n], e50 = E50[n], e100 = E100[n], e200 = E200[n];
    const AT = atrS(h, l, c), a = AT[n];
    const hh = mx(h, n - 20, n - 1), ll = mn(l, n - 20, n - 1);
    const d = (px > e50 && e20 > e50) ? 1 : (px < e50 && e20 < e50) ? -1 : 0;
    const P = pivots(h, l, n);
    const F = [];
    // ev: أداة حدث (تعتبر نقطة دخول). f: فلتر (يتفق مع أي اتجاه).
    const T = (name, school, w, vote, text, ev) => F.push({ n: name, s: school, w, v: vote, t: text, ev: !!ev, p: 0, m: w });
    const W = (vote, up, dn, none) => vote > 0 ? up : vote < 0 ? dn : none;

    // ===== الكلاسيكي (7) =====
    T('ترتيب EMA20/EMA50', 'الكلاسيكي', 5, d, W(d, 'EMA20 فوق EMA50 والسعر فوقهما', 'EMA20 تحت EMA50 والسعر تحتهما', 'لا ترند واضح'));
    const v2 = px > e200 ? 1 : -1; T('السعر مقابل EMA200', 'الكلاسيكي', 4, v2, W(v2, 'فوق EMA200', 'تحت EMA200'));
    const sl50 = E50[n] - E50[n - 10]; const v3 = sl50 > a * .1 ? 1 : sl50 < -a * .1 ? -1 : 0;
    T('ميل EMA50', 'الكلاسيكي', 3, v3, W(v3, 'EMA50 صاعد', 'EMA50 هابط', 'EMA50 مسطح'));
    const rs = rsiLast(c); const v4 = rs > 55 && rs < 75 ? 1 : rs < 45 && rs > 25 ? -1 : 0;
    T('RSI', 'الكلاسيكي', 3, v4, 'RSI ' + rs.toFixed(0) + W(v4, ': زخم صاعد', ': زخم هابط', ': محايد أو تشبع'));
    const m12 = ema(c, 12), m26 = ema(c, 26), macd = m12.map((x, i) => x - m26[i]), sg = ema(macd, 9), hs = macd.map((x, i) => x - sg[i]);
    const v5 = hs[n] > 0 && hs[n] > hs[n - 1] ? 1 : hs[n] < 0 && hs[n] < hs[n - 1] ? -1 : 0;
    T('MACD', 'الكلاسيكي', 4, v5, W(v5, 'هيستوغرام موجب ويزيد', 'هيستوغرام سالب ويزيد هبوطاً', 'لا زخم واضح'));
    const v6 = d && Math.abs(px - e20) < a * .5 ? d : 0;
    T('الارتداد من EMA20', 'الكلاسيكي', 2, v6, v6 ? 'السعر قرب EMA20 مع الترند' : 'السعر بعيد عن EMA20', true);
    // فيبوناتشي على آخر 50 شمعة
    const H50 = mx(h, n - 50, n), L50 = mn(l, n - 50, n); let hi = n, lo = n;
    for (let i = n - 50; i <= n; i++) { if (h[i] === H50) hi = i; if (l[i] === L50) lo = i; }
    let v7 = 0; if (H50 > L50) { if (hi > lo) { const r = (H50 - px) / (H50 - L50); if (r >= .382 && r <= .618) v7 = 1; } else { const r = (px - L50) / (H50 - L50); if (r >= .382 && r <= .618) v7 = -1; } }
    T('فيبوناتشي 38-62%', 'الكلاسيكي', 3, v7, W(v7, 'ارتداد داخل منطقة 38-62% بعد صعود', 'ارتداد داخل منطقة 38-62% بعد هبوط', 'خارج منطقة فيبوناتشي'), true);

    // ===== حركة السعر (6) =====
    const pin = i => { const rg = h[i] - l[i], bd = Math.abs(c[i] - o[i]), up = h[i] - Math.max(o[i], c[i]), lw = Math.min(o[i], c[i]) - l[i]; if (rg < a * .5) return 0;
      if (lw >= 2 * bd && lw >= .55 * rg && (c[i] - l[i]) / rg >= .6) return 1; if (up >= 2 * bd && up >= .55 * rg && (h[i] - c[i]) / rg >= .6) return -1; return 0; };
    const v8 = pin(n) || pin(n - 1); T('شمعة Pin Bar', 'حركة السعر', 3, v8, W(v8, 'Pin Bar صاعدة', 'Pin Bar هابطة', 'لا Pin Bar'), true);
    const v9 = (c[n - 1] < o[n - 1] && c[n] > o[n] && c[n] >= o[n - 1] && o[n] <= c[n - 1]) ? 1 : (c[n - 1] > o[n - 1] && c[n] < o[n] && c[n] <= o[n - 1] && o[n] >= c[n - 1]) ? -1 : 0;
    T('شمعة ابتلاع', 'حركة السعر', 3, v9, W(v9, 'ابتلاع صاعد', 'ابتلاع هابط', 'لا ابتلاع'), true);
    const v10 = px > hh ? 1 : px < ll ? -1 : 0;
    T('اختراق آخر 20 شمعة', 'حركة السعر', 5, v10, W(v10, 'اختراق قمة آخر 20 شمعة', 'كسر قاع آخر 20 شمعة', 'لا اختراق'), true);
    const ph2 = P.ph.slice(-2), pl2 = P.pl.slice(-2); let v11 = 0;
    if (ph2.length === 2 && pl2.length === 2) { if (h[ph2[1]] > h[ph2[0]] && l[pl2[1]] > l[pl2[0]]) v11 = 1; else if (h[ph2[1]] < h[ph2[0]] && l[pl2[1]] < l[pl2[0]]) v11 = -1; }
    T('هيكل قمم وقيعان', 'حركة السعر', 4, v11, W(v11, 'قمم وقيعان أعلى', 'قمم وقيعان أدنى', 'هيكل غير واضح'));
    const v12 = c[n] > c[n - 1] && c[n - 1] > c[n - 2] ? 1 : c[n] < c[n - 1] && c[n - 1] < c[n - 2] ? -1 : 0;
    T('3 إغلاقات متتالية', 'حركة السعر', 2, v12, W(v12, '3 إغلاقات صاعدة', '3 إغلاقات هابطة', 'إغلاقات متذبذبة'));
    let hao = (o[n - 30] + c[n - 30]) / 2, hac = (o[n - 30] + h[n - 30] + l[n - 30] + c[n - 30]) / 4, hg = [];
    for (let i = n - 29; i <= n; i++) { const nc = (o[i] + h[i] + l[i] + c[i]) / 4, no = (hao + hac) / 2; hao = no; hac = nc; hg.push(nc > no); }
    const v13 = hg[29] && hg[28] ? 1 : !hg[29] && !hg[28] ? -1 : 0;
    T('شموع Heikin Ashi', 'حركة السعر', 2, v13, W(v13, 'شمعتان خضراوان', 'شمعتان حمراوان', 'ألوان مختلطة'));

    // ===== العرض والطلب ودعم/مقاومة (3) =====
    const sup = mn(l, n - 50, n - 2), res = mx(h, n - 50, n - 2);
    const v14 = Math.min(l[n], l[n - 1]) <= sup + a * .5 && c[n] > o[n] ? 1 : Math.max(h[n], h[n - 1]) >= res - a * .5 && c[n] < o[n] ? -1 : 0;
    T('ارتداد من دعم/مقاومة', 'العرض والطلب', 3, v14, W(v14, 'ارتداد من دعم 50 شمعة', 'رفض عند مقاومة 50 شمعة', 'لا ارتداد من مستوى'), true);
    let v15 = 0;
    for (let j = n - 10; j <= n - 2 && !v15; j++) { const L = mx(h, j - 20, j - 1), S = mn(l, j - 20, j - 1);
      if (c[j] > L && c[j - 1] <= L && l[n] <= L + a * .3 && px > L) v15 = 1; else if (c[j] < S && c[j - 1] >= S && h[n] >= S - a * .3 && px < S) v15 = -1; }
    T('كسر وإعادة اختبار', 'العرض والطلب', 4, v15, W(v15, 'إعادة اختبار ناجحة لمستوى مكسور للأعلى', 'إعادة اختبار ناجحة لمستوى مكسور للأسفل', 'لا إعادة اختبار'), true);
    let v16 = 0;
    for (let j = n - 1; j >= n - 30 && j >= 2; j--) { const rg = h[j] - l[j], bd = Math.abs(c[j] - o[j]);
      if (rg >= 1.8 * a && bd >= .6 * rg) { const z0 = l[j - 1], z1 = h[j - 1]; if (px >= z0 - a * .2 && px <= z1 + a * .2) v16 = c[j] > o[j] ? 1 : -1; break; } }
    T('منطقة عرض/طلب', 'العرض والطلب', 3, v16, W(v16, 'السعر داخل منطقة طلب', 'السعر داخل منطقة عرض', 'خارج مناطق العرض والطلب'), true);

    // ===== ICT / SMC (5) =====
    let sw = 0;
    for (let j = n - 2; j <= n; j++) { const pL = mn(l, j - 20, j - 1), pH = mx(h, j - 20, j - 1);
      const bu = l[j] < pL && c[j] > pL, be = h[j] > pH && c[j] < pH; if (bu && !be) sw = 1; else if (be && !bu) sw = -1; }
    T('سحب السيولة', 'ICT/SMC', 5, sw, W(sw, 'سحب سيولة القاع ثم رجوع', 'سحب سيولة القمة ثم رجوع', 'لا سحب سيولة'), true);
    const lh = P.ph.filter(i => i <= n - 4).pop(), lw2 = P.pl.filter(i => i <= n - 4).pop(); let up = 0, dn = 0;
    if (lh !== undefined) for (let j = lh + 1; j <= n; j++) if (c[j] > h[lh]) { if (n - j <= 10) up = 1; break; }
    if (lw2 !== undefined) for (let j = lw2 + 1; j <= n; j++) if (c[j] < l[lw2]) { if (n - j <= 10) dn = 1; break; }
    const v18 = up && !dn ? 1 : dn && !up ? -1 : 0;
    T('كسر الهيكل BOS/CHoCH', 'ICT/SMC', 4, v18, W(v18, 'كسر هيكل صاعد حديث', 'كسر هيكل هابط حديث', 'لا كسر هيكل حديث'), true);
    let v19 = 0;
    for (let i = n - 1; i >= n - 20 && i >= 2; i--) {
      if (l[i] > h[i - 2] && l[i] - h[i - 2] >= a * .3) { if (mn(l, i + 1, n) >= h[i - 2] && px <= l[i] + a * .3 && px >= h[i - 2]) { v19 = 1; break; } }
      if (h[i] < l[i - 2] && l[i - 2] - h[i] >= a * .3) { if (mx(h, i + 1, n) <= l[i - 2] && px >= h[i] - a * .3 && px <= l[i - 2]) { v19 = -1; break; } }
    }
    T('فجوة القيمة FVG', 'ICT/SMC', 3, v19, W(v19, 'السعر داخل فجوة صاعدة', 'السعر داخل فجوة هابطة', 'لا فجوة مفتوحة قريبة'), true);
    let v20 = 0;
    for (let j = n - 1; j >= n - 30 && j >= 6; j--) { const bd = Math.abs(c[j] - o[j]);
      if (bd >= 1.2 * a && c[j] > o[j] && c[j] > mx(h, j - 5, j - 1)) { for (let k = j - 1; k >= j - 5; k--) if (c[k] < o[k]) { if (px >= l[k] - a * .2 && px <= h[k] + a * .2) v20 = 1; break; } break; }
      if (bd >= 1.2 * a && c[j] < o[j] && c[j] < mn(l, j - 5, j - 1)) { for (let k = j - 1; k >= j - 5; k--) if (c[k] > o[k]) { if (px >= l[k] - a * .2 && px <= h[k] + a * .2) v20 = -1; break; } break; } }
    T('Order Block', 'ICT/SMC', 4, v20, W(v20, 'السعر عند Order Block صاعد', 'السعر عند Order Block هابط', 'لا Order Block قريب'), true);
    const mid = (H50 + L50) / 2, v21 = px < mid ? 1 : -1;
    T('خصم/علاوة', 'ICT/SMC', 2, v21, W(v21, 'السعر بمنطقة خصم (أقل من نصف النطاق)', 'السعر بمنطقة علاوة (أعلى من نصف النطاق)'));

    // ===== إيشيموكو (3) =====
    const tk = i => (mx(h, i - 8, i) + mn(l, i - 8, i)) / 2, kj = i => (mx(h, i - 25, i) + mn(l, i - 25, i)) / 2, sb = i => (mx(h, i - 51, i) + mn(l, i - 51, i)) / 2;
    const m26i = n - 26, cA = (tk(m26i) + kj(m26i)) / 2, cB = sb(m26i), top = Math.max(cA, cB), bot = Math.min(cA, cB);
    const v22 = px > top ? 1 : px < bot ? -1 : 0;
    T('السحابة', 'إيشيموكو', 3, v22, W(v22, 'السعر فوق السحابة', 'السعر تحت السحابة', 'السعر داخل السحابة'));
    const v23 = tk(n) > kj(n) ? 1 : tk(n) < kj(n) ? -1 : 0;
    T('تقاطع Tenkan/Kijun', 'إيشيموكو', 3, v23, W(v23, 'Tenkan فوق Kijun', 'Tenkan تحت Kijun', 'متساويان'));
    const v24 = c[n] > c[n - 26] ? 1 : c[n] < c[n - 26] ? -1 : 0;
    T('خط Chikou', 'إيشيموكو', 2, v24, W(v24, 'السعر أعلى من قبل 26 شمعة', 'السعر أدنى من قبل 26 شمعة', 'بدون تغيير'));

    // ===== ويكوف (1) =====
    const L40 = mn(l, n - 45, n - 6), H40 = mx(h, n - 45, n - 6); let v25 = 0;
    for (let j = n - 2; j <= n; j++) { if (l[j] < L40 && c[j] > L40) v25 = 1; else if (h[j] > H40 && c[j] < H40) v25 = -1; }
    T('Spring / Upthrust', 'ويكوف', 2, v25, W(v25, 'Spring: كسر كاذب للقاع', 'Upthrust: كسر كاذب للقمة', 'لا Spring أو Upthrust'), true);

    // ===== فلاتر: الجلسة، الأخبار، التذبذب، قوة الترند =====
    const S = ctx.ses(pr, now), N = ctx.nk(pr.c, now);
    const fl = (name, school, w, ok, text) => F.push({ n: name, s: school, w, v: null, f: true, ok, t: text, ev: false, p: 0, m: w });
    fl('الجلسة', 'السكالبينغ', 7, S.closed ? 0 : S.p / 15 * 7, S.t);
    fl('الأخبار', 'التحليل الأساسي', 7, N.v === 0 ? 7 : N.v === 1 ? 3 : N.v === 2 ? 0 : 3.5, N.t);
    let sAtr = 0, cnt = 0; for (let i = n - 49; i <= n; i++) { sAtr += AT[i]; cnt++; } const rt = a / (sAtr / cnt);
    fl('التذبذب ATR', 'السكالبينغ', 2, rt >= .7 && rt <= 2 ? 2 : (rt >= .5 && rt < .7) || (rt > 2 && rt <= 3) ? 1 : 0, 'الحركة ' + rt.toFixed(2) + '× المعتاد');
    const ax = adxLast(h, l, c); fl('قوة الترند ADX', 'الكلاسيكي', 2, ax >= 20 ? 2 : ax >= 15 ? 1 : 0, 'ADX ' + ax.toFixed(0));
    const v30 = e100 > e200 ? 1 : -1; T('EMA100 مقابل EMA200', 'الكلاسيكي', 1, v30, W(v30, 'EMA100 فوق EMA200', 'EMA100 تحت EMA200'));

    // ===== النتيجة: نسبة اتفاق الأدوات هي معيار الدخول الوحيد =====
    // النسبة = وزن الأدوات المتفقة ÷ (المتفقة + المختلفة). الأدوات الصامتة لا تؤثر افتراضياً.
    // اختياري: ctx.minEv يشترط حد أدنى لوزن أدوات نقاط الدخول المتفقة (الافتراضي 0 = بدون شرط).
    let ag = 0, dg = 0, miss = 0, evW = 0;
    for (const x of F) {
      if (x.f) { ag += x.ok; dg += x.w - x.ok; x.p = x.ok; }
      else if (d && x.v === d) { ag += x.w; x.p = x.w; if (x.ev) evW += x.w; }
      else if (d && x.v === -d) dg += x.w;
      else if (d && x.ev) miss += x.w;
    }
    const sc = d ? Math.round(100 * ag / (ag + dg + (ctx.missW || 0) * miss)) : 0;
    const min = ctx.min || 70, minEv = ctx.minEv ?? 0; let why = '';
    if (!d) why = 'لا اتجاه واضح'; else if (S.closed) why = S.t; else if (N.v === 2) why = N.t; else if (sc < min) why = 'قوة التوافق ' + sc + '% أقل من ' + min + '%';
    else if (evW < minEv) why = 'لا توجد نقطة دخول: وزن أدوات الدخول المتفقة ' + evW + ' (المطلوب ' + minEv + ')';

    // ===== الوقف والأهداف بنقاط MT5 (النقطة = 0.01$ للذهب، 100 نقطة = 1$) =====
    // الوقف والهدفان كلهم بين 700 و1500 نقطة على كل الفريمات. الهدف مو لازم يكون أكبر من الوقف.
    // تتحدد حسب: حركة السوق (ATR بالنقاط، فتتغير مع الفريم)، قوة التوافق، وأقرب قمة/قاع قريب (الوقف خلف أقرب قاع/قمة حماية، والهدف الأول عند أقرب قمة/قاع أمام السعر).
    const unit = pr.pip / 10, cl = (x, lo2, hi2) => Math.max(lo2, Math.min(hi2, x)), r10 = x => Math.round(x / 10) * 10;
    const aP = a / unit;
    const q = Math.max(0, Math.min(1, 0.6 * (sc - 70) / 30 + 0.4 * Math.min(evW / 8, 1)));
    const sgn = d || 1, from = Math.max(3, n - 120);
    const lows = P.pl.filter(i => i >= from).map(i => l[i]), highs = P.ph.filter(i => i >= from).map(i => h[i]);
    const prot = sgn > 0 ? Math.max(-Infinity, ...lows.filter(x => x < px)) : Math.min(Infinity, ...highs.filter(x => x > px));
    const front = sgn > 0 ? Math.min(Infinity, ...highs.filter(x => x > px)) : Math.max(-Infinity, ...lows.filter(x => x < px));
    const dProt = isFinite(prot) ? Math.abs(px - prot) / unit + 0.15 * aP : null, dFront = isFinite(front) ? Math.abs(front - px) / unit : null;
    const slBase = aP * (1.1 - 0.4 * q), t1Base = aP * (0.6 + 0.5 * q), t2Base = aP * (1 + 0.8 * q);
    const SL = cl(r10(dProt != null ? 0.5 * slBase + 0.5 * dProt : slBase), 700, 1500);
    const T1 = cl(r10(dFront != null ? 0.5 * t1Base + 0.5 * dFront : t1Base), 700, 1400);
    const T2 = cl(r10(Math.max(t2Base, T1 + 100)), T1 + 100, 1500);
    return { px, a, F, sc, side: why ? 'wait' : d > 0 ? 'buy' : 'sell', why, d, hh, ll, S, N, ag, dg, miss, evW, tools: F.length, q, pts: { sl: SL, tp1: T1, tp2: T2 }, sl: px - d * SL * unit, tp1: px + d * T1 * unit, tp2: px + d * T2 * unit, pips: SL / 10 };
  }
  const API = { analyze };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.Engine = API;
})(typeof window !== 'undefined' ? window : this);
