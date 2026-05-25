// ══════════════════════════════════════════════════════
//  js-test/search.js
//  Version pour les tests Vitest uniquement
//  — pas de DOM (pas de document.getElementById)
//  — import/export ES modules
//  — calculerTrajet() retiré (trop lié au DOM)
// ══════════════════════════════════════════════════════

import { lignesLouage } from './data.js';


// ══════════════════════════════════════════════════════
//  ALGORITHME DE RECHERCHE
// ══════════════════════════════════════════════════════
export function findRoute(dep, dest) {
  // Empêche un trajet vers la même ville
  if (dep === dest) return null;

  // Trajet direct
  if (lignesLouage[dep]?.[dest]) {
    return {
      type: 'direct',
      steps: [{ from: dep, to: dest, ...lignesLouage[dep][dest] }]
    };
  }

  // 1 correspondance
  for (const hub in (lignesLouage[dep] || {})) {
    if (lignesLouage[hub]?.[dest]) {
      return {
        type: 'transfer1',
        steps: [
          { from: dep, to: hub,  ...lignesLouage[dep][hub]  },
          { from: hub, to: dest, ...lignesLouage[hub][dest] }
        ]
      };
    }
  }

  // 2 correspondances via hubs majeurs
  const HUBS = ['Tunis', 'Sousse', 'Sfax', 'Gabès', 'Kairouan', 'Nabeul'];
  for (const h1 of HUBS) {
    if (!lignesLouage[dep]?.[h1]) continue;
    for (const h2 of HUBS) {
      if (h2 === h1)                    continue;
      if (!lignesLouage[h1]?.[h2])     continue;
      if (!lignesLouage[h2]?.[dest])   continue;
      return {
        type: 'transfer2',
        steps: [
          { from: dep, to: h1,   ...lignesLouage[dep][h1]  },
          { from: h1,  to: h2,   ...lignesLouage[h1][h2]   },
          { from: h2,  to: dest, ...lignesLouage[h2][dest]  }
        ]
      };
    }
  }

  return null;
}


// ══════════════════════════════════════════════════════
//  UTILITAIRES DURÉE
// ══════════════════════════════════════════════════════
export function parseDuration(t) {
  const [h, m] = t.split('h').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function fmtDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0
    ? `${h}h${m > 0 ? String(m).padStart(2, '0') : '00'}`
    : `${m} min`;
}