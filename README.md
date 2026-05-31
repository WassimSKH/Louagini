# Louagi — Louage Tunisie

Louagi est un mini-site interactif pour trouver des trajets de louage en Tunisie.
Il permet de sélectionner un départ et une destination, de voir les correspondances, et d'afficher une carte de trajet.

## ✅ Fonctionnalités

- Recherche de villes et sélection de départ/destination
- Calcul de trajet direct ou avec correspondance
- Carte interactive des gouvernorats de Tunisie
- Affichage des tarifs vérifiés
- Résultats dynamiques et réinitialisation facile

## 🚀 Installation


```bash
cd C:\Users\LENOV\Louagini
npm install
```

## ▶️ Démarrage local

Pour lancer un serveur local et ouvrir le site :

```bash
npm start
```

Puis :

```text
http://localhost:8080
```

## 🧪 Tests

La suite de tests avec Vitest :

```bash
npm test
```

## 📁 Structure du projet

- `index.html` — page principale
- `Css/Style.css` — styles du site
- `js/` — scripts front-end
- `assets/images/Photos_Villes/` — images des villes
- `Tests/` — tests unitaires
- `js-test/` — code de test côté Node

## 🛠️ Améliorations apportées

- Ajout d'un script `npm start` avec serveur local
- Nettoyage de fichiers JS pour supprimer des exports CommonJS invalides
- Ajout d'un helper `cacherCarteLeaflet()` pour fermer proprement la carte au reset
- Ajout d'une documentation `README.md`
- Ajout d'un fichier `.gitignore`

## 💡 Astuce

Le site fonctionne également en ouvrant directement `index.html` si vous préférez ne pas lancer de serveur.
