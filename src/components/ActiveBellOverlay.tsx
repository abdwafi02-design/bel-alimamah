import confetti from 'canvas-confetti';
import { Bell, Globe, Volume2, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { audioEngine } from '../services/audioEngine';
import { SUPPORTED_LANGUAGES } from '../services/multiLanguageTts';
import { CurrentlySpeakingLanguage, ScheduleCategory } from '../types';

interface ActiveBellOverlayProps {
  isRinging: boolean;
  eventInfo: {
    label: string;
    soundName: string;
    category: ScheduleCategory;
    time: string;
  } | null;
  currentlySpeakingLanguage?: CurrentlySpeakingLanguage | null;
  onStop: () => void;
}

export const ActiveBellOverlay: React.FC<ActiveBellOverlayProps> = ({
  isRinging,
  eventInfo,
  currentlySpeakingLanguage,
  onStop,
}) => {
  useEffect(() => {
    if (isRinging) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e', '#a855f7'],
        });
      } catch {
        // confetti fallback
      }
    }
  }, [isRinging]);

  if (!isRinging || !eventInfo) return null;

  const handleStopRinging = () => {
    audioEngine.stopAll();
    onStop();
  };

  const currentLangInfo = currentlySpeakingLanguage
    ? SUPPORTED_LANGUAGES[currentlySpeakingLanguage.lang]
    : null;

  return (
    <div
      id="active-bell-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300"
    >
      {/* Background Pulse Circles */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/15 animate-ping pointer-events-none" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-amber-500/15 animate-pulse pointer-events-none" />

      <div
        id="active-bell-card"
        className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-8 shadow-2xl shadow-amber-500/20 text-center relative z-10"
      >
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          BEL SEDANG BERBUNYI
        </div>

        {/* Animated Bell Visual */}
        <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/40 animate-bell-ring">
            <Bell className="w-12 h-12 stroke-[2.5]" />
          </div>
        </div>

        {/* Event Time and Label */}
        <div className="font-mono-digital text-3xl font-extrabold text-amber-300 mb-2">
          {eventInfo.time}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
          {eventInfo.label}
        </h2>
        <p className="text-sm text-slate-400 flex items-center justify-center gap-2 mb-4">
          <Volume2 className="w-4 h-4 text-blue-400" />
          <span>Suara: <strong className="text-slate-200">{eventInfo.soundName}</strong></span>
        </p>

        {/* Multi-language Active Speech Subtitles */}
        {currentlySpeakingLanguage && currentLangInfo && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-950/60 border border-blue-500/40 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-300 mb-1">
              <span className="text-lg">{currentLangInfo.flag}</span>
              <span>Sedang Mengumumkan ({currentLangInfo.label})</span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            </div>
            <p
              dir={currentlySpeakingLanguage.lang === 'ar' ? 'rtl' : 'ltr'}
              className="text-sm font-semibold text-white italic text-center"
            >
              &ldquo;{currentlySpeakingLanguage.text}&rdquo;
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="stop-ringing-bell-btn"
            onClick={handleStopRinging}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rose-600/90 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" /> Hentikan Suara Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
