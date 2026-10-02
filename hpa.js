// Historical Pattern Analysis (HPA): دليل تاريخي مستقل عن المؤشرات والمدارس.
// يقارن الحالة الحالية بحالات مشابهة من آخر 10,000 شمعة، ويدرس ماذا حدث بعدها (هدف قبل وقف).
// منع Look-Ahead: الميزات تستخدم بيانات حتى الشمعة i فقط، والنتيجة تستخدم الشموع بعدها فقط، والاختبار
// الزمني (walk-forward) يتدرب على حالات انتهت نتيجتها قبل لحظة التنبؤ فقط.
(function (root) {
  'use strict';
  const H = 16;        // أفق النتيجة بالشموع
  const WARM = 60;     // شموع التسخين قبل أول حالة
  const MINN = 40;     // أقل عدد حالات مشابهة لإعطاء رأي
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  // الحد الأدنى لفاصل ويلسون للنسبة (نسبة نجاح موثوقة بدل النسبة الخام)
  const wil = (w, n, z) => { if (!n) return 0; const p = w / n, z2 = z * z; return (p + z2 / (2 * n) - z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n)) / (1 + z2 / n); };

  function atrArr(h, l, c, p = 14) {
    const n = c.length, out = new Array(n).fill(0); let a = 0;
    const tr = i => Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1]));
    for (let i = 1; i <= p; i++) a += tr(i);
    a /= p; out[p] = a;
    for (let i = p + 1; i < n; i++) { a = (a * (p - 1) + tr(i)) / p; out[i] = a; }
    return out;
  }

  // وصف الحالة بأربع خصائص سعرية خام (بدون أي مؤشر): حركة آخر 3 شموع، موقع الإغلاق بالشمعة،
  // موقع السعر بنطاق 50 شمعة، ونسبة التذبذب الحالي للمعتاد.
  function bins(h, l, c, A, i) {
    const a = A[i]; if (!(a > 0) || i < WARM) return null;
    const m3 = (c[i] - c[i - 3]) / a, f1 = m3 < -1.5 ? 0 : m3 < -.5 ? 1 : m3 <= .5 ? 2 : m3 <= 1.5 ? 3 : 4;
    const rg = h[i] - l[i], loc = rg > 0 ? (c[i] - l[i]) / rg : .5, f2 = loc < .33 ? 0 : loc < .67 ? 1 : 2;
    let hi = -Infinity, lo = Infinity, s10 = 0, s50 = 0;
    for (let k = i - 49; k <= i; k++) { if (h[k] > hi) hi = h[k]; if (l[k] < lo) lo = l[k]; const r = h[k] - l[k]; s50 += r; if (k > i - 10) s10 += r; }
    const pos = hi > lo ? (c[i] - lo) / (hi - lo) : .5, f3 = pos < .25 ? 0 : pos < .5 ? 1 : pos < .75 ? 2 : 3;
    const vr = s50 > 0 ? (s10 / 10) / (s50 / 50) : 1, f4 = vr < .8 ? 0 : vr < 1.25 ? 1 : 2;
    return [f1, f2, f3, f4];
  }

  // نتيجة الحالة بعد الشمعة i: هدف قبل وقف (متماثل بمسافة X) خلال H شمعة. إذا لمس الهدف والوقف بنفس الشمعة نعتبرها خسارة (تحفظ).
  function label(h, l, c, i, X, a) {
    const up = c[i] + X, dn = c[i] - X; let lo = 0, so = 0;
    for (let j = i + 1; j <= i + H && !(lo && so); j++) {
      const hu = h[j] >= up, hd = l[j] <= dn;
      if (!lo) { if (hd) lo = -1; else if (hu) lo = 1; }
      if (!so) { if (hu) so = -1; else if (hd) so = 1; }
    }
    return { lo, so, up: c[i + H] > c[i] ? 1 : 0, mv: (c[i + H] - c[i]) / a };
  }

  function prepare(cs, unit) {
    const n = cs.length, h = new Array(n), l = new Array(n), c = new Array(n);
    for (let i = 0; i < n; i++) { h[i] = +cs[i].high; l[i] = +cs[i].low; c[i] = +cs[i].close; }
    const A = atrArr(h, l, c), fk = new Array(n).fill(null), ck = new Array(n).fill(null), lab = new Array(n).fill(null);
    for (let i = WARM; i < n; i++) {
      const f = bins(h, l, c, A, i); if (!f) continue;
      fk[i] = f.join(','); ck[i] = f[0] + ',' + f[2];
      if (i + H < n) lab[i] = label(h, l, c, i, clamp(.9 * A[i] / unit, 700, 1500) * unit, A[i]);
    }
    return { n, fk, ck, lab };
  }

  // جدول الحالة: [عدد، صعود بعد H، مجموع الحركة بـ ATR، ربح شراء، خسارة شراء، ربح بيع، خسارة بيع]
  function add(T, key, s) {
    const a = T[key] || (T[key] = [0, 0, 0, 0, 0, 0, 0]);
    a[0]++; a[1] += s.up; a[2] += s.mv;
    if (s.lo === 1) a[3]++; else if (s.lo === -1) a[4]++;
    if (s.so === 1) a[5]++; else if (s.so === -1) a[6]++;
  }
  function addSample(TF, TC, P, i) { const s = P.lab[i]; if (!s || !P.fk[i]) return; add(TF, P.fk[i], s); add(TC, P.ck[i], s); }

  // قاعدة القرار (ثابتة مسبقاً ولا تُضبط على بيانات الاختبار): نسبة نجاح ≥ 58% وحدّها الأدنى (99% ثقة تقريباً) ≥ 50% وتتفوق على الاتجاه المعاكس.
  // التشدد مقصود: فيه عشرات الحالات تُفحص، فالثقة العالية تمنع اعتبار الصدفة نمطاً.
  function decide(a) {
    if (!a || a[0] < MINN) return null;
    const rl = a[3] + a[4], rs = a[5] + a[6], pL = rl ? a[3] / rl : 0, pS = rs ? a[5] / rs : 0;
    const wL = rl >= 25 ? wil(a[3], rl, 2.5) : 0, wS = rs >= 25 ? wil(a[5], rs, 2.5) : 0;
    let vote = 0;
    if (pL >= .58 && wL >= .5 && pL > pS + .05) vote = 1; else if (pS >= .58 && wS >= .5 && pS > pL + .05) vote = -1;
    return { vote, pL, pS, wL, wS, n: a[0], upShare: a[1] / a[0], avgMove: a[2] / a[0] };
  }
  function lookup(TF, TC, fk, ck) {
    let d = fk ? decide(TF[fk]) : null, level = 'fine';
    if (!d && ck) { d = decide(TC[ck]); level = 'coarse'; }
    if (d) d.level = level;
    return d;
  }

  // اختبار زمني (walk-forward): عند كل لحظة t نستخدم فقط حالات i ≤ t-H-1 (نتيجتها انتهت قبل t)،
  // ونقيّم بصفقات غير متداخلة (بعد كل صفقة ننتظر H+1 شمعة).
  function walk(P) {
    const last = P.n - 1 - H, t0 = Math.max(WARM + 500, Math.floor(P.n * .5));
    const TF = {}, TC = {}, trades = [], votes = {}; let ptr = WARM, next = t0;
    for (let t = t0; t <= last; t++) {
      while (ptr <= t - H - 1) { addSample(TF, TC, P, ptr); ptr++; }
      const d = lookup(TF, TC, P.fk[t], P.ck[t]), vote = d ? d.vote : 0;
      votes[t] = vote;
      if (vote && t >= next) { trades.push({ t, vote, r: vote > 0 ? P.lab[t].lo : P.lab[t].so }); next = t + H + 1; }
    }
    return { trades, votes, t0, last };
  }

  function validate(P) {
    const w = walk(P), res = w.trades.filter(x => x.r !== 0), nT = res.length, wins = res.filter(x => x.r === 1).length;
    const rate = a => a.length ? a.filter(x => x.r === 1).length / a.length : 0;
    const half = Math.floor(nT / 2), r1 = rate(res.slice(0, half)), r2 = rate(res.slice(half));
    // خط الأساس: نسبة نجاح الشراء/البيع العشوائي بنفس الفترة (عينات غير متداخلة)
    let lw = 0, ll = 0, sw = 0, sl = 0;
    for (let t = w.t0; t <= w.last; t += H + 1) { const s = P.lab[t]; if (!s) continue; if (s.lo === 1) lw++; else if (s.lo === -1) ll++; if (s.so === 1) sw++; else if (s.so === -1) sl++; }
    const bL = lw + ll ? lw / (lw + ll) : .5, bS = sw + sl ? sw / (sw + sl) : .5;
    const nL = res.filter(x => x.vote > 0).length, nS = nT - nL, base = nT ? (nL * bL + nS * bS) / nT : .5;
    const wr = nT ? wins / nT : 0, low = wil(wins, nT, 1.64), reasons = [];
    if (nT < 60) reasons.push('عدد الصفقات المختبرة ' + nT + ' (المطلوب 60 على الأقل)');
    if (wr < .54) reasons.push('نسبة النجاح ' + Math.round(wr * 100) + '% أقل من 54%');
    if (low < .5) reasons.push('الحد الأدنى بثقة 95% (' + Math.round(low * 100) + '%) لا يتجاوز 50%، يعني ممكن تكون صدفة');
    if (nT >= 60 && (r1 < .5 || r2 < .5)) reasons.push('النتيجة ما استقرت بين نصفي فترة الاختبار');
    if (wr < base + .02) reasons.push('ما تتفوق على الدخول العشوائي (' + Math.round(base * 100) + '%)');
    return { adopted: reasons.length === 0, trades: nT, wins, winRate: wr, wilsonLow: low, half1: r1, half2: r2, timeouts: w.trades.length - nT, baseline: base, testBars: w.last - w.t0 + 1, reasons };
  }

  // بناء النموذج من شموع قديمة -> جديدة (آخر 10,000 شمعة مكتملة). unit = حجم النقطة (pip/10).
  function build(cs, opts) {
    const P = prepare(cs, opts.unit), val = validate(P), TF = {}, TC = {};
    for (let i = WARM; i < P.n - H; i++) addSample(TF, TC, P, i);
    for (const T of [TF, TC]) for (const k in T) T[k][2] = +T[k][2].toFixed(1);
    return { v: 1, pair: opts.pair, tf: opts.tf, built: new Date().toISOString(), N: P.n, H, adopted: val.adopted, val, fine: TF, coarse: TC };
  }

  // التنبؤ الحالي: نستخدم آخر شمعة مكتملة (الأخيرة بالقائمة لسه تتشكل) حتى يتطابق مع طريقة التدريب
  function predict(model, v) {
    if (!model || !v || v.length < WARM + 5) return null;
    const n = v.length, h = new Array(n), l = new Array(n), c = new Array(n);
    for (let i = 0; i < n; i++) { h[i] = +v[i].high; l[i] = +v[i].low; c[i] = +v[i].close; }
    const A = atrArr(h, l, c), f = bins(h, l, c, A, n - 2);
    const d = f ? lookup(model.fine, model.coarse, f.join(','), f[0] + ',' + f[2]) : null, vote = d ? d.vote : 0;
    const side = d ? (vote > 0 ? d.wL : vote < 0 ? d.wS : Math.max(d.wL, d.wS)) : 0, pc = x => Math.round(x * 100);
    let text;
    if (!model.adopted) text = 'غير معتمد: لم ينجح باختبار الدقة التاريخية، فما يدخل بالتوافق';
    else if (!d) text = 'حالات مشابهة قليلة (أقل من ' + MINN + ')';
    else if (!vote) text = d.n + ' حالة مشابهة بدون أفضلية واضحة';
    else text = d.n + ' حالة مشابهة: ' + (vote > 0 ? 'الشراء' : 'البيع') + ' وصل الهدف قبل الوقف ' + pc(vote > 0 ? d.pL : d.pS) + '%';
    return { adopted: model.adopted, vote, strength: Math.round(100 * clamp((side - .5) / .2, 0, 1)), n: d ? d.n : 0, level: d ? d.level : null,
      pL: d ? d.pL : 0, pS: d ? d.pS : 0, upShare: d ? d.upShare : 0, avgMove: d ? d.avgMove : 0, val: model.val, built: model.built, text };
  }

  const API = { build, predict, H, _prepare: prepare, _walk: walk, _validate: validate };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.HPA = API;
})(typeof window !== 'undefined' ? window : this);
