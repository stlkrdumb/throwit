import { WalrusClient } from '@mysten/walrus';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Signer } from '@mysten/sui/cryptography';
import { config, getRpcHeaders, FallbackTransport, getRpcFallbackUrls } from './config';

// WASM URL for blob encoding — needed for browser usage
// Loaded from CDN in browser; Node.js fallback handled by SDK
const WALRUS_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm';

function getClientConfig() {
  const transport = new FallbackTransport(
    getRpcFallbackUrls(config.network),
    getRpcHeaders()
  );
  return {
    network: config.network,
    suiClient: new SuiJsonRpcClient({
      network: config.network,
      transport,
    }),
    wasmUrl: WALRUS_WASM_URL,
  };
}

// Write-capable Walrus client (for upload — needs a signer)
export function getWalrusWriteClient() {
  return new WalrusClient(getClientConfig());
}

// Read-only Walrus client (no signer needed for downloads)
export function getWalrusReadClient() {
  return new WalrusClient(getClientConfig());
}

/**
 * Upload encrypted blob to Walrus.
 * Returns the blobId (used in share links).
 */
export async function uploadBlob(
  signer: Signer,
  blob: Uint8Array,
  epochs: number
): Promise<string> {
  const client = getWalrusWriteClient();
  const { blobId } = await client.writeBlob({
    blob,
    deletable: true,
    epochs,
    signer,
  });
  return blobId;
}

/**
 * Download a blob from Walrus by its ID.
 * Returns raw bytes (will be decrypted client-side).
 */
export async function downloadBlob(blobId: string): Promise<Uint8Array> {
  const client = getWalrusReadClient();
  return new Uint8Array(await client.readBlob({ blobId }));
}

/**
 * Download encrypted file from Tatum Storage API download URL.
 * Tatum returns the fully-certified blob ready for decryption.
 */
export async function downloadFromTatumUrl(downloadUrl: string): Promise<Uint8Array> {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download from Tatum: ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Retrieve cached Tatum download URL for a blob.
 */
export function getTatumDownloadUrl(blobId: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const storageKey = `throwit_tatum_download_${blobId}`;
  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored);
    // Return URL only if certified
    if (data.status === 'CERTIFIED' && data.downloadUrl) {
      return data.downloadUrl;
    }
  } catch {
    // Ignore parse errors
  }
  
  return null;
}

/**
 * Parse a share link to determine source (Tatum or Walrus) and extract data.
 * Format:
 *   - Always: {appUrl}/d/{blobId}#{keyB64}.{ivB64}.{filename}
 */
export function parseShareLinkSource(
  hash: string,
  baseUrl: string,
): {
  source: 'walrus' | 'tatum';
  blobId: string;
  downloadUrl?: string;
  key: string;
  iv: string;
  filename: string;
} | null {
  const clean = hash.replace(/^#/, '');
  const parts = clean.split('.');
  if (parts.length < 3) return null;

  const [key, iv, ...filenameParts] = parts;
  const filename = decodeURIComponent(filenameParts.join('.'));

  // Extract blobId from path - always expects /d/{blobId} format
  const urlPath = baseUrl.replace(/^.*\/d\//, '');
  if (!urlPath || urlPath.includes('/')) return null;

  const blobId = urlPath;

  // Check if we have a cached Tatum download URL for this blob
  const tatumUrl = getTatumDownloadUrl(blobId);
  
  if (tatumUrl) {
    return {
      source: 'tatum',
      blobId,
      downloadUrl: tatumUrl,
      key,
      iv,
      filename,
    };
  }

  // Otherwise it's walrus direct link
  return {
    source: 'walrus',
    blobId,
    key,
    iv,
    filename,
  };
}
