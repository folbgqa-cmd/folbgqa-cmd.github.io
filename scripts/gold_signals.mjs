import fs from 'fs';

const { TG_TOKEN, TG_CHAT, TD_KEY } = process.env;
if (!TG_TOKEN || !TG_CHAT || !TD_KEY) { console.error('Missing secrets'); process.exit(1); }

const now = new Date(), day = now.getUTCDay(), hr = now.getUTCHours();
if (day === 6 || (day === 0 && hr < 22) || (day === 5 && hr >= 22)) { console.log('market closed'); process.exit(0); }

// الإعدادات من config.json: minConf = أقل قوة إشارة، minWinRate = أقل نسبة نجاح تاريخية (0 = بدون شرط)
let cfg = { minConf: 70, minWinRate: 0 };
try { cfg = { ...cfg, ...JSON.parse(fs.readFileSync('config.json', 'utf8')) }; } catch { }

const TF = '15min';
const PAIRS = {
  'XAU/USD': { n: 'الذهب', d: 2 }, 'EUR/USD': { n: 'يورو/دولار', d: 5 }, 'GBP/USD': { n: 'إسترليني/دولار', d: 5 },
  'USD/JPY': { n: 'دولار/ين', d: 3 }, 'AUD/USD': { n: 'أسترالي/دولار', d: 5 }, 'USD/CAD': { n: 'دولار/كندي', d: 5 }, 'USD/CHF': { n: 'دولار/فرنك', d: 5 }
};
const ema = (a, p) => { const k = 2 / (p + 1); let e = a[0]; return a.map((v, i) => (e = i ? v * k + e * (1 - k) : v)); };
function rsiS(c, p = 14) { const o = new Array(c.length).fill(50); let g = 0, l = 0; for (let i = 1; i <= p; i++) { const d = c[i] - c[i - 1]; d > 0 ? g += d : l -= d; } g /= p; l /= p; o[p] = l ? 100 - 100 / (1 + g / l) : 100; for (let i = p + 1; i < c.length; i++) { const d = c[i] - c[i - 1]; g = (g * (p - 1) + (d > 0 ? d : 0)) / p; l = (l * (p - 1) + (d < 0 ? -d : 0)) / p; o[i] = l ? 100 - 100 / (1 + g / l) : 100; } return o; }
function atrS(h, l, c, p = 14) { const o = new Array(c.length).fill(0), t = [0]; for (let i = 1; i < c.length; i++) t.push(Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1]))); let a = t.slice(1, p + 1).reduce((x, y) => x + y) / p; o[p] = a; for (let i = p + 1; i < c.length; i++) { a = (a * (p - 1) + t[i]) / p; o[i] = a; } return o; }

function series(v) {
  const c = v.map(x => +x.close), h = v.map(x => +x.high), l = v.map(x => +x.low);
  return { c, h, l, e20: ema(c, 20), e50: ema(c, 50), e200: ema(c, 200), rs: rsiS(c), at: atrS(h, l, c) };
}
function scoreAt(S, i) {
  const px = S.c[i], e20 = S.e20[i], e50 = S.e50[i], e200 = S.e200[i], r = S.rs[i], a = S.at[i];
  const hh = Math.max(...S.h.slice(i - 20, i)), ll = Math.min(...S.l.slice(i - 20, i));
  let s = 0; const why = [];
  if (px > e50 && e20 > e50) { s += 2; why.push('ترند صاعد (EMA20 فوق EMA50)'); }
  else if (px < e50 && e20 < e50) { s -= 2; why.push('ترند هابط (EMA20 تحت EMA50)'); }
  if (px > e200) { s += 1; why.push('فوق EMA200'); } else { s -= 1; why.push('تحت EMA200'); }
  if (r >= 50 && r <= 70) { s += 1; why.push(`RSI ${r.toFixed(0)} زخم شرائي`); }
  else if (r < 50 && r >= 30) { s -= 1; why.push(`RSI ${r.toFixed(0)} زخم بيعي`); }
  else if (r > 70) { s -= 1; why.push(`RSI ${r.toFixed(0)} تشبع شراء`); }
  else { s += 1; why.push(`RSI ${r.toFixed(0)} تشبع بيع`); }
  if (Math.abs(px - e20) < a * 0.5 && e20 !== e50) { s += e20 > e50 ? 1 : -1; why.push('ارتداد عند EMA20'); }
  if (px > hh) { s += 2; why.push('اختراق قمة 20 شمعة'); }
  else if (px < ll) { s -= 2; why.push('كسر قاع 20 شمعة'); }
  return { s, why, px, e20, a, hh, ll, side: s >= 3 ? 'buy' : s <= -3 ? 'sell' : 'wait', conf: Math.min(100, Math.round(Math.abs(s) / 7 * 100)) };
}
// اختبار تاريخي: نفس القواعد على الشموع الماضية، هدف 1.5R ووقف 1.5 ATR
function backtest(S) {
  let w = 0, lo = 0, i = 210;
  while (i < S.c.length - 1) {
    const { s } = scoreAt(S, i), side = s >= 3 ? 1 : s <= -3 ? -1 : 0;
    if (!side) { i++; continue; }
    const px = S.c[i], risk = S.at[i] * 1.5, sl = px - side * risk, tp = px + side * risk * 1.5;
    let res = 0, j = i + 1;
    for (; j < S.c.length && j <= i + 32; j++) {
      const hs = side > 0 ? S.l[j] <= sl : S.h[j] >= sl, ht = side > 0 ? S.h[j] >= tp : S.l[j] <= tp;
      if (hs) { res = -1; break; } if (ht) { res = 1; break; }
    }
    if (res > 0) w++; else if (res < 0) lo++;
    i = res ? j + 1 : i + 1;
  }
  const n = w + lo;
  return { n, rate: n ? Math.round(w / n * 100) : null };
}

