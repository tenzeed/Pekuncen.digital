// ============================================================
// SURAT TEMPLATES - Template PDF per Jenis Surat - Pekuncen Digital RW 08
// Pekuncen Digital - RW 08 Blok Pekuncen
// ============================================================
const JENIS_SURAT_LIST = [
  { value: 'Surat Pengantar Umum',             kode: 'SP',         label: 'Surat Pengantar Umum' },
  { value: 'Pengantar SKCK',                   kode: 'SKCK',       label: 'Pengantar SKCK' },
  { value: 'Surat Keterangan Tidak Mampu',     kode: 'SKTM',       label: 'Surat Keterangan Tidak Mampu (SKTM)' },
  { value: 'Surat Keterangan Domisili Usaha',  kode: 'SKDU',       label: 'Surat Keterangan Domisili Usaha (SKDU)' },
  { value: 'Surat Keterangan Pindah',          kode: 'PINDAH',     label: 'Surat Keterangan Pindah Domisili' },
  { value: 'Pengantar Nikah',                  kode: 'NIKAH',      label: 'Surat Pengantar Nikah' },
  { value: 'Surat Keterangan Ahli Waris',      kode: 'AHLI_WARIS', label: 'Surat Keterangan Ahli Waris' },
  { value: 'Surat Izin Keramaian',             kode: 'IZIN',       label: 'Surat Izin Keramaian/Acara' },
];

function getKodeSurat(jenisSurat) {
  if (!jenisSurat) return 'SP';
  let str = jenisSurat.split('|')[0].toLowerCase().trim();
  if (str.includes('keramaian') || str.includes('izin')) return 'IZIN';
  if (str.includes('skck') || str.includes('kepolisian')) return 'SKCK';
  if (str.includes('sktm') || str.includes('tidak mampu')) return 'SKTM';
  if (str.includes('skdu') || str.includes('usaha')) return 'SKDU';
  if (str.includes('pindah')) return 'PINDAH';
  if (str.includes('nikah')) return 'NIKAH';
  if (str.includes('waris')) return 'AHLI_WARIS';
  let found = JENIS_SURAT_LIST.find(j => j.value.toLowerCase() === str || str.includes(j.value.toLowerCase()) || j.value.toLowerCase().includes(str));
  return found ? found.kode : 'SP';
}

