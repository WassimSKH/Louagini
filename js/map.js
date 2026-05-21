// ══════════════════════════════════════════════════════
//  SVG MAP
// ══════════════════════════════════════════════════════
function initMap() {
  const svg = document.getElementById('tunisia-map');
  const tooltip = document.getElementById('map-tooltip');
  const paths = svg.querySelectorAll('.gov-path');

  paths.forEach(path => {
    const govName = path.getAttribute('data-gov');
    path.addEventListener('mouseenter', (e) => {
      tooltip.textContent = govName;
      tooltip.style.opacity = '1';
    });
    path.addEventListener('mousemove', (e) => {
      const rect = svg.parentElement.getBoundingClientRect();
      tooltip.style.left = (e.clientX - rect.left + 10) + 'px';
      tooltip.style.top = (e.clientY - rect.top - 30) + 'px';
    });
    path.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
    path.addEventListener('click', () => { handleCityClick(govName); });
  });
}

function updateMapHighlights() {
  const paths = document.querySelectorAll('#tunisia-map .gov-path');
  paths.forEach(p => {
    const g = p.getAttribute('data-gov');
    p.classList.remove('sel-dest','sel-dep');
    if (g === destination) p.classList.add('sel-dest');
    if (g === depart) p.classList.add('sel-dep');
  });
}