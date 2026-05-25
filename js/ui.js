// ══════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════
let mode        = 'depart';
let destination = '';
let depart      = '';


// ══════════════════════════════════════════════════════
//  UTIL
// ══════════════════════════════════════════════════════
function normalize(s) {
  if (!s) return '';
  return s.normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, '')
          .trim();
}


// ══════════════════════════════════════════════════════
//  UI — MODE
// ══════════════════════════════════════════════════════
function setMode(m) {
  mode = m;
  document.getElementById('btn-dest').classList.toggle('active', m === 'destination');
  document.getElementById('btn-dep').classList.toggle('active', m === 'depart');
  document.getElementById('sel-dest-box').classList.toggle('active-sel', m === 'destination');
  document.getElementById('sel-dep-box').classList.toggle('active-sel', m === 'depart');
  const steps = {
    depart:      'Étape 1 : choisissez le départ',
    destination: 'Étape 2 : choisissez la destination'
  };
  document.getElementById('step-indicator').textContent = steps[m];
}


// ══════════════════════════════════════════════════════
//  UI — SÉLECTION AFFICHAGE
// ══════════════════════════════════════════════════════
function updateSelUI() {
  const dEl = document.getElementById('sel-dest');
  const pEl = document.getElementById('sel-dep');

  dEl.textContent = destination || 'Choisir…';
  dEl.className   = 'sel-value' + (destination ? '' : ' empty');

  pEl.textContent = depart || 'Choisir…';
  pEl.className   = 'sel-value' + (depart ? '' : ' empty');
}


// ══════════════════════════════════════════════════════
//  UI — INVERSER DÉPART / DESTINATION
// ══════════════════════════════════════════════════════
function swapSelections() {
  [destination, depart] = [depart, destination];
  updateSelUI();
  updateMapHighlights();
  updateCityButtons();
}


// ══════════════════════════════════════════════════════
//  UI — INFOS DE LA VILLE
// ══════════════════════════════════════════════════════
function showCityInfo(city) {
  const info  = cityInfos[city];
  const panel = document.getElementById('city-info-content');

  const imagePath = cityImagePaths[city] || "./assets/images/Photos_Villes/Tunis.jpeg";

  if (!info) {
    panel.innerHTML = '<p style="text-align:center;color:var(--muted);padding:20px;">Pas de détails disponibles.</p>';
    return;
  }

  panel.innerHTML = `
    <img src="${imagePath}" alt="${city}" class="city-info-photo">
    <div class="city-info-body">
      <div class="city-info-name">${city}</div>
      <p class="city-info-desc">${info.summary}</p>
      <div class="city-info-tags">
        ${info.tags.map(t => `<span class="city-tag">${t}</span>`).join('')}
      </div>
    </div>`;
}


// ══════════════════════════════════════════════════════
//  GRILLE DES VILLES
// ══════════════════════════════════════════════════════
function renderCityGrid(filter) {
  const q         = normalize(filter || '');
  const matches   = gouvernorats.filter(v => normalize(v).includes(q));
  const container = document.getElementById('city-results');

  if (!matches.length) {
    container.innerHTML = '<p class="no-results">Aucune ville trouvée.</p>';
    return;
  }

  container.innerHTML = matches.map(ville => {
    let extra = '';
    if (ville === destination) extra  = ' sel-dest';
    if (ville === depart)      extra += ' sel-dep';

    const badge = ville === destination
      ? '<span class="city-badge">D</span>'
      : (ville === depart ? '<span class="city-badge">→</span>' : '');

    const imagePath = cityImagePaths[ville] || "./assets/images/Photos_Villes/Tunis.jpeg";

    return `<button
      class="city-btn${extra}"
      style="background:url('${imagePath}');background-size:cover;background-position:center;"
      onclick="handleCityClick('${ville.replace(/'/g, "\\'")}')">
      ${badge}<span>${ville}</span>
    </button>`;
  }).join('');
}


