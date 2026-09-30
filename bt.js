// اختبار تاريخي: يطبّق نفس تحليل الصفحة على شموع سابقة ويقيس نسبة النجاح الفعلية
(function(){
const $=id=>document.getElementById(id);
const host=document.querySelector('#settings .box');
if(!host||!window.rawAnalyze)return;
const sec=document.createElement('div');
sec.innerHTML='<h3 style="margin:18px 0 4px">اختبار تاريخي</h3><p style="color:var(--mute);font-size:13px">يطبّق نفس التحليل وبنفس حد 70% على آخر ~5000 شمعة للفريم المختار، ويحسب كم صفقة طلعت وكم منها وصلت الهدف 1 قبل الوقف. ياخذ حوالي دقيقة. الأخبار غير محسوبة بالاختبار، والنتائج السابقة لا تضمن المستقبل.</p><button id="btgo" class="alt">ابدأ الاختبار</button><p id="btm" style="font-size:14px"></p><div class="wrap"><table id="bttb" hidden><thead><tr><th>الزوج</th><th>صفقات</th><th>ربح</th><th>خسارة</th><th>النسبة</th><th>صافي (R)</th></tr></thead><tbody></tbody></table></div>';
host.appendChild(sec);
async function load(sym,tf,k){
const r=await fetch('https://api.twelvedata.com/time_series?symbol='+encodeURIComponent(sym)+'&interval='+tf+'&outputsize=5000&apikey='+k);
const j=await r.json();
if(j.status==='error'||!j.values)throw new Error(j.code===429?'وصلت حد الاستخدام المجاني. انتظر دقيقة وجرب.':(j.message||'فشل جلب البيانات'));
return j.values.slice().reverse()}
function test(v,pr){
const H=48,W=300,n=v.length,hi=v.map(x=>+x.high),lo=v.map(x=>+x.low);
let w=0,l=0,i=W;
const old=EV;EV=[];
try{
while(i<n-1){
const R=window.rawAnalyze(v.slice(i-W+1,i+1),pr,Date.parse(v[i].datetime.replace(' ','T')+'Z'));
if(R.side==='wait'){i++;continue}
const b=R.side==='buy';let res=0,j=i+1;
for(;j<=Math.min(n-1,i+H);j++){
const sl=b?lo[j]<=R.sl:hi[j]>=R.sl,tp=b?hi[j]>=R.tp1:lo[j]<=R.tp1;
if(sl){res=-1;break}
if(tp){res=1;break}}
if(res===1)w++;else if(res===-1)l++;
i=res?j+1:i+H}
}finally{EV=old}
return{w,l}}
function row(s,w,l){const t=w+l,pc=t?(w/t*100).toFixed(0)+'%':'-',r=t?String(w*2-l):'-';return '<tr><td>'+s+'</td><td>'+t+'</td><td>'+w+'</td><td>'+l+'</td><td>'+pc+'</td><td>'+r+'</td></tr>'}
$('btgo').onclick=async()=>{
const k=$('key').value.trim(),tf=$('tf').value,m=$('btm'),tb=$('bttb'),body=tb.tBodies[0];
if(!k){m.style.color='var(--red)';m.textContent='أدخل مفتاح Twelve Data أولاً';return}
$('btgo').disabled=true;body.innerHTML='';tb.hidden=false;m.style.color='';m.textContent='جاري الاختبار...';
let TW=0,TL=0,i=0;
try{
for(const sym of Object.keys(P)){
if(i++)await new Promise(r=>setTimeout(r,7500));
m.textContent='يفحص '+sym+' ...';
const v=await load(sym,tf,k);
await new Promise(r=>setTimeout(r,30));
const x=test(v,P[sym]);TW+=x.w;TL+=x.l;
body.insertAdjacentHTML('beforeend',row(sym,x.w,x.l))}
body.insertAdjacentHTML('beforeend',row('المجموع',TW,TL));
m.style.color='var(--teal)';
m.textContent='انتهى. مع هدف 1:2 يكفي نجاح 34% تقريباً للتعادل.'+((TW+TL)<30?' العينة صغيرة، لا تعتمد عليها.':'')
}catch(e){m.style.color='var(--red)';m.textContent=e.message}
finally{$('btgo').disabled=false}}
})();
