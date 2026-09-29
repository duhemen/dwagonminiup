import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

const VAPID_FILE = path.join(process.cwd(), '.vapid.json');

interface VapidKeys {
  publicKey: string;
  privateKey: string;
  subject: string;
}

let cached: VapidKeys | null = null;

export function getVapidKeys(): VapidKeys {
  if (cached) return cached;

  if (fs.existsSync(VAPID_FILE)) {
    const raw = fs.readFileSync(VAPID_FILE, 'utf-8');
    cached = JSON.parse(raw) as VapidKeys;
    console.log(`[vapid] Loaded keys. Public: ${cached.publicKey.slice(0, 24)}...`);
    webpush.setVapidDetails(cached.subject, cached.publicKey, cached.privateKey);
    return cached;
  }

  const kp = webpush.generateVAPIDKeys();
  const keys: VapidKeys = {
    publicKey: kp.publicKey,
    privateKey: kp.privateKey,
    subject: 'mailto:admin@dwagon.id',
  };
  fs.writeFileSync(VAPID_FILE, JSON.stringify(keys, null, 2));
  console.log(`[vapid] Generated new keys. Public: ${keys.publicKey.slice(0, 24)}...`);
  webpush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);
  cached = keys;
  return keys;
}

export function getWebPush() {
  getVapidKeys();
  return webpush;
}