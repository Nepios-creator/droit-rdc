import { store, sha, json, eq, need } from '../lib/util.mjs';
import docs from '../lib/docs.mjs';
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let b; try { b = await req.json(); } catch { return json({ error: 'bad' }, 400); }
  if (typeof b.id !== 'string' || typeof b.token !== 'string') return json({ status: 'unknown' });
  const u = await store().get(b.id, { type: 'json' });
  if (!u) return json({ status: 'unknown' });
  if (!eq(u.th, sha(b.token))) return json({ status: 'moved' });
  if (u.status !== 'approved') return json({ status: u.status });
  return json({ status: 'approved', data: { docs }, premium: !!u.premium, need: need(), claimed: !!(u.pay && u.pay.status === 'claimed'),
    pay: { number: process.env.PAY_NUMBER || '', price: process.env.PAY_PRICE || '' }, code: u.code || '', home: u.home, nom: u.nom });
};
export const config = { path: '/api/access' };
