import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import { createHash, randomBytes } from 'crypto';

export interface Keypair {
  publicKey: string;   // base64
  privateKey: string;  // base64
}

/** Generate Ed25519 keypair */
export function generateKeypair(): Keypair {
  const kp = nacl.sign.keyPair();
  return {
    publicKey: util.encodeBase64(kp.publicKey),
    privateKey: util.encodeBase64(kp.secretKey),
  };
}

/** Sign arbitrary data (object or string) */
export function signPayload(data: string | object, privateKeyB64: string): string {
  const json = typeof data === 'string' ? data : canonicalize(data);
  const msg = util.decodeUTF8(json);
  const sk = util.decodeBase64(privateKeyB64);
  const sig = nacl.sign.detached(msg, sk);
  return util.encodeBase64(sig);
}

/** Verify signature */
export function verifyPayload(data: string | object, signatureB64: string, publicKeyB64: string): boolean {
  try {
    const json = typeof data === 'string' ? data : canonicalize(data);
    const msg = util.decodeUTF8(json);
    const sig = util.decodeBase64(signatureB64);
    const pk = util.decodeBase64(publicKeyB64);
    return nacl.sign.detached.verify(msg, sig, pk);
  } catch {
    return false;
  }
}

/** SHA-256 fingerprint dari public key (seperti SSH) */
export function fingerprint(publicKeyB64: string): string {
  const hash = createHash('sha256').update(publicKeyB64).digest();
  const hex = hash.toString('hex').toUpperCase();
  // Format: XXXX:XXXX:XXXX:...
  return hex.match(/.{1,4}/g)!.slice(0, 8).join(':');
}

/** Deterministic JSON stringify — sort keys biar consistent */
function canonicalize(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalize).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}';
}

/** Generate secure random token untuk nonce */
export function generateNonce(): string {
  return randomBytes(16).toString('hex');
}