import {
  Check,
  Cloud,
  FileAudio,
  Languages,
  Mic,
  Music,
  Play,
  Plus,
  Radio,
  Sliders,
  Sparkles,
  Square,
  Trash2,
  UploadCloud,
  Volume2,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { BUILTIN_SOUNDS } from '../data/defaultData';
import { audioEngine } from '../services/audioEngine';
import { deleteAudioFile, saveAudioFile } from '../services/db';
import {
  getPhoneticArabicText,
  MULTI_LANGUAGE_PRESETS,
  ORDERED_LANGUAGES,
  SUPPORTED_LANGUAGES,
} from '../services/multiLanguageTts';
import { CustomSound, LanguageCode, SchoolSettings } from '../types';

interface SoundManagerViewProps {
  customSounds: CustomSound[];
  onUpdateCustomSounds: (sounds: CustomSound[]) => void;
  settings: SchoolSettings;
  onUpdateSettings: (settings: SchoolSettings) => void;
  onOpenGoogleDrive?: () => void;
}

export const SoundManagerView: React.FC<SoundManagerViewProps> = ({
  customSounds,
  onUpdateCustomSounds,
  settings,
  onUpdateSettings,
  onOpenGoogleDrive,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [soundFilter, setSoundFilter] = useState<'all' | 'v2' | 'v1' | 'chime' | 'melodic'>('all');
  const [ttsLang, setTtsLang] = useState<LanguageCode>('ar');
  const [ttsTexts, setTtsTexts] = useState<Record<LanguageCode, string>>({
    id: 'Selamat pagi santri dan siswa-siswi SMP dan MA Al-Imamah. Selamat datang di madrasah, mari awali hari dengan niat ikhlas menuntut ilmu.',
    en: 'Good morning students of SMP and MA Al-Imamah. Welcome to school, let us begin our day with sincere dedication to seek knowledge.',
    ar: 'صباح الخير لطلاب وطالبات مدرسة الإمامة. أهلاً بكم في مدرستكم، لنبدأ يومنا بنية خالصة لطلب العلم.',
    zh: '同学们早上好。欢迎来到学校，让我们满怀真诚开始求知的一天。',
  });
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePlaySound = async (soundId: string, duration?: number) => {
    setPlayingId(soundId);
    try {
      await audioEngine.playSound(
        soundId,
        settings.volume,
        duration || settings.soundDuration || 6,
        undefined,
        settings.ttsVoiceRate
      );
    } finally {
      setTimeout(() => {
        setPlayingId(null);
      }, (duration || settings.soundDuration || 5) * 1000);
    }
  };

  const handleStopAll = () => {
    audioEngine.stopAll();
    setPlayingId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.includes('audio')) {
      alert('Mohon pilih file audio yang valid (MP3, WAV, OGG, atau AAC).');
      return;
    }

    setUploading(true);
    try {
      const customId = `custom-${Date.now()}`;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      await saveAudioFile(customId, baseName, file);

      const newCustomSound: CustomSound = {
        id: customId,
        name: baseName,
        type: 'custom',
        fileName: file.name,
        fileType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      onUpdateCustomSounds([...customSounds, newCustomSound]);
    } catch (err) {
      console.error('Failed to upload custom audio:', err);
      alert('Gagal menyimpan file audio ke memori browser.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteCustomSound = async (id: string) => {
    if (confirm('Hapus file audio kustom ini?')) {
      await deleteAudioFile(id);
      onUpdateCustomSounds(customSounds.filter((s) => s.id !== id));
    }
  };

  const handleTestSingleLang = (langCode: LanguageCode) => {
    const text = ttsTexts[langCode];
    if (!text || !text.trim()) return;
    setIsSpeakingTts(true);
    audioEngine.speakSingleLanguage(text.trim(), langCode, settings.ttsVoiceRate || 1.0).finally(() => {
      setIsSpeakingTts(false);
    });
  };

  const handleTestAllLangs = () => {
    setIsSpeakingTts(true);
    audioEngine.queueMultiLanguageSpeech(
      ttsTexts,
      settings.ttsVoiceRate || 1.0,
      0,
      settings.activeLanguages || ['id', 'en', 'ar', 'zh'],
      settings.languageDelayMs ?? 500
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Music className="w-6 h-6 text-blue-400" />
            Manajemen Suara Bel & Audio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Daftar nada lonceng Web Audio API bawaan dan upload file MP3/WAV kustom untuk bel sekolah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {playingId && (
            <button
              onClick={handleStopAll}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer"
            >
              <Square className="w-4 h-4" />
              <span>Hentikan Suara</span>
            </button>
          )}

          {onOpenGoogleDrive && (
            <button
              id="btn-import-google-drive"
              onClick={onOpenGoogleDrive}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
            >
              <Cloud className="w-4 h-4" />
              <span>Impor dari Google Drive</span>
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
          <button
            id="btn-upload-audio-file"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Mengunggah...' : 'Upload File MP3 / WAV'}</span>
          </button>
        </div>
      </div>

      {/* Audio Volume & Duration Control Bench */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-blue-400" /> Volume Master Bel:
            </label>
            <span className="font-mono text-sm font-extrabold text-blue-400">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={settings.volume}
            onChange={(e) => onUpdateSettings({ ...settings, volume: parseFloat(e.target.value) })}
            className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>10% (Pelan)</span>
            <span>50%</span>
            <span>100% (Maksimal Speaker)</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Volume2 className="w-4 h-4 text-amber-400" /> Durasi Standar Bel:
            </label>
            <span className="font-mono text-sm font-extrabold text-amber-400">
              {settings.soundDuration} Detik
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={settings.soundDuration}
            onChange={(e) => onUpdateSettings({ ...settings, soundDuration: parseInt(e.target.value) })}
            className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>2 Detik (Singkat)</span>
            <span>10 Detik</span>
            <span>20 Detik (Lama)</span>
          </div>
        </div>
      </div>

      {/* Built-in Sounds Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-400" />
              Koleksi Suara Nada Bawaan (Web Audio Synthesizer)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              100% Berjalan Offline tanpa perlu unduh file MP3, jernih, harmonis, dan hemat memori perangkat.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              {BUILTIN_SOUNDS.length} Pilihan Nada
            </span>
          </div>
        </div>

        {/* Filter Category & Version Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <button
            onClick={() => setSoundFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              soundFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Semua ({BUILTIN_SOUNDS.length})
          </button>
          <button
            onClick={() => setSoundFilter('v2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              soundFilter === 'v2'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm shadow-cyan-500/20'
                : 'bg-slate-950 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Versi Baru V2 ({BUILTIN_SOUNDS.filter((s) => s.isNewVersion).length})</span>
          </button>
          <button
            onClick={() => setSoundFilter('v1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              soundFilter === 'v1'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Klasik V1 ({BUILTIN_SOUNDS.filter((s) => !s.isNewVersion).length})
          </button>
          <button
            onClick={() => setSoundFilter('chime')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              soundFilter === 'chime'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Lonceng & Chime
          </button>
          <button
            onClick={() => setSoundFilter('melodic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              soundFilter === 'melodic'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Melodis & Etnik
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {BUILTIN_SOUNDS.filter((s) => {
            if (soundFilter === 'v2') return s.isNewVersion;
            if (soundFilter === 'v1') return !s.isNewVersion;
            if (soundFilter === 'chime') return s.category === 'chime' || s.category === 'westminster';
            if (soundFilter === 'melodic') return s.category === 'melodic';
            return true;
          }).map((s) => {
            const isThisPlaying = playingId === s.id;
            const isDefault = settings.defaultSoundId === s.id;

            return (
              <div
                key={s.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isThisPlaying
                    ? 'bg-blue-600/20 border-blue-500/70 shadow-lg shadow-blue-500/15'
                    : s.isNewVersion
                    ? 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{s.name}</span>
                    {s.isNewVersion && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        V2 Baru
                      </span>
                    )}
                    {isDefault && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Default Utama
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Durasi: ~{s.defaultDuration}s</span>
                    <span>·</span>
                    <span className="capitalize">{s.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isDefault && (
                      <button
                        onClick={() => onUpdateSettings({ ...settings, defaultSoundId: s.id })}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
                        title="Jadikan nada default utama sekolah"
                      >
                        Pilih Default
                      </button>
                    )}

                    <button
                      id={`play-sound-${s.id}`}
                      onClick={() => handlePlaySound(s.id, s.defaultDuration)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                        isThisPlaying
                          ? 'bg-amber-500 text-slate-950 animate-pulse shadow-md shadow-amber-500/20'
                          : s.isNewVersion
                          ? 'bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40'
                          : 'bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white'
                      }`}
                      title="Putar Suara"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isThisPlaying ? 'Berbunyi...' : 'Uji Suara'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Uploaded Sounds Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-purple-400" />
              Suara Kustom Tersimpan (IndexedDB Offline)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              File MP3/WAV yang diunggah tersimpan secara permanen di database browser lokal Anda.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Total: <strong className="text-white">{customSounds.length}</strong> file
          </span>
        </div>

        {customSounds.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-2xl p-6">
            <UploadCloud className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-slate-300">Belum ada file suara kustom yang diunggah.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Anda dapat mengunggah file rekaman bel sekolah sendiri (format .mp3 atau .wav).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customSounds.map((c) => {
              const isThisPlaying = playingId === c.id;
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 text-white"
                >
                  <div>
                    <div className="text-sm font-bold truncate max-w-[200px]">{c.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {c.fileName} • {(c.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlaySound(c.id, settings.soundDuration)}
                      className={`p-2.5 rounded-xl transition-all ${
                        isThisPlaying
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomSound(c.id)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Voice Synthesis (TTS) Tester */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-emerald-400" />
              Fitur Pengumuman Suara Narasi Otomatis (4 Bahasa)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sistem membacakan narasi suara 4 bahasa otomatis (Indonesia, Inggris, Arab, Mandarin) mendampingi nada lonceng bel.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestAllLangs}
              disabled={isSpeakingTts}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Putar Rangkaian 4 Bahasa</span>
            </button>
            {isSpeakingTts && (
              <button
                type="button"
                onClick={() => {
                  audioEngine.stopAll();
                  setIsSpeakingTts(false);
                }}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {ORDERED_LANGUAGES.map((code) => {
            const info = SUPPORTED_LANGUAGES[code];
            const isActive = ttsLang === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setTtsLang(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{info.flag}</span>
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input & Test Button for Active Language */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div className="md:col-span-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>{SUPPORTED_LANGUAGES[ttsLang].flag}</span>
                <span>Teks Kalimat Suara ({SUPPORTED_LANGUAGES[ttsLang].name}):</span>
              </label>
              {ttsLang === 'ar' && (
                <span className="text-[10px] text-emerald-400 font-medium">
                  ✓ Suara Arab dijamin berbunyi dengan mesin native & fonetik cerdas
                </span>
              )}
            </div>

            <textarea
              rows={2}
              dir={ttsLang === 'ar' ? 'rtl' : 'ltr'}
              value={ttsTexts[ttsLang]}
              onChange={(e) => setTtsTexts({ ...ttsTexts, [ttsLang]: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-sans ${
                ttsLang === 'ar' ? 'text-right' : 'text-left'
              }`}
              placeholder="Ketik kalimat pengumuman suara..."
            />

            {ttsLang === 'ar' && (
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300">
                <span className="font-semibold">Lafal Fonetik (Tajwid): </span>
                <span className="font-mono text-emerald-200">
                  &ldquo;{getPhoneticArabicText(ttsTexts.ar)}&rdquo;
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-5">
            <button
              type="button"
              onClick={() => handleTestSingleLang(ttsLang)}
              disabled={isSpeakingTts || !ttsTexts[ttsLang]?.trim()}
              className="w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Dengar {SUPPORTED_LANGUAGES[ttsLang].shortLabel}</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Kecepatan: {settings.ttsVoiceRate || 1.0}x
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
