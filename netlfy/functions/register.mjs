import { randomBytes, randomUUID } from 'node:crypto';
import { store, sha, json } from '../lib/util.mjs';
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let b; try { b = await req.json(); } catch { return json({ error: 'bad' }, 400); }
  const c = (s) => String(s || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  const nom = c(b.nom), postnom = c(b.postnom), prenom = c(b.prenom);
  const home = ['A', 'B', 'C', 'Libre'].includes(b.home) ? b.home : '';
  if (!nom || !postnom || !prenom || !home) return json({ error: 'missing' }, 400);
  const id = randomUUID(), token = randomBytes(24).toString('hex');
  await store().setJSON(id, { id, nom, postnom, prenom, home, status: 'pending', created: Date.now(), th: sha(token) });
  return json({ id, token });
};
export const config = { path: '/api/register' };
