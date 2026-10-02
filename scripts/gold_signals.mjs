import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Engine = require('../engine.js'); // نفس محرك الأدوات المستخدم بصفحة signals.html
const Hist = require('../history.js'); // نفس طبقة التحليل التاريخي (10,000 شمعة) المستخدمة بالصفحة

const { TG_TOKEN, TG_CHAT, TD_KEY } = process.env;
if (!TG_TOKEN || !TG_CHAT || !TD_KEY) { console.error('Missing secrets'); process.exit(1); }

let cfg = { minConf: 70 };
try { cfg = { ...cfg, ...JSON.parse(fs.readFileSync('config.json', 'utf8')) }; } catch { }

const TF = '15min';
const HW = 15; // نفس وزن الدمج بالصفحة
const P = {
  'XAU/USD': { n: 'الذهب', d: 2, pip: .1, c: ['USD'] }, 'EUR/USD': { n: 'يورو/دولار', d: 5, pip: 1e-4, c: ['EUR', 'USD'] }, 'GBP/USD': { n: 'إسترليني/دولار', d: 5, pip: 1e-4, c: ['GBP', 'USD'] },
  'USD/JPY': { n: 'دولار/ين', d: 3, pip: .01, c: ['USD', 'JPY'] }, 'AUD/USD': { n: 'أسترالي/دولار', d: 5, pip: 1e-4, c: ['AUD', 'USD'] }, 'USD/CAD': { n: 'دولار/كندي', d: 5, pip: 1e-4, c: ['USD', 'CAD'] }, 'USD/CHF': { n: 'دولار/فرنك', d: 5, pip: 1e-4, c: ['USD', 'CHF'] }
};

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
const analyze = (v, pr, now) => Engine.analyze(v, pr, now, { ses, nk, min: cfg.minConf });

// تحميل آخر 10,000 شمعة (طلبين من 5000) مع كل تحليل
async function tdPage(sym, end) {
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(sym)}&interval=${TF}&outputsize=5000&apikey=${TD_KEY}` + (end ? `&end_date=${encodeURIComponent(end)}` : '');
  const j = await (await fetch(url)).json();
  if (!j.values) throw new Error(j.message || 'data error');
  return j.values;
}
async function loadAll(sym) {
  const a = await tdPage(sym); let all = a;
  if (a.length >= 4990) { try { all = a.concat(await tdPage(sym, a[a.length - 1].datetime)); } catch (e) { console.error(sym, 'history page 2:', e.message); } }
  const seen = new Set(), o = [];
  for (const x of all) if (!seen.has(x.datetime)) { seen.add(x.datetime); o.push(x); }
  o.sort((x, y) => x.datetime < y.datetime ? -1 : 1);
  return o.slice(-10000);
}

// فرق السعر بين Twelve Data ووسيطك (بالدولار): من config.json (offsets) وتغييره من تلي بالأمر /offset
const offs = () => ({ ...(cfg.offsets || {}), ...(state.offs || {}) });
// رسالة واحدة واضحة: صفقة واحدة فقط (دخول، استوب، هدف 1، هدف 2) بنقاط المحرك (700 إلى 1500)
function message(sym, R) {
  const o = offs()[sym] || 0, f = x => (x + o).toFixed(P[sym].d), pt = R.pts, h = R.hist;
  const hl = h && h.status === 'ok' ? `\nالتحليل التاريخي (${h.data.toLocaleString('en')} شمعة): ${h.up} صعود مقابل ${h.dn} هبوط من ${h.cases} حالة مشابهة` : '';
  return `${R.side === 'buy' ? '🟢 شراء' : '🔴 بيع'} ${P[sym].n} ${sym} (M15) | قوة التوافق ${R.sc}%

${R.order ? R.order.label : 'ادخل الآن'}
1. الدخول: ${f(R.entry != null ? R.entry : R.px)}
2. الاستوب: ${f(R.sl)} (${pt.sl} نقطة)
3. الهدف 1: ${f(R.tp1)} (${pt.tp1} نقطة)
4. الهدف 2: ${f(R.tp2)} (${pt.tp2} نقطة)
${hl}
⚠️ إشارة تعليمية، خاطر بـ 1% أو أقل.`;
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
const offText = () => Object.entries(offs()).filter(([, v]) => v).map(([k, v]) => `${P[k]?.n || k}: ${v > 0 ? '+' : ''}${v}$`).join('، ') || 'بدون فرق';
try {
  const ur = await (await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=${state.off || 0}&timeout=0`)).json();
  for (const u of ur.result || []) {
    state.off = u.update_id + 1; changed = true;
    const m = u.message;
    if (!m || String(m.chat.id) !== String(TG_CHAT) || !m.text || !m.text.startsWith('/')) continue;
    const words = m.text.toLowerCase().replace(/\//g, ' ').split(/\s+/).filter(Boolean);
    if (words[0] === 'offset') {
      const sym = words.map(w => K[w]).find(Boolean), num = words.map(w => /^[+-]?\d+(\.\d+)?$/.test(w) ? parseFloat(w) : null).find(x => x !== null);
      if (!sym || num === undefined) { await say(`الصيغة: /offset gold 2.5\nالرقم = سعر وسيطك ناقص سعر الموقع بالدولار. /offset gold 0 لإلغائه.\nالفروق الحالية: ${offText()}`); continue; }
      state.offs = { ...(state.offs || {}), [sym]: num };
      await say(`✅ فرق سعر ${P[sym].n} صار ${num > 0 ? '+' : ''}${num}$. الصفقات الجاية تطابق سعر وسيطك.`);
      continue;
    }
    const before = activeList();
    if (words.includes('list')) { await say(`الأزواج الحالية: ${names()}\nفروق الأسعار: ${offText()}`); continue; }
    if (words.includes('all')) state.sel = 'all';
    else {
      const sel = [...new Set(words.map(w => K[w]).filter(Boolean))];
      if (!sel.length) { await say(`الأزواج الحالية: ${names()}\nللتغيير اكتب مثلاً: /gold أو /eur أو /gbp /jpy /aud /cad /chf (تكدر تكتب أكثر من زوج بنفس الرسالة: /gold /eur) أو /all للكل. /list لعرض الحالي.\nلضبط فرق السعر مع وسيطك: /offset gold 2.5`); continue; }
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
    const cs = await loadAll(sym);
    if (cs.length < 250) { console.error(sym, 'data error: not enough data'); continue; }
    // الأدوات تحلل آخر 300 شمعة، والتحليل التاريخي يفحص كل الشموع (حتى 10,000) ويدخل بقاعدة الأغلبية
    let h;
    try { const Pp = Hist.prep(cs); h = Hist.query(Pp, Pp.n - 1); h.data = cs.length; } catch (e) { h = { status: 'insufficient', reason: e.message }; }
    const R = Hist.gate(analyze(cs.slice(-300), P[sym], now), h, HW, cfg.minConf), last = state.pairs[sym] || 'wait';
    console.log(`${sym} side=${R.side} score=${R.sc} hist=${h.status === 'ok' ? h.up + 'up/' + h.dn + 'dn of ' + h.cases : h.status} last=${last} ${R.why}`);
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
if (changed) fs.writeFileSync('state.json', JSON.stringify({ pairs: state.pairs, sel: state.sel, off: state.off, offs: state.offs, at: new Date().toISOString() }));
