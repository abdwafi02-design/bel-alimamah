/**
 * Data structures and types for Bel Sekolah Otomatis
 */

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type LanguageCode = 'id' | 'en' | 'ar' | 'zh';

export interface MultiLanguageText {
  id?: string; // Bahasa Indonesia
  en?: string; // English
  ar?: string; // العربية (Arabic)
  zh?: string; // 中文 (Mandarin)
}

export type ScheduleCategory = 
  | 'masuk' 
  | 'upacara' 
  | 'pelajaran' 
  | 'istirahat' 
  | 'sholat' 
  | 'pulang' 
  | 'khusus';

export interface ScheduleItem {
  id: string;
  day: DayOfWeek;
  time: string; // 'HH:mm' e.g. '07:00'
  label: string; // e.g. 'Masuk Sekolah & Pembiasaan'
  category: ScheduleCategory;
  soundId: string; // e.g. 'westminster-4', 'chime-3', 'custom-123'
  duration: number; // in seconds, default 5-10s
  enabled: boolean;
  speechText?: string; // Bahasa Indonesia (Default)
  speechTextEn?: string; // Bahasa Inggris (English)
  speechTextAr?: string; // Bahasa Arab (العربية)
  speechTextZh?: string; // Bahasa Mandarin (中文)
}

export type WeeklySchedule = Record<DayOfWeek, ScheduleItem[]>;

export interface SpecialSchedule {
  id: string;
  name: string; // e.g. 'Asesmen Sumatif Akhir Semester (ASAS)'
  description: string;
  active: boolean;
  dateStart?: string; // 'YYYY-MM-DD'
  dateEnd?: string;   // 'YYYY-MM-DD'
  daysOfWeek?: DayOfWeek[]; // If limited to specific days
  items: ScheduleItem[];
}

export interface HolidayItem {
  id: string;
  name: string; // e.g. 'Hari Kemerdekaan RI'
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  type: 'nasional' | 'sekolah' | 'khusus' | 'keagamaan';
  description?: string;
}

export interface BuiltinSound {
  id: string;
  name: string;
  type: 'builtin';
  category: 'chime' | 'westminster' | 'electric' | 'alarm' | 'melodic';
  description: string;
  defaultDuration: number;
  isNewVersion?: boolean;
  versionLabel?: string;
}

export interface CustomSound {
  id: string;
  name: string;
  type: 'custom';
  fileName: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  duration?: number;
}

export type BellSound = BuiltinSound | CustomSound;

export interface SchoolSettings {
  schoolName: string;
  schoolNPSN?: string;
  schoolAddress?: string;
  schoolLogo?: string; // Data URL or preset name
  timezone: 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura' | 'auto';
  volume: number; // 0 to 1
  defaultSoundId: string;
  soundDuration: number; // seconds
  ttsEnabled: boolean;
  multiLanguageEnabled: boolean; // Enable 4-language speech
  activeLanguages: LanguageCode[]; // Default: ['id', 'en', 'ar', 'zh']
  ttsVoiceRate: number; // 0.8 to 1.2
  languageDelayMs: number; // Delay in ms between spoken languages (e.g. 500ms)
  adminPin: string; // e.g. '1234'
  isPinRequired: boolean;
  wakeLockEnabled: boolean; // Screen wake lock API
  use24HourFormat: boolean;
  showSeconds: boolean;
  activeSpecialScheduleId?: string | null;
}

export type LogStatus = 'success' | 'holiday_skipped' | 'paused_skipped' | 'manual' | 'failed' | 'disabled_skipped';

export interface BellLog {
  id: string;
  timestamp: number;
  dateString: string; // 'YYYY-MM-DD'
  timeString: string; // 'HH:mm:ss'
  eventLabel: string;
  category: ScheduleCategory;
  soundName: string;
  status: LogStatus;
  details?: string;
}

export interface CurrentlySpeakingLanguage {
  code: LanguageCode;
  lang: LanguageCode;
  name: string;
  flag: string;
  text: string;
}

export interface BellSystemState {
  isActive: boolean;
  isPaused: boolean;
  isAudioUnlocked: boolean;
  isMuted: boolean;
  skipNextBell: boolean;
  isCurrentlyRinging: boolean;
  currentSpeakingLanguage?: CurrentlySpeakingLanguage | null;
  currentRingingEvent: {
    label: string;
    soundName: string;
    category: ScheduleCategory;
    time: string;
    speechPhrases?: MultiLanguageText;
  } | null;
}

export type ActiveTab = 
  | 'dashboard'
  | 'weekly'
  | 'special'
  | 'holidays'
  | 'sounds'
  | 'logs'
  | 'settings'
  | 'guide';
