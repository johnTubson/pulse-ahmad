import { getSupabaseClient } from './client';

export const RECEIPTS_BUCKET = 'receipts';

export const RECEIPTS_MAX_BYTES = 5 * 1024 * 1024;

const RECEIPT_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

export type ReceiptMimeType = (typeof RECEIPT_MIME_TYPES)[number];

/**
 * Build a user-scoped storage path. First folder segment must match auth.uid()
 * for RLS policies in `supabase/migrations/001_receipts_storage_bucket.sql`.
 */
export function receiptStoragePath(userId: string, fileName: string): string {
  const safeName = fileName.replace(/[/\\]/g, '-');
  return `${userId}/${safeName}`;
}

export function isAllowedReceiptMimeType(mimeType: string): mimeType is ReceiptMimeType {
  return (RECEIPT_MIME_TYPES as readonly string[]).includes(mimeType);
}

export type UploadReceiptInput = {
  userId: string;
  /** Local file URI (e.g. from expo-image-picker / expo-camera). */
  uri: string;
  fileName: string;
  mimeType?: string;
};

export async function uploadReceipt(input: UploadReceiptInput): Promise<string> {
  const mimeType = input.mimeType ?? 'image/jpeg';
  if (!isAllowedReceiptMimeType(mimeType)) {
    throw new Error(`Unsupported receipt type: ${mimeType}`);
  }

  const response = await fetch(input.uri);
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > RECEIPTS_MAX_BYTES) {
    throw new Error('Receipt image exceeds 5 MB limit.');
  }

  const path = receiptStoragePath(input.userId, input.fileName);
  const { error } = await getSupabaseClient()
    .storage.from(RECEIPTS_BUCKET)
    .upload(path, arrayBuffer, { contentType: mimeType, upsert: true });

  if (error) throw error;
  return path;
}

export async function getReceiptSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
  const { data, error } = await getSupabaseClient()
    .storage.from(RECEIPTS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteReceipt(path: string): Promise<void> {
  const { error } = await getSupabaseClient().storage.from(RECEIPTS_BUCKET).remove([path]);
  if (error) throw error;
}
