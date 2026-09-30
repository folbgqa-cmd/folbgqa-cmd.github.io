import fs from 'fs';

const { TG_TOKEN, TG_CHAT, TD_KEY } = process.env;
if (!TG_TOKEN || !TG_CHAT || !TD_KEY) { console.error('Missing secrets'); process.exit(1); }

// السوق مغلق: من الجمعة 22:00 إلى الأحد 22:00 (UTC)
const now = new Date(), day = now.getUTCDay(), hr = now.getUTCHours();
if (day === 6 || (day === 0 && hr < 22) || (day === 5 && hr >= 22)) { console.log('market closed'); process.exit(0); }

const TF = '15min';
const PAIRS = {
  'XAU/USD': { n: 'الذهب', d: 2 }, 'EUR/USD': { n: 'يورو/دولار', d: 5 }, 'GBP/USD': { n: 'إسترليني/دولار', d: 5 },
  'USD/JPY': { n: 'دولار/ين', d: 3 }, 'AUD/USD': { n: 'أسترالي/دولار', d: 5 }, 'USD/CAD': { n: 'دولار/كندي', d: 5 }, 'USD/CHF': { n: 'دولار/فرنك', d: 5 }
};
const ema = (a, p) => { const k = 2 / (p + 1); let e = a[0]; return a.map((v, i) => (e = i ? v * k + e * (1 - k) : v)); };
function rsi(c, p = 14) { let g = 0, l = 0; for (let i = 1; i <= p; i++) { const d = c[i] - c[i - 1]; d > 0 ? g += d : l -= d; } g /= p; l /= p; for (let i = p + 1; i < c.length; i++) { const d = c[i] - c[i - 1]; g = (g * (p - 1) + (d > 0 ? d : 0)) / p; l = (l * (p - 1) + (d < 0 ? -d : 0)) / p; } return l ? 100 - 100 / (1 + g / l) : 100; }
function atr(h, l, c, p = 14) { const t = []; for (let i = 1; i < c.length; i++) t.push(Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1]))); let a = t.slice(0, p).reduce((x, y) => x + y) / p; for (let i = p; i < t.length; i++) a = (a * (p - 1) + t[i]) / p; return a; }

function analyze(v) {
  const c = v.map(x => +x.close), h = v.map(x => +x.high), l = v.map(x => +x.low), n = c.length - 1;
  const e20 = ema(c, 20)[n], e50 = ema(c, 50)[n], e200 = ema(c, 200)[n], r = rsi(c), a = atr(h, l, c), px = c[n];
  const hh = Math.max(...h.slice(n - 20, n)), ll = Math.min(...l.slice(n - 20, n));
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
  return { px, e20, a, hh, ll, why, side: s >= 3 ? 'buy' : s <= -3 ? 'sell' : 'wait', conf: Math.min(100, Math.round(Math.abs(s) / 7 * 100)) };
}

function message(sym, R) {
  const f = x => x.toFixed(PAIRS[sym].d), risk = R.a * 1.5, d = R.side === 'buy' ? 1 : -1;
  const lv = e => `دخول ${f(e)} | وقف ${f(e - d * risk)} | هدف1 ${f(e + d * risk * 1.5)} | هدف2 ${f(e + d * risk * 2.5)}`;
  const stop = R.side === 'buy' ? R.hh + R.a * 0.1 : R.ll - R.a * 0.1;
  const lim = (R.side === 'buy' && R.px > R.e20) || (R.side === 'sell' && R.px < R.e20) ? `\n${R.side === 'buy' ? 'Buy Limit' : 'Sell Limit'} (ارتداد):\n${lv(R.e20)}\n` : '';
  return `${R.side === 'buy' ? '🟢 شراء' : '🔴 بيع'} ${PAIRS[sym].n} ${sym} (M15)
الثقة: ${R.conf}%

صفقة فورية:
${lv(R.px)}
${lim}
${R.side === 'buy' ? 'Buy Stop' : 'Sell Stop'} (اختراق):
${lv(stop)}

الأسباب: ${R.why.join('، ')}

⚠️ إشارة فنية تعليمية ولا تضمن ربحاً. راجع الأخبار وحدد المخاطرة بـ 1% أو أقل.`;
}

let state = {};
try { state = JSON.parse(fs.readFileSync('state.json', 'utf8')); } catch { }
if (!state.pairs) state = { pairs: {} };
let changed = false;

for (const sym of Object.keys(PAIRS)) {
  try {
    const res = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(sym)}&interval=${TF}&outputsize=300&apikey=${TD_KEY}`);
    const j = await res.json();
    if (!j.values) { console.error(sym, 'data error:', j.message || j); continue; }
    const R = analyze(j.values.slice().reverse());
    const last = state.pairs[sym] || 'wait';
    console.log(`${sym} side=${R.side} last=${last}`);
    if (R.side === last) continue;
    if (R.side !== 'wait') {
      const tg = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT, text: message(sym, R) })
      });
      const tj = await tg.json();
      if (!tj.ok) { console.error('Telegram error:', tj.description); continue; }
      console.log(sym, 'sent');
    }
    state.pairs[sym] = R.side; changed = true;
  } catch (e) { console.error(sym, e.message); }
  await new Promise(r => setTimeout(r, 1200));
}
if (changed) fs.writeFileSync('state.json', JSON.stringify({ pairs: state.pairs, at: now.toISOString() }));
