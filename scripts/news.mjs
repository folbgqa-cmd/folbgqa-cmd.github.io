import fs from 'fs';

// يجلب تقويم الأخبار الاقتصادية ويحفظه بـ news.json ليقرأه الموقع (المتصفح ما يقدر يجلبه مباشرة بسبب CORS)
const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
if (!r.ok) { console.error('news fetch failed', r.status); process.exit(1); }
const all = await r.json();
const events = all
  .filter(e => e.impact === 'High' || e.impact === 'Medium')
  .map(e => ({ title: e.title, country: e.country, date: e.date, impact: e.impact, forecast: e.forecast || '', previous: e.previous || '' }));
fs.writeFileSync('news.json', JSON.stringify({ updated: new Date().toISOString(), events }));
console.log('saved', events.length, 'events');
