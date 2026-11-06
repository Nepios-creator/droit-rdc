/* Drapp — Juriste : conversations structurées et réponses sourcées.
   Chargé par config.js ; remplace l'onglet « Assistant ». Si le serveur drapp-juriste est indisponible, l'ancien assistant prend le relais. */
(function () {
  'use strict';
  const JAPI = ((window.DRAPP || {}).api || '').replace(/drapp$/, 'drapp-juriste');
  const CATS = { 'Droit constitutionnel': '🏛️', 'Droit civil & famille': '👨‍👩‍👧', 'Droit pénal': '⚖️', 'Procédure & justice': '🧑‍⚖️', 'Droit commercial & OHADA': '💼', 'Droit du travail & social': '👷', 'Droit administratif & fiscal': '🏢', 'Droit foncier & minier': '⛏️', 'Droit international': '🌍', 'Droits humains': '🕊️', 'Histoire & institutions': '📜', 'Vocabulaire juridique': '📖', 'Autre': '💬' };
  const catIc = (c) => CATS[c] || '💬';
  const KIND = { doc: ['📎', 'Document de l\'app'], rdc: ['🇨🇩', 'Site officiel RDC'], intl: ['🌍', 'Site officiel international'], dict: ['📖', 'Dictionnaire (non officiel)'], wiki: ['📚', 'Encyclopédie (non officielle)'], web: ['🔎', 'Web (non officiel)'] };
  const EXAMPLES = ['Définis « prescription acquisitive »', 'Quelle est la différence entre droit objectif et droit subjectif ?', 'Comment la RDC applique-t-elle les traités internationaux ?', 'Quelles sont les grandes étapes de l\'histoire constitutionnelle de la RDC ?'];
  const LAB = /^(Terme|Définition|Definition|Domaine|Base légale|Fondement|Sources?|Exemple|Origine|Étymologie|Synonymes?|À ne pas confondre|Distinction|Contexte|Résumé|Étapes|Procédure|Attention|Points clés|Dates clés|En pratique|Institution compétente|Limites|À retenir)\s*:\s*(.*)$/i;

  const css = `
.jbar{display:flex;gap:8px;align-items:center;margin:4px 0 10px}.jbar .jt{flex:1;min-width:0}.jbar .jt b{display:block;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.jbar .jt span{font-size:12px;color:var(--mute)}
.cvw{position:fixed;inset:0;z-index:70;background:#0008;display:none}.cvw.on{display:block}
.cvw aside{background:var(--card);color:var(--ink);width:min(88vw,380px);height:100%;overflow:auto;padding:calc(14px + env(safe-area-inset-top)) 12px calc(14px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:10px}
.cvh{display:flex;justify-content:space-between;align-items:center}.cvh b{font-size:17px}
.cvw input[type=search]{font-size:16px;padding:10px 12px}
.cvg{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);margin:12px 4px 2px}
.cvi{display:flex;gap:8px;align-items:center;padding:9px 8px;border-radius:12px;cursor:pointer}.cvi:active{background:var(--bg)}.cvi.on{background:color-mix(in srgb,var(--pri) 14%,transparent)}
.cvi .ic2{font-size:20px;flex:none}.cvi .tx{flex:1;min-width:0}.cvi b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cvi small{color:var(--mute);font-size:11.5px}
.cvi .acts{display:flex;flex:none}.cvi .acts button{background:none;border:0;font-size:15px;padding:5px;opacity:.75;color:var(--ink)}
.ans .kv{margin:0 0 .65em}.ans .kv b{display:block;font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--pri)}
.ans p{margin:0 0 .6em}.ans p.vw{font-size:12.5px;color:var(--mute);font-style:italic}.ans ul,.ans ol{margin:.2em 0 .6em;padding-left:1.2em}
sup.cite{cursor:pointer;color:var(--pri);font-weight:700;padding:0 1px;font-size:.75em}
.jb{margin-top:8px}.badge{display:inline-block;font-size:11.5px;border-radius:999px;padding:2px 9px;margin:0 6px 4px 0;border:1px solid var(--line)}
.badge.ok{background:color-mix(in srgb,#16a34a 16%,transparent)}.badge.warn{background:color-mix(in srgb,#f59e0b 22%,transparent)}.badge.no{background:color-mix(in srgb,#94a3b8 22%,transparent)}
.srcl{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.sr{display:flex;gap:8px;align-items:flex-start;font:12.5px/1.35 system-ui,sans-serif;padding:7px 9px;border:1px solid var(--line);border-radius:10px;text-decoration:none;color:var(--ink);background:var(--bg);text-align:left;width:100%}
.sr i{font-style:normal;font-weight:700;color:var(--pri);flex:none;min-width:1.6em}.sr small{display:block;color:var(--mute);font-size:11px}.sr.flash{outline:2px solid var(--acc)}
.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(112px + env(safe-area-inset-bottom));background:#0f172af2;color:#fff;border-radius:999px;padding:8px 14px;font-size:13px;z-index:90;display:none;max-width:90vw;text-align:center}
.jw .chip{display:block;width:100%;margin:6px 0;white-space:normal}
.send.nw{background:var(--card);color:var(--pri);border:1px solid var(--line);font-size:22px}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const askOld = window.ask;
  let toastT;
  function toast(t) { let e = document.getElementById('jtoast'); if (!e) { e = document.createElement('div'); e.id = 'jtoast'; e.className = 'toast'; document.body.appendChild(e); } e.textContent = t; e.style.display = 'block'; clearTimeout(toastT); toastT = setTimeout(() => { e.style.display = 'none'; }, 2800); }
  const jcall = async (b) => { const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 75000); try { const r = await fetch(JAPI, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b), signal: ctrl.signal }); const j = await r.json().catch(() => ({})); j._s = r.status; return j; } finally { clearTimeout(to); } };
  const newConv = (title, cat) => ({ id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), title: title || 'Nouvelle conversation', cat: cat || '', t: Date.now(), created: Date.now(), msgs: [] });
  const lastQ = (c) => { const m = [...c.msgs].reverse().find((x) => x.r === 'u'); return m ? m.t : ''; };

  /* ---------- rendu d'une réponse ---------- */
  const inl = (s) => esc(s).replace(/\[(\d{1,2})\]/g, '<sup class="cite" data-n="$1">$1</sup>');
  function fmtA(t) {
    const lines = String(t).replace(/\*\*/g, '').replace(/^#{1,6}\s*/gm, '').split('\n');
    let h = '', ul = [], ol = [], p = [];
    const fp = () => { if (p.length) { const v = p.join(' '); h += (/^Information à vérifier/i.test(v) ? '<p class="vw">' : '<p>') + inl(v) + '</p>'; p = []; } };
    const fu = () => { if (ul.length) { h += '<ul>' + ul.map((x) => '<li>' + inl(x) + '</li>').join('') + '</ul>'; ul = []; } };
    const fo = () => { if (ol.length) { h += '<ol>' + ol.map((x) => '<li>' + inl(x) + '</li>').join('') + '</ol>'; ol = []; } };
    for (const raw of lines) {
      const l = raw.trim(); let m;
      if (!l) { fp(); fu(); fo(); continue; }
      if ((m = l.match(LAB))) { fp(); fu(); fo(); h += '<div class="kv"><b>' + esc(m[1]) + '</b><div>' + inl(m[2]) + '</div></div>'; continue; }
      if (/^[-•–]\s+/.test(l)) { fp(); fo(); ul.push(l.replace(/^[-•–]\s+/, '')); continue; }
      if (/^\d+[.)]\s+/.test(l)) { fp(); fu(); ol.push(l.replace(/^\d+[.)]\s+/, '')); continue; }
      fu(); fo(); p.push(l);
    }
    fp(); fu(); fo();
    return h;
  }
  const srcOf = (m) => {
    if (Array.isArray(m.sources)) return m.sources;
    return (m.refs || []).map((x) => ({ k: 'doc', l: x.l, g: x.g })).concat((m.web || []).map((x) => ({ k: x.k === 'intl' ? 'intl' : 'rdc', l: x.l, u: x.u })));
  };
  const plain = (m) => { const s = srcOf(m).map((x) => (x.n ? '[' + x.n + '] ' : '- ') + x.l + (x.u ? ' ' + x.u : '')).join('\n'); return m.t + (s ? '\n\nSources :\n' + s : ''); };
  function msgEl(m) {
    const a = m.r === 'a', d = document.createElement('div'); d.className = 'm ' + (a ? 'ma' : 'mu');
    d.innerHTML = '<div class="mt' + (a ? ' ans' : '') + '"></div>' + (a ? '<div class="jb"></div><div class="srcl"></div>' : '') + '<div class="mmeta">' + hm(m.ts || Date.now()) + '</div><div class="mtools"><button data-a="copy">Copier</button>' + (a ? '<button data-a="share">Partager</button>' : '') + '</div>';
    const mt = d.querySelector('.mt');
    if (!a) mt.textContent = m.t; else {
      mt.innerHTML = fmtA(m.t);
      const jb = d.querySelector('.jb'), sl = d.querySelector('.srcl'), S = srcOf(m);
      if (m.v === true && m.found !== false) jb.innerHTML += '<span class="badge ok">✔ Vérifié sur les sources</span>';
      if (m.found === false) jb.innerHTML += '<span class="badge no">ℹ️ Aucune source fiable trouvée</span>';
      if (m.fb) jb.innerHTML += '<span class="badge warn">⚠️ Mode de secours (serveur Juriste indisponible : ' + esc(String(m.fb)) + ')</span>';
      if (m.weak) jb.innerHTML += '<span class="badge warn">⚠️ Source non officielle : à vérifier</span>';
      S.forEach((x) => {
        const ki = KIND[x.k] || KIND.rdc, inner = '<i>' + (x.n ? '[' + x.n + ']' : ki[0]) + '</i><span>' + esc(x.l) + '<small>' + ki[0] + ' ' + ki[1] + '</small></span>';
        let e;
        if (x.u) { e = document.createElement('a'); e.href = x.u; e.target = '_blank'; e.rel = 'noopener noreferrer'; } else { e = document.createElement('button'); if (x.g) e.onclick = () => go(x.g); }
        e.className = 'sr'; if (x.n) e.dataset.n = x.n; e.innerHTML = inner; sl.appendChild(e);
      });
      mt.querySelectorAll('sup.cite').forEach((c) => { c.onclick = () => { const t = sl.querySelector('[data-n="' + c.dataset.n + '"]'); if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 1600); } }; });
    }
    d.querySelectorAll('.mtools button').forEach((b) => b.onclick = () => {
      const txt = plain(m);
      if (b.dataset.a === 'copy') { (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => flash(b, 'Copié ✓')).catch(() => { selAll(mt); flash(b, 'Sélectionné'); }); }
      else { const s = txt + '\n\n— Drapp'; navigator.share ? navigator.share({ text: s }).catch(() => {}) : navigator.clipboard && navigator.clipboard.writeText(s).then(() => flash(b, 'Copié ✓')); }
    });
    return d;
  }
  window.msgEl = msgEl;
  const typing = () => { const w = document.createElement('div'); w.className = 'm ma'; w.id = 'jtyp'; w.innerHTML = '<div class="dots"><i></i><i></i><i></i></div><div class="mmeta">Recherche dans les sources…</div>'; return w; };

  /* ---------- écran de l'assistant ---------- */
  window.buildAi = function (el) {
    el.innerHTML = '<div class="jbar"><button class="btn" id="jmenu" aria-label="Conversations">☰</button><div class="jt"><b id="jtt">Nouvelle conversation</b><span id="jtc"></span></div></div><div id="chat"></div><div class="composer"><button class="send nw" id="jnew" aria-label="Nouvelle conversation" title="Nouvelle conversation">＋</button><textarea id="aqi" rows="1" placeholder="Posez une question de droit…"></textarea><button class="send" id="asn" aria-label="Envoyer">➤</button></div>';
    $('#jmenu').onclick = openCv;
    $('#jnew').onclick = () => { curC = null; renderChat(); $('#aqi').focus(); };
    const t = $('#aqi'); t.oninput = () => { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 140) + 'px'; };
    t.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey && innerWidth > 700) { e.preventDefault(); sendQ(); } };
    $('#asn').onclick = sendQ;
  };
  window.renderChat = function () {
    const c = $('#chat'); if (!c) return;
    const has = curC && curC.msgs.length;
    $('#jtt').textContent = has ? curC.title : 'Nouvelle conversation';
    $('#jtc').textContent = has ? catIc(curC.cat) + ' ' + (curC.cat || 'Autre') : 'Droit congolais et international';
    c.innerHTML = '';
    if (!has) {
      c.innerHTML = '<div class="card jw" style="text-align:center"><div style="font-size:30px">⚖️</div><b>Que souhaitez-vous savoir ?</b><p class="mute">Droit congolais et droit international lié à la RDC : questions de cours, de pratique, d\'histoire, définitions de termes juridiques. Chaque réponse est appuyée sur des sources que vous pouvez ouvrir ; si rien de fiable n\'est trouvé, je le dis.</p>' + EXAMPLES.map((x, i) => '<button class="chip" data-jq="' + i + '">🎯 ' + esc(x) + '</button>').join('') + '</div>';
      c.querySelectorAll('[data-jq]').forEach((b) => b.onclick = () => ask(EXAMPLES[+b.dataset.jq]));
      return;
    }
    curC.msgs.forEach((m) => c.appendChild(msgEl(m)));
    if (busy) c.appendChild(typing());
  };
  window.chSave = function () { clearTimeout(window._cs); window._cs = setTimeout(() => idbSet('chats', CH.slice(0, 200)), 250); };

  window.ask = async function (q) {
    show('ai'); q = (q || '').trim();
    if (!q || busy || !$('#chat')) return;
    let c = curC; const fresh = !c || !c.msgs.length;
    if (!c) { c = curC = newConv(q.slice(0, 45), ''); CH.unshift(c); }
    const hist = c.msgs.slice(-6).map((m) => ({ r: m.r, t: m.t }));
    const cur = fresh ? null : { title: c.title, last: lastQ(c) };
    const um = { r: 'u', t: q, ts: Date.now() };
    c.msgs.push(um); c.t = Date.now(); busy = true; chSave(); renderChat(); endScroll();
    let r = null;
    try { r = await jcall({ op: 'ask', id: me.id, token: me.token, q, hist, cur }); } catch (e) { r = null; }
    busy = false;
    if (r && r._s === 402) { c.msgs.pop(); chSave(); aiInit(); return; }
    if (!r || !r.answer) { /* serveur indisponible : ancien assistant */
      c.msgs.pop(); renderChat();
      const code = r ? (r._s || '?') : 'réseau';
      if (typeof askOld === 'function') { await askOld(q); const l = curC && curC.msgs[curC.msgs.length - 1]; if (l && l.r === 'a') { l.fb = code; chSave(); renderChat(); endScroll(); } }
      return;
    }
    const am = { r: 'a', t: r.answer, ts: Date.now(), sources: r.sources || [], found: r.found !== false, v: !!r.verified, weak: !!r.weak };
    if (r.newTopic && !fresh) {
      c.msgs.pop();
      const nc = newConv(r.title || q.slice(0, 45), r.cat); nc.msgs.push(um, am); CH.unshift(nc); curC = nc;
      toast('Nouvelle conversation : ' + nc.title);
    } else {
      c.msgs.push(am); c.t = Date.now();
      if (fresh && r.title) c.title = r.title;
      if (!c.cat && r.cat) c.cat = r.cat;
    }
    CH.sort((a, b) => b.t - a.t); chSave(); renderChat(); endScroll();
  };

  /* ---------- tiroir des conversations ---------- */
  let mode = 'date'; try { mode = localStorage.getItem('cvmode') || 'date'; } catch (e) {}
  const ORDER = ['📌 Épinglées', "Aujourd'hui", 'Hier', '7 derniers jours', '30 derniers jours', 'Plus ancien'];
  const dgrp = (t) => { const s0 = (x) => { const y = new Date(x); y.setHours(0, 0, 0, 0); return y.getTime(); }; const df = Math.round((s0(Date.now()) - s0(t)) / 864e5); return df <= 0 ? "Aujourd'hui" : df === 1 ? 'Hier' : df <= 7 ? '7 derniers jours' : df <= 30 ? '30 derniers jours' : 'Plus ancien'; };
  function cvEl() {
    let e = document.getElementById('cv');
    if (!e) {
      e = document.createElement('div'); e.id = 'cv'; e.className = 'cvw';
      e.innerHTML = '<aside><div class="cvh"><b>Conversations</b><button class="btn" id="cvx" aria-label="Fermer">✕</button></div><button class="btn p" id="cvn" style="width:100%">＋ Nouvelle conversation</button><input type="search" id="cvq" placeholder="Rechercher dans les conversations…" autocomplete="off"><div class="row" id="cvm"><button class="chip" data-m="date">Par date</button><button class="chip" data-m="cat">Par matière</button></div><div id="cvl"></div></aside>';
      document.body.appendChild(e);
      e.onclick = (ev) => { if (ev.target === e) closeCv(); };
      $('#cvx').onclick = closeCv;
      $('#cvn').onclick = () => { curC = null; closeCv(); show('ai'); renderChat(); const t = $('#aqi'); if (t) t.focus(); };
      $('#cvq').oninput = renderCv;
      $$('#cvm .chip').forEach((b) => b.onclick = () => { mode = b.dataset.m; try { localStorage.setItem('cvmode', mode); } catch (x) {} renderCv(); });
      $('#cvl').onclick = (ev) => {
        const it = ev.target.closest('.cvi'); if (!it) return; const c = CH.find((x) => x.id === it.dataset.c); if (!c) return;
        const act = ev.target.closest('[data-a]');
        if (act) {
          if (act.dataset.a === 'pin') { c.p = !c.p; chSave(); renderCv(); }
          else if (act.dataset.a === 'ren') { const n = prompt('Nom de la conversation', c.title); if (n && n.trim()) { c.title = n.trim().slice(0, 80); chSave(); renderCv(); renderChat(); } }
          else if (act.dataset.a === 'del') { if (!confirm('Supprimer cette conversation ?')) return; CH = CH.filter((x) => x.id !== c.id); if (curC && curC.id === c.id) curC = null; chSave(); renderCv(); renderChat(); }
          return;
        }
        curC = c; closeCv(); show('ai'); renderChat(); endScroll();
      };
    }
    return e;
  }
  function renderCv() {
    $$('#cvm .chip').forEach((b) => b.classList.toggle('on', b.dataset.m === mode));
    const q = norm($('#cvq').value.trim());
    let L = CH.filter((c) => c.msgs && c.msgs.length);
    if (q) L = L.filter((c) => norm(c.title + ' ' + (c.cat || '') + ' ' + c.msgs.map((m) => m.t).join(' ')).includes(q));
    const G = {};
    L.sort((a, b) => b.t - a.t).forEach((c) => { const k = c.p ? ORDER[0] : (mode === 'date' ? dgrp(c.t) : (catIc(c.cat) + ' ' + (c.cat || 'Autre'))); (G[k] = G[k] || []).push(c); });
    const keys = mode === 'date' ? ORDER.filter((k) => G[k]) : [ORDER[0]].concat(Object.keys(CATS).map((k) => catIc(k) + ' ' + k), ['💬 Autre']).filter((k, i, a) => a.indexOf(k) === i && G[k]);
    $('#cvl').innerHTML = keys.map((k) => '<div class="cvg">' + esc(k) + ' · ' + G[k].length + '</div>' + G[k].map((c) => '<div class="cvi' + (curC && curC.id === c.id ? ' on' : '') + '" data-c="' + c.id + '"><span class="ic2">' + catIc(c.cat) + '</span><div class="tx"><b>' + esc(c.title) + '</b><small>' + esc(c.cat || 'Autre') + ' · ' + new Date(c.t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' · ' + c.msgs.length + ' msg</small></div><div class="acts"><button data-a="pin" aria-label="Épingler">' + (c.p ? '📍' : '📌') + '</button><button data-a="ren" aria-label="Renommer">✎</button><button data-a="del" aria-label="Supprimer">🗑</button></div></div>').join('')).join('') || '<p class="mute">Aucune conversation. Posez une question : chaque sujet sera rangé automatiquement.</p>';
  }
  function openCv() { cvEl().classList.add('on'); renderCv(); }
  function closeCv() { const e = document.getElementById('cv'); if (e) e.classList.remove('on'); }
  window.showHist = openCv;

  /* Si l'ancienne interface était déjà affichée, on la remplace. */
  const el = document.getElementById('v-ai');
  if (el && el.querySelector('#hn')) { el.innerHTML = ''; window.buildAi(el); window.renderChat(); }
})();
