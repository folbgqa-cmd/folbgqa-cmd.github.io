import fs from 'fs';

// يضبط الزوج المختار من الموقع (workflow_dispatch input: pair) قبل تشغيل التحليل
const PAIR = (process.env.PAIR || '').trim();
const ALL = ['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF'];
if (!PAIR || (PAIR !== 'all' && !ALL.includes(PAIR))) { console.log('no pair selection'); process.exit(0); }

let cfg = {}, state = {};
try { cfg = JSON.parse(fs.readFileSync('config.json', 'utf8')); } catch { }
try { state = JSON.parse(fs.readFileSync('state.json', 'utf8')); } catch { }
state.pairs ||= {};

const act = s => { const x = s ?? cfg.pairs; return Array.isArray(x) && x.length ? x.filter(p => ALL.includes(p)) : ALL; };
const before = act(state.sel);
state.sel = PAIR === 'all' ? 'all' : [PAIR];
// الزوج الجديد يبدأ من "انتظر" حتى ترسل صفقته الحالية إذا كانت محققة الشروط
for (const p of act(state.sel)) if (!before.includes(p)) state.pairs[p] = 'wait';
fs.writeFileSync('state.json', JSON.stringify({ pairs: state.pairs, sel: state.sel, off: state.off, at: new Date().toISOString() }));
console.log('selection:', JSON.stringify(state.sel));

const { TG_TOKEN, TG_CHAT } = process.env;
if (TG_TOKEN && TG_CHAT) {
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text: `✅ التنبيهات صارت لـ: ${PAIR === 'all' ? 'كل الأزواج' : PAIR} (من الموقع)` })
    });
  } catch { }
}
