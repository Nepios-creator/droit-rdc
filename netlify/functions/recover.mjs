import { randomBytes } from 'node:crypto';
import { store, codes, sha, json } from '../lib/util.mjs';
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const b = await req.json().catch(() => ({}));
  const raw = String(b.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (raw.length !== 12) return json({ error: 'code' }, 404);
  const k = raw.replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3');
  const id = await codes().get(k);
  const u = id ? await store().get(id, { type: 'json' }) : null;
  if (!u || u.code !== k) return json({ error: 'code' }, 404);
  if (u.status !== 'approved') return json({ error: 'status' }, 403);
  const token = randomBytes(24).toString('hex'); // l'ancien téléphone devient invalide
  u.th = sha(token); u.moved = Date.now();
  await store().setJSON(id, u);
  return json({ id, token, prenom: u.prenom });
};
export const config = { path: '/api/recover' };
