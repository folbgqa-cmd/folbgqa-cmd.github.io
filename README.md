<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>سجلاتي</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>
:root {
  --bg:#f0f4f8;--white:#fff;--border:#d1d9e0;
  --accent:#2563eb;--accent-light:#eff6ff;
  --red:#ef4444;--green:#10b981;--yellow:#f59e0b;
  --text:#1e293b;--muted:#94a3b8;
  --hdr:#1e293b;--hdr2:#334155;
}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);font-family:'Tajawal',sans-serif;color:var(--text);min-height:100vh}

/* TOP BAR */
.topbar{background:var(--hdr);padding:0 14px;height:52px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:200;box-shadow:0 2px 8px rgba(0,0,0,.25)}
.logo{color:#fff;font-size:17px;font-weight:800}.logo span{color:#60a5fa}
.btn{padding:7px 14px;border-radius:8px;border:none;cursor:pointer;font-family:'Tajawal',sans-serif;font-size:13px;font-weight:600;transition:all .15s}
.btn-primary{background:var(--accent);color:#fff}.btn-primary:hover{background:#1d4ed8}
.btn-danger{background:var(--red);color:#fff}
.btn-ghost{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2)}
.btn-ghost:hover{background:rgba(255,255,255,.2)}
.btn-sm{padding:4px 10px;font-size:12px;border-radius:6px}
.btn-yellow{background:var(--yellow);color:#fff}

/* RATES BAR */
.rates-bar{background:#0f172a;padding:6px 14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid #1e293b}
.rate-item{display:flex;align-items:center;gap:6px;font-size:12px;color:#94a3b8}
.rate-item label{color:#64748b;font-size:11px}
.rate-input{background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-family:'Tajawal',sans-serif;font-size:12px;padding:3px 8px;width:90px;outline:none;text-align:center}
.rate-flag{font-size:15px}

/* CANVAS */
.canvas{padding:18px 14px;display:flex;flex-direction:column;gap:22px}
.empty-state{text-align:center;padding:70px 20px;color:var(--muted)}
.empty-state .icon{font-size:56px;margin-bottom:14px}
.empty-state p{font-size:15px;margin-bottom:18px}

/* TABLE BLOCK */
.table-block{background:var(--white);border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,.08);overflow:hidden;border:1px solid var(--border)}
.tbl-header{background:var(--hdr);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.tbl-name-input{background:transparent;border:none;color:#fff;font-family:'Tajawal',sans-serif;font-size:16px;font-weight:700;outline:none;flex:1;min-width:100px}
.tbl-name-input::placeholder{color:rgba(255,255,255,.35)}
.tbl-actions{display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap}

/* CURRENCY BADGE */
.cur-select{background:#1e293b;border:1px solid #475569;border-radius:7px;color:#e2e8f0;font-family:'Tajawal',sans-serif;font-size:13px;font-weight:700;padding:4px 10px;outline:none;cursor:pointer}

/* TABLE */
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;min-width:200px}
thead tr{background:var(--hdr2)}
thead th{padding:0;border-left:1px solid rgba(255,255,255,.08);min-width:110px}
thead th:last-child{border-left:none}
.th-inner{display:flex;align-items:center}
.th-type{display:flex;align-items:center;flex-direction:column;width:100%}
.col-name-input{background:transparent;border:none;color:#e2e8f0;font-family:'Tajawal',sans-serif;font-size:13px;font-weight:700;padding:8px 8px 4px;outline:none;width:100%;text-align:right}
.col-name-input::placeholder{color:rgba(255,255,255,.3)}
.col-type-select{background:transparent;border:none;border-top:1px solid rgba(255,255,255,.08);color:#94a3b8;font-family:'Tajawal',sans-serif;font-size:11px;padding:3px 8px;outline:none;cursor:pointer;width:100%;text-align:right}
.col-type-select option{background:#334155;color:#e2e8f0}
.col-del{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.2);padding:4px 6px;font-size:13px;flex-shrink:0;transition:color .15s;align-self:flex-start;margin-top:6px}
.col-del:hover{color:#f87171}
.add-col-th{background:var(--hdr2);padding:6px;border-left:1px solid rgba(255,255,255,.08);width:38px;vertical-align:middle}
.add-col-btn{background:rgba(255,255,255,.1);border:1px dashed rgba(255,255,255,.3);border-radius:6px;color:#fff;cursor:pointer;font-size:18px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;transition:all .15s}
.add-col-btn:hover{background:rgba(255,255,255,.22)}

/* BODY */
tbody tr{border-top:1px solid var(--border)}
tbody tr:hover{filter:brightness(.97)}
tbody td{padding:0;border-left:1px solid var(--border)}
tbody td:last-child{border-left:none}
.cell-input{background:transparent;border:none;font-family:'Tajawal',sans-serif;font-size:13px;padding:8px 10px;outline:none;width:100%;color:var(--text);text-align:right}
.cell-input:focus{background:var(--accent-light)}
.cell-input.num{color:#1d4ed8;font-weight:600}
.cell-input.num:focus{background:#eff6ff}
.row-color-td{width:30px;padding:0 !important;border-left:none !important}
.row-color-btn{width:30px;height:100%;min-height:38px;border:none;cursor:pointer;opacity:.7;transition:opacity .15s}
.row-color-btn:hover{opacity:1}
.row-del-td{width:30px;padding:0 !important;border-left:none !important}
.row-del-btn{background:none;border:none;cursor:pointer;color:var(--muted);font-size:13px;width:30px;height:38px;display:flex;align-items:center;justify-content:center;transition:color .15s}
.row-del-btn:hover{color:var(--red)}

/* ADD ROW */
.add-row-bar{padding:7px 12px;border-top:1px solid var(--border)}
.add-row-btn{background:none;border:1px dashed var(--border);border-radius:8px;color:var(--muted);cursor:pointer;font-family:'Tajawal',sans-serif;font-size:13px;padding:7px 14px;width:100%;text-align:right;transition:all .15s}
.add-row-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-light)}

/* SUMMARY */
.tbl-summary{border-top:1px solid var(--border);padding:10px 14px;background:#f8fafc}
.summary-title{font-size:12px;color:var(--muted);font-weight:700;margin-bottom:8px}
.summary-grid{display:flex;gap:10px;flex-wrap:wrap}
.s-card{background:#fff;border:1px solid var(--border);border-radius:10px;padding:8px 12px;min-width:100px}
.s-card-label{font-size:11px;color:var(--muted);margin-bottom:3px}
.s-card-val{font-size:15px;font-weight:800;color:var(--text)}
.s-card-subs{margin-top:4px;display:flex;flex-direction:column;gap:2px}
.s-sub{font-size:11px;color:var(--muted)}
.s-sub span{font-weight:700}
.s-sub .iqd{color:#10b981}
.s-sub .usd{color:#2563eb}
.s-sub .eur{color:#7c3aed}

/* COLOR PALETTE */
.color-panel{display:none;position:absolute;z-index:300;background:#fff;border:1px solid var(--border);border-radius:10px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,.15);display:none;flex-wrap:wrap;gap:6px;width:170px}
.color-panel.open{display:flex}
.cp-swatch{width:26px;height:26px;border-radius:6px;border:2px solid transparent;cursor:pointer;transition:transform .15s}
.cp-swatch:hover{transform:scale(1.2)}
.cp-swatch.selected{border-color:#1e293b}

/* MODAL */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:400;align-items:center;justify-content:center}
.overlay.open{display:flex}
.modal{background:#fff;border-radius:16px;padding:22px;width:90%;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.modal h3{font-size:17px;font-weight:700;margin-bottom:14px}
.modal input,.modal select{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-family:'Tajawal',sans-serif;font-size:15px;outline:none;margin-bottom:12px}
.modal input:focus,.modal select:focus{border-color:var(--accent)}
.modal-btns{display:flex;gap:8px;justify-content:flex-end}
.btn-cancel{background:#f1f5f9;color:#64748b}
.btn-cancel:hover{background:#e2e8f0}

@media print{.topbar,.rates-bar,.tbl-actions,.col-del,.add-col-th,.row-color-td,.row-del-td,.add-row-bar,.btn{display:none!important}body{background:#fff}.table-block{box-shadow:none}}
</style>
</head>
<body>

<div class="topbar">
  <div class="logo">📋 <span>سجلاتي</span></div>
  <div style="display:flex;gap:6px">
    <button class="btn btn-ghost btn-sm" onclick="window.print()">🖨</button>
    <button class="btn btn-primary" onclick="openModal()">+ جدول جديد</button>
  </div>
</div>

<!-- RATES BAR -->
<div class="rates-bar">
  <span style="color:#60a5fa;font-size:12px;font-weight:700">أسعار الصرف:</span>
  <div class="rate-item">
    <span class="rate-flag">🇮🇶</span>
    <label>1 USD =</label>
    <input class="rate-input" id="rate-usd" type="number" value="1310" oninput="saveRates();renderAll()">
    <span style="color:#e2e8f0;font-size:11px">د.ع</span>
  </div>
  <div class="rate-item">
    <span class="rate-flag">🇪🇺</span>
    <label>1 EUR =</label>
    <input class="rate-input" id="rate-eur" type="number" value="1420" oninput="saveRates();renderAll()">
    <span style="color:#e2e8f0;font-size:11px">د.ع</span>
  </div>
  <span style="color:#475569;font-size:11px">— غيّر الأرقام حسب سعر اليوم</span>
</div>

<div class="canvas" id="canvas">
  <div class="empty-state" id="empty-state">
    <div class="icon">📋</div>
    <p>ابدأ بإضافة جدول جديد</p>
    <button class="btn btn-primary" onclick="openModal()">+ أضف جدول</button>
  </div>
</div>

<div class="overlay" id="modal">
  <div class="modal">
    <h3>جدول جديد</h3>
    <input type="text" id="modal-name" placeholder="اسم الجدول..." maxlength="50">
    <select id="modal-cur">
      <option value="IQD">🇮🇶 دينار عراقي (IQD)</option>
      <option value="USD">🇺🇸 دولار (USD)</option>
      <option value="EUR">🇪🇺 يورو (EUR)</option>
    </select>
    <div class="modal-btns">
      <button class="btn btn-cancel" onclick="closeModal()">إلغاء</button>
      <button class="btn btn-primary" onclick="confirmAdd()">إنشاء</button>
    </div>
  </div>
</div>

<script>
const COLORS = ['#ffffff','#fef9c3','#dcfce7','#dbeafe','#fce7f3','#f3e8ff','#ffedd5','#fee2e2','#e0f2fe','#d1fae5','#1e293b','#374151'];
const CUR_SYMBOLS = {IQD:'د.ع', USD:'$', EUR:'€'};

let data = JSON.parse(localStorage.getItem('sijilati4')||'[]');
let rates = JSON.parse(localStorage.getItem('sijilati4_rates')||'{"usd":1310,"eur":1420}');

// load rates into inputs
document.getElementById('rate-usd').value = rates.usd;
document.getElementById('rate-eur').value = rates.eur;

function saveRates(){
  rates.usd = parseFloat(document.getElementById('rate-usd').value)||1310;
  rates.eur = parseFloat(document.getElementById('rate-eur').value)||1420;
  localStorage.setItem('sijilati4_rates', JSON.stringify(rates));
}

function save(){ localStorage.setItem('sijilati4', JSON.stringify(data)); }

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function toIQD(val, cur){
  if(cur==='IQD') return val;
  if(cur==='USD') return val * rates.usd;
  if(cur==='EUR') return val * rates.eur;
  return val;
}
function fromIQD(val, cur){
  if(cur==='IQD') return val;
  if(cur==='USD') return val / rates.usd;
  if(cur==='EUR') return val / rates.eur;
  return val;
}
function fmtNum(n, decimals=0){ return n.toLocaleString('ar-IQ',{maximumFractionDigits:decimals}); }

function renderAll(){
  data.forEach((_,ti) => { refreshSummary(ti); });
}

function render(){
  const canvas = document.getElementById('canvas');
  document.getElementById('empty-state').style.display = data.length?'none':'block';
  canvas.querySelectorAll('.table-block').forEach(b=>b.remove());
  data.forEach((t,ti) => buildBlock(t,ti,canvas));
}

function buildBlock(tbl, ti, canvas){
  const block = document.createElement('div');
  block.className = 'table-block';

  block.innerHTML = `
    <div class="tbl-header">
      <input class="tbl-name-input" value="${esc(tbl.name)}" placeholder="اسم الجدول..."
        oninput="data[${ti}].name=this.value;save()">
      <div class="tbl-actions">
        <select class="cur-select" onchange="data[${ti}].cur=this.value;save();refreshSummary(${ti})" title="عملة الجدول">
          <option value="IQD" ${tbl.cur==='IQD'?'selected':''}>🇮🇶 IQD</option>
          <option value="USD" ${tbl.cur==='USD'?'selected':''}>🇺🇸 USD</option>
          <option value="EUR" ${tbl.cur==='EUR'?'selected':''}>🇪🇺 EUR</option>
        </select>
        <button class="btn btn-danger btn-sm" onclick="delTable(${ti})">حذف</button>
      </div>
    </div>
    <div class="tbl-wrap">
      <table>
        <thead><tr id="thead-${tbl.id}"></tr></thead>
        <tbody id="tbody-${tbl.id}"></tbody>
      </table>
    </div>
    <div class="add-row-bar">
      <button class="add-row-btn" onclick="addRow(${ti})">+ إضافة صف جديد</button>
    </div>
    <div class="tbl-summary" id="summary-${tbl.id}">
      <div class="summary-title">📊 الإحصائيات</div>
      <div class="summary-grid" id="sgrid-${tbl.id}"></div>
    </div>`;

  canvas.appendChild(block);
  refreshHead(ti);
  refreshBody(ti);
  refreshSummary(ti);
}

function refreshHead(ti){
  const tbl = data[ti];
  const tr = document.getElementById('thead-'+tbl.id);
  if(!tr) return;
  tr.innerHTML = '';

  // color col header
  const colorTh = document.createElement('th');
  colorTh.style.cssText = 'width:30px;background:'+tbl.cur==='IQD'?'':'';
  colorTh.innerHTML = '<div style="width:30px;height:42px;background:var(--hdr2)"></div>';
  tr.appendChild(colorTh);

  tbl.cols.forEach((col,ci)=>{
    const th = document.createElement('th');
    th.innerHTML = `
      <div class="th-inner">
        <div class="th-type" style="width:100%">
          <input class="col-name-input" value="${esc(col.name)}" placeholder="عنوان..."
            oninput="data[${ti}].cols[${ci}].name=this.value;save();refreshSummary(${ti})">
          <select class="col-type-select" onchange="data[${ti}].cols[${ci}].type=this.value;save();refreshBody(${ti});refreshSummary(${ti})">
            <option value="text" ${col.type==='text'?'selected':''}>نص</option>
            <option value="number" ${col.type==='number'?'selected':''}>رقم / مبلغ</option>
            <option value="count" ${col.type==='count'?'selected':''}>عدد</option>
            <option value="date" ${col.type==='date'?'selected':''}>تاريخ</option>
          </select>
        </div>
        <button class="col-del" onclick="delCol(${ti},${ci})">✕</button>
      </div>`;
    tr.appendChild(th);
  });

  const addTh = document.createElement('th');
  addTh.className = 'add-col-th';
  addTh.innerHTML = `<button class="add-col-btn" onclick="addCol(${ti})">+</button>`;
  tr.appendChild(addTh);

  // del col header
  const delTh = document.createElement('th');
  delTh.style.cssText = 'width:30px;background:var(--hdr2)';
  tr.appendChild(delTh);
}

function refreshBody(ti){
  const tbl = data[ti];
  const tbody = document.getElementById('tbody-'+tbl.id);
  if(!tbody) return;
  tbody.innerHTML = '';

  tbl.rows.forEach((row,ri)=>{
    const tr = document.createElement('tr');
    const bg = row._color || '#ffffff';
    tr.style.background = bg;

    // Color button
    const colorTd = document.createElement('td');
    colorTd.className = 'row-color-td';
    const colorBtn = document.createElement('button');
    colorBtn.className = 'row-color-btn';
    colorBtn.style.background = bg;
    colorBtn.title = 'لون الصف';
    colorBtn.onclick = (e) => showColorPicker(e, ti, ri, colorBtn, tr);
    colorTd.appendChild(colorBtn);
    tr.appendChild(colorTd);

    tbl.cols.forEach((col,ci)=>{
      const td = document.createElement('td');
      const isNum = col.type==='number'||col.type==='count';
      if(col.type==='date'){
        td.innerHTML = `<input class="cell-input" type="date" value="${esc(row.cells[ci]||'')}"
          oninput="data[${ti}].rows[${ri}].cells[${ci}]=this.value;save()">`;
      } else {
        td.innerHTML = `<input class="cell-input${isNum?' num':''}" type="${isNum?'number':'text'}" 
          value="${esc(row.cells[ci]||'')}" placeholder="-"
          oninput="data[${ti}].rows[${ri}].cells[${ci}]=this.value;save();refreshSummary(${ti})"
          onkeydown="cellKey(event,${ti},${ri},${ci})">`;
      }
      tr.appendChild(td);
    });

    // spacer
    tr.appendChild(document.createElement('td'));

    // del row
    const delTd = document.createElement('td');
    delTd.className = 'row-del-td';
    delTd.innerHTML = `<button class="row-del-btn" onclick="delRow(${ti},${ri})">✕</button>`;
    tr.appendChild(delTd);

    tbody.appendChild(tr);
  });
}

function refreshSummary(ti){
  const tbl = data[ti];
  const grid = document.getElementById('sgrid-'+tbl.id);
  if(!grid) return;
  const cur = tbl.cur||'IQD';
  const sym = CUR_SYMBOLS[cur];
  let cards = [];

  // Row count
  cards.push(`<div class="s-card"><div class="s-card-label">عدد الصفوف الكلي</div><div class="s-card-val">${tbl.rows.length}</div></div>`);

  tbl.cols.forEach((col,ci)=>{
    const vals = tbl.rows.map(r=>r.cells[ci]||'');

    if(col.type==='number'){
      let sum = 0, count = 0;
      vals.forEach(v=>{ const n=parseFloat(v); if(!isNaN(n)){sum+=n;count++;} });
      if(!col.name && sum===0) return;
      const iqd = toIQD(sum, cur);
      const usd = fromIQD(iqd,'USD');
      const eur = fromIQD(iqd,'EUR');
      cards.push(`<div class="s-card">
        <div class="s-card-label">مجموع ${esc(col.name)||'مبلغ'}</div>
        <div class="s-card-val">${fmtNum(sum)} ${sym}</div>
        <div class="s-card-subs">
          <div class="s-sub"><span class="iqd">🇮🇶 ${fmtNum(iqd)} د.ع</span></div>
          <div class="s-sub"><span class="usd">🇺🇸 ${fmtNum(usd,2)} $</span></div>
          <div class="s-sub"><span class="eur">🇪🇺 ${fmtNum(eur,2)} €</span></div>
        </div>
      </div>`);
    }

    if(col.type==='count'){
      let sum = 0;
      vals.forEach(v=>{ const n=parseFloat(v); if(!isNaN(n)) sum+=n; });
      cards.push(`<div class="s-card">
        <div class="s-card-label">مجموع ${esc(col.name)||'عدد'}</div>
        <div class="s-card-val">${fmtNum(sum)}</div>
      </div>`);
    }

    if(col.type==='text' && col.name){
      // Count unique values
      const counts = {};
      vals.filter(v=>v.trim()).forEach(v=>{ counts[v]=(counts[v]||0)+1; });
      const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3);
      if(entries.length){
        const subs = entries.map(([k,v])=>`<div class="s-sub"><span>${esc(k)}: <strong>${v}</strong></span></div>`).join('');
        cards.push(`<div class="s-card">
          <div class="s-card-label">تكرار ${esc(col.name)}</div>
          <div class="s-card-val">${Object.keys(counts).length} قيمة</div>
          <div class="s-card-subs">${subs}</div>
        </div>`);
      }
    }
  });

  grid.innerHTML = cards.join('');
}

// COLOR PICKER
let _cpClose = null;
function showColorPicker(e, ti, ri, btn, rowEl){
  e.stopPropagation();
  if(_cpClose){ _cpClose(); }
  const panel = document.createElement('div');
  panel.className = 'color-panel open';
  panel.style.cssText = `position:fixed;top:${e.clientY+4}px;right:${window.innerWidth-e.clientX-10}px;z-index:500`;
  COLORS.forEach(c=>{
    const sw = document.createElement('button');
    sw.className = 'cp-swatch' + (c===(data[ti].rows[ri]._color||'#ffffff')?' selected':'');
    sw.style.background = c;
    sw.style.border = c==='#ffffff'?'2px solid #d1d9e0':'2px solid transparent';
    sw.onclick = ()=>{
      data[ti].rows[ri]._color = c;
      save(); rowEl.style.background=c; btn.style.background=c;
      closeCP();
    };
    panel.appendChild(sw);
  });
  document.body.appendChild(panel);
  _cpClose = closeCP;
  function closeCP(){ panel.remove(); document.removeEventListener('click',closeCP); _cpClose=null; }
  setTimeout(()=>document.addEventListener('click',closeCP),10);
}

// ACTIONS
function addCol(ti){
  data[ti].cols.push({name:'',type:'text'});
  data[ti].rows.forEach(r=>r.cells.push(''));
  save(); refreshHead(ti); refreshBody(ti);
  setTimeout(()=>{
    const tr=document.getElementById('thead-'+data[ti].id);
    const inputs=tr.querySelectorAll('.col-name-input');
    if(inputs.length) inputs[inputs.length-1].focus();
  },30);
}
function delCol(ti,ci){
  if(!confirm('حذف العمود؟')) return;
  data[ti].cols.splice(ci,1);
  data[ti].rows.forEach(r=>r.cells.splice(ci,1));
  save(); render();
}
function addRow(ti){
  data[ti].rows.push({cells:Array(data[ti].cols.length).fill(''),_color:'#ffffff'});
  save(); refreshBody(ti); refreshSummary(ti);
  setTimeout(()=>{
    const tbody=document.getElementById('tbody-'+data[ti].id);
    const rows=tbody.querySelectorAll('tr');
    if(rows.length){ const inp=rows[rows.length-1].querySelector('.cell-input'); if(inp) inp.focus(); }
  },30);
}
function delRow(ti,ri){
  data[ti].rows.splice(ri,1);
  save(); refreshBody(ti); refreshSummary(ti);
}
function delTable(ti){
  if(!confirm('حذف الجدول نهائياً؟')) return;
  data.splice(ti,1); save(); render();
}
function cellKey(e,ti,ri,ci){
  if(e.key==='Enter'){
    e.preventDefault();
    if(ri===data[ti].rows.length-1) addRow(ti);
    else{
      const tbody=document.getElementById('tbody-'+data[ti].id);
      const rows=tbody.querySelectorAll('tr');
      const inp=rows[ri+1]?.querySelectorAll('.cell-input')[ci];
      if(inp) inp.focus();
    }
  }
}

// MODAL
function openModal(){
  document.getElementById('modal-name').value='';
  document.getElementById('modal').classList.add('open');
  setTimeout(()=>document.getElementById('modal-name').focus(),80);
}
function closeModal(){ document.getElementById('modal').classList.remove('open'); }
function confirmAdd(){
  const name=document.getElementById('modal-name').value.trim()||'جدول جديد';
  const cur=document.getElementById('modal-cur').value;
  data.push({id:Date.now(),name,cur,cols:[],rows:[]});
  save(); closeModal(); render();
}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
document.getElementById('modal-name').addEventListener('keydown',e=>{if(e.key==='Enter')confirmAdd();});

render();
</script>
</body>
</html>
