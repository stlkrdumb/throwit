import { config } from './config';

// Share link format:
//   https://throwit.xyz/d/{blobId}#{base64url(key)}.{base64url(iv)}.{filename}
//
// URL fragment (#...) is never sent to any server — keys stay client-side.
// Network is implicit in the deployment URL (testnet vs mainnet).

/**
 * Build a shareable link from upload results.
 */
export function buildShareLink(
  blobId: string,
  keyB64: string,
  ivB64: string,
  filename: string
): string {
  const encoded = encodeURIComponent(filename);
  return `${config.appUrl}/d/${blobId}#${keyB64}.${ivB64}.${encoded}`;
}

/**
 * Parse the URL fragment from a share link.
 * Returns null if format is invalid.
 */
export function parseShareLink(hash: string) {
  const clean = hash.replace(/^#/, '');
  const parts = clean.split('.');
  if (parts.length < 3) return null;
  // key and iv are base64url-encoded; filename may contain dots, so rejoin the rest
  const [key, iv, ...filenameParts] = parts;
  return {
    key,
    iv,
    filename: decodeURIComponent(filenameParts.join('.')),
  };
}
