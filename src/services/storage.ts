/**
 * LocalStorage Service for School Bell Configuration, Schedules, Holidays, Logs, and Settings.
 */

import {
  DEFAULT_HOLIDAYS,
  DEFAULT_SETTINGS,
  DEFAULT_SPECIAL_SCHEDULES,
  DEFAULT_WEEKLY_SCHEDULE,
} from '../data/defaultData';
import {
  BellLog,
  CustomSound,
  HolidayItem,
  SchoolSettings,
  SpecialSchedule,
  WeeklySchedule,
} from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'bel_sekolah_settings_v1',
  WEEKLY: 'bel_sekolah_weekly_v1',
  SPECIAL: 'bel_sekolah_special_v1',
  HOLIDAYS: 'bel_sekolah_holidays_v1',
  CUSTOM_SOUNDS: 'bel_sekolah_custom_sounds_v1',
  LOGS: 'bel_sekolah_logs_v1',
  SYSTEM_STATE: 'bel_sekolah_system_state_v1',
};

export interface ExportBackupData {
  version: string;
  exportedAt: string;
  settings: SchoolSettings;
  weeklySchedule: WeeklySchedule;
  specialSchedules: SpecialSchedule[];
  holidays: HolidayItem[];
  customSounds: CustomSound[];
  logs?: BellLog[];
}

const MIGRATION_KEY = 'bel_sekolah_alimamah_initialized_v2';

export function checkAndApplySchoolMigration(): void {
  try {
    const isMigrated = localStorage.getItem(MIGRATION_KEY);
    if (!isMigrated) {
      const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        // If placeholder name or older default, upgrade to Al-Imamah defaults
        if (!parsed.schoolName || parsed.schoolName.includes('NEGERI INDONESIA') || parsed.schoolName.includes('SMP / SMA')) {
          saveSettings({
            ...DEFAULT_SETTINGS,
            adminPin: parsed.adminPin || DEFAULT_SETTINGS.adminPin,
            isPinRequired: parsed.isPinRequired ?? false,
          });
          saveWeeklySchedule({ ...DEFAULT_WEEKLY_SCHEDULE });
          saveSpecialSchedules([...DEFAULT_SPECIAL_SCHEDULES]);
          saveHolidays([...DEFAULT_HOLIDAYS]);
        }
      } else {
        saveSettings({ ...DEFAULT_SETTINGS });
        saveWeeklySchedule({ ...DEFAULT_WEEKLY_SCHEDULE });
        saveSpecialSchedules([...DEFAULT_SPECIAL_SCHEDULES]);
        saveHolidays([...DEFAULT_HOLIDAYS]);
      }
      localStorage.setItem(MIGRATION_KEY, 'true');
    }
  } catch (e) {
    console.warn('Migration to SMP/MA AL-IMAMAH failed:', e);
  }
}

export function loadSettings(): SchoolSettings {
  try {
    checkAndApplySchoolMigration();
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export const loadSchoolSettings = loadSettings;

export function saveSettings(settings: SchoolSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export const saveSchoolSettings = saveSettings;

export function loadWeeklySchedule(): WeeklySchedule {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY);
    if (!raw) return { ...DEFAULT_WEEKLY_SCHEDULE };
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_WEEKLY_SCHEDULE };
  }
}

export function saveWeeklySchedule(schedule: WeeklySchedule): void {
  localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(schedule));
}

export function loadSpecialSchedules(): SpecialSchedule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPECIAL);
    if (!raw) return [...DEFAULT_SPECIAL_SCHEDULES];
    return JSON.parse(raw);
  } catch {
    return [...DEFAULT_SPECIAL_SCHEDULES];
  }
}

export function saveSpecialSchedules(schedules: SpecialSchedule[]): void {
  localStorage.setItem(STORAGE_KEYS.SPECIAL, JSON.stringify(schedules));
}

export function loadHolidays(): HolidayItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
    if (!raw) return [...DEFAULT_HOLIDAYS];
    return JSON.parse(raw);
  } catch {
    return [...DEFAULT_HOLIDAYS];
  }
}

export function saveHolidays(holidays: HolidayItem[]): void {
  localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
}

export function loadCustomSounds(): CustomSound[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SOUNDS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomSounds(sounds: CustomSound[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_SOUNDS, JSON.stringify(sounds));
}

export function loadBellLogs(): BellLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) return [];
    const parsed: BellLog[] = JSON.parse(raw);
    // Keep max 500 recent logs
    return parsed.slice(0, 500);
  } catch {
    return [];
  }
}

export function saveBellLogs(logs: BellLog[]): void {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 500)));
}

export function addBellLog(log: Omit<BellLog, 'id' | 'timestamp'>): BellLog {
  const currentLogs = loadBellLogs();
  const newLog: BellLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };
  const updated = [newLog, ...currentLogs].slice(0, 500);
  saveBellLogs(updated);
  return newLog;
}

export function clearAllLogs(): void {
  localStorage.removeItem(STORAGE_KEYS.LOGS);
}

/**
 * Full JSON Backup and Export
 */
export function exportAllData(): string {
  const backup: ExportBackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings: loadSettings(),
    weeklySchedule: loadWeeklySchedule(),
    specialSchedules: loadSpecialSchedules(),
    holidays: loadHolidays(),
    customSounds: loadCustomSounds(),
    logs: loadBellLogs().slice(0, 100),
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Full JSON Restore
 */
export function importBackupData(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString) as Partial<ExportBackupData>;
    if (!parsed.weeklySchedule && !parsed.settings) {
      return { success: false, message: 'Format file backup tidak valid atau rusak.' };
    }

    if (parsed.settings) saveSettings(parsed.settings);
    if (parsed.weeklySchedule) saveWeeklySchedule(parsed.weeklySchedule);
    if (parsed.specialSchedules) saveSpecialSchedules(parsed.specialSchedules);
    if (parsed.holidays) saveHolidays(parsed.holidays);
    if (parsed.customSounds) saveCustomSounds(parsed.customSounds);
    if (parsed.logs) saveBellLogs(parsed.logs);

    return { success: true, message: 'Data backup berhasil dipulihkan secara lengkap.' };
  } catch (err) {
    return { success: false, message: `Gagal membaca file: ${(err as Error).message}` };
  }
}

/**
 * Reset application to factory default settings and schedules
 */
export function resetToFactoryDefaults(): void {
  saveSettings({ ...DEFAULT_SETTINGS });
  saveWeeklySchedule({ ...DEFAULT_WEEKLY_SCHEDULE });
  saveSpecialSchedules([...DEFAULT_SPECIAL_SCHEDULES]);
  saveHolidays([...DEFAULT_HOLIDAYS]);
  clearAllLogs();
}
