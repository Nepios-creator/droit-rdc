import { store, codes, json, eq, newCode, sha } from '../lib/util.mjs';
const ADMIN_HASH = '6a7725bbef2342fc3099d282e72d747f369a086b658fae61b41ab82c442260c8'; // empreinte SHA-256 du mot de passe ; ADMIN_KEY (Netlify) peut le remplacer
export default async (req) => {
  const given = req.headers.get('x-admin-key') || '';
  const ok = (process.env.ADMIN_KEY && eq(given, process.env.ADMIN_KEY)) || eq(sha(given), ADMIN_HASH);
  if (req.method !== 'POST' || !ok) { await new Promise((r) => setTimeout(r, 800)); return json({ error: 'auth' }, 401); }
  const b = await req.json().catch(() => ({}));
  const s = store(), c = codes();
  if (b.action === 'list') {
    const { blobs } = await s.list();
    const users = (await Promise.all(blobs.map((x) => s.get(x.key, { type: 'json' })))).filter(Boolean).map(({ th, ...u }) => u).sort((a, z) => z.created - a.created);
    return json({ users });
  }
  const u = typeof b.id === 'string' ? await s.get(b.id, { type: 'json' }) : null;
  if (!u) return json({ error: 'nf' }, 404);
  const gen = async () => { if (u.code) await c.delete(u.code); let k; do { k = newCode(); } while (await c.get(k)); u.code = k; await c.set(k, u.id); };
  if (b.action === 'delete') { if (u.code) await c.delete(u.code); await s.delete(b.id); return json({ ok: 1 }); }
  if (b.action === 'approve') { u.status = 'approved'; if (!u.code) await gen(); }
  else if (b.action === 'newcode') await gen();
  else if (b.action === 'confirmpay') { u.premium = true; if (u.pay) u.pay.status = 'confirmed'; }
  else if (b.action === 'unpremium') u.premium = false;
  else if (b.action === 'reject') u.status = 'rejected';
  else if (b.action === 'revoke') u.status = 'revoked';
  else return json({ error: 'act' }, 400);
  u.updated = Date.now();
  await s.setJSON(u.id, u);
  return json({ ok: 1 });
};
export const config = { path: '/api/admin' };
