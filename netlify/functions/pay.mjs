import { store, auth, json } from '../lib/util.mjs';
export default async (req) => {
  const b = await req.json().catch(() => ({}));
  const u = await auth(b);
  if (!u || u.status !== 'approved') return json({ error: 'auth' }, 401);
  const ref = String(b.ref || '').trim().slice(0, 40);
  if (ref.length < 4) return json({ error: 'bad' }, 400);
  u.pay = { ref, at: Date.now(), status: 'claimed' };
  await store().setJSON(u.id, u);
  return json({ ok: 1 });
};
export const config = { path: '/api/pay' };
