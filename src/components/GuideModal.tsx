import {
  CheckCircle,
  Cpu,
  Globe,
  HelpCircle,
  Laptop,
  Monitor,
  Radio,
  Smartphone,
  Volume2,
  WifiOff,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';

export const GuideModal: React.FC = () => {
  const [activeGuideTab, setActiveGuideTab] = useState<'chromebook' | 'android' | 'windows' | 'amplifier' | 'faq'>('chromebook');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-blue-400" />
          Panduan Pengoperasian & Kompatibilitas Perangkat
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Petunjuk lengkap menjalankan Bel Sekolah Otomatis di Chromebook Zyrex, Android, Windows/Linux/Mac, dan penyambungan amplifier.
        </p>
      </div>

      {/* Guide Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveGuideTab('chromebook')}
          className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGuideTab === 'chromebook'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Chromebook Zyrex (ChromeOS)</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('windows')}
          className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGuideTab === 'windows'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Laptop / PC Windows & Linux/Mac</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('android')}
          className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGuideTab === 'android'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>HP & Tablet Android</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('amplifier')}
          className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGuideTab === 'amplifier'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Kabel & Amplifier TOA Sekolah</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('faq')}
          className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeGuideTab === 'faq'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>FAQ & Troubleshooting</span>
        </button>
      </div>

      {/* Guide Content Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-300 text-sm space-y-6">
        {activeGuideTab === 'chromebook' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-blue-400" />
              Petunjuk Penggunaan pada Chromebook Zyrex (ChromeOS Bantuan Kemendikbudristek)
            </h3>
            
            <div className="space-y-3 text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  1. Cara Menginstall sebagai Aplikasi (PWA Standalone)
                </div>
                <p className="text-xs text-slate-400">
                  Buka aplikasi di browser Google Chrome pada Chromebook. Klik tombol <strong>&quot;Install Aplikasi&quot;</strong> pada bilah atas atau klik ikon download/install di sebelah kanan bilah alamat (URL bar). Aplikasi akan otomatis terpasang sebagai aplikasi mandiri di App Launcher Chromebook tanpa membutuhkan Play Store.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  2. Mengaktifkan Mode Kiosk / Layar Penuh
                </div>
                <p className="text-xs text-slate-400">
                  Klik tombol <strong>&quot;Mode Kiosk&quot;</strong> atau <strong>&quot;Mode Fullscreen&quot;</strong>. Chromebook akan menampilkan jam digital besar dan countdown jadwal bel tanpa ada gangguan tombol lain, sangat cocok jika layar monitor Chromebook ingin ditampilkan terus-menerus di ruang piket atau TU sekolah.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  3. Mencegah Layar Chromebook Masuk Mode Tidur (Sleep)
                </div>
                <p className="text-xs text-slate-400">
                  Aplikasi telah dilengkapi teknologi <strong>Screen Wake Lock API</strong> yang secara otomatis mencegah Chromebook mati layar saat dicolokkan ke adaptor pengisi daya. Pastikan di Pengaturan Chromebook (ChromeOS Settings &gt; Device &gt; Power): atur &quot;Saat mengisi daya: Layar tetap aktif&quot;.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  4. Menyambungkan Audio ke Speaker Sekolah
                </div>
                <p className="text-xs text-slate-400">
                  Colokkan kabel jack audio 3.5mm dari port headphone Chromebook ke port input AUX / CD / Tape pada amplifier TOA / mixer sentral sekolah.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeGuideTab === 'windows' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-400" />
              Petunjuk Penggunaan pada PC / Laptop Windows 10/11, Linux, dan macOS
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  1. Instalasi Melalui Google Chrome atau Microsoft Edge
                </div>
                <p className="text-xs text-slate-400">
                  Buka aplikasi melalui Chrome atau Edge. Klik tombol ikon <strong>Install</strong> di address bar. Aplikasi akan muncul sebagai jendela mandiri dengan icon tersendiri di desktop dan taskbar.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  2. Otomatis Buka Saat Komputer Dihidupkan (Auto-Start Windows)
                </div>
                <p className="text-xs text-slate-400">
                  Tekan <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">Win + R</kbd>, ketik <code className="text-amber-400">shell:startup</code> lalu tekan Enter. Buat shortcut aplikasi Bel Sekolah ke dalam folder startup tersebut agar bel otomatis berjalan ketika komputer dinyalakan setiap pagi.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeGuideTab === 'android' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              Petunjuk Penggunaan pada Android (Smartphone & Tablet)
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  1. Tambahkan ke Layar Utama (Add to Home Screen)
                </div>
                <p className="text-xs text-slate-400">
                  Buka di Chrome Android, tekan menu titik tiga di kanan atas, pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> atau <strong>&quot;Instal Aplikasi&quot;</strong>. Aplikasi akan berjalan layar penuh seperti aplikasi Android resmi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  2. Pengaturan Hemat Baterai
                </div>
                <p className="text-xs text-slate-400">
                  Pada menu Pengaturan Android &gt; Baterai &gt; Pengoptimalan Baterai: pilih browser Chrome / Bel Sekolah ke status <strong>&quot;Jangan Optimalkan (Tanpa Batasan)&quot;</strong> agar proses timer bel tidak dihentikan oleh sistem penghemat daya Android.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeGuideTab === 'amplifier' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              Skema Penyambungan ke Amplifier & Horn Speaker TOA Sekolah
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white">1. Kabel yang Diperlukan:</div>
                <p className="text-xs text-slate-400">
                  Gunakan kabel <strong>Jack Mini 3.5mm Stereo to Dual RCA (Merah-Putih)</strong> atau <strong>Jack 3.5mm to Akai 6.5mm</strong> (sesuai jenis input pada amplifier sekolah).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white">2. Port Input Amplifier:</div>
                <p className="text-xs text-slate-400">
                  Colokkan kabel RCA ke port <strong>AUX 1</strong>, <strong>AUX 2</strong>, atau <strong>CD/TAPE INPUT</strong> di bagian belakang amplifier. Hindari mencolokkan ke port MIC 1/MIC 2 secara langsung karena level tegangan berbeda yang dapat menyebabkan suara mendengung/distorsi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white">3. Pengaturan Volume:</div>
                <p className="text-xs text-slate-400">
                  Atur volume Chromebook/komputer di kisaran 80-90%, lalu putar potensiometer knob AUX di amplifier secara perlahan sampai suara bel terdengar jelas dan merata di seluruh speaker ruang kelas tanpa pecah.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeGuideTab === 'faq' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Tanya Jawab & Pertanyaan Umum (FAQ)
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-amber-300">T: Mengapa bel belum berbunyi saat pertama kali dibuka?</div>
                <p className="text-xs text-slate-400">
                  J: Kebijakan keamanan browser modern membatasi pemutaran audio otomatis tanpa interaksi pengguna. Cukup klik tombol <strong>&quot;Aktifkan Sistem Suara&quot;</strong> atau tombol <strong>&quot;Test Bel Sekarang&quot;</strong> satu kali saat aplikasi pertama dibuka.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <WifiOff className="w-4 h-4" /> T: Apakah aplikasi tetap berfungsi jika internet sekolah mati?
                </div>
                <p className="text-xs text-slate-400">
                  J: <strong>Ya, 100% bekerja offline!</strong> Aplikasi ini dibangun dengan standar PWA (Progressive Web App) dengan Web Audio API dan IndexedDB offline. Setelah halaman dimuat sekali, aplikasi dapat berjalan selamanya tanpa memerlukan koneksi internet sama sekali.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-purple-300">T: Bagaimana memindahkan jadwal ke laptop atau Chromebook lain?</div>
                <p className="text-xs text-slate-400">
                  J: Buka menu <strong>Pengaturan</strong> &gt; klik <strong>&quot;Backup Data (JSON)&quot;</strong>. Salin file json tersebut (misal via flashdisk) ke perangkat baru, lalu klik <strong>&quot;Restore Data (JSON)&quot;</strong> di perangkat tersebut.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
