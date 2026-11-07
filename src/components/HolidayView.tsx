import {
  AlertTriangle,
  Calendar,
  CalendarDays,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { DEFAULT_HOLIDAYS } from '../data/defaultData';
import { HolidayItem } from '../types';

interface HolidayViewProps {
  holidays: HolidayItem[];
  onUpdateHolidays: (holidays: HolidayItem[]) => void;
}

export const HolidayView: React.FC<HolidayViewProps> = ({
  holidays,
  onUpdateHolidays,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<'nasional' | 'sekolah' | 'khusus' | 'keagamaan'>('nasional');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setName('');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setType('nasional');
    setDescription('');
    setModalOpen(true);
  };

  const handleSaveHoliday = () => {
    if (!name.trim() || !startDate) return;

    const newHol: HolidayItem = {
      id: `hol-${Date.now()}`,
      name: name.trim(),
      startDate,
      endDate: endDate || startDate,
      type,
      description: description.trim() || undefined,
    };

    const updated = [...holidays, newHol].sort((a, b) => a.startDate.localeCompare(b.startDate));
    onUpdateHolidays(updated);
    setModalOpen(false);
  };

  const handleDeleteHoliday = (id: string) => {
    const updated = holidays.filter((h) => h.id !== id);
    onUpdateHolidays(updated);
  };

  const handleResetToDefaultHolidays = () => {
    if (confirm('Pulihkan daftar hari libur nasional standar?')) {
      onUpdateHolidays([...DEFAULT_HOLIDAYS]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-amber-400" />
            Pengaturan Hari Libur & Kalender Sekolah
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pada hari yang ditandai sebagai libur, seluruh jadwal bel otomatis akan dinonaktifkan secara otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleResetToDefaultHolidays}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
          >
            Pulihkan Standar
          </button>
          <button
            id="btn-add-holiday"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Hari Libur</span>
          </button>
        </div>
      </div>

      {/* Holidays List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Daftar Hari Libur Terdaftar ({holidays.length} Hari)
          </h3>
        </div>

        {holidays.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Belum ada hari libur yang terdaftar. Klik &quot;Tambah Hari Libur&quot; untuk menambahkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="flex items-start justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 text-white gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold">{h.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        h.type === 'nasional'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : h.type === 'keagamaan'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : h.type === 'sekolah'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {h.type}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-semibold text-amber-400">
                    {h.startDate} {h.endDate && h.endDate !== h.startDate ? `s/d ${h.endDate}` : ''}
                  </div>

                  {h.description && (
                    <p className="text-xs text-slate-400 mt-1">{h.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteHoliday(h.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-all text-xs"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Holiday Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                Tambah Hari Libur Sekolah
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Hari Libur:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Hari Kemerdekaan RI ke-81"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Mulai:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Selesai:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Libur:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                >
                  <option value="nasional">Libur Nasional / Hari Besar</option>
                  <option value="keagamaan">Hari Libur Keagamaan Islam</option>
                  <option value="sekolah">Libur Khusus Madrasah / Semester</option>
                  <option value="khusus">Kegiatan Khusus Tanpa Bel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Keterangan Tambahan:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Catatan opsional"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Batal</button>
              <button onClick={handleSaveHoliday} className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold">Simpan Hari Libur</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
