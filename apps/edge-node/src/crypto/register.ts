import { getOrCreateKeypair } from './keypair';

const CENTRAL_URL = process.env.CENTRAL_URL ?? 'http://localhost:4000';
const REGION = process.env.REGION ?? 'kalimantan';
const PORT = Number(process.env.PORT ?? 4001);

export async function registerEdgeWithCentral(): Promise<void> {
  const kp = getOrCreateKeypair(REGION);

  try {
    const res = await fetch(`${CENTRAL_URL}/api/edge-registry/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        region: REGION,
        publicKey: kp.publicKey,
        fingerprint: kp.fingerprint,
        endpoint: `http://localhost:${PORT}`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`[register] Gagal register: ${res.status} ${err}`);
      return;
    }

    const data = await res.json();
    console.log(`[register] Edge ${REGION} registered. Fingerprint: ${data.fingerprint}`);
  } catch (e: any) {
    console.warn(`[register] Central belum siap: ${e.message}`);
  }
}

/** Heartbeat berkala setiap 30 detik */
export function startHeartbeat(): NodeJS.Timeout {
  return setInterval(async () => {
    try {
      await fetch(`${CENTRAL_URL}/api/edge-registry/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: REGION }),
      });
    } catch {
      /* silent */
    }
  }, 30000);
}