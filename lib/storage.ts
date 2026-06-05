import { config } from './config';

export type StorageProvider = 'walrus' | 'tatum';
export type UploadStatus = 'PENDING' | 'UPLOADING' | 'CERTIFIED' | 'FAILED';

// Tatum Storage API returns data directly (no success/data wrapper)
export interface TatumUploadResponse {
  jobId: string;
  status: UploadStatus;
  filename: string;
  mimeType?: string;
  sizeBytes: number;
  blobId: string;
  walrusStartEpoch?: number;
  walrusEndEpoch?: number;
  downloadUrlByQuiltId?: string;
  downloadUrlByQuiltPatchId?: string;
}

export interface TatumUploadStatus {
  jobId: string;
  status: UploadStatus;
  filename: string;
  mimeType?: string;
  sizeBytes: number;
  walrusStartEpoch?: number;
  walrusEndEpoch?: number;
  downloadUrlByQuiltId?: string;
  downloadUrlByQuiltPatchId?: string;
  errorMessage?: string;
}

export interface TatumListUploadResponse {
  uploads: Array<{
    jobId: string;
    status: UploadStatus;
    filename: string;
    sizeBytes: number;
    createdAt: string;
    walrusStartEpoch: number;
    walrusEndEpoch: number;
    downloadUrlByQuiltId?: string;
  }>;
  totalCount: number;
}

/**
 * Get the active storage provider based on current network mode.
 * Tatum Storage API is only available on mainnet.
 */
export function getActiveStorageProvider(): StorageProvider {
  if (config.network === 'mainnet') return 'tatum';
  return 'walrus';
}

/**
 * Upload file to storage provider.
 * Returns blobId for share links, plus jobId for Tatum mode tracking.
 */
export async function uploadToStorage(
  file: File,
  apiKey: string,
): Promise<{
  blobId: string;
  jobId?: string;
  status?: UploadStatus;
}> {
  const provider = getActiveStorageProvider();

  if (provider === 'tatum') {
    return uploadViaTatum(file, apiKey);
  } else {
    // Walrus mode - delegated to original flow with signer
    throw new Error('Walrus direct upload requires wallet signer. Use executeUpload() instead.');
  }
}

/**
 * Upload via Tatum Storage API (mainnet only).
 * Files are staged in GCS then certified on-chain asynchronously.
 */
async function uploadViaTatum(file: File, apiKey: string): Promise<{ blobId: string; jobId?: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${config.storageApiUrl}/v4/data/storage/upload`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? `Upload failed: ${response.status}`);
  }

  const result: TatumUploadResponse = await response.json();

  // Tatum returns data directly (no wrapper)
  if (!result?.jobId || !result?.blobId) {
    throw new Error('Invalid response from Tatum Storage API');
  }

  return {
    blobId: result.blobId,
    jobId: result.jobId,
  };
}

/**
 * Poll upload status until CERTIFIED or FAILED.
 * Retries every 2 seconds, max 60 seconds total.
 */
export async function waitForUploadCertified(
  jobId: string,
  apiKey: string,
  onProgress?: (status: UploadStatus) => void,
): Promise<{
  status: UploadStatus;
  downloadUrlByQuiltId: string;
  downloadUrlByQuiltPatchId: string;
}> {
  const maxAttempts = 30; // 2s × 30 = 60s max
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const response = await fetch(`${config.storageApiUrl}/v4/data/storage/upload/${jobId}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const result: TatumUploadStatus = await response.json();

      // Tatum returns status directly (no wrapper)
      if (!result || !result.status) {
        throw new Error('Invalid status response');
      }

      onProgress?.(result.status);

      if (result.status === 'CERTIFIED') {
        if (!result.downloadUrlByQuiltId || !result.downloadUrlByQuiltPatchId) {
          throw new Error('Certified but missing download URLs');
        }
        return {
          status: result.status,
          downloadUrlByQuiltId: result.downloadUrlByQuiltId,
          downloadUrlByQuiltPatchId: result.downloadUrlByQuiltPatchId,
        };
      }

      if (result.status === 'FAILED') {
        throw new Error(result.errorMessage ?? `Upload failed with status: ${result.status}`);
      }

      // Still pending/uploading — wait 2s and retry
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      if (err instanceof Error && err.message.includes('CERTIFIED')) throw err;
      console.warn(`Status poll attempt ${attempts} failed:`, err);
      // Non-fatal error — keep polling
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw new Error('Upload timed out after 60 seconds');
}

/**
 * List all uploads for the API key.
 */
export async function listUploads(
  apiKey: string,
  limit = 50,
  offset = 0,
): Promise<TatumListUploadResponse> {
  const response = await fetch(`${config.storageApiUrl}/v4/data/storage/uploads?limit=${limit}&offset=${offset}`, {
    headers: { 'x-api-key': apiKey },
  });

  if (!response.ok) {
    throw new Error(`Failed to list uploads: ${response.status}`);
  }

  return response.json();
}

/**
 * Cancel upload renewal (soft delete).
 */
export async function cancelUploadRenewal(
  jobId: string,
  apiKey: string,
): Promise<void> {
  const response = await fetch(`${config.storageApiUrl}/v4/data/storage/upload/${jobId}`, {
    method: 'DELETE',
    headers: { 'x-api-key': apiKey },
  });

  if (!response.ok) {
    throw new Error(`Cancel renewal failed: ${response.status}`);
  }
}

/**
 * Instant delete upload (billed via Walrus on-chain fees).
 */
export async function instantDeleteUpload(
  jobId: string,
  apiKey: string,
): Promise<void> {
  const response = await fetch(`${config.storageApiUrl}/v4/data/storage/upload/${jobId}?instant=true`, {
    method: 'DELETE',
    headers: { 'x-api-key': apiKey },
  });

  if (!response.ok) {
    throw new Error(`Instant delete failed: ${response.status}`);
  }
}
