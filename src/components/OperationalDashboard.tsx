import {
  AlertCircle,
  Bell,
  BellOff,
  BellRing,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Maximize2,
  Pause,
  Play,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { BUILTIN_SOUNDS } from '../data/defaultData';
import {
  BellLog,
  CustomSound,
  HolidayItem,
  ScheduleCategory,
  ScheduleItem,
  SchoolSettings,
  SpecialSchedule,
} from '../types';
import { D3BellTimeline } from './D3BellTimeline';

interface OperationalDashboardProps {
  settings: SchoolSettings;
  currentTimeHHMMSS: string;
  formattedFullDateID: string;
  isActive: boolean;
  isPaused: boolean;
  skipNextBell: boolean;
  isAudioUnlocked: boolean;
  wakeLockActive: boolean;
  currentHoliday: HolidayItem | null;
  activeSpecialSchedule: SpecialSchedule | null;
  todaySchedules: ScheduleItem[];
  nextBellItem: ScheduleItem | null;
  countdownFormatted: string | null;
  progressPercent: number;
  customSounds: CustomSound[];
  getSoundName: (soundId: string) => string;
  onToggleActive: () => void;
  onTogglePause: () => void;
  onToggleSkipNext: () => void;
  onUnlockAudio: () => void;
  onOpenKiosk: () => void;
  onTriggerManualBell: (soundId?: string, label?: string, category?: ScheduleCategory) => void;
  onTriggerItem: (item: ScheduleItem) => void;
  logs?: BellLog[];
}

export const OperationalDashboard: React.FC<OperationalDashboardProps> = ({
  settings,
  currentTimeHHMMSS,
  formattedFullDateID,
  isActive,
  isPaused,
  skipNextBell,
  isAudioUnlocked,
  wakeLockActive,
  currentHoliday,
  activeSpecialSchedule,
  todaySchedules,
  nextBellItem,
  countdownFormatted,
  progressPercent,
  customSounds,
  getSoundName,
  onToggleActive,
  onTogglePause,
  onToggleSkipNext,
  onUnlockAudio,
  onOpenKiosk,
  onTriggerManualBell,
  onTriggerItem,
  logs = [],
}) => {
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedManualSound, setSelectedManualSound] = useState(settings.defaultSoundId || 'westminster-8');
  const [manualLabel, setManualLabel] = useState('Bel Peringatan Khusus');

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

  const handleQuickManualRing = () => {
    onTriggerManualBell(selectedManualSound, manualLabel, 'khusus');
    setManualModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Holiday / Special Schedule Notices */}
      {currentHoliday && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-amber-300 text-sm">
          <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Hari Libur Terdeteksi: {currentHoliday.name}</span>
            <p className="text-xs text-amber-400/80 mt-0.5">
              Bel otomatis hari ini dilewati secara otomatis karena kalender libur sekolah.
            </p>
          </div>
        </div>
      )}

      {activeSpecialSchedule && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-purple-200 text-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="font-bold">Mode Jadwal Khusus Aktif: {activeSpecialSchedule.name}</span>
              <p className="text-xs text-purple-300/80 mt-0.5">
                {activeSpecialSchedule.description || 'Jadwal khusus menggantikan jadwal mingguan standar hari ini.'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-purple-600/30 border border-purple-400/40 text-xs font-bold text-purple-200">
            Khusus Aktif
          </span>
        </div>
      )}

      {/* Main Grid: Clock & Hero Countdown (Left) + Quick Actions & Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Big Hero Clock & Next Bell */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status & Date */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-medium">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{formattedFullDateID}</span>
            </div>

            {/* System Status Pill */}
            {currentHoliday ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                HARI LIBUR
              </span>
            ) : isPaused ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                SISTEM DI-JEDA
              </span>
            ) : isActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                🟢 SISTEM BEL AKTIF
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                🔴 SISTEM NONAKTIF
              </span>
            )}
          </div>

          {/* Giant Digital Clock */}
          <div className="my-4 text-center sm:text-left">
            <div
              id="dashboard-digital-clock"
              className="font-mono-digital text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300 tracking-tight"
            >
              {currentTimeHHMMSS}
            </div>
            <div className="text-xs font-bold text-blue-400 tracking-widest uppercase mt-1">
              Waktu Realtime Indonesia (WIB / UTC+7)
            </div>
          </div>

          {/* Next Bell Countdown Box */}
          <div className="mt-6 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Clock className="w-3.5 h-3.5" /> Bel Berikutnya:
              </span>
              {nextBellItem && getCategoryBadge(nextBellItem.category)}
            </div>

            {nextBellItem ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {nextBellItem.label}
                  </div>
                  <div className="font-mono-digital text-2xl sm:text-3xl font-extrabold text-amber-400">
                    {nextBellItem.time}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Bel berbunyi dalam:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {countdownFormatted || '-'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="py-3 text-center text-slate-400 text-sm">
                Tidak ada lagi jadwal bel untuk hari ini.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Action Center */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Quick Action Buttons Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              Kontrol Cepat Operator
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Manual Bell Ring */}
              <button
                id="btn-test-bel-sekarang"
                onClick={() => setManualModalOpen(true)}
                className="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:from-amber-600 active:to-yellow-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <BellRing className="w-5 h-5 text-slate-950" />
                <span>Test Bel / Bunyikan Sekarang</span>
              </button>

              {/* Pause / Resume */}
              <button
                id="btn-toggle-pause"
                onClick={onTogglePause}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  isPaused
                    ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                <span>{isPaused ? 'Lanjutkan Sistem' : 'Jeda Sistem'}</span>
              </button>

              {/* Skip Next Bell */}
              <button
                id="btn-skip-next"
                onClick={onToggleSkipNext}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  skipNextBell
                    ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <SkipForward className={`w-4 h-4 ${skipNextBell ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{skipNextBell ? 'Batal Lewati' : 'Lewati Bel Berikut'}</span>
              </button>

              {/* Toggle Active / Inactive */}
              <button
                id="btn-toggle-active"
                onClick={onToggleActive}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-rose-600/20 border-rose-500/40 text-rose-300 hover:bg-rose-600/30'
                    : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                }`}
              >
                {isActive ? <BellOff className="w-4 h-4 text-rose-400" /> : <Bell className="w-4 h-4 text-emerald-400" />}
                <span>{isActive ? 'Nonaktifkan Bel' : 'Aktifkan Bel'}</span>
              </button>

              {/* Fullscreen Kiosk */}
              <button
                id="btn-open-kiosk-dashboard"
                onClick={onOpenKiosk}
                className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600 hover:text-white text-blue-300 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4 text-blue-400" />
                <span>Mode Fullscreen</span>
              </button>
            </div>
          </div>

          {/* System Diagnostic Status Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-400" /> Izin Audio Browser:
              </span>
              {isAudioUnlocked ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terbuka (Siap Putar)
                </span>
              ) : (
                <button
                  id="dashboard-unlock-audio-btn"
                  onClick={onUnlockAudio}
                  className="text-amber-400 font-bold underline hover:text-amber-300"
                >
                  Klik untuk Izinkan
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-400" /> Cegah Layar Mati (WakeLock):
              </span>
              <span className={wakeLockActive ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {wakeLockActive ? 'Aktif (Layar Tetap Hidup)' : 'Nonaktif / Tidak Didukung'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Total Jadwal Hari Ini:
              </span>
              <span className="text-slate-200 font-semibold">
                {todaySchedules.length} Kegiatan ({todaySchedules.filter((s) => s.enabled).length} Aktif)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Timeline View Powered by D3 */}
      <D3BellTimeline
        todaySchedules={todaySchedules}
        currentTimeHHMMSS={currentTimeHHMMSS}
        nextBellItem={nextBellItem}
        skipNextBell={skipNextBell}
        currentHoliday={currentHoliday}
        isPaused={isPaused}
        isActive={isActive}
        settings={settings}
        logs={logs}
        getSoundName={getSoundName}
        onTriggerItem={onTriggerItem}
        onTriggerManualBell={onTriggerManualBell}
      />

      {/* Today's Full Schedule Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Daftar Jadwal Bel Hari Ini
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Urutan jadwal bel otomatis yang akan dibunyikan sepanjang hari.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Total: <strong className="text-white">{todaySchedules.length}</strong> kegiatan
          </div>
        </div>

        {todaySchedules.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>Tidak ada jadwal bel untuk hari ini.</p>
            <p className="text-xs text-slate-600 mt-1">
              Buka menu &quot;Jadwal Mingguan&quot; untuk menambahkan atau menerapkan template jadwal sekolah.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Nama Kegiatan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Suara Bel</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {todaySchedules.map((item) => {
                  const isNext = nextBellItem?.id === item.id;
                  const [h, m] = item.time.split(':').map(Number);
                  const itemMinutes = h * 60 + m;
                  const [currH, currM] = currentTimeHHMMSS.split(':').map(Number);
                  const currentMinutes = currH * 60 + currM;
                  const isPassed = currentMinutes > itemMinutes;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isNext
                          ? 'bg-blue-600/15 font-semibold text-white'
                          : isPassed
                          ? 'text-slate-500 hover:bg-slate-800/30'
                          : 'text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono-digital text-base">
                        <span className={isNext ? 'text-amber-400 font-extrabold' : ''}>
                          {item.time}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span>{item.label}</span>
                          {isNext && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                              Berikutnya
                            </span>
                          )}
                        </div>
                        {item.speechText && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">
                            &ldquo;{item.speechText}&rdquo;
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{getCategoryBadge(item.category)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{getSoundName(item.soundId)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {!item.enabled ? (
                          <span className="text-xs text-slate-500">Nonaktif</span>
                        ) : isPassed ? (
                          <span className="text-xs text-slate-500 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" /> Selesai
                          </span>
                        ) : isNext ? (
                          <span className="text-xs text-amber-400 font-bold animate-pulse">
                            Akan Berbunyi
                          </span>
                        ) : (
                          <span className="text-xs text-blue-400">Menunggu</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          id={`row-ring-btn-${item.id}`}
                          onClick={() => onTriggerItem(item)}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Bunyikan suara jadwal ini sekarang"
                        >
                          <Bell className="w-3 h-3" />
                          <span>Test</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Bell Trigger Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-400" />
                Bunyikan Bel Manual Sekarang
              </h3>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Keterangan / Nama Panggilan Bel:
              </label>
              <input
                type="text"
                value={manualLabel}
                onChange={(e) => setManualLabel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Contoh: Bel Masuk Darurat / Apel Mendadak"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pilih Suara Bel:
              </label>
              <select
                value={selectedManualSound}
                onChange={(e) => setSelectedManualSound(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <optgroup label="✨ Suara Bel Versi Baru (V2.0 Modern & Resonan)">
                  {BUILTIN_SOUNDS.filter((s) => s.isNewVersion).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Suara Bel Klasik (V1.0)">
                  {BUILTIN_SOUNDS.filter((s) => !s.isNewVersion).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
                {customSounds.length > 0 && (
                  <optgroup label="Suara Kustom (Upload)">
                    {customSounds.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.fileName})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setManualModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                id="btn-confirm-manual-ring"
                onClick={handleQuickManualRing}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <BellRing className="w-4 h-4" /> Bunyikan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
