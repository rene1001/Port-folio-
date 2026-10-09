# DevPortfolio CMS — Portfolio Professionnel & Espace Administrateur

Portfolio moderne, élégant, ultra-rapide et optimisé pour le référencement naturel (SEO), conçu pour un **Ingénieur en Informatique spécialisé en Génie Logiciel et Systèmes Distribués**.

L'application intègre un **véritable système de gestion de contenu (CMS)** permettant à l'administrateur de gérer l'intégralité du site en direct depuis l'interface `/admin`, sans toucher à une seule ligne de code.

---

## Fonctionnalités Principales

### 🌐 Site Public
- **Accueil** : Présentation professionnelle, statistiques techniques clés (années d'expérience, projets livrés, requêtes/jour, uptime), projets à la une, services, compétences par jauges, derniers articles de blog, et formulaire de contact direct.
- **À propos (`/a-propos`)** : Parcours détaillé, philosophie d'ingénierie, timeline des expériences professionnelles, timeline des formations et diplômes, téléchargement direct du CV.
- **Projets (`/projets`)** : Recherche instantanée, filtrage par technologie, filtrage par catégorie, filtrage par année.
- **Détail d'un projet (`/projets/:slug`)** : Image hero, galerie d'images avec zoom lightbox, problématique, solution technique, fonctionnalités développées, stack technologique, liens live et GitHub.
- **Blog (`/blog`)** : Recherche d'articles en direct, filtres par catégorie et tags, temps de lecture, dates.
- **Détail d'un article (`/blog/:slug`)** : Article technique complet avec blocs de code stylisés, citations, boutons de partage (LinkedIn, X, Copier le lien) et articles similaires.
- **Contact (`/contact`)** : Formulaire interactif avec enregistrement direct en base de données et notification immédiate.
- **SEO & Référencement** : Sitemap XML (`/sitemap.xml`), fichier `robots.txt`, balises OpenGraph, Twitter Cards et données structurées Schema.org (Person).

### 🛠️ Espace Administrateur (`/admin`)
- **Tableau de Bord** : Métriques en temps réel (total projets, publiés vs brouillons, articles, messages non lus, compétences, services) et flux d'activité récente.
- **Gestion des Projets (CRUD)** : Ajout, modification, suppression, bascule instantanée publié/brouillon, mise en avant à la une, téléversement d'images, galerie multi-photos, aperçu avant publication.
- **Gestion des Articles (CRUD)** : Éditeur enrichi avec boutons pour titres H1/H2/H3, gras, italique, citations, blocs de code, listes, liens, images et tableaux. Prévisualisation en direct.
- **Gestion des Compétences** : Groupement par catégories (Frontend, Backend, Bases de données, DevOps, Architecture & IA), ajustement des niveaux de 0 à 100%, réorganisation.
- **Gestion des Services** : CRUD complet des prestations et expertises proposées.
- **Gestion du Parcours** : CRUD des expériences professionnelles et des diplômes avec timeline dynamique.
- **Boîte de Réception des Messages** : Consultation des demandes envoyées via le formulaire, marquage en lu / traité, réponse par email en 1 clic.
- **Médiathèque** : Téléversement sécurisé d'images (JPG, PNG, WebP, SVG) et de documents PDF (CV) avec copie de lien instantanée.
- **Gestion du Profil & Réseaux** : Modification du nom, biographie, coordonnées, réseaux sociaux (GitHub, LinkedIn, X, site web) et disponibilité.
- **Paramètres & Sécurité** : Configuration SEO globale, Google Analytics 4, changement du mot de passe admin, et réinitialisation sécurisée des données de démonstration.

---

## Identifiants de Démonstration Administrateur

Pour tester immédiatement l'espace administrateur :
- **URL** : `/admin` ou `/admin/login`
- **Email** : `admin@portfolio.dev`
- **Mot de passe** : `admin1234`
*(Un bouton "Remplir les identifiants démo" est également présent sur la page de connexion)*

---

## Architecture & Technologies

### Frontend
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (icônes)
- **Architecture de composants modulaires** (`src/components/`, `src/pages/`, `src/router/`, `src/contexts/`, `src/services/`)

### Backend & API REST
- **Node.js & Express**
- **Base de données persistante** (`data/database.json`) avec écritures atomiques sécurisées et seeders initiaux
- **Authentification par jetons de session** et hachage sécurisé des mots de passe (PBKDF2 / SHA-512)
- **Gestionnaire de fichiers** (`/data/uploads`) servi statiquement via `/uploads/*`
- **Génération dynamique de Sitemap XML et Robots.txt**

---

## Installation & Lancement

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application est accessible sur `http://localhost:3000`.

3. **Compiler pour la production** :
   ```bash
   npm run build
   npm start
   ```

---

## Variables d'Environnement (`.env`)

Voir `.env.example` :
```env
APP_URL="http://localhost:3000"
VITE_GA_MEASUREMENT_ID=""
ADMIN_EMAIL="admin@portfolio.dev"
SESSION_SECRET="super-secret-key-change-in-production"
```
