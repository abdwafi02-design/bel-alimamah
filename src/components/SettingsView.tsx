import {
  Check,
  Cloud,
  Copy,
  Download,
  Eye,
  EyeOff,
  Github,
  Globe,
  HardDrive,
  KeyRound,
  Languages,
  Lock,
  Play,
  RotateCcw,
  Save,
  School,
  Shield,
  ShieldCheck,
  Sparkles,
  Square,
  Upload,
  Volume2,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import {
  getPhoneticArabicText,
  getVoiceEngineStatus,
  MULTI_LANGUAGE_PRESETS,
  ORDERED_LANGUAGES,
  SUPPORTED_LANGUAGES,
} from '../services/multiLanguageTts';
import { exportAllData, importBackupData, resetToFactoryDefaults } from '../services/storage';
import { CurrentlySpeakingLanguage, LanguageCode, SchoolSettings } from '../types';

interface SettingsViewProps {
  settings: SchoolSettings;
  onUpdateSettings: (settings: SchoolSettings) => void;
  onFactoryReset: () => void;
  onOpenGoogleDrive?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onFactoryReset,
  onOpenGoogleDrive,
}) => {
  const [form, setForm] = useState<SchoolSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testPresetId, setTestPresetId] = useState<string>('masuk-sekolah');
  const [isTestingSpeech, setIsTestingSpeech] = useState(false);
  const [speakingLanguageInfo, setSpeakingLanguageInfo] = useState<CurrentlySpeakingLanguage | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [showGithubGuide, setShowGithubGuide] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  useEffect(() => {
    const originalCallback = audioEngine.onSpeakingLanguageChange;
    audioEngine.onSpeakingLanguageChange = (info) => {
      setSpeakingLanguageInfo(info);
      if (!info) {
        setIsTestingSpeech(false);
      }
    };
    return () => {
      audioEngine.onSpeakingLanguageChange = originalCallback;
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleActiveLanguage = (langCode: LanguageCode) => {
    const currentActive = form.activeLanguages || ['id', 'en', 'ar', 'zh'];
    let updated: LanguageCode[];
    if (currentActive.includes(langCode)) {
      // Must keep at least one language
      if (currentActive.length <= 1) return;
      updated = currentActive.filter((l) => l !== langCode);
    } else {
      updated = [...currentActive, langCode];
      // Keep in standard ordered sequence
      updated.sort((a, b) => ORDERED_LANGUAGES.indexOf(a) - ORDERED_LANGUAGES.indexOf(b));
    }
    setForm({ ...form, activeLanguages: updated });
  };

  const handleTestMultiLanguageVoice = () => {
    const preset = MULTI_LANGUAGE_PRESETS.find((p) => p.id === testPresetId) || MULTI_LANGUAGE_PRESETS[0];
    setIsTestingSpeech(true);
    audioEngine.queueMultiLanguageSpeech(
      preset.phrases,
      form.ttsVoiceRate || 1.0,
      0,
      form.activeLanguages || ['id', 'en', 'ar', 'zh'],
      form.languageDelayMs ?? 500
    );
  };

  const handleTestSingleLanguage = (langCode: LanguageCode) => {
    const preset = MULTI_LANGUAGE_PRESETS.find((p) => p.id === testPresetId) || MULTI_LANGUAGE_PRESETS[0];
    const text = preset.phrases[langCode];
    if (!text) return;
    setIsTestingSpeech(true);
    audioEngine.speakSingleLanguage(text, langCode, form.ttsVoiceRate || 1.0).finally(() => {
      setIsTestingSpeech(false);
    });
  };

  const handleStopTestSpeech = () => {
    audioEngine.stopAll();
    setIsTestingSpeech(false);
    setSpeakingLanguageInfo(null);
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-bel-sekolah-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const res = importBackupData(content);
      if (res.success) {
        alert('Data backup berhasil dipulihkan!');
        window.location.reload();
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh jadwal dan pengaturan ke default pabrik?')) {
      resetToFactoryDefaults();
      onFactoryReset();
      window.location.reload();
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <School className="w-6 h-6 text-blue-400" />
            Pengaturan Sistem & Profil Sekolah
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi identitas satuan pendidikan, keamanan PIN, zona waktu, dan cadangan data.
          </p>
        </div>

        <button
          type="submit"
          id="btn-save-settings"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saveSuccess ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
        </button>
      </div>

      {/* Grid: School Identity & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* School Identity */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <School className="w-5 h-5 text-blue-400" />
            Identitas Sekolah
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Sekolah / Madrasah:
            </label>
            <input
              type="text"
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              NPSN (Nomor Pokok Sekolah Nasional):
            </label>
            <input
              type="text"
              value={form.schoolNPSN || ''}
              onChange={(e) => setForm({ ...form, schoolNPSN: e.target.value })}
              placeholder="Contoh: 10293847"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Alamat Sekolah:
            </label>
            <textarea
              rows={2}
              value={form.schoolAddress || ''}
              onChange={(e) => setForm({ ...form, schoolAddress: e.target.value })}
              placeholder="Jl. Pendidikan No. 1..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Security & PIN */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-5 h-5 text-amber-400" />
            Keamanan & Proteksi PIN Admin
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-sm font-semibold text-white">Proteksi Menu dengan PIN</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kunci menu pengaturan & jadwal agar tidak diubah sembarang orang saat mode kiosk.
              </p>
            </div>
            <input
              type="checkbox"
              id="settings-pin-toggle"
              checked={form.isPinRequired}
              onChange={(e) => setForm({ ...form, isPinRequired: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>

          {form.isPinRequired && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" /> PIN Operator / Admin (4-6 Digit):
                </span>
                <span className="text-[10px] text-amber-400/80 font-normal">
                  {form.adminPin === '1234' ? 'PIN default: 1234' : 'PIN Khusus Aktif'}
                </span>
              </label>

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={form.adminPin}
                  onChange={(e) => setForm({ ...form, adminPin: e.target.value })}
                  placeholder="Masukkan 4-6 digit"
                  className="w-full px-3.5 py-2.5 pr-11 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest text-lg focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                  title={showPin ? 'Sembunyikan PIN' : 'Lihat PIN'}
                  aria-label={showPin ? 'Sembunyikan PIN' : 'Lihat PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Sandi Dirahasiakan oleh Pemilik Akun</span>
                </div>
                <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                  Sandi disimpan secara lokal di browser komputer Anda (localStorage). Jika aplikasi dipublikasikan ke GitHub, sandi rahasia Anda <strong>TIDAK AKAN PERNAH</strong> ikut terunggah ke repositori GitHub.
                </p>
              </div>
            </div>
          )}

          {/* WakeLock Feature */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-400" /> Cegah Layar Mati (Screen Wake Lock)
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mencegah Chromebook Zyrex / PC masuk mode tidur (sleep) saat aplikasi aktif.
              </p>
            </div>
            <input
              type="checkbox"
              id="settings-wakelock-toggle"
              checked={form.wakeLockEnabled}
              onChange={(e) => setForm({ ...form, wakeLockEnabled: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Timezone & Audio Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timezone */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="w-5 h-5 text-blue-400" />
            Zona Waktu & Jam Digital
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Zona Waktu Operasional:
            </label>
            <select
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="Asia/Jakarta">WIB - Waktu Indonesia Barat (UTC+7)</option>
              <option value="Asia/Makassar">WITA - Waktu Indonesia Tengah (UTC+8)</option>
              <option value="Asia/Jayapura">WIT - Waktu Indonesia Timur (UTC+9)</option>
              <option value="auto">Otomatis Sesuai Waktu Perangkat</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-sm font-semibold text-white">Tampilkan Detik pada Jam</div>
              <p className="text-xs text-slate-400 mt-0.5">Format jam realtime presisi (HH:MM:SS)</p>
            </div>
            <input
              type="checkbox"
              checked={form.showSeconds}
              onChange={(e) => setForm({ ...form, showSeconds: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>
        </div>

        {/* Audio TTS & 4-Language Voice Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="w-5 h-5 text-emerald-400" />
            Pengumuman Narasi Suara 4 Bahasa (Multilingual TTS)
          </h3>

          {/* Master TTS Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-sm font-semibold text-white">Aktifkan Pengumuman Suara (TTS)</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Membacakan pengumuman kegiatan secara otomatis setelah nada lonceng berdentang.
              </p>
            </div>
            <input
              type="checkbox"
              id="settings-tts-toggle"
              checked={form.ttsEnabled}
              onChange={(e) => setForm({ ...form, ttsEnabled: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>

          {/* Multi-Language Mode Toggle */}
          {form.ttsEnabled && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Languages className="w-4 h-4" /> Mode Otomatis 4 Bahasa (ID / EN / AR / ZH)
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Membacakan pengumuman berurutan: Bahasa Indonesia, Inggris, Arab, dan Mandarin.
                </p>
              </div>
              <input
                type="checkbox"
                id="settings-multilang-toggle"
                checked={form.multiLanguageEnabled}
                onChange={(e) => setForm({ ...form, multiLanguageEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-600 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
          )}

          {form.ttsEnabled && form.multiLanguageEnabled && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-300">
                Pilihan Bahasa Aktif yang Diucapkan Berurutan:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ORDERED_LANGUAGES.map((code) => {
                  const info = SUPPORTED_LANGUAGES[code];
                  const isChecked = (form.activeLanguages || ['id', 'en', 'ar', 'zh']).includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleToggleActiveLanguage(code)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600/20 border-blue-500/40 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{info.flag}</span>
                        <div>
                          <div className="text-xs font-bold">{info.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{info.bcp47}</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${isChecked ? 'bg-blue-600 text-white' : 'bg-slate-800'}`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Jeda Antar Bahasa */}
              <div className="pt-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Jeda Hening Antar Bahasa:</span>
                  <span className="font-mono text-blue-400">{(form.languageDelayMs ?? 500) / 1000} detik ({form.languageDelayMs ?? 500} ms)</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="100"
                  value={form.languageDelayMs ?? 500}
                  onChange={(e) => setForm({ ...form, languageDelayMs: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          )}

          {form.ttsEnabled && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Kecepatan Artikulasi Suara (Pitch/Rate):</span>
                <span className="font-mono text-emerald-400">{form.ttsVoiceRate}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={form.ttsVoiceRate}
                onChange={(e) => setForm({ ...form, ttsVoiceRate: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Interactive 4-Language Voice Simulator & Test Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Simulasi & Uji Coba Pengumuman 4 Bahasa Langsung
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Uji kejernihan pelafalan suara 4 bahasa (Indonesia, Inggris, Arab, Mandarin) pada perangkat ini.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isTestingSpeech ? (
              <button
                type="button"
                onClick={handleTestMultiLanguageVoice}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" /> Putar Tes 4 Bahasa
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopTestSpeech}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" /> Hentikan Suara
              </button>
            )}
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-semibold text-slate-300 sm:w-44">
            Pilih Contoh Pengumuman:
          </label>
          <select
            value={testPresetId}
            onChange={(e) => setTestPresetId(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
          >
            {MULTI_LANGUAGE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} — {p.phrases.id}
              </option>
            ))}
          </select>
        </div>

        {/* Real-time Visual 4-Language Pipeline Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {(() => {
            const currentPreset = MULTI_LANGUAGE_PRESETS.find((p) => p.id === testPresetId) || MULTI_LANGUAGE_PRESETS[0];
            const voiceStatus = getVoiceEngineStatus();
            return ORDERED_LANGUAGES.map((langKey) => {
              const info = SUPPORTED_LANGUAGES[langKey];
              const isCurrentlySpeaking = speakingLanguageInfo?.lang === langKey;
              const text = currentPreset.phrases[langKey];
              const isLangActive = (form.activeLanguages || ['id', 'en', 'ar', 'zh']).includes(langKey);
              const status = voiceStatus[langKey];

              return (
                <div
                  key={langKey}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isCurrentlySpeaking
                      ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]'
                      : isLangActive
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-950/40 border-slate-900 opacity-50'
                  }`}
                >
                  {isCurrentlySpeaking && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 animate-pulse" />
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{info.flag}</span>
                        <span className="text-xs font-bold text-white">{info.label}</span>
                      </div>
                      {isCurrentlySpeaking && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white animate-pulse">
                          Sedang Bicara...
                        </span>
                      )}
                    </div>
                    <p
                      dir={langKey === 'ar' ? 'rtl' : 'ltr'}
                      className={`text-xs ${langKey === 'ar' ? 'text-right font-sans font-medium' : 'text-left'} ${
                        isCurrentlySpeaking ? 'text-blue-200 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      &ldquo;{text}&rdquo;
                    </p>

                    {langKey === 'ar' && (
                      <div className="mt-2 p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[10px] text-emerald-300">
                        <div className="font-semibold flex items-center gap-1">
                          <span>✨ Suara Arab Aktif:</span>
                          <span className="text-emerald-400">
                            {status.hasNativeVoice ? 'Native Voice (ar-SA)' : 'Mode Fonetik Cerdas'}
                          </span>
                        </div>
                        <div className="text-[9px] text-emerald-400/80 mt-0.5 line-clamp-2">
                          Lafal: &ldquo;{getPhoneticArabicText(text)}&rdquo;
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTestSingleLanguage(langKey)}
                    className="mt-3 w-full py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tes Suara {info.shortLabel}</span>
                  </button>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Google Drive Cloud Sync & Backup Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-cyan-400" />
              Google Drive Cloud Sync & Backup Otomatis
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simpan dan pulihkan snapshot konfigurasi bel sekolah, jadwal, serta impor file audio lonceng langsung dari Google Drive.
            </p>
          </div>

          {onOpenGoogleDrive && (
            <button
              type="button"
              onClick={onOpenGoogleDrive}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Cloud className="w-4 h-4" />
              <span>Buka Google Drive Hub</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-blue-400" />
              Cadangan Cloud Terpusat
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Jadwal sekolah tidak akan hilang meskipun cache browser dihapus atau berpindah ke perangkat Chromebook/komputer lain.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              Impor File Suara Bel dari Drive
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ambil rekaman bel atau file audio MP3/WAV milik sekolah langsung dari Google Drive Anda tanpa perlu transfer manual.
            </p>
          </div>
        </div>
      </div>

      {/* GitHub Publication & Password Security Hub */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Github className="w-5 h-5 text-purple-400" />
              Publikasi ke GitHub & Keamanan Sandi Pemilik
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aplikasi ini siap dipublikasikan ke GitHub. Sandi PIN dan jadwal sekolah Anda dijamin tetap privat dan dirahasiakan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowGithubGuide(!showGithubGuide)}
            className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Github className="w-4 h-4" />
            <span>{showGithubGuide ? 'Sembunyikan Panduan Git' : 'Buka Panduan Git & Terminal'}</span>
          </button>
        </div>

        {/* 3 Keamanan Garansi Sandi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-900/30 space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              Sandi 100% Dirahasiakan
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              PIN operator Anda disimpan di <em>localStorage</em> browser perangkat ini. Tidak pernah terunggah ke GitHub meskipun repositori dibuka untuk umum.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-900/30 space-y-1.5">
            <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-400 shrink-0" />
              Proteksi .gitignore Aktif
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Semua berkas sensitif, berkas lingkungan (.env*), dan file cadangan jadwal (*.backup.json) otomatis dicegah masuk ke Git commit.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-1.5">
            <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-400 shrink-0" />
              Bebas Private / Public
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Anda bebas memilih repositori GitHub bertipe <strong>Private</strong> (khusus admin sekolah) atau <strong>Public</strong> tanpa risiko kebocoran sandi.
            </p>
          </div>
        </div>

        {/* Expandable Step-by-Step Terminal Commands */}
        {showGithubGuide && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Langkah-langkah Publish ke Repositori GitHub:</span>
              <span className="text-[10px] text-purple-400 font-mono font-normal">Terminal / Bash Command</span>
            </div>

            {/* Step 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-slate-200">1. Inisialisasi & Tambahkan Berkas:</span>
                <button
                  type="button"
                  onClick={() => handleCopyText('git init && git add . && git commit -m "Rilis Bel Sekolah Otomatis SMP-MA AL-IMAMAH"', 'step1')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedSection === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'step1' ? 'Tersalin!' : 'Salin Perintah'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-purple-300 font-mono overflow-x-auto">
                git init{'\n'}git add .{'\n'}git commit -m &quot;Rilis Bel Sekolah Otomatis SMP-MA AL-IMAMAH&quot;
              </pre>
            </div>

            {/* Step 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-slate-200">2. Hubungkan ke Remote GitHub Anda:</span>
                <button
                  type="button"
                  onClick={() => handleCopyText('git branch -M main && git remote add origin https://github.com/USERNAME/bel-sekolah-al-imamah.git', 'step2')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedSection === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'step2' ? 'Tersalin!' : 'Salin Perintah'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-purple-300 font-mono overflow-x-auto">
                git branch -M main{'\n'}git remote add origin https://github.com/USERNAME/bel-sekolah-al-imamah.git
              </pre>
              <p className="text-[10px] text-slate-500 italic">
                * Ganti USERNAME dengan nama akun GitHub Anda.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-slate-200">3. Push ke GitHub:</span>
                <button
                  type="button"
                  onClick={() => handleCopyText('git push -u origin main', 'step3')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedSection === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'step3' ? 'Tersalin!' : 'Salin Perintah'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-purple-300 font-mono overflow-x-auto">
                git push -u origin main
              </pre>
            </div>

            {/* Deploy Tips */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                💡 Deploy Gratis ke Cloud (Vercel):
              </span>
              <p className="text-[11px] text-purple-300/80 leading-relaxed">
                Setelah push ke GitHub, masuk ke <a href="https://vercel.com" target="_blank" rel="noreferrer" className="underline font-bold text-white">vercel.com</a>, klik <strong>Import Project</strong>, pilih repo GitHub Anda, lalu klik <strong>Deploy</strong>. Aplikasi bel sekolah Anda langsung aktif dengan URL HTTPS gratis dan dapat diakses dari browser Chromebook mana saja!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Backup, Restore & Reset Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Download className="w-5 h-5 text-blue-400" />
          Backup, Pemulihan Data (Restore) & Reset Pabrik
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={handleExportBackup}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/60 text-left transition-all space-y-1 cursor-pointer"
          >
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-400" /> Backup Data (JSON)
            </div>
            <p className="text-xs text-slate-400">
              Unduh seluruh file konfigurasi jadwal & hari libur untuk disimpan atau dipindahkan ke perangkat lain.
            </p>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/60 text-left transition-all space-y-1 cursor-pointer"
          >
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-purple-400" /> Restore Data (JSON)
            </div>
            <p className="text-xs text-slate-400">
              Pulihkan jadwal dan pengaturan dari file backup .json sebelumnya.
            </p>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-4 rounded-2xl bg-slate-950 border border-rose-900/30 hover:border-rose-600/60 text-left transition-all space-y-1 cursor-pointer"
          >
            <div className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Reset ke Default Pabrik
            </div>
            <p className="text-xs text-slate-400">
              Kembalikan semua jadwal dan pengaturan ke konfigurasi awal bawaan aplikasi.
            </p>
          </button>
        </div>
      </div>
    </form>
  );
};
