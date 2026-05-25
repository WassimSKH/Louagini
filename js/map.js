// ══════════════════════════════════════════════════════
//  SVG MAP
// ══════════════════════════════════════════════════════
export function initMap() {
  const svg     = document.getElementById('tunisia-map');
  const tooltip = document.getElementById('map-tooltip');
  const hint    = document.getElementById('map-click-hint');

  svg.querySelectorAll('.gov-path').forEach(path => {
    const govName = path.getAttribute('data-gov');

    path.addEventListener('mouseenter', () => {
      tooltip.textContent  = '📍 ' + govName;
      tooltip.style.opacity = '1';
    });

    path.addEventListener('mousemove', e => {
      const rect = svg.parentElement.getBoundingClientRect();
      tooltip.style.left = (e.clientX - rect.left + 14) + 'px';
      tooltip.style.top  = (e.clientY - rect.top  - 36) + 'px';
    });

    path.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });

    path.addEventListener('click', () => {
      if (hint) hint.style.display = 'none';
      handleCityClick(govName);
    });
  });
}

export function updateMapHighlights() {
  const paths = document.querySelectorAll('#tunisia-map .gov-path');
  paths.forEach(p => {
    const g = p.getAttribute('data-gov');
    p.classList.remove('sel-dest','sel-dep');
    if (g === destination) p.classList.add('sel-dest');
    if (g === depart) p.classList.add('sel-dep');
  });
}

export const stationCoords = {
  "Moncef Bey":        [36.8065, 10.1815],
  "Bab Saadoun":       [36.8198, 10.1654],
  "Bab Alioua":        [36.7967, 10.1856],
  "Station Sousse":    [35.8256, 10.6370],
  "Station Sousse Nord":[35.8300, 10.6350],
  "Station Sfax":      [34.7406, 10.7603],
  "Station Gabès":     [33.8815, 10.0998],
  "Station Nabeul":    [36.4511, 10.7369],
  "Station Bizerte":   [37.2744,  9.8739],
  "Station Kairouan":  [35.6781, 10.0963],
  "Station Monastir":  [35.7773, 10.8264],
  "Station Mahdia":    [35.5047, 11.0626],
  "Station Jendouba":  [36.5013,  8.7805],
  "Station Le Kef":    [36.1716,  8.7065],
  "Station Hammamet":  [36.4000, 10.6100],
  "Station Zaghouan":  [36.4012, 10.1438],
  "Station Tozeur":    [33.9197,  8.1335],
  "Station Kébili":    [33.7036,  8.9686],
  "Station Médenine":  [33.3548, 10.5050],
  "Station Kasserine": [35.1678,  8.8368],
  "Station Gafsa":     [34.4258,  8.7840],
  "Station Béja":      [36.7333,  9.1833],
};

export let leafletMap = null;

export function afficherCarteLeaflet(steps) {
  const panel = document.getElementById('map-leaflet');
  panel.style.display = 'block';

  // Détruire la carte précédente si elle existe
  if (leafletMap) { leafletMap.remove(); leafletMap = null; }

  leafletMap = L.map('map-leaflet');

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(leafletMap);

  const points = [];

  steps.forEach((step, i) => {
    const coord = stationCoords[step.station];
    if (!coord) return;
    points.push(coord);

    // Marqueur coloré selon départ ou correspondance
    const couleur = i === 0 ? '🟡' : (i === steps.length - 1 ? '🟢' : '🔴');
    L.marker(coord)
      .addTo(leafletMap)
      .bindPopup(`<strong>${couleur} ${step.station}</strong><br>${step.from} → ${step.to}<br>💰 ${step.prix} DT · ⏱ ${step.temps}`);
  });

  // Tracer la ligne entre les stations
  if (points.length >= 2) {
    L.polyline(points, { color: '#c81a24', weight: 4, dashArray: '8,6' }).addTo(leafletMap);
  }

  // Centrer la carte sur tous les points
  leafletMap.fitBounds(points, { padding: [30, 30] });
}
if (typeof module !== 'undefined') {
  module.exports = { maFonction };
}