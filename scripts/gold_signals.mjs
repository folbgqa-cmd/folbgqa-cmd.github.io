import fs from 'fs';

const { TG_TOKEN, TG_CHAT, TD_KEY } = process.env;
if (!TG_TOKEN || !TG_CHAT || !TD_KEY) { console.error('Missing secrets'); process.exit(1); }

// نفس قواعد صفحة signals.html بالضبط (اتجاه، زخم، اختراق/سيولة، ارتداد، تذبذب، جلسة، أخبار)
let cfg = { minConf: 70 };
try { cfg = { ...cfg, ...JSON.parse(fs.readFileSync('config.json', 'utf8')) }; } catch { }

const TF = '15min';
const P = {
  'XAU/USD': { n: 'الذهب', d: 2, c: ['USD'] }, 'EUR/USD': { n: 'يورو/دولار', d: 5, c: ['EUR', 'USD'] }, 'GBP/USD': { n: 'إسترليني/دولار', d: 5, c: ['GBP', 'USD'] },
  'USD/JPY': { n: 'دولار/ين', d: 3, c: ['USD', 'JPY'] }, 'AUD/USD': { n: 'أسترالي/دولار', d: 5, c: ['AUD', 'USD'] }, 'USD/CAD': { n: 'دولار/كندي', d: 5, c: ['USD', 'CAD'] }, 'USD/CHF': { n: 'دولار/فرنك', d: 5, c: ['USD', 'CHF'] }
};
const ema = (a, p) => { const k = 2 / (p + 1); let e = a[0]; return a.map((v, i) => (e = i ? v * k + e * (1 - k) : v)); };
function rsi(c, p = 14) { let g = 0, l = 0; for (let i = 1; i <= p; i++) { const d = c[i] - c[i - 1]; d > 0 ? g += d : l -= d; } g /= p; l /= p; for (let i = p + 1; i < c.length; i++) { const d = c[i] - c[i - 1]; g = (g * (p - 1) + (d > 0 ? d : 0)) / p; l = (l * (p - 1) + (d < 0 ? -d : 0)) / p; } return l ? 100 - 100 / (1 + g / l) : 100; }
function atr(h, l, c, p = 14) { const t = []; for (let i = 1; i < c.length; i++) t.push(Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1]))); let a = t.slice(0, p).reduce((x, y) => x + y) / p; for (let i = p; i < t.length; i++) a = (a * (p - 1) + t[i]) / p; return a; }

let EV = null;
try {
  const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
  if (r.ok) EV = (await r.json()).map(e => ({ ...e, ts: new Date(e.date).getTime() })).filter(e => e.impact === 'High' || e.impact === 'Medium');
} catch { }
console.log('news:', EV ? EV.length + ' events' : 'unavailable');

