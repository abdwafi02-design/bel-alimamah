import { User } from 'firebase/auth';
import {
  AlertTriangle,
  ArrowDownToLine,
  Check,
  Cloud,
  Download,
  ExternalLink,
  FolderOpen,
  HardDrive,
  Loader2,
  Lock,
  LogOut,
  Music,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Volume2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import {
  getAccessToken,
  googleSignIn,
  initAuth,
  logoutGoogle,
} from '../services/googleAuth';
import {
  deleteDriveFile,
  downloadBackupFromDrive,
  DriveFileItem,
  DriveStorageInfo,
  fetchAudioBlobFromDrive,
  fetchAudioDataUrlFromDrive,
  getDriveAboutInfo,
  listAudioFilesFromDrive,
  listDriveBackups,
  uploadBackupToDrive,
} from '../services/googleDrive';
import { saveAudioFile } from '../services/db';
import {
  exportAllData,
  importBackupData,
  loadCustomSounds,
  saveCustomSounds,
} from '../services/storage';
import { CustomSound } from '../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
  onSoundAdded?: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  onSoundAdded,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'backup' | 'audio'>('backup');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Drive Data State
  const [driveInfo, setDriveInfo] = useState<DriveStorageInfo | null>(null);
  const [backups, setBackups] = useState<DriveFileItem[]>([]);
  const [audioFiles, setAudioFiles] = useState<DriveFileItem[]>([]);
  const [audioSearch, setAudioSearch] = useState('');
  const [isSearchingAudio, setIsSearchingAudio] = useState(false);

  // Audio Import preview state
  const [previewingFileId, setPreviewingFileId] = useState<string | null>(null);
  const [importingFileId, setImportingFileId] = useState<string | null>(null);

  // Destructive Action Confirmation Modal state (MANDATORY for Workspace guidelines)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'delete' | 'restore';
    fileItem: DriveFileItem | null;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'delete',
    fileItem: null,
  });

  // Track auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        if (currentToken) {
          loadDriveData(currentToken);
        }
      },
      () => {
        setUser(null);
        setToken(null);
        setDriveInfo(null);
        setBackups([]);
        setAudioFiles([]);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // When modal opens, refresh data if token is available
  useEffect(() => {
    if (isOpen && token) {
      loadDriveData(token);
    }
  }, [isOpen, token, activeSubTab]);

  const loadDriveData = async (currentToken: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Load Drive User Info
      try {
        const info = await getDriveAboutInfo(currentToken);
        setDriveInfo(info);
      } catch (e) {
        console.warn('Drive info error:', e);
      }

      if (activeSubTab === 'backup') {
        const backupList = await listDriveBackups(currentToken);
        setBackups(backupList);
      } else {
        const audioList = await listAudioFilesFromDrive(currentToken, audioSearch);
        setAudioFiles(audioList);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal terhubung ke Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setSuccessMsg('Berhasil masuk dengan akun Google!');
        setTimeout(() => setSuccessMsg(null), 3000);
        await loadDriveData(result.accessToken);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login Google dibatalkan atau gagal');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setDriveInfo(null);
    setBackups([]);
    setAudioFiles([]);
    setSuccessMsg('Berhasil keluar dari akun Google');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  // Upload Backup to Google Drive
  const handleCreateBackup = async () => {
    if (!token) {
      handleSignIn();
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const jsonContent = exportAllData();
      await uploadBackupToDrive(token, jsonContent);
      setSuccessMsg('Jadwal sekolah berhasil dicadangkan ke Google Drive!');
      setTimeout(() => setSuccessMsg(null), 3500);
      const backupList = await listDriveBackups(token);
      setBackups(backupList);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencadangkan ke Google Drive');
    } finally {
      setLoading(false);
    }
  };

  // Open Restore Confirmation Dialog (Mandatory User Confirmation)
  const handlePromptRestore = (file: DriveFileItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Pulihkan Jadwal dari Google Drive?',
      description: `Anda akan memulihkan data dari file cadangan "${file.name}". Jadwal, bel khusus, dan pengaturan lokal saat ini akan digantikan dengan data dari Google Drive. Pastikan Anda telah mencadangkan data terbaru sebelum melanjutkan.`,
      actionType: 'restore',
      fileItem: file,
    });
  };

  // Open Delete Confirmation Dialog (Mandatory User Confirmation)
  const handlePromptDelete = (file: DriveFileItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus File dari Google Drive?',
      description: `Apakah Anda yakin ingin menghapus file "${file.name}" dari Google Drive Anda secara permanen? Tindakan ini tidak dapat dibatalkan.`,
      actionType: 'delete',
      fileItem: file,
    });
  };

  // Execute Confirmed Action
  const handleExecuteConfirmedAction = async () => {
    if (!token || !confirmModal.fileItem) return;
    const file = confirmModal.fileItem;
    const action = confirmModal.actionType;
    setConfirmModal({ ...confirmModal, isOpen: false });

    setLoading(true);
    setErrorMsg(null);

    try {
      if (action === 'restore') {
        const jsonContent = await downloadBackupFromDrive(token, file.id);
        const success = importBackupData(jsonContent);
        if (success) {
          setSuccessMsg(`Jadwal sekolah berhasil dipulihkan dari "${file.name}"!`);
          setTimeout(() => setSuccessMsg(null), 3500);
          if (onDataRestored) onDataRestored();
        } else {
          setErrorMsg('Format file cadangan tidak valid atau rusak');
        }
      } else if (action === 'delete') {
        await deleteDriveFile(token, file.id);
        setSuccessMsg(`File "${file.name}" berhasil dihapus dari Google Drive`);
        setTimeout(() => setSuccessMsg(null), 3000);
        const backupList = await listDriveBackups(token);
        setBackups(backupList);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses file');
    } finally {
      setLoading(false);
    }
  };

  // Search Audio Files in Drive
  const handleSearchAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSearchingAudio(true);
    try {
      const list = await listAudioFilesFromDrive(token, audioSearch);
      setAudioFiles(list);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencari file audio di Google Drive');
    } finally {
      setIsSearchingAudio(false);
    }
  };

  // Preview Audio from Drive
  const handlePreviewAudio = async (file: DriveFileItem) => {
    if (!token) return;
    setPreviewingFileId(file.id);
    try {
      const dataUrl = await fetchAudioDataUrlFromDrive(token, file.id, file.mimeType);
      const audio = new Audio(dataUrl);
      audio.volume = 0.8;
      audio.onended = () => setPreviewingFileId(null);
      audio.onerror = () => {
        setPreviewingFileId(null);
        setErrorMsg('Format audio tidak didukung oleh browser untuk diputar langsung.');
      };
      await audio.play();
    } catch (err: any) {
      setPreviewingFileId(null);
      setErrorMsg('Gagal memutar pratinjau audio: ' + err.message);
    }
  };

  // Import Audio from Drive into CustomSound Library & IndexedDB
  const handleImportAudio = async (file: DriveFileItem) => {
    if (!token) return;
    setImportingFileId(file.id);
    setErrorMsg(null);
    try {
      const blob = await fetchAudioBlobFromDrive(token, file.id);
      const soundName = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
      const soundId = `custom-drive-${Date.now()}`;
      
      const fileObj = new File([blob], file.name, { type: file.mimeType || 'audio/mp3' });
      await saveAudioFile(soundId, soundName, fileObj);

      const existingSounds = loadCustomSounds();
      const newCustomSound: CustomSound = {
        id: soundId,
        name: soundName,
        type: 'custom',
        fileName: file.name,
        fileType: file.mimeType || 'audio/mp3',
        size: blob.size,
        uploadedAt: new Date().toISOString(),
        duration: 8,
      };
      saveCustomSounds([...existingSounds, newCustomSound]);

      setSuccessMsg(`Audio "${soundName}" berhasil diimpor ke Daftar Suara Bel!`);
      setTimeout(() => setSuccessMsg(null), 3500);
      if (onSoundAdded) onSoundAdded();
    } catch (err: any) {
      setErrorMsg('Gagal mengimpor audio dari Google Drive: ' + err.message);
    } finally {
      setImportingFileId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="google-drive-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="google-drive-modal-content"
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Cloud className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Google Drive Cloud Sync & Importer
              </h2>
              <p className="text-xs text-slate-400">
                Cadangkan jadwal sekolah, sinkronisasi antar perangkat, dan impor file audio bel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications & Status Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* User Account / Sign In Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          {user ? (
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {user.displayName || 'Akun Google Terhubung'}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">{user.email}</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Keluar dari Google"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Masuk dengan Akun Google untuk mengakses file Google Drive</span>
              </div>
              {/* Official Standard Google Sign-In Button */}
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-md flex items-center gap-2.5 disabled:opacity-50 cursor-pointer"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
            </div>
          )}

          {/* Sub Navigation Tabs */}
          {user && (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveSubTab('backup')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSubTab === 'backup'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Cadangan Jadwal</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300">
                  {backups.length}
                </span>
              </button>
              <button
                onClick={() => setActiveSubTab('audio')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSubTab === 'audio'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Impor Audio Drive</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300">
                  {audioFiles.length}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!user ? (
            /* Logged Out Hero View */
            <div className="py-12 px-6 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Cloud className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Hubungkan Google Drive Sekolah</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Amankan seluruh konfigurasi bel sekolah, jadwal pelajaran mingguan, suara kustom, dan
                  pengumuman 4 bahasa secara otomatis ke penyimpanan Google Drive institusi Anda.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isLoggingIn}
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 text-sm font-bold transition-all shadow-lg flex items-center gap-3 mx-auto cursor-pointer"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>
              </div>
            </div>
          ) : activeSubTab === 'backup' ? (
            /* Backup & Restore View */
            <div className="space-y-4">
              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    Cadangkan ke Google Drive
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Simpan snapshot lengkap jadwal sekolah saat ini ke Google Drive.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => token && loadDriveData(token)}
                    disabled={loading}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Segarkan data dari Google Drive"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleCreateBackup}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    <span>Cadangkan Sekarang</span>
                  </button>
                </div>
              </div>

              {/* Backups List Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-300">
                    Daftar Cadangan Tersimpan di Google Drive ({backups.length})
                  </span>
                </div>

                {loading && backups.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400" />
                    <p className="text-xs">Memuat daftar cadangan dari Google Drive...</p>
                  </div>
                ) : backups.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs font-medium">Belum ada file cadangan di Google Drive</p>
                    <p className="text-[11px] text-slate-500">
                      Klik tombol &ldquo;Cadangkan Sekarang&rdquo; di atas untuk membuat cadangan pertama.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                    {backups.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                            <span>{item.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3">
                            <span>
                              Dibuat:{' '}
                              {item.createdTime
                                ? new Date(item.createdTime).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '-'}
                            </span>
                            {item.size && (
                              <>
                                <span>•</span>
                                <span>{(parseInt(item.size) / 1024).toFixed(1)} KB</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePromptRestore(item)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Pulihkan data jadwal ke aplikasi ini"
                          >
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                            <span>Pulihkan</span>
                          </button>
                          {item.webViewLink && (
                            <a
                              href={item.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                              title="Buka file di Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handlePromptDelete(item)}
                            className="p-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all cursor-pointer"
                            title="Hapus file cadangan dari Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Google Drive Audio Importer View */
            <div className="space-y-4">
              {/* Audio Search Bar */}
              <form onSubmit={handleSearchAudio} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={audioSearch}
                    onChange={(e) => setAudioSearch(e.target.value)}
                    placeholder="Cari file audio bel di Google Drive (mp3, wav, ogg, m4a)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingAudio}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSearchingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Cari</span>
                </button>
              </form>

              {/* Audio Files Grid */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-300">
                    File Audio Ditemukan di Google Drive ({audioFiles.length})
                  </span>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400" />
                    <p className="text-xs">Mencari file audio di Google Drive...</p>
                  </div>
                ) : audioFiles.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Music className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs font-medium">Tidak ada file audio ditemukan di Google Drive</p>
                    <p className="text-[11px] text-slate-500">
                      Pastikan Anda telah mengunggah file nada lonceng berformat .mp3 atau .wav ke Google Drive Anda.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                    {audioFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <Music className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{file.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3">
                            <span className="font-mono">{file.mimeType}</span>
                            {file.size && (
                              <>
                                <span>•</span>
                                <span>{(parseInt(file.size) / (1024 * 1024)).toFixed(2)} MB</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePreviewAudio(file)}
                            disabled={previewingFileId === file.id}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            {previewingFileId === file.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                            )}
                            <span>Putar</span>
                          </button>
                          <button
                            onClick={() => handleImportAudio(file)}
                            disabled={importingFileId === file.id}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            {importingFileId === file.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                            <span>Impor ke Nada Bel</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Koneksi aman dengan Google Workspace Drive API</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Modal for Destructive Workspace Operations */}
      {confirmModal.isOpen && confirmModal.fileItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{confirmModal.description}</p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmedAction}
                className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer ${
                  confirmModal.actionType === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                }`}
              >
                {confirmModal.actionType === 'delete' ? 'Ya, Hapus File' : 'Ya, Pulihkan Jadwal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