function renderSuratBody(jenisSurat, data) {
  // data: { namaWarga, nikWarga, alamatWarga, rtWarga, keterangan, tanggalSurat }
  let { namaWarga, nikWarga, alamatWarga, rtWarga, keterangan, tanggalSurat } = data;
  let cleanJenis = (jenisSurat || '').split('|')[0].trim();
  let kode = getKodeSurat(cleanJenis);
  let rtRwText = (typeof appSettings !== 'undefined' && appSettings.rt_rw_text) ? appSettings.rt_rw_text : 'RW 08 - Blok Pekuncen';
  let rwNomor = (typeof appSettings !== 'undefined' && appSettings.rw_number) ? appSettings.rw_number : '08';
  let rtRwWarga = (rtWarga && rtWarga !== '-') ? `RT ${rtWarga} / RW ${rwNomor}` : `RW ${rwNomor}`;
  let pembukaSurat = `Yang bertanda tangan di bawah ini, Pengurus Rukun Warga (RW) ${rwNomor} Blok Pekuncen, dengan ini menerangkan dengan sesungguhnya bahwa:`;

  // Parse extra fields from jenisSurat payload or keterangan
  let extra = {};
  if (jenisSurat && jenisSurat.includes('|')) {
    try { extra = JSON.parse(jenisSurat.split('|').slice(1).join('|')); } catch(e) {}
  }
  if (Object.keys(extra).length === 0 && keterangan && keterangan !== '{' && keterangan !== 'null' && keterangan !== '-') {
    if (typeof keterangan === 'object') {
      extra = keterangan;
    } else if (typeof keterangan === 'string') {
      let trimmed = keterangan.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try { extra = JSON.parse(trimmed); } catch(e) { extra = {}; }
      } else {
        extra = {
          catatan: trimmed,
          nama_acara: trimmed,
          nama_usaha: trimmed,
          keperluan: trimmed,
          alamat_baru: trimmed,
          nama_almarhum: trimmed
        };
      }
    }
  }

  const dataWargaTable = `
    <table class="table-data">
      <tr><td class="label">Nama Lengkap</td><td width="10">:</td><td><b>${namaWarga}</b></td></tr>
      <tr><td class="label">NIK</td><td>:</td><td>${nikWarga}</td></tr>
      <tr><td class="label">Alamat</td><td>:</td><td>${alamatWarga}</td></tr>
      <tr><td class="label">RT / RW</td><td>:</td><td>${rtRwWarga}</td></tr>
    </table>`;

  if (kode === 'SKCK') {
    return {
      judul: 'SURAT PENGANTAR SKCK',
      nomorKode: 'SKCK',
      isi: `
        <p>${pembukaSurat}</p>
        ${dataWargaTable}
        <p>Adalah benar warga kami yang berdomisili di alamat tersebut di atas dan berkelakuan baik selama bertempat tinggal di lingkungan ${rtRwText}. Surat pengantar ini dibuat untuk keperluan <b>pengurusan Surat Keterangan Catatan Kepolisian (SKCK)</b>${extra.keperluan ? `, yaitu untuk <b>${extra.keperluan}</b>` : ''} di Kepolisian Sektor (Polsek) setempat.</p>
        <p>Sepanjang pengetahuan dan catatan administrasi kami, yang bersangkutan tidak pernah terlibat dalam tindak pidana maupun perbuatan yang bertentangan dengan hukum dan ketertiban masyarakat.</p>
        <p>Demikian surat pengantar ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
      `
    };
  }

  if (kode === 'SKTM') {
    let keperluan = extra.keperluan || extra.catatan || keterangan || '-';
    return {
      judul: 'SURAT KETERANGAN TIDAK MAMPU',
      nomorKode: 'SKTM',
      isi: `
        <p>${pembukaSurat}</p>
        ${dataWargaTable}
        <p>Berdasarkan pengamatan dan catatan administrasi kami di lingkungan ${rtRwText}, yang bersangkutan benar merupakan warga dengan <b>kondisi ekonomi kurang mampu</b> dan memerlukan keringanan/bantuan.</p>
        <p>Surat Keterangan Tidak Mampu ini diterbitkan untuk keperluan: <b>${keperluan}</b>.</p>
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya. Apabila di kemudian hari keterangan ini terbukti tidak sesuai dengan keadaan sebenarnya, kami bersedia bertanggung jawab sepenuhnya.</p>
      `
    };
  }

  if (kode === 'SKDU') {
    let namaUsaha = extra.nama_usaha || extra.namaUsaha || extra.catatan || '-';
    let jenisUsaha = extra.jenis_usaha || extra.jenisUsaha || '-';
    return {
      judul: 'SURAT KETERANGAN DOMISILI USAHA',
      nomorKode: 'SKDU',
      isi: `
        <p>${pembukaSurat}</p>
        ${dataWargaTable}
        <p>Yang bersangkutan benar berdomisili di alamat tersebut di atas dan menjalankan kegiatan usaha di lingkungan ${rtRwText}, dengan keterangan usaha sebagai berikut:</p>
        <table class="table-data">
          <tr><td class="label">Nama Usaha</td><td width="10">:</td><td><b>${namaUsaha}</b></td></tr>
          <tr><td class="label">Jenis Usaha</td><td>:</td><td>${jenisUsaha}</td></tr>
          <tr><td class="label">Lokasi Usaha</td><td>:</td><td>${alamatWarga}</td></tr>
        </table>
        <p>Demikian Surat Keterangan Domisili Usaha ini dibuat dengan sebenarnya untuk digunakan sebagai kelengkapan pengurusan izin usaha yang berlaku.</p>
      `
    };
  }

  if (kode === 'PINDAH') {
    let alamatBaru = extra.alamat_baru || extra.alamatBaru || extra.catatan || '-';
    return {
      judul: 'SURAT KETERANGAN PINDAH DOMISILI',
      nomorKode: 'PINDAH',
      isi: `
        <p>${pembukaSurat}</p>
        ${dataWargaTable}
        <p>Adalah benar warga kami yang selama ini berdomisili di alamat tersebut di atas. Sehubungan dengan rencana <b>pindah domisili/tempat tinggal</b>, yang bersangkutan akan pindah ke alamat berikut:</p>
        <table class="table-data">
          <tr><td class="label">Alamat Tujuan</td><td width="10">:</td><td><b>${alamatBaru}</b></td></tr>
        </table>
        <p>Dengan diterbitkannya surat ini, yang bersangkutan beserta anggota keluarga yang tercatat dalam Kartu Keluarga (jika ada) dinyatakan telah melapor pindah dari lingkungan ${rtRwText}.</p>
        <p>Demikian Surat Keterangan Pindah Domisili ini dibuat dengan sebenarnya untuk digunakan sebagai kelengkapan administrasi kependudukan di tempat tujuan.</p>
      `
    };
  }

  if (kode === 'NIKAH') {
    let statusNikah = extra.status_nikah || extra.statusNikah || extra.catatan || 'Belum Menikah';
    return {
      judul: 'SURAT PENGANTAR NIKAH',
      nomorKode: 'NIKAH',
      isi: `
        <p>${pembukaSurat}</p>
        ${dataWargaTable}
        <p>Adalah benar warga kami yang berdomisili di alamat tersebut di atas. Berdasarkan catatan administrasi kependudukan di lingkungan ${rtRwText}, yang bersangkutan berstatus <b>${statusNikah}</b> dan tidak dalam ikatan pernikahan yang sah dengan pihak lain.</p>
        <p>Surat pengantar ini diterbitkan untuk keperluan <b>pengurusan administrasi pernikahan/akad nikah</b> di Kantor Urusan Agama (KUA) setempat.</p>
        <p>Demikian surat pengantar ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
      `
    };
  }

  if (kode === 'AHLI_WARIS') {
    let namaAlmarhum = extra.nama_almarhum || extra.namaAlmarhum || '-';
    let tglMeninggal = extra.tgl_meninggal || extra.tglMeninggal || '-';
    let hubunganWaris = extra.hubungan_waris || extra.hubunganWaris || '-';
    let daftarWarisRaw = extra.daftar_waris || extra.catatan || '';
    let daftarWarisList = daftarWarisRaw
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    let daftarWarisHtml = daftarWarisList.length > 0
      ? `<ol style="margin:4px 0 0 0; padding-left:20px;">${daftarWarisList.map(w => `<li>${w.replace(/^\d+[\.\)]\s*/, '')}</li>`).join('')}</ol>`
      : `<p style="margin:4px 0 0 0; font-style:italic; color:#666;">(Belum diisi rincian ahli waris)</p>`;
    return {
      judul: 'SURAT KETERANGAN AHLI WARIS',
      nomorKode: 'AW',
      isi: `
        <p>${pembukaSurat}</p>
        ${dataWargaTable}
        <p>Adalah benar warga kami dengan status <b>${hubunganWaris}</b> dari almarhum/almarhumah berikut:</p>
        <table class="table-data">
          <tr><td class="label">Nama Almarhum/ah</td><td width="10">:</td><td><b>${namaAlmarhum}</b></td></tr>
          <tr><td class="label">Tanggal Meninggal</td><td>:</td><td>${tglMeninggal}</td></tr>
          <tr><td class="label">Tempat Tinggal Terakhir</td><td>:</td><td>${alamatWarga}, ${rtRwWarga}</td></tr>
        </table>
        <p>Berdasarkan catatan dan keterangan yang dapat dipertanggungjawabkan, yang meninggal dunia tersebut memiliki ahli waris sah sebagai berikut:</p>
        ${daftarWarisHtml}
        <p style="margin-top:10px;">Surat Keterangan Ahli Waris ini dibuat dengan sebenarnya untuk digunakan sebagai kelengkapan administrasi pengurusan harta peninggalan/warisan sesuai peraturan yang berlaku. Apabila di kemudian hari terdapat pihak lain yang mengajukan keberatan atau keberadaan ahli waris lain yang belum tercantum, akan menjadi tanggung jawab pemohon sepenuhnya.</p>
      `
    };
  }

  if (kode === 'IZIN') {
    let namaAcara  = extra.nama_acara  || extra.namaAcara  || extra.catatan || '-';
    let tglAcara   = extra.tgl_acara   || extra.tglAcara   || tanggalSurat  || '-';
    let jamMulai   = extra.jam_mulai   || extra.jamMulai   || '-';
    let jamSelesai = extra.jam_selesai || extra.jamSelesai || '-';
    return {
      judul: 'SURAT KETERANGAN IZIN KERAMAIAN',
      nomorKode: 'IZIN',
      isi: `
        <p>${pembukaSurat}</p>
        ${dataWargaTable}
        <p>Telah mengajukan permohonan izin untuk menyelenggarakan kegiatan/acara di wilayah ${rtRwText} dengan rincian sebagai berikut:</p>
        <table class="table-data">
          <tr><td class="label">Nama / Jenis Acara</td><td width="10">:</td><td><b>${namaAcara}</b></td></tr>
          <tr><td class="label">Lokasi Acara</td><td>:</td><td>${alamatWarga}</td></tr>
          <tr><td class="label">Tanggal Acara</td><td>:</td><td>${tglAcara}</td></tr>
          <tr><td class="label">Waktu Pelaksanaan</td><td>:</td><td>${jamMulai} s/d ${jamSelesai} WIB</td></tr>
        </table>
        <p>Kami selaku pengurus ${rtRwText} <b>tidak keberatan</b> dan mengizinkan penyelenggaraan kegiatan tersebut, dengan ketentuan penyelenggara wajib menjaga ketertiban, keamanan, dan kebersihan lingkungan sekitar selama acara berlangsung.</p>
        <p>Demikian surat keterangan izin ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
      `
    };
  }

  // DEFAULT: Surat Pengantar Umum (SP)
  let cleanKeterangan = extra.catatan || extra.keperluan || (typeof keterangan === 'string' && !keterangan.trim().startsWith('{') ? keterangan : '-');
  return {
    judul: 'SURAT PENGANTAR',
    nomorKode: 'SP',
    isi: `
      <p>${pembukaSurat}</p>
      ${dataWargaTable}
      <p>Berdasarkan catatan administrasi kami, yang bersangkutan benar warga yang berdomisili di alamat tersebut di atas dan tercatat aktif di lingkungan ${rtRwText}.</p>
      <p>Surat Pengantar ini diterbitkan untuk keperluan: <b>${cleanKeterangan}</b>.</p>
      <p>Demikian Surat Pengantar ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
    `
  };
}

