import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Copy,
  FileSpreadsheet,
  Globe,
  Languages,
  Plus,
  Sparkles,
  Trash2,
  Volume2,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  DEFAULT_FRIDAY_SCHEDULE,
  DEFAULT_MONDAY_SCHEDULE,
  DEFAULT_SATURDAY_SCHEDULE,
  DEFAULT_TUE_THU_SCHEDULE,
} from '../data/defaultData';
import { BUILTIN_SOUNDS } from '../data/defaultData';
import { audioEngine } from '../services/audioEngine';
import {
  generate4LanguageText,
  getPhoneticArabicText,
  MULTI_LANGUAGE_PRESETS,
  ORDERED_LANGUAGES,
  SUPPORTED_LANGUAGES,
} from '../services/multiLanguageTts';
import {
  CustomSound,
  DayOfWeek,
  LanguageCode,
  ScheduleCategory,
  ScheduleItem,
  SchoolSettings,
  WeeklySchedule,
} from '../types';

interface ScheduleWeeklyViewProps {
  weeklySchedule: WeeklySchedule;
  onUpdateSchedule: (newSchedule: WeeklySchedule) => void;
  customSounds: CustomSound[];
  settings: SchoolSettings;
}

const DAYS_LIST: Array<{ id: DayOfWeek; label: string; short: string }> = [
  { id: 'monday', label: 'Senin', short: 'Sen' },
  { id: 'tuesday', label: 'Selasa', short: 'Sel' },
  { id: 'wednesday', label: 'Rabu', short: 'Rab' },
  { id: 'thursday', label: 'Kamis', short: 'Kam' },
  { id: 'friday', label: 'Jumat', short: 'Jum' },
  { id: 'saturday', label: 'Sabtu', short: 'Sab' },
  { id: 'sunday', label: 'Minggu', short: 'Min' },
];

