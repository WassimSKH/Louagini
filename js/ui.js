
// ══════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════
let mode = 'depart';
let destination = '';
let depart = '';

// ══════════════════════════════════════════════════════
//  UTIL
// ══════════════════════════════════════════════════════
function normalize(s) {
  if (!s) return '';
  return s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();
}

// ══════════════════════════════════════════════════════
//  UI
// ══════════════════════════════════════════════════════
function setMode(m) {
  mode = m;
  document.getElementById('btn-dest').classList.toggle('active', m === 'destination');
  document.getElementById('btn-dep').classList.toggle('active', m === 'depart');
  document.getElementById('sel-dest-box').classList.toggle('active-sel', m === 'destination');
  document.getElementById('sel-dep-box').classList.toggle('active-sel', m === 'depart');
  const steps = { depart: 'Étape 1 : choisissez le départ', destination: 'Étape 2 : choisissez la destination' };
  document.getElementById('step-indicator').textContent = steps[m];
}

function updateSelUI() {
  const dEl = document.getElementById('sel-dest');
  const pEl = document.getElementById('sel-dep');
  dEl.textContent = destination || 'Choisir…';
  dEl.className = 'sel-value' + (destination ? '' : ' empty');
  pEl.textContent = depart || 'Choisir…';
  pEl.className = 'sel-value' + (depart ? '' : ' empty');
}

function swapSelections() {
  [destination, depart] = [depart, destination];
  updateSelUI();
  updateMapHighlights();
  updateCityButtons();
}

function showCityInfo(city) {
  const info = cityInfos[city];
  const panel = document.getElementById('city-info-content');
  
  // Map city names to image files
  const cityImages = {
    "Ariana": "./assets/images/Photos_Villes/Ariana.jpeg",
    "Béja": "./assets/images/Photos_Villes/Beja.jpeg",
    "Ben Arous": "./assets/images/Photos_Villes/Ben arous.jpg",
    "Bizerte": "./assets/images/Photos_Villes/Bizerte.jpg",
    "Bousalem": "./assets/images/Photos_Villes/Bousalem.jpg",
    "Djerba": "./assets/images/Photos_Villes/Djerba.jpeg",
    "El Jem": "./assets/images/Photos_Villes/El jem.jpeg",
    "Gabès": "./assets/images/Photos_Villes/Gabes.jpeg",
    "Gafsa": "./assets/images/Photos_Villes/Gafsa.jpg",
    "Hammamet": "./assets/images/Photos_Villes/Hammamet.jpg",
    "Jendouba": "./assets/images/Photos_Villes/Jendouba.jpeg",
    "Kairouan": "./assets/images/Photos_Villes/Kairouan.jpeg",
    "Kasserine": "./assets/images/Photos_Villes/Kasserine.jpg",
    "Kébili": "./assets/images/Photos_Villes/Kebili.jpg",
    "Kélibia": "./assets/images/Photos_Villes/Kelibia.jpg",
    "Le Kef": "./assets/images/Photos_Villes/Kef.jpeg",
    "Mahdia": "./assets/images/Photos_Villes/Mahdia.jpeg",
    "La Manouba": "./assets/images/Photos_Villes/Tunis.jpeg",
    "Médenine": "./assets/images/Photos_Villes/Medenine.jpeg",
    "Monastir": "./assets/images/Photos_Villes/Monastir.jpeg",
    "Nabeul": "./assets/images/Photos_Villes/Nabeul.jpeg",
    "Sfax": "./assets/images/Photos_Villes/Sfax.jpeg",
    "Sidi Bouzid": "./assets/images/Photos_Villes/Sidibouzid.jpg",
    "Siliana": "./assets/images/Photos_Villes/Siliana.jpg",
    "Sousse": "./assets/images/Photos_Villes/Sousse.jpeg",
    "Tabarka": "./assets/images/Photos_Villes/Tabarka.jpg",
    "Tataouine": "./assets/images/Photos_Villes/Tataouine.jpeg",
    "Tozeur": "./assets/images/Photos_Villes/Tozeur.jpeg",
    "Tunis": "./assets/images/Photos_Villes/Tunis.jpeg",
    "Zaghouan": "./assets/images/Photos_Villes/Zaghouan.jpeg"
  };
  
  const imagePath = cityImages[city] || "assets/images/Photos_Villes/Tunis.jpeg";
  
  if (!info) { panel.innerHTML = '<p style="text-align:center;color:var(--muted);padding:20px;">Pas de détails disponibles.</p>'; return; }
  panel.innerHTML = `
    <img src="assets/images/Photos_Villes/${imagePath}" alt="${city}" class="city-info-photo">
    <div class="city-info-body">
      <div class="city-info-name">${city}</div>
      <p class="city-info-desc">${info.summary}</p>
      <div class="city-info-tags">${info.tags.map(t=>`<span class="city-tag">${t}</span>`).join('')}</div>
    </div>`;
}