window.renderExtraSuratFields = function(selectedJenis, existingVal = {}) {
  let container = document.getElementById('extra-surat-fields-container');
  if (!container) return;
  
  if (!selectedJenis) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  
  let kode = typeof getKodeSurat === 'function' ? getKodeSurat(selectedJenis) : '';
  container.style.display = 'block';
  
  let html = `<div class="mb-2"><h6 class="font-bold text-xs text-primary mb-1"><i class="bi bi-file-earmark-plus-fill me-1"></i> Data Khusus ${selectedJenis}</h6><small class="text-muted text-[10px]">Isi data spesifik di bawah ini untuk dicetak pada dokumen PDF.</small></div>`;
  
  if (kode === 'IZIN') {
    html += `
      <div class="row g-2">
        <div class="col-12 mb-1">
          <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Nama / Jenis Acara <span class="text-danger">*</span></label>
          <input type="text" class="form-control form-control-sm extra-surat-input" data-extra-key="nama_acara" value="${existingVal.nama_acara || ''}" placeholder="Contoh: Hajatan Pernikahan / Syukuran / Pentas Seni">
        </div>
        <div class="col-12 col-md-6 mb-1">
          <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Tanggal Acara Pelaksanaan <span class="text-danger">*</span></label>
          <input type="date" class="form-control form-control-sm extra-surat-input" data-extra-key="tgl_acara" value="${existingVal.tgl_acara || ''}">
        </div>
        <div class="col-6 col-md-3 mb-1">
          <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Jam Mulai</label>
          <input type="time" class="form-control form-control-sm extra-surat-input" data-extra-key="jam_mulai" value="${existingVal.jam_mulai || ''}">
        </div>
        <div class="col-6 col-md-3 mb-1">
          <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Jam Selesai</label>
          <input type="time" class="form-control form-control-sm extra-surat-input" data-extra-key="jam_selesai" value="${existingVal.jam_selesai || ''}">
        </div>
      </div>`;
  } else if (kode === 'SKDU') {
    html += `
      <div class="row g-2">
        <div class="col-12 col-md-6 mb-1">
          <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Nama Usaha / Toko <span class="text-danger">*</span></label>
          <input type="text" class="form-control form-control-sm extra-surat-input" data-extra-key="nama_usaha" value="${existingVal.nama_usaha || ''}" placeholder="Contoh: Toko Berkah Jaya">
        </div>
        <div class="col-12 col-md-6 mb-1">
          <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Jenis Usaha / Bidang <span class="text-danger">*</span></label>
          <input type="text" class="form-control form-control-sm extra-surat-input" data-extra-key="jenis_usaha" value="${existingVal.jenis_usaha || ''}" placeholder="Contoh: Sembako / Kuliner / Konveksi">
        </div>
      </div>`;
  } else if (kode === 'SKTM') {
    html += `
      <div class="mb-1">
        <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Keperluan Pengurusan SKTM <span class="text-danger">*</span></label>
        <input type="text" class="form-control form-control-sm extra-surat-input" data-extra-key="keperluan" value="${existingVal.keperluan || ''}" placeholder="Contoh: Beasiswa Sekolah / Keringanan Biaya RS / BPJS">
      </div>`;
  } else if (kode === 'PINDAH') {
    html += `
      <div class="mb-1">
        <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Alamat Tujuan Pindah Lengkap <span class="text-danger">*</span></label>
        <textarea class="form-control form-control-sm extra-surat-input" data-extra-key="alamat_baru" rows="2" placeholder="Masukkan alamat lengkap tujuan pindah (RT, RW, Desa/Kel, Kec, Kab/Kota)...">${existingVal.alamat_baru || ''}</textarea>
      </div>`;
  } else if (kode === 'NIKAH') {
    html += `
      <div class="mb-1">
        <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Status Perkawinan Saat Ini <span class="text-danger">*</span></label>
        <select class="form-select form-select-sm extra-surat-input" data-extra-key="status_nikah">
          <option value="Belum Menikah" ${(existingVal.status_nikah || '') === 'Belum Menikah' ? 'selected' : ''}>Belum Menikah</option>
          <option value="Duda" ${(existingVal.status_nikah || '') === 'Duda' ? 'selected' : ''}>Duda</option>
          <option value="Janda" ${(existingVal.status_nikah || '') === 'Janda' ? 'selected' : ''}>Janda</option>
        </select>
      </div>`;
  } else if (kode === 'AHLI_WARIS') {
    html += `
      <div class="row g-2">
        <div class="col-12 col-md-6 mb-1">
          <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Nama Almarhum / Almarhumah <span class="text-danger">*</span></label>
          <input type="text" class="form-control form-control-sm extra-surat-input" data-extra-key="nama_almarhum" value="${existingVal.nama_almarhum || ''}" placeholder="Nama lengkap almarhum">
        </div>
        <div class="col-12 col-md-6 mb-1">
          <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Tanggal Meninggal Dunia</label>
          <input type="date" class="form-control form-control-sm extra-surat-input" data-extra-key="tgl_meninggal" value="${existingVal.tgl_meninggal || ''}">
        </div>
        <div class="col-12 mb-1">
          <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Hubungan Pemohon dengan Almarhum <span class="text-danger">*</span></label>
          <input type="text" class="form-control form-control-sm extra-surat-input" data-extra-key="hubungan_waris" value="${existingVal.hubungan_waris || ''}" placeholder="Contoh: Istri Sah / Anak Kandung / Suami">
        </div>
        <div class="col-12 mb-1">
          <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Daftar Lengkap Seluruh Ahli Waris</label>
          <textarea class="form-control form-control-sm extra-surat-input" data-extra-key="daftar_waris" rows="3" placeholder="Tulis satu nama per baris beserta hubungannya, contoh:&#10;1. Siti Aminah (Istri Sah)&#10;2. Budi Santoso (Anak Kandung)&#10;3. Ani Lestari (Anak Kandung)">${existingVal.daftar_waris || ''}</textarea>
        </div>
      </div>`;
  } else if (kode === 'SKCK') {
    html += `
      <div class="mb-1">
        <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Keperluan Pengurusan SKCK</label>
        <input type="text" class="form-control form-control-sm extra-surat-input" data-extra-key="keperluan" value="${existingVal.keperluan || ''}" placeholder="Contoh: Persyaratan Melamar Pekerjaan / CPNS">
      </div>`;
  } else {
    html += `
      <div class="mb-1">
        <label class="form-label text-[11px] font-semibold text-gray-700 mb-0">Keterangan / Catatan Tambahan</label>
        <input type="text" class="form-control form-control-sm extra-surat-input" data-extra-key="catatan" value="${existingVal.catatan || ''}" placeholder="Keterangan tambahan jika ada...">
      </div>`;
  }

  container.innerHTML = html;
};