export const ScheduleWeeklyView: React.FC<ScheduleWeeklyViewProps> = ({
  weeklySchedule,
  onUpdateSchedule,
  customSounds,
  settings,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form State
  const [formTime, setFormTime] = useState('07:00');
  const [formLabel, setFormLabel] = useState('');
  const [formCategory, setFormCategory] = useState<ScheduleCategory>('pelajaran');
  const [formSoundId, setFormSoundId] = useState(settings.defaultSoundId || 'westminster-4');
  const [formDuration, setFormDuration] = useState(5);
  const [formEnabled, setFormEnabled] = useState(true);
  const [formSpeechText, setFormSpeechText] = useState('');
  const [formSpeechTextEn, setFormSpeechTextEn] = useState('');
  const [formSpeechTextAr, setFormSpeechTextAr] = useState('');
  const [formSpeechTextZh, setFormSpeechTextZh] = useState('');
  const [activeLangTab, setActiveLangTab] = useState<LanguageCode>('id');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  // Copy Modal State
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [targetDays, setTargetDays] = useState<DayOfWeek[]>([]);

  // Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const currentDayItems = weeklySchedule[selectedDay] || [];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTime('07:00');
    setFormLabel('');
    setFormCategory('pelajaran');
    setFormSoundId(settings.defaultSoundId || 'westminster-4');
    setFormDuration(settings.soundDuration || 5);
    setFormEnabled(true);
    setFormSpeechText('');
    setFormSpeechTextEn('');
    setFormSpeechTextAr('');
    setFormSpeechTextZh('');
    setActiveLangTab('id');
    setSelectedPresetId('');
    setItemModalOpen(true);
  };

  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormTime(item.time);
    setFormLabel(item.label);
    setFormCategory(item.category);
    setFormSoundId(item.soundId);
    setFormDuration(item.duration || 5);
    setFormEnabled(item.enabled);
    setFormSpeechText(item.speechText || '');
    setFormSpeechTextEn(item.speechTextEn || '');
    setFormSpeechTextAr(item.speechTextAr || '');
    setFormSpeechTextZh(item.speechTextZh || '');
    setActiveLangTab('id');
    setSelectedPresetId('');
    setItemModalOpen(true);
  };

  // Automatically generate 4-Language announcement texts
  const handleAutoGenerate4Languages = () => {
    if (!formLabel.trim()) return;
    const generated = generate4LanguageText(formLabel, formCategory, formSpeechText);
    setFormSpeechText(generated.id);
    setFormSpeechTextEn(generated.en);
    setFormSpeechTextAr(generated.ar);
    setFormSpeechTextZh(generated.zh);
  };

  // Apply a 4-language preset template
  const handleApplyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = MULTI_LANGUAGE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setFormLabel(preset.label);
    setFormCategory(preset.category);
    setFormSpeechText(preset.phrases.id);
    setFormSpeechTextEn(preset.phrases.en);
    setFormSpeechTextAr(preset.phrases.ar);
    setFormSpeechTextZh(preset.phrases.zh);
  };

  // Single language preview
  const handleTestSingleLang = (langCode: LanguageCode) => {
    const textMap: Record<LanguageCode, string> = {
      id: formSpeechText,
      en: formSpeechTextEn,
      ar: formSpeechTextAr,
      zh: formSpeechTextZh,
    };
    const text = textMap[langCode];
    if (!text || !text.trim()) return;
    audioEngine.speakSingleLanguage(text.trim(), langCode, settings.ttsVoiceRate || 1.0);
  };

  // Test full 4-language sequence
  const handleTestAll4Languages = () => {
    const multiLang = {
      id: formSpeechText.trim(),
      en: formSpeechTextEn.trim(),
      ar: formSpeechTextAr.trim(),
      zh: formSpeechTextZh.trim(),
    };
    audioEngine.queueMultiLanguageSpeech(
      multiLang,
      settings.ttsVoiceRate || 1.0,
      0,
      settings.activeLanguages || ['id', 'en', 'ar', 'zh'],
      settings.languageDelayMs ?? 500
    );
  };

  const handleSaveItem = () => {
    if (!formLabel.trim()) return;

    let updatedDayList: ScheduleItem[] = [];

    if (editingItem) {
      // Edit
      updatedDayList = currentDayItems.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              time: formTime,
              label: formLabel.trim(),
              category: formCategory,
              soundId: formSoundId,
              duration: Number(formDuration) || 5,
              enabled: formEnabled,
              speechText: formSpeechText.trim() || undefined,
              speechTextEn: formSpeechTextEn.trim() || undefined,
              speechTextAr: formSpeechTextAr.trim() || undefined,
              speechTextZh: formSpeechTextZh.trim() || undefined,
            }
          : it
      );
    } else {
      // Add
      const newItem: ScheduleItem = {
        id: `sched-${selectedDay}-${Date.now()}`,
        day: selectedDay,
        time: formTime,
        label: formLabel.trim(),
        category: formCategory,
        soundId: formSoundId,
        duration: Number(formDuration) || 5,
        enabled: formEnabled,
        speechText: formSpeechText.trim() || undefined,
        speechTextEn: formSpeechTextEn.trim() || undefined,
        speechTextAr: formSpeechTextAr.trim() || undefined,
        speechTextZh: formSpeechTextZh.trim() || undefined,
      };
      updatedDayList = [...currentDayItems, newItem];
    }

    // Sort chronologically
    updatedDayList.sort((a, b) => a.time.localeCompare(b.time));

    onUpdateSchedule({
      ...weeklySchedule,
      [selectedDay]: updatedDayList,
    });

    setItemModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = currentDayItems.filter((i) => i.id !== id);
    onUpdateSchedule({
      ...weeklySchedule,
      [selectedDay]: updated,
    });
  };

  const handleToggleItem = (id: string) => {
    const updated = currentDayItems.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i));
    onUpdateSchedule({
      ...weeklySchedule,
      [selectedDay]: updated,
    });
  };

  // Preview sound with multi-language
  const handlePreviewSound = (sId: string) => {
    const multiLang = {
      id: formSpeechText.trim(),
      en: formSpeechTextEn.trim(),
      ar: formSpeechTextAr.trim(),
      zh: formSpeechTextZh.trim(),
    };
    audioEngine.playSound(
      sId,
      settings.volume,
      formDuration,
      multiLang,
      settings.ttsVoiceRate,
      settings.activeLanguages || ['id', 'en', 'ar', 'zh'],
      settings.languageDelayMs ?? 500
    );
  };

  // Copy Schedule to other days
  const handleExecuteCopy = () => {
    if (targetDays.length === 0) return;

    const newSchedule = { ...weeklySchedule };
    targetDays.forEach((targetDay) => {
      newSchedule[targetDay] = currentDayItems.map((item, idx) => ({
        ...item,
        id: `sched-${targetDay}-${Date.now()}-${idx}`,
        day: targetDay,
      }));
    });

    onUpdateSchedule(newSchedule);
    setCopyModalOpen(false);
    setTargetDays([]);
  };

  // Apply Standard Templates
  const handleApplyTemplate = (type: 'smp-8jam' | 'sd-6jam' | 'jumat-pendek' | 'reset-standar') => {
    let newSchedule = { ...weeklySchedule };

    if (type === 'smp-8jam') {
      newSchedule.monday = DEFAULT_MONDAY_SCHEDULE;
      newSchedule.tuesday = DEFAULT_TUE_THU_SCHEDULE('tuesday');
      newSchedule.wednesday = DEFAULT_TUE_THU_SCHEDULE('wednesday');
      newSchedule.thursday = DEFAULT_TUE_THU_SCHEDULE('thursday');
      newSchedule.friday = DEFAULT_FRIDAY_SCHEDULE;
      newSchedule.saturday = DEFAULT_SATURDAY_SCHEDULE;
    } else if (type === 'sd-6jam') {
      const sdDaily = (day: DayOfWeek) => [
        { id: `sd-${day}-1`, day, time: '07:00', label: 'Bel Masuk Sekolah & Doa Pagi', category: 'masuk' as const, soundId: 'westminster-8', duration: 6, enabled: true },
        { id: `sd-${day}-2`, day, time: '07:15', label: 'Pelajaran 1', category: 'pelajaran' as const, soundId: 'chime-3-tone', duration: 4, enabled: true },
        { id: `sd-${day}-3`, day, time: '07:50', label: 'Pelajaran 2', category: 'pelajaran' as const, soundId: 'chime-2-tone', duration: 3, enabled: true },
        { id: `sd-${day}-4`, day, time: '08:25', label: 'Pelajaran 3', category: 'pelajaran' as const, soundId: 'chime-2-tone', duration: 3, enabled: true },
        { id: `sd-${day}-5`, day, time: '09:00', label: 'Istirahat Pertama', category: 'istirahat' as const, soundId: 'marimba-peace', duration: 4, enabled: true },
        { id: `sd-${day}-6`, day, time: '09:30', label: 'Pelajaran 4', category: 'pelajaran' as const, soundId: 'chime-3-tone', duration: 4, enabled: true },
        { id: `sd-${day}-7`, day, time: '10:05', label: 'Pelajaran 5', category: 'pelajaran' as const, soundId: 'chime-2-tone', duration: 3, enabled: true },
        { id: `sd-${day}-8`, day, time: '10:40', label: 'Pelajaran 6', category: 'pelajaran' as const, soundId: 'chime-2-tone', duration: 3, enabled: true },
        { id: `sd-${day}-9`, day, time: '11:15', label: 'Bel Pulang SD', category: 'pulang' as const, soundId: 'westminster-16', duration: 10, enabled: true },
      ];
      newSchedule = {
        monday: sdDaily('monday'),
        tuesday: sdDaily('tuesday'),
        wednesday: sdDaily('wednesday'),
        thursday: sdDaily('thursday'),
        friday: DEFAULT_FRIDAY_SCHEDULE,
        saturday: [],
        sunday: [],
      };
    }

    onUpdateSchedule(newSchedule);
    setTemplateModalOpen(false);
  };

  const getSoundName = (soundId: string): string => {
    const builtin = BUILTIN_SOUNDS.find((s) => s.id === soundId);
    if (builtin) return builtin.name;
    const custom = customSounds.find((s) => s.id === soundId);
    if (custom) return custom.name;
    return 'Bel Standar';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-blue-400" />
            Pengaturan Jadwal Mingguan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Atur waktu bel berbunyi untuk masing-masing hari (Senin s/d Minggu).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-template-schedule"
            onClick={() => setTemplateModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>Template Jadwal</span>
          </button>

          <button
            id="btn-copy-schedule"
            onClick={() => setCopyModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95 cursor-pointer"
          >
            <Copy className="w-4 h-4 text-purple-400" />
            <span>Duplikasi Hari</span>
          </button>

          <button
            id="btn-add-schedule-item"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Bel</span>
          </button>
        </div>
      </div>

      {/* Days Tabs (Senin - Minggu) */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {DAYS_LIST.map((day) => {
          const isSelected = selectedDay === day.id;
          const count = weeklySchedule[day.id]?.length || 0;
          return (
            <button
              key={day.id}
              id={`day-tab-${day.id}`}
              onClick={() => setSelectedDay(day.id)}
              className={`flex-1 min-w-[100px] p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20 font-bold scale-[1.02]'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="text-sm sm:text-base font-bold">{day.label}</div>
              <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                {count} Bel Jadwal
              </div>
            </button>
          );
        })}
      </div>

      {/* List of Schedules for Selected Day */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              Jadwal Hari {DAYS_LIST.find((d) => d.id === selectedDay)?.label}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Urutan bel otomatis yang akan dibunyikan pada hari ini.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-800 rounded-xl text-slate-300">
            {currentDayItems.length} Kegiatan Terdaftar
          </span>
        </div>

        {currentDayItems.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-base font-semibold text-slate-300">Belum ada jadwal untuk hari ini.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Klik tombol &quot;Tambah Jadwal Bel&quot; di atas atau gunakan &quot;Template Jadwal&quot; untuk mengisi otomatis.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDayItems.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3 ${
                  item.enabled
                    ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-white'
                    : 'bg-slate-950/30 border-slate-900 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Time Badge */}
                  <div className="font-mono-digital text-2xl font-black text-amber-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner min-w-[90px] text-center">
                    {item.time}
                  </div>

                  {/* Label & Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold">{item.label}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                        {getSoundName(item.soundId)}
                      </span>
                      <span>•</span>
                      <span>Durasi: {item.duration || 5}s</span>
                      {/* Multi-language badges */}
                      {(item.speechText || item.speechTextEn || item.speechTextAr || item.speechTextZh) && (
                        <div className="flex items-center gap-1.5 ml-1">
                          {item.speechText && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title={item.speechText}>
                              🇮🇩 ID
                            </span>
                          )}
                          {item.speechTextEn && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20" title={item.speechTextEn}>
                              🇬🇧 EN
                            </span>
                          )}
                          {item.speechTextAr && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20" title={item.speechTextAr}>
                              🇸🇦 AR
                            </span>
                          )}
                          {item.speechTextZh && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20" title={item.speechTextZh}>
                              🇨🇳 ZH
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {item.speechText && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                        &ldquo;{item.speechText}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Preview test sound */}
                  <button
                    onClick={() => handlePreviewSound(item.soundId)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs cursor-pointer"
                    title="Dengar Suara"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Enable / Disable Toggle */}
                  <button
                    onClick={() => handleToggleItem(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      item.enabled
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {item.enabled ? 'Aktif' : 'Nonaktif'}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-all text-xs cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                {editingItem ? 'Edit Jadwal Bel' : 'Tambah Jadwal Bel Baru'}
              </h3>
              <button
                onClick={() => setItemModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Time & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Waktu Bel (Format 24 Jam):
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-base focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori Kegiatan:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ScheduleCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="masuk">Masuk Sekolah / Pembiasaan</option>
                    <option value="upacara">Upacara / Apel</option>
                    <option value="pelajaran">Jam Pelajaran</option>
                    <option value="istirahat">Istirahat</option>
                    <option value="sholat">Ibadah / Sholat Dzuhur</option>
                    <option value="pulang">Pulang Sekolah</option>
                    <option value="khusus">Kegiatan Khusus</option>
                  </select>
                </div>
              </div>

              {/* Label */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Kegiatan / Keterangan:
                </label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="Contoh: Jam Pelajaran 1 Dimulai"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Sound Selection & Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Pilihan Suara Bel:
                  </label>
                  <button
                    type="button"
                    onClick={() => handlePreviewSound(formSoundId)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Tes Putar Suara
                  </button>
                </div>
                <select
                  value={formSoundId}
                  onChange={(e) => setFormSoundId(e.target.value)}
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

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Durasi Bel (Detik):
                </label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 4-Language Voice Announcement Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      Pengumuman Suara 4 Bahasa (Otomatis)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoGenerate4Languages}
                      disabled={!formLabel.trim()}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 flex items-center gap-1 disabled:opacity-40 transition-all cursor-pointer"
                      title="Generate terjemahan 4 bahasa otomatis dari nama kegiatan"
                    >
                      <Sparkles className="w-3 h-3 text-purple-300" />
                      Auto-Translate 4 Bahasa
                    </button>
                    <button
                      type="button"
                      onClick={handleTestAll4Languages}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 flex items-center gap-1 transition-all cursor-pointer"
                      title="Tes putar pengumuman 4 bahasa berurutan"
                    >
                      <Volume2 className="w-3 h-3 text-blue-300" />
                      Tes 4 Bahasa
                    </button>
                  </div>
                </div>

                {/* Preset Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">Template Cepat:</span>
                  <select
                    value={selectedPresetId}
                    onChange={(e) => handleApplyPreset(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Template Pengumuman 4 Bahasa --</option>
                    {MULTI_LANGUAGE_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Tabs */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  {ORDERED_LANGUAGES.map((langKey) => {
                    const lInfo = SUPPORTED_LANGUAGES[langKey];
                    const isTabActive = activeLangTab === langKey;
                    const hasContent =
                      langKey === 'id'
                        ? !!formSpeechText.trim()
                        : langKey === 'en'
                        ? !!formSpeechTextEn.trim()
                        : langKey === 'ar'
                        ? !!formSpeechTextAr.trim()
                        : !!formSpeechTextZh.trim();

                    return (
                      <button
                        key={langKey}
                        type="button"
                        onClick={() => setActiveLangTab(langKey)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isTabActive
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <span>{lInfo.flag}</span>
                        <span className="hidden sm:inline">{lInfo.shortLabel}</span>
                        {hasContent && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isTabActive ? 'bg-white' : 'bg-emerald-400'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Language Input Fields based on active tab */}
                <div className="space-y-2 pt-1">
                  {activeLangTab === 'id' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                          <span>🇮🇩</span> Bahasa Indonesia (id-ID)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleTestSingleLang('id')}
                          disabled={!formSpeechText.trim()}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 disabled:opacity-40"
                        >
                          <Volume2 className="w-3 h-3" /> Tes Suara ID
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={formSpeechText}
                        onChange={(e) => setFormSpeechText(e.target.value)}
                        placeholder="Contoh: Saatnya jam pelajaran ke-1 dimulai."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-sans"
                      />
                    </div>
                  )}

                  {activeLangTab === 'en' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
                          <span>🇬🇧</span> Bahasa Inggris / English (en-US)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleTestSingleLang('en')}
                          disabled={!formSpeechTextEn.trim()}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 disabled:opacity-40"
                        >
                          <Volume2 className="w-3 h-3" /> Tes Suara EN
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={formSpeechTextEn}
                        onChange={(e) => setFormSpeechTextEn(e.target.value)}
                        placeholder="Example: It is time for the first period to begin."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-sans"
                      />
                    </div>
                  )}

                  {activeLangTab === 'ar' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                          <span>🇸🇦</span> Bahasa Arab / العربية (ar-SA)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleTestSingleLang('ar')}
                          disabled={!formSpeechTextAr.trim()}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" /> Tes Suara AR
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        dir="rtl"
                        value={formSpeechTextAr}
                        onChange={(e) => setFormSpeechTextAr(e.target.value)}
                        placeholder="مثال: حان وقت بدء الحصة الأولى."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-sans text-right"
                      />
                      {formSpeechTextAr.trim() && (
                        <div className="mt-1.5 p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[10px] text-emerald-300 flex items-start gap-1.5">
                          <span className="font-semibold shrink-0">Lafal Fonetik:</span>
                          <span className="font-mono text-emerald-200 line-clamp-1">
                            &ldquo;{getPhoneticArabicText(formSpeechTextAr)}&rdquo;
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeLangTab === 'zh' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                          <span>🇨🇳</span> Bahasa Mandarin / 中文 (zh-CN)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleTestSingleLang('zh')}
                          disabled={!formSpeechTextZh.trim()}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 disabled:opacity-40"
                        >
                          <Volume2 className="w-3 h-3" /> Tes Suara ZH
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={formSpeechTextZh}
                        onChange={(e) => setFormSpeechTextZh(e.target.value)}
                        placeholder="示例：现在是第一节课开始的时间。"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-sans"
                      />
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500">
                    Suara akan diucapkan otomatis berurutan (Indonesia &rarr; Inggris &rarr; Arab &rarr; Mandarin) setelah bunyi nada bel berdentang.
                  </p>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-enabled-toggle"
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                />
                <label htmlFor="modal-enabled-toggle" className="text-xs font-semibold text-slate-300">
                  Aktifkan jadwal ini
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setItemModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-save-schedule-item"
                onClick={handleSaveItem}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                {editingItem ? 'Simpan Perubahan' : 'Tambahkan Jadwal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Modal (Duplikasi Hari) */}
      {copyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Copy className="w-5 h-5 text-purple-400" />
                Duplikasi Jadwal Hari {DAYS_LIST.find((d) => d.id === selectedDay)?.label}
              </h3>
              <button onClick={() => setCopyModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Salin seluruh {currentDayItems.length} jadwal bel hari <strong>{DAYS_LIST.find((d) => d.id === selectedDay)?.label}</strong> ke hari-hari berikut:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {DAYS_LIST.filter((d) => d.id !== selectedDay).map((day) => {
                const isChecked = targetDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    onClick={() => {
                      if (isChecked) {
                        setTargetDays(targetDays.filter((d) => d !== day.id));
                      } else {
                        setTargetDays([...targetDays, day.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                      isChecked
                        ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{day.label}</span>
                    {isChecked && <Check className="w-4 h-4 text-purple-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setCopyModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
              >
                Batal
              </button>
              <button
                id="btn-confirm-copy-days"
                onClick={handleExecuteCopy}
                disabled={targetDays.length === 0}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-purple-600/20"
              >
                Salin ke {targetDays.length} Hari Terpilih
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                Pilih Template Jadwal Sekolah Standar
              </h3>
              <button onClick={() => setTemplateModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => handleApplyTemplate('smp-8jam')}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all space-y-1"
              >
                <div className="text-sm font-bold text-white">1. Template Standar SMP/MA AL-IMAMAH (8 Jam + Dhuha & Dzuhur Berjamaah)</div>
                <p className="text-xs text-slate-400">
                  Senin Upacara & Tadarus, Selasa-Kamis Sholat Dhuha & Asmaul Husna, Sholat Dzuhur & Ashar Berjamaah, Jumat Berkah & Sholat Jumat, Sabtu Muhadhorah 3 Bahasa & Tahfidz.
                </p>
              </div>

              <div
                onClick={() => handleApplyTemplate('sd-6jam')}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all space-y-1"
              >
                <div className="text-sm font-bold text-white">2. Template SD / MI Reguler (6 Jam Pelajaran)</div>
                <p className="text-xs text-slate-400">
                  Masuk 07:00, 35 menit per jam pelajaran, 1 kali istirahat, pulang pukul 11:15.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setTemplateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
