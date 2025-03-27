# Collaborateurs & Projets – Gestion des Jours Travaillés & TJM

## Description

Cette application web permet de **gérer les collaborateurs** d'une entreprise ainsi que leur **temps de travail** mensuel sur différents projets. Elle offre également la possibilité d'attribuer un **TJM (Taux Journalier Moyen)** à chaque collaborateur pour estimer les coûts projetés par mois.

Elle est conçue pour :
- Suivre les **jours travaillés par projet et par mois**.
- Ajouter, modifier et supprimer des collaborateurs.
- Attribuer un ou plusieurs projets à chaque collaborateur.
- Définir et mettre à jour un **TJM** pour chaque personne.
- Ajouter des **commentaires mensuels** liés à l'activité du collaborateur.
- Consulter un **bilan mensuel détaillé** pour chaque collaborateur.

---

## Technologies Utilisées

### Frontend
- **React** (avec Hooks)
- **TypeScript**
- **Tailwind CSS** – pour un design responsive rapide
- **Framer Motion** – pour les animations douces
- **React Toastify** – notifications toast

### Backend
- **Node.js** avec **Express.js**
- **MongoDB** – base de données NoSQL pour stocker collaborateurs, projets et charges
- **Mongoose** – ODM pour MongoDB

---

## Fonctionnalités Clés

- **Vue mensuelle** des jours travaillés par collaborateur
- **Ajout de nouveaux collaborateurs** avec sélection de projets et TJM
- **Modification en ligne** des projets, noms et TJM
- **Filtrage par mois & année**
- **Commentaires personnalisés** par collaborateur et par mois
- **Calcul automatique** du TJM total pour le mois
- **Suppression** d’un collaborateur

---

## Structure Principale

```
/src
  └── components/
  └── pages/
  └── App.tsx

/backend
  └── controllers/
  └── models/
  └── routes/
  └── server.ts
```

---

## 🚀 Lancement de l'application

### 1. Backend
```bash
cd backend
npm install
npm start
```

### 2. Frontend
```bash
cd src
npm install
npm start
```

---

## Authentification

Pour le moment, l'application ne gère pas d'authentification. Une future version pourra intégrer une couche de sécurité via JWT ou OAuth2.

---

## Auteur

Développé par **Romain MARCELLI**
