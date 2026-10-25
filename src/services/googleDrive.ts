export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

export const listDriveFiles = async (
  accessToken: string,
  filterType: 'all' | 'docs' | 'images' = 'all',
  searchQuery: string = ''
): Promise<DriveFileItem[]> => {
  let qParts = ["trashed = false"];

  if (filterType === 'docs') {
    qParts.push(
      "(mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType = 'text/markdown' or mimeType = 'application/pdf')"
    );
  } else if (filterType === 'images') {
    qParts.push("mimeType contains 'image/'");
  }

  if (searchQuery.trim()) {
    // Sanitize search query for Drive q parameter
    const escaped = searchQuery.replace(/'/g, "\\'");
    qParts.push(`name contains '${escaped}'`);
  }

  const query = encodeURIComponent(qParts.join(' and '));
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink,thumbnailLink)&pageSize=25&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Drive list failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
};

export const fetchDriveFileContent = async (
  accessToken: string,
  fileId: string,
  mimeType: string
): Promise<string> => {
  let url = '';

  if (mimeType === 'application/vnd.google-apps.document') {
    // Export Google Doc as plain text
    url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
  } else {
    // Download raw media for text/plain, markdown, etc.
    url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch file content: ${res.statusText}`);
  }

  return await res.text();
};

export const saveDraftToDrive = async (
  accessToken: string,
  title: string,
  content: string,
  asGoogleDoc: boolean = true
): Promise<DriveFileItem> => {
  const metadata: Record<string, any> = {
    name: title,
    description: 'Saved from Aegis Brand Governance Platform',
  };

  if (asGoogleDoc) {
    metadata.mimeType = 'application/vnd.google-apps.document';
  } else {
    metadata.mimeType = 'text/plain';
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to save file to Google Drive: ${res.statusText}`);
  }

  return await res.json();
};

export const deleteDriveFile = async (
  accessToken: string,
  fileId: string
): Promise<void> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete file from Google Drive: ${res.statusText}`);
  }
};
