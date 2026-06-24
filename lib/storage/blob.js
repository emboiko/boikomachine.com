import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import path from 'path';
import {
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  BUSINESS,
  MAX_FILE_SIZE_BYTES,
  MAX_TOTAL_UPLOAD_BYTES,
} from '@/lib/constants';

const CONTACT_ATTACHMENTS_PREFIX = 'contact-submissions/';

export const isContactAttachmentPath = (pathname) => {
  if (!pathname || pathname.includes('..')) {
    return false;
  }

  return pathname.startsWith(CONTACT_ATTACHMENTS_PREFIX);
};

export const getContactAttachmentDownloadUrl = (storageKey, originalName) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || BUSINESS.siteUrl;
  const params = new URLSearchParams({ pathname: storageKey });

  if (originalName) {
    params.set('filename', originalName);
  }

  return `${baseUrl}/api/contact/attachments?${params.toString()}`;
};

const INLINE_ATTACHMENT_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.pdf']);

export const sanitizeAttachmentFilename = (filename) => {
  const baseName = path.basename(filename || 'download');

  return baseName.replace(/[^\w.\- ()]/g, '_');
};

export const shouldInlineAttachment = (mimeType, filename) => {
  const extension = path.extname(filename).toLowerCase();

  if (INLINE_ATTACHMENT_EXTENSIONS.has(extension)) {
    return true;
  }

  if (mimeType && mimeType.startsWith('image/')) {
    return true;
  }

  if (mimeType === 'application/pdf') {
    return true;
  }

  return false;
};

export const formatFileSize = (sizeBytes) => {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isAllowedExtension = (filename) => {
  const extension = path.extname(filename).toLowerCase();
  return ALLOWED_FILE_EXTENSIONS.includes(extension);
};

const isAllowedMimeType = (mimeType) => {
  if (!mimeType) {
    return false;
  }

  if (ALLOWED_MIME_TYPES.includes(mimeType)) {
    return true;
  }

  return mimeType.startsWith('image/');
};

export const validateUploadFile = (file) => {
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { valid: false, error: 'Invalid file upload.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `${file.name} exceeds the 10 MB per-file limit.` };
  }

  if (!isAllowedExtension(file.name)) {
    return { valid: false, error: `${file.name} has a file type that is not allowed.` };
  }

  if (!isAllowedMimeType(file.type)) {
    return { valid: false, error: `${file.name} has a MIME type that is not allowed.` };
  }

  return { valid: true };
};

export const validateUploadBatch = (files) => {
  const fileList = Array.from(files || []);

  if (fileList.length === 0) {
    return { valid: true, files: [] };
  }

  let totalSize = 0;

  for (const file of fileList) {
    const result = validateUploadFile(file);

    if (!result.valid) {
      return result;
    }

    totalSize += file.size;
  }

  if (totalSize > MAX_TOTAL_UPLOAD_BYTES) {
    return { valid: false, error: 'Total upload size exceeds the 25 MB limit.' };
  }

  return { valid: true, files: fileList };
};

export const uploadContactFile = async (file) => {
  const extension = path.extname(file.name).toLowerCase();
  const storageKey = `contact-submissions/${randomUUID()}${extension}`;

  const blob = await put(storageKey, file, {
    access: 'private',
    addRandomSuffix: false,
    contentType: file.type || 'application/octet-stream',
  });

  return {
    originalName: file.name,
    storageKey,
    blobUrl: blob.url,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
  };
};

export const uploadContactFiles = async (files) => {
  const validation = validateUploadBatch(files);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const uploads = [];

  for (const file of validation.files) {
    const uploaded = await uploadContactFile(file);
    uploads.push(uploaded);
  }

  return uploads;
};
