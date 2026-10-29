import loi from './loi.mjs';
import expose from './expose.mjs';
// Pour ajouter un document : créez son fichier (voir LISEZ-MOI.txt), importez-le et mettez-le dans la liste.
const soon = (id, title, icon) => ({ id, title, icon, soon: true, items: [] });
export default [
  loi, expose,
  soon('constitution', 'Constitution de la RDC', '🏛️'),
  soon('famille', 'Code de la famille', '👨‍👩‍👧'),
  soon('dudh', 'Déclaration universelle des droits de l\'homme', '🌍'),
  soon('adages', 'Adages juridiques', '📜'),
  soon('sources', 'Sources du droit', '📚'),
  soon('doctrine', 'Doctrine et jurisprudences', '🧑‍⚖️'),
  soon('lexique', 'Lexique et termes juridiques', '🔤'),
  soon('actus', 'Actualités du droit', '📰'),
];
