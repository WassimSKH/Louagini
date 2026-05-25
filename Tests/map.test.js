import { describe, it, expect } from 'vitest'
import { stationCoords } from '../js/map.js'

describe('stationCoords — coordonnées GPS', () => {
  it('toutes les stations ont des coordonnées valides', () => {
    Object.entries(stationCoords).forEach(([station, coords]) => {
      const [lat, lng] = coords
      // Tunisie : lat entre 30 et 38, lng entre 7 et 12
      expect(lat, `${station} lat invalide`).toBeGreaterThan(30)
      expect(lat, `${station} lat invalide`).toBeLessThan(38)
      expect(lng, `${station} lng invalide`).toBeGreaterThan(7)
      expect(lng, `${station} lng invalide`).toBeLessThan(12)
    })
  })

  it('les stations de Tunis existent', () => {
    expect(stationCoords['Moncef Bey']).toBeDefined()
    expect(stationCoords['Bab Saadoun']).toBeDefined()
    expect(stationCoords['Bab Alioua']).toBeDefined()
  })

  it('pas de coordonnées dupliquées pour des stations différentes', () => {
    const coordStrings = Object.values(stationCoords).map(c => c.join(','))
    const unique = new Set(coordStrings)
    expect(unique.size).toBe(coordStrings.length)
  })
})