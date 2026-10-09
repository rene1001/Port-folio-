import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  Project,
  Post,
  Skill,
  Service,
  Experience,
  Education,
  Profile,
  ContactMessage,
  SiteSettings,
  MediaItem,
} from '../src/types.ts';

export interface DatabaseSchema {
  admin: {
    id: string;
    email: string;
    passwordHash: string;
    salt: string;
    name: string;
    role: string;
  };
  profile: Profile;
  settings: SiteSettings;
  projects: Project[];
  posts: Post[];
  skills: Skill[];
  services: Service[];
  experiences: Experience[];
  educations: Education[];
  messages: ContactMessage[];
  media: MediaItem[];
  activities: Array<{
    id: string;
    type: 'project_created' | 'project_updated' | 'post_created' | 'post_published' | 'message_received';
    title: string;
    timestamp: string;
  }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function createInitialDatabase(): DatabaseSchema {
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const defaultPasswordHash = hashPassword('admin1234', adminSalt);

  return {
    admin: {
      id: 'admin_1',
      email: 'admin@portfolio.dev',
      passwordHash: defaultPasswordHash,
      salt: adminSalt,
      name: 'Alexandre Mercier',
      role: 'superadmin',
    },
    profile: {
      name: 'Alexandre Mercier',
      title: 'Ingénieur en Informatique & Architecte Logiciel',
      tagline: 'Je conçois des systèmes distribués robustes, des APIs performantes et des interfaces web modernes.',
      bio: "Diplômé d'école d'ingénieurs avec plus de 6 ans d'expérience en ingénierie logicielle, je suis passionné par l'architecture des systèmes, la scalabilité et les interfaces fluides. J'accompagne entreprises et startups dans la conception de solutions sur mesure, allant du backend haute disponibilité jusqu'au frontend réactif.",
      email: 'contact@alexandre-mercier.dev',
      phone: '+33 6 12 34 56 78',
      location: 'Paris, France (Disponible en remote)',
      availableForWork: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      resumeUrl: '#',
      social: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        website: 'https://alexandre-mercier.dev',
      },
    },
    settings: {
      siteTitle: 'Alexandre Mercier — Portfolio Ingénieur Logiciel',
      siteDescription: 'Portfolio professionnel et blog technique d’Alexandre Mercier, ingénieur logiciel spécialisé en systèmes distribués, React, Node.js et MySQL.',
      gaMeasurementId: '',
      maintenanceMode: false,
      primaryLanguage: 'fr',
    },
    projects: [
      {
        id: 'proj_1',
        title: 'CloudMetrics Platform',
        slug: 'cloudmetrics-platform',
        shortDescription: 'Plateforme SaaS d’observabilité distribuée, télémétrie et métriques temps réel pour microservices.',
        fullDescription: `CloudMetrics est une solution complète d'observabilité conçue pour agréger des millions d'événements par seconde. Elle fournit des tableaux de bord interactifs en temps réel, un système d'alerte basé sur des seuils statistiques et un traçage distribué des requêtes inter-services.`,
        problem: "Les équipes d'infrastructure manquaient d'une vue unifiée entre les logs, les métriques Prometheus et les traces distribuées, provoquant des temps de diagnostic (MTTR) trop longs lors des incidents.",
        solution: "Développement d'un pipeline d'ingestion asynchrone capable d'absorber des pics de charge élevés, couplé à une interface React ultra-fluide avec graphiques temps réel et filtres avancés.",
        mainImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80'
        ],
        category: 'Architecture & SaaS',
        technologies: ['React', 'TypeScript', 'Node.js', 'Go', 'Docker', 'PostgreSQL', 'Tailwind CSS'],
        features: [
          'Ingestion de métriques via API gRPC & REST haute cadence',
          'Tableaux de bord personnalisables avec rafraîchissement sous 500ms',
          'Système d’alertes multi-canaux (Slack, Webhooks, PagerDuty)',
          'Gestion des droits d’accès basée sur les rôles (RBAC)'
        ],
        year: '2025',
        client: 'FinTech Enterprise',
        role: 'Architecte Logiciel & Développeur Principal',
        url: 'https://example.com/cloudmetrics',
        github: 'https://github.com/example/cloudmetrics',
        status: 'published',
        featured: true,
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-02-01T14:30:00Z',
        metaTitle: 'CloudMetrics Platform — Plateforme d’Observabilité Microservices',
        metaDescription: 'Découvrez la conception et l’architecture distribuée de CloudMetrics Platform par Alexandre Mercier.',
        metaKeywords: 'microservices, observabilité, monitoring, react, nodejs, architecture'
      },
      {
        id: 'proj_2',
        title: 'Nexus Commerce Engine',
        slug: 'nexus-commerce-engine',
        shortDescription: 'Moteur e-commerce headless modulaire avec gestion intelligente des stocks et paiements sécurisés.',
        fullDescription: `Nexus Commerce Engine est un moteur headless moderne bâti pour supporter de fortes variations de trafic lors des ventes flash. Il sépare strictement la gestion du catalogue, le panier distribué et le processus de checkout multi-devises.`,
        problem: "L'ancien CMS monolithique s'effondrait lors des pics de fréquentation et limitait les intégrations personnalisées avec l'ERP logistique.",
        solution: "Migration vers une architecture headless en microservices REST, mise en cache distribuée avec Redis et intégration de webhooks idempotents pour les paiements Stripe.",
        mainImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
        ],
        category: 'E-commerce & Web',
        technologies: ['React', 'Laravel', 'PHP', 'MySQL', 'Redis', 'Stripe', 'Tailwind CSS'],
        features: [
          'Moteur de recherche produits instantané avec filtres multiples',
          'Gestion des stocks en temps réel avec verrouillage optimiste',
          'Tunnel d’achat ultra-rapide optimisé pour le taux de conversion',
          'Backoffice complet pour la gestion des commandes et retours'
        ],
        year: '2024',
        client: 'Marque Retail Internationale',
        role: 'Tech Lead Backend & Intégrateur Stripe',
        url: 'https://example.com/nexus',
        github: 'https://github.com/example/nexus-commerce',
        status: 'published',
        featured: true,
        createdAt: '2024-09-10T09:00:00Z',
        updatedAt: '2024-11-20T16:00:00Z',
        metaTitle: 'Nexus Commerce Engine — Moteur Headless E-commerce',
        metaDescription: 'Architecture et réalisation d’un moteur e-commerce headless résilient sous Laravel et React.',
        metaKeywords: 'ecommerce, laravel, headless, react, mysql, stripe'
      },
      {
        id: 'proj_3',
        title: 'DevPulse Code Inspector',
        slug: 'devpulse-code-inspector',
        shortDescription: 'Outil d’analyse statique de code et de conformité de sécurité intégré aux pipelines GitHub Actions.',
        fullDescription: `DevPulse inspecte automatiquement les commits et pull requests pour détecter les failles de sécurité courantes (injections SQL, secrets exposés, dépendances vulnérables) et la dette technique avant chaque mise en production.`,
        problem: "Les revues de code manuelles prenaient un temps considérable pour vérifier des règles syntaxiques et de sécurité élémentaires.",
        solution: "Création d'un bot CLI et webhook automatisé générant des rapports synthétiques avec suggestions directes de correction inline dans GitHub.",
        mainImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
        ],
        category: 'DevOps & Sécurité',
        technologies: ['TypeScript', 'Node.js', 'Docker', 'GitHub Actions', 'Linux'],
        features: [
          'Analyse AST (Abstract Syntax Tree) multi-langages',
          'Détection automatique des tokens et clés API dans les commits',
          'Rapports d’audit exportables en PDF et JSON',
          'Intégration transparente dans les pipelines CI/CD'
        ],
        year: '2024',
        client: 'Projet Open Source & Pro',
        role: 'Créateur & Développeur Principal',
        url: 'https://example.com/devpulse',
        github: 'https://github.com/example/devpulse',
        status: 'published',
        featured: true,
        createdAt: '2024-04-12T11:00:00Z',
        updatedAt: '2024-06-18T18:00:00Z',
        metaTitle: 'DevPulse Code Inspector — Audit de Sécurité Automatisé',
        metaDescription: 'Outil d’analyse de sécurité et d’audit de code automatisé pour équipes logicielles.',
        metaKeywords: 'devops, sécurité, cicd, typescript, github actions'
      }
    ],
    posts: [
      {
        id: 'post_1',
        title: 'Concevoir des architectures résilientes en microservices : guide pratique',
        slug: 'concevoir-des-architectures-resilientes-en-microservices',
        excerpt: 'Découvrez comment implémenter des patrons de conception essentiels comme le Circuit Breaker, le Retry avec Exponential Backoff et l’idempotence des requêtes.',
        content: `## Introduction

Dans un monde où la disponibilité des services est un impératif commercial absolu, concevoir des systèmes capables de tolérer les pannes partielles n'est plus une option.

Lorsque nous découpons une application monolithique en plusieurs microservices, nous remplaçons les appels de fonctions locaux par des appels réseau. Or, le réseau est faillible : latence variable, coupures temporaires et congestion.

---

### 1. Le pattern Circuit Breaker

Le patron Circuit Breaker empêche une application d'effectuer continuellement une opération vouée à l'échec. Il fonctionne comme un disjoncteur électrique :

- **Closed** : Les requêtes transitent normalement.
- **Open** : Lorsque le taux d'erreur dépasse un seuil critique, le disjoncteur s'ouvre et renvoie immédiatement une erreur ou une réponse dégradée sans solliciter le service défaillant.
- **Half-Open** : Après un délai déterminé, un nombre restreint de requêtes test est autorisé pour vérifier le rétablissement du service.

\`\`\`typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private readonly threshold = 5;

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      throw new Error('Service temporairement indisponible (Circuit Breaker OPEN)');
    }
    try {
      const result = await action();
      this.reset();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }
}
\`\`\`

---

### 2. Retry avec Exponential Backoff et Jitter

Répéter immédiatement une requête ayant échoué risque de surcharger davantage un service déjà sous pression. L'utilisation d'un délai exponentiel aléatoire (Jitter) permet d'étaler la charge.

### 3. L'importance capitale de l'idempotence

Une requête réseau peut réussir côté serveur mais échouer lors du renvoi de la réponse au client. Sans idempotence, rejouer un paiement ou une création de commande entraîne des duplications catastrophiques.

Utilisez systématiquement des **Idempotency Keys** associées aux opérations critiques !

---

## Conclusion

La résilience ne consiste pas à éviter toute panne, mais à garantir que le système continue d'opérer avec un mode dégradé élégant lorsque des composants tombent en panne.`,
        mainImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        category: 'Architecture Logicielle',
        tags: ['Microservices', 'Résilience', 'Design Patterns', 'Cloud'],
        author: 'Alexandre Mercier',
        readingTime: '6 min',
        status: 'published',
        publishedAt: '2025-02-10T08:00:00Z',
        createdAt: '2025-02-09T14:00:00Z',
        updatedAt: '2025-02-10T08:00:00Z',
        metaTitle: 'Architectures Résilientes en Microservices — Alexandre Mercier',
        metaDescription: 'Comprendre et implémenter le Circuit Breaker, le Retry exponentiel et l’idempotence dans vos systèmes distribués.'
      },
      {
        id: 'post_2',
        title: 'Optimiser les performances d’une base de données MySQL à fort trafic',
        slug: 'optimiser-performances-mysql-fort-trafic',
        excerpt: 'Index composites, EXPLAIN ANALYZE, buffer pool et dénormalisation raisonnée : techniques concrètes pour accélérer vos requêtes SQL.',
        content: `## Comprendre le coût réel des requêtes

Lorsqu'une application passe de quelques centaines à plusieurs dizaines de milliers d'utilisateurs actifs, les requêtes mal indexées deviennent le premier goulot d'étranglement de l'infrastructure.

---

### 1. Décortiquer le plan d'exécution avec EXPLAIN

Ne devinez jamais ce que fait le moteur MySQL (InnoDB) : vérifiez-le avec l'outil de diagnostic intégré.

\`\`\`sql
EXPLAIN ANALYZE
SELECT id, title, created_at
FROM projects
WHERE status = 'published' AND category = 'Architecture & SaaS'
ORDER BY created_at DESC
LIMIT 10;
\`\`\`

Si vous observez un \`type: ALL\` (Full Table Scan) sur une table de plusieurs millions de lignes, c'est le signe immédiat qu'un index approprié fait défaut.

---

### 2. Bien concevoir ses index composites

L'ordre des colonnes dans un index composite compte énormément :
1. Les colonnes soumises à une égalité stricte (\`status = 'published'\`) en premier.
2. Les colonnes soumises à des plages ou tris (\`created_at DESC\`) en fin d'index.

---

### 3. Ajuster le paramètre InnoDB Buffer Pool

Sur un serveur dédié, le \`innodb_buffer_pool_size\` devrait idéalement occuper entre 60 % et 75 % de la mémoire vive totale de la machine afin de conserver les index et pages de données les plus chaudes directement en RAM.

---

## Conclusion

Une optimisation SQL bien pensée permet souvent de multiplier les débits par 10 sans ajouter une seule machine supplémentaire.`,
        mainImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
        category: 'Bases de Données',
        tags: ['MySQL', 'Performance', 'SQL', 'Backend'],
        author: 'Alexandre Mercier',
        readingTime: '5 min',
        status: 'published',
        publishedAt: '2025-01-20T10:30:00Z',
        createdAt: '2025-01-19T17:00:00Z',
        updatedAt: '2025-01-20T10:30:00Z',
        metaTitle: 'Optimiser MySQL à Fort Trafic — Guide d’Ingénierie',
        metaDescription: 'Techniques avancées d’indexation, d’analyse de requêtes et de configuration InnoDB pour MySQL.'
      },
      {
        id: 'post_3',
        title: 'Clean Architecture & TypeScript : structurer son projet pour durer',
        slug: 'clean-architecture-typescript-structurer-projet-pour-durer',
        excerpt: 'Comment séparer vos entités métier, cas d’usage et adaptateurs techniques pour rendre votre code testable, évolutif et découplé.',
        content: `## Pourquoi la structure est la clé de la longévité

Trop de projets débutent comme un simple prototype et deviennent rapidement des labyrinthes où chaque modification risque de casser une fonctionnalité annexe.

La **Clean Architecture**, popularisée par Robert C. Martin, propose une séparation stricte des responsabilités par couches concentriques.

---

### Les principes cardinaux :

1. **Indépendance des frameworks** : Votre logique métier ne doit dépendre ni d'Express, ni de NestJS, ni de React.
2. **Testabilité absolue** : Vous devez pouvoir tester un cas d'usage sans base de données connectée grâce aux interfaces de repository.
3. **Règle de dépendance** : Les dépendances de code doivent toujours pointer vers l'intérieur (vers le métier).

\`\`\`typescript
// Domaine pur (Domain Entity)
export interface User {
  id: string;
  email: string;
  fullName: string;
}

// Port de sortie (Repository Interface)
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// Cas d'usage (Use Case)
export class UpdateUserProfileUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(userId: string, newName: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    user.fullName = newName;
    await this.userRepo.save(user);
    return user;
  }
}
\`\`\`

---

## Conclusion

Investir du temps dans une architecture propre dès le départ permet aux équipes de livrer de la valeur en continu sans subir de ralentissement lié à la dette technique.`,
        mainImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        category: 'Ingénierie Logicielle',
        tags: ['TypeScript', 'Clean Architecture', 'Software Design', 'Bonnes Pratiques'],
        author: 'Alexandre Mercier',
        readingTime: '7 min',
        status: 'published',
        publishedAt: '2024-12-05T09:00:00Z',
        createdAt: '2024-12-04T12:00:00Z',
        updatedAt: '2024-12-05T09:00:00Z',
        metaTitle: 'Clean Architecture en TypeScript — Alexandre Mercier',
        metaDescription: 'Guide complet pour structurer vos projets TypeScript avec la Clean Architecture et le Domain-Driven Design.'
      }
    ],
    skills: [
      { id: 'sk_1', name: 'TypeScript', category: 'Frontend', icon: 'Code', level: 95, order: 1, status: 'active' },
      { id: 'sk_2', name: 'React & Next.js', category: 'Frontend', icon: 'Atom', level: 92, order: 2, status: 'active' },
      { id: 'sk_3', name: 'Tailwind CSS', category: 'Frontend', icon: 'Palette', level: 95, order: 3, status: 'active' },
      { id: 'sk_4', name: 'Vue.js / Angular', category: 'Frontend', icon: 'Layers', level: 78, order: 4, status: 'active' },

      { id: 'sk_5', name: 'Node.js & Express', category: 'Backend', icon: 'Server', level: 92, order: 5, status: 'active' },
      { id: 'sk_6', name: 'PHP & Laravel', category: 'Backend', icon: 'Boxes', level: 88, order: 6, status: 'active' },
      { id: 'sk_7', name: 'Python & FastAPI', category: 'Backend', icon: 'Terminal', level: 84, order: 7, status: 'active' },
      { id: 'sk_8', name: 'Architecture REST & GraphQL', category: 'Backend', icon: 'Cpu', level: 90, order: 8, status: 'active' },

      { id: 'sk_9', name: 'MySQL & MariaDB', category: 'Bases de données', icon: 'Database', level: 90, order: 9, status: 'active' },
      { id: 'sk_10', name: 'PostgreSQL', category: 'Bases de données', icon: 'Database', level: 88, order: 10, status: 'active' },
      { id: 'sk_11', name: 'Redis (Cache & Queues)', category: 'Bases de données', icon: 'Zap', level: 85, order: 11, status: 'active' },
      { id: 'sk_12', name: 'MongoDB', category: 'Bases de données', icon: 'HardDrive', level: 80, order: 12, status: 'active' },

      { id: 'sk_13', name: 'Docker & Conteneurs', category: 'DevOps & Outils', icon: 'Box', level: 88, order: 13, status: 'active' },
      { id: 'sk_14', name: 'CI/CD & GitHub Actions', category: 'DevOps & Outils', icon: 'Workflow', level: 85, order: 14, status: 'active' },
      { id: 'sk_15', name: 'Git & Versioning', category: 'DevOps & Outils', icon: 'GitBranch', level: 95, order: 15, status: 'active' },
      { id: 'sk_16', name: 'Linux / Nginx / Sysadmin', category: 'DevOps & Outils', icon: 'Shield', level: 82, order: 16, status: 'active' }
    ],
    services: [
      {
        id: 'srv_1',
        title: 'Architecture & Ingénierie Logicielle',
        description: 'Conception de systèmes résilients, découpage modulaire, architectures microservices ou monolithiques modulaires adaptées à vos objectifs de charge.',
        icon: 'Cpu',
        order: 1,
        status: 'active'
      },
      {
        id: 'srv_2',
        title: 'Développement d’Applications Web & APIs',
        description: 'Création de plateformes web sur mesure avec React, Node.js, Laravel et TypeScript. Conception d’APIs REST sécurisées, performantes et documentées.',
        icon: 'Globe',
        order: 2,
        status: 'active'
      },
      {
        id: 'srv_3',
        title: 'Optimisation de Bases de Données & Performance',
        description: 'Audit et indexation de bases MySQL/PostgreSQL, refactoring des requêtes lentes, mise en cache distribuée avec Redis et réduction des temps de réponse.',
        icon: 'Database',
        order: 3,
        status: 'active'
      },
      {
        id: 'srv_4',
        title: 'DevOps, CI/CD & Déploiement Cloud',
        description: 'Conteneurisation Docker, pipelines d’intégration et de déploiement continu automatisés (GitHub Actions), monitoring d’infrastructure et sécurisation.',
        icon: 'Cloud',
        order: 4,
        status: 'active'
      }
    ],
    experiences: [
      {
        id: 'exp_1',
        role: 'Lead Architecte & Ingénieur Logiciel Senior',
        company: 'Apex Cloud Solutions',
        location: 'Paris & Remote',
        startDate: '2023-01',
        endDate: 'Présent',
        current: true,
        description: 'Direction technique d’une équipe de 8 ingénieurs. Conception d’une plateforme cloud multi-tenant traitant 15M de requêtes par jour. Mise en place de normes de qualité strictes et mentorat.',
        technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes']
      },
      {
        id: 'exp_2',
        role: 'Ingénieur Full-Stack & Backend',
        company: 'Vortex Digital Labs',
        location: 'Lyon, France',
        startDate: '2020-09',
        endDate: '2022-12',
        current: false,
        description: 'Développement d’applications e-commerce et ERP à forte valeur ajoutée. Optimisation des performances des bases MySQL et refonte de l’API REST sous Laravel.',
        technologies: ['PHP', 'Laravel', 'MySQL', 'Vue.js', 'Redis', 'Docker']
      },
      {
        id: 'exp_3',
        role: 'Développeur Web & Logiciel',
        company: 'Systèmes & Données',
        location: 'Paris, France',
        startDate: '2019-02',
        endDate: '2020-08',
        current: false,
        description: 'Conception de modules d’automatisation et d’outils internes pour l’intégration de données et la génération de rapports de conformité.',
        technologies: ['JavaScript', 'PHP', 'MySQL', 'Git', 'Bootstrap']
      }
    ],
    educations: [
      {
        id: 'edu_1',
        degree: 'Diplôme d’Ingénieur en Informatique (Master 2)',
        school: 'École Nationale Supérieure d’Informatique (ENSIIE)',
        location: 'France',
        startDate: '2016',
        endDate: '2019',
        description: 'Spécialisation en génie logiciel, algorithmique avancée, architecture des systèmes d’information et sécurité informatique. Mention Très Bien.'
      },
      {
        id: 'edu_2',
        degree: 'Licence en Sciences Informatiques',
        school: 'Université Paris-Saclay',
        location: 'Paris, France',
        startDate: '2013',
        endDate: '2016',
        description: 'Fondamentaux des mathématiques appliquées, structures de données, programmation système C/C++ et bases de données relationnelles.'
      }
    ],
    messages: [
      {
        id: 'msg_1',
        name: 'Sophie Laurent',
        email: 'sophie.laurent@techstart.io',
        subject: 'Proposition de mission architecture SaaS',
        message: 'Bonjour Alexandre, nous avons consulté votre portfolio et vos réalisations en microservices. Nous cherchons un architecte pour auditer notre plateforme actuelle. Seriez-vous disponible pour un premier échange ?',
        createdAt: '2025-02-14T11:20:00Z',
        status: 'unread'
      }
    ],
    media: [
      {
        id: 'med_1',
        name: 'cloudmetrics-hero.jpg',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        size: 342000,
        mimeType: 'image/jpeg',
        uploadedAt: '2025-01-15T10:00:00Z'
      },
      {
        id: 'med_2',
        name: 'nexus-hero.jpg',
        url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
        size: 295000,
        mimeType: 'image/jpeg',
        uploadedAt: '2024-09-10T09:00:00Z'
      }
    ],
    activities: [
      {
        id: 'act_1',
        type: 'project_created',
        title: 'Nouveau projet ajouté : CloudMetrics Platform',
        timestamp: '2025-01-15T10:00:00Z'
      },
      {
        id: 'act_2',
        type: 'post_published',
        title: 'Article publié : Concevoir des architectures résilientes en microservices',
        timestamp: '2025-02-10T08:00:00Z'
      },
      {
        id: 'act_3',
        type: 'message_received',
        title: 'Nouveau message de contact : Sophie Laurent',
        timestamp: '2025-02-14T11:20:00Z'
      }
    ]
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to parse database file, resetting to initial database:', err);
    }
    const initial = createInitialDatabase();
    this.persist(initial);
    return initial;
  }

  public persist(customData?: DatabaseSchema) {
    this.ensureDataDir();
    const dataToSave = customData || this.data;
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public save() {
    this.persist(this.data);
  }

  public resetToDefault(): DatabaseSchema {
    this.data = createInitialDatabase();
    this.save();
    return this.data;
  }

  public addActivity(type: DatabaseSchema['activities'][0]['type'], title: string) {
    this.data.activities.unshift({
      id: `act_${Date.now()}`,
      type,
      title,
      timestamp: new Date().toISOString()
    });
    // keep max 50 activities
    if (this.data.activities.length > 50) {
      this.data.activities = this.data.activities.slice(0, 50);
    }
    this.save();
  }
}

export const db = new DatabaseManager();
