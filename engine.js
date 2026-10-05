// محرك التحليل: أدوات مختارة من مدارس واستراتيجيات الفوركس + التحليل التاريخي (HPA) كدليل مستقل.
// نفس الملف يستخدمه الموقع (signals.html) وبوت تيليجرام (scripts/gold_signals.mjs).
(function (root) {
  'use strict';
  const MEMO = {}; // ذاكرة مؤقتة لحسابات التاريخ الثقيلة (إحصائيات الجلسات والتحليل الاحتمالي)، تتغير فقط لما يتغير التاريخ
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
    const E20 = ema(c, 20), E50 = ema(c, 50), E200 = ema(c, 200);
    const e20 = E20[n], e50 = E50[n], e200 = E200[n];
    const AT = atrS(h, l, c), a = AT[n];
    const hh = mx(h, n - 20, n - 1), ll = mn(l, n - 20, n - 1);
    const d = (px > e50 && e20 > e50) ? 1 : (px < e50 && e20 < e50) ? -1 : 0; // اتجاه المتوسطات: مو أداة تصويت، يستخدمه Premium/Discount
    const P = pivots(h, l, n);
    const F = [];
    // ev: أداة حدث (تعتبر نقطة دخول). f: فلتر (يتفق مع أي اتجاه).
    const T = (name, school, w, vote, text, ev) => F.push({ n: name, s: school, w, v: vote, t: text, ev: !!ev, p: 0, m: w });
    const W = (vote, up, dn, none) => vote > 0 ? up : vote < 0 ? dn : none;

    // ===== الكلاسيكي =====
    const v2 = px > e200 ? 1 : -1; // يستخدم بدرجة جودة الإشارة فقط (مو أداة تصويت)
    const rs = rsiLast(c); const v4 = rs > 55 && rs < 75 ? 1 : rs < 45 && rs > 25 ? -1 : 0;
    T('RSI', 'الكلاسيكي', 3, v4, 'RSI ' + rs.toFixed(0) + W(v4, ': زخم صاعد', ': زخم هابط', ': محايد أو تشبع'));
    const m12 = ema(c, 12), m26 = ema(c, 26), macd = m12.map((x, i) => x - m26[i]), sg = ema(macd, 9), hs = macd.map((x, i) => x - sg[i]);
    const v5 = hs[n] > 0 && hs[n] > hs[n - 1] ? 1 : hs[n] < 0 && hs[n] < hs[n - 1] ? -1 : 0;
    T('MACD', 'الكلاسيكي', 4, v5, W(v5, 'هيستوغرام موجب ويزيد', 'هيستوغرام سالب ويزيد هبوطاً', 'لا زخم واضح'));
    // فيبوناتشي على آخر 50 شمعة
    const H50 = mx(h, n - 50, n), L50 = mn(l, n - 50, n); let hi = n, lo = n;
    for (let i = n - 50; i <= n; i++) { if (h[i] === H50) hi = i; if (l[i] === L50) lo = i; }
    let v7 = 0; if (H50 > L50) { if (hi > lo) { const r = (H50 - px) / (H50 - L50); if (r >= .382 && r <= .618) v7 = 1; } else { const r = (px - L50) / (H50 - L50); if (r >= .382 && r <= .618) v7 = -1; } }
    T('فيبوناتشي 38-62%', 'الكلاسيكي', 3, v7, W(v7, 'ارتداد داخل منطقة 38-62% بعد صعود', 'ارتداد داخل منطقة 38-62% بعد هبوط', 'خارج منطقة فيبوناتشي'), true);

    // ===== حركة السعر =====
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

    // ===== فريمات أكبر =====
    const agg = k => { const g = Math.floor((n + 1) / k), st = n + 1 - g * k, cc = []; for (let i = 0; i < g; i++) cc.push(c[st + i * k + k - 1]); return cc; };
    const htf = (k, f, sl) => { const cc = agg(k); if (cc.length < sl + 3) return 0; const A = ema(cc, f)[cc.length - 1], B = ema(cc, sl)[cc.length - 1], x = cc[cc.length - 1]; return x > B && A > B ? 1 : x < B && A < B ? -1 : 0; };
    const h4 = htf(4, 20, 50);
    T('اتجاه فريم أكبر (×4)', 'تعدد الفريمات', 3, h4, W(h4, 'الفريم الأكبر (×4) صاعد', 'الفريم الأكبر (×4) هابط', 'الفريم الأكبر (×4) بدون اتجاه'));
    const h12 = htf(12, 8, 21);
    T('اتجاه فريم أكبر (×12)', 'تعدد الفريمات', 2, h12, W(h12, 'الفريم الأكبر (×12) صاعد', 'الفريم الأكبر (×12) هابط', 'الفريم الأكبر (×12) بدون اتجاه'));

    // ===== أدوات إضافية =====
    // كل أداة تصوّت فقط لما يكون عندها رأي واضح، وغير هذا تمتنع (صفر) فما تدخل بالنسبة، فما تقلل الصفقات.
    const bbAt = i => { let t = 0; for (let k = i - 19; k <= i; k++) t += c[k]; const m = t / 20; let q2 = 0; for (let k = i - 19; k <= i; k++) q2 += (c[k] - m) * (c[k] - m); return { m, sd: Math.sqrt(q2 / 20) }; }; // مستخدمة بأداة Squeeze

    // ===== الهيكلية السعرية (Market Structure): القمم والقيعان الكبيرة =====
    // أوسع من أداة "هيكل قمم وقيعان" الصغيرة: قمتين وقاعين كبار، كل واحد مؤكد بـ 8 شموع من كل جهة.
    // قمم وقيعان أعلى = هيكل صاعد سليم (شراء)، وأدنى = هابط (بيع). وإذا السعر كسر آخر قاع كبير بالهيكل الصاعد (أو آخر قمة كبيرة بالهابط) = تحول هيكلي CHoCH ويصوّت عكس الهيكل القديم.
    const PM = pivots(h, l, n, 8), mh = PM.ph.slice(-2), ml = PM.pl.slice(-2); let sA = 0, tA = 'هيكل كبير غير واضح (قمم وقيعان مختلطة أو ما فيه عدد كافي)', brk = false;
    if (mh.length === 2 && ml.length === 2) { const H1 = h[mh[1]], H0 = h[mh[0]], L1 = l[ml[1]], L0 = l[ml[0]];
      if (H1 > H0 && L1 > L0) { if (px > L1) { sA = 1; tA = 'قمم وقيعان كبيرة أعلى والهيكل سليم'; } else { sA = -1; tA = 'كسر آخر قاع كبير: تحول هيكلي هابط (CHoCH)'; brk = true; } }
      else if (H1 < H0 && L1 < L0) { if (px < H1) { sA = -1; tA = 'قمم وقيعان كبيرة أدنى والهيكل سليم'; } else { sA = 1; tA = 'كسر آخر قمة كبيرة: تحول هيكلي صاعد (CHoCH)'; brk = true; } } }
    T('الهيكلية السعرية', 'حركة السعر', 3, sA, tA, brk);

    // ===== السيولة (Liquidity Pools): تجمعات قمم أو قيعان متساوية =====
    // تجمّع سيولة = قمتين (EQH) أو قاعين (EQL) متساويين تقريباً (فرق 0.3 ATR) بآخر 100 شمعة وما انكسروا. هذا مكان أوامر الوقف المتراكمة.
    // سحب تجمّع (الذيل يتجاوزه والإغلاق يرجع داخله) = رفض وانعكاس: سحب EQL شراء، سحب EQH بيع. وإذا ما فيه سحب حديث: تجمّع واحد غير ممسوح قريب (أقل من 2.5 ATR) وأقرب بوضوح من التجمّع المعاكس = يجذب السعر نحوه.
    const PLq = pivots(h, l, n, 3), fq = Math.max(0, n - 100), iiH = PLq.ph.filter(i => i >= fq && i <= n - 3), iiL = PLq.pl.filter(i => i >= fq && i <= n - 3), eqH = [], eqL = [];
    for (let x = 0; x < iiH.length; x++) for (let y = x + 1; y < iiH.length; y++) if (Math.abs(h[iiH[x]] - h[iiH[y]]) <= .3 * a && iiH[y] - iiH[x] >= 5) eqH.push({ lvl: Math.max(h[iiH[x]], h[iiH[y]]), i: iiH[y] });
    for (let x = 0; x < iiL.length; x++) for (let y = x + 1; y < iiL.length; y++) if (Math.abs(l[iiL[x]] - l[iiL[y]]) <= .3 * a && iiL[y] - iiL[x] >= 5) eqL.push({ lvl: Math.min(l[iiL[x]], l[iiL[y]]), i: iiL[y] });
    let swH = false, swL = false;
    for (const p of eqH) for (let j = n - 3; j <= n; j++) if (j > p.i + 1 && h[j] > p.lvl && c[j] < p.lvl && mx(c, p.i + 1, j - 1) <= p.lvl) swH = true;
    for (const p of eqL) for (let j = n - 3; j <= n; j++) if (j > p.i + 1 && l[j] < p.lvl && c[j] > p.lvl && mn(c, p.i + 1, j - 1) >= p.lvl) swL = true;
    let lq = swL && !swH ? 1 : swH && !swL ? -1 : 0, lqT = swL && swH ? 'سحب سيولة من الجهتين (متعارض)' : swL ? 'سحب سيولة قيعان متساوية (EQL) ثم رفض' : swH ? 'سحب سيولة قمم متساوية (EQH) ثم رفض' : 'لا سحب لتجمّع سيولة حديثاً', lqEv = lq !== 0;
    if (!swH && !swL) { let dUp = Infinity, dDn = Infinity;
      for (const p of eqH) if (mx(h, p.i + 1, n) <= p.lvl && p.lvl > px) dUp = Math.min(dUp, p.lvl - px);
      for (const p of eqL) if (mn(l, p.i + 1, n) >= p.lvl && p.lvl < px) dDn = Math.min(dDn, px - p.lvl);
      if (dUp <= 2.5 * a && dDn > dUp * 1.5) { lq = 1; lqT = 'قمم متساوية غير ممسوحة فوق السعر (تجذبه للأعلى)'; }
      else if (dDn <= 2.5 * a && dUp > dDn * 1.5) { lq = -1; lqT = 'قيعان متساوية غير ممسوحة تحت السعر (تجذبه للأسفل)'; } }
    T('السيولة (تجمعات متساوية)', 'ICT/SMC', 3, lq, lqT, lqEv);

    const sqz = i => 2 * bbAt(i).sd < 1.5 * AT[i];
    let x5 = 0, sqn = 0; for (let j = n - 6; j <= n - 1; j++) if (sqz(j)) sqn++;
    if (sqn >= 3 && !sqz(n)) { if (c[n] > e20 && c[n] > c[n - 1] && c[n] - e20 > .3 * a) x5 = 1; else if (c[n] < e20 && c[n] < c[n - 1] && e20 - c[n] > .3 * a) x5 = -1; }
    T('انفجار بعد انضغاط (Squeeze)', 'الكلاسيكي', 3, x5, W(x5, 'خروج صاعد بعد انضغاط التذبذب', 'خروج هابط بعد انضغاط التذبذب', 'لا انضغاط منتهي'), true);
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

    // ===== تحليل زمني (Time Analysis): سلوك السعر حسب الجلسة والساعة، على كل ساعات اليوم (UTC) =====
    // نسترجع وقت كل شمعة من الوقت الحالي وطول الفريم (بدون الاعتماد على توقيت بيانات المصدر). يشتغل من M1 لحد H1.
    // كل جلسة تقارن السعر بنطاق الفترة اللي قبلها: آسيا بنطاق أمس، لندن بنطاق آسيا، التداخل بنطاق لندن (07-12)، نيويورك بنطاق لندن والتداخل (07-16)، سيدني بنطاق نيويورك (12-21).
    // القاعدة نفسها بكل الجلسات: سحب قمة/قاع النطاق ثم رجوع (Sweep/Judas)، أو قبول سعري خارجه بإغلاقين، وإلا انحياز السعر مقابل افتتاح الجلسة (أكثر من نصف ATR).
    // المقارنة التاريخية لأداء كل جلسة وساعة (مدى، اتجاه، ميل) تنعرض بالموقع من آخر 10,000 شمعة (ملف sessions.js)، وهنا الرأي اللحظي فقط.
    const tmAn = (() => {
      const t1 = Date.parse(String(v[n].datetime || '').replace(' ', 'T') + 'Z'), tb = Date.parse(String(v[n - 1].datetime || '').replace(' ', 'T') + 'Z'), tfm = t1 - tb;
      if (!(tfm >= 60000 && tfm <= 3600000)) return { vote: 0, text: 'التحليل الزمني يشتغل لفريمات لحد H1' };
      const HR = 36e5, Tz = Math.floor(now / tfm) * tfm, tAt = i => Tz - (n - i) * tfm, day0 = Math.floor(now / 864e5) * 864e5, hr = (now - day0) / HR;
      const SS = [['آسيا', 0, 7, 'نطاق أمس', -24, 0], ['لندن', 7, 12, 'نطاق آسيا', 0, 7], ['تداخل لندن ونيويورك', 12, 16, 'نطاق لندن (07-12)', 7, 12], ['نيويورك', 16, 21, 'نطاق لندن والتداخل (07-16)', 7, 16], ['سيدني', 21, 24, 'نطاق نيويورك (12-21)', 12, 21]];
      const cur = SS.find(s => hr >= s[1] && hr < s[2]), hrI = Math.floor(hr);
      const where = cur[0] + ' (' + String(hrI).padStart(2, '0') + ':00 UTC، الساعة ' + (hrI - cur[1] + 1) + ' من ' + (cur[2] - cur[1]) + ')';
      let RH = -Infinity, RL = Infinity, rc = 0, so = null;
      for (let i = 0; i <= n; i++) { const t = tAt(i);
        if (t >= day0 + cur[4] * HR && t < day0 + cur[5] * HR) { rc++; if (h[i] > RH) RH = h[i]; if (l[i] < RL) RL = l[i]; }
        if (so === null && t >= day0 + cur[1] * HR) so = o[i]; }
      if (rc >= Math.max(4, Math.round(0.4 * (cur[5] - cur[4]) * HR / tfm))) {
        const lo6 = mn(l, n - 5, n), hi6 = mx(h, n - 5, n);
        if (lo6 < RL && c[n] > RL) return { vote: 1, text: where + ': سحب قاع ' + cur[3] + ' ثم رجوع (Sweep/Judas صاعد)' };
        if (hi6 > RH && c[n] < RH) return { vote: -1, text: where + ': سحب قمة ' + cur[3] + ' ثم رجوع (Sweep/Judas هابط)' };
        if (c[n] > RH && c[n - 1] > RH) return { vote: 1, text: where + ': قبول سعري فوق قمة ' + cur[3] };
        if (c[n] < RL && c[n - 1] < RL) return { vote: -1, text: where + ': قبول سعري تحت قاع ' + cur[3] };
      }
      if (so !== null) {
        if (px > so + .5 * a) return { vote: 1, text: where + ': السعر فوق افتتاح الجلسة بأكثر من نصف ATR' };
        if (px < so - .5 * a) return { vote: -1, text: where + ': السعر تحت افتتاح الجلسة بأكثر من نصف ATR' };
      }
      return { vote: 0, text: where + ': السعر داخل ' + cur[3] + ' وقرب افتتاح الجلسة' };
    })();
    T('تحليل زمني (Time Analysis)', 'التحليل الزمني', 3, tmAn.vote, tmAn.text, tmAn.vote !== 0);

    // ===== الزجزاج (ZigZag): نقاط التحول الكبيرة، يعتمد عليها التحليل الهارمونك والتحليل الموجي =====
    // قمم وقيعان مؤكدة بـ 4 شموع من كل جهة، بالتناوب (قمة ثم قاع)، وأي حركة أقل من 0.8 ATR تتجاهل (ضجيج).
    const zz = (() => { const PK = pivots(h, l, n, 4), arr = [], out = [];
      for (const i of PK.ph) if (i >= n - 300) arr.push({ i, t: 1, p: h[i] });
      for (const i of PK.pl) if (i >= n - 300) arr.push({ i, t: -1, p: l[i] });
      arr.sort((x, y) => x.i - y.i);
      for (const x of arr) { const L = out[out.length - 1];
        if (L && L.t === x.t) { if (x.t === 1 ? x.p > L.p : x.p < L.p) out[out.length - 1] = x; }
        else if (L && Math.abs(x.p - L.p) < .8 * a) continue;
        else out.push(x); }
      return out; })();

    // ===== التحليل الهارمونك (Harmonic): Gartley وBat وButterfly وCrab =====
    // نمط من 5 نقاط X-A-B-C-D. النقاط X وA وB وC آخر 4 نقاط زجزاج مؤكدة، والنقطة D هي السعر الحالي. شروط النسب (مع هامش 6%):
    // AB/XA: Gartley 0.618، Bat 0.382-0.5، Butterfly 0.786، Crab 0.382-0.618. BC/AB بين 0.382 و0.886. ومستوى D من XA: Gartley 0.786، Bat 0.886، Butterfly 1.272، Crab 1.618.
    // يصوّت فقط إذا السعر الحالي داخل نصف ATR (0.6) من مستوى D المحسوب، ونسبة CD/BC ضمن نطاق النمط. النمط الصاعد (XA صاعد) = شراء عند D، والهابط = بيع.
    const dp2 = Math.max(0, Math.round(-Math.log10(pr.pip)) + 1);
    const hmn = (() => {
      const none = { v: 0, t: 'لا نمط هارمونيك مكتمل عند السعر الحالي' };
      if (zz.length < 4) return none;
      const [X, A, B, C] = zz.slice(-4);
      if (n - C.i > 60) return none;
      const xa = A.p - X.p, sd = xa > 0 ? 1 : -1, XA = Math.abs(xa), AB = Math.abs(B.p - A.p), BC = Math.abs(C.p - B.p);
      if (XA < 2.5 * a || AB <= 0 || BC <= 0) return none;
      const shape = sd > 0 ? (B.p < A.p && B.p > X.p && C.p > B.p && C.p < A.p) : (B.p > A.p && B.p < X.p && C.p < B.p && C.p > A.p);
      if (!shape) return none;
      const rAB = AB / XA, rBC = BC / AB, tol = .06;
      const PT = [{ n: 'Gartley', ab: [.568, .668], dx: .786, cd: [1.13, 1.618] }, { n: 'Bat', ab: [.382, .5], dx: .886, cd: [1.618, 2.618] },
        { n: 'Butterfly', ab: [.736, .836], dx: 1.272, cd: [1.618, 2.24] }, { n: 'Crab', ab: [.382, .618], dx: 1.618, cd: [2.24, 3.618] }];
      let best = null;
      for (const p of PT) {
        if (rAB < p.ab[0] - tol || rAB > p.ab[1] + tol || rBC < .382 - tol || rBC > .886 + tol) continue;
        const D = A.p - p.dx * xa, dist = Math.abs(px - D), rCD = Math.abs(C.p - px) / BC;
        if (dist > .6 * a || rCD < p.cd[0] - .15 || rCD > p.cd[1] + .15) continue;
        if (sd > 0 ? px >= C.p : px <= C.p) continue; // السعر لازم يكون نزل (أو صعد) من C باتجاه D
        if (!best || dist < best.dist) best = { p, D, dist };
      }
      if (!best) return none;
      return { v: sd, t: best.p.n + (sd > 0 ? ' صاعد' : ' هابط') + ' مكتمل: السعر عند منطقة D (' + best.D.toFixed(dp2) + ') بعد حركة XA بحجم ' + (XA / a).toFixed(1) + ' ATR' };
    })();
    T('تحليل هارمونيك (Gartley/Bat/Butterfly/Crab)', 'الهارمونك', 3, hmn.v, hmn.t, true);

    // ===== التحليل الموجي (Elliott Wave): عدّ آلي بقواعد إليوت الأساسية على نقاط الزجزاج =====
    // القواعد: الموجة 2 ما تتجاوز بداية الموجة 1، والموجة 3 مو أقصر الموجات الدافعة (1 و3 و5)، والموجة 4 ما تدخل منطقة الموجة 1. كل موجة لازم تكون 1.5 ATR على الأقل ولأقل من 40 شمعة من آخر نقطة.
    // يصوّت بثلاث حالات: الموجة 3 جارية (كسر قمة/قاع الموجة 1 بعد تصحيح 24-89%)، أو الموجة 5 جارية بعد اكتمال 4 موجات، أو اكتمال 5 موجات وكسر قاع/قمة الموجة 4 (تصحيح عكس الاتجاه). غير هذا يمتنع.
    // تنبيه: عدّ إليوت فيه اجتهاد، وهذا عدّ آلي بقواعد صارمة وليس تحليل مؤكد.
    const wvn = (() => {
      const none = { v: 0, t: 'لا عدّ موجي واضح (لا موجة 3 أو 5 جارية، ولا 5 موجات مكتملة)' };
      if (zz.length < 3) return none;
      const imp = sd => { const Z = zz.map(z => ({ i: z.i, t: z.t * sd, q: z.p * sd })), m = Z.length, pq = px * sd, wn = sd > 0 ? 'صاعدة' : 'هابطة';
        if (m >= 6 && Z[m - 6].t === -1) { const [s0, s1, s2, s3, s4, s5] = Z.slice(-6), w1 = s1.q - s0.q, w3 = s3.q - s2.q, w5 = s5.q - s4.q;
          if (w1 >= 1.5 * a && s2.q > s0.q && s3.q > s1.q && s4.q > s1.q && w3 > 0 && w5 > 0 && w3 >= Math.min(w1, w5) && n - s5.i <= 40 && pq < s4.q) return { v: -sd, t: 'اكتملت 5 موجات ' + wn + ' وانكسر قاع الموجة 4: بداية تصحيح (A-B-C) عكس الاتجاه' }; }
        if (m >= 5 && Z[m - 5].t === -1) { const [s0, s1, s2, s3, s4] = Z.slice(-5), w1 = s1.q - s0.q, w3 = s3.q - s2.q;
          if (w1 >= 1.5 * a && s2.q > s0.q && s3.q > s1.q && s4.q > s1.q && w3 >= w1 && n - s4.i <= 40 && pq > s4.q + .3 * a && pq - s4.q < w1) return { v: sd, t: 'الموجة 5 ' + wn + ' جارية بعد اكتمال 4 موجات (الموجة 3 تساوي ' + (w3 / w1).toFixed(1) + '× الأولى)' }; }
        if (m >= 3 && Z[m - 3].t === -1) { const [s0, s1, s2] = Z.slice(-3), w1 = s1.q - s0.q, r2 = (s1.q - s2.q) / (w1 || 1);
          if (w1 >= 1.5 * a && s2.q > s0.q && r2 >= .236 && r2 <= .886 && n - s2.i <= 40 && pq > s1.q && pq < s1.q + 2.618 * w1) return { v: sd, t: 'الموجة 3 ' + wn + ' جارية: كسر قمة الموجة 1 بعد تصحيح ' + Math.round(r2 * 100) + '%' }; }
        return null; };
      const bu = imp(1), be = imp(-1);
      if (bu && be) return { v: 0, t: 'عدّ موجي متعارض (صاعد وهابط)' };
      return bu || be || none; })();
    T('التحليل الموجي (Elliott)', 'الموجات', 3, wvn.v, wvn.t, true);

    // ===== أدوات التدفق والتحليل الإحصائي (10 أدوات) =====
    // ملاحظة صريحة: ما فيه حجم حقيقي للذهب والفوركس من مصدر البيانات (Twelve Data). فأدوات الحجم والتدفق (VWAP ودلتا الحجم واختلال التدفق وCVD) تستعمل مدى الشمعة بديلاً عن الحجم، وتنكتب "تقريبي" بالاسم.
    // وإذا توفر حجم حقيقي بالبيانات تستعمله تلقائياً. الإحصائيات (الجلسات والاحتمالي) تحتاج التاريخ (ctx.deep)، والارتباطات تحتاج أزواج مرتبطة (ctx.peers). إذا ما توفرت هذي البيانات تمتنع الأداة (صفر) وما تدخل بالنسبة.
    const hasVol = v.slice(-50).some(x => +x.volume > 0), vol = v.map((x, i) => hasVol && +x.volume > 0 ? +x.volume : (h[i] - l[i]) || 1e-9), apx = hasVol ? '' : ' تقريبي';
    const dl = i => { const r2 = h[i] - l[i]; return r2 > 0 ? vol[i] * ((c[i] - l[i]) - (h[i] - c[i])) / r2 : 0; }; // دلتا الشمعة: وين أغلقت داخل مداها مضروبة بالحجم
    const parseT = s => Date.parse(String(s || '').replace(' ', 'T') + 'Z');
    const wl = (p, nn) => { const z = 1.28, z2 = z * z, ct = (p + z2 / (2 * nn)) / (1 + z2 / nn), hf = z * Math.sqrt(p * (1 - p) / nn + z2 / (4 * nn * nn)) / (1 + z2 / nn); return ct - hf; }; // الحد الأدنى الإحصائي (Wilson) بثقة 90%

    // 1) VWAP: متوسط السعر المرجح بالحجم من بداية اليوم (UTC)، وإذا الفريم كبير أو اليوم بدأ للتو يستخدم آخر 50 شمعة.
    // فوق VWAP وميله صاعد = شراء، تحته وميله هابط = بيع. وارتداد من VWAP مع الاتجاه = نقطة دخول.
    const vw = (() => {
      const tfm = parseT(v[n].datetime) - parseT(v[n - 1].datetime); let i0 = Math.max(0, n - 49), anch = 'آخر 50 شمعة';
      if (tfm >= 60000 && tfm <= 3600000) { const Tz = Math.floor(now / tfm) * tfm, day0 = Math.floor(now / 864e5) * 864e5;
        for (let i = 0; i <= n; i++) if (Tz - (n - i) * tfm >= day0) { if (n - i >= 12) { i0 = i; anch = 'بداية اليوم (UTC)'; } break; } }
      const vwAt = k => { let pv = 0, vs = 0; for (let i = i0; i <= k; i++) { pv += (h[i] + l[i] + c[i]) / 3 * vol[i]; vs += vol[i]; } return vs ? pv / vs : c[k]; };
      const V = vwAt(n), sl = V - vwAt(n - 5), dist = px - V, tag = 'VWAP ' + V.toFixed(dp2) + ' (' + anch + ')';
      const bu = Math.min(l[n], l[n - 1], l[n - 2]) <= V + .2 * a && dist > .1 * a && sl >= 0, be = Math.max(h[n], h[n - 1], h[n - 2]) >= V - .2 * a && dist < -.1 * a && sl <= 0;
      if (bu) return { v: 1, t: 'ارتداد صاعد من ' + tag, ev: true };
      if (be) return { v: -1, t: 'ارتداد هابط من ' + tag, ev: true };
      if (dist > .3 * a && sl >= 0) return { v: 1, t: 'السعر فوق ' + tag + ' وميله صاعد', ev: false };
      if (dist < -.3 * a && sl <= 0) return { v: -1, t: 'السعر تحت ' + tag + ' وميله هابط', ev: false };
      return { v: 0, t: 'السعر قرب ' + tag + ' أو عكس ميله', ev: false }; })();
    T('VWAP' + apx, 'الحجم والتدفق', 3, vw.v, vw.t, vw.ev);

    // 2) دلتا الحجم: صافي ضغط الشراء والبيع بآخر 3 شموع (من -1 إلى +1). فوق 0.4 = ضغط شراء قوي، تحت -0.4 = ضغط بيع قوي.
    const d3 = (() => { let s2 = 0, vs = 0; for (let i = n - 2; i <= n; i++) { s2 += dl(i); vs += vol[i]; } return vs ? s2 / vs : 0; })(), vD = d3 > .4 ? 1 : d3 < -.4 ? -1 : 0;
    T('دلتا الحجم' + apx, 'الحجم والتدفق', 2, vD, 'دلتا آخر 3 شموع ' + (d3 >= 0 ? '+' : '') + d3.toFixed(2) + W(vD, ': ضغط شراء قوي', ': ضغط بيع قوي', ': متوازن'));

    // 3) اختلال تدفق الأوامر: بآخر 20 شمعة نعدّ الشموع اللي أغلقت قرب قمتها (أعلى 25% من مداها) مقابل قرب قاعها (أدنى 25%). فرق 35% أو أكثر = اختلال.
    const ofi = (() => { let nt = 0, nb = 0; for (let i = n - 19; i <= n; i++) { const r2 = h[i] - l[i]; if (r2 <= 0) continue; const ps = (c[i] - l[i]) / r2; if (ps >= .75) nt++; else if (ps <= .25) nb++; } return { nt, nb, x: nt + nb >= 4 ? (nt - nb) / (nt + nb) : 0 }; })(), vO = ofi.x >= .35 ? 1 : ofi.x <= -.35 ? -1 : 0;
    T('اختلال تدفق الأوامر' + apx, 'الحجم والتدفق', 2, vO, 'آخر 20 شمعة: ' + ofi.nt + ' إغلاق قرب القمة مقابل ' + ofi.nb + ' قرب القاع' + W(vO, ': اختلال شرائي', ': اختلال بيعي', ': متوازن'));

    // 4) CVD (دلتا الحجم التراكمية) على آخر 60 شمعة. تباعد: السعر عند قمة/قاع جديد والـ CVD ما كسر قمته/قاعه = ضعف الحركة (انعكاس). وإلا ميل CVD بآخر 10 شموع.
    const cvd = (() => { const L = 60, cv = []; let s2 = 0; for (let i = n - L + 1; i <= n; i++) { s2 += dl(i); cv.push(s2); }
      const last = cv.length - 1, hi20 = Math.max(...cv.slice(last - 19, last)), lo20 = Math.min(...cv.slice(last - 19, last)); let tot = 0; for (let i = n - 19; i <= n; i++) tot += Math.abs(dl(i));
      if (px >= hh && cv[last] < hi20 - .1 * tot) return { v: -1, t: 'تباعد هابط: السعر عند قمة جديدة والـ CVD ما كسر قمته', ev: true };
      if (px <= ll && cv[last] > lo20 + .1 * tot) return { v: 1, t: 'تباعد صاعد: السعر عند قاع جديد والـ CVD ما كسر قاعه', ev: true };
      let vs10 = 0; for (let i = n - 9; i <= n; i++) vs10 += vol[i]; const k10 = vs10 ? (cv[last] - cv[last - 10]) / vs10 : 0;
      return { v: k10 > .15 ? 1 : k10 < -.15 ? -1 : 0, t: 'ميل CVD بآخر 10 شموع ' + (k10 >= 0 ? '+' : '') + k10.toFixed(2), ev: false }; })();
    T('دلتا الحجم التراكمية (CVD)' + apx, 'الحجم والتدفق', 3, cvd.v, cvd.t, cvd.ev);

    // 5) خريطة السيولة: نقاط التحول (قمم وقيعان) بآخر 200 شمعة. المستوى اللي تتجمع حوله 3 نقاط تحول أو أكثر (ضمن نصف ATR) = منطقة سيولة كثيفة. السعر ينجذب لأقرب منطقة كثيفة (حتى 6 ATR) إذا كانت أقرب بوضوح (1.5 مرة) من المعاكسة.
    const lmp = (() => { const pv = [...P.ph.filter(i => i >= n - 200).map(i => h[i]), ...P.pl.filter(i => i >= n - 200).map(i => l[i])];
      if (pv.length < 6) return { v: 0, t: 'نقاط التحول قليلة لرسم خريطة السيولة' };
      let upC = null, dnC = null;
      for (const lv of pv) { const cn = pv.filter(x => Math.abs(x - lv) <= .5 * a).length; if (cn < 3) continue; const ds = lv - px;
        if (ds > .3 * a && ds <= 6 * a && (!upC || ds < upC.d)) upC = { lv, d: ds, cn }; if (ds < -.3 * a && ds >= -6 * a && (!dnC || -ds < dnC.d)) dnC = { lv, d: -ds, cn }; }
      if (upC && (!dnC || dnC.d > upC.d * 1.5)) return { v: 1, t: 'منطقة سيولة كثيفة (' + upC.cn + ' نقاط تحول) عند ' + upC.lv.toFixed(dp2) + ' فوق السعر بـ ' + (upC.d / a).toFixed(1) + ' ATR (تجذبه للأعلى)' };
      if (dnC && (!upC || upC.d > dnC.d * 1.5)) return { v: -1, t: 'منطقة سيولة كثيفة (' + dnC.cn + ' نقاط تحول) عند ' + dnC.lv.toFixed(dp2) + ' تحت السعر بـ ' + (dnC.d / a).toFixed(1) + ' ATR (تجذبه للأسفل)' };
      return { v: 0, t: upC || dnC ? 'مناطق سيولة قريبة من الجهتين بنفس المسافة تقريباً' : 'لا منطقة سيولة كثيفة قريبة' }; })();
    T('خريطة السيولة', 'ICT/SMC', 3, lmp.v, lmp.t, false);

    // 6) كشف حالة السوق: ترندي (ADX 25 أو أكثر وكفاءة حركة 0.35 أو أكثر) فنتبع اتجاه آخر 20 شمعة. عرضي (ADX أقل من 20 وكفاءة أقل من 0.25) فنرتد من أطراف النطاق (أدنى/أعلى 20% من آخر 50 شمعة). غير هذا انتقالي (صفر).
    const rg6 = (() => { const axR = adxLast(h, l, c); let pth = 0; for (let i = n - 19; i <= n; i++) pth += Math.abs(c[i] - c[i - 1]);
      const er = pth ? Math.abs(c[n] - c[n - 20]) / pth : 0, dr = c[n] > c[n - 20] ? 1 : -1, ps = H50 > L50 ? (px - L50) / (H50 - L50) : .5;
      if (axR >= 25 && er >= .35) return { v: dr, t: 'سوق ترندي (ADX ' + axR.toFixed(0) + '، كفاءة الحركة ' + er.toFixed(2) + ') باتجاه ' + (dr > 0 ? 'صاعد' : 'هابط'), ev: false };
      if (axR < 20 && er < .25) { if (ps < .2) return { v: 1, t: 'سوق عرضي والسعر قرب قاع النطاق (ارتداد)', ev: true }; if (ps > .8) return { v: -1, t: 'سوق عرضي والسعر قرب قمة النطاق (ارتداد)', ev: true }; return { v: 0, t: 'سوق عرضي والسعر وسط النطاق', ev: false }; }
      return { v: 0, t: 'حالة انتقالية (ADX ' + axR.toFixed(0) + '، كفاءة ' + er.toFixed(2) + ')', ev: false }; })();
    T('كشف حالة السوق (Regime)', 'حالة السوق', 3, rg6.v, rg6.t, rg6.ev);

    // 7) أنظمة التقلب: مرتبة ATR الحالي بين آخر 200 قيمة. منخفض (أقل من 25%) مع اختراق = اتجاه الاختراق. مرتفع (أكثر من 80%) والسعر ممتد أكثر من 2.5 ATR عن EMA20 = ارتداد عكس التمدد.
    const vr7 = (() => { const arr = AT.slice(-200).filter(x => x != null), pct = arr.filter(x => x <= a).length / (arr.length || 1), exT = (px - e20) / a;
      const lab = pct <= .25 ? 'منخفض (انضغاط)' : pct >= .8 ? 'مرتفع' : 'عادي', base = 'التقلب ' + lab + ' (مرتبته ' + Math.round(pct * 100) + '%)';
      if (pct <= .25) { if (px > hh) return { v: 1, t: base + ': اختراق صاعد من انضغاط', ev: true }; if (px < ll) return { v: -1, t: base + ': كسر هابط من انضغاط', ev: true }; }
      if (pct >= .8) { if (exT > 2.5) return { v: -1, t: base + ': السعر ممتد ' + exT.toFixed(1) + ' ATR فوق EMA20 (احتمال ارتداد)', ev: true }; if (exT < -2.5) return { v: 1, t: base + ': السعر ممتد ' + Math.abs(exT).toFixed(1) + ' ATR تحت EMA20 (احتمال ارتداد)', ev: true }; }
      return { v: 0, t: base + ': لا إشارة تقلب واضحة', ev: false }; })();
    T('أنظمة التقلب (Volatility Regimes)', 'حالة السوق', 2, vr7.v, vr7.t, vr7.ev);

    // 8) التحليل الإحصائي للجلسات: من التاريخ (حتى 5,000 شمعة) نحسب كم مرة صعدت الجلسة الحالية (من افتتاحها لإغلاقها) بالأيام السابقة. يصوّت فقط إذا الميل حاسم إحصائياً (حد Wilson بثقة 90% فوق 50%) وبعينة 30 جلسة على الأقل.
    const ssn = (() => { const D = ctx.deep; if (!D || D.length < 300) return { v: 0, t: 'يحتاج التاريخ (5,000 شمعة) لإحصائيات الجلسات' };
      const m = D.length, curH = Math.floor((now % 864e5) / 36e5), mk = 's' + m + D[m - 1].datetime + Math.floor(now / 864e5) + '_' + (curH < 7 ? 0 : curH < 12 ? 1 : curH < 16 ? 2 : curH < 21 ? 3 : 4); if (MEMO.ssn && MEMO.ssn.k === mk) return MEMO.ssn.r;
      const tfm = parseT(D[m - 1].datetime) - parseT(D[m - 2].datetime), done = r => { MEMO.ssn = { k: mk, r }; return r; };
      if (!(tfm >= 60000 && tfm <= 3600000)) return done({ v: 0, t: 'إحصائيات الجلسات تشتغل لفريمات لحد H1' });
      const B = [0, 7, 12, 16, 21, 24], NM = ['آسيا', 'لندن', 'تداخل لندن ونيويورك', 'نيويورك', 'سيدني'], sesOf = hr => { for (let s2 = 0; s2 < 5; s2++) if (hr >= B[s2] && hr < B[s2 + 1]) return s2; return 0; };
      const curS = sesOf((now - Math.floor(now / 864e5) * 864e5) / 36e5), g = {};
      for (let i = 0; i < m; i++) { const t = parseT(D[i].datetime), dk = Math.floor(t / 864e5); if (sesOf((t - dk * 864e5) / 36e5) !== curS) continue; if (!g[dk]) g[dk] = { o: +D[i].open, c: +D[i].close, n: 0 }; g[dk].c = +D[i].close; g[dk].n++; }
      const need = Math.round(.7 * (B[curS + 1] - B[curS]) * 36e5 / tfm), today = Math.floor(now / 864e5), rr = Object.keys(g).filter(k => g[k].n >= need && +k !== today).map(k => (g[k].c - g[k].o) / g[k].o * 100), N = rr.length;
      if (N < 30) return done({ v: 0, t: NM[curS] + ': عينة قليلة (' + N + ' جلسة، المطلوب 30)' });
      const pu = rr.filter(x => x > 0).length / N, avg = rr.reduce((s2, x) => s2 + x, 0) / N, vv = wl(pu, N) > .5 ? 1 : wl(1 - pu, N) > .5 ? -1 : 0;
      return done({ v: vv, t: NM[curS] + ': صعدت ' + Math.round(pu * 100) + '% من آخر ' + N + ' جلسة (متوسط ' + (avg >= 0 ? '+' : '') + avg.toFixed(2) + '%)' + (vv ? '' : ' - الفرق غير حاسم إحصائياً') }); })();
    T('التحليل الإحصائي للجلسات', 'التحليل الإحصائي', 2, ssn.v, ssn.t, false);

    // 9) التحليل الاحتمالي الإحصائي: نصنّف الحالة الحالية بـ 18 حالة (حركة آخر 3 شموع × موقع السعر بنطاق 50 شمعة × اتجاه EMA20/EMA50)، ونعدّ كم مرة صعد السعر أو هبط بعد 10 شموع كلما ظهرت نفس الحالة بالتاريخ. يصوّت إذا الحد الأدنى الإحصائي (Wilson 90%) فوق 55% بعينة 60 حالة على الأقل.
    const prb = (() => { const D = ctx.deep; if (!D || D.length < 600) return { v: 0, t: 'يحتاج التاريخ (5,000 شمعة) للتحليل الاحتمالي' };
      const m = D.length, mk = 'p' + m + D[m - 1].datetime; if (MEMO.prb && MEMO.prb.k === mk) return MEMO.prb.r;
      const cc = D.map(x => +x.close), hD = D.map(x => +x.high), lD = D.map(x => +x.low), AD = atrS(hD, lD, cc), E1 = ema(cc, 20), E2 = ema(cc, 50), done = r => { MEMO.prb = { k: mk, r }; return r; };
      const st = i => { const A = AD[i]; if (!A) return -1; const r3 = (cc[i] - cc[i - 3]) / A, b1 = r3 > .5 ? 2 : r3 < -.5 ? 0 : 1; let mxx = -Infinity, mnn = Infinity; for (let j = i - 49; j <= i; j++) { if (hD[j] > mxx) mxx = hD[j]; if (lD[j] < mnn) mnn = lD[j]; }
        const ps = mxx > mnn ? (cc[i] - mnn) / (mxx - mnn) : .5, b2 = ps > .66 ? 2 : ps < .33 ? 0 : 1; return b1 * 6 + b2 * 2 + (E1[i] > E2[i] ? 1 : 0); };
      const cs2 = st(m - 1); if (cs2 < 0) return done({ v: 0, t: 'الحالة الحالية غير قابلة للقياس' });
      let u2 = 0, d2 = 0; for (let i = 60; i < m - 11; i++) { if (st(i) !== cs2) continue; if (cc[i + 10] > cc[i]) u2++; else if (cc[i + 10] < cc[i]) d2++; }
      const N = u2 + d2; if (N < 60) return done({ v: 0, t: 'الحالة الحالية ظهرت ' + N + ' مرة فقط (المطلوب 60)' });
      const pu = u2 / N, vv = wl(pu, N) > .55 ? 1 : wl(1 - pu, N) > .55 ? -1 : 0;
      return done({ v: vv, t: 'الحالة الحالية ظهرت ' + N + ' مرة: بعد 10 شموع صعد السعر ' + Math.round(pu * 100) + '% وهبط ' + Math.round((1 - pu) * 100) + '%' + (vv ? '' : ' - الفرق غير حاسم إحصائياً') }); })();
    T('التحليل الاحتمالي الإحصائي', 'التحليل الإحصائي', 3, prb.v, prb.t, false);

    // 10) تحليل الارتباطات السوقية: ارتباط عوائد آخر 60 شمعة بين الزوج وأزواج مرتبطة (ctx.peers). إذا الارتباط قوي (0.4 أو أكثر بالقيمة المطلقة) وزوج مرتبط تحرك بقوة (أكثر من 1 ATR بآخر 10 شموع) بينما زوجنا متأخر عنه (أقل من نصف حركته المتوقعة)، نتوقع اللحاق باتجاه الارتباط.
    const cor = (() => { const PE = ctx.peers; if (!PE || !PE.length) return { v: 0, t: 'يحتاج بيانات أزواج مرتبطة (جاري التحميل)' };
      let sc3 = 0; const tx = [], m10 = (px - c[n - 10]) / a;
      for (const pe of PE) { const pv = pe.v; if (!pv || pv.length < 40) continue;
        const pc = pv.map(x => +x.close), pA = atrS(pv.map(x => +x.high), pv.map(x => +x.low), pc), pi = {}; pv.forEach((x, i) => { pi[x.datetime] = i; });
        const xs = [], ys = [];
        for (let i = n - 59; i <= n; i++) { if (i < 1) continue; const k = pi[v[i].datetime], k0 = pi[v[i - 1].datetime]; if (k === undefined || k0 === undefined) continue; xs.push(c[i] - c[i - 1]); ys.push(pc[k] - pc[k0]); }
        if (xs.length < 30) continue;
        const mxm = xs.reduce((s2, x) => s2 + x, 0) / xs.length, mym = ys.reduce((s2, x) => s2 + x, 0) / ys.length; let sxy = 0, sxx = 0, syy = 0;
        for (let i = 0; i < xs.length; i++) { sxy += (xs[i] - mxm) * (ys[i] - mym); sxx += (xs[i] - mxm) * (xs[i] - mxm); syy += (ys[i] - mym) * (ys[i] - mym); }
        const rr = sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0, kl = pi[v[n].datetime], k10 = pi[v[n - 10].datetime];
        if (kl === undefined || k10 === undefined || Math.abs(rr) < .4 || !pA[kl]) continue;
        const pm = (pc[kl] - pc[k10]) / pA[kl];
        if (Math.abs(pm) >= 1 && Math.abs(m10) < .5 * Math.abs(pm)) { sc3 += Math.sign(rr) * Math.sign(pm); tx.push(pe.n + ' (ارتباط ' + (rr >= 0 ? '+' : '') + rr.toFixed(2) + ') ' + (pm > 0 ? 'صاعد' : 'هابط') + ' وزوجك متأخر عنه'); } }
      if (!tx.length) return { v: 0, t: 'لا فجوة بين الزوج والأزواج المرتبطة (أو الارتباط أقل من 0.4)' };
      return { v: sc3 > 0 ? 1 : sc3 < 0 ? -1 : 0, t: tx.join(' | ') }; })();
    T('تحليل الارتباطات السوقية', 'ارتباطات السوق', 3, cor.v, cor.t, false);

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

    // ===== 10 أدوات جديدة: نقاط الدخول وتقليل الانعكاس (ما تكرر أدوات موجودة) =====
    // كل أداة تصوّت فقط لما يكون عندها رأي واضح وإلا صفر. الأدوات اللي تقيس خطر الانعكاس تصوّت ضد الاتجاه لما يكون الدخول متأخر أو بدون مساحة، فتنزل النسبة لحالها بدون أي شرط إضافي.
    { // 1) تأكيد إغلاق الشمعة: شمعة زخم تغلق قرب قمتها (أو قاعها) بمدى 0.6 ATR على الأقل وتكسر إغلاق اللي قبلها
      const rg = h[n] - l[n]; let cfV = 0;
      if (rg >= .6 * a) { if (c[n] > o[n] && (c[n] - l[n]) / rg >= .7 && c[n] > c[n - 1]) cfV = 1; else if (c[n] < o[n] && (h[n] - c[n]) / rg >= .7 && c[n] < c[n - 1]) cfV = -1; }
      T('تأكيد إغلاق الشمعة', 'نقاط الدخول', 3, cfV, W(cfV, 'شمعة زخم صاعدة تغلق قرب قمتها (تأكيد دخول)', 'شمعة زخم هابطة تغلق قرب قاعها (تأكيد دخول)', 'لا شمعة زخم تؤكد الدخول'), true); }
    { // 2) رفض عكس الاتجاه: ذيل كبير ضد الترند بآخر شمعتين = خطر انعكاس (يصوّت ضد الترند)، وبدونه والشمعة مع الاتجاه = يصوّت مع الترند
      let adV = 0, adT = 'لا ترند واضح (EMA20/EMA50)';
      if (d) { let adv = false; for (let i = n - 1; i <= n; i++) { const rg = h[i] - l[i]; if (rg >= .5 * a) { const w = d > 0 ? h[i] - Math.max(o[i], c[i]) : Math.min(o[i], c[i]) - l[i]; if (w >= .5 * rg) adv = true; } }
        if (adv) { adV = -d; adT = 'ذيل رفض ضد الترند بآخر شمعتين (خطر انعكاس)'; } else if (d > 0 ? c[n] > o[n] : c[n] < o[n]) { adV = d; adT = 'لا رفض ضد الترند والشمعة مع الاتجاه'; } else adT = 'لا رفض ضد الترند لكن الشمعة عكس الاتجاه'; }
      T('رفض عكس الاتجاه', 'نقاط الدخول', 3, adV, adT, false); }
    { // 3) المساحة أمام الصفقة: المسافة لأقرب قمة (للشراء) أو قاع (للبيع) بآخر 120 شمعة. أقل من 1 ATR = جدار قريب (ضد الصفقة)، 2 ATR أو أكثر = مساحة (مع الصفقة)
      let rmV = 0, rmT = 'لا ترند واضح (EMA20/EMA50)';
      if (d) { const lv = d > 0 ? P.ph.filter(i => i >= n - 120 && h[i] > px).map(i => h[i]) : P.pl.filter(i => i >= n - 120 && l[i] < px).map(i => l[i]);
        if (!lv.length) { rmV = d; rmT = 'مساحة مفتوحة أمام الصفقة (ما فيه قمة أو قاع قريب)'; }
        else { const ds = (d > 0 ? Math.min(...lv) - px : px - Math.max(...lv)) / a;
          if (ds < 1) { rmV = -d; rmT = 'جدار قريب أمام الصفقة (' + ds.toFixed(1) + ' ATR فقط): خطر انعكاس'; } else if (ds >= 2) { rmV = d; rmT = 'مساحة ' + ds.toFixed(1) + ' ATR قبل أقرب جدار'; } else rmT = 'مساحة متوسطة (' + ds.toFixed(1) + ' ATR) قبل أقرب جدار'; } }
      T('المساحة أمام الصفقة', 'نقاط الدخول', 3, rmV, rmT, false); }
    { // 4) جودة الاختراق: اختراق قمة/قاع آخر 20 شمعة بإغلاق قوي (0.15 ATR فوق المستوى وجسم نصف المدى) = حقيقي. وذيل كبير (نصف المدى) = اختراق كاذب يصوّت عكسه
      const rg = h[n] - l[n] || a; let bqV = 0, bqT = 'لا اختراق لقمة أو قاع آخر 20 شمعة';
      if (px > hh) { const fk = h[n] - Math.max(o[n], c[n]) >= .5 * rg, real = c[n] - hh >= .15 * a && c[n] - o[n] >= .5 * rg && (c[n] - l[n]) / rg >= .6;
        if (fk) { bqV = -1; bqT = 'اختراق كاذب: ذيل علوي كبير فوق قمة 20 شمعة (رفض)'; } else if (real) { bqV = 1; bqT = 'اختراق حقيقي: إغلاق قوي فوق القمة بجسم كبير'; } else bqT = 'اختراق ضعيف بدون تأكيد إغلاق'; }
      else if (px < ll) { const fk = Math.min(o[n], c[n]) - l[n] >= .5 * rg, real = ll - c[n] >= .15 * a && o[n] - c[n] >= .5 * rg && (h[n] - c[n]) / rg >= .6;
        if (fk) { bqV = 1; bqT = 'كسر كاذب: ذيل سفلي كبير تحت قاع 20 شمعة (رفض)'; } else if (real) { bqV = -1; bqT = 'كسر حقيقي: إغلاق قوي تحت القاع بجسم كبير'; } else bqT = 'كسر ضعيف بدون تأكيد إغلاق'; }
      T('جودة الاختراق', 'نقاط الدخول', 3, bqV, bqT, bqV !== 0); }
    { // 5) إرهاق الحركة: ثلاث شموع متتالية بنفس الاتجاه بحركة 3 ATR أو أكثر، أو شمعة وحدة مدى 2 ATR وتغلق عند أقصى نهايتها = الدخول مع الحركة الحين متأخر (يصوّت عكسها)
      const rg = h[n] - l[n], up3 = c[n] > o[n] && c[n - 1] > o[n - 1] && c[n - 2] > o[n - 2], dn3 = c[n] < o[n] && c[n - 1] < o[n - 1] && c[n - 2] < o[n - 2], mv = c[n] - o[n - 2]; let exV = 0, exT = 'لا إرهاق في الحركة';
      if ((up3 && mv >= 3 * a) || (c[n] > o[n] && rg >= 2 * a && (c[n] - l[n]) / rg >= .85)) { exV = -1; exT = 'إرهاق صعود: حركة مفرطة بدون تصحيح (الشراء الآن متأخر)'; }
      else if ((dn3 && -mv >= 3 * a) || (c[n] < o[n] && rg >= 2 * a && (h[n] - c[n]) / rg >= .85)) { exV = 1; exT = 'إرهاق هبوط: حركة مفرطة بدون تصحيح (البيع الآن متأخر)'; }
      T('إرهاق الحركة', 'نقاط الدخول', 3, exV, exT, false); }
    { // 6) الأرقام المستديرة (كل 100 نقطة سعرية: 10$ للذهب، 100 بيب للأزواج): كسر الرقم والثبات فوقه/تحته بآخر 5 شموع = دخول مؤكد
      const R = 100 * pr.pip, lvD = Math.floor(px / R) * R, lvU = Math.ceil(px / R) * R, rcL = mn(l, n - 5, n - 1), rcH = mx(h, n - 5, n - 1); let rnV = 0, rnT = 'السعر بعيد عن الأرقام المستديرة';
      if (px - lvD <= .5 * a && rcL < lvD && c[n] > lvD) { rnV = 1; rnT = 'اختراق الرقم المستدير ' + lvD.toFixed(dp2) + ' للأعلى وثبات فوقه'; }
      else if (lvU - px <= .5 * a && rcH > lvU && c[n] < lvU) { rnV = -1; rnT = 'كسر الرقم المستدير ' + lvU.toFixed(dp2) + ' للأسفل وثبات تحته'; }
      T('الأرقام المستديرة', 'نقاط الدخول', 2, rnV, rnT, rnV !== 0); }
    { // 7) عمر الترند: كم شمعة مرت من بداية ترند EMA20/EMA50 الحالي. من 8 إلى 120 = ناضج وغير متأخر (مع الترند). أقل من 8 = جديد وغير مؤكد، وأكثر من 120 = قديم (بدون رأي)
      let taV = 0, taT = 'لا ترند واضح (EMA20/EMA50)';
      if (d) { let age = 0; for (let i = n; i >= 0; i--) { if ((E20[i] > E50[i]) === (d > 0)) age++; else break; }
        if (age >= 8 && age <= 120) { taV = d; taT = 'عمر الترند ' + age + ' شمعة (ناضج وغير متأخر)'; } else taT = age < 8 ? 'ترند جديد (' + age + ' شموع) وغير مؤكد' : 'ترند قديم (' + age + ' شمعة) وقد يكون قرب نهايته'; }
      T('عمر الترند', 'نقاط الدخول', 2, taV, taT, false); }
    { // 8) اتساع المتوسطات: المسافة بين EMA20 وEMA50 بوحدات ATR مقارنة بقبل 10 شموع. تتباعد = الترند يقوى (مع الترند)، تتقارب = يضعف (ضد الترند، خطر انعكاس)
      let spV = 0, spT = 'لا ترند واضح (EMA20/EMA50)';
      if (d) { const sp = (E20[n] - E50[n]) / a * d, sp0 = (E20[n - 10] - E50[n - 10]) / a * d;
        if (sp > sp0 + .1) { spV = d; spT = 'المتوسطات تتباعد (الترند يقوى)'; } else if (sp < sp0 - .1) { spV = -d; spT = 'المتوسطات تتقارب (الترند يضعف: خطر انعكاس)'; } else spT = 'المتوسطات ثابتة'; }
      T('اتساع المتوسطات', 'نقاط الدخول', 2, spV, spT, false); }
    { // 9) بيفوت اليوم السابق (P وR1/R2 وS1/S2 من قمة وقاع وإغلاق أمس بتوقيت UTC): ارتداد من S أو R = دخول، قبول بإغلاقين خلف R1/S1 أو موقع السعر من P = انحياز
      const dk2 = x => String(x.datetime || '').slice(0, 10), days = v.map(dk2), tfmP = (parseT(v[n].datetime) - parseT(v[n - 1].datetime)) / 6e4; let pvV = 0, pvT = 'ما فيه يوم سابق كامل لحساب البيفوت', pvEv = false;
      if (days[n] && tfmP >= 1 && tfmP <= 60) { let k = n; while (k >= 0 && days[k] === days[n]) k--;
        if (k >= 0) { const pd = days[k]; let pH = -Infinity, pL = Infinity, e2 = k, cn = 0; const pC = c[k]; while (e2 >= 0 && days[e2] === pd) { if (h[e2] > pH) pH = h[e2]; if (l[e2] < pL) pL = l[e2]; e2--; cn++; }
          if (cn >= .6 * 1440 / tfmP) { const PP = (pH + pL + pC) / 3, R1 = 2 * PP - pL, S1 = 2 * PP - pH, R2 = PP + (pH - pL), S2 = PP - (pH - pL), nr = x => Math.abs(px - x) <= .3 * a, tg = 'بيفوت أمس ' + PP.toFixed(dp2);
            if ((nr(S1) || nr(S2)) && c[n] > o[n]) { pvV = 1; pvEv = true; pvT = 'ارتداد صاعد من دعم ' + (nr(S1) ? 'S1 ' + S1.toFixed(dp2) : 'S2 ' + S2.toFixed(dp2)) + ' (' + tg + ')'; }
            else if ((nr(R1) || nr(R2)) && c[n] < o[n]) { pvV = -1; pvEv = true; pvT = 'ارتداد هابط من مقاومة ' + (nr(R1) ? 'R1 ' + R1.toFixed(dp2) : 'R2 ' + R2.toFixed(dp2)) + ' (' + tg + ')'; }
            else if (c[n] > R1 && c[n - 1] > R1) { pvV = 1; pvT = 'قبول سعري فوق R1 ' + R1.toFixed(dp2) + ' (' + tg + ')'; }
            else if (c[n] < S1 && c[n - 1] < S1) { pvV = -1; pvT = 'قبول سعري تحت S1 ' + S1.toFixed(dp2) + ' (' + tg + ')'; }
            else if (px > PP + .3 * a) { pvV = 1; pvT = 'السعر فوق ' + tg; } else if (px < PP - .3 * a) { pvV = -1; pvT = 'السعر تحت ' + tg; } else pvT = 'السعر قرب ' + tg; } } }
      T('بيفوت اليوم السابق', 'البيفوت', 3, pvV, pvT, pvEv); }
    { // 10) انقلاب Parabolic SAR (0.02 / 0.2): انقلاب بآخر 3 شموع = نقطة دخول جديدة باتجاه الانقلاب
      let sUp, sar, ep, af = .02, flipAt = -1; const st0 = Math.max(2, n - 150);
      sUp = c[st0] >= c[st0 - 1]; sar = sUp ? mn(l, st0 - 2, st0 - 1) : mx(h, st0 - 2, st0 - 1); ep = sUp ? h[st0] : l[st0];
      for (let i = st0 + 1; i <= n; i++) { sar = sar + af * (ep - sar);
        if (sUp) { sar = Math.min(sar, l[i - 1], l[i - 2]); if (l[i] < sar) { sUp = false; sar = ep; ep = l[i]; af = .02; flipAt = i; } else if (h[i] > ep) { ep = h[i]; af = Math.min(af + .02, .2); } }
        else { sar = Math.max(sar, h[i - 1], h[i - 2]); if (h[i] > sar) { sUp = true; sar = ep; ep = h[i]; af = .02; flipAt = i; } else if (l[i] < ep) { ep = l[i]; af = Math.min(af + .02, .2); } } }
      const sV = flipAt >= n - 2 ? (sUp ? 1 : -1) : 0;
      T('انقلاب Parabolic SAR', 'نقاط الدخول', 2, sV, W(sV, 'انقلاب SAR للأعلى بآخر 3 شموع (دخول جديد)', 'انقلاب SAR للأسفل بآخر 3 شموع (دخول جديد)', 'لا انقلاب SAR حديث'), true); }

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
    if ([vt('MACD'), vt('RSI')].filter(x => x === dir).length === 2) { gp += 1; gu.push('MACD وRSI متفقة'); }
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