// ══════════════════════════════════════════════════════
//  CITY GRID
// ══════════════════════════════════════════════════════
function renderCityGrid(filter) {
  const q = normalize(filter || '');
  const matches = gouvernorats.filter(v => normalize(v).includes(q));
  const container = document.getElementById('city-results');
  if (!matches.length) {
    container.innerHTML = '<p class="no-results">Aucune ville trouvée.</p>';
    return;
  }
  container.innerHTML = matches.map(ville => {
    let extra = '';
    if (ville === destination) extra = ' sel-dest';
    if (ville === depart) extra += ' sel-dep';
    const badge = ville === destination ? '<span class="city-badge">D</span>' : (ville === depart ? '<span class="city-badge">→</span>' : '');
    
    // Map city names to image files
    const cityImages = {
    "Ariana": "./assets/images/Photos_Villes/Ariana.jpeg",
    "Béja": "./assets/images/Photos_Villes/Beja.jpeg",
    "Ben Arous": "./assets/images/Photos_Villes/Ben arous.jpg",
    "Bizerte": "./assets/images/Photos_Villes/Bizerte.jpg",
    "Bousalem": "./assets/images/Photos_Villes/Bousalem.jpg",
    "Djerba": "./assets/images/Photos_Villes/Djerba.jpeg",
    "El Jem": "./assets/images/Photos_Villes/El jem.jpeg",
    "Gabès": "./assets/images/Photos_Villes/Gabes.jpeg",
    "Gafsa": "./assets/images/Photos_Villes/Gafsa.jpg",
    "Hammamet": "./assets/images/Photos_Villes/Hammamet.jpg",
    "Jendouba": "./assets/images/Photos_Villes/Jendouba.jpeg",
    "Kairouan": "./assets/images/Photos_Villes/Kairouan.jpeg",
    "Kasserine": "./assets/images/Photos_Villes/Kasserine.jpg",
    "Kébili": "./assets/images/Photos_Villes/Kebili.jpg",
    "Kélibia": "./assets/images/Photos_Villes/Kelibia.jpg",
    "Le Kef": "./assets/images/Photos_Villes/Kef.jpeg",
    "Mahdia": "./assets/images/Photos_Villes/Mahdia.jpeg",
    "La Manouba": "./assets/images/Photos_Villes/Tunis.jpeg",
    "Médenine": "./assets/images/Photos_Villes/Medenine.jpeg",
    "Monastir": "./assets/images/Photos_Villes/Monastir.jpeg",
    "Nabeul": "./assets/images/Photos_Villes/Nabeul.jpeg",
    "Sfax": "./assets/images/Photos_Villes/Sfax.jpeg",
    "Sidi Bouzid": "./assets/images/Photos_Villes/SidiBouzid.jpg",
    "Siliana": "./assets/images/Photos_Villes/Siliana.jpg",
    "Sousse": "./assets/images/Photos_Villes/Sousse.jpeg",
    "Tabarka": "./assets/images/Photos_Villes/Tabarka.jpg",
    "Tataouine": "./assets/images/Photos_Villes/Tataouine.jpeg",
    "Tozeur": "./assets/images/Photos_Villes/Tozeur.jpeg",
    "Tunis": "./assets/images/Photos_Villes/Tunis.jpeg",
    "Zaghouan": "./assets/images/Photos_Villes/Zaghouan.jpeg"
    };
    
    const imagePath = cityImages[ville] || "./assets/images/Photos_Villes/Tunis.jpeg";
    const bg = `url('${imagePath}')`;
    return `<button class="city-btn${extra}" style="background:${bg};background-size:cover;background-position:center;" onclick="handleCityClick('${ville.replace(/'/g,"\\'")}')">
      ${badge}<span>${ville}</span>
    </button>`;
  }).join('');
}

