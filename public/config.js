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
