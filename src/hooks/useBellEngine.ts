/**
 * Real-time Accurate Bell Engine Hook for Bel Sekolah Otomatis.
 * Handles sub-second synchronized clock, holiday suppression, special schedule overrides,
 * next bell countdown calculation, audio triggering, double-trigger prevention, and Screen Wake Lock.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { BUILTIN_SOUNDS } from '../data/defaultData';
import { audioEngine } from '../services/audioEngine';
import { addBellLog } from '../services/storage';
import {
  BellLog,
  CurrentlySpeakingLanguage,
  CustomSound,
  DayOfWeek,
  HolidayItem,
  MultiLanguageText,
  ScheduleCategory,
  ScheduleItem,
  SchoolSettings,
  SpecialSchedule,
  WeeklySchedule,
} from '../types';

interface UseBellEngineProps {
  settings: SchoolSettings;
  weeklySchedule: WeeklySchedule;
  specialSchedules: SpecialSchedule[];
  holidays: HolidayItem[];
  customSounds: CustomSound[];
  onLogAdded?: (log: BellLog) => void;
}

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

const DAY_NAMES_ID: Record<DayOfWeek, string> = {
  sunday: 'Minggu',
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
};

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function useBellEngine({
  settings,
  weeklySchedule,
  specialSchedules,
  holidays,
  customSounds,
  onLogAdded,
}: UseBellEngineProps) {
  const [now, setNow] = useState<Date>(new Date());
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [skipNextBell, setSkipNextBell] = useState<boolean>(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false);
  const [isCurrentlyRinging, setIsCurrentlyRinging] = useState<boolean>(false);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [currentlySpeakingLanguage, setCurrentlySpeakingLanguage] = useState<CurrentlySpeakingLanguage | null>(null);
  const [activeRingingInfo, setActiveRingingInfo] = useState<{
    label: string;
    soundName: string;
    category: ScheduleCategory;
    time: string;
  } | null>(null);

  // Connect audioEngine speaking language callback
  useEffect(() => {
    audioEngine.onSpeakingLanguageChange = (info) => {
      setCurrentlySpeakingLanguage(info);
    };
    return () => {
      audioEngine.onSpeakingLanguageChange = null;
    };
  }, []);

  // Cache to track events already triggered in current minute (key: YYYY-MM-DD_HH:mm_id)
  const triggeredEventsRef = useRef<Set<string>>(new Set());
  const wakeLockSentinelRef = useRef<any>(null);

  // Timezone date calculation
  const currentZonedDate = useMemo(() => {
    if (settings.timezone === 'auto') {
      return now;
    }
    try {
      const invDate = new Date(
        now.toLocaleString('en-US', { timeZone: settings.timezone })
      );
      return invDate;
    } catch {
      return now;
    }
  }, [now, settings.timezone]);

  const currentDayOfWeek: DayOfWeek = DAY_MAP[currentZonedDate.getDay()];
  const currentYear = currentZonedDate.getFullYear();
  const currentMonth = currentZonedDate.getMonth();
  const currentDayNum = currentZonedDate.getDate();

  const formattedDateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDayNum).padStart(2, '0')}`;
  
  const currentHours = String(currentZonedDate.getHours()).padStart(2, '0');
  const currentMinutes = String(currentZonedDate.getMinutes()).padStart(2, '0');
  const currentSeconds = String(currentZonedDate.getSeconds()).padStart(2, '0');
  const currentTimeHHMM = `${currentHours}:${currentMinutes}`;
  const currentTimeHHMMSS = `${currentHours}:${currentMinutes}:${currentSeconds}`;

  const formattedFullDateID = `${DAY_NAMES_ID[currentDayOfWeek]}, ${currentDayNum} ${MONTH_NAMES_ID[currentMonth]} ${currentYear}`;

  // Check if today is Holiday
  const currentHoliday: HolidayItem | null = useMemo(() => {
    for (const h of holidays) {
      if (formattedDateString >= h.startDate && formattedDateString <= h.endDate) {
        return h;
      }
    }
    return null;
  }, [holidays, formattedDateString]);

  // Check if active Special Schedule applies today
  const activeSpecialSchedule: SpecialSchedule | null = useMemo(() => {
    // 1. Manually activated by setting
    if (settings.activeSpecialScheduleId) {
      const found = specialSchedules.find((s) => s.id === settings.activeSpecialScheduleId);
      if (found) return found;
    }
    // 2. Date-range activated special schedule
    for (const s of specialSchedules) {
      if (s.active) return s;
      if (s.dateStart && s.dateEnd) {
        if (formattedDateString >= s.dateStart && formattedDateString <= s.dateEnd) {
          return s;
        }
      }
    }
    return null;
  }, [specialSchedules, settings.activeSpecialScheduleId, formattedDateString]);

  // Determine Today's Effective Schedule Items
  const todaySchedules: ScheduleItem[] = useMemo(() => {
    let items: ScheduleItem[] = [];
    if (activeSpecialSchedule && activeSpecialSchedule.items.length > 0) {
      items = [...activeSpecialSchedule.items];
    } else {
      items = weeklySchedule[currentDayOfWeek] ? [...weeklySchedule[currentDayOfWeek]] : [];
    }

    // Sort chronologically
    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [activeSpecialSchedule, weeklySchedule, currentDayOfWeek]);

  // Find Sound Name helper
  const getSoundName = (soundId: string): string => {
    const builtin = BUILTIN_SOUNDS.find((s) => s.id === soundId);
    if (builtin) return builtin.name;
    const custom = customSounds.find((s) => s.id === soundId);
    if (custom) return custom.name;
    return 'Bel Sekolah Standar';
  };

  // Find Next Upcoming Bell Item & Countdown
  const { nextBellItem, nextBellIndex, countdownSeconds, progressPercent } = useMemo(() => {
    if (currentHoliday || !todaySchedules.length) {
      return { nextBellItem: null, nextBellIndex: -1, countdownSeconds: null, progressPercent: 0 };
    }

    const currentSecOfDay = currentZonedDate.getHours() * 3600 + currentZonedDate.getMinutes() * 60 + currentZonedDate.getSeconds();

    for (let i = 0; i < todaySchedules.length; i++) {
      const item = todaySchedules[i];
      if (!item.enabled) continue;

      const [h, m] = item.time.split(':').map(Number);
      const itemSecOfDay = h * 3600 + m * 60;

      if (itemSecOfDay > currentSecOfDay) {
        const diff = itemSecOfDay - currentSecOfDay;
        
        // Calculate progress between previous event (or start of day 06:00) and this event
        let prevSecOfDay = 6 * 3600; // 06:00 AM default start
        if (i > 0) {
          const [ph, pm] = todaySchedules[i - 1].time.split(':').map(Number);
          prevSecOfDay = ph * 3600 + pm * 60;
        }
        const totalSpan = Math.max(60, itemSecOfDay - prevSecOfDay);
        const elapsed = Math.max(0, currentSecOfDay - prevSecOfDay);
        const pct = Math.min(100, Math.max(0, Math.round((elapsed / totalSpan) * 100)));

        return {
          nextBellItem: item,
          nextBellIndex: i,
          countdownSeconds: diff,
          progressPercent: pct,
        };
      }
    }

    return { nextBellItem: null, nextBellIndex: -1, countdownSeconds: null, progressPercent: 100 };
  }, [todaySchedules, currentZonedDate, currentHoliday]);

  // Format countdown string: "15 menit 30 detik" or "01:25:40"
  const countdownFormatted = useMemo(() => {
    if (countdownSeconds === null) return null;
    const hours = Math.floor(countdownSeconds / 3600);
    const minutes = Math.floor((countdownSeconds % 3600) / 60);
    const seconds = countdownSeconds % 60;

    if (hours > 0) {
      return `${hours} jam ${minutes} mnt ${seconds} dtk`;
    }
    if (minutes > 0) {
      return `${minutes} menit ${seconds} detik`;
    }
    return `${seconds} detik`;
  }, [countdownSeconds]);

  // Trigger Bell Sound Action
  const triggerBell = async (item: ScheduleItem, isManual: boolean = false) => {
    const soundName = getSoundName(item.soundId);
    
    setIsCurrentlyRinging(true);
    setActiveRingingInfo({
      label: item.label,
      soundName,
      category: item.category,
      time: item.time,
    });

    const duration = item.duration || settings.soundDuration || 6;

    // Compile multi-language phrases
    let speechPhrases: MultiLanguageText | undefined = undefined;
    if (settings.ttsEnabled) {
      if (settings.multiLanguageEnabled) {
        speechPhrases = {
          id: item.speechText || '',
          en: item.speechTextEn || '',
          ar: item.speechTextAr || '',
          zh: item.speechTextZh || '',
        };
      } else {
        speechPhrases = {
          id: item.speechText || '',
        };
      }
    }

    try {
      await audioEngine.playSound(
        item.soundId,
        settings.volume,
        duration,
        speechPhrases,
        settings.ttsVoiceRate,
        settings.activeLanguages || ['id', 'en', 'ar', 'zh'],
        settings.languageDelayMs ?? 500
      );

      const log = addBellLog({
        dateString: formattedDateString,
        timeString: currentTimeHHMMSS,
        eventLabel: item.label,
        category: item.category,
        soundName,
        status: isManual ? 'manual' : 'success',
        details: isManual ? 'Dibunyikan secara manual oleh operator' : 'Bel otomatis tepat waktu',
      });

      if (onLogAdded) onLogAdded(log);
    } catch (err) {
      console.error('Bell ring failed:', err);
      const log = addBellLog({
        dateString: formattedDateString,
        timeString: currentTimeHHMMSS,
        eventLabel: item.label,
        category: item.category,
        soundName,
        status: 'failed',
        details: `Gagal memutar audio: ${(err as Error).message}`,
      });
      if (onLogAdded) onLogAdded(log);
    } finally {
      setTimeout(() => {
        setIsCurrentlyRinging(false);
        setActiveRingingInfo(null);
      }, (duration + 2) * 1000);
    }
  };

  // Manual Trigger
  const triggerManualBellNow = (soundId?: string, label?: string, category: ScheduleCategory = 'khusus') => {
    const sId = soundId || settings.defaultSoundId || 'westminster-8';
    const fakeItem: ScheduleItem = {
      id: `manual-${Date.now()}`,
      day: currentDayOfWeek,
      time: currentTimeHHMM,
      label: label || 'Bel Manual Operator',
      category,
      soundId: sId,
      duration: settings.soundDuration || 6,
      enabled: true,
    };
    triggerBell(fakeItem, true);
  };

  // Unlock AudioContext handler
  const unlockAudio = async () => {
    const success = await audioEngine.unlock();
    setIsAudioUnlocked(success);
    return success;
  };

  // Screen Wake Lock API handler (Keeps screen awake on Chromebook / PC)
  const enableWakeLock = async () => {
    if ('wakeLock' in navigator && settings.wakeLockEnabled) {
      try {
        wakeLockSentinelRef.current = await (navigator as any).wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockSentinelRef.current.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
        setWakeLockActive(false);
      }
    }
  };

  // Initialize Clock Tick & Evaluation
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 500); // 500ms check for crisp responsive second transitions

    return () => clearInterval(interval);
  }, []);

  // Screen wake lock listener
  useEffect(() => {
    if (settings.wakeLockEnabled) {
      enableWakeLock();
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && settings.wakeLockEnabled) {
        enableWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current.release().catch(() => {});
      }
    };
  }, [settings.wakeLockEnabled]);

  // Clean triggered events ref at midnight
  useEffect(() => {
    if (currentTimeHHMMSS === '00:00:00') {
      triggeredEventsRef.current.clear();
    }
  }, [currentTimeHHMMSS]);

  // CORE EVALUATION LOOP: Check every second if scheduled bell matches now
  useEffect(() => {
    // Check if audio context is unlocked
    setIsAudioUnlocked(audioEngine.getUnlockedStatus());

    // Only trigger in the exact matching minute
    const currentSecondNum = currentZonedDate.getSeconds();
    // Allow trigger within first 3 seconds of the minute to prevent lag misses
    if (currentSecondNum > 3) return;

    if (!todaySchedules || todaySchedules.length === 0) return;

    for (const item of todaySchedules) {
      if (item.time === currentTimeHHMM) {
        const eventKey = `${formattedDateString}_${currentTimeHHMM}_${item.id}`;

        if (triggeredEventsRef.current.has(eventKey)) {
          continue; // Already triggered this minute
        }

        // Mark as triggered immediately to avoid duplicate
        triggeredEventsRef.current.add(eventKey);

        // Check if System is Inactive
        if (!isActive) {
          addBellLog({
            dateString: formattedDateString,
            timeString: currentTimeHHMMSS,
            eventLabel: item.label,
            category: item.category,
            soundName: getSoundName(item.soundId),
            status: 'disabled_skipped',
            details: 'Dilewati karena Sistem Bel sedang NONAKTIF',
          });
          continue;
        }

        // Check if Holiday
        if (currentHoliday) {
          addBellLog({
            dateString: formattedDateString,
            timeString: currentTimeHHMMSS,
            eventLabel: item.label,
            category: item.category,
            soundName: getSoundName(item.soundId),
            status: 'holiday_skipped',
            details: `Dilewati karena Hari Libur (${currentHoliday.name})`,
          });
          continue;
        }

        // Check if Paused
        if (isPaused) {
          addBellLog({
            dateString: formattedDateString,
            timeString: currentTimeHHMMSS,
            eventLabel: item.label,
            category: item.category,
            soundName: getSoundName(item.soundId),
            status: 'paused_skipped',
            details: 'Dilewati karena Sistem Bel sedang di-Jeda oleh operator',
          });
          continue;
        }

        // Check if Skip Next Bell is active
        if (skipNextBell) {
          setSkipNextBell(false);
          addBellLog({
            dateString: formattedDateString,
            timeString: currentTimeHHMMSS,
            eventLabel: item.label,
            category: item.category,
            soundName: getSoundName(item.soundId),
            status: 'paused_skipped',
            details: 'Dilewati karena tombol Lewati Bel Berikutnya diaktifkan',
          });
          continue;
        }

        // Check if item is disabled
        if (!item.enabled) {
          continue;
        }

        // Ring the bell!
        triggerBell(item, false);
      }
    }
  }, [
    currentTimeHHMM,
    currentZonedDate,
    todaySchedules,
    isActive,
    isPaused,
    currentHoliday,
    skipNextBell,
    formattedDateString,
    currentTimeHHMMSS,
  ]);

  return {
    currentTimeHHMM,
    currentTimeHHMMSS,
    formattedFullDateID,
    formattedDateString,
    currentDayOfWeek,
    currentHoliday,
    activeSpecialSchedule,
    todaySchedules,
    nextBellItem,
    nextBellIndex,
    countdownSeconds,
    countdownFormatted,
    progressPercent,
    isActive,
    isPaused,
    skipNextBell,
    isAudioUnlocked,
    isCurrentlyRinging,
    activeRingingInfo,
    currentlySpeakingLanguage,
    wakeLockActive,
    toggleActive: () => setIsActive((prev) => !prev),
    togglePause: () => setIsPaused((prev) => !prev),
    toggleSkipNext: () => setSkipNextBell((prev) => !prev),
    triggerManualBellNow,
    triggerBell,
    stopAllBells: () => audioEngine.stopAll(),
    speakSingleLanguage: (text: string, lang: any, rate?: number) => audioEngine.speakSingleLanguage(text, lang, rate),
    unlockAudio,
    getSoundName,
  };
}
