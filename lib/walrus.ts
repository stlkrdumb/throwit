import { WalrusClient } from '@mysten/walrus';
import { SuiGrpcClient, GrpcWebFetchTransport } from '@mysten/sui/grpc';
import { Signer } from '@mysten/sui/cryptography';
import { config, getRpcHeaders } from './config';

// WASM URL for blob encoding — needed for browser usage
// Loaded from CDN in browser; Node.js fallback handled by SDK
const WALRUS_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm';

function getClientConfig() {
  const transport = new GrpcWebFetchTransport({
    baseUrl: config.rpc,
    meta: getRpcHeaders(),
  });
  return {
    network: config.network,
    suiClient: new SuiGrpcClient({
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
