// إرسال تيليجرام لصفحة signals.html (يعتمد على قرار التحليل نفسه في الصفحة)
(function(){
const g=k=>{try{return localStorage.getItem(k)||''}catch(e){return''}},s=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const $=id=>document.getElementById(id);
const box=document.createElement('section');
box.innerHTML='<div class="box"><button id="sclose" class="alt" style="float:left;padding:2px 12px" aria-label="إغلاق">✕</button><h3 style="margin-top:0">الإعدادات - إرسال تيليجرام</h3><div class="row"><label>توكن البوت<input id="tk" type="password" autocomplete="off"></label><label>رقم الشات (Chat ID)<input id="ch" inputmode="numeric" autocomplete="off"></label><button id="tgtest" class="alt">رسالة اختبار</button></div><label style="display:flex;grid-auto-flow:column;align-items:center;gap:6px;margin-top:10px"><input type="checkbox" id="atg">إرسال تلقائي لكل إشارة دخول جديدة</label><p style="color:var(--mute);font-size:13px">يُرسل فقط عندما يكون القرار شراء أو بيع (قوة التوافق 70% أو أكثر). يشتغل والصفحة مفتوحة. إذا فعّلت التشغيل على GitHub فلا تفعّل هذا معه حتى لا تتكرر الرسائل.</p><p id="tgm" style="font-size:14px"></p>'+
'<h3 style="margin:16px 0 4px">ربط بوت الـ 24 ساعة بالزوج المختار</h3><label>توكن GitHub (صلاحية Actions فقط)<input id="gtk" type="password" autocomplete="off"></label><label style="display:flex;grid-auto-flow:column;align-items:center;gap:6px;margin-top:8px"><input type="checkbox" id="gsy">خلّي البوت يرسل صفقات الزوج المختار فقط</label><p style="color:var(--mute);font-size:13px">أي زوج تختاره من القائمة الرئيسية ينتقل له البوت خلال دقيقة. التوكن ينحفظ بمتصفحك فقط.</p><p id="gm" style="font-size:14px"></p>'+
'<h3 style="margin:16px 0 4px">فرق السعر مع وسيطك</h3><p id="offm" style="color:var(--mute);font-size:13px">يتحمل...</p></div>';
// لوحة الإعدادات: نافذة صغيرة مخفية، تنفتح من زر ⚙️ أعلى يمين الصفحة
box.id='settings';box.hidden=true;
box.style.cssText='position:fixed;top:56px;left:8px;right:8px;max-width:520px;margin:0 auto;max-height:80vh;overflow:auto;z-index:50;padding:0;border-radius:6px;box-shadow:0 8px 30px rgba(0,0,0,.35)';
document.body.appendChild(box);
const hd=document.querySelector('header'),gear=document.createElement('button');
gear.type='button';gear.textContent='⚙️ الإعدادات';gear.setAttribute('aria-label','الإعدادات');
gear.style.cssText='background:transparent;color:#cfe0e8;border:1px solid #cfe0e8;padding:3px 12px;font-size:14px;flex:none';
gear.onclick=()=>{box.hidden=!box.hidden};
hd.prepend(gear);
$('sclose').onclick=()=>{box.hidden=true};
document.addEventListener('keydown',e=>{if(e.key==='Escape')box.hidden=true});
$('tk').value=g('tg_tk');$('ch').value=g('tg_ch');$('atg').checked=g('tg_auto')==='1';
$('gtk').value=g('gh_tk');$('gsy').checked=g('gh_sy')==='1';
const say=(t,bad)=>{$('tgm').style.color=bad?'var(--red)':'var(--teal)';$('tgm').textContent=t};
const gsay=(t,bad)=>{$('gm').style.color=bad?'var(--red)':'var(--teal)';$('gm').textContent=t};
async function tg(text){const t=$('tk').value.trim(),c=$('ch').value.trim();if(!t||!c)throw new Error('عبّي توكن البوت ورقم الشات');s('tg_tk',t);s('tg_ch',c);
const r=await fetch('https://api.telegram.org/bot'+t+'/sendMessage?chat_id='+encodeURIComponent(c)+'&text='+encodeURIComponent(text));const j=await r.json();if(!j.ok)throw new Error(j.description||'خطأ تيليجرام')}
// فرق السعر بين Twelve Data ووسيطك (بالدولار): يُقرأ من config.json (offsets) ومن state.json (offs) اللي يتغير بأمر /offset بتلي
let OFFS={};
async function loadOffs(){try{const c=await(await fetch('config.json?'+Date.now())).json(),st=await(await fetch('state.json?'+Date.now())).json();OFFS={...(c.offsets||{}),...(st.offs||{})}}catch(e){}
const t=Object.keys(OFFS).filter(k=>OFFS[k]).map(k=>(P[k]?P[k].n:k)+': '+(OFFS[k]>0?'+':'')+OFFS[k]+'$').join('، ');
$('offm').textContent=(t?'الفروق الحالية: '+t+'. ':'ما فيه فرق مضبوط. ')+'لضبطه اكتب للبوت بتلي: /offset gold 2.5 (الرقم = سعر وسيطك ناقص سعر الموقع بالدولار)، و/offset gold 0 لإلغائه. يتطبق على الموقع والرسائل خلال دقايق.'}
loadOffs();setInterval(loadOffs,6e5);
// رسالة واحدة واضحة: صفقة واحدة فقط (دخول، استوب، هدف 1، هدف 2) بنقاط MT5 من المحرك (700 إلى 1500)
function msg(sym,R){const f=x=>x.toFixed(P[sym].d),e=R.px,pt=R.pts;
return (R.side==='buy'?'🟢 شراء ':'🔴 بيع ')+P[sym].n+' '+sym+' ('+$('tf').selectedOptions[0].text+') | قوة التوافق '+R.sc+'%\n\n1. الدخول: '+f(e)+'\n2. الاستوب: '+f(R.sl)+' ('+pt.sl+' نقطة)\n3. الهدف 1: '+f(R.tp1)+' ('+pt.tp1+' نقطة)\n4. الهدف 2: '+f(R.tp2)+' ('+pt.tp2+' نقطة)\n\n⚠️ إشارة تعليمية، خاطر بـ 1% أو أقل.'}
async function maybe(sym,R){s('tg_auto',$('atg').checked?'1':'0');if(!$('atg').checked)return;
const k='tg_last_'+sym,last=g(k)||'wait';if(R.side===last)return;
if(R.side==='wait'){s(k,'wait');return}
try{await tg(msg(sym,R));s(k,R.side);say('أُرسلت صفقة '+sym+' ('+(R.side==='buy'?'شراء':'بيع')+')')}catch(e){say('تيليجرام: '+e.message,1)}}
const _an=analyze;
analyze=function(v,pr,now){const R=_an(v,pr,now),sym=Object.keys(P).find(x=>P[x]===pr),o=OFFS[sym]||0;R.sym=sym;R.off=o;
if(o)['px','sl','tp1','tp2','hh','ll'].forEach(k=>{if(typeof R[k]==='number')R[k]+=o});
maybe(sym,R);return R};
const _show=show;
show=function(sym,R){_show(sym,R);
// الدخول يعتمد على نسبة التوافق فقط: نشيل عبارة (المطلوب 6 على الأقل) القديمة من الملاحظة
$('out').querySelectorAll('p').forEach(p=>{if(p.textContent.includes('المطلوب 6 على الأقل'))p.textContent=p.textContent.replace(/\s*وزن نقاط الدخول المتفقة[^.]*\./,'').trim()});
if(R.off){const n=document.createElement('p');n.style.cssText='color:var(--mute);font-size:13px;margin-top:6px';n.textContent='الأسعار معدلة بفرق '+(R.off>0?'+':'')+R.off+'$ لتطابق وسيطك.';$('out').appendChild(n)}
if(R.side==='wait')return;const b=document.createElement('button');b.textContent='أرسل هذي الصفقة لتيليجرام';b.style.marginTop='10px';
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
