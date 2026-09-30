// إرسال تيليجرام لصفحة signals.html (يعتمد على قرار التحليل نفسه في الصفحة)
(function(){
const g=k=>{try{return localStorage.getItem(k)||''}catch(e){return''}},s=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const $=id=>document.getElementById(id);
const box=document.createElement('section');
box.innerHTML='<div class="box"><h3 style="margin-top:0">إرسال تيليجرام</h3><div class="row"><label>توكن البوت<input id="tk" type="password" autocomplete="off"></label><label>رقم الشات (Chat ID)<input id="ch" inputmode="numeric" autocomplete="off"></label><button id="tgtest" class="alt">رسالة اختبار</button></div><label style="display:flex;grid-auto-flow:column;align-items:center;gap:6px;margin-top:10px"><input type="checkbox" id="atg">إرسال تلقائي لكل إشارة دخول جديدة</label><p style="color:var(--mute);font-size:13px">يُرسل فقط عندما يكون القرار شراء أو بيع (قوة التوافق 70% أو أكثر). يشتغل والصفحة مفتوحة. إذا فعّلت التشغيل على GitHub فلا تفعّل هذا معه حتى لا تتكرر الرسائل.</p><p id="tgm" style="font-size:14px"></p>'+
'<h3 style="margin:16px 0 4px">ربط بوت الـ 24 ساعة بالزوج المختار</h3><label>توكن GitHub (صلاحية Actions فقط)<input id="gtk" type="password" autocomplete="off"></label><label style="display:flex;grid-auto-flow:column;align-items:center;gap:6px;margin-top:8px"><input type="checkbox" id="gsy">خلّي البوت يرسل صفقات الزوج المختار فقط</label><p style="color:var(--mute);font-size:13px">أي زوج تختاره من القائمة فوق ينتقل له البوت خلال دقيقة. التوكن ينحفظ بمتصفحك فقط.</p><p id="gm" style="font-size:14px"></p></div>';
// لوحة الإعدادات مخفية افتراضياً وتنفتح من زر ⚙️ في الشريط العلوي
box.id='settings';box.hidden=true;
const first=document.querySelector('section');first.after(box);
const hd=document.querySelector('header'),gear=document.createElement('a');
gear.href='#settings';gear.textContent='⚙️ الإعدادات';gear.style.cursor='pointer';
gear.onclick=e=>{e.preventDefault();box.hidden=!box.hidden;if(!box.hidden)box.scrollIntoView({behavior:'smooth'})};
hd.appendChild(gear);
if(location.hash==='#settings')box.hidden=false;
$('tk').value=g('tg_tk');$('ch').value=g('tg_ch');$('atg').checked=g('tg_auto')==='1';
$('gtk').value=g('gh_tk');$('gsy').checked=g('gh_sy')==='1';
const say=(t,bad)=>{$('tgm').style.color=bad?'var(--red)':'var(--teal)';$('tgm').textContent=t};
const gsay=(t,bad)=>{$('gm').style.color=bad?'var(--red)':'var(--teal)';$('gm').textContent=t};
async function tg(text){const t=$('tk').value.trim(),c=$('ch').value.trim();if(!t||!c)throw new Error('عبّي توكن البوت ورقم الشات');s('tg_tk',t);s('tg_ch',c);
const r=await fetch('https://api.telegram.org/bot'+t+'/sendMessage?chat_id='+encodeURIComponent(c)+'&text='+encodeURIComponent(text));const j=await r.json();if(!j.ok)throw new Error(j.description||'خطأ تيليجرام')}
function msg(sym,R){const d=P[sym].d,f=x=>x.toFixed(d),k=R.a*1.5,sg=R.d;
const st=R.side==='buy'?R.hh+R.a*.1:R.ll-R.a*.1;
const lv=(e)=>'دخول '+f(e)+' | وقف '+f(e-sg*k)+' | هدف1 '+f(e+sg*k*2)+' | هدف2 '+f(e+sg*k*3);
const why=R.F.filter(x=>x.p>0).map(x=>x.n+': '+x.w).join('\n');
return (R.side==='buy'?'🟢 شراء ':'🔴 بيع ')+P[sym].n+' '+sym+' ('+$('tf').selectedOptions[0].text+')\nقوة التوافق: '+R.sc+'%\n\nصفقة فورية:\n'+lv(R.px)+'\n\n'+(R.side==='buy'?'Buy Stop':'Sell Stop')+' (اختراق):\n'+lv(st)+'\n\n'+why+'\n\n⚠️ قوة التوافق ليست احتمال ربح. إشارة تعليمية، وحدد المخاطرة بـ 1% أو أقل.'}
async function maybe(sym,R){s('tg_auto',$('atg').checked?'1':'0');if(!$('atg').checked)return;
const k='tg_last_'+sym,last=g(k)||'wait';if(R.side===last)return;
if(R.side==='wait'){s(k,'wait');return}
try{await tg(msg(sym,R));s(k,R.side);say('أُرسلت صفقة '+sym+' ('+(R.side==='buy'?'شراء':'بيع')+')')}catch(e){say('تيليجرام: '+e.message,1)}}
const _an=analyze;
analyze=function(v,pr,now){const R=_an(v,pr,now),sym=Object.keys(P).find(x=>P[x]===pr);R.sym=sym;maybe(sym,R);return R};
const _show=show;
show=function(sym,R){_show(sym,R);if(R.side==='wait')return;const b=document.createElement('button');b.textContent='أرسل هذي الصفقة لتيليجرام';b.style.marginTop='10px';
b.onclick=async()=>{try{await tg(msg(sym,R));say('أُرسلت الصفقة لتيليجرام')}catch(e){say('تيليجرام: '+e.message,1)}};$('out').appendChild(b)};
$('tgtest').onclick=async()=>{try{await tg('✅ اختبار: الربط مع تيليجرام يشتغل');say('أُرسلت رسالة الاختبار')}catch(e){say('تيليجرام: '+e.message,1)}};
// ربط البوت بالزوج المختار: يشغّل workflow على GitHub مع الزوج كمدخل
async function dispatch(pair){const t=$('gtk').value.trim();if(!t)throw new Error('الصق توكن GitHub أولاً');s('gh_tk',t);
const r=await fetch('https://api.github.com/repos/folbgqa-cmd/folbgqa-cmd.github.io/actions/workflows/signals.yml/dispatches',{method:'POST',headers:{'Authorization':'Bearer '+t,'Accept':'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify({ref:'main',inputs:{pair}})});
if(r.status===204)return;
throw new Error(r.status===401||r.status===403||r.status===404?'GitHub رفض التوكن ('+r.status+'). تأكد من صلاحية Actions على هذا الريبو':r.status===422?'عدّل ملف signals.yml ليقبل الزوج (pair) ثم جرب':'خطأ GitHub '+r.status)}
async function sync(){s('gh_tk',$('gtk').value.trim());s('gh_sy',$('gsy').checked?'1':'0');if(!$('gsy').checked){gsay('تم إيقاف الربط. البوت يبقى على آخر زوج اخترته.');return}
const p=$('pair').value;try{await dispatch(p);gsay('أُرسل الطلب: البوت صار على '+P[p].n+' وبيتحدث خلال دقيقة')}catch(e){gsay(e.message,1)}}
$('gsy').onchange=sync;$('gtk').onchange=()=>s('gh_tk',$('gtk').value.trim());$('pair').addEventListener('change',()=>{if($('gsy').checked)sync()});
})();
