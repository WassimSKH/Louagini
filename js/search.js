// ══════════════════════════════════════════════════════
//  ALGORITHM — now with multi-hop (up to 2 transfers)
// ══════════════════════════════════════════════════════
// Tests/search.test.js
import { describe, it, expect } from 'vitest'
import { findRoute, parseDuration, fmtDuration } from '../js/search.js'
import { lignesLouage } from '../js/data.js' // besoin d'importer les données pour que findRoute puisse les lire

export function findRoute(dep, dest) {
  // empêcher un trajet vers la même ville
  if (dep === dest) {
    return null;
  }
  // Direct
  if (lignesLouage[dep]?.[dest]) {
    return { type: 'direct', steps: [{ from: dep, to: dest, ...lignesLouage[dep][dest] }] };
  }
  // 1 transfer
  for (const hub in (lignesLouage[dep] || {})) {
    if (lignesLouage[hub]?.[dest]) {
      const s1 = lignesLouage[dep][hub];
      const s2 = lignesLouage[hub][dest];
      return {
        type: 'transfer1',
        steps: [
          { from: dep, to: hub, ...s1 },
          { from: hub, to: dest, ...s2 }
        ]
      };
    }
  }
  // 2 transfers — smarter search via major hubs
  const HUBS = ['Tunis','Sousse','Sfax','Gabès','Kairouan','Nabeul'];
  for (const h1 of HUBS) {
    if (!lignesLouage[dep]?.[h1]) continue;
    for (const h2 of HUBS) {
      if (h2 === h1) continue;
      if (!lignesLouage[h1]?.[h2]) continue;
      if (!lignesLouage[h2]?.[dest]) continue;
      return {
        type: 'transfer2',
        steps: [
          { from: dep, to: h1, ...lignesLouage[dep][h1] },
          { from: h1, to: h2, ...lignesLouage[h1][h2] },
          { from: h2, to: dest, ...lignesLouage[h2][dest] }
        ]
      };
    }
  }
  return null;
}

export function parseDuration(t) {
  const [h, m] = t.split('h').map(Number);
  return (h || 0) * 60 + (m || 0);
}
export function fmtDuration(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? String(m).padStart(2,'0') : '00'}` : `${m} min`;
}

export function calculerTrajet(dep, dest) {
  const passengers = parseInt(document.getElementById('passengers')?.value || 1);
  const travelDate = document.getElementById('travel-date')?.value || '';
  const route = findRoute(dep, dest);

  const resBadge = document.getElementById('res-badge');
  const resTitle = document.getElementById('res-title');
  const resRoute = document.getElementById('res-route');
  const resInfos = document.getElementById('res-infos');
  const resNotice = document.getElementById('res-notice');
  const resPanel = document.getElementById('result-panel');
  const searchPanel = document.getElementById('search-panel');

  if (!route) {
    resBadge.className = 'result-badge none';
    resBadge.innerHTML = '❌ Aucun trajet trouvé';
    resTitle.textContent = `${dep} → ${dest}`;
    resRoute.innerHTML = '<p style="color:var(--muted);font-size:.88rem;">Aucune liaison directe ou via hub répertoriée pour ce trajet. Essayez de passer par Tunis ou Sousse.</p>';
    resInfos.innerHTML = '';
    resNotice.innerHTML = '';
    searchPanel.style.display = 'none';
    resPanel.style.display = 'block';
    resPanel.classList.add('anim-in');
    return;
  }

  const totalPrix = route.steps.reduce((s, st) => s + st.prix, 0);
  const totalMins = route.steps.reduce((s, st) => s + parseDuration(st.temps), 0);
  const totalPrixPax = (totalPrix * passengers).toFixed(2);

  // Badge & title
  const labels = { direct: '✓ Trajet direct', transfer1: '⚡ 1 correspondance', transfer2: '🔀 2 correspondances' };
  const classes = { direct: 'direct', transfer1: 'indirect', transfer2: 'indirect' };
  resBadge.className = `result-badge ${classes[route.type]}`;
  resBadge.innerHTML = labels[route.type];
  resTitle.textContent = `${dep} → ${dest}`;

  // Route steps
  const cities = [route.steps[0].from, ...route.steps.map(s => s.to)];
  const dotColors = ['gold', '', 'green'];
  let routeHTML = '';
  cities.forEach((city, i) => {
    const isLast = i === cities.length - 1;
    const dotColor = i === 0 ? 'gold' : (isLast ? 'green' : '');
    routeHTML += `<div class="route-step">
      <div class="route-step-line">
        <div class="route-dot ${dotColor}"></div>
        ${!isLast ? '<div class="route-connector"></div>' : ''}
      </div>
      <div class="route-step-info">
        <div class="route-city">${city}</div>`;
    if (!isLast) {
      const s = route.steps[i];
      routeHTML += `<div class="route-meta">📍 ${s.station} · ⏱ ${s.temps} · 💰 ${s.prix} DT/pers</div>`;
    } else if (travelDate) {
      routeHTML += `<div class="route-meta">📅 Arrivée estimée le ${travelDate}</div>`;
    }
    routeHTML += `</div></div>`;
  });
  resRoute.innerHTML = routeHTML;

  // Info boxes
  resInfos.innerHTML = `
    <div class="info-box"><div class="val">${totalPrix.toFixed(2)} DT</div><div class="lbl">Prix / pers.</div></div>
    <div class="info-box"><div class="val">${fmtDuration(totalMins)}</div><div class="lbl">Durée totale</div></div>
    <div class="info-box"><div class="val">${totalPrixPax} DT</div><div class="lbl">Total × ${passengers}</div></div>`;

  // Notice
  const notices = {
    direct: '🟢 Trajet direct depuis la station indiquée. Le louage part dès qu\'il est complet.',
    transfer1: '🟡 Changement de louage au hub intermédiaire. Prévoyez 15–30 min d\'attente.',
    transfer2: '🟠 Trajet en 2 correspondances. Départ tôt conseillé pour éviter les longues attentes.',
  };
  resNotice.innerHTML = notices[route.type];
  resNotice.className = `notice ${route.type === 'direct' ? 'tip' : 'info'}`;

  searchPanel.style.display = 'none';
  resPanel.style.display = 'block';
  resPanel.classList.add('anim-in');
  afficherCarteLeaflet(route.steps);
}
if (typeof module !== 'undefined') {
  module.exports = { maFonction };
}