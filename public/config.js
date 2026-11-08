// Réglages de Drapp. mode: 'static' (GitHub Pages seul) ou 'server' (avec le serveur Netlify).
window.DRAPP = {
  mode: 'server',
  api: 'https://aehxiexsotqpmnmsfwgq.supabase.co/functions/v1/drapp',
  payNumber: '',   // numéro Illicocash qui reçoit les paiements (laisser vide pour ne pas afficher l'offre)
  payPrice: ''     // ex. '5 000 FC'
};
// Assistant Juriste (réponses sourcées + conversations rangées) : chargé après la page ; l'ancien assistant reste en secours.
(function () {
  var load = function () { var s = document.createElement('script'); s.src = 'juriste.js'; document.body.appendChild(s); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();

// Installation de Drapp : page d'accueil « Installer l'application » + carte avec code QR dans l'onglet « Moi ».
(function () {
  var QR_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  var SEEN = 'drapp_install_seen';
  var deferred = null;
  var ua = navigator.userAgent;
  var isIos = /iphone|ipad|ipod/i.test(ua);
  var isMobile = isIos || /android/i.test(ua);

  var appUrl = function () { return location.origin + location.pathname.replace(/index\.html$/, ''); };
  var installed = function () {
    return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  };
  var getSeen = function () { try { return localStorage.getItem(SEEN) === '1'; } catch (e) { return false; } };
  var setSeen = function () { try { localStorage.setItem(SEEN, '1'); } catch (e) {} };

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', function () { setSeen(); hideSplash(); });

  var HELP = isIos
    ? "Dans Safari, touchez le bouton Partager, puis « Sur l'écran d'accueil »."
    : "Touchez le menu ⋮ de Chrome, puis « Installer l'application ». Si vous ne le voyez pas, ouvrez ce lien dans Chrome.";

  /* ---------- Page d'installation, à la première ouverture ---------- */
  function hideSplash() { var s = document.getElementById('instsplash'); if (s) s.remove(); }

  function installNow(s) {
    if (deferred) {
      var d = deferred; deferred = null;
      d.prompt();
      d.userChoice.then(function (r) { if (r && r.outcome === 'accepted') { setSeen(); hideSplash(); } });
    } else {
      var h = s.querySelector('#sphelp');
      h.textContent = HELP;
      h.style.display = 'block';
    }
  }

  function showSplash() {
    if (getSeen() || installed() || !isMobile || document.getElementById('instsplash')) return;
    var s = document.createElement('div');
    s.id = 'instsplash';
    s.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:400;overflow:auto;background:radial-gradient(circle at 30% 12%,#27338f,#0b1020 70%);color:#fff;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px';
    var btn = 'display:block;width:100%;border-radius:999px;padding:17px 12px;font-size:18px;font-weight:700;margin-top:14px;font-family:inherit;';
    s.innerHTML =
      '<div style="width:min(100%,380px);text-align:center">' +
        '<img src="icon-192.png" alt="" style="width:120px;height:120px;border-radius:30px;box-shadow:0 18px 44px #0008">' +
        '<h1 style="font-size:36px;font-weight:800;margin:22px 0 6px;letter-spacing:-.02em">Drapp</h1>' +
        '<p style="margin:0 0 28px;font-size:17px;line-height:1.4;color:#dbe4ff">Le droit congolais, à portée de main.</p>' +
        '<button id="spgo" style="' + btn + 'border:0;background:linear-gradient(120deg,#8b9cff,#a5b4fc);color:#0b1020">📲 Installer l\'application</button>' +
        '<div id="sphelp" style="display:none;margin-top:14px;padding:12px 14px;border-radius:14px;background:#ffffff1f;font-size:15px;line-height:1.45;text-align:left"></div>' +
        '<button id="spopen" style="' + btn + 'background:transparent;border:1px solid #ffffff55;color:#fff;font-weight:600">Ouvrir Drapp directement</button>' +
        '<p style="margin:22px 4px 0;font-size:14px;line-height:1.5;color:#b9c6ee">Une fois installée, Drapp s\'ouvre comme une vraie application, directement depuis votre écran d\'accueil.</p>' +
      '</div>';
    document.body.appendChild(s);
    s.querySelector('#spgo').onclick = function () { installNow(s); };
    s.querySelector('#spopen').onclick = function () { setSeen(); hideSplash(); };
  }

  if (document.body) showSplash(); else document.addEventListener('DOMContentLoaded', showSplash);

  /* ---------- Carte « Installer l'application » + code QR (onglet Moi) ---------- */
  var loadQr = function () {
    return new Promise(function (ok, ko) {
      if (window.QRCode) return ok();
      var s = document.createElement('script');
      s.src = QR_LIB; s.onload = ok; s.onerror = ko;
      document.head.appendChild(s);
    });
  };

  function draw(box, url) {
    box.innerHTML = '';
    loadQr().then(function () {
      new QRCode(box, { text: url, width: 200, height: 200, correctLevel: QRCode.CorrectLevel.M });
    }).catch(function () {
      box.style.cssText = 'font-size:13px;color:#444;padding:12px;max-width:220px';
      box.textContent = 'Code QR indisponible sans internet. Utilisez le lien ci-dessous.';
    });
  }

  function inject() {
    var v = document.getElementById('v-me');
    if (!v || !v.children.length || v.querySelector('#qrcard')) return;
    var url = appUrl();
    var card = document.createElement('div');
    card.className = 'card';
    card.id = 'qrcard';
    card.innerHTML =
      '<b>📲 Installer l\'application</b>' +
      '<p class="mute">Scannez ce code avec l\'appareil photo d\'un téléphone pour ouvrir Drapp, puis installez-la sur l\'écran d\'accueil.</p>' +
      '<div style="text-align:center"><div id="qrbox" style="display:inline-block;background:#fff;padding:12px;border-radius:14px;min-width:224px;min-height:224px"></div></div>' +
      '<p class="mute" id="qrurl" style="text-align:center;word-break:break-all;user-select:text"></p>' +
      '<div class="row" style="justify-content:center">' +
        '<button class="btn p" id="qrinst"></button>' +
        '<button class="btn" id="qrshare">Partager le lien</button>' +
      '</div>' +
      '<p class="mute" style="font-size:12px">Android (Chrome) : menu ⋮ → « Installer l\'application ». iPhone (Safari) : bouton Partager → « Sur l\'écran d\'accueil ».</p>';
    var sig = v.querySelector('.sig2');
    sig ? v.insertBefore(card, sig) : v.appendChild(card);

    card.querySelector('#qrurl').textContent = url;
    draw(card.querySelector('#qrbox'), url);

    var inst = card.querySelector('#qrinst');
    if (installed()) { inst.textContent = '✅ Déjà installée'; inst.disabled = true; }
    else {
      inst.textContent = 'Installer sur ce téléphone';
      inst.onclick = function () {
        if (deferred) {
          var d = deferred; deferred = null;
          d.prompt();
        } else {
          alert(HELP);
        }
      };
    }
    card.querySelector('#qrshare').onclick = function () {
      var b = this, old = b.textContent;
      if (navigator.share) { navigator.share({ title: 'Drapp', text: 'Drapp : le droit congolais à portée de main', url: url }).catch(function () {}); }
      else if (navigator.clipboard) { navigator.clipboard.writeText(url).then(function () { b.textContent = 'Copié ✓'; setTimeout(function () { b.textContent = old; }, 1400); }); }
    };
  }

  function start() {
    var v = document.getElementById('v-me');
    if (!v) return;
    new MutationObserver(inject).observe(v, { childList: true });
    inject();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
