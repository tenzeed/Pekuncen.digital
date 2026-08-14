// ============================================================
// Pekuncen Digital - RW 08 Blok Pekuncen
// ============================================================
const defaultInfoText = "Halo <b>{NAMA}</b>, selamat datang di Portal Layanan Modern Mandiri Pekuncen Digital. Melalui aplikasi ini kamu bisa memantau kas warga, membuat pengaduan masalah lingkungan secara real-time, mengajukan surat pengantar digital secara instan, serta memverifikasi data sumbangan dengan aman.";
let infoWargaTimer = null;
let dashboardCache = null;
function linkify(text) {
  if (!text) return '';
  let urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    return `<a href="${url}" target="_blank" class="text-blue-600 underline fw-bold" style="color: #2563eb; text-decoration: underline;" onclick="event.stopPropagation();">${url}</a>`;
  });
}
async function muatInfoWargaRealtime() {
  const teks = await callGASGet('getInfoWarga');
  let el = document.getElementById('infoWargaTextDisplay');
  if (el) {
    let rawText = (typeof teks === 'string') ? teks : (teks && teks.data ? teks.data : '');
    let finalText = (rawText && rawText.trim() !== '') ? rawText : defaultInfoText;
    finalText = finalText.replace(/\{NAMA\}/g, session.nama || 'Warga');
    el.innerHTML = linkify(finalText);
  }
}
async function simpanInfoWarga() {
  let textarea = document.getElementById('editInfoTextarea');
  let textBaru = textarea ? textarea.value : '';
  if (textBaru) {
    let btnSimpan = document.querySelector('#modalEditInfo .btn-primary');
    if (btnSimpan) {
      btnSimpan.innerText = 'Menyimpan...';
      btnSimpan.disabled = true;
    }
    const res = await callGASPost('simpanInfoWarga', { teksBaru: textBaru });
    if (btnSimpan) {
      btnSimpan.innerText = 'Simpan Perubahan';
      btnSimpan.disabled = false;
    }
    if (res && res.status === 'success') {
      alert('Informasi Warga berhasil diperbarui!');
      let modalEl = document.getElementById('modalEditInfo');
      if (modalEl) {
        let modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
      }
      setTimeout(() => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }, 300);
      muatInfoWargaRealtime();
    } else {
      alert('Gagal menyimpan: ' + (res ? res.message : 'Respon kosong'));
    }
  }
}
async function bukaModalEditInfo() {
  let modalEl = document.getElementById('modalEditInfo');
  if (!modalEl) return;
  if (modalEl.parentElement !== document.body) {
    document.body.appendChild(modalEl);
  }
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  let textarea = document.getElementById('editInfoTextarea');
  if (textarea) textarea.value = "Memuat data dari database...";
  let modalInstance = bootstrap.Modal.getInstance(modalEl);
  if (modalInstance) {
    modalInstance.dispose();
  }
  modalInstance = new bootstrap.Modal(modalEl);
  modalInstance.show();
  const teks = await callGASGet('getInfoWarga');
  let rawText = (typeof teks === 'string') ? teks : (teks && teks.data ? teks.data : '');
  if (textarea) {
    textarea.value = (rawText && rawText.trim() !== '') ? rawText : defaultInfoText;
  }
}
async function loadDashboardView() {
  currentActiveMenu = 'Dashboard';
  if (typeof syncActiveNav === 'function') syncActiveNav('Dashboard');
  let titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.innerText = 'Dashboard Utama';
  if (document.getElementById('rek-info')) document.getElementById('rek-info').style.display = 'none';
  let oldModal = document.getElementById('modalEditInfo');
  if (oldModal) oldModal.remove();

  let initialRes = dashboardCache || {
    role: session?.role || 'Warga',
    warga: 0, aduan: 0, keuangan: 0, surat: 0, sumbangan: 0
  };
  renderDashboardLayout(initialRes);
  await fetchFreshDashboardData();
}
async function fetchFreshDashboardData() {
  try {
    const res = await callGASGet('getDashboardSummary');
    if (res && res.status === 'success') {
      dashboardCache = res;
      renderDashboardLayout(res);
    } else if (!dashboardCache) {
      renderDashboardLayout({
        role: session?.role || 'Warga',
        warga: 0, aduan: 0, keuangan: 0, surat: 0, sumbangan: 0
      });
    }
  } catch(e) {
    if (!dashboardCache) {
      renderDashboardLayout({
        role: session?.role || 'Warga',
        warga: 0, aduan: 0, keuangan: 0, surat: 0, sumbangan: 0
      });
    }
  }
}
function renderDashboardLayout(res) {
  let htmlLayout = '';
  const RT_THEME = {
    '29': { accent: '#2563eb', soft: '#eff6ff', text: '#1d4ed8' },
    '30': { accent: '#0891b2', soft: '#ecfeff', text: '#0e7490' },
    '31': { accent: '#d97706', soft: '#fffbeb', text: '#b45309' },
    '32': { accent: '#e11d48', soft: '#fff1f2', text: '#be123c' }
  };

  if (res.role === 'RT') {
    let perRTCards = '';
    if (res.perRT) {
      ['29','30','31','32'].forEach(rt => {
        let d = res.perRT[rt] || { warga: 0, saldo: 0 };
        let saldoText = 'Rp ' + (d.saldo || 0).toLocaleString('id-ID');
        let th = RT_THEME[rt];
        perRTCards += `
          <div class="col-6 col-md-3">
            <div class="rt-summary-card" style="border-top: 3px solid ${th.accent};" onclick="loadMenu('Warga')">
              <div class="d-flex align-items-center gap-2 mb-2">
                <div class="rt-summary-icon" style="background:${th.soft}; color:${th.accent};">
                  <i class="bi bi-houses-fill"></i>
                </div>
                <div>
                  <div class="rt-summary-label">BLOK PEKUNCEN</div>
                  <div class="rt-summary-title" style="color:${th.text};">RT ${rt}</div>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center rt-summary-row">
                <span class="text-muted"><i class="bi bi-people-fill me-1"></i>Warga</span>
                <span class="fw-bold text-gray-800">${d.warga}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center rt-summary-row">
                <span class="text-muted"><i class="bi bi-wallet2 me-1"></i>Kas</span>
                <span class="fw-bold" style="color:${d.saldo >= 0 ? '#059669' : '#dc2626'};">${saldoText}</span>
              </div>
            </div>
          </div>`;
      });
    }
    htmlLayout = `
      <style>
        .rt-summary-card { background:#fff; border-radius:16px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.06); border:1px solid #f1f1f4; cursor:pointer; transition:transform .15s ease, box-shadow .15s ease; height:100%; }
        .rt-summary-card:hover { transform:translateY(-3px); box-shadow:0 8px 20px rgba(0,0,0,0.08); }
        .rt-summary-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
        .rt-summary-label { font-size:9px; font-weight:700; letter-spacing:0.04em; color:#9ca3af; }
        .rt-summary-title { font-size:1.05rem; font-weight:800; line-height:1.1; }
        .rt-summary-row { font-size:11px; padding:3px 0; border-top:1px dashed #eef0f3; }
        .rt-summary-row:first-of-type { border-top:none; }
      </style>
      <p class="fw-bold text-secondary mb-2" style="font-size:0.85rem;"><i class="bi bi-diagram-3-fill me-1"></i> Ringkasan per RT — Blok Pekuncen</p>
      <div class="row g-3 mb-4">${perRTCards}</div>
      <div class="row text-center d-none d-md-flex g-4 mb-4">
        <div class="col-md-4"><div class="card card-custom border-start border-primary border-4"><h5><i class="bi bi-people-fill text-primary me-2"></i>Total Warga (RW 08)</h5><h2 class="fw-bold text-primary mt-2">${res.warga || 0} Warga</h2></div></div>
        <div class="col-md-4"><div class="card card-custom border-start border-warning border-4"><h5><i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>Aduan Masuk</h5><h2 class="fw-bold text-warning mt-2">${res.aduan || 0} Laporan</h2></div></div>
        <div class="col-md-4"><div class="card card-custom border-start border-success border-4"><h5><i class="bi bi-cash-stack text-success me-2"></i>Data Transaksi</h5><h2 class="fw-bold text-success mt-2">${res.keuangan || 0} Laporan</h2></div></div>
      </div>
      <div class="d-block d-md-none">
        <div class="quick-actions-grid">
          <div class="quick-action-item" onclick="loadMenu('Warga')"><div class="quick-action-icon"><i class="bi bi-people-fill"></i></div>Warga</div>
          <div class="quick-action-item" onclick="loadMenu('Kelahiran')"><div class="quick-action-icon"><i class="bi bi-gender-ambiguous"></i></div>Kelahiran</div>
          <div class="quick-action-item" onclick="loadMenu('Kematian')"><div class="quick-action-icon"><i class="bi bi-heartbreak-fill"></i></div>Kematian</div>
          <div class="quick-action-item" onclick="loadMenu('PindahMasuk')"><div class="quick-action-icon"><i class="bi bi-box-arrow-in-right"></i></div>Pindah Masuk</div>
          <div class="quick-action-item" onclick="loadMenu('PindahKeluar')"><div class="quick-action-icon"><i class="bi bi-box-arrow-left"></i></div>Pindah Keluar</div>
          <div class="quick-action-item" onclick="loadMenu('Pengaduan')"><div class="quick-action-icon"><i class="bi bi-chat-square-text-fill"></i></div>Aduan</div>
          <div class="quick-action-item" onclick="loadMenu('SuratPengantar')"><div class="quick-action-icon"><i class="bi bi-file-earmark-text-fill"></i></div>Surat</div>
          <div class="quick-action-item" onclick="loadMenu('Keuangan')"><div class="quick-action-icon"><i class="bi bi-wallet2"></i></div>Keuangan</div>
          <div class="quick-action-item" onclick="loadMenu('Sumbangan')"><div class="quick-action-icon"><i class="bi bi-gift-fill"></i></div>Sumbangan</div>
          <div class="quick-action-item" onclick="loadMenu('Aset')"><div class="quick-action-icon"><i class="bi bi-tools"></i></div>Inventaris</div>
          <div class="quick-action-item" onclick="loadMenu('Aspirasi')"><div class="quick-action-icon"><i class="bi bi-chat-heart-fill"></i></div>Aspirasi</div>
          <div class="quick-action-item" onclick="loadMenu('Pengaturan')"><div class="quick-action-icon"><i class="bi bi-gear-fill text-primary"></i></div>Pengaturan</div>
          <div class="quick-action-item" onclick="loadMenu('Profil')"><div class="quick-action-icon"><i class="bi bi-person-vcard text-primary"></i></div>Profil Saya</div>
        </div>
        <p class="fw-bold text-secondary mb-2" style="font-size:0.85rem;"><i class="bi bi-graph-up me-1"></i> Rekap Ringkasan RW</p>
        <div class="mobile-stats-grid">
          <div class="m-stat-card blue-card"><span class="m-stat-title">Total Warga</span><span class="m-stat-value">${res.warga || 0} Orang</span></div>
          <div class="m-stat-card teal-card"><span class="m-stat-title">Transaksi Beres</span><span class="m-stat-value">${res.keuangan || 0} Data</span></div>
          <div class="m-stat-card orange-card"><span class="m-stat-title">Aduan Masuk</span><span class="m-stat-value">${res.aduan || 0} Kasus</span></div>
          <div class="m-stat-card slate-card"><span class="m-stat-title">Status Sistem</span><span class="m-stat-value">Aktif</span></div>
        </div>
      </div>
    `;
  } else {
    htmlLayout = `
      <div class="row text-center d-none d-md-flex g-4 mb-4">
        <div class="col-md-4"><div class="card card-custom border-start border-warning border-4"><h5><i class="bi bi-chat-left-dots-fill text-warning me-2"></i>Aduan Saya</h5><h2 class="fw-bold text-warning mt-2">${res.aduan || 0} Laporan</h2></div></div>
        <div class="col-md-4"><div class="card card-custom border-start border-primary border-4"><h5><i class="bi bi-file-earmark-text-fill text-primary me-2"></i>Surat Saya</h5><h2 class="fw-bold text-primary mt-2">${res.surat || 0} Pengajuan</h2></div></div>
        <div class="col-md-4"><div class="card card-custom border-start border-success border-4"><h5><i class="bi bi-gift-fill text-success me-2"></i>Sumbangan Saya</h5><h2 class="fw-bold text-success mt-2">${res.sumbangan || 0} Data</h2></div></div>
      </div>
      <div class="d-block d-md-none">
        <div class="quick-actions-grid">
          <div class="quick-action-item" onclick="loadMenu('Warga')"><div class="quick-action-icon"><i class="bi bi-people-fill"></i></div>Warga</div>
          <div class="quick-action-item" onclick="loadMenu('Pengaduan')"><div class="quick-action-icon"><i class="bi bi-chat-square-text-fill"></i></div>Aduan</div>
          <div class="quick-action-item" onclick="loadMenu('SuratPengantar')"><div class="quick-action-icon"><i class="bi bi-file-earmark-text-fill"></i></div>Surat</div>
          <div class="quick-action-item" onclick="loadMenu('Keuangan')"><div class="quick-action-icon"><i class="bi bi-wallet2"></i></div>Keuangan</div>
          <div class="quick-action-item" onclick="loadMenu('Sumbangan')"><div class="quick-action-icon"><i class="bi bi-gift-fill"></i></div>Sumbangan</div>
          <div class="quick-action-item" onclick="loadMenu('Aset')"><div class="quick-action-icon"><i class="bi bi-tools"></i></div>Inventaris</div>
          <div class="quick-action-item" onclick="loadMenu('Aspirasi')"><div class="quick-action-icon"><i class="bi bi-chat-heart-fill"></i></div>Aspirasi</div>
          <div class="quick-action-item" onclick="loadMenu('Profil')"><div class="quick-action-icon"><i class="bi bi-person-vcard text-primary"></i></div>Profil Saya</div>
        </div>
        <p class="fw-bold text-secondary mb-2" style="font-size:0.85rem;"><i class="bi bi-graph-up me-1"></i> Rekap Laporan Saya</p>
        <div class="mobile-stats-grid">
          <div class="m-stat-card orange-card"><span class="m-stat-title">Aduan Saya</span><span class="m-stat-value">${res.aduan || 0} Laporan</span></div>
          <div class="m-stat-card blue-card"><span class="m-stat-title">Surat Saya</span><span class="m-stat-value">${res.surat || 0} Berkas</span></div>
          <div class="m-stat-card teal-card"><span class="m-stat-title">Sumbangan Saya</span><span class="m-stat-value">${res.sumbangan || 0} Data</span></div>
          <div class="m-stat-card slate-card"><span class="m-stat-title">Status Akun</span><span class="m-stat-value">Terverifikasi</span></div>
        </div>
      </div>
    `;
  }

  let btnEditAdmin = res.role === 'RT' 
    ? `<button class="btn btn-warning btn-sm fw-bold me-2" onclick="bukaModalEditInfo()"><i class="bi bi-pencil-square me-1"></i> Edit Info Warga</button>` 
    : '';

  htmlLayout += `
    <div class="card card-custom mt-2">
      <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-2">
        <h5 class="fw-bold text-dark mb-2 mb-md-0"><i class="bi bi-clock-history me-2"></i>Informasi Warga</h5>
        <div class="d-flex align-items-center">
          ${btnEditAdmin}
          <button class="btn btn-outline-primary btn-sm fw-bold d-none d-md-block" onclick="loadMenu('Profil')"><i class="bi bi-person-vcard me-1"></i> Buka Profil & Keluarga</button>
        </div>
      </div>
      <p id="infoWargaTextDisplay" class="text-muted small mb-0"><span class="spinner-border spinner-border-sm text-primary"></span> Memuat informasi...</p>
    </div>
    <!-- Modal Edit Informasi Khusus RT Admin -->
    <div class="modal fade" id="modalEditInfo" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold"><i class="bi bi-pencil-square me-2"></i>Edit Informasi Warga</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label font-weight-bold small text-secondary">Teks Informasi (Gunakan <code>{NAMA}</code> untuk nama warga otomatis)</label>
              <textarea id="editInfoTextarea" class="form-control" rows="5" placeholder="Masukkan teks informasi warga..."></textarea>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary fw-bold" onclick="simpanInfoWarga()">Simpan Perubahan</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('main-content').innerHTML = htmlLayout;
  muatInfoWargaRealtime();
  if (infoWargaTimer) clearInterval(infoWargaTimer);
  infoWargaTimer = setInterval(muatInfoWargaRealtime, 10000);
}
