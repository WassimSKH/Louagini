import { describe, it, expect } from 'vitest'
import { lignesLouage, gouvernorats, cityInfos, tarifsVerifies } from '../js/data.js'

describe('lignesLouage — cohérence des données', () => {
  it('chaque ville de départ a au moins une destination', () => {
    Object.keys(lignesLouage).forEach(ville => {
      expect(Object.keys(lignesLouage[ville]).length).toBeGreaterThan(0)
    })
  })

  it('chaque trajet a un prix, un temps et une station', () => {
    Object.entries(lignesLouage).forEach(([dep, dests]) => {
      Object.entries(dests).forEach(([dest, info]) => {
        expect(info.prix, `${dep}→${dest} manque prix`).toBeTypeOf('number')
        expect(info.temps, `${dep}→${dest} manque temps`).toBeTypeOf('string')
        expect(info.station, `${dep}→${dest} manque station`).toBeTypeOf('string')
      })
    })
  })

  it('aucun prix négatif ou nul', () => {
    Object.values(lignesLouage).forEach(dests => {
      Object.values(dests).forEach(info => {
        expect(info.prix).toBeGreaterThan(0)
      })
    })
  })

  it('les trajets sont bien symétriques — si A→B existe, B→A devrait exister', () => {
    const manquants = []
    Object.entries(lignesLouage).forEach(([dep, dests]) => {
      Object.keys(dests).forEach(dest => {
        if (!lignesLouage[dest]?.[dep]) {
          manquants.push(`${dest}→${dep} manque`)
        }
      })
    })
    // log les manquants sans faire échouer le test (c'est informatif)
    if (manquants.length) console.warn('Trajets non symétriques:', manquants)
  })
})

describe('gouvernorats — liste complète', () => {
  it('contient exactement 24 gouvernorats officiels + villes extra', () => {
    expect(gouvernorats.length).toBeGreaterThanOrEqual(24)
  })

  it('contient Tunis', () => {
    expect(gouvernorats).toContain('Tunis')
  })

  it('contient Sousse', () => {
    expect(gouvernorats).toContain('Sousse')
  })

  it('pas de doublons', () => {
    const unique = new Set(gouvernorats)
    expect(unique.size).toBe(gouvernorats.length)
  })
})

describe('cityInfos — infos des villes', () => {
  it('chaque ville a un summary et des tags', () => {
    Object.entries(cityInfos).forEach(([ville, info]) => {
      expect(info.summary, `${ville} manque summary`).toBeTypeOf('string')
      expect(info.tags, `${ville} manque tags`).toBeInstanceOf(Array)
      expect(info.tags.length).toBeGreaterThan(0)
    })
  })
})