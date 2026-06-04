// All encryption happens in the browser. No keys ever leave the client.

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable — needed to put it in the URL fragment
    ['encrypt', 'decrypt']
  );
}

export async function encryptFile(
  file: File | ArrayBuffer,
  key: CryptoKey
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array }> {
  const data = new Uint8Array(file instanceof File ? await file.arrayBuffer() : file);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buf = data.slice(0).buffer as ArrayBuffer;
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    buf
  );
  return { ciphertext: new Uint8Array(cipherBuffer), iv };
}

export async function decryptFile(
  ciphertext: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.slice(0).buffer as ArrayBuffer },
    key,
    new Uint8Array(ciphertext.slice(0)).buffer as ArrayBuffer
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return base64UrlEncode(new Uint8Array(raw));
}

export async function importKey(b64: string): Promise<CryptoKey> {
  const raw = base64UrlDecode(b64);
  return crypto.subtle.importKey(
    'raw',
    raw.slice(0).buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}
