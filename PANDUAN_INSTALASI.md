# 📖 PANDUAN INSTALASI & SETUP — PEKUNCEN DIGITAL
## Sistem Informasi Warga RW 08, Blok Pekuncen (RT 29, 30, 31, 32)

Panduan ini berisi langkah-langkah setup dari nol sampai aplikasi bisa dipakai warga.

---

## 🛠️ PERSYARATAN (PREREQUISITES)

1. **Database Backend**: Akun Supabase (Gratis di [supabase.com](https://supabase.com)) — **buat project BARU**, jangan pakai project bekas aplikasi lama.
2. **Hosting Frontend**: GitHub Pages / Vercel / Netlify / cPanel Hosting (aplikasi ini 100% web statis PWA, tidak butuh server Node.js/PHP).

---

## 🚀 LANGKAH 1: SETUP DATABASE SUPABASE (5 MENIT)

1. **Buat Project Baru di Supabase**:
   - Login ke [supabase.com](https://supabase.com) → klik **New Project**.
   - Isi Nama Project (misal: `pekuncen-digital-rw08`), Password Database, pilih region terdekat (Singapore).
   - Tunggu 1–2 menit sampai project selesai dibuat.

2. **Jalankan Schema Database**:
   - Di dashboard Supabase, buka menu **SQL Editor** (ikon `>_` di sidebar kiri) → **New Query**.
   - Salin **seluruh** isi file `schema.sql` dari folder ini, tempel ke SQL Editor.
   - Klik **Run** (atau `Ctrl + Enter`).
   - Hasilnya: 16 tabel (semua bertag RT 29/30/31/32), 3 fungsi keamanan (`verify_user_login`, `admin_set_password`, `get_warga_secured`), dan 1 akun admin default sudah otomatis dibuat.

3. **Ambil Kredensial API Supabase**:
   - Buka **Project Settings** (ikon roda gigi) → **API**.
   - Salin dua hal ini:
     - **Project URL** (contoh: `https://xxxxxxxxx.supabase.co`)
     - **Project API Key (`anon` `public`)** (string panjang berawalan `eyJhb...`)

---

## 🔗 LANGKAH 2: HUBUNGKAN APLIKASI KE SUPABASE

1. Buka file `js/app.js` di text editor (VS Code / Notepad++).
2. Cari baris paling atas berisi `SUPABASE_URL` dan variabel kunci API (`_k1`, `_k2`, `_k3`).
3. Ganti dengan **Project URL** dan **anon public key** dari project Supabase baru Anda (langkah 1.3 di atas).

---

## 🌐 LANGKAH 3: DEPLOY / UPLOAD WEBSITE

### Opsi A — GitHub Pages (gratis, otomatis HTTPS)
1. Push seluruh isi folder ini ke repository GitHub.
2. Buka tab **Settings** di repo → **Pages**.
3. Pilih **Branch: main** / **Folder: / (root)** → **Save**.
4. Dalam 1–2 menit, website aktif di `https://username.github.io/nama-repo/`.

### Opsi B — cPanel / Vercel / Netlify
- Upload seluruh isi folder (`index.html`, `manifest.json`, `sw.js`, `schema.sql`, folder `img/` & `js/`) ke `public_html` atau root hosting.

---

## 🔑 LANGKAH 4: LOGIN PERTAMA KALI & KONFIGURASI AWAL

1. Buka URL website yang sudah aktif.
2. Login dengan akun admin default:
   - **Username**: `adminrw`
   - **Password**: `admin123`
3. **⚠️ SEGERA ganti password default** ini lewat menu Pengaturan → Manajemen Akun Warga → cari `adminrw` → Reset Password.

4. **Buka Menu Pengaturan RW & Sistem**:
   - **Tab Identitas & Tema**: nama sudah default "Pekuncen Digital" / RW 08 — sesuaikan lagi kalau perlu, upload logo Anda sendiri di sini (otomatis menggantikan logo bawaan di semua halaman).
   - **Tab QRIS & Rekening**: **kosong secara default** — isi dengan rekening/QRIS RW 08 yang sesungguhnya. (Data pembayaran developer/klien sebelumnya sudah dihapus total dari kode, tidak ikut terbawa.)
   - **Tab Manajemen Akun Warga**: daftarkan akun untuk tiap warga (pilih RT 29/30/31/32 saat mendaftarkan), atau akun tambahan untuk pengurus.
   - **Tab Pengumuman Warga**: tulis pengumuman/running text untuk seluruh warga RW 08.

---

## ⏰ LANGKAH 5 (PENTING): CEGAH SUPABASE "TIDUR" KARENA JARANG DIPAKAI

Supabase gratis otomatis **pause** (tidur) project yang 7 hari tanpa aktivitas database. Karena aplikasi RW ini kemungkinan tidak dibuka setiap hari, project bisa ke-pause dan warga akan lihat halaman blank sampai admin login ke dashboard Supabase dan klik "Restore" manual.

**Solusinya sudah disiapkan** — folder `.github/workflows/supabase-keep-alive.yml` otomatis nge-ping database 2x seminggu (Senin & Kamis) lewat GitHub Actions, gratis, tanpa perlu Anda lakukan apa-apa setelah setup awal.

Cara mengaktifkannya (sekali saja, ±2 menit):
1. Pastikan project ini sudah di-push ke repository GitHub (lihat Langkah 3 Opsi A).
2. Di repo GitHub, buka **Settings → Secrets and variables → Actions → New repository secret**.
3. Tambahkan 2 secret:
   - Nama `SUPABASE_URL`, isi: Project URL Supabase Anda
   - Nama `SUPABASE_ANON_KEY`, isi: anon public key Supabase Anda
   (Nilai yang sama persis dengan yang Anda isi di `js/app.js` pada Langkah 2.)
4. Selesai — cek tab **Actions** di repo untuk lihat riwayat jalannya, atau klik **Run workflow** untuk tes manual kapan saja.

> Kalau Anda tidak pakai GitHub Pages untuk hosting (pilih Opsi B), workflow ini tetap bisa jalan — GitHub Actions tidak bergantung pada di mana website di-hosting, cukup repo-nya ada di GitHub.



- Hampir semua data (Warga, Iuran, Keuangan, Aset, Pengaduan, dll) punya kolom **RT** bernilai `29`, `30`, `31`, atau `32`.
- Untuk Keuangan & Aset, RT boleh dikosongkan — artinya data itu **milik bersama RW 08** (bukan RT tertentu).
- Saat ini sistem pakai **1 akun admin (`adminrw`) yang mengelola semua RT sekaligus** — bukan admin terpisah per RT. Kalau ke depannya butuh admin khusus per RT dengan akses terbatas, itu pengembangan lanjutan (perlu penyesuaian struktur login).

---

## 🔒 CATATAN KEAMANAN (PENTING, MOHON DIBACA)

Aplikasi ini adalah **web statis** yang mengakses Supabase langsung dari browser pakai satu `anon key` yang sama untuk semua pengunjung (tanpa Supabase Auth per-pengguna). Yang sudah diperbaiki di versi ini dibanding versi sebelumnya:
- Password akun **di-hash** (bcrypt), tidak lagi tersimpan sebagai teks polos.
- Proses login & ganti password sekarang benar-benar lewat fungsi keamanan di database (`verify_user_login`, `admin_set_password`) — sebelumnya fungsi ini belum pernah dibuat di database sehingga sistem selalu jatuh ke cara lama yang tidak aman.

Yang **belum** bisa sepenuhnya diselesaikan tanpa membangun ulang sistem login (pakai Supabase Auth resmi): pembeda "ini admin" vs "ini warga" saat ini masih ditentukan di kode aplikasi (JavaScript), bukan ditegakkan oleh database. Untuk skala RW dengan risiko wajar, ini sudah jauh lebih baik dari sebelumnya — tapi kalau suatu saat butuh proteksi tingkat lebih tinggi (misal karena data makin sensitif), pertimbangkan upgrade ke Supabase Auth.

---

## 💎 FITUR UTAMA

1. 💰 **Bebas biaya server bulanan** — tidak perlu hosting mahal.
2. 📱 **Bisa di-install di HP (PWA)** — tampil seperti aplikasi tanpa perlu app store.
3. 🏘️ **Multi-RT dalam 1 RW** — kelola RT 29/30/31/32 sekaligus, bisa lihat gabungan atau per RT.
4. 🔒 **Proteksi NIK & No HP Warga** — otomatis disamarkan untuk sesama warga, hanya admin & pemilik data yang lihat lengkap.
5. 💳 **Iuran & QRIS Dinamis** — warga bayar iuran bulanan, admin verifikasi.
6. 📊 **Laporan Kas Transparan** — per RT maupun gabungan RW 08.
