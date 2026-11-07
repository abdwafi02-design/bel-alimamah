/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  VolumeX,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ActiveBellOverlay } from './components/ActiveBellOverlay';
import { BellHistoryView } from './components/BellHistoryView';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { GuideModal } from './components/GuideModal';
import { HolidayView } from './components/HolidayView';
import { KioskModeModal } from './components/KioskModeModal';
import { Navbar } from './components/Navbar';
import { OperationalDashboard } from './components/OperationalDashboard';
import { PinModal } from './components/PinModal';
import { ScheduleWeeklyView } from './components/ScheduleWeeklyView';
import { SettingsView } from './components/SettingsView';
import { SoundManagerView } from './components/SoundManagerView';
import { SpecialScheduleView } from './components/SpecialScheduleView';
import { useBellEngine } from './hooks/useBellEngine';
import { audioEngine } from './services/audioEngine';
import {
  loadBellLogs,
  loadCustomSounds,
  loadHolidays,
  loadSettings,
  loadSpecialSchedules,
  loadWeeklySchedule,
  saveCustomSounds,
  saveHolidays,
  saveSettings,
  saveSpecialSchedules,
  saveWeeklySchedule,
} from './services/storage';
import {
  ActiveTab,
  BellLog,
  CustomSound,
  HolidayItem,
  SchoolSettings,
  SpecialSchedule,
  WeeklySchedule,
} from './types';

