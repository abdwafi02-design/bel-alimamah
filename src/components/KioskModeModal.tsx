import {
  Bell,
  Calendar,
  Clock,
  Maximize2,
  Minimize2,
  Shield,
  Volume2,
  Wifi,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  HolidayItem,
  ScheduleCategory,
  ScheduleItem,
  SchoolSettings,
  SpecialSchedule,
} from '../types';

interface KioskModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  currentTimeHHMMSS: string;
  formattedFullDateID: string;
  isActive: boolean;
  isPaused: boolean;
  currentHoliday: HolidayItem | null;
  activeSpecialSchedule: SpecialSchedule | null;
  nextBellItem: ScheduleItem | null;
  countdownFormatted: string | null;
  progressPercent: number;
  todaySchedules: ScheduleItem[];
  getSoundName: (soundId: string) => string;
  wakeLockActive: boolean;
  onRequestPin: () => void;
}

export const KioskModeModal: React.FC<KioskModeModalProps> = ({
  isOpen,
  onClose,
  settings,
  currentTimeHHMMSS,
  formattedFullDateID,
  isActive,
  isPaused,
  currentHoliday,
  activeSpecialSchedule,
  nextBellItem,
  countdownFormatted,
  progressPercent,
  todaySchedules,
  getSoundName,
  wakeLockActive,
  onRequestPin,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn('Fullscreen error:', e);
    }
  };

  const handleExitKiosk = () => {
    if (settings.isPinRequired && settings.adminPin) {
      onRequestPin();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      onClose();
    }
  };

  const getCategoryBadge = (category: ScheduleCategory) => {
    switch (category) {
      case 'masuk':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Masuk</span>;
      case 'upacara':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">Upacara</span>;
      case 'istirahat':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Istirahat</span>;
      case 'sholat':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Ibadah</span>;
      case 'pulang':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Pulang</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Pelajaran</span>;
    }
  };

  return (
    <div
      id="kiosk-mode-fullscreen"
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-display">
              {settings.schoolName || 'Bel Sekolah Otomatis'}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Sistem Bel Digital Terintegrasi • Mode Kiosk Operasional
            </p>
          </div>
        </div>

        {/* Status Indicators & Control */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {currentHoliday ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              LIBUR: {currentHoliday.name}
            </div>
          ) : isPaused ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              SISTEM DI-JEDA
            </div>
          ) : isActive ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              SISTEM BEL AKTIF
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              SISTEM NONAKTIF
            </div>
          )}

          {/* Wake Lock & Sound status */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Zap className={`w-3.5 h-3.5 ${wakeLockActive ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>{wakeLockActive ? 'Layar Terjaga' : 'Normal'}</span>
          </div>

          <button
            id="kiosk-toggle-fullscreen-btn"
            onClick={toggleBrowserFullscreen}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            id="kiosk-exit-btn"
            onClick={handleExitKiosk}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-600/80 active:bg-rose-700 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 active:scale-95"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Keluar Kiosk</span>
          </button>
        </div>
      </header>

      {/* Main Kiosk Area */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 items-center">
        {/* Left Column: Huge Digital Clock & Next Bell Countdown */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
          {/* Giant Real-time Clock */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-sm font-medium mb-3">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{formattedFullDateID}</span>
            </div>
            
            <div
              id="kiosk-digital-clock"
              className="font-mono-digital text-7xl sm:text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-tighter drop-shadow-2xl"
            >
              {currentTimeHHMMSS}
            </div>
            <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mt-1">
              WAKTU INDONESIA BARAT (WIB)
            </div>
          </div>

          {/* Next Bell Hero Banner */}
          <div className="w-full max-w-xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-blue-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" /> BEL BERIKUTNYA
              </span>
              {nextBellItem && getCategoryBadge(nextBellItem.category)}
            </div>

            {nextBellItem ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {nextBellItem.label}
                  </h2>
                  <span className="font-mono-digital text-3xl font-black text-amber-400">
                    {nextBellItem.time}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                  <span>Bel berbunyi dalam:</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">
                    {countdownFormatted || '-'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <p className="text-lg font-semibold text-slate-300">
                  Semua jadwal bel hari ini telah selesai
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Sistem bersiap untuk jadwal operasional hari berikutnya.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Today's Full Schedule Timeline */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 h-[480px] flex flex-col shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Jadwal Hari Ini ({todaySchedules.length} Kegiatan)
            </h3>
            {activeSpecialSchedule && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {activeSpecialSchedule.name}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {todaySchedules.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                Tidak ada jadwal aktif untuk hari ini.
              </div>
            ) : (
              todaySchedules.map((item) => {
                const isNext = nextBellItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isNext
                        ? 'bg-blue-600/20 border-blue-500/50 shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-mono-digital text-base font-bold ${isNext ? 'text-amber-300 font-extrabold' : 'text-slate-400'}`}>
                        {item.time}
                      </span>
                      <div>
                        <div className={`text-sm font-semibold ${isNext ? 'text-white' : 'text-slate-200'}`}>
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          <span>{getSoundName(item.soundId)}</span>
                        </div>
                      </div>
                    </div>
                    <div>{getCategoryBadge(item.category)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Footer info bar */}
      <footer className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <span>Versi PWA 1.0.0</span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Wifi className="w-3.5 h-3.5" /> Berjalan Offline (Tanpa Internet)
          </span>
        </div>
        <div>
          Klik tombol &quot;Keluar Kiosk&quot; di pojok kanan atas untuk kembali ke panel admin operator.
        </div>
      </footer>
    </div>
  );
};