function message(sym, R, bt) {
  const f = x => x.toFixed(PAIRS[sym].d), risk = R.a * 1.5, d = R.side === 'buy' ? 1 : -1;
  const lv = e => `دخول ${f(e)} | وقف ${f(e - d * risk)} | هدف1 ${f(e + d * risk * 1.5)} | هدف2 ${f(e + d * risk * 2.5)}`;
  const stop = R.side === 'buy' ? R.hh + R.a * 0.1 : R.ll - R.a * 0.1;
  const lim = (R.side === 'buy' && R.px > R.e20) || (R.side === 'sell' && R.px < R.e20) ? `\n${R.side === 'buy' ? 'Buy Limit' : 'Sell Limit'} (ارتداد):\n${lv(R.e20)}\n` : '';
  const hist = bt.rate === null ? 'غير متوفرة' : `${bt.rate}% (من ${bt.n} صفقة سابقة، تقريباً آخر 15 يوم)`;
  return `${R.side === 'buy' ? '🟢 شراء' : '🔴 بيع'} ${PAIRS[sym].n} ${sym} (M15)
قوة الإشارة: ${R.conf}%
نسبة النجاح التاريخية لنفس القواعد: ${hist}

صفقة فورية:
${lv(R.px)}
${lim}
${R.side === 'buy' ? 'Buy Stop' : 'Sell Stop'} (اختراق):
${lv(stop)}

الأسباب: ${R.why.join('، ')}

⚠️ النسبة التاريخية لا تضمن المستقبل. الإشارة تعليمية، وحدد المخاطرة بـ 1% أو أقل.`;
}

let state = {};
try { state = JSON.parse(fs.readFileSync('state.json', 'utf8')); } catch { }
if (!state.pairs) state = { pairs: {} };
let changed = false;

for (const sym of Object.keys(PAIRS)) {
  try {
    const res = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(sym)}&interval=${TF}&outputsize=1500&apikey=${TD_KEY}`);
    const j = await res.json();
    if (!j.values || j.values.length < 300) { console.error(sym, 'data error:', j.message || 'not enough data'); continue; }
    const S = series(j.values.slice().reverse());
    const R = scoreAt(S, S.c.length - 1), last = state.pairs[sym] || 'wait';
    if (R.side === last) { console.log(sym, R.side, 'no change'); continue; }
    let ok = R.side !== 'wait' && R.conf >= cfg.minConf, bt = { n: 0, rate: null };
    if (R.side !== 'wait') bt = backtest(S);
    if (ok && cfg.minWinRate > 0) ok = bt.rate !== null && bt.n >= 5 && bt.rate >= cfg.minWinRate;
    console.log(`${sym} side=${R.side} conf=${R.conf} win=${bt.rate}/${bt.n} send=${ok}`);
    if (ok) {
      const tg = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT, text: message(sym, R, bt) })
      });
      const tj = await tg.json();
      if (!tj.ok) { console.error('Telegram error:', tj.description); continue; }
      state.pairs[sym] = R.side; changed = true;
    } else if (last !== 'wait') { state.pairs[sym] = 'wait'; changed = true; }
  } catch (e) { console.error(sym, e.message); }
  await new Promise(r => setTimeout(r, 1200));
}
if (changed) fs.writeFileSync('state.json', JSON.stringify({ pairs: state.pairs, at: now.toISOString() }));
