import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Plus,
  Power,
  Sparkles,
  Trash2,
  Volume2,
} from 'lucide-react';
import React, { useState } from 'react';
import { BUILTIN_SOUNDS } from '../data/defaultData';
import {
  CustomSound,
  ScheduleCategory,
  ScheduleItem,
  SchoolSettings,
  SpecialSchedule,
} from '../types';

interface SpecialScheduleViewProps {
  specialSchedules: SpecialSchedule[];
  onUpdateSpecialSchedules: (schedules: SpecialSchedule[]) => void;
  settings: SchoolSettings;
  onUpdateSettings: (settings: SchoolSettings) => void;
  customSounds: CustomSound[];
}

export const SpecialScheduleView: React.FC<SpecialScheduleViewProps> = ({
  specialSchedules,
  onUpdateSpecialSchedules,
  settings,
  onUpdateSettings,
  customSounds,
}) => {
  const [selectedSpecialId, setSelectedSpecialId] = useState<string>(
    specialSchedules[0]?.id || ''
  );
  const [specialModalOpen, setSpecialModalOpen] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState<SpecialSchedule | null>(null);

  // Special Schedule Form
  const [specialName, setSpecialName] = useState('');
  const [specialDesc, setSpecialDesc] = useState('');
  const [specialDateStart, setSpecialDateStart] = useState('');
  const [specialDateEnd, setSpecialDateEnd] = useState('');

  // Item Sub-Modal Form
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [itemTime, setItemTime] = useState('07:30');
  const [itemLabel, setItemLabel] = useState('');
  const [itemCategory, setItemCategory] = useState<ScheduleCategory>('pelajaran');
  const [itemSoundId, setItemSoundId] = useState('westminster-4');
  const [itemDuration, setItemDuration] = useState(5);
  const [itemSpeechText, setItemSpeechText] = useState('');

  const currentSpecial = specialSchedules.find((s) => s.id === selectedSpecialId);

  const handleOpenAddSpecial = () => {
    setEditingSpecial(null);
    setSpecialName('');
    setSpecialDesc('');
    setSpecialDateStart('');
    setSpecialDateEnd('');
    setSpecialModalOpen(true);
  };

  const handleOpenEditSpecial = (spec: SpecialSchedule) => {
    setEditingSpecial(spec);
    setSpecialName(spec.name);
    setSpecialDesc(spec.description);
    setSpecialDateStart(spec.dateStart || '');
    setSpecialDateEnd(spec.dateEnd || '');
    setSpecialModalOpen(true);
  };

  const handleSaveSpecial = () => {
    if (!specialName.trim()) return;

    if (editingSpecial) {
      const updated = specialSchedules.map((s) =>
        s.id === editingSpecial.id
          ? {
              ...s,
              name: specialName.trim(),
              description: specialDesc.trim(),
              dateStart: specialDateStart || undefined,
              dateEnd: specialDateEnd || undefined,
            }
          : s
      );
      onUpdateSpecialSchedules(updated);
    } else {
      const newSpecial: SpecialSchedule = {
        id: `spec-${Date.now()}`,
        name: specialName.trim(),
        description: specialDesc.trim(),
        active: false,
        dateStart: specialDateStart || undefined,
        dateEnd: specialDateEnd || undefined,
        items: [],
      };
      onUpdateSpecialSchedules([...specialSchedules, newSpecial]);
      setSelectedSpecialId(newSpecial.id);
    }
    setSpecialModalOpen(false);
  };

  const handleDeleteSpecial = (id: string) => {
    const updated = specialSchedules.filter((s) => s.id !== id);
    onUpdateSpecialSchedules(updated);
    if (settings.activeSpecialScheduleId === id) {
      onUpdateSettings({ ...settings, activeSpecialScheduleId: null });
    }
    if (selectedSpecialId === id) {
      setSelectedSpecialId(updated[0]?.id || '');
    }
  };

  const handleToggleActivate = (id: string) => {
    if (settings.activeSpecialScheduleId === id) {
      // Deactivate
      onUpdateSettings({ ...settings, activeSpecialScheduleId: null });
    } else {
      // Activate
      onUpdateSettings({ ...settings, activeSpecialScheduleId: id });
    }
  };

  // Sub-items management
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemTime('07:30');
    setItemLabel('');
    setItemCategory('pelajaran');
    setItemSoundId(settings.defaultSoundId || 'westminster-4');
    setItemDuration(5);
    setItemSpeechText('');
    setItemModalOpen(true);
  };

  const handleOpenEditItem = (item: ScheduleItem) => {
    setEditingItem(item);
    setItemTime(item.time);
    setItemLabel(item.label);
    setItemCategory(item.category);
    setItemSoundId(item.soundId);
    setItemDuration(item.duration || 5);
    setItemSpeechText(item.speechText || '');
    setItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!currentSpecial || !itemLabel.trim()) return;

    let updatedItems = [...currentSpecial.items];
    if (editingItem) {
      updatedItems = updatedItems.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              time: itemTime,
              label: itemLabel.trim(),
              category: itemCategory,
              soundId: itemSoundId,
              duration: itemDuration,
              speechText: itemSpeechText.trim() || undefined,
            }
          : it
      );
    } else {
      const newItem: ScheduleItem = {
        id: `spec-it-${Date.now()}`,
        day: 'monday',
        time: itemTime,
        label: itemLabel.trim(),
        category: itemCategory,
        soundId: itemSoundId,
        duration: itemDuration,
        enabled: true,
        speechText: itemSpeechText.trim() || undefined,
      };
      updatedItems.push(newItem);
    }

    updatedItems.sort((a, b) => a.time.localeCompare(b.time));

    const updatedSpecList = specialSchedules.map((s) =>
      s.id === currentSpecial.id ? { ...s, items: updatedItems } : s
    );

    onUpdateSpecialSchedules(updatedSpecList);
    setItemModalOpen(false);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!currentSpecial) return;
    const updatedItems = currentSpecial.items.filter((it) => it.id !== itemId);
    const updatedSpecList = specialSchedules.map((s) =>
      s.id === currentSpecial.id ? { ...s, items: updatedItems } : s
    );
    onUpdateSpecialSchedules(updatedSpecList);
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Jadwal Khusus Sekolah (Ujian, Ramadhan, MPLS)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gunakan jadwal khusus untuk menggantikan jadwal normal pada masa Ujian PAS/PTS, Ramadhan, atau acara tertentu.
          </p>
        </div>

        <button
          id="btn-add-special-schedule"
          onClick={handleOpenAddSpecial}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Jadwal Khusus Baru</span>
        </button>
      </div>

      {/* Special Schedule Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {specialSchedules.map((spec) => {
          const isSelected = selectedSpecialId === spec.id;
          const isCurrentlyActive = settings.activeSpecialScheduleId === spec.id;

          return (
            <div
              key={spec.id}
              onClick={() => setSelectedSpecialId(spec.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-white leading-snug">{spec.name}</h3>
                  {isCurrentlyActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{spec.description || 'Tidak ada deskripsi'}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                <span className="text-slate-400 font-semibold">{spec.items.length} Jadwal Bel</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActivate(spec.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      isCurrentlyActive
                        ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30'
                        : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{isCurrentlyActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditSpecial(spec);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Edit Nama/Tanggal"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSpecial(spec.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Special Schedule Items Detail */}
      {currentSpecial && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{currentSpecial.name}</h3>
                {settings.activeSpecialScheduleId === currentSpecial.id ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Sedang Diterapkan Hari Ini
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                    Standby (Klik Aktifkan untuk Menerapkan)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentSpecial.description}</p>
            </div>

            <button
              id="btn-add-special-item"
              onClick={handleOpenAddItem}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jam Bel Khusus</span>
            </button>
          </div>

          {currentSpecial.items.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Belum ada butir jadwal pada paket jadwal khusus ini. Klik &quot;Tambah Jam Bel Khusus&quot; untuk menambahkan waktu bel.
            </div>
          ) : (
            <div className="space-y-2.5">
              {currentSpecial.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 text-white gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono-digital text-xl font-bold text-amber-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
                      {item.time}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{item.label}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>{getSoundName(item.soundId)}</span>
                        {item.speechText && <span className="italic text-slate-500">&ldquo;{item.speechText}&rdquo;</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Special Schedule Metadata Modal */}
      {specialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                {editingSpecial ? 'Edit Paket Jadwal Khusus' : 'Buat Paket Jadwal Khusus'}
              </h3>
              <button onClick={() => setSpecialModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Jadwal Khusus:</label>
                <input
                  type="text"
                  value={specialName}
                  onChange={(e) => setSpecialName(e.target.value)}
                  placeholder="Contoh: Asesmen Sumatif Akhir Semester (ASAS)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Keterangan / Catatan:</label>
                <textarea
                  value={specialDesc}
                  onChange={(e) => setSpecialDesc(e.target.value)}
                  rows={2}
                  placeholder="Keterangan pelaksanaan jadwal khusus"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Mulai (Opsional):</label>
                  <input
                    type="date"
                    value={specialDateStart}
                    onChange={(e) => setSpecialDateStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Selesai (Opsional):</label>
                  <input
                    type="date"
                    value={specialDateEnd}
                    onChange={(e) => setSpecialDateEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSpecialModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSpecial}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Special Item Sub-Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                {editingItem ? 'Edit Jam Bel Khusus' : 'Tambah Jam Bel Khusus'}
              </h3>
              <button onClick={() => setItemModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Waktu Bel:</label>
                  <input
                    type="time"
                    value={itemTime}
                    onChange={(e) => setItemTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori:</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as ScheduleCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="masuk">Masuk</option>
                    <option value="pelajaran">Ujian / Sesi</option>
                    <option value="istirahat">Istirahat</option>
                    <option value="pulang">Pulang</option>
                    <option value="khusus">Khusus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Kegiatan Bel:</label>
                <input
                  type="text"
                  value={itemLabel}
                  onChange={(e) => setItemLabel(e.target.value)}
                  placeholder="Contoh: Ujian Sesi 1 Dimulai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pilihan Suara:</label>
                <select
                  value={itemSoundId}
                  onChange={(e) => setItemSoundId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                >
                  <optgroup label="✨ Suara Bel Versi Baru (V2.0 Modern & Resonan)">
                    {BUILTIN_SOUNDS.filter((s) => s.isNewVersion).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Suara Bel Klasik (V1.0)">
                    {BUILTIN_SOUNDS.filter((s) => !s.isNewVersion).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                  {customSounds.length > 0 && (
                    <optgroup label="Suara Kustom (Upload)">
                      {customSounds.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teks Suara Narasi (TTS Opsional):</label>
                <input
                  type="text"
                  value={itemSpeechText}
                  onChange={(e) => setItemSpeechText(e.target.value)}
                  placeholder="Contoh: Waktu pengerjaan ujian dimulai."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button onClick={() => setItemModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Batal</button>
              <button onClick={handleSaveItem} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
