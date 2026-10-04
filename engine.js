// محرك التحليل: أدوات مختارة من مدارس واستراتيجيات الفوركس + التحليل التاريخي (HPA) كدليل مستقل.
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
  function rsiSeries(c, p = 14) {
    const n = c.length, out = new Array(n).fill(null); if (n <= p) return out;
    let g = 0, l = 0;
    for (let i = 1; i <= p; i++) { const d = c[i] - c[i - 1]; d > 0 ? g += d : l -= d; }
    g /= p; l /= p; out[p] = l ? 100 - 100 / (1 + g / l) : 100;
    for (let i = p + 1; i < n; i++) { const d = c[i] - c[i - 1]; g = (g * (p - 1) + (d > 0 ? d : 0)) / p; l = (l * (p - 1) + (d < 0 ? -d : 0)) / p; out[i] = l ? 100 - 100 / (1 + g / l) : 100; }
    return out;
  }
  function stochS(h, l, c, k = 14, s1 = 3, s2 = 3) {
    const n = c.length, raw = new Array(n).fill(null);
    for (let i = k - 1; i < n; i++) { const H = mx(h, i - k + 1, i), L = mn(l, i - k + 1, i); raw[i] = H > L ? 100 * (c[i] - L) / (H - L) : 50; }
    const sma = (a, p) => a.map((_, i) => { if (i < p - 1) return null; let t = 0; for (let j = 0; j < p; j++) { if (a[i - j] == null) return null; t += a[i - j]; } return t / p; });
    const K = sma(raw, s1), D = sma(K, s2); return { K, D };
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
    const E20 = ema(c, 20), E50 = ema(c, 50), E200 = ema(c, 200);
    const e20 = E20[n], e50 = E50[n], e200 = E200[n];
    const AT = atrS(h, l, c), a = AT[n];
    const hh = mx(h, n - 20, n - 1), ll = mn(l, n - 20, n - 1);
    const d = (px > e50 && e20 > e50) ? 1 : (px < e50 && e20 < e50) ? -1 : 0; // ترتيب المتوسطات: أداة وحدة من الأدوات (مو شرط)
    const P = pivots(h, l, n);
    const F = [];
    // ev: أداة حدث (تعتبر نقطة دخول). f: فلتر (يتفق مع أي اتجاه).
    const T = (name, school, w, vote, text, ev) => F.push({ n: name, s: school, w, v: vote, t: text, ev: !!ev, p: 0, m: w });
    const W = (vote, up, dn, none) => vote > 0 ? up : vote < 0 ? dn : none;

    // ===== الكلاسيكي =====
    T('ترتيب EMA20/EMA50', 'الكلاسيكي', 5, d, W(d, 'EMA20 فوق EMA50 والسعر فوقهما', 'EMA20 تحت EMA50 والسعر تحتهما', 'لا ترند واضح'));
    const v2 = px > e200 ? 1 : -1; T('السعر مقابل EMA200', 'الكلاسيكي', 4, v2, W(v2, 'فوق EMA200', 'تحت EMA200'));
    const sl50 = E50[n] - E50[n - 10]; const v3 = sl50 > a * .1 ? 1 : sl50 < -a * .1 ? -1 : 0;
    T('ميل EMA50', 'الكلاسيكي', 3, v3, W(v3, 'EMA50 صاعد', 'EMA50 هابط', 'EMA50 مسطح'));
    const rs = rsiLast(c); const v4 = rs > 55 && rs < 75 ? 1 : rs < 45 && rs > 25 ? -1 : 0;
    T('RSI', 'الكلاسيكي', 3, v4, 'RSI ' + rs.toFixed(0) + W(v4, ': زخم صاعد', ': زخم هابط', ': محايد أو تشبع'));
    const m12 = ema(c, 12), m26 = ema(c, 26), macd = m12.map((x, i) => x - m26[i]), sg = ema(macd, 9), hs = macd.map((x, i) => x - sg[i]);
    const v5 = hs[n] > 0 && hs[n] > hs[n - 1] ? 1 : hs[n] < 0 && hs[n] < hs[n - 1] ? -1 : 0;
    T('MACD', 'الكلاسيكي', 4, v5, W(v5, 'هيستوغرام موجب ويزيد', 'هيستوغرام سالب ويزيد هبوطاً', 'لا زخم واضح'));
    // قرب EMA20 = دخول مبكر (يصوّت مع الترند)، وبعده كثير = ملاحقة (يصوّت ضد الدخول الحين) فتنزل النسبة لحالها
    const ex20 = (px - e20) / a, v6 = d && Math.abs(ex20) < .5 ? d : ex20 > 1.8 ? -1 : ex20 < -1.8 ? 1 : 0;
    T('الارتداد من EMA20 / عدم الملاحقة', 'الكلاسيكي', 2, v6, d && Math.abs(ex20) < .5 ? 'السعر قرب EMA20 مع الترند (دخول مبكر)' : ex20 > 1.8 ? 'السعر ممتد فوق EMA20 (ملاحقة، الأفضل ينتظر رجوع)' : ex20 < -1.8 ? 'السعر ممتد تحت EMA20 (ملاحقة، الأفضل ينتظر رجوع)' : 'السعر بمسافة متوسطة من EMA20', true);
    // فيبوناتشي على آخر 50 شمعة
    const H50 = mx(h, n - 50, n), L50 = mn(l, n - 50, n); let hi = n, lo = n;
    for (let i = n - 50; i <= n; i++) { if (h[i] === H50) hi = i; if (l[i] === L50) lo = i; }
    let v7 = 0; if (H50 > L50) { if (hi > lo) { const r = (H50 - px) / (H50 - L50); if (r >= .382 && r <= .618) v7 = 1; } else { const r = (px - L50) / (H50 - L50); if (r >= .382 && r <= .618) v7 = -1; } }
    T('فيبوناتشي 38-62%', 'الكلاسيكي', 3, v7, W(v7, 'ارتداد داخل منطقة 38-62% بعد صعود', 'ارتداد داخل منطقة 38-62% بعد هبوط', 'خارج منطقة فيبوناتشي'), true);

    // ===== حركة السعر =====
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

    // ===== العرض والطلب ودعم/مقاومة =====
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

    // ===== ICT / SMC =====
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

    // ===== إيشيموكو =====
    const tk = i => (mx(h, i - 8, i) + mn(l, i - 8, i)) / 2, kj = i => (mx(h, i - 25, i) + mn(l, i - 25, i)) / 2, sb = i => (mx(h, i - 51, i) + mn(l, i - 51, i)) / 2;
    const m26i = n - 26, cA = (tk(m26i) + kj(m26i)) / 2, cB = sb(m26i), top = Math.max(cA, cB), bot = Math.min(cA, cB);
    const v22 = px > top ? 1 : px < bot ? -1 : 0;
    T('السحابة', 'إيشيموكو', 3, v22, W(v22, 'السعر فوق السحابة', 'السعر تحت السحابة', 'السعر داخل السحابة'));
    const v23 = tk(n) > kj(n) ? 1 : tk(n) < kj(n) ? -1 : 0;
    T('تقاطع Tenkan/Kijun', 'إيشيموكو', 3, v23, W(v23, 'Tenkan فوق Kijun', 'Tenkan تحت Kijun', 'متساويان'));

    // ===== أدوات أقوى: فريمات أكبر وSupertrend =====
    // (انشالت 3 أدوات متكررة: Spring/Upthrust يكرر سحب السيولة، وقمة/قاع أمس والانحدار الخطي وزنهم 1 ويكررون أدوات ثانية)
    const agg = k => { const g = Math.floor((n + 1) / k), st = n + 1 - g * k, cc = []; for (let i = 0; i < g; i++) cc.push(c[st + i * k + k - 1]); return cc; };
    const htf = (k, f, sl) => { const cc = agg(k); if (cc.length < sl + 3) return 0; const A = ema(cc, f)[cc.length - 1], B = ema(cc, sl)[cc.length - 1], x = cc[cc.length - 1]; return x > B && A > B ? 1 : x < B && A < B ? -1 : 0; };
    const h4 = htf(4, 20, 50);
    T('اتجاه فريم أكبر (×4)', 'تعدد الفريمات', 3, h4, W(h4, 'الفريم الأكبر (×4) صاعد', 'الفريم الأكبر (×4) هابط', 'الفريم الأكبر (×4) بدون اتجاه'));
    const h12 = htf(12, 8, 21);
    T('اتجاه فريم أكبر (×12)', 'تعدد الفريمات', 2, h12, W(h12, 'الفريم الأكبر (×12) صاعد', 'الفريم الأكبر (×12) هابط', 'الفريم الأكبر (×12) بدون اتجاه'));
    const stT = (() => { const p = 10, m = 3, A = atrS(h, l, c, p); let fu = null, fb = null, t = 1;
      for (let i = p; i <= n; i++) { const hl2 = (h[i] + l[i]) / 2, bu = hl2 + m * A[i], bl = hl2 - m * A[i];
        if (fu === null) { fu = bu; fb = bl; t = c[i] >= hl2 ? 1 : -1; continue; }
        const pfu = fu, pfb = fb;
        fu = (bu < pfu || c[i - 1] > pfu) ? bu : pfu; fb = (bl > pfb || c[i - 1] < pfb) ? bl : pfb;
        if (t === 1 && c[i] < pfb) t = -1; else if (t === -1 && c[i] > pfu) t = 1; }
      return t; })();
    T('Supertrend', 'الكلاسيكي', 2, stT, W(stT, 'Supertrend صاعد', 'Supertrend هابط'));

    // ===== أدوات إضافية =====
    // كل أداة تصوّت فقط لما يكون عندها رأي واضح، وغير هذا تمتنع (صفر) فما تدخل بالنسبة. أدوات الارتداد (Stochastic وBollinger وCCI) مفلترة بالترند:
    // تصوّت بس لما تكون نقطة دخول بعد تصحيح مع الاتجاه العام، فما تعاكس الأدوات الأساسية وما تقلل الصفقات.
    const up50 = px > e50, dn50 = px < e50;
    const stc = stochS(h, l, c); let x1 = 0;
    for (let j = n - 2; j <= n; j++) { const K0 = stc.K[j], D0 = stc.D[j], K1 = stc.K[j - 1], D1 = stc.D[j - 1]; if (K0 == null || D0 == null || K1 == null || D1 == null) continue;
      if (up50 && K0 > D0 && K1 <= D1 && Math.min(K0, K1) < 35) x1 = 1; else if (dn50 && K0 < D0 && K1 >= D1 && Math.max(K0, K1) > 65) x1 = -1; }
    T('Stochastic', 'الكلاسيكي', 3, x1, W(x1, 'تقاطع صاعد من تشبع بيع مع الترند', 'تقاطع هابط من تشبع شراء مع الترند', 'لا تقاطع من منطقة تشبع'), true);
    const bbAt = i => { let t = 0; for (let k = i - 19; k <= i; k++) t += c[k]; const m = t / 20; let q2 = 0; for (let k = i - 19; k <= i; k++) q2 += (c[k] - m) * (c[k] - m); return { m, sd: Math.sqrt(q2 / 20) }; };
    let x2 = 0;
    for (let j = n - 1; j <= n; j++) { const B = bbAt(j), lowB = B.m - 2 * B.sd, upB = B.m + 2 * B.sd;
      if (up50 && l[j] < lowB && c[j] > lowB && c[n] > o[n]) x2 = 1; else if (dn50 && h[j] > upB && c[j] < upB && c[n] < o[n]) x2 = -1; }
    T('Bollinger ارتداد', 'الكلاسيكي', 2, x2, W(x2, 'لمس الحد السفلي ورجع داخل النطاق مع الترند', 'لمس الحد العلوي ورجع داخل النطاق مع الترند', 'لا ارتداد من حدود بولنجر'), true);
    const cciAt = i => { const tp = j2 => (h[j2] + l[j2] + c[j2]) / 3; let t = 0; for (let k = i - 19; k <= i; k++) t += tp(k); const m = t / 20; let md = 0; for (let k = i - 19; k <= i; k++) md += Math.abs(tp(k) - m); md /= 20; return md ? (tp(i) - m) / (0.015 * md) : 0; };
    let x3 = 0;
    for (let j = n - 1; j <= n; j++) { const c0 = cciAt(j), c1 = cciAt(j - 1); if (up50 && c1 < -100 && c0 > -100) x3 = 1; else if (dn50 && c1 > 100 && c0 < 100) x3 = -1; }
    T('CCI', 'الكلاسيكي', 2, x3, W(x3, 'CCI عاد فوق -100 مع الترند', 'CCI عاد تحت +100 مع الترند', 'CCI بدون إشارة'));
    const RS = rsiSeries(c); let x4 = 0;
    // تباعد حقيقي فقط: قاعين (أو قمتين) متباعدين 8-50 شمعة، فرق السعر 0.3 ATR على الأقل، فرق RSI 4 نقاط على الأقل، والقاع الثاني بمنطقة ضعف (RSI تحت 45) أو القمة الثانية بمنطقة قوة (فوق 55)
    if (pl2.length === 2 && RS[pl2[0]] != null && RS[pl2[1]] != null && pl2[1] >= n - 15 && pl2[1] - pl2[0] >= 8 && pl2[1] - pl2[0] <= 50 && l[pl2[0]] - l[pl2[1]] >= .3 * a && RS[pl2[1]] > RS[pl2[0]] + 4 && RS[pl2[1]] < 45) x4 = 1;
    else if (ph2.length === 2 && RS[ph2[0]] != null && RS[ph2[1]] != null && ph2[1] >= n - 15 && ph2[1] - ph2[0] >= 8 && ph2[1] - ph2[0] <= 50 && h[ph2[1]] - h[ph2[0]] >= .3 * a && RS[ph2[1]] < RS[ph2[0]] - 4 && RS[ph2[1]] > 55) x4 = -1;
    T('تباعد RSI', 'الكلاسيكي', 3, x4, W(x4, 'تباعد صاعد (قاع أدنى بالسعر وأعلى بـ RSI)', 'تباعد هابط (قمة أعلى بالسعر وأدنى بـ RSI)', 'لا تباعد'), true);
    const sqz = i => 2 * bbAt(i).sd < 1.5 * AT[i];
    let x5 = 0, sqn = 0; for (let j = n - 6; j <= n - 1; j++) if (sqz(j)) sqn++;
    if (sqn >= 3 && !sqz(n)) { if (c[n] > e20 && c[n] > c[n - 1] && c[n] - e20 > .3 * a) x5 = 1; else if (c[n] < e20 && c[n] < c[n - 1] && e20 - c[n] > .3 * a) x5 = -1; }
    T('انفجار بعد انضغاط (Squeeze)', 'الكلاسيكي', 3, x5, W(x5, 'خروج صاعد بعد انضغاط التذبذب', 'خروج هابط بعد انضغاط التذبذب', 'لا انضغاط منتهي'), true);
    const bdy = i => Math.abs(c[i] - o[i]); let x7 = 0;
    if (c[n - 2] < o[n - 2] && bdy(n - 2) >= .7 * a && bdy(n - 1) <= .35 * bdy(n - 2) && c[n] > o[n] && c[n] > (o[n - 2] + c[n - 2]) / 2) x7 = 1;
    else if (c[n - 2] > o[n - 2] && bdy(n - 2) >= .7 * a && bdy(n - 1) <= .35 * bdy(n - 2) && c[n] < o[n] && c[n] < (o[n - 2] + c[n - 2]) / 2) x7 = -1;
    else if ([n - 2, n - 1, n].every((i, t, A) => c[i] > o[i] && bdy(i) >= .5 * (h[i] - l[i]) && (t === 0 || c[i] > c[A[t - 1]]))) x7 = 1;
    else if ([n - 2, n - 1, n].every((i, t, A) => c[i] < o[i] && bdy(i) >= .5 * (h[i] - l[i]) && (t === 0 || c[i] < c[A[t - 1]]))) x7 = -1;
    T('نمط 3 شموع (نجمة/جنود)', 'حركة السعر', 3, x7, W(x7, 'نجمة صباح أو ثلاث شموع صاعدة متتالية', 'نجمة مساء أو ثلاث شموع هابطة متتالية', 'لا نمط ثلاث شموع'), true);
    let x8 = 0;
    if (h[n - 1] < h[n - 2] && l[n - 1] > l[n - 2] && h[n - 2] - l[n - 2] >= .8 * a) { if (c[n] > h[n - 2]) x8 = 1; else if (c[n] < l[n - 2]) x8 = -1; }
    T('Inside Bar اختراق', 'حركة السعر', 2, x8, W(x8, 'اختراق صاعد لشمعة داخلية', 'اختراق هابط لشمعة داخلية', 'لا Inside Bar مخترق'), true);
    let x9 = 0;
    if (ph2.length === 2) { const p0 = ph2[0], p1 = ph2[1]; if (Math.abs(h[p0] - h[p1]) <= .35 * a && p1 - p0 >= 8 && p1 - p0 <= 60 && p1 >= n - 25) { const nk2 = mn(l, p0, p1); if (c[n] < nk2 && c[n] > nk2 - 2 * a) x9 = -1; } }
    if (!x9 && pl2.length === 2) { const p0 = pl2[0], p1 = pl2[1]; if (Math.abs(l[p0] - l[p1]) <= .35 * a && p1 - p0 >= 8 && p1 - p0 <= 60 && p1 >= n - 25) { const nk2 = mx(h, p0, p1); if (c[n] > nk2 && c[n] < nk2 + 2 * a) x9 = 1; } }
    T('قمة/قاع مزدوج', 'حركة السعر', 3, x9, W(x9, 'قاع مزدوج مع كسر خط العنق للأعلى', 'قمة مزدوجة مع كسر خط العنق للأسفل', 'لا قمة أو قاع مزدوج'), true);
    const H100 = mx(h, n - 100, n), L100 = mn(l, n - 100, n), pdp = H100 > L100 ? (px - L100) / (H100 - L100) : .5;
    const x10 = d > 0 && pdp < .5 ? 1 : d < 0 && pdp > .5 ? -1 : 0;
    T('Premium / Discount', 'ICT/SMC', 2, x10, W(x10, 'شراء من منطقة خصم (النصف السفلي) مع ترند صاعد', 'بيع من منطقة علاوة (النصف العلوي) مع ترند هابط', 'السعر عكس منطقة الدخول المناسبة'));

    // ===== Smart Money Strategy: سلسلة كاملة بالترتيب الصحيح =====
    // سحب سيولة (اختراق قمة/قاع آخر 20 شمعة ورجوع) ← شمعة كسر هيكل بقوة (جسمها 0.7 ATR على الأقل) تتجاوز محيط السحب ← السعر يرجع لنصف الحركة الأقرب (منطقة خصم أو علاوة) بدون ما يكسر قاع/قمة السحب.
    // أقوى من الأدوات المنفصلة لأنها تشترط التسلسل كامل، وتمتنع (صفر) إذا ما اكتمل.
    const smcSeq = (() => { for (const sd of [1, -1]) { let jS = -1;
        for (let j = n - 3; j >= n - 15 && j >= 25; j--) { const lvl = sd > 0 ? mn(l, j - 20, j - 1) : mx(h, j - 20, j - 1); if (sd > 0 ? (l[j] < lvl && c[j] > lvl) : (h[j] > lvl && c[j] < lvl)) { jS = j; break; } }
        if (jS < 0) continue;
        const ref = sd > 0 ? mx(h, jS - 5, jS) : mn(l, jS - 5, jS); let kB = -1;
        for (let k = jS + 1; k <= n; k++) if ((sd > 0 ? c[k] > ref : c[k] < ref) && Math.abs(c[k] - o[k]) >= .7 * a) { kB = k; break; }
        if (kB < 0 || kB >= n) continue;
        const swing = sd > 0 ? mx(h, jS, n) : mn(l, jS, n), base = sd > 0 ? l[jS] : h[jS], half = (swing + base) / 2;
        if (sd > 0 ? (px <= half && px > base) : (px >= half && px < base)) return sd; }
      return 0; })();
    T('Smart Money Strategy', 'ICT/SMC', 4, smcSeq, W(smcSeq, 'سحب سيولة القاع ← كسر هيكل صاعد ← رجوع لمنطقة خصم', 'سحب سيولة القمة ← كسر هيكل هابط ← رجوع لمنطقة علاوة', 'لا تسلسل Smart Money مكتمل (سحب سيولة ← كسر هيكل ← رجوع)'), true);

    // ===== تحليل زمني (Time Analysis): سلوك السعر حسب وقت اليوم =====
    // نسترجع وقت كل شمعة من الوقت الحالي وطول الفريم (بدون الاعتماد على توقيت بيانات المصدر). يشتغل من M1 لحد H1 وبنافذة لندن ونيويورك (07:00-17:00 UTC) فقط.
    // نقارن السعر بنطاق الجلسة الآسيوية (00:00-07:00 UTC): سحب قمة/قاع النطاق ثم رجوع (Judas Swing)، أو قبول سعري خارجه، وإلا انحياز السعر مقابل افتتاح اليوم (أكثر من نصف ATR).
    const tmAn = (() => {
      const t1 = Date.parse(String(v[n].datetime || '').replace(' ', 'T') + 'Z'), tb = Date.parse(String(v[n - 1].datetime || '').replace(' ', 'T') + 'Z'), tfm = t1 - tb;
      if (!(tfm >= 60000 && tfm <= 3600000)) return { vote: 0, text: 'التحليل الزمني يشتغل لفريمات لحد H1' };
      const Tz = Math.floor(now / tfm) * tfm, tAt = i => Tz - (n - i) * tfm, day0 = Math.floor(now / 864e5) * 864e5, hr = (now - day0) / 36e5;
      if (hr < 7 || hr >= 17) return { vote: 0, text: 'خارج نافذة لندن/نيويورك (07:00-17:00 UTC)، بدون رأي زمني' };
      let AH = -Infinity, AL = Infinity, open0 = null, cn2 = 0;
      for (let i = 0; i <= n; i++) { const t = tAt(i); if (t < day0) continue; if (open0 === null) open0 = o[i]; if (t < day0 + 7 * 36e5) { cn2++; if (h[i] > AH) AH = h[i]; if (l[i] < AL) AL = l[i]; } }
      if (open0 === null || cn2 < 4) return { vote: 0, text: 'بيانات الجلسة الآسيوية غير كافية' };
      const lo6 = mn(l, n - 5, n), hi6 = mx(h, n - 5, n);
      if (lo6 < AL && c[n] > AL) return { vote: 1, text: 'سحب قاع الجلسة الآسيوية ثم رجوع (Judas Swing صاعد)' };
      if (hi6 > AH && c[n] < AH) return { vote: -1, text: 'سحب قمة الجلسة الآسيوية ثم رجوع (Judas Swing هابط)' };
      if (c[n] > AH && c[n - 1] > AH) return { vote: 1, text: 'قبول سعري فوق قمة الجلسة الآسيوية' };
      if (c[n] < AL && c[n - 1] < AL) return { vote: -1, text: 'قبول سعري تحت قاع الجلسة الآسيوية' };
      if (px > open0 + .5 * a) return { vote: 1, text: 'السعر فوق افتتاح اليوم بأكثر من نصف ATR' };
      if (px < open0 - .5 * a) return { vote: -1, text: 'السعر تحت افتتاح اليوم بأكثر من نصف ATR' };
      return { vote: 0, text: 'السعر داخل نطاق الجلسة الآسيوية وقرب افتتاح اليوم' };
    })();
    T('تحليل زمني (Time Analysis)', 'التحليل الزمني', 3, tmAn.vote, tmAn.text, tmAn.vote !== 0);

    // ===== بديلين من السعر فقط لأداتين تحتاج بيانات حجم (ما فيه حجم حقيقي للذهب والفوركس، فهي تقريبية مو حجم ولا أوردر فلو حقيقي) =====
    const dpf = Math.max(0, Math.round(-Math.log10(pr.pip)) + 1), cp = (x, lo2, hi2) => Math.max(lo2, Math.min(hi2, x));
    // Volume Profile (بروفايل زمني TPO): كم شمعة لمست كل مستوى سعري خلال آخر 100 شمعة. POC = أكثر مستوى لمسه السعر، ومنطقة القيمة (VA) = 70% من الوقت حوله.
    // إغلاقين متتاليين فوق منطقة القيمة = قبول سعري أعلى (شراء)، وتحتها = قبول أدنى (بيع). داخلها = بدون رأي.
    const tpo = (() => { const m = 100, B = 40, top2 = mx(h, n - m + 1, n), bot2 = mn(l, n - m + 1, n), st = (top2 - bot2) / B || 1, cb = new Array(B).fill(0);
      for (let i = n - m + 1; i <= n; i++) { const b0 = cp(Math.floor((l[i] - bot2) / st), 0, B - 1), b1 = cp(Math.floor((h[i] - bot2) / st), 0, B - 1); for (let b = b0; b <= b1; b++) cb[b]++; }
      let poc = 0; for (let b = 1; b < B; b++) if (cb[b] > cb[poc]) poc = b;
      const tot = cb.reduce((s2, x) => s2 + x, 0); let a2 = poc, b2 = poc, acc = cb[poc];
      while (acc < 0.7 * tot && (a2 > 0 || b2 < B - 1)) { const dn2 = a2 > 0 ? cb[a2 - 1] : -1, up2 = b2 < B - 1 ? cb[b2 + 1] : -1; if (up2 >= dn2) { b2++; acc += cb[b2]; } else { a2--; acc += cb[a2]; } }
      return { poc: bot2 + (poc + .5) * st, val: bot2 + a2 * st, vah: bot2 + (b2 + 1) * st }; })();
    const vtp = c[n] > tpo.vah && c[n - 1] > tpo.vah ? 1 : c[n] < tpo.val && c[n - 1] < tpo.val ? -1 : 0;
    T('Volume Profile (TPO تقريبي)', 'بروفايل الحجم', 3, vtp, 'POC ' + tpo.poc.toFixed(dpf) + ' | منطقة القيمة ' + tpo.val.toFixed(dpf) + ' - ' + tpo.vah.toFixed(dpf) + W(vtp, ': قبول سعري فوق منطقة القيمة', ': قبول سعري تحت منطقة القيمة', ': السعر داخل منطقة القيمة'));
    // Order Flow (Delta تقريبي): دلتا الشمعة = (إغلاقها - أدناها) - (أعلاها - إغلاقها)، يعني وين أغلقت داخل مداها. مجموع آخر 10 شموع ÷ مجموع المدى = ضغط بين -1 و+1.
    // تباعد: اختراق قمة 20 شمعة بضغط بيع = امتصاص (بيع)، وكسر قاع 20 شمعة بضغط شراء = امتصاص (شراء).
    const dlt = (() => { let s2 = 0, rg2 = 0; for (let i = n - 9; i <= n; i++) { s2 += (c[i] - l[i]) - (h[i] - c[i]); rg2 += h[i] - l[i]; } return rg2 > 0 ? s2 / rg2 : 0; })();
    const vdl = dlt > .25 ? 1 : dlt < -.25 ? -1 : 0, vdv = px > hh && dlt < 0 ? -1 : px < ll && dlt > 0 ? 1 : 0, vof = vdv || vdl;
    T('Order Flow (Delta تقريبي)', 'تدفق الأوامر', 3, vof, 'ضغط الشراء/البيع ' + (dlt >= 0 ? '+' : '') + dlt.toFixed(2) + (vdv ? W(vof, ': كسر قاع بضغط شراء (امتصاص)', ': اختراق قمة بضغط بيع (امتصاص)') : W(vof, ': ضغط شراء واضح', ': ضغط بيع واضح', ': ضغط متوازن')));

    // ===== التحليل التاريخي (Historical Pattern Analysis): دليل مستقل من حالات مشابهة سابقة =====
    // يدخل بالتوافق (وزن 8) فقط إذا نجح اختباره الزمني بدون تسريب مستقبلي (adopted)، وإلا يظهر بتصويت صفر.
    if (ctx.hpa) T('Historical Pattern', 'التحليل التاريخي', 8, ctx.hpa.adopted ? ctx.hpa.vote : 0, ctx.hpa.text);

    // ===== فلاتر: الجلسة، الأخبار، التذبذب، قوة الترند (تدخل بالنسبة فقط، ما تمنع الدخول) =====
    const S = ctx.ses(pr, now), N = ctx.nk(pr.c, now);
    const fl = (name, school, w, ok, text) => F.push({ n: name, s: school, w, v: null, f: true, ok, t: text, ev: false, p: 0, m: w });
    fl('الجلسة', 'السكالبينغ', 7, S.closed ? 0 : S.p / 15 * 7, S.t);
    fl('الأخبار', 'التحليل الأساسي', 7, N.v === 0 ? 7 : N.v === 1 ? 3 : N.v === 2 ? 0 : 3.5, N.t);
    let sAtr = 0, cnt = 0; for (let i = n - 49; i <= n; i++) { sAtr += AT[i]; cnt++; } const rt = a / (sAtr / cnt);
    fl('التذبذب ATR', 'السكالبينغ', 2, rt >= .7 && rt <= 2 ? 2 : (rt >= .5 && rt < .7) || (rt > 2 && rt <= 3) ? 1 : 0, 'الحركة ' + rt.toFixed(2) + '× المعتاد');
    const ax = adxLast(h, l, c); fl('قوة الترند ADX', 'الكلاسيكي', 2, ax >= 20 ? 2 : ax >= 15 ? 1 : 0, 'ADX ' + ax.toFixed(0));

    // ===== النتيجة: نسبة اتفاق كل الأدوات هي شرط الدخول الوحيد =====
    // لكل اتجاه (شراء/بيع): النسبة = وزن الأدوات المتفقة ÷ (المتفقة + المختلفة). نختار الاتجاه الأعلى نسبة.
    // إذا النسبة 70% أو أكثر (ctx.min) يطلع دخول، بدون أي شرط ثاني (لا ترند إلزامي، لا منع للأخبار أو الجلسة).
    const scoreFor = dir => { let ag = 0, dg = 0, evW = 0;
      for (const x of F) { if (x.f) { ag += x.ok; dg += x.w - x.ok; } else if (x.v === dir) { ag += x.w; if (x.ev) evW += x.w; } else if (x.v === -dir) dg += x.w; }
      return { dir, ag, dg, evW, sc: Math.round(100 * ag / ((ag + dg) || 1)) }; };
    const sB = scoreFor(1), sS = scoreFor(-1), best = sB.sc >= sS.sc ? sB : sS;
    const dir = best.dir, sc = best.sc, ag = best.ag, dg = best.dg, evW = best.evW;
    for (const x of F) x.p = x.f ? x.ok : x.v === dir ? x.w : 0;
    const min = ctx.min || 70, why = sc < min ? 'قوة التوافق ' + sc + '% أقل من ' + min + '%' : '';

    // ===== نوع الدخول: فوري أو أمر معلّق =====
    // فوري: السعر قريب من منطقة الدخول. Limit: السعر ممتد بعيد عن EMA20 فننتظر رجوعه. Stop: ما فيه محفز بعد والسعر قريب من مستوى الاختراق.
    const ex = dir * (px - e20) / a, bk = dir > 0 ? hh : ll, toBk = dir * (bk - px) / a, trig = evW >= 3;
    let order = { type: 'market', price: px, label: 'ادخل الآن (Market)', why: trig ? 'فيه محفز دخول والسعر قريب من منطقة الدخول' : 'السعر قريب من منطقة الدخول' };
    if (ex > 1.5 || (!trig && ex > 0.8)) order = { type: 'limit', price: e20, label: dir > 0 ? 'أمر معلّق Buy Limit' : 'أمر معلّق Sell Limit', why: 'السعر بعيد عن EMA20 (' + ex.toFixed(1) + ' ATR)، الأفضل تنتظر رجوعه لـ EMA20' };
    else if (!trig && toBk > 0 && toBk <= 1.0) order = { type: 'stop', price: bk + dir * 0.1 * a, label: dir > 0 ? 'أمر معلّق Buy Stop' : 'أمر معلّق Sell Stop', why: 'ما فيه محفز بعد، والسعر قريب من مستوى الاختراق (' + toBk.toFixed(1) + ' ATR)' };
    const ent = order.price;

    // ===== الوقف والأهداف بنقاط MT5 (النقطة = 0.01$ للذهب، 100 نقطة = 1$) من سعر الدخول =====
    // الوقف والهدفان بين 700 و1500 نقطة على كل الفريمات. الهدف مو لازم يكون أكبر من الوقف.
    const unit = pr.pip / 10, cl = (x, lo2, hi2) => Math.max(lo2, Math.min(hi2, x)), r10 = x => Math.round(x / 10) * 10;
    const aP = a / unit;
    const q = Math.max(0, Math.min(1, 0.6 * (sc - 70) / 30 + 0.4 * Math.min(evW / 8, 1)));
    const from = Math.max(3, n - 120);
    const lows = P.pl.filter(i => i >= from).map(i => l[i]), highs = P.ph.filter(i => i >= from).map(i => h[i]);
    const prot = dir > 0 ? Math.max(-Infinity, ...lows.filter(x => x < ent)) : Math.min(Infinity, ...highs.filter(x => x > ent));
    const front = dir > 0 ? Math.min(Infinity, ...highs.filter(x => x > ent)) : Math.max(-Infinity, ...lows.filter(x => x < ent));
    const dProt = isFinite(prot) ? Math.abs(ent - prot) / unit + 0.15 * aP : null, dFront = isFinite(front) ? Math.abs(front - ent) / unit : null;
    // الوقف والأهداف تتحدد فقط حسب قوة الإشارة وظروف السوق (بدون أي رقم ثابت): نحوّل كل عامل لموقع بين 0 و1 داخل المدى 700-1500،
    // وإذا طلع الوقف أو الهدف على 700 أو 1500 فهذا نتيجة التحليل مو قص إجباري.
    // قوة الإشارة (q): أقوى = وقف أقرب وهدف أبعد. التذبذب (rt): أعلى من المعتاد = كلشي أوسع. أقرب قاع/قمة بوحدات ATR: الوقف خلفها والهدف الأول عندها.
    const u01 = x => cl(x, 0, 1), sw01 = d0 => u01((d0 / aP - 0.5) / 2.5);
    let fSL = u01(0.60 - 0.45 * q + 0.35 * (rt - 1));
    if (dProt != null) fSL = 0.4 * fSL + 0.6 * sw01(dProt);
    let fT1 = u01(0.20 + 0.65 * q + 0.25 * (rt - 1));
    if (dFront != null) fT1 = 0.5 * fT1 + 0.5 * sw01(dFront);
    const fT2 = u01(0.35 + 0.65 * q + 0.25 * (rt - 1));
    const SL = cl(r10(700 + 800 * fSL), 700, 1500);
    const T1 = cl(r10(700 + 800 * fT1), 700, 1450);
    const T2 = cl(r10(Math.max(700 + 800 * fT2, T1 + 50)), T1 + 50, 1500);

    // ===== درجة جودة الإشارة: للترتيب والتمييز فقط، ما تمنع ولا تقلل أي صفقة =====
    // كل صفقة نسبتها 70% أو أكثر تبقى تطلع، لكن تنعطى ⭐ حسب التأكيدات (محفزات، ترند، زخم، جلسة، أخبار) فتعرف القوية من العادية.
    const vt = nm2 => { const x = F.find(y => y.n === nm2); return x ? x.v : 0; };
    let gp = 0; const gu = [], gd = [];
    if (sc >= 85) { gp += 2; gu.push('اتفاق عالي جداً ' + sc + '%'); } else if (sc >= 78) { gp += 1; gu.push('اتفاق عالي ' + sc + '%'); }
    if (evW >= 6) { gp += 2; gu.push('محفزات دخول قوية'); } else if (evW >= 3) { gp += 1; gu.push('فيه محفز دخول'); } else gd.push('بدون محفز دخول');
    if (ax >= 25) { gp += 1; gu.push('ترند قوي (ADX ' + ax.toFixed(0) + ')'); } else if (ax < 15) { gp -= 1; gd.push('ترند ضعيف (ADX ' + ax.toFixed(0) + ')'); }
    if ([vt('MACD'), vt('RSI'), vt('Supertrend')].filter(x => x === dir).length === 3) { gp += 1; gu.push('MACD وRSI وSupertrend متفقة'); }
    if (v2 !== dir) { gp -= 1; gd.push('عكس اتجاه EMA200'); }
    if ((dir > 0 && rs > 75) || (dir < 0 && rs < 25)) { gp -= 1; gd.push('RSI متطرف (احتمال انعكاس)'); }
    if (!S.closed && S.p >= 11) { gp += 1; gu.push('جلسة سيولة عالية'); } else if (!S.closed && S.p <= 3) { gp -= 1; gd.push('سيولة ضعيفة'); }
    if (N.v === 2) { gp -= 2; gd.push('خبر قوي قريب'); } else if (N.v === 0) { gp += 1; gu.push('ما فيه خبر قريب'); }
    const grade = { pts: gp, stars: gp >= 6 ? 3 : gp >= 3 ? 2 : 1, label: gp >= 6 ? 'ممتازة' : gp >= 3 ? 'جيدة' : 'عادية', up: gu, down: gd };

    return { px, entry: ent, order, grade, a, F, sc, side: why ? 'wait' : dir > 0 ? 'buy' : 'sell', why, d: dir, hh, ll, S, N, ag, dg, miss: 0, evW, tools: F.length, q, pts: { sl: SL, tp1: T1, tp2: T2 }, sl: ent - dir * SL * unit, tp1: ent + dir * T1 * unit, tp2: ent + dir * T2 * unit, pips: SL / 10 };
  }
  const API = { analyze };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.Engine = API;
})(typeof window !== 'undefined' ? window : this);