function updateCityButtons() {
  const btns = document.querySelectorAll('.city-btn');
  btns.forEach(btn => {
    const name = btn.querySelector('span').textContent;
    btn.classList.remove('sel-dest','sel-dep');
    const badge = btn.querySelector('.city-badge');
    if (badge) badge.remove();
    if (name === destination) {
      btn.classList.add('sel-dest');
      btn.insertAdjacentHTML('afterbegin','<span class="city-badge">D</span>');
    }
    if (name === depart) {
      btn.classList.add('sel-dep');
      btn.insertAdjacentHTML('afterbegin','<span class="city-badge">→</span>');
    }
  });
}

// ══════════════════════════════════════════════════════
//  CLICK HANDLER
// ══════════════════════════════════════════════════════
function handleCityClick(city) {
  if (mode === 'depart') {
    depart = city;
    showCityInfo(city);
    setMode('destination');
  } else {
    if (city === depart) { alert('Le départ et la destination ne peuvent pas être identiques !'); return; }
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



function reinitialiser() {
  mode = 'depart';
  destination = '';
  depart = '';
  updateSelUI();
  updateMapHighlights();
  setMode('depart');
  document.getElementById('search-panel').style.display = 'block';
  document.getElementById('result-panel').style.display = 'none';
  document.getElementById('result-panel').classList.remove('anim-in');
  renderCityGrid('');
}



// ══════════════════════════════════════════════════════
//  TARIFF TABLE
// ══════════════════════════════════════════════════════
function renderTarifs(filter) {
  const q = normalize(filter || '');
  const tbody = document.getElementById('tarif-body');
  const rows = tarifsVerifies.filter(t => normalize(t.trajet).includes(q));
  tbody.innerHTML = rows.map(t => `
    <tr>
      <td>${t.trajet}</td>
      <td class="tarif-price">${t.prix || '—'}</td>
      <td style="font-size:0.75rem;color:var(--muted);">${t.obs || '—'}</td>
    </tr>`).join('');
}

// ══════════════════════════════════════════════════════
//  POPULAR ROUTES
// ══════════════════════════════════════════════════════
function renderPopularRoutes() {
  const container = document.getElementById('popular-routes');
  container.innerHTML = popularRoutes.map(r => {
    const info = lignesLouage[r.from]?.[r.to];
    const prix = info ? `${info.prix} DT · ${info.temps}` : '—';
    return `<button style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--red-light);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.85rem;transition:all .15s;" 
      onmouseenter="this.style.background='#fff8f8'" onmouseleave="this.style.background='var(--red-light)'"
      onclick="quickRoute('${r.from}','${r.to}')">
      <span style="font-weight:600;color:var(--red-dark);">${r.from} → ${r.to}</span>
      <span style="color:var(--muted);font-size:0.78rem;">${prix}</span>
    </button>`;
  }).join('');
}

function quickRoute(from, to) {
  destination = to;
  depart = from;
  updateSelUI();
  updateMapHighlights();
  updateCityButtons();
  showCityInfo(to);
  calculerTrajet(from, to);
}

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Date default
  const dateInput = document.getElementById('travel-date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);

  // City search
  document.getElementById('city-search').addEventListener('input', e => renderCityGrid(e.target.value));

  // Tarif search
  document.getElementById('tarif-search').addEventListener('input', e => renderTarifs(e.target.value));

  // Mode buttons initial state
  setMode('depart');

  // Render everything
  renderCityGrid('');
  renderTarifs('');
  renderPopularRoutes();
  initMap();
});