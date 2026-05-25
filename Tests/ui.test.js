// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setMode, updateSelUI, swapSelections, normalize, reinitialiser } from '../js/ui.js'

// ── Mock des fonctions externes à ui.js ──────────────────
// Ces fonctions viennent de map.js et sont appelées par ui.js
// On les simule pour ne pas avoir à importer map.js
globalThis.updateMapHighlights = vi.fn();
globalThis.updateCityButtons   = vi.fn();
globalThis.renderCityGrid      = vi.fn();
globalThis.renderTarifs        = vi.fn();
globalThis.renderPopularRoutes = vi.fn();
globalThis.initMap             = vi.fn();
globalThis.cacherCarteLeaflet  = vi.fn();

// ── Setup DOM avant chaque test ───────────────────────────
beforeEach(() => {
  document.body.innerHTML = `
    <button id="btn-dep"></button>
    <button id="btn-dest"></button>
    <div id="sel-dep-box"></div>
    <div id="sel-dest-box"></div>
    <span id="sel-dep" class="sel-value empty">Choisir…</span>
    <span id="sel-dest" class="sel-value empty">Choisir…</span>
    <span id="step-indicator"></span>
    <div id="search-panel" style="display:block;"></div>
    <div id="result-panel" style="display:none;"></div>
    <div id="map-leaflet" style="display:none;"></div>
    <div id="city-results"></div>
    <div id="tarif-body"></div>
    <div id="popular-routes"></div>
    <input id="tarif-search">
    <input id="city-search">
    <input id="travel-date" type="date">
    <select id="passengers">
      <option value="1">1</option>
      <option value="2">2</option>
    </select>
  `
  // Reset les variables globales avant chaque test
  globalThis.mode        = 'depart'
  globalThis.depart      = ''
  globalThis.destination = ''

  // Reset les mocks
  vi.clearAllMocks()
})


// ══════════════════════════════════════════════════════
//  1. normalize()
// ══════════════════════════════════════════════════════
describe('normalize()', () => {
  it('met en minuscule', () => {
    expect(normalize('TUNIS')).toBe('tunis')
  })

  it('supprime les accents', () => {
    expect(normalize('Béja')).toBe('beja')
    expect(normalize('Gabès')).toBe('gabes')
    expect(normalize('Kébili')).toBe('kebili')
  })

  it('gère une chaîne vide', () => {
    expect(normalize('')).toBe('')
  })

  it('gère null et undefined', () => {
    expect(normalize(null)).toBe('')
    expect(normalize(undefined)).toBe('')
  })

  it('supprime les caractères spéciaux', () => {
    expect(normalize('Le Kef!')).toBe('le kef')
  })
})


// ══════════════════════════════════════════════════════
//  2. setMode()
// ══════════════════════════════════════════════════════
describe('setMode()', () => {
  it('active le bouton départ quand mode = depart', () => {
    setMode('depart')
    expect(document.getElementById('btn-dep').classList.contains('active')).toBe(true)
  })

  it('désactive le bouton destination quand mode = depart', () => {
    setMode('depart')
    expect(document.getElementById('btn-dest').classList.contains('active')).toBe(false)
  })

  it('active le bouton destination quand mode = destination', () => {
    setMode('destination')
    expect(document.getElementById('btn-dest').classList.contains('active')).toBe(true)
  })

  it('met à jour le step-indicator pour depart', () => {
    setMode('depart')
    expect(document.getElementById('step-indicator').textContent).toContain('départ')
  })

  it('met à jour le step-indicator pour destination', () => {
    setMode('destination')
    expect(document.getElementById('step-indicator').textContent).toContain('destination')
  })

  it('ajoute active-sel sur la bonne boîte', () => {
    setMode('depart')
    expect(document.getElementById('sel-dep-box').classList.contains('active-sel')).toBe(true)
    expect(document.getElementById('sel-dest-box').classList.contains('active-sel')).toBe(false)
  })
})


// ══════════════════════════════════════════════════════
//  3. updateSelUI()
// ══════════════════════════════════════════════════════
describe('updateSelUI()', () => {
  it('affiche le nom de la ville de départ', () => {
    globalThis.depart      = 'Tunis'
    globalThis.destination = ''
    updateSelUI()
    expect(document.getElementById('sel-dep').textContent).toBe('Tunis')
  })

  it('affiche Choisir… quand aucune ville sélectionnée', () => {
    globalThis.depart      = ''
    globalThis.destination = ''
    updateSelUI()
    expect(document.getElementById('sel-dep').textContent).toBe('Choisir…')
    expect(document.getElementById('sel-dest').textContent).toBe('Choisir…')
  })

  it('affiche la destination choisie', () => {
    globalThis.depart      = 'Tunis'
    globalThis.destination = 'Sfax'
    updateSelUI()
    expect(document.getElementById('sel-dest').textContent).toBe('Sfax')
  })

  it('ajoute la classe empty quand pas de ville', () => {
    globalThis.depart      = ''
    globalThis.destination = ''
    updateSelUI()
    expect(document.getElementById('sel-dep').classList.contains('empty')).toBe(true)
  })

  it('retire la classe empty quand ville choisie', () => {
    globalThis.depart      = 'Sousse'
    globalThis.destination = ''
    updateSelUI()
    expect(document.getElementById('sel-dep').classList.contains('empty')).toBe(false)
  })
})


// ══════════════════════════════════════════════════════
//  4. swapSelections()
// ══════════════════════════════════════════════════════
describe('swapSelections()', () => {
  it('échange départ et destination', () => {
    globalThis.depart      = 'Tunis'
    globalThis.destination = 'Sfax'
    swapSelections()
    expect(globalThis.depart).toBe('Sfax')
    expect(globalThis.destination).toBe('Tunis')
  })

  it('fonctionne quand destination est vide', () => {
    globalThis.depart      = 'Tunis'
    globalThis.destination = ''
    swapSelections()
    expect(globalThis.depart).toBe('')
    expect(globalThis.destination).toBe('Tunis')
  })

  it('fonctionne quand les deux sont vides', () => {
    globalThis.depart      = ''
    globalThis.destination = ''
    swapSelections()
    expect(globalThis.depart).toBe('')
    expect(globalThis.destination).toBe('')
  })

  it('met à jour l\'affichage après le swap', () => {
    globalThis.depart      = 'Tunis'
    globalThis.destination = 'Sfax'
    swapSelections()
    expect(document.getElementById('sel-dep').textContent).toBe('Sfax')
    expect(document.getElementById('sel-dest').textContent).toBe('Tunis')
  })
})


// ══════════════════════════════════════════════════════
//  5. reinitialiser()
// ══════════════════════════════════════════════════════
describe('reinitialiser()', () => {
  it('remet les variables à vide', () => {
    globalThis.depart      = 'Tunis'
    globalThis.destination = 'Sfax'
    reinitialiser()
    expect(globalThis.depart).toBe('')
    expect(globalThis.destination).toBe('')
  })

  it('remet le mode sur depart', () => {
    reinitialiser()
    expect(globalThis.mode).toBe('depart')
  })

  it('cache le panneau résultat', () => {
    const panel = document.getElementById('result-panel')
    panel.style.display = 'block'
    reinitialiser()
    expect(panel.style.display).toBe('none')
  })

  it('réaffiche le panneau de recherche', () => {
    const panel = document.getElementById('search-panel')
    panel.style.display = 'none'
    reinitialiser()
    expect(panel.style.display).toBe('block')
  })
})