// ══════════════════════════════════════════════════════
//  MISE À JOUR DES BOUTONS VILLES
// ══════════════════════════════════════════════════════
function updateCityButtons() {
  document.querySelectorAll('.city-btn').forEach(btn => {
    const name  = btn.querySelector('span').textContent;
    const badge = btn.querySelector('.city-badge');

    btn.classList.remove('sel-dest', 'sel-dep');
    if (badge) badge.remove();

    if (name === destination) {
      btn.classList.add('sel-dest');
      btn.insertAdjacentHTML('afterbegin', '<span class="city-badge">D</span>');
    }
    if (name === depart) {
      btn.classList.add('sel-dep');
      btn.insertAdjacentHTML('afterbegin', '<span class="city-badge">→</span>');
    }
  });
}


// ══════════════════════════════════════════════════════
//  CLICK HANDLER — sélection d'une ville
// ══════════════════════════════════════════════════════
function handleCityClick(city) {
  if (mode === 'depart') {
    depart = city;
    showCityInfo(city);
    setMode('destination');
  } else {
    if (city === depart) {
      alert('Le départ et la destination ne peuvent pas être identiques !');
      return;
    }
    destination = city;
    showCityInfo(city);
    if (destination && depart) {
      calculerTrajet(depart, destination);
    }
  }
  updateSelUI();
  updateMapHighlights();
  updateCityButtons();
}


// ══════════════════════════════════════════════════════
//  RÉINITIALISER
// ══════════════════════════════════════════════════════
function reinitialiser() {
  mode        = 'depart';
  destination = '';
  depart      = '';

  updateSelUI();
  updateMapHighlights();
  setMode('depart');

  document.getElementById('search-panel').style.display = 'block';
  document.getElementById('result-panel').style.display = 'none';
  document.getElementById('result-panel').classList.remove('anim-in');

  // Cache et réinitialise la carte Leaflet
  if (typeof cacherCarteLeaflet === 'function') cacherCarteLeaflet();

  renderCityGrid('');
}


// ══════════════════════════════════════════════════════
//  TABLEAU DES TARIFS
// ══════════════════════════════════════════════════════
function renderTarifs(filter) {
  const q    = normalize(filter || '');
  const tbody = document.getElementById('tarif-body');
  const rows  = tarifsVerifies.filter(t => normalize(t.trajet).includes(q));

  tbody.innerHTML = rows.map(t => `
    <tr>
      <td>${t.trajet}</td>
      <td class="tarif-price">${t.prix || '—'}</td>
      <td style="font-size:0.75rem;color:var(--muted);">${t.obs || '—'}</td>
    </tr>`).join('');
}


// ══════════════════════════════════════════════════════
//  TRAJETS POPULAIRES
// ══════════════════════════════════════════════════════
function renderPopularRoutes() {
  const container = document.getElementById('popular-routes');

  container.innerHTML = popularRoutes.map(r => {
    const info = lignesLouage[r.from]?.[r.to];
    const prix = info ? `${info.prix} DT · ${info.temps}` : '—';

    return `<button
      style="display:flex;align-items:center;justify-content:space-between;
             padding:10px 14px;border:1px solid var(--border);
             border-radius:var(--radius-sm);background:var(--red-light);
             cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.85rem;
             transition:all .15s;width:100%;"
      onmouseenter="this.style.background='#fff8f8'"
      onmouseleave="this.style.background='var(--red-light)'"
      onclick="quickRoute('${r.from}','${r.to}')">
      <span style="font-weight:600;color:var(--red-dark);">${r.from} → ${r.to}</span>
      <span style="color:var(--muted);font-size:0.78rem;">${prix}</span>
    </button>`;
  }).join('');
}


function quickRoute(from, to) {
  depart      = from;
  destination = to;
  updateSelUI();
  updateMapHighlights();
  updateCityButtons();
  showCityInfo(to);
  calculerTrajet(from, to);
}


// ══════════════════════════════════════════════════════
//  INITIALISATION
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // Date par défaut = aujourd'hui
  const dateInput = document.getElementById('travel-date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

  // Recherche de ville en temps réel
  const citySearch = document.getElementById('city-search');
  if (citySearch) citySearch.addEventListener('input', e => renderCityGrid(e.target.value));

  // Filtrage des tarifs en temps réel
  const tarifSearch = document.getElementById('tarif-search');
  if (tarifSearch) tarifSearch.addEventListener('input', e => renderTarifs(e.target.value));

  // État initial
  setMode('depart');

  // Rendu initial
  renderCityGrid('');
  renderTarifs('');
  renderPopularRoutes();

  // Initialise la carte SVG interactive
  if (typeof initMap === 'function') initMap();
});
