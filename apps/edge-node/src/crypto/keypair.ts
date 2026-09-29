import { generateKeypair, fingerprint, Keypair } from '@dwagon/shared-crypto';
import fs from 'fs';
import path from 'path';

const KEY_DIR = path.join(process.cwd(), '.keys');

function ensureKeyDir() {
  if (!fs.existsSync(KEY_DIR)) {
    fs.mkdirSync(KEY_DIR, { recursive: true });
  }
}

function keyPath(region: string): string {
  return path.join(KEY_DIR, `edge-${region}.json`);
}

/** Load keypair dari disk atau generate baru */
export function getOrCreateKeypair(region: string): Keypair & { fingerprint: string } {
  ensureKeyDir();
  const file = keyPath(region);

  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, 'utf-8');
    const kp = JSON.parse(raw) as Keypair;
    return { ...kp, fingerprint: fingerprint(kp.publicKey) };
  }

  const kp = generateKeypair();
  fs.writeFileSync(file, JSON.stringify(kp, null, 2));
  console.log(`[crypto] Generated new keypair for ${region} -> ${fingerprint(kp.publicKey)}`);
  return { ...kp, fingerprint: fingerprint(kp.publicKey) };
}