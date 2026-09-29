import fs from 'fs';

const { TG_TOKEN, TG_CHAT, TD_KEY } = process.env;
if (!TG_TOKEN || !TG_CHAT || !TD_KEY) { console.error('Missing secrets'); process.exit(1); }

// السوق مغلق: من الجمعة 22:00 إلى الأحد 22:00 (UTC)
const now = new Date(), day = now.getUTCDay(), hr = now.getUTCHours();
if (day === 6 || (day === 0 && hr < 22) || (day === 5 && hr >= 22)) { console.log('market closed'); process.exit(0); }

const SYMBOL = 'XAU/USD', TF = '15min', DEC = 2;
const ema = (a, p) => { const k = 2 / (p + 1); let e = a[0]; return a.map((v, i) => (e = i ? v * k + e * (1 - k) : v)); };
function rsi(c, p = 14) { let g = 0, l = 0; for (let i = 1; i <= p; i++) { const d = c[i] - c[i - 1]; d > 0 ? g += d : l -= d; } g /= p; l /= p; for (let i = p + 1; i < c.length; i++) { const d = c[i] - c[i - 1]; g = (g * (p - 1) + (d > 0 ? d : 0)) / p; l = (l * (p - 1) + (d < 0 ? -d : 0)) / p; } return l ? 100 - 100 / (1 + g / l) : 100; }
function atr(h, l, c, p = 14) { const t = []; for (let i = 1; i < c.length; i++) t.push(Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1]))); let a = t.slice(0, p).reduce((x, y) => x + y) / p; for (let i = p; i < t.length; i++) a = (a * (p - 1) + t[i]) / p; return a; }

const res = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(SYMBOL)}&interval=${TF}&outputsize=300&apikey=${TD_KEY}`);
const j = await res.json();
if (!j.values) { console.error('Data error:', j.message || j); process.exit(1); }
const v = j.values.slice().reverse();
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

const side = s >= 3 ? 'buy' : s <= -3 ? 'sell' : 'wait';
const conf = Math.min(100, Math.round(Math.abs(s) / 7 * 100));

let state = { side: 'wait' };
try { state = JSON.parse(fs.readFileSync('state.json', 'utf8')); } catch { }
console.log(`side=${side} score=${s} last=${state.side}`);
if (side === state.side) process.exit(0);
if (side === 'wait') { fs.writeFileSync('state.json', JSON.stringify({ side, at: now.toISOString() })); process.exit(0); }

const f = x => x.toFixed(DEC), risk = a * 1.5, d = side === 'buy' ? 1 : -1;
const lv = (entry) => `دخول ${f(entry)} | وقف ${f(entry - d * risk)} | هدف1 ${f(entry + d * risk * 1.5)} | هدف2 ${f(entry + d * risk * 2.5)}`;
const stop = side === 'buy' ? hh + a * 0.1 : ll - a * 0.1;
const limit = (side === 'buy' && px > e20) || (side === 'sell' && px < e20) ? `\n${side === 'buy' ? 'Buy Limit' : 'Sell Limit'} (ارتداد):\n${lv(e20)}` : '';
const text = `${side === 'buy' ? '🟢 شراء' : '🔴 بيع'} الذهب XAU/USD (M15)
الثقة: ${conf}%

صفقة فورية:
${lv(px)}
${limit}

${side === 'buy' ? 'Buy Stop' : 'Sell Stop'} (اختراق):
${lv(stop)}

الأسباب: ${why.join('، ')}

⚠️ إشارة فنية تعليمية ولا تضمن ربحاً. راجع الأخبار وحدد المخاطرة بـ 1% أو أقل.`;

const tg = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chat_id: TG_CHAT, text })
});
const tj = await tg.json();
if (!tj.ok) { console.error('Telegram error:', tj.description); process.exit(1); }
fs.writeFileSync('state.json', JSON.stringify({ side, at: now.toISOString() }));
console.log('sent');
