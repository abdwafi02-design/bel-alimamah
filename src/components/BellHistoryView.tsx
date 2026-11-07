import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Download,
  Filter,
  History,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { clearAllLogs, loadBellLogs } from '../services/storage';
import { BellLog, LogStatus } from '../types';

interface BellHistoryViewProps {
  logs: BellLog[];
  onLogsCleared: () => void;
}

export const BellHistoryView: React.FC<BellHistoryViewProps> = ({
  logs,
  onLogsCleared,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.eventLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.soundName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.timeString.includes(searchTerm) ||
      log.dateString.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleClearLogs = () => {
    if (confirm('Yakin ingin menghapus semua riwayat catatan bel?')) {
      clearAllLogs();
      onLogsCleared();
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const header = ['ID', 'Tanggal', 'Waktu', 'Kegiatan', 'Kategori', 'Suara', 'Status', 'Keterangan'];
    const rows = logs.map((l) => [
      l.id,
      l.dateString,
      l.timeString,
      `"${l.eventLabel.replace(/"/g, '""')}"`,
      l.category,
      `"${l.soundName.replace(/"/g, '""')}"`,
      l.status,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat-bel-sekolah-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: LogStatus) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil
          </span>
        );
      case 'manual':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Manual
          </span>
        );
      case 'holiday_skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Libur
          </span>
        );
      case 'paused_skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Dijeda
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Gagal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400">
            Dilewati
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-400" />
            Riwayat & Log Pemutaran Bel
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Catatan historis real-time setiap kali bel dibunyikan atau dilewati oleh sistem.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 disabled:opacity-40 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kegiatan, tanggal, waktu..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="success">Berhasil</option>
            <option value="manual">Manual</option>
            <option value="holiday_skipped">Libur</option>
            <option value="paused_skipped">Dijeda</option>
            <option value="failed">Gagal</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            <History className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-slate-300">Belum ada catatan riwayat bel yang tersimpan.</p>
            <p className="text-xs text-slate-500 mt-1">
              Catatan akan otomatis muncul saat bel berbunyi atau dilewati.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Kegiatan</th>
                  <th className="py-3 px-4">Suara</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="text-slate-300 hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono-digital font-bold text-amber-300">
                      {log.timeString}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">
                      {log.dateString}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {log.eventLabel}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {log.soundName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
