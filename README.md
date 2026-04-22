<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>سجلاتي</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#f0f4f8;--white:#fff;--border:#d1d9e0;
  --accent:#2563eb;--al:#eff6ff;
  --red:#ef4444;--green:#10b981;--yellow:#f59e0b;--purple:#7c3aed;
  --text:#1e293b;--muted:#94a3b8;
  --hdr:#1e293b;--hdr2:#334155;--side:#0f172a;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{background:var(--bg);font-family:'Tajawal',sans-serif;color:var(--text);min-height:100vh;overflow:hidden}
.hidden{display:none!important}

/* ─── AUTH ─── */
#auth-screen{position:fixed;inset:0;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);display:flex;align-items:center;justify-content:center;z-index:1000}
.auth-box{background:rgba(255,255,255,.07);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:32px 28px;width:90%;max-width:360px;text-align:center}
.auth-logo{font-size:42px;margin-bottom:8px}
.auth-title{color:#fff;font-size:22px;font-weight:800;margin-bottom:4px}
.auth-sub{color:#94a3b8;font-size:13px;margin-bottom:24px}
.auth-tabs{display:flex;background:rgba(255,255,255,.08);border-radius:10px;padding:4px;margin-bottom:20px;gap:4px}
.auth-tab{flex:1;padding:8px;border:none;border-radius:8px;background:transparent;color:#94a3b8;font-family:'Tajawal',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
.auth-tab.active{background:var(--accent);color:#fff}
.auth-field{margin-bottom:12px;text-align:right}
.auth-field label{display:block;font-size:12px;color:#94a3b8;margin-bottom:5px}
.auth-field input{width:100%;padding:11px 14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#fff;font-family:'Tajawal',sans-serif;font-size:14px;outline:none}
.auth-field input:focus{border-color:var(--accent)}
.auth-field input::placeholder{color:#475569}
.auth-err{color:#f87171;font-size:12px;margin-bottom:10px;text-align:right;min-height:18px}
.btn-auth{width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:'Tajawal',sans-serif;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px}
.btn-auth:hover{background:#1d4ed8}

/* ─── LAYOUT ─── */
#app{position:fixed;inset:0;display:flex;flex-direction:column}
.topbar{background:var(--hdr);height:52px;display:flex;align-items:center;padding:0 14px;gap:10px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.25);z-index:100}
.menu-btn{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:8px;flex-shrink:0}
.menu-btn:hover{background:rgba(255,255,255,.1)}
.topbar-title{color:#fff;font-size:16px;font-weight:700;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.topbar-title span{color:#60a5fa}
.tbtn{padding:6px 12px;border-radius:8px;border:none;cursor:pointer;font-family:'Tajawal',sans-serif;font-size:13px;font-weight:600;transition:all .15s}
.tbtn-primary{background:var(--accent);color:#fff}
.tbtn-ghost{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.15)}
.tbtn-ghost:hover,.tbtn-primary:hover{opacity:.85}
.tbtn-sm{padding:4px 9px;font-size:12px;border-radius:6px}
.tbtn-red{background:var(--red);color:#fff}
.tbtn-green{background:var(--green);color:#fff}

/* RATES BAR */
.rates-bar{background:#0f172a;padding:5px 14px;display:flex;align-items:center;gap:12px;flex-wrap:nowrap;overflow-x:auto;flex-shrink:0;border-bottom:1px solid #1e293b}
.rate-label{color:#60a5fa;font-size:12px;font-weight:700;white-space:nowrap}
.rate-item{display:flex;align-items:center;gap:5px;white-space:nowrap}
.rate-item label{color:#64748b;font-size:11px}
.rate-inp{background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-family:'Tajawal',sans-serif;font-size:12px;padding:3px 7px;width:80px;outline:none;text-align:center}

/* BODY */
.body{display:flex;flex:1;overflow:hidden}

/* SIDEBAR */
#sidebar{width:240px;background:var(--side);display:flex;flex-direction:column;flex-shrink:0;border-left:1px solid #1e293b;transition:transform .25s;z-index:50}
#sidebar.collapsed{transform:translateX(100%);position:absolute;top:0;bottom:0;right:0;box-shadow:-4px 0 20px rgba(0,0,0,.4)}
.side-header{padding:12px 14px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between}
.side-title{color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.side-new{background:var(--accent);border:none;color:#fff;border-radius:8px;padding:5px 10px;font-family:'Tajawal',sans-serif;font-size:12px;font-weight:700;cursor:pointer}
.side-new:hover{background:#1d4ed8}
.side-list{flex:1;overflow-y:auto;padding:8px}
.side-item{padding:10px 12px;border-radius:10px;cursor:pointer;margin-bottom:4px;transition:all .15s;display:flex;align-items:center;justify-content:space-between;gap:6px}
.side-item:hover{background:rgba(255,255,255,.06)}
.side-item.active{background:var(--accent)}
.side-item-name{color:#e2e8f0;font-size:14px;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.side-item.active .side-item-name{color:#fff}
.side-item-del{background:none;border:none;color:rgba(255,255,255,.25);cursor:pointer;font-size:13px;padding:2px 5px;border-radius:5px;flex-shrink:0}
.side-item-del:hover{color:#f87171;background:rgba(239,68,68,.15)}
.side-item-meta{color:#475569;font-size:11px;flex-shrink:0}
.side-item.active .side-item-meta{color:rgba(255,255,255,.6)}
.side-footer{padding:10px 14px;border-top:1px solid #1e293b}
.logout-btn{width:100%;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171;border-radius:8px;padding:7px;font-family:'Tajawal',sans-serif;font-size:13px;cursor:pointer}
.logout-btn:hover{background:rgba(239,68,68,.2)}

/* CONTENT */
#content{flex:1;overflow-y:auto;display:flex;flex-direction:column}
.no-table{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--muted);text-align:center;padding:40px}
.no-table .icon{font-size:56px;margin-bottom:14px}
.no-table p{font-size:15px;margin-bottom:18px}

/* TABLE AREA */
.tbl-area{padding:16px 14px;display:flex;flex-direction:column;gap:0}
.tbl-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.tbl-toolbar-name{flex:1;min-width:140px;font-size:18px;font-weight:800;color:var(--text);background:transparent;border:none;outline:none;font-family:'Tajawal',sans-serif}
.cur-sel{background:var(--white);border:1.5px solid var(--border);border-radius:8px;color:var(--text);font-family:'Tajawal',sans-serif;font-size:13px;font-weight:700;padding:5px 10px;outline:none;cursor:pointer}

/* ─── GRID CONTROLS BAR ─── */
.grid-controls{background:#fff;border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.gc-label{font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap}
.gc-group{display:flex;align-items:center;gap:6px}
.gc-inp{width:64px;padding:4px 8px;border:1.5px solid var(--border);border-radius:7px;font-family:'Tajawal',sans-serif;font-size:13px;font-weight:600;outline:none;color:var(--text);text-align:center}
.gc-inp:focus{border-color:var(--accent)}
.gc-check{display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;color:var(--text);white-space:nowrap}
.gc-check input[type=checkbox]{width:15px;height:15px;accent-color:var(--accent);cursor:pointer}
.gc-divider{width:1px;height:20px;background:var(--border);flex-shrink:0}

/* GRID DRAG SELECTOR */
.grid-selector-wrap{background:#fff;border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.grid-selector-title{font-size:12px;color:var(--muted);font-weight:700;margin-bottom:8px}
.grid-drag-area{display:grid;gap:2px;user-select:none;cursor:crosshair}
.grid-drag-cell{border-radius:3px;transition:background .1s;border:1px solid #e2e8f0}
.grid-drag-cell.hovered{background:#bfdbfe!important;border-color:#3b82f6}
.grid-drag-cell.selected{background:#2563eb!important;border-color:#1d4ed8}
.grid-sel-count{font-size:12px;color:var(--accent);font-weight:700;margin-top:6px;text-align:center}

/* TABLE */
.tbl-wrap{overflow-x:auto;border-radius:12px;border:1px solid var(--border);background:var(--white);box-shadow:0 2px 10px rgba(0,0,0,.06)}
table{width:100%;border-collapse:collapse}
thead tr{background:var(--hdr2)}
thead th{padding:0;border-left:1px solid rgba(255,255,255,.08);vertical-align:top}
thead th:first-child,thead th:last-child{border-left:none}
.th-color-col{width:32px}
.th-del-col{width:32px}
.th-add-col{width:36px;background:var(--hdr2);padding:6px;border-left:1px solid rgba(255,255,255,.08);vertical-align:middle}
.add-col-btn{background:rgba(255,255,255,.1);border:1px dashed rgba(255,255,255,.3);border-radius:6px;color:#fff;cursor:pointer;font-size:18px;width:28px;height:28px;display:flex;align-items:center;justify-content:center}
.add-col-btn:hover{background:rgba(255,255,255,.22)}
.th-inner{display:flex;flex-direction:column}
.col-name-inp{background:transparent;border:none;color:#e2e8f0;font-family:'Tajawal',sans-serif;font-size:13px;font-weight:700;padding:8px 8px 4px;outline:none;width:100%;text-align:right;min-width:90px}
.col-name-inp::placeholder{color:rgba(255,255,255,.3)}
.col-type-sel{background:transparent;border:none;border-top:1px solid rgba(255,255,255,.08);color:#94a3b8;font-family:'Tajawal',sans-serif;font-size:11px;padding:3px 8px;outline:none;cursor:pointer;width:100%;text-align:right}
.col-type-sel option{background:#334155;color:#e2e8f0}
.col-del-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.2);padding:4px 6px;font-size:12px;align-self:flex-end;transition:color .15s}
.col-del-btn:hover{color:#f87171}

/* ROWS */
tbody tr{border-top:1px solid var(--border)}
tbody td{padding:0;border-left:1px solid var(--border)}
tbody td:last-child,tbody td:first-child{border-left:none}
.color-td{width:32px}
.color-dot{width:32px;height:100%;min-height:36px;border:none;cursor:pointer;transition:opacity .15s}
.color-dot:hover{opacity:.7}
.cell-inp{background:transparent;border:none;font-family:'Tajawal',sans-serif;font-size:13px;padding:8px 10px;outline:none;width:100%;color:var(--text);text-align:right;min-width:80px}
.cell-inp:focus{background:var(--al)}
.cell-inp.num-cell{color:#1d4ed8;font-weight:600}
.cell-inp.num-cell:focus{background:#eff6ff}
.extra-cell-td{background:rgba(0,0,0,.02);border-left:1px dashed var(--border)!important}
.row-add-cell{width:28px;border:none;background:none;cursor:pointer;color:var(--muted);font-size:16px;padding:0 4px;transition:color .15s}
.row-add-cell:hover{color:var(--accent)}
.row-del-td{width:30px}
.row-del-btn{background:none;border:none;cursor:pointer;color:var(--muted);font-size:13px;width:30px;height:36px;display:flex;align-items:center;justify-content:center}
.row-del-btn:hover{color:var(--red)}

/* ADD ROW */
.add-row-btn{display:block;width:100%;margin-top:0;padding:9px;background:none;border:1px dashed var(--border);border-top:none;border-radius:0 0 12px 12px;color:var(--muted);cursor:pointer;font-family:'Tajawal',sans-serif;font-size:13px;text-align:right;padding-right:14px;transition:all .15s}
.add-row-btn:hover{color:var(--accent);border-color:var(--accent);background:var(--al)}

/* SUMMARY */
.summary-section{margin-top:14px;background:var(--white);border:1px solid var(--border);border-radius:12px;padding:14px;box-shadow:0 2px 10px rgba(0,0,0,.06)}
.sum-title{font-size:13px;font-weight:700;color:var(--muted);margin-bottom:10px}
.sum-grid{display:flex;gap:10px;flex-wrap:wrap}
.sum-card{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 14px;min-width:120px}
.sum-card-label{font-size:11px;color:var(--muted);margin-bottom:4px}
.sum-card-val{font-size:17px;font-weight:800;color:var(--text)}
.sum-subs{margin-top:5px;display:flex;flex-direction:column;gap:2px}
.sum-sub{font-size:11px}
.c-iqd{color:var(--green);font-weight:700}
.c-usd{color:var(--accent);font-weight:700}
.c-eur{color:var(--purple);font-weight:700}

/* ─── COLOR PICKER (VERTICAL) ─── */
#cp-panel{position:fixed;z-index:600;background:#fff;border:1px solid var(--border);border-radius:12px;padding:10px;box-shadow:0 8px 30px rgba(0,0,0,.2);display:none;flex-direction:column;gap:4px;width:44px}
#cp-panel.open{display:flex}
.cp-section-label{font-size:10px;color:var(--muted);font-weight:700;text-align:center;padding:2px 0;border-top:1px solid var(--border);margin-top:2px}
.cp-section-label:first-child{border-top:none;margin-top:0}
.cp-sw{width:28px;height:28px;border-radius:7px;border:2px solid transparent;cursor:pointer;transition:transform .15s;align-self:center}
.cp-sw:hover{transform:scale(1.15)}
.cp-sw.sel{border-color:#1e293b!important;transform:scale(1.1)}
/* Header row color picker */
#col-cp-panel{position:fixed;z-index:601;background:#fff;border:1px solid var(--border);border-radius:12px;padding:10px;box-shadow:0 8px 30px rgba(0,0,0,.2);display:none;flex-direction:column;gap:4px;width:44px}
#col-cp-panel.open{display:flex}

/* MODALS */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);z-index:700;align-items:center;justify-content:center}
.overlay.open{display:flex}
.modal{background:#fff;border-radius:16px;padding:22px;width:90%;max-width:380px;box-shadow:0 20px 60px rgba(0,0,0,.25);max-height:90vh;overflow-y:auto}
.modal h3{font-size:17px;font-weight:700;margin-bottom:14px}
.modal input,.modal select{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-family:'Tajawal',sans-serif;font-size:14px;outline:none;margin-bottom:10px;color:var(--text);background:#fff}
.modal input:focus,.modal select:focus{border-color:var(--accent)}
.modal-btns{display:flex;gap:8px;justify-content:flex-end;margin-top:4px}
.mbtn{padding:8px 16px;border-radius:9px;border:none;cursor:pointer;font-family:'Tajawal',sans-serif;font-size:13px;font-weight:600}
.mbtn-primary{background:var(--accent);color:#fff}
.mbtn-cancel{background:#f1f5f9;color:#64748b}

/* GRID MODAL */
.grid-drag-area-modal{display:grid;gap:3px;user-select:none;cursor:crosshair;margin:10px auto}
.gdm-cell{border-radius:3px;border:1px solid #d1d9e0;background:#f8fafc;transition:background .08s,border-color .08s}
.gdm-cell.hovered{background:#bfdbfe;border-color:#3b82f6}
.gdm-cell.selected{background:#2563eb;border-color:#1d4ed8}
.grid-modal-count{text-align:center;font-size:13px;font-weight:700;color:var(--accent);margin-top:6px}
.modal-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.modal-row label{font-size:13px;color:var(--muted);white-space:nowrap;font-weight:600}
.modal-row input{flex:1;margin-bottom:0}

/* SHARE MODAL */
.share-btns{display:flex;flex-direction:column;gap:10px;margin-top:14px}
.share-btn{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;border:none;cursor:pointer;font-family:'Tajawal',sans-serif;font-size:14px;font-weight:700;transition:all .15s;text-decoration:none}
.share-btn-wa{background:#25d366;color:#fff}
.share-btn-tg{background:#0088cc;color:#fff}
.share-btn-copy{background:#f1f5f9;color:var(--text);border:1.5px solid var(--border)}
.share-btn-dl{background:var(--accent);color:#fff}
.share-btn:hover{opacity:.88;transform:translateY(-1px)}
.share-icon{font-size:20px}

/* RESPONSIVE */
@media(max-width:600px){
  #sidebar{width:100%;position:absolute;top:0;bottom:0;right:0}
  #sidebar:not(.collapsed){z-index:99}
  .tbl-toolbar{gap:6px}
}
@media print{
  .topbar,.rates-bar,#sidebar,.tbl-toolbar .tbtn,.col-del-btn,.th-add-col,.color-dot,.row-add-cell,.row-del-btn,.add-row-btn,#cp-panel,.grid-controls,.grid-selector-wrap{display:none!important}
  body,#app{overflow:visible}
  #content{overflow:visible}
}
</style>
</head>
<body>

<!-- AUTH SCREEN -->
<div id="auth-screen">
  <div class="auth-box">
    <div class="auth-logo">📋</div>
    <div class="auth-title">سجلاتي</div>
    <div class="auth-sub">سجّل دخولك لحفظ بياناتك</div>
    <div class="auth-tabs">
      <button class="auth-tab active" onclick="switchAuthTab('login')">دخول</button>
      <button class="auth-tab" onclick="switchAuthTab('register')">حساب جديد</button>
    </div>
    <div class="auth-field">
      <label>البريد الإلكتروني</label>
      <input type="email" id="a-email" placeholder="example@email.com" autocomplete="email">
    </div>
    <div class="auth-field">
      <label>كلمة السر</label>
      <input type="password" id="a-pass" placeholder="••••••••" autocomplete="current-password">
    </div>
    <div class="auth-err" id="a-err"></div>
    <button class="btn-auth" id="a-btn" onclick="doAuth()">دخول</button>
  </div>
</div>

<!-- MAIN APP -->
<div id="app" class="hidden">
  <!-- TOP BAR -->
  <div class="topbar">
    <button class="menu-btn" onclick="toggleSidebar()">☰</button>
    <div class="topbar-title" id="topbar-title">📋 <span>سجلاتي</span></div>
    <div style="display:flex;gap:6px" id="tbl-actions-bar"></div>
  </div>

  <!-- RATES BAR -->
  <div class="rates-bar">
    <span class="rate-label">💱 الصرف:</span>
    <div class="rate-item"><span>🇮🇶</span><label>USD=</label><input class="rate-inp" id="r-usd" type="number" value="1310" oninput="saveRates();redrawSummary()"><span style="color:#64748b;font-size:11px">د.ع</span></div>
    <div class="rate-item"><span>🇪🇺</span><label>EUR=</label><input class="rate-inp" id="r-eur" type="number" value="1420" oninput="saveRates();redrawSummary()"><span style="color:#64748b;font-size:11px">د.ع</span></div>
  </div>

  <div class="body">
    <!-- SIDEBAR -->
    <div id="sidebar">
      <div class="side-header">
        <span class="side-title">جداولي</span>
        <button class="side-new" onclick="openNewTableModal()">+ جديد</button>
      </div>
      <div class="side-list" id="side-list"></div>
      <div class="side-footer">
        <div style="color:#475569;font-size:11px;margin-bottom:6px;text-align:center" id="user-email-display"></div>
        <button class="logout-btn" onclick="logout()">تسجيل خروج</button>
      </div>
    </div>

    <!-- CONTENT -->
    <div id="content">
      <div class="no-table" id="no-table">
        <div class="icon">📋</div>
        <p>اختر جدولاً أو أنشئ واحداً جديداً</p>
        <button class="tbtn tbtn-primary" onclick="openNewTableModal()">+ جدول جديد</button>
      </div>
      <div id="tbl-area" class="tbl-area hidden"></div>
    </div>
  </div>
</div>

<!-- COLOR PICKER PANEL (VERTICAL) -->
<div id="cp-panel"></div>
<div id="col-cp-panel"></div>

<!-- NEW TABLE MODAL -->
<div class="overlay" id="new-tbl-modal">
  <div class="modal">
    <h3>جدول جديد</h3>
    <input type="text" id="nt-name" placeholder="اسم الجدول..." maxlength="60">
    <select id="nt-cur">
      <option value="IQD">🇮🇶 دينار عراقي (IQD)</option>
      <option value="USD">🇺🇸 دولار (USD)</option>
      <option value="EUR">🇪🇺 يورو (EUR)</option>
    </select>

    <!-- Rows selector inside new table modal -->
    <div style="margin-bottom:10px">
      <div style="font-size:13px;font-weight:700;color:var(--muted);margin-bottom:8px">عدد الصفوف الابتدائية (اسحب لتحديد)</div>
      <div id="nt-grid-drag" class="grid-drag-area-modal" style="width:200px;height:200px"></div>
      <div class="grid-modal-count" id="nt-grid-count">0 صف</div>
    </div>

    <div class="modal-btns">
      <button class="mbtn mbtn-cancel" onclick="closeModal('new-tbl-modal')">إلغاء</button>
      <button class="mbtn mbtn-primary" onclick="confirmNewTable()">إنشاء</button>
    </div>
  </div>
</div>

<!-- SHARE MODAL -->
<div class="overlay" id="share-modal">
  <div class="modal">
    <h3>📤 مشاركة الجدول</h3>
    <p style="font-size:13px;color:var(--muted);margin-bottom:4px">اختر طريقة المشاركة:</p>
    <div class="share-btns">
      <button class="share-btn share-btn-wa" onclick="shareWA()">
        <span class="share-icon">💬</span> مشاركة عبر واتساب
      </button>
      <button class="share-btn share-btn-tg" onclick="shareTG()">
        <span class="share-icon">✈️</span> مشاركة عبر تليكرام
      </button>
      <button class="share-btn share-btn-copy" onclick="shareCopyLink()">
        <span class="share-icon">🔗</span> نسخ رابط (نص)
      </button>
      <button class="share-btn share-btn-dl" onclick="shareDownload()">
        <span class="share-icon">💾</span> تحميل كملف HTML
      </button>
    </div>
    <div class="modal-btns" style="margin-top:14px">
      <button class="mbtn mbtn-cancel" onclick="closeModal('share-modal')">إغلاق</button>
    </div>
  </div>
</div>

<script>
// ─── CONSTANTS ───
const COLORS_ROWS=[
  {label:'فاتح',colors:['#ffffff','#fef9c3','#dcfce7','#dbeafe','#fce7f3','#f3e8ff','#ffedd5','#fee2e2','#e0f2fe','#d1fae5']},
  {label:'داكن',colors:['#1e293b','#1e3a5f','#14532d','#7f1d1d','#3b0764','#78350f','#0c4a6e','#064e3b','#1e1b4b','#450a0a']}
];
const COLORS_COLS=[
  '#334155','#1e3a5f','#14532d','#7f1d1d','#3b0764','#78350f','#0c4a6e','#064e3b','#1e1b4b','#374151',
  '#1d4ed8','#047857','#b91c1c','#7c3aed','#d97706','#0369a1','#166534','#991b1b','#4f46e5','#0f766e'
];
const SYM={IQD:'د.ع',USD:'$',EUR:'€'};
const KEY_USER='sijilati_user';
const KEY_DATA='sijilati_data_v6';
const KEY_RATES='sijilati_rates_v5';

// ─── STATE ───
let currentUser=null;
let tables=[];
let activeId=null;
let rates={usd:1310,eur:1420};
let sidebarOpen=true;
let ntSelectedRows=0;

// ─── HELPERS ───
function h(s){return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function fmtN(n,d=0){return Number(n).toLocaleString('ar-IQ',{maximumFractionDigits:d})}
function simpleHash(s){let r=0;for(let i=0;i<s.length;i++){r=((r<<5)-r)+s.charCodeAt(i);r|=0}return r.toString(36)}
function toIQD(v,cur){if(cur==='USD')return v*rates.usd;if(cur==='EUR')return v*rates.eur;return v}
function fromIQD(v,cur){if(cur==='USD')return v/rates.usd;if(cur==='EUR')return v/rates.eur;return v}

// ─── PERSIST ───
function saveData(){localStorage.setItem(KEY_DATA+'_'+currentUser.email,JSON.stringify(tables))}
function loadData(){tables=JSON.parse(localStorage.getItem(KEY_DATA+'_'+currentUser.email)||'[]')}
function saveRates(){rates.usd=parseFloat(document.getElementById('r-usd').value)||1310;rates.eur=parseFloat(document.getElementById('r-eur').value)||1420;localStorage.setItem(KEY_RATES,JSON.stringify(rates))}
function loadRates(){const r=JSON.parse(localStorage.getItem(KEY_RATES)||'null');if(r){rates=r;document.getElementById('r-usd').value=r.usd;document.getElementById('r-eur').value=r.eur}}

// ─── AUTH ───
let authMode='login';
function switchAuthTab(mode){
  authMode=mode;
  document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',(mode==='login'?i===0:i===1)));
  document.getElementById('a-btn').textContent=mode==='login'?'دخول':'إنشاء حساب';
  document.getElementById('a-err').textContent='';
}
function doAuth(){
  const email=document.getElementById('a-email').value.trim().toLowerCase();
  const pass=document.getElementById('a-pass').value;
  if(!email||!pass){document.getElementById('a-err').textContent='يرجى تعبئة جميع الحقول';return}
  if(!/^[^@]+@[^@]+\.[^@]+$/.test(email)){document.getElementById('a-err').textContent='بريد إلكتروني غير صحيح';return}
  if(pass.length<4){document.getElementById('a-err').textContent='كلمة السر 4 أحرف على الأقل';return}
  const passHash=simpleHash(pass);
  const stored=JSON.parse(localStorage.getItem(KEY_USER+'_'+email)||'null');
  if(authMode==='register'){
    if(stored){document.getElementById('a-err').textContent='هذا البريد مسجّل مسبقاً';return}
    localStorage.setItem(KEY_USER+'_'+email,JSON.stringify({email,passHash}));
    currentUser={email};loginSuccess();
  } else {
    if(!stored){document.getElementById('a-err').textContent='الحساب غير موجود، سجّل حساباً جديداً';return}
    if(stored.passHash!==passHash){document.getElementById('a-err').textContent='كلمة السر غير صحيحة';return}
    currentUser={email};loginSuccess();
  }
}
document.getElementById('a-pass').addEventListener('keydown',e=>{if(e.key==='Enter')doAuth()});
document.getElementById('a-email').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('a-pass').focus()});

function loginSuccess(){
  localStorage.setItem('sijilati_session',currentUser.email);
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('user-email-display').textContent=currentUser.email;
  loadData();loadRates();renderSidebar();
  if(tables.length)selectTable(tables[0].id);
  if(window.innerWidth<=600){sidebarOpen=false;document.getElementById('sidebar').classList.add('collapsed')}
}
function logout(){if(!confirm('تسجيل الخروج؟'))return;localStorage.removeItem('sijilati_session');currentUser=null;tables=[];activeId=null;document.getElementById('app').classList.add('hidden');document.getElementById('auth-screen').classList.remove('hidden');document.getElementById('a-email').value='';document.getElementById('a-pass').value='';document.getElementById('a-err').textContent=''}

(function(){const s=localStorage.getItem('sijilati_session');if(s){const u=JSON.parse(localStorage.getItem(KEY_USER+'_'+s)||'null');if(u){currentUser={email:s};loginSuccess()}}})();

// ─── SIDEBAR ───
function toggleSidebar(){sidebarOpen=!sidebarOpen;document.getElementById('sidebar').classList.toggle('collapsed',!sidebarOpen)}
function renderSidebar(){
  const el=document.getElementById('side-list');
  if(!tables.length){el.innerHTML='<div style="color:#475569;font-size:13px;text-align:center;padding:20px">لا يوجد جداول بعد</div>';return}
  el.innerHTML=tables.map(t=>`
    <div class="side-item${t.id===activeId?' active':''}" onclick="selectTable('${t.id}')">
      <div class="side-item-name">${h(t.name)}</div>
      <span class="side-item-meta">${t.rows.length} صف</span>
      <button class="side-item-del" onclick="event.stopPropagation();delTable('${t.id}')" title="حذف">✕</button>
    </div>`).join('');
}
function selectTable(id){
  activeId=id;
  if(window.innerWidth<=600&&sidebarOpen){sidebarOpen=false;document.getElementById('sidebar').classList.add('collapsed')}
  renderSidebar();renderTable();
}

// ─── NEW TABLE MODAL WITH DRAG GRID ───
function buildNewTableGrid(){
  const wrap=document.getElementById('nt-grid-drag');
  wrap.innerHTML='';
  const cols=10,rows=10;
  wrap.style.gridTemplateColumns=`repeat(${cols},1fr)`;
  wrap.style.gridTemplateRows=`repeat(${rows},1fr)`;
  let isDragging=false;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const cell=document.createElement('div');
      cell.className='gdm-cell';
      cell.dataset.r=r;cell.dataset.c=c;

      const update=()=>{
        const row=parseInt(cell.dataset.r);
        ntSelectedRows=row+1;
        document.getElementById('nt-grid-count').textContent=`${ntSelectedRows} صف`;
        wrap.querySelectorAll('.gdm-cell').forEach(cc=>{
          const cr=parseInt(cc.dataset.r);
          cc.className='gdm-cell'+(cr<=row?' selected':' hovered'==cc.className.includes('hovered')?'':' ');
          if(cr<row)cc.classList.add('selected');
          else if(cr===row)cc.classList.add('selected');
          else cc.classList.remove('selected');
        });
      };
      cell.addEventListener('mouseenter',()=>{
        if(!isDragging){
          const row=parseInt(cell.dataset.r);
          wrap.querySelectorAll('.gdm-cell').forEach(cc=>{
            cc.classList.remove('hovered');
            if(parseInt(cc.dataset.r)<=row)cc.classList.add('hovered');
          });
        }
      });
      cell.addEventListener('mouseleave',()=>{if(!isDragging)wrap.querySelectorAll('.gdm-cell').forEach(cc=>cc.classList.remove('hovered'))});
      cell.addEventListener('mousedown',e=>{e.preventDefault();isDragging=true;update()});
      cell.addEventListener('mouseup',()=>{isDragging=false});
      cell.addEventListener('mousemove',()=>{if(isDragging)update()});
      // Touch
      cell.addEventListener('touchstart',e=>{e.preventDefault();isDragging=true;update()},{passive:false});
      cell.addEventListener('touchend',()=>{isDragging=false});
      wrap.addEventListener('touchmove',e=>{
        const t=e.touches[0];
        const el=document.elementFromPoint(t.clientX,t.clientY);
        if(el&&el.dataset&&el.dataset.r!==undefined&&isDragging){
          const row=parseInt(el.dataset.r);
          ntSelectedRows=row+1;
          document.getElementById('nt-grid-count').textContent=`${ntSelectedRows} صف`;
          wrap.querySelectorAll('.gdm-cell').forEach(cc=>{
            if(parseInt(cc.dataset.r)<=row)cc.classList.add('selected');
            else cc.classList.remove('selected');
          });
        }
      },{passive:false});

      wrap.appendChild(cell);
    }
  }
}

function openNewTableModal(){
  ntSelectedRows=0;
  document.getElementById('nt-name').value='';
  document.getElementById('new-tbl-modal').classList.add('open');
  buildNewTableGrid();
  document.getElementById('nt-grid-count').textContent='0 صف';
  setTimeout(()=>document.getElementById('nt-name').focus(),80);
}
function confirmNewTable(){
  const name=document.getElementById('nt-name').value.trim()||'جدول جديد';
  const cur=document.getElementById('nt-cur').value;
  const rows=[];
  for(let i=0;i<ntSelectedRows;i++)rows.push({cells:[],_color:'#ffffff'});
  const t={id:uid(),name,cur,cols:[],rows,gridLines:true,gridThickness:1};
  tables.push(t);saveData();renderSidebar();selectTable(t.id);closeModal('new-tbl-modal');
}
document.getElementById('nt-name').addEventListener('keydown',e=>{if(e.key==='Enter')confirmNewTable()});

function delTable(id){
  if(!confirm('حذف الجدول نهائياً؟'))return;
  tables=tables.filter(t=>t.id!==id);
  if(activeId===id)activeId=tables.length?tables[0].id:null;
  saveData();renderSidebar();if(activeId)renderTable();else showNoTable();
}
function showNoTable(){
  document.getElementById('no-table').classList.remove('hidden');
  document.getElementById('tbl-area').classList.add('hidden');
  document.getElementById('topbar-title').innerHTML='📋 <span>سجلاتي</span>';
  document.getElementById('tbl-actions-bar').innerHTML='';
}

// ─── RENDER TABLE ───
function getTable(){return tables.find(t=>t.id===activeId)}
function renderTable(){
  const tbl=getTable();
  if(!tbl){showNoTable();return}
  // Ensure defaults
  if(tbl.gridLines===undefined)tbl.gridLines=true;
  if(!tbl.gridThickness)tbl.gridThickness=1;

  document.getElementById('no-table').classList.add('hidden');
  document.getElementById('tbl-area').classList.remove('hidden');
  document.getElementById('topbar-title').innerHTML=`<span>${h(tbl.name)}</span>`;

  document.getElementById('tbl-actions-bar').innerHTML=`
    <button class="tbtn tbtn-ghost tbtn-sm" onclick="openShareModal()" title="مشاركة">📤</button>
    <button class="tbtn tbtn-ghost tbtn-sm" onclick="window.print()">🖨</button>`;

  const area=document.getElementById('tbl-area');
  area.innerHTML='';

  // Toolbar
  const toolbar=document.createElement('div');
  toolbar.className='tbl-toolbar';
  toolbar.innerHTML=`
    <input class="tbl-toolbar-name" value="${h(tbl.name)}" placeholder="اسم الجدول..."
      oninput="getTable().name=this.value;saveData();renderSidebar();document.getElementById('topbar-title').innerHTML='<span>'+this.value+'</span>'">
    <select class="cur-sel" onchange="getTable().cur=this.value;saveData();redrawSummary()">
      <option value="IQD"${tbl.cur==='IQD'?' selected':''}>🇮🇶 IQD</option>
      <option value="USD"${tbl.cur==='USD'?' selected':''}>🇺🇸 USD</option>
      <option value="EUR"${tbl.cur==='EUR'?' selected':''}>🇪🇺 EUR</option>
    </select>`;
  area.appendChild(toolbar);

  // Grid Controls Bar
  const gcBar=document.createElement('div');
  gcBar.className='grid-controls';
  gcBar.innerHTML=`
    <span class="gc-label">⚙️ إعدادات الشبكة:</span>
    <div class="gc-group">
      <span style="font-size:12px;color:var(--muted)">صفوف:</span>
      <input class="gc-inp" id="gc-rows" type="number" min="0" max="500" value="${tbl.rows.length}" 
        oninput="updateRowCount(parseInt(this.value)||0)">
    </div>
    <div class="gc-divider"></div>
    <label class="gc-check">
      <input type="checkbox" id="gc-lines" ${tbl.gridLines?'checked':''} onchange="getTable().gridLines=this.checked;saveData();applyGridStyle()">
      خطوط الشبكة
    </label>
    <div class="gc-group" id="gc-thickness-group" style="${tbl.gridLines?'':'opacity:.4;pointer-events:none'}">
      <span style="font-size:12px;color:var(--muted)">سُمك:</span>
      <input class="gc-inp" id="gc-thick" type="number" min="1" max="5" value="${tbl.gridThickness||1}"
        oninput="getTable().gridThickness=parseInt(this.value)||1;saveData();applyGridStyle()">
      <span style="font-size:11px;color:var(--muted)">px</span>
    </div>
    <div class="gc-divider"></div>
    <button style="padding:4px 10px;background:var(--accent);color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:'Tajawal',sans-serif;font-size:12px;font-weight:700" 
      onclick="openRowDragModal()">↕ سحب الصفوف</button>`;
  area.appendChild(gcBar);

  // sync checkbox toggle with thickness group
  document.getElementById('gc-lines').addEventListener('change',function(){
    document.getElementById('gc-thickness-group').style.opacity=this.checked?'1':'0.4';
    document.getElementById('gc-thickness-group').style.pointerEvents=this.checked?'auto':'none';
  });

  // Build table
  const wrap=document.createElement('div');
  wrap.className='tbl-wrap';
  wrap.id='tbl-wrap-main';
  const table=document.createElement('table');
  table.id='main-table';

  // THEAD
  const thead=document.createElement('thead');
  const headRow=document.createElement('tr');

  // color col header (for column color picker)
  const colorTH=document.createElement('th');
  colorTH.className='th-color-col';
  colorTH.style.background='var(--hdr2)';
  colorTH.style.width='32px';
  headRow.appendChild(colorTH);

  // cols
  tbl.cols.forEach((col,ci)=>{
    const th=document.createElement('th');
    const bg=col.headerColor||'var(--hdr2)';
    th.style.background=bg;
    th.innerHTML=`<div class="th-inner">
      <div style="display:flex;align-items:center;gap:2px;padding:4px 6px 2px">
        <button class="col-del-btn" onclick="delCol(${ci})" style="margin-left:auto">✕</button>
        <button style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,.5);font-size:12px;padding:2px 4px;border-radius:4px" 
          title="لون العمود" onclick="openColColorPicker(event,${ci},this)">🎨</button>
        <input class="col-name-inp" value="${h(col.name)}" placeholder="عنوان..."
          oninput="getTable().cols[${ci}].name=this.value;saveData();redrawSummary()">
      </div>
      <div style="display:flex;align-items:center">
        <select class="col-type-sel" onchange="getTable().cols[${ci}].type=this.value;saveData();rerenderRows();redrawSummary()">
          <option value="text"${col.type==='text'?' selected':''}>نص</option>
          <option value="number"${col.type==='number'?' selected':''}>رقم/مبلغ</option>
          <option value="count"${col.type==='count'?' selected':''}>عدد</option>
          <option value="date"${col.type==='date'?' selected':''}>تاريخ</option>
        </select>
      </div>
    </div>`;
    headRow.appendChild(th);
  });

  // add col btn
  const addColTH=document.createElement('th');addColTH.className='th-add-col';
  addColTH.innerHTML='<button class="add-col-btn" onclick="addCol()">+</button>';
  headRow.appendChild(addColTH);

  // del col
  const delTH=document.createElement('th');delTH.className='th-del-col';delTH.style.background='var(--hdr2)';headRow.appendChild(delTH);
  thead.appendChild(headRow);table.appendChild(thead);

  // TBODY
  const tbody=document.createElement('tbody');
  tbody.id='main-tbody';
  table.appendChild(tbody);
  wrap.appendChild(table);
  area.appendChild(wrap);

  // Add row btn
  const addRowBtn=document.createElement('button');
  addRowBtn.className='add-row-btn';addRowBtn.textContent='+ إضافة صف جديد';
  addRowBtn.onclick=()=>addRow();
  area.appendChild(addRowBtn);

  // Summary
  const sumSec=document.createElement('div');
  sumSec.className='summary-section';
  sumSec.id='summary-sec';
  sumSec.innerHTML='<div class="sum-title">📊 الإحصائيات</div><div class="sum-grid" id="sum-grid"></div>';
  area.appendChild(sumSec);

  applyGridStyle();
  rerenderRows();
  redrawSummary();
}

function applyGridStyle(){
  const tbl=getTable();if(!tbl)return;
  const table=document.getElementById('main-table');if(!table)return;
  const thickness=tbl.gridThickness||1;
  const show=tbl.gridLines!==false;
  const style=show?`${thickness}px solid var(--border)`:'none';
  const styleLight=show?`${thickness}px solid rgba(255,255,255,.08)`:'none';
  // Update CSS vars dynamically
  let styleEl=document.getElementById('dynamic-grid-style');
  if(!styleEl){styleEl=document.createElement('style');styleEl.id='dynamic-grid-style';document.head.appendChild(styleEl)}
  if(show){
    styleEl.textContent=`
      #main-table tbody tr{border-top:${style}}
      #main-table tbody td{border-left:${style}}
      #main-table thead th{border-left:${styleLight}}
    `;
  } else {
    styleEl.textContent=`
      #main-table tbody tr{border-top:none}
      #main-table tbody td{border-left:none}
      #main-table thead th{border-left:none}
    `;
  }
}

// ─── UPDATE ROW COUNT ───
function updateRowCount(n){
  const tbl=getTable();if(!tbl)return;
  const current=tbl.rows.length;
  if(n>current){
    for(let i=current;i<n;i++)tbl.rows.push({cells:Array(tbl.cols.length).fill(''),_color:'#ffffff'});
  } else if(n<current){
    tbl.rows=tbl.rows.slice(0,n);
  }
  saveData();rerenderRows();redrawSummary();renderSidebar();
}

// ─── ROW DRAG MODAL ───
let rdSelectedRows=0;
function openRowDragModal(){
  const tbl=getTable();if(!tbl)return;
  rdSelectedRows=tbl.rows.length;
  // Build a drag grid
  const overlay=document.createElement('div');
  overlay.className='overlay open';
  overlay.id='row-drag-overlay';
  const maxR=50,cols=5;
  const cellSize=28;
  overlay.innerHTML=`
    <div class="modal" style="max-width:340px">
      <h3>↕ تحديد عدد الصفوف بالسحب</h3>
      <p style="font-size:12px;color:var(--muted);margin-bottom:10px">اسحب لتحديد العدد المطلوب، أو أدخل الرقم مباشرة</p>
      <div class="modal-row">
        <label>عدد الصفوف:</label>
        <input type="number" id="rd-count-inp" min="0" max="500" value="${rdSelectedRows}" 
          style="margin-bottom:0"
          oninput="rdSelectedRows=parseInt(this.value)||0;updateRDGrid()">
      </div>
      <div id="rd-grid" class="grid-drag-area-modal" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:3px;width:${cols*cellSize+4*(cols-1)}px;margin:0 auto 8px"></div>
      <div class="grid-modal-count" id="rd-count-label">${rdSelectedRows} صف</div>
      <div class="modal-btns" style="margin-top:12px">
        <button class="mbtn mbtn-cancel" onclick="document.getElementById('row-drag-overlay').remove()">إلغاء</button>
        <button class="mbtn mbtn-primary" onclick="applyRDRows()">تطبيق</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});
  buildRDGrid(maxR,cols,cellSize);
}

function buildRDGrid(maxR,cols,cellSize){
  const wrap=document.getElementById('rd-grid');if(!wrap)return;
  wrap.innerHTML='';
  let isDragging=false;
  for(let i=0;i<maxR;i++){
    const cell=document.createElement('div');
    cell.className='gdm-cell';
    cell.style.width=cellSize+'px';cell.style.height=cellSize+'px';
    cell.dataset.i=i;

    const updateFromCell=()=>{
      rdSelectedRows=i+1;
      document.getElementById('rd-count-inp').value=rdSelectedRows;
      document.getElementById('rd-count-label').textContent=rdSelectedRows+' صف';
      updateRDGrid();
    };
    cell.addEventListener('mousedown',e=>{e.preventDefault();isDragging=true;updateFromCell()});
    cell.addEventListener('mouseup',()=>{isDragging=false});
    cell.addEventListener('mousemove',()=>{if(isDragging)updateFromCell()});
    cell.addEventListener('mouseenter',()=>{
      if(!isDragging){
        wrap.querySelectorAll('.gdm-cell').forEach((cc,j)=>{
          cc.classList.remove('hovered');
          if(j<=i)cc.classList.add('hovered');
        });
      }
    });
    cell.addEventListener('mouseleave',()=>{if(!isDragging)wrap.querySelectorAll('.gdm-cell').forEach(cc=>cc.classList.remove('hovered'))});
    wrap.appendChild(cell);
  }
  // Touch
  wrap.addEventListener('touchstart',e=>{isDragging=true},{passive:true});
  wrap.addEventListener('touchend',()=>{isDragging=false});
  wrap.addEventListener('touchmove',e=>{
    const t=e.touches[0];
    const el=document.elementFromPoint(t.clientX,t.clientY);
    if(el&&el.dataset&&el.dataset.i!==undefined&&isDragging){
      rdSelectedRows=parseInt(el.dataset.i)+1;
      document.getElementById('rd-count-inp').value=rdSelectedRows;
      document.getElementById('rd-count-label').textContent=rdSelectedRows+' صف';
      updateRDGrid();
    }
  },{passive:true});
  updateRDGrid();
}

function updateRDGrid(){
  const wrap=document.getElementById('rd-grid');if(!wrap)return;
  wrap.querySelectorAll('.gdm-cell').forEach((cc,j)=>{
    cc.classList.remove('selected','hovered');
    if(j<rdSelectedRows)cc.classList.add('selected');
  });
}

function applyRDRows(){
  updateRowCount(rdSelectedRows);
  document.getElementById('row-drag-overlay').remove();
  document.getElementById('gc-rows').value=rdSelectedRows;
}

// ─── COLUMN COLOR PICKER ───
function openColColorPicker(e,ci,btnEl){
  e.stopPropagation();
  const panel=document.getElementById('col-cp-panel');
  panel.innerHTML='';
  COLORS_COLS.forEach(c=>{
    const btn=document.createElement('button');
    btn.className='cp-sw';
    btn.style.background=c;
    const tbl=getTable();
    if(tbl&&tbl.cols[ci]&&(tbl.cols[ci].headerColor||'var(--hdr2)')===c)btn.classList.add('sel');
    btn.onclick=ev=>{
      ev.stopPropagation();
      const t=getTable();if(!t)return;
      t.cols[ci].headerColor=c;
      saveData();renderTable();
      panel.classList.remove('open');
    };
    panel.appendChild(btn);
  });
  const rect=e.target.getBoundingClientRect();
  panel.style.top=(rect.bottom+6)+'px';
  const right=window.innerWidth-rect.right+rect.width/2;
  panel.style.right=Math.max(4,right)+'px';
  panel.style.left='auto';
  panel.classList.add('open');
  setTimeout(()=>document.addEventListener('click',function once(){panel.classList.remove('open');document.removeEventListener('click',once)}),50);
}

function rerenderRows(){
  const tbl=getTable();if(!tbl)return;
  const tbody=document.getElementById('main-tbody');if(!tbody)return;
  tbody.innerHTML='';
  tbl.rows.forEach((row,ri)=>appendRowEl(row,ri,tbl,tbody));
}

function appendRowEl(row,ri,tbl,tbody){
  const tr=document.createElement('tr');
  tr.style.background=row._color||'#fff';

  // Color td (vertical color picker trigger)
  const ctd=document.createElement('td');ctd.className='color-td';
  const cbtn=document.createElement('button');cbtn.className='color-dot';
  cbtn.style.background=row._color||'#fff';
  cbtn.title='لون الصف';
  cbtn.onclick=e=>openColorPicker(e,ri,cbtn,tr);
  ctd.appendChild(cbtn);tr.appendChild(ctd);

  const maxCells=Math.max(tbl.cols.length,row.cells.length);

  for(let ci=0;ci<maxCells;ci++){
    const td=document.createElement('td');
    const isExtra=ci>=tbl.cols.length;
    if(isExtra)td.className='extra-cell-td';
    const colType=tbl.cols[ci]?.type||'text';
    const isNum=colType==='number'||colType==='count';
    const inp=document.createElement('input');
    inp.className='cell-inp'+(isNum?' num-cell':'');
    inp.type=isNum?'number':(colType==='date'?'date':'text');
    inp.value=row.cells[ci]||'';
    inp.placeholder=isExtra?'➕':'-';
    inp.addEventListener('input',()=>{row.cells[ci]=inp.value;saveData();redrawSummary()});
    inp.addEventListener('keydown',e=>cellKey(e,ri,ci));
    td.appendChild(inp);
    tr.appendChild(td);
  }

  // Add cell button
  const addCellTd=document.createElement('td');addCellTd.style.padding='0';
  const addCellBtn=document.createElement('button');addCellBtn.className='row-add-cell';addCellBtn.title='إضافة خانة';addCellBtn.textContent='+';
  addCellBtn.onclick=()=>{row.cells.push('');saveData();rerenderRows();redrawSummary()};
  addCellTd.appendChild(addCellBtn);tr.appendChild(addCellTd);

  // Delete row
  const delTd=document.createElement('td');delTd.className='row-del-td';
  const delBtn=document.createElement('button');delBtn.className='row-del-btn';delBtn.textContent='✕';
  delBtn.onclick=()=>{tbl.rows.splice(ri,1);saveData();rerenderRows();redrawSummary();renderSidebar();const inp=document.getElementById('gc-rows');if(inp)inp.value=tbl.rows.length};
  delTd.appendChild(delBtn);tr.appendChild(delTd);

  tbody.appendChild(tr);
}

function cellKey(e,ri,ci){
  if(e.key==='Enter'){
    e.preventDefault();
    const tbl=getTable();if(!tbl)return;
    if(ri===tbl.rows.length-1)addRow();
    else{
      const tbody=document.getElementById('main-tbody');
      const rows=tbody.querySelectorAll('tr');
      const inp=rows[ri+1]?.querySelectorAll('.cell-inp')[ci];
      if(inp)inp.focus();
    }
  }
}

// ─── TABLE ACTIONS ───
function addCol(){
  const tbl=getTable();if(!tbl)return;
  tbl.cols.push({name:'',type:'text',headerColor:'var(--hdr2)'});
  saveData();renderTable();
  setTimeout(()=>{const ins=document.querySelectorAll('.col-name-inp');if(ins.length)ins[ins.length-1].focus()},30);
}
function delCol(ci){
  const tbl=getTable();if(!tbl)return;
  if(!confirm('حذف العمود؟'))return;
  tbl.cols.splice(ci,1);
  saveData();renderTable();
}
function addRow(){
  const tbl=getTable();if(!tbl)return;
  const cells=Array(tbl.cols.length).fill('');
  tbl.rows.push({cells,_color:'#ffffff'});
  saveData();
  const tbody=document.getElementById('main-tbody');
  const ri=tbl.rows.length-1;
  appendRowEl(tbl.rows[ri],ri,tbl,tbody);
  redrawSummary();
  renderSidebar();
  const inp=document.getElementById('gc-rows');if(inp)inp.value=tbl.rows.length;
  setTimeout(()=>{const rows=tbody.querySelectorAll('tr');const inp=rows[rows.length-1]?.querySelector('.cell-inp');if(inp)inp.focus()},30);
}

// ─── SUMMARY ───
function redrawSummary(){
  const tbl=getTable();const grid=document.getElementById('sum-grid');
  if(!tbl||!grid)return;
  const cur=tbl.cur||'IQD';const sym=SYM[cur];
  let cards=[];
  cards.push(`<div class="sum-card"><div class="sum-card-label">عدد الصفوف</div><div class="sum-card-val">${tbl.rows.length}</div></div>`);
  cards.push(`<div class="sum-card"><div class="sum-card-label">عدد الأعمدة</div><div class="sum-card-val">${tbl.cols.length}</div></div>`);

  tbl.cols.forEach((col,ci)=>{
    if(col.type==='number'){
      let sum=0,cnt=0;
      tbl.rows.forEach(r=>{const v=parseFloat(r.cells[ci]);if(!isNaN(v)){sum+=v;cnt++}});
      if(cnt===0&&!col.name)return;
      const iqd=toIQD(sum,cur);
      cards.push(`<div class="sum-card">
        <div class="sum-card-label">مجموع ${h(col.name)||'مبلغ'}</div>
        <div class="sum-card-val">${fmtN(sum)} ${sym}</div>
        <div class="sum-subs">
          <div class="sum-sub"><span class="c-iqd">🇮🇶 ${fmtN(iqd)} د.ع</span></div>
          <div class="sum-sub"><span class="c-usd">🇺🇸 ${fmtN(fromIQD(iqd,'USD'),2)} $</span></div>
          <div class="sum-sub"><span class="c-eur">🇪🇺 ${fmtN(fromIQD(iqd,'EUR'),2)} €</span></div>
        </div>
      </div>`);
    }
    if(col.type==='count'){
      let sum=0;tbl.rows.forEach(r=>{const v=parseFloat(r.cells[ci]);if(!isNaN(v))sum+=v});
      cards.push(`<div class="sum-card"><div class="sum-card-label">مجموع ${h(col.name)||'عدد'}</div><div class="sum-card-val">${fmtN(sum)}</div></div>`);
    }
    if(col.type==='text'&&col.name){
      const c={};tbl.rows.map(r=>r.cells[ci]||'').filter(v=>v.trim()).forEach(v=>{c[v]=(c[v]||0)+1});
      const top=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,3);
      if(top.length)cards.push(`<div class="sum-card">
        <div class="sum-card-label">تكرار ${h(col.name)}</div>
        <div class="sum-card-val">${Object.keys(c).length} قيمة</div>
        <div class="sum-subs">${top.map(([k,v])=>`<div class="sum-sub">${h(k)}: <strong>${v}</strong></div>`).join('')}</div>
      </div>`);
    }
  });

  const maxExtra=Math.max(...tbl.rows.map(r=>r.cells.length),0)-tbl.cols.length;
  if(maxExtra>0){
    for(let ei=0;ei<maxExtra;ei++){
      const ci=tbl.cols.length+ei;
      let sum=0,hasNum=false;
      tbl.rows.forEach(r=>{const v=parseFloat(r.cells[ci]);if(!isNaN(v)){sum+=v;hasNum=true}});
      if(hasNum)cards.push(`<div class="sum-card"><div class="sum-card-label">خانة إضافية ${ei+1}</div><div class="sum-card-val">${fmtN(sum)}</div></div>`);
    }
  }

  grid.innerHTML=cards.join('');
}

// ─── COLOR PICKER (VERTICAL) ───
function openColorPicker(e,ri,btnEl,rowEl){
  e.stopPropagation();
  const panel=document.getElementById('cp-panel');
  const tbl=getTable();
  const currentColor=tbl.rows[ri]._color||'#ffffff';
  panel.innerHTML='';

  COLORS_ROWS.forEach(section=>{
    const lbl=document.createElement('div');
    lbl.className='cp-section-label';lbl.textContent=section.label;
    panel.appendChild(lbl);
    section.colors.forEach(c=>{
      const btn=document.createElement('button');
      btn.className='cp-sw'+(cur