export default function App() {
  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isKioskOpen, setIsKioskOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState<boolean>(false);
  const [targetTabAfterPin, setTargetTabAfterPin] = useState<ActiveTab | null>(null);
  const [isPinUnlockedForSession, setIsPinUnlockedForSession] = useState<boolean>(false);

  // App Core Data State
  const [settings, setSettings] = useState<SchoolSettings>(() => loadSettings());
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(() => loadWeeklySchedule());
  const [specialSchedules, setSpecialSchedules] = useState<SpecialSchedule[]>(() => loadSpecialSchedules());
  const [holidays, setHolidays] = useState<HolidayItem[]>(() => loadHolidays());
  const [customSounds, setCustomSounds] = useState<CustomSound[]>(() => loadCustomSounds());
  const [logs, setLogs] = useState<BellLog[]>(() => loadBellLogs());

  // Connectivity & PWA State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  // Engine Hook
  const {
    currentTimeHHMMSS,
    formattedFullDateID,
    isActive,
    isPaused,
    skipNextBell,
    isAudioUnlocked,
    isCurrentlyRinging,
    activeRingingInfo,
    currentlySpeakingLanguage,
    wakeLockActive,
    currentHoliday,
    activeSpecialSchedule,
    todaySchedules,
    nextBellItem,
    countdownFormatted,
    progressPercent,
    toggleActive,
    togglePause,
    toggleSkipNext,
    triggerManualBellNow,
    triggerBell,
    unlockAudio,
    getSoundName,
  } = useBellEngine({
    settings,
    weeklySchedule,
    specialSchedules,
    holidays,
    customSounds,
    onLogAdded: (newLog) => {
      setLogs((prev) => [newLog, ...prev]);
    },
  });

  // PWA Install Prompt & Network Listeners
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save Handlers
  const handleUpdateSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleRefreshFromDrive = () => {
    setSettings(loadSettings());
    setWeeklySchedule(loadWeeklySchedule());
    setSpecialSchedules(loadSpecialSchedules());
    setHolidays(loadHolidays());
    setCustomSounds(loadCustomSounds());
  };

  const handleUpdateWeeklySchedule = (newWeekly: WeeklySchedule) => {
    setWeeklySchedule(newWeekly);
    saveWeeklySchedule(newWeekly);
  };

  const handleUpdateSpecialSchedules = (newSpecials: SpecialSchedule[]) => {
    setSpecialSchedules(newSpecials);
    saveSpecialSchedules(newSpecials);
  };

  const handleUpdateHolidays = (newHolidays: HolidayItem[]) => {
    setHolidays(newHolidays);
    saveHolidays(newHolidays);
  };

  const handleUpdateCustomSounds = (newSounds: CustomSound[]) => {
    setCustomSounds(newSounds);
    saveCustomSounds(newSounds);
  };

  // PIN security check for protected navigation
  const handleOpenPinModal = (targetTab: ActiveTab) => {
    setTargetTabAfterPin(targetTab);
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setIsPinUnlockedForSession(true);
    setIsPinModalOpen(false);
    if (targetTabAfterPin) {
      setActiveTab(targetTabAfterPin);
      setTargetTabAfterPin(null);
    }
  };

  const handleLockAdmin = () => {
    setIsPinUnlockedForSession(false);
    if (['weekly', 'special', 'settings'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  };

  const handleInstallPwa = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredInstallPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Banner if AudioContext is not unlocked yet */}
      {!isAudioUnlocked && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 animate-bounce" />
            <span>
              Sistem audio browser belum aktif. Klik tombol untuk mengaktifkan pemutaran bel otomatis.
            </span>
          </div>
          <button
            id="btn-unlock-audio-banner"
            onClick={unlockAudio}
            className="px-3.5 py-1 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-sm active:scale-95 cursor-pointer text-xs"
          >
            Aktifkan Suara
          </button>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        currentTimeHHMMSS={currentTimeHHMMSS}
        isAudioUnlocked={isAudioUnlocked}
        onUnlockAudio={unlockAudio}
        onOpenKiosk={() => setIsKioskOpen(true)}
        onOpenPinModal={handleOpenPinModal}
        isPinLocked={settings.isPinRequired && !isPinUnlockedForSession}
        onLockAdmin={handleLockAdmin}
        deferredInstallPrompt={deferredInstallPrompt}
        onInstallPwa={handleInstallPwa}
        onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <OperationalDashboard
            settings={settings}
            currentTimeHHMMSS={currentTimeHHMMSS}
            formattedFullDateID={formattedFullDateID}
            isActive={isActive}
            isPaused={isPaused}
            skipNextBell={skipNextBell}
            isAudioUnlocked={isAudioUnlocked}
            wakeLockActive={wakeLockActive}
            currentHoliday={currentHoliday}
            activeSpecialSchedule={activeSpecialSchedule}
            todaySchedules={todaySchedules}
            nextBellItem={nextBellItem}
            countdownFormatted={countdownFormatted}
            progressPercent={progressPercent}
            customSounds={customSounds}
            getSoundName={getSoundName}
            onToggleActive={toggleActive}
            onTogglePause={togglePause}
            onToggleSkipNext={toggleSkipNext}
            onUnlockAudio={unlockAudio}
            onOpenKiosk={() => setIsKioskOpen(true)}
            onTriggerManualBell={triggerManualBellNow}
            onTriggerItem={(item) => triggerBell(item, true)}
            logs={logs}
          />
        )}

        {activeTab === 'weekly' && (
          <ScheduleWeeklyView
            weeklySchedule={weeklySchedule}
            onUpdateSchedule={handleUpdateWeeklySchedule}
            customSounds={customSounds}
            settings={settings}
          />
        )}

        {activeTab === 'special' && (
          <SpecialScheduleView
            specialSchedules={specialSchedules}
            onUpdateSpecialSchedules={handleUpdateSpecialSchedules}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            customSounds={customSounds}
          />
        )}

        {activeTab === 'holidays' && (
          <HolidayView
            holidays={holidays}
            onUpdateHolidays={handleUpdateHolidays}
          />
        )}

        {activeTab === 'sounds' && (
          <SoundManagerView
            customSounds={customSounds}
            onUpdateCustomSounds={handleUpdateCustomSounds}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
          />
        )}

        {activeTab === 'logs' && (
          <BellHistoryView
            logs={logs}
            onLogsCleared={() => setLogs([])}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
            onFactoryReset={() => {
              setSettings(loadSettings());
              setWeeklySchedule(loadWeeklySchedule());
              setSpecialSchedules(loadSpecialSchedules());
              setHolidays(loadHolidays());
            }}
          />
        )}

        {activeTab === 'guide' && <GuideModal />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Bel Sekolah Otomatis PWA</strong> &copy; {new Date().getFullYear()} — {settings.schoolName}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {isOnline ? 'Online / Siap PWA' : 'Offline Mode (100% Berfungsi)'}
            </span>
            <span>•</span>
            <span>Zona: {settings.timezone}</span>
            <span>•</span>
            <span>Web Audio API Synthesizer</span>
          </div>
        </div>
      </footer>

      {/* Active Bell Ringing Overlay */}
      <ActiveBellOverlay
        isRinging={isCurrentlyRinging}
        eventInfo={activeRingingInfo}
        currentlySpeakingLanguage={currentlySpeakingLanguage}
        onStop={() => audioEngine.stopAll()}
      />

      {/* Fullscreen Kiosk Mode Modal */}
      <KioskModeModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
        settings={settings}
        currentTimeHHMMSS={currentTimeHHMMSS}
        formattedFullDateID={formattedFullDateID}
        isActive={isActive}
        isPaused={isPaused}
        currentHoliday={currentHoliday}
        activeSpecialSchedule={activeSpecialSchedule}
        nextBellItem={nextBellItem}
        countdownFormatted={countdownFormatted}
        progressPercent={progressPercent}
        todaySchedules={todaySchedules}
        getSoundName={getSoundName}
        wakeLockActive={wakeLockActive}
        onRequestPin={() => {
          setIsKioskOpen(false);
          handleOpenPinModal('dashboard');
        }}
      />

      {/* Operator PIN Security Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setTargetTabAfterPin(null);
        }}
        onSuccess={handlePinSuccess}
        correctPin={settings.adminPin}
      />

      {/* Google Drive Cloud Sync & Audio Importer Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        onDataRestored={handleRefreshFromDrive}
        onSoundAdded={handleRefreshFromDrive}
      />
    </div>
  );
}