function nk(cur, now) {
  if (!EV) return { v: -1, t: 'الأخبار غير متاحة، راجع التقويم يدوياً' };
  let md = null;
  for (const e of EV) {
    if (!cur.includes(e.country)) continue;
    const m = (e.ts - now) / 6e4, w = `${e.country}: ${e.title} ${m > 0 ? 'بعد ' + Math.round(m) + ' د' : 'قبل ' + Math.round(-m) + ' د'}`;
    if (e.impact === 'High' && m > -30 && m < 60) return { v: 2, t: 'خبر قوي ' + w };
    if (e.impact === 'Medium' && m > -15 && m < 30 && !md) md = w;
  }
  if (md) return { v: 1, t: 'خبر متوسط ' + md };
  const nx = EV.find(e => cur.includes(e.country) && e.impact === 'High' && e.ts > now);
  return { v: 0, t: nx ? `لا خبر قريب. أقرب خبر قوي: ${nx.country} ${nx.title} بعد ${Math.round((nx.ts - now) / 36e5)} ساعة` : 'لا أخبار قوية قريبة' };
}
function ses(pr, now) {
  const D = new Date(now), h = D.getUTCHours() + D.getUTCMinutes() / 60, w = D.getUTCDay();
  if (w === 6 || (w === 0 && h < 21) || (w === 5 && h >= 21)) return { p: 0, closed: 1, t: 'السوق مغلق (نهاية الأسبوع)' };
  const ld = h >= 7 && h < 16, ny = h >= 12 && h < 21, tk = h < 9, jp = pr.c.some(x => x === 'JPY' || x === 'AUD');
  if (ld && ny) return { p: 15, t: 'تداخل لندن ونيويورك (أقوى سيولة)' };
  if (ld) return { p: 11, t: 'جلسة لندن' }; if (ny) return { p: 11, t: 'جلسة نيويورك' };
  if (tk) return { p: jp ? 8 : 3, t: 'جلسة طوكيو' + (jp ? ' (مناسبة لهذا الزوج)' : ' (سيولة ضعيفة لهذا الزوج)') };
  return { p: jp ? 4 : 2, t: 'جلسة سيدني (سيولة ضعيفة)' };
}
function analyze(v, pr, now) {
  const c = v.map(x => +x.close), h = v.map(x => +x.high), l = v.map(x => +x.low), n = c.length - 1;
  const e20 = ema(c, 20)[n], e50 = ema(c, 50)[n], e200 = ema(c, 200)[n], r = rsi(c), a = atr(h, l, c), px = c[n];
  const hh = Math.max(...h.slice(n - 20, n)), ll = Math.min(...l.slice(n - 20, n));
  const d = (px > e50 && e20 > e50) ? 1 : (px < e50 && e20 < e50) ? -1 : 0, F = [];
  let tp = 0, tw = 'لا يوجد ترند واضح';
  if (d) { tp = 15; tw = d > 0 ? 'EMA20 فوق EMA50 والسعر فوقهما' : 'EMA20 تحت EMA50 والسعر تحتهما'; if ((d > 0) === (px > e200)) { tp += 10; tw += ' ومع اتجاه EMA200'; } else tw += ' لكن عكس EMA200'; }
  F.push({ n: 'الاتجاه', p: tp, w: tw });
  let rp = 0, rw = `RSI ${r.toFixed(0)}`;
  if (d) { const x = d > 0 ? r : 100 - r; if (x >= 50 && x <= 70) { rp = 10; rw += ': زخم مع الاتجاه'; } else if (x > 70) { rp = 2; rw += ': تشبع، احذر الانعكاس'; } else if (x >= 40) { rp = 4; rw += ': زخم ضعيف'; } else rw += ': عكس الاتجاه'; }
  F.push({ n: 'الزخم', p: rp, w: rw });
  const bo = d > 0 ? px > hh : d < 0 ? px < ll : false, sw = d > 0 ? (l[n] < ll && px > ll) : d < 0 ? (h[n] > hh && px < hh) : false, pb = !!d && Math.abs(px - e20) < a * .5;
  let bp = 0, bw = 'لا اختراق ولا سحب سيولة';
  if (bo) { bp = 15; bw = d > 0 ? 'اختراق قمة آخر 20 شمعة' : 'كسر قاع آخر 20 شمعة'; } else if (sw) { bp = 15; bw = 'سحب سيولة ثم رجوع بالاتجاه'; }
  F.push({ n: 'الاختراق والسيولة', p: bp, w: bw });
  F.push({ n: 'الارتداد', p: pb ? 10 : 0, w: pb ? 'السعر قرب EMA20 مع الترند' : 'السعر بعيد عن EMA20' });
  const rg = c.map((_, i) => h[i] - l[i]), av = k => rg.slice(-k).reduce((s, y) => s + y, 0) / k, vr = av(14) / av(100);
  F.push({ n: 'التذبذب', p: vr >= .8 && vr <= 2 ? 10 : vr < .8 ? 4 : 0, w: `الحركة ${vr.toFixed(2)}× المعتاد` });
  const S = ses(pr, now), N = nk(pr.c, now);
  F.push({ n: 'الجلسة', p: S.p, w: S.t });
  F.push({ n: 'الأخبار', p: N.v === 0 ? 15 : N.v === 1 ? 7 : 0, w: N.t });
  const sc = F.reduce((s, x) => s + x.p, 0), trig = bo || sw || pb; let why = '';
  if (!d) why = 'لا اتجاه واضح'; else if (S.closed) why = S.t; else if (N.v === 2) why = N.t; else if (!trig) why = 'لا توجد نقطة دخول'; else if (sc < cfg.minConf) why = `قوة التوافق ${sc}% أقل من ${cfg.minConf}%`;
  return { px, a, F, sc, side: why ? 'wait' : d > 0 ? 'buy' : 'sell', why, d, hh, ll };
}
function message(sym, R) {
  const f = x => x.toFixed(P[sym].d), k = R.a * 1.5, sg = R.d;
  const lv = e => `دخول ${f(e)} | وقف ${f(e - sg * k)} | هدف1 ${f(e + sg * k * 2)} | هدف2 ${f(e + sg * k * 3)}`;
  const st = R.side === 'buy' ? R.hh + R.a * .1 : R.ll - R.a * .1;
  const why = R.F.filter(x => x.p > 0).map(x => `${x.n}: ${x.w}`).join('\n');
  return `${R.side === 'buy' ? '🟢 شراء' : '🔴 بيع'} ${P[sym].n} ${sym} (M15)
قوة التوافق: ${R.sc}%

صفقة فورية:
${lv(R.px)}

${R.side === 'buy' ? 'Buy Stop' : 'Sell Stop'} (اختراق):
${lv(st)}

${why}

⚠️ قوة التوافق ليست احتمال ربح. إشارة تعليمية، وحدد المخاطرة بـ 1% أو أقل.`;
}

