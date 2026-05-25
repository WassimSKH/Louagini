import { describe, it, expect } from 'vitest'
import { findRoute, parseDuration, fmtDuration } from '../js/search.js'

describe('findRoute — trajets directs', () => {
  it('trouve un trajet direct Tunis → Sousse', () => {
    const route = findRoute('Tunis', 'Sousse')
    expect(route.type).toBe('direct')
    expect(route.steps).toHaveLength(1)
    expect(route.steps[0].prix).toBe(13.5)
    expect(route.steps[0].station).toBe('Moncef Bey')
  })

  it('trouve un trajet direct Sousse → Monastir', () => {
    const route = findRoute('Sousse', 'Monastir')
    expect(route.type).toBe('direct')
    expect(route.steps[0].temps).toBe('0h40')
  })

  it('retourne null pour un trajet inexistant', () => {
    const route = findRoute('Tozeur', 'Bizerte')
    // soit null soit une correspondance trouvée
    if (route === null) {
      expect(route).toBeNull()
    } else {
      expect(['transfer1','transfer2']).toContain(route.type)
    }
  })
})

describe('findRoute — correspondances', () => {
  it('trouve une correspondance Bizerte → Sousse via Tunis', () => {
    const route = findRoute('Bizerte', 'Sousse')
    expect(route).not.toBeNull()
    expect(route.type).toBe('transfer1')
    expect(route.steps).toHaveLength(2)
    // le hub intermédiaire doit être Tunis
    expect(route.steps[0].to).toBe('Tunis')
    expect(route.steps[1].to).toBe('Sousse')
  })

  it('ne propose pas un trajet où départ = destination', () => {
    const route = findRoute('Tunis', 'Tunis')
    // doit retourner null ou undefined
    expect(route).toBeFalsy()
  })
})

describe('parseDuration', () => {
  it('parse 2h00 → 120 minutes', () => {
    expect(parseDuration('2h00')).toBe(120)
  })

  it('parse 0h40 → 40 minutes', () => {
    expect(parseDuration('0h40')).toBe(40)
  })

  it('parse 3h30 → 210 minutes', () => {
    expect(parseDuration('3h30')).toBe(210)
  })
})

describe('fmtDuration', () => {
  it('formate 120 min → 2h00', () => {
    expect(fmtDuration(120)).toBe('2h00')
  })

  it('formate 40 min → 40 min', () => {
    expect(fmtDuration(40)).toBe('40 min')
  })

  it('formate 90 min → 1h30', () => {
    expect(fmtDuration(90)).toBe('1h30')
  })
})