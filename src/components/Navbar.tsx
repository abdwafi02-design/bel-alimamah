import {
  Bell,
  Calendar,
  Clock,
  Cloud,
  Download,
  HelpCircle,
  History,
  Lock,
  Maximize,
  Moon,
  Music,
  Settings,
  Sparkles,
  Sun,
  Unlock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useState } from 'react';
import { ActiveTab, SchoolSettings } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: SchoolSettings;
  currentTimeHHMMSS: string;
  isAudioUnlocked: boolean;
  onUnlockAudio: () => void;
  onOpenKiosk: () => void;
  onOpenPinModal: (targetTab: ActiveTab) => void;
  isPinLocked: boolean;
  onLockAdmin: () => void;
  deferredInstallPrompt: any;
  onInstallPwa: () => void;
  onOpenGoogleDrive?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  currentTimeHHMMSS,
  isAudioUnlocked,
  onUnlockAudio,
  onOpenKiosk,
  onOpenPinModal,
  isPinLocked,
  onLockAdmin,
  deferredInstallPrompt,
  onInstallPwa,
  onOpenGoogleDrive,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; requiresPin?: boolean }> = [
    { id: 'dashboard', label: 'Operasional', icon: Clock },
    { id: 'weekly', label: 'Jadwal Mingguan', icon: Calendar, requiresPin: true },
    { id: 'special', label: 'Jadwal Khusus', icon: Sparkles, requiresPin: true },
    { id: 'holidays', label: 'Hari Libur', icon: Calendar, requiresPin: true },
    { id: 'sounds', label: 'Suara Bel', icon: Music, requiresPin: true },
    { id: 'logs', label: 'Riwayat Bel', icon: History },
    { id: 'settings', label: 'Pengaturan', icon: Settings, requiresPin: true },
    { id: 'guide', label: 'Panduan Perangkat', icon: HelpCircle },
  ];

  const handleTabClick = (tab: { id: ActiveTab; requiresPin?: boolean }) => {
    if (tab.requiresPin && settings.isPinRequired && isPinLocked) {
      onOpenPinModal(tab.id);
    } else {
      setActiveTab(tab.id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      {/* Audio Unlock Alert Banner (if browser blocked autoplay) */}
      {!isAudioUnlocked && (
        <div
          id="audio-unlock-banner"
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-inner"
        >
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 animate-bounce" />
            <span>
              Perhatian: Browser memerlukan izin interaksi awal untuk memutar suara bel secara otomatis.
            </span>
          </div>
          <button
            id="activate-audio-banner-btn"
            onClick={onUnlockAudio}
            className="px-3 py-1 rounded-lg bg-white text-slate-900 font-bold hover:bg-slate-100 active:scale-95 transition-all text-xs flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" /> Aktifkan Sistem Suara
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & School Name */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight font-display">
                  {settings.schoolName || 'Bel Sekolah Otomatis'}
                </h1>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                  PWA Offline
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Sistem Bel Otomatis Chromebook Zyrex & Multi-Platform
              </p>
            </div>
          </div>

          {/* Center Mini Clock on Desktop */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="font-mono-digital text-xl font-black text-white">
              {currentTimeHHMMSS}
            </span>
            <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded">
              WIB
            </span>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Google Drive Cloud Sync Button */}
            {onOpenGoogleDrive && (
              <button
                id="google-drive-nav-btn"
                onClick={onOpenGoogleDrive}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-cyan-300 hover:bg-blue-600/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                title="Google Drive Cloud Sync & Backup"
              >
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Google Drive</span>
              </button>
            )}

            {/* Install PWA Prompt button (if available) */}
            {deferredInstallPrompt && (
              <button
                id="install-pwa-nav-btn"
                onClick={onInstallPwa}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install Aplikasi</span>
              </button>
            )}

            {/* Kiosk Fullscreen Trigger */}
            <button
              id="open-kiosk-nav-btn"
              onClick={onOpenKiosk}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
              title="Masuk Mode Fullscreen / Kiosk"
            >
              <Maximize className="w-4 h-4" />
              <span className="hidden sm:inline">Mode Kiosk</span>
            </button>

            {/* PIN Lock / Unlock state button */}
            {settings.isPinRequired && (
              <button
                id="pin-lock-toggle-btn"
                onClick={() => {
                  if (isPinLocked) {
                    onOpenPinModal('dashboard');
                  } else {
                    onLockAdmin();
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isPinLocked
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                }`}
                title={isPinLocked ? 'Admin Terkunci (Klik untuk Buka)' : 'Admin Terbuka (Klik untuk Kunci)'}
              >
                {isPinLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Menu (Horizontal scroll on mobile) */}
        <nav
          id="main-nav-tabs"
          className="flex space-x-1 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-800/60"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.requiresPin && settings.isPinRequired && isPinLocked && (
                  <Lock className="w-3 h-3 text-slate-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
