# 🔔 Bel Sekolah Otomatis Modern - SMP/MA AL-IMAMAH (4 Bahasa)

Aplikasi **Bel Sekolah Otomatis Offline-First** berbasis web Progressive Web App (PWA) yang telah dikonfigurasi penuh sesuai standar operasional **SMP/MA AL-IMAMAH**. Dirancang khusus untuk operasional sekolah di Chromebook Zyrex, PC Windows, Linux, Android, dan macOS, serta siap di-hosting langsung ke **GitHub** dan **Vercel**.

---

## 🏫 Profil & Konfigurasi Bawaan SMP/MA AL-IMAMAH

- **Nama Satuan Pendidikan**: `SMP/MA AL-IMAMAH`
- **NPSN**: `69982341`
- **Alamat**: `Kompleks Pendidikan Islam Terpadu Al-Imamah, Jl. Pendidikan No. 01`
- **Zona Waktu**: `WIB (Asia/Jakarta)`
- **Bel Bawaan**: `Lonceng Sekolah Modern V2 (Kin-Kon-Kan-Kon)` & `Bedug Akustik & Chime Ibadah V2`
- **Bahasa Suara Otomatis**: 4 Bahasa aktif serentak (🇮🇩 Indonesia, 🇬🇧 Inggris, 🇸🇦 Arab, 🇨🇳 Mandarin)
- **Keamanan PIN Operator**: Terproteksi secara privat di penyimpanan lokal (`localStorage`).

---

## 🌟 Fitur Utama & Kepatuhan Operasional

1. **Jadwal Mingguan Khas SMP/MA AL-IMAMAH**:
   - **Senin**: Bel masuk sambut santri, Upacara bendera, Doa awal belajar & Tadarus Al-Qur'an, Sholat Dhuha berjamaah jam 09:55, Sholat Dzuhur berjamaah di masjid & makan siang jam 11:55, Sholat Ashar berjamaah & bel kepulangan jam 15:00.
   - **Selasa s.d. Kamis**: Pembiasaan karakter Islami, Sholat Dhuha, Asmaul Husna & Tadarus Al-Qur'an jam 07:00, KBM Jam 1-8, Sholat Dzuhur berjamaah jam 11:45, Sholat Ashar berjamaah & pulang jam 15:00.
   - **Jumat Berkah**: Kajian Dhuha & Pembacaan Surat Yasin bersama jam 07:00, KBM Jam 1-4, Persiapan Sholat Jumat berjamaah di masjid jam 11:00, Kepulangan Jumat & Ekstrakurikuler Keagamaan jam 12:30.
   - **Sabtu Kreatif & Bahasa**: Muhadhorah santri (Latihan pidato 3 bahasa: Arab, Inggris, Indonesia) & Tahfidz Al-Qur'an jam 07:00, KBM Jam 1-4, Sholat Dzuhur berjamaah & Ekstrakurikuler Pramuka / Hadrah jam 11:15.
   - **Ahad**: Libur Akhir Pekan.
