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

// Installer l'application en scannant un code QR (onglet « Moi » = paramètres).
(function () {
  var QR_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  var deferred = null;

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });

  var appUrl = function () { return location.origin + location.pathname.replace(/index\.html$/, ''); };
  var installed = function () {
    return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  };
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
          deferred.prompt();
          deferred.userChoice.then(function () { deferred = null; });
        } else {
          alert("Android (Chrome) : menu ⋮ → « Installer l'application ».\niPhone (Safari) : Partager → « Sur l'écran d'accueil ».");
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
  // Invitation à installer Drapp, affichée une seule fois, à la toute première ouverture.
  var SEEN = 'drapp_install_seen';
  var ua = navigator.userAgent;
  var isIos = /iphone|ipad|ipod/i.test(ua);
  var isMobile = isIos || /android/i.test(ua);
  var getSeen = function () { try { return localStorage.getItem(SEEN) === '1'; } catch (e) { return false; } };
  var setSeen = function () { try { localStorage.setItem(SEEN, '1'); } catch (e) {} };
  var hideBanner = function () { var b = document.getElementById('instbanner'); if (b) b.remove(); };

  function showBanner() {
    if (getSeen() || installed() || document.getElementById('instbanner')) return;
    if (!deferred && !isMobile) return;
    var b = document.createElement('div');
    b.id = 'instbanner';
    b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:300;max-width:460px;margin:0 auto;background:#fff;color:#0f172a;border-radius:20px;padding:14px 16px;box-shadow:0 14px 40px #0006;font:15px/1.4 system-ui,sans-serif';
    var msg = deferred
      ? "Gardez Drapp sur votre écran d'accueil, comme une vraie application."
      : (isIos
        ? "Dans Safari, touchez le bouton Partager, puis « Sur l'écran d'accueil »."
        : "Dans Chrome, touchez le menu ⋮, puis « Installer l'application ».");
    var btn = 'border:0;border-radius:999px;padding:9px 16px;font-size:14px;';
    b.innerHTML =
      '<div style="font-weight:700;font-size:16px">📲 Installer Drapp</div>' +
      '<div style="color:#475569;margin:4px 0 10px">' + msg + '</div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end">' +
        '<button id="instlater" style="' + btn + 'background:#e2e8f0;color:#0f172a">' + (deferred ? 'Plus tard' : "J'ai compris") + '</button>' +
        (deferred ? '<button id="instgo" style="' + btn + 'background:linear-gradient(120deg,#4338ca,#0891b2);color:#fff;font-weight:700">Installer</button>' : '') +
      '</div>';
    document.body.appendChild(b);
    b.querySelector('#instlater').onclick = function () { setSeen(); hideBanner(); };
    var go = b.querySelector('#instgo');
    if (go) go.onclick = function () {
      setSeen(); hideBanner();
      if (deferred) { deferred.prompt(); deferred.userChoice.then(function () { deferred = null; }); }
    };
  }

  window.addEventListener('beforeinstallprompt', function () {
    if (document.getElementById('instbanner')) { hideBanner(); showBanner(); }
  });
  window.addEventListener('appinstalled', function () { setSeen(); hideBanner(); });
  var armBanner = function () { setTimeout(showBanner, 2500); };
  if (document.readyState === 'complete') armBanner(); else window.addEventListener('load', armBanner);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
