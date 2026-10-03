// اختبار تقدّمي (walk-forward) للمحرك كامل على شموع حقيقية: كل قرار يتخذ بآخر 300 شمعة قبله فقط، ثم نشوف وش صار بعدها.
(function (root) {
  'use strict';
  const MAXF = 200;
  const wilson = (k, n, z = 1.96) => { if (!n) return [0, 0]; const p = k / n, z2 = z * z, d = 1 + z2 / n, c = (p + z2 / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / d; return [c - h, c + h]; };
  function create(cs, pr, Engine, ctx, opt) {
    const n = cs.length, unit = pr.pip / 10, H = cs.map(x => +x.high), L = cs.map(x => +x.low), C = cs.map(x => +x.close), step = (opt && opt.step) || 3, trades = [];
    let i = 299, analyses = 0;
    const nowAt = k => Date.parse(String(cs[k].datetime).replace(' ', 'T') + 'Z');
    function sim(i0, dir, px, slD, tpD) {
      const last = Math.min(n - 1, i0 + MAXF);
      for (let j = i0 + 1; j <= last; j++) {
        const sl = dir > 0 ? L[j] <= px - slD : H[j] >= px + slD, tp = dir > 0 ? H[j] >= px + tpD : L[j] <= px - tpD;
        if (sl) return { res: -1, r: -1, exit: j };          // الوقف أولاً إذا انلمس الاثنين بنفس الشمعة (متحفظ)
        if (tp) return { res: 1, r: tpD / slD, exit: j };
      }
      return { res: 0, r: Math.max(-1, Math.min(tpD / slD, dir * (C[last] - px) / slD)), exit: last };
    }
    function advance(k) {
      let c = 0;
      while (i < n - 2 && c < k) {
        const R = Engine.analyze(cs.slice(i - 299, i + 1), pr, nowAt(i), ctx); analyses++; c++;
        if (R.side === 'wait') { i += step; continue; }
        const dir = R.side === 'buy' ? 1 : -1, px = C[i], slD = (R.pts ? R.pts.sl * unit : Math.abs(R.px - R.sl)), tpD = (R.pts ? R.pts.tp1 * unit : Math.abs(R.tp1 - R.px));
        const a = sim(i, dir, px, slD, tpD), b = sim(i, -dir, px, slD, tpD);
        trades.push({ t: cs[i].datetime, side: R.side, sc: R.sc, rr: tpD / slD, res: a.res, r: a.r, mres: b.res, mr: b.r });
        i = Math.max(i + step, a.exit + 1);                  // صفقة وحدة بنفس الوقت: ما نفتح وحدة جديدة قبل ما تنتهي
      }
      return Math.min(1, (i - 299) / (n - 301));
    }
    const done = () => i >= n - 2;
    function stats(list, mirror) {
      const rs = mirror ? 'mres' : 'res', rv = mirror ? 'mr' : 'r', d = list.filter(t => t[rs] !== 0), w = d.filter(t => t[rs] === 1).length, [lo, hi] = wilson(w, d.length);
      return { n: list.length, resolved: d.length, wins: w, winRate: d.length ? w / d.length : 0, lo, hi, ev: list.length ? list.reduce((s, t) => s + t[rv], 0) / list.length : 0, be: d.length ? d.reduce((s, t) => s + 1 / (1 + t.rr), 0) / d.length : 0 };
    }
    function result() {
      const all = stats(trades, false), mir = stats(trades, true), bands = [[70, 75], [75, 80], [80, 101]].map(([a, b]) => { const l = trades.filter(t => t.sc >= a && t.sc < b); return { a, b: Math.min(b, 100), s: stats(l, false), m: stats(l, true) }; });
      const valid = all.n >= 30 && all.lo > all.be && all.ev > 0 && all.ev > mir.ev;
      return { analyses, trades: trades.length, nb: trades.filter(t => t.side === 'buy').length, ns: trades.filter(t => t.side === 'sell').length, from: cs[299].datetime, to: cs[n - 1].datetime, all, mir, bands, valid };
    }
    return { advance, done, result };
  }
  const API = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.FullTest = API;
})(typeof window !== 'undefined' ? window : this);
