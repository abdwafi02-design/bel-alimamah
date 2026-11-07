/**
 * Google Drive API Service for Bel Sekolah Otomatis
 * Enables seamless cloud backup/restore of school schedules and audio chime imports
 */

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  description?: string;
}

export interface DriveStorageInfo {
  user: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
  storageQuota?: {
    limit?: string;
    usage?: string;
    usageInDrive?: string;
    usageInDriveTrash?: string;
  };
}

/**
 * Fetch Google Drive User & Storage Info
 */
export async function getDriveAboutInfo(token: string): Promise<DriveStorageInfo> {
  const res = await fetch(
    'https://www.googleapis.com/drive/v3/about?fields=user(displayName,emailAddress,photoLink),storageQuota',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error(`Gagal mengambil profil Google Drive (${res.status}): ${res.statusText}`);
  }
  return await res.json();
}

/**
 * List backup JSON files saved on Google Drive
 */
export async function listDriveBackups(token: string): Promise<DriveFileItem[]> {
  const query = encodeURIComponent(
    "name contains 'bel-sekolah-backup' and mimeType = 'application/json' and trashed = false"
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,description)&pageSize=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat daftar backup dari Google Drive (${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Upload a new backup JSON to Google Drive using multipart upload
 */
export async function uploadBackupToDrive(
  token: string,
  backupJsonContent: string,
  customFileName?: string
): Promise<DriveFileItem> {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = customFileName || `bel-sekolah-backup-${dateStr}.json`;

  const metadata = {
    name: fileName,
    description: 'Cadangan Jadwal & Konfigurasi Bel Sekolah Otomatis',
    mimeType: 'application/json',
    appProperties: {
      app: 'bel-sekolah-otomatis',
      type: 'backup',
      version: '2.0',
    },
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    backupJsonContent +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errorDetails = await res.text();
    throw new Error(`Gagal mengunggah backup ke Google Drive: ${errorDetails}`);
  }

  return await res.json();
}

/**
 * Download a backup JSON file content from Google Drive
 */
export async function downloadBackupFromDrive(token: string, fileId: string): Promise<string> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Gagal mengunduh file backup dari Google Drive: ${res.statusText}`);
  }

  return await res.text();
}

/**
 * Delete a backup or file from Google Drive (MUST be confirmed by user in UI first)
 */
export async function deleteDriveFile(token: string, fileId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204 && res.status !== 200) {
    throw new Error(`Gagal menghapus file dari Google Drive: ${res.statusText}`);
  }
}

/**
 * List Audio Chime / Bell Files from Google Drive for Sound Manager
 */
export async function listAudioFilesFromDrive(token: string, searchKeyword?: string): Promise<DriveFileItem[]> {
  let query = "(mimeType contains 'audio/' or name contains '.mp3' or name contains '.wav' or name contains '.ogg' or name contains '.m4a' or name contains '.aac') and trashed = false";
  if (searchKeyword && searchKeyword.trim()) {
    const escaped = searchKeyword.replace(/'/g, "\\'");
    query += ` and name contains '${escaped}'`;
  }

  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&orderBy=name asc&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)&pageSize=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat daftar audio dari Google Drive (${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Download an audio file blob from Google Drive
 */
export async function fetchAudioBlobFromDrive(token: string, fileId: string): Promise<Blob> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Gagal mengunduh audio dari Google Drive: ${res.statusText}`);
  }

  return await res.blob();
}

/**
 * Download an audio file from Google Drive and return as Data URL
 */
export async function fetchAudioDataUrlFromDrive(
  token: string,
  fileId: string,
  mimeType: string = 'audio/mp3'
): Promise<string> {
  const blob = await fetchAudioBlobFromDrive(token, fileId);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal mengonversi file audio'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca data audio blob'));
    reader.readAsDataURL(blob);
  });
}
