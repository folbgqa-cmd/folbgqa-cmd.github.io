// تحليل تاريخي: يبحث في آخر 10,000 شمعة عن حالات مشابهة للوضع الحالي ويقيس ماذا حدث بعدها.
// طبقة مستقلة: ما تستخدم أي مؤشر أو مدرسة من الموقع، فقط سلوك السعر نفسه
// (شكل آخر 8 إغلاقات، طبيعة الشمعة، الموقع داخل نطاق 50 شمعة، التذبذب، الميل، ساعة اليوم).
// منع Look-Ahead: ميزات الحالة j تستخدم شموع <= j فقط. والحالة j ما تدخل مقارنة اللحظة q إلا إذا j + 20 <= q
// (يعني نتيجتها كانت معروفة قبل q). كل الأوزان والحدود ثابتة مسبقاً وما انضبطت على أي نتيجة سوق حقيقية.
// قاعدة الدمج (gate): نعد الحالات المشابهة اللي صعدت (up) واللي هبطت (dn) بعد 10 شموع. الأغلبية = اتجاه التحليل التاريخي.
// أغلبية بنفس اتجاه الأدوات: تدخل الصفقة ويزيد التوافق. أغلبية عكس الأدوات: ترفض الصفقة. تعادل أو بيانات غير كافية: لا تأثير.
(function (root) {
  'use strict';
  const MAXH = 20, K = 120, MINCASES = 40, MINDATA = 2500, SEP = 20, EVMIN = 0.35, LBMIN = .58, Z = 1.645, NF = 15;
  const WT = [1, 1, 1, 1, 1, 1, 1, 1.5, 1, 1, 3, 2, 1.5, .7, .7];
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function prep(cs) {
    const n = cs.length, o = new Float64Array(n), h = new Float64Array(n), l = new Float64Array(n), c = new Float64Array(n), ts = new Float64Array(n), r = new Float64Array(n);
    for (let i = 0; i < n; i++) { o[i] = +cs[i].open; h[i] = +cs[i].high; l[i] = +cs[i].low; c[i] = +cs[i].close; ts[i] = Date.parse(String(cs[i].datetime).replace(' ', 'T') + 'Z'); r[i] = h[i] - l[i]; }
    const sc = new Float64Array(n).fill(NaN); let s = 0;
    for (let i = 0; i < n; i++) { s += r[i]; if (i >= 50) s -= r[i - 50]; if (i >= 49) sc[i] = s / 50; }
    const F = new Float32Array(n * NF).fill(NaN);
    for (let i = 60; i < n; i++) {
      const S = sc[i]; if (!(S > 0)) continue; const b = i * NF;
      for (let k = 1; k <= 7; k++) F[b + k - 1] = clamp((c[i - k] - c[i]) / S, -6, 6);
      const rg = r[i] > 0 ? r[i] : S;
      F[b + 7] = (c[i] - o[i]) / rg; F[b + 8] = (h[i] - Math.max(o[i], c[i])) / rg; F[b + 9] = (Math.min(o[i], c[i]) - l[i]) / rg;
      let hi = -Infinity, lo = Infinity; for (let j = i - 49; j <= i; j++) { if (h[j] > hi) hi = h[j]; if (l[j] < lo) lo = l[j]; }
      F[b + 10] = (c[i] - lo) / ((hi - lo) || 1);
      let m10 = 0; for (let j = i - 9; j <= i; j++) m10 += r[j];
      F[b + 11] = clamp((m10 / 10) / S - 1, -2, 2);
      F[b + 12] = clamp((c[i] - c[i - 20]) / (S * 4.472), -3, 3);
      const d = new Date(ts[i]), hr = d.getUTCHours() + d.getUTCMinutes() / 60, ang = 2 * Math.PI * hr / 24;
      F[b + 13] = Math.sin(ang); F[b + 14] = Math.cos(ang);
    }
    // نتائج كل حالة (تستخدم شموع بعدها، لكن ما تدخل القرار إلا لما تكون كلها قبل لحظة السؤال)
    const OL = new Float32Array(n).fill(NaN), OS = new Float32Array(n).fill(NaN), WL = new Int8Array(n), WS = new Int8Array(n);
    const R5 = new Float32Array(n).fill(NaN), R10 = new Float32Array(n).fill(NaN), R20 = new Float32Array(n).fill(NaN);
    for (let j = 60; j + MAXH < n; j++) {
      const S = sc[j]; if (!(S > 0)) continue; const e = c[j], R = 1.5 * S;
      let ol = NaN, os = NaN;
      for (let t = j + 1; t <= j + MAXH; t++) { if (l[t] <= e - R) { ol = -1; break; } if (h[t] >= e + 2 * R) { ol = 2; WL[j] = 1; break; } }
      if (isNaN(ol)) ol = clamp((c[j + MAXH] - e) / R, -1, 2);
      for (let t = j + 1; t <= j + MAXH; t++) { if (h[t] >= e + R) { os = -1; break; } if (l[t] <= e - 2 * R) { os = 2; WS[j] = 1; break; } }
      if (isNaN(os)) os = clamp((e - c[j + MAXH]) / R, -1, 2);
      OL[j] = ol; OS[j] = os; R5[j] = (c[j + 5] - e) / e * 100; R10[j] = (c[j + 10] - e) / e * 100; R20[j] = (c[j + MAXH] - e) / e * 100;
    }
    return { n, F, sc, OL, OS, WL, WS, R5, R10, R20 };
  }

  const wilson = (p, n) => { if (!n) return 0; const z2 = Z * Z, ctr = (p + z2 / (2 * n)) / (1 + z2 / n), half = Z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / (1 + z2 / n); return ctr - half; };

  function query(P, q) {
    const { F, OL } = P, lim = q - MAXH;
    if (q < 60 || !(P.sc[q] > 0) || isNaN(F[q * NF])) return { status: 'insufficient', reason: 'الحالة الحالية غير قابلة للقياس' };
    const qf = new Float32Array(NF); for (let f = 0; f < NF; f++) qf[f] = F[q * NF + f];
    const idx = [], dist = [];
    for (let j = 60; j <= lim; j++) {
      if (isNaN(OL[j]) || isNaN(F[j * NF])) continue;
      let d = 0; for (let f = 0; f < NF; f++) { const x = F[j * NF + f] - qf[f]; d += WT[f] * x * x; }
      idx.push(j); dist.push(d);
    }
    if (idx.length < MINDATA) return { status: 'insufficient', reason: 'عدد الشموع المتاحة قليل (' + idx.length + ' من ' + MINDATA + ' على الأقل)', used: idx.length };
    const ord = idx.map((_, i) => i).sort((a, b) => dist[a] - dist[b]);
    const pick = [];
    for (const i of ord) { const j = idx[i]; let ok = true; for (const p of pick) if (Math.abs(p - j) < SEP) { ok = false; break; } if (ok) { pick.push(j); if (pick.length >= K) break; } }
    const n = pick.length;
    if (n < MINCASES) return { status: 'insufficient', reason: 'الحالات المشابهة قليلة (' + n + ' من ' + MINCASES + ' على الأقل)', used: idx.length, cases: n };
    let evL = 0, evS = 0, wL = 0, wS = 0, m5 = 0, m10 = 0, m20 = 0, up = 0, dn = 0;
    for (const j of pick) { evL += P.OL[j]; evS += P.OS[j]; wL += P.WL[j]; wS += P.WS[j]; m5 += P.R5[j]; m10 += P.R10[j]; m20 += P.R20[j]; if (P.R10[j] > 0) up++; else if (P.R10[j] < 0) dn++; }
    evL /= n; evS /= n; wL /= n; wS /= n; m5 /= n; m10 /= n; m20 /= n;
    const side0 = evL >= evS ? 'buy' : 'sell', ev = Math.max(evL, evS), k = side0 === 'buy' ? up : dn, tot = up + dn || 1, share = k / tot, lb = wilson(share, tot);
    // maj: الأغلبية بالعدد (كم حالة صعدت وكم هبطت بعد 10 شموع). هذا هو اللي يدخل بالتوافق.
    const maj = up > dn ? 'buy' : dn > up ? 'sell' : 'neutral';
    // side: اتجاه حاسم إحصائياً (للعرض فقط): القيمة المتوقعة >= 0.35R والحد الأدنى الإحصائي (90%) فوق 58%
    const dir = ev >= EVMIN && lb > LBMIN;
    return { status: 'ok', cases: n, used: idx.length, up, dn, maj, side: dir ? side0 : 'neutral', lean: side0, strength: Math.round(share * 100), lb, ev: { buy: evL, sell: evS }, win: { buy: wL, sell: wS }, mv: { m5, m10, m20 } };
  }

  // اختبار walk-forward لقاعدة الأغلبية: لكل لحظة q نقرر بالبيانات اللي قبلها فقط، ثم نقيس النتيجة الفعلية بعدها
  function backtest(P) {
    const n = P.n, from = 60 + MINDATA + MAXH + 20, last = n - MAXH - 1;
    if (last - from < 300) return { status: 'insufficient', reason: 'البيانات ما تكفي لاختبار موثوق (تحتاج حوالي 3,000 شمعة على الأقل بعد فترة التدريب)' };
    const step = Math.max(10, Math.floor((last - from) / 600)); let tests = 0, insuff = 0, neutral = 0, sig = 0, nb = 0, ns = 0, win = 0, ev = 0, bAll = 0, sAll = 0;
    for (let q = from; q <= last; q += step) {
      const r = query(P, q); tests++; bAll += P.OL[q]; sAll += P.OS[q];
      if (r.status !== 'ok') { insuff++; continue; } if (r.maj === 'neutral') { neutral++; continue; }
      sig++; if (r.maj === 'buy') { nb++; ev += P.OL[q]; win += P.WL[q]; } else { ns++; ev += P.OS[q]; win += P.WS[q]; }
    }
    // "لها قيمة فعلية" فقط إذا: 30 إشارة على الأقل، ربح متوقع موجب، الحد الأدنى لنسبة الوصول للهدف فوق نقطة التعادل (33%)، وتتفوق على "شراء دايماً" و"بيع دايماً"
    const wr = sig ? win / sig : 0, lbw = wilson(wr, sig), evm = sig ? ev / sig : 0, bAvg = { buy: bAll / tests, sell: sAll / tests }, valid = sig >= 30 && evm > 0 && lbw > 1 / 3 && evm > Math.max(bAvg.buy, bAvg.sell);
    return { status: 'ok', tests, insuff, neutral, sig, nb, ns, winRate: wr, winLB: lbw, ev: evm, base: bAvg, valid };
  }

  // الدمج مع نتيجة الأدوات R (من Engine.analyze): يوافق الأدوات = يرفع التوافق، يخالفها = رفض الصفقة، بدون بيانات أو تعادل = لا تأثير
  function gate(R, h, W, min) {
    R.hist = h;
    if (!h || h.status !== 'ok' || h.maj === 'neutral' || !R.d) return R;
    const agree = (h.maj === 'buy') === (R.d > 0);
    R.hAgree = agree; R.scTools = R.sc;
    if (agree) R.ag += W; else R.dg += W;
    R.sc = Math.round(100 * R.ag / ((R.ag + R.dg) || 1));
    R.why = !agree ? 'التحليل التاريخي عكس الأدوات (' + h.up + ' حالة صعود مقابل ' + h.dn + ' هبوط)' : R.sc < min ? 'قوة التوافق ' + R.sc + '% أقل من ' + min + '%' : '';
    R.side = R.why ? 'wait' : R.d > 0 ? 'buy' : 'sell';
    return R;
  }

  const API = { prep, query, backtest, gate, MAXH, K, MINCASES, MINDATA };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.Hist = API;
})(typeof window !== 'undefined' ? window : this);