let state = {};
try { state = JSON.parse(fs.readFileSync('state.json', 'utf8')); } catch { }
state.pairs ||= {};
let changed = false;
const now = Date.now();

// اختيار الأزواج: من أوامر تلي (state.sel) وإلا من config.json (pairs) وإلا كل الأزواج
const activeList = () => { const s = state.sel ?? cfg.pairs; return Array.isArray(s) && s.length ? s.filter(x => P[x]) : Object.keys(P); };
const K = { gold: 'XAU/USD', xau: 'XAU/USD', 'ذهب': 'XAU/USD', eur: 'EUR/USD', 'يورو': 'EUR/USD', gbp: 'GBP/USD', pound: 'GBP/USD', 'استرليني': 'GBP/USD', jpy: 'USD/JPY', yen: 'USD/JPY', 'ين': 'USD/JPY', aud: 'AUD/USD', cad: 'USD/CAD', chf: 'USD/CHF' };
const say = async text => { try { await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: TG_CHAT, text }) }); } catch { } };
const names = () => activeList().map(s => P[s].n).join('، ');
try {
  const ur = await (await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=${state.off || 0}&timeout=0`)).json();
  for (const u of ur.result || []) {
    state.off = u.update_id + 1; changed = true;
    const m = u.message;
    if (!m || String(m.chat.id) !== String(TG_CHAT) || !m.text || !m.text.startsWith('/')) continue;
    const words = m.text.toLowerCase().replace(/\//g, ' ').split(/\s+/).filter(Boolean);
    const before = activeList();
    if (words.includes('list')) { await say(`الأزواج الحالية: ${names()}`); continue; }
    if (words.includes('all')) state.sel = 'all';
    else {
      const sel = [...new Set(words.map(w => K[w]).filter(Boolean))];
      if (!sel.length) { await say(`الأزواج الحالية: ${names()}\nللتغيير اكتب مثلاً: /gold أو /eur أو /gbp /jpy /aud /cad /chf (تكدر تكتب أكثر من زوج بنفس الرسالة: /gold /eur) أو /all للكل. /list لعرض الحالي.`); continue; }
      state.sel = sel;
    }
    for (const s of activeList()) if (!before.includes(s)) state.pairs[s] = 'wait';
    await say(`✅ التنبيهات صارت لـ: ${names()}`);
  }
} catch (e) { console.error('commands:', e.message); }
const active = activeList();
console.log('active pairs:', active.join(', '));

for (const sym of active) {
  try {
    const res = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(sym)}&interval=${TF}&outputsize=300&apikey=${TD_KEY}`);
    const j = await res.json();
    if (!j.values || j.values.length < 250) { console.error(sym, 'data error:', j.message || 'not enough data'); continue; }
    const R = analyze(j.values.slice().reverse(), P[sym], now), last = state.pairs[sym] || 'wait';
    console.log(`${sym} side=${R.side} score=${R.sc} last=${last} ${R.why}`);
    if (R.side === last) continue;
    if (R.side === 'wait') { state.pairs[sym] = 'wait'; changed = true; continue; }
    const tg = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text: message(sym, R) })
    });
    const tj = await tg.json();
    if (!tj.ok) { console.error('Telegram error:', tj.description); continue; }
    state.pairs[sym] = R.side; changed = true;
  } catch (e) { console.error(sym, e.message); }
  await new Promise(r => setTimeout(r, 1200));
}
if (changed) fs.writeFileSync('state.json', JSON.stringify({ pairs: state.pairs, sel: state.sel, off: state.off, at: new Date().toISOString() }));