2. **Jadwal Khusus SMP/MA AL-IMAMAH**:
   - 🌙 **Bulan Suci Ramadhan**: Jam KBM 30 menit per pelajaran, Sholat Dhuha, Tausiyah Ramadhan, Sholat Dzuhur berjamaah jam 11:45, dan kepulangan lebih awal.
   - 📝 **Asesmen Madrasah (AM) & Ujian Semester (STS/SAS)**: Sesi ujian 1, istirahat tenang, sesi ujian 2, dan Sholat Dzuhur berjamaah.
   - 🎒 **MATSAMA (Masa Ta'aruf Siswa Madrasah) & MPLS**: Pengenalan budaya madrasah, pembiasaan akhlakul karimah, dan orientasi santri baru.
3. **Kalender Hari Libur Nasional & Islam**:
   - Dilengkapi kalender hari besar Islam (Isra Mi'raj, Awal Ramadhan, Idul Fitri, Idul Adha, 1 Muharram, Maulid Nabi, Hari Santri Nasional 22 Oktober) dan Hari Libur Nasional (Kemerdekaan RI, Hardiknas, Hari Pahlawan, Hari Guru Nasional).
4. **Pengumuman Narasi 4 Bahasa (Otomatis & Real-Time)**:
   - Dilengkapi mesin fonetik tajwid cerdas untuk bahasa Arab sehingga Chromebook atau PC yang tidak memiliki paket suara Arab native tetap berbunyi fasih dan lantang.
5. **Timeline Visual Interaktif (D3.js)**:
   - Memantau jadwal bel harian secara visual (*completed, ringing, pending, skipped*).
6. **Riwayat Bel & Pencatatan Log Otomatis**:
   - Mencatat setiap dentang bel yang berbunyi secara otomatis dan akurat.
7. **Google Drive Cloud Sync**:
   - Menyimpan dan memulihkan backup jadwal ke Google Drive pribadi.

---

## 🔒 Jaminan Keamanan Sandi & Privasi Pemilik

> **Sandi/PIN Anda dijamin 100% rahasia dan aman!**
> 
> Saat repositori ini dipublikasikan ke GitHub (baik publik maupun privat), **sandi atau PIN Anda TIDAK AKAN PERNAH terunggah ke GitHub**.

1. **Zero-Knowledge Storage**: Sandi/PIN yang Anda simpan di menu Pengaturan hanya tersimpan di memori browser lokal (*localStorage*) perangkat sekolah Anda.
2. **Kerahasiaan Layar**: PIN tidak pernah ditampilkan secara gamblang di layar (*masked password with show/hide toggle*).
3. **Filter .gitignore**: File `.env*`, kunci rahasia, dan file backup data sekolah otomatis dicegah masuk ke git commit.

---

## 🚀 Panduan Publish ke GitHub & Hosting di Vercel

### Langkah 1: Unggah ke GitHub

Buka terminal di folder proyek ini dan jalankan perintah berikut:

```bash
# 1. Inisialisasi Git
git init

# 2. Masukkan semua berkas ke staging
git add .

# 3. Buat commit rilis
git commit -m "Rilis Sistem Bel Sekolah Otomatis SMP-MA AL-IMAMAH"

# 4. Atur branch utama ke main
git branch -M main

# 5. Hubungkan ke repositori GitHub Anda (ganti USERNAME dengan akun GitHub Anda)
git remote add origin https://github.com/USERNAME/bel-sekolah-al-imamah.git

# 6. Push kode ke GitHub
git push -u origin main
```

### Langkah 2: Deploy Otomatis ke Vercel (Gratis & 1 Menit)

Aplikasi ini telah dilengkapi konfigurasi `vercel.json` siap pakai:

1. Kunjungi [https://vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik tombol **Add New** > pilih **Project**.
3. Pilih repositori `bel-sekolah-al-imamah` yang baru saja Anda push.
4. Framework Preset akan otomatis terdeteksi sebagai **Vite**.
5. Klik **Deploy**.
6. Dalam hitungan detik, aplikasi bel sekolah **SMP/MA AL-IMAMAH** Anda sudah live di internet dengan URL HTTPS gratis (contoh: `https://bel-sekolah-al-imamah.vercel.app`).
7. Buka URL tersebut di Chromebook Zyrex atau komputer ruang piket/operator sekolah, klik tombol **Aktifkan Suara**, dan bel sekolah otomatis siap beroperasi!

---

## 💻 Menjalankan di Komputer Lokal

```bash
# Pasang dependensi
npm install

# Jalankan server lokal
npm run dev

# Buka peramban: http://localhost:3000
```

---

## 📄 Lisensi
Didistribusikan di bawah lisensi Apache-2.0 untuk operasional pendidikan **SMP/MA AL-IMAMAH**.
