import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { db, hashPassword } from './db.ts';
import {
  requireAuth,
  createSessionToken,
  revokeSessionToken,
  checkBruteForce,
  recordFailedLogin,
  resetFailedLogin,
  type AuthenticatedRequest,
} from './auth.ts';
import type { Project, Post, Skill, Service, Experience, Education, Profile, SiteSettings, MediaItem } from '../src/types.ts';

const router = Router();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ----------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------

// GET /api/profile
router.get('/profile', (req, res) => {
  const data = db.get();
  res.json(data.profile);
});

// GET /api/settings
router.get('/settings', (req, res) => {
  const data = db.get();
  res.json(data.settings);
});

// GET /api/projects (public - published only)
router.get('/projects', (req, res) => {
  const data = db.get();
  let projects = data.projects.filter(p => p.status === 'published');

  const { search, category, tech, year, featured } = req.query;

  if (category && typeof category === 'string' && category !== 'Tous') {
    projects = projects.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (tech && typeof tech === 'string' && tech !== 'Toutes') {
    projects = projects.filter(p => p.technologies.some(t => t.toLowerCase() === tech.toLowerCase()));
  }

  if (year && typeof year === 'string' && year !== 'Toutes') {
    projects = projects.filter(p => p.year === year);
  }

  if (featured === 'true') {
    projects = projects.filter(p => p.featured);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    projects = projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.technologies.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json(projects);
});

// GET /api/projects/:slug
router.get('/projects/:slug', (req, res) => {
  const data = db.get();
  const project = data.projects.find(p => p.slug === req.params.slug);
  if (!project) {
    res.status(404).json({ error: 'Projet introuvable' });
    return;
  }
  res.json(project);
});

// GET /api/posts (public - published only)
router.get('/posts', (req, res) => {
  const data = db.get();
  let posts = data.posts.filter(p => p.status === 'published');

  const { search, category, tag } = req.query;

  if (category && typeof category === 'string' && category !== 'Tous') {
    posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (tag && typeof tag === 'string') {
    posts = posts.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json(posts);
});

// GET /api/posts/:slug
router.get('/posts/:slug', (req, res) => {
  const data = db.get();
  const post = data.posts.find(p => p.slug === req.params.slug);
  if (!post) {
    res.status(404).json({ error: 'Article introuvable' });
    return;
  }

  // Get similar articles
  const related = data.posts
    .filter(p => p.status === 'published' && p.id !== post.id && (p.category === post.category || p.tags.some(t => post.tags.includes(t))))
    .slice(0, 3);

  res.json({ post, related });
});

// GET /api/skills
router.get('/skills', (req, res) => {
  const data = db.get();
  const skills = data.skills
    .filter(s => s.status === 'active')
    .sort((a, b) => a.order - b.order);
  res.json(skills);
});

// GET /api/services
router.get('/services', (req, res) => {
  const data = db.get();
  const services = data.services
    .filter(s => s.status === 'active')
    .sort((a, b) => a.order - b.order);
  res.json(services);
});

// GET /api/experiences
router.get('/experiences', (req, res) => {
  const data = db.get();
  res.json(data.experiences);
});

// GET /api/educations
router.get('/educations', (req, res) => {
  const data = db.get();
  res.json(data.educations);
});

// GET /api/stats (Statistiques publiques du portfolio)
router.get('/stats', (req, res) => {
  const data = db.get();
  res.json({
    projectsCount: data.projects.filter(p => p.status === 'published').length,
    articlesCount: data.posts.filter(p => p.status === 'published').length,
    skillsCount: data.skills.length,
    servicesCount: data.services.filter(s => s.status === 'active').length,
    yearsOfExperience: 6,
  });
});

// POST /api/contact
router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Veuillez remplir votre nom, votre email et votre message.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Adresse email invalide.' });
    return;
  }

  const data = db.get();
  const newMessage = {
    id: `msg_${Date.now()}`,
    name: String(name).trim(),
    email: String(email).trim(),
    subject: String(subject || 'Sans objet').trim(),
    message: String(message).trim(),
    createdAt: new Date().toISOString(),
    status: 'unread' as const,
  };

  data.messages.unshift(newMessage);
  db.addActivity('message_received', `Nouveau message de contact : ${newMessage.name}`);

  res.status(201).json({
    success: true,
    message: 'Votre message a bien été envoyé ! Je vous répondrai dans les plus brefs délais.',
  });
});

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

// POST /api/admin/login (Sécurisé avec protection anti-force brute et timing-safe)
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const rateLimitKey = `login_${clientIp}`;

  // 1. Vérification du statut de blocage par force brute
  const bruteCheck = checkBruteForce(rateLimitKey);
  if (bruteCheck.blocked) {
    res.status(429).json({
      error: `Trop de tentatives infructueuses. Par mesure de sécurité, l'accès administrateur est bloqué pendant encore ${bruteCheck.remainingMinutes} minute(s).`,
    });
    return;
  }

  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis' });
    return;
  }

  const data = db.get();
  const admin = data.admin;

  const normalizedInputEmail = String(email).toLowerCase().trim();
  const normalizedAdminEmail = admin.email.toLowerCase().trim();
  const normalizedProfileEmail = (data.profile?.email || '').toLowerCase().trim();

  // Accepte l'email du compte admin, du profil administrateur ou l'email du propriétaire
  const isEmailMatch =
    (normalizedInputEmail === normalizedAdminEmail) ||
    (normalizedProfileEmail && normalizedInputEmail === normalizedProfileEmail) ||
    normalizedInputEmail === 'kagambegarene5@gmail.com';

  if (!isEmailMatch) {
    const attempt = recordFailedLogin(rateLimitKey);
    if (attempt.blocked) {
      res.status(429).json({
        error: `Accès temporairement bloqué pendant ${attempt.remainingMinutes} minutes suite à 5 tentatives infructueuses.`,
      });
      return;
    }
    res.status(401).json({
      error: `Identifiants invalides (${attempt.remainingAttempts} tentative${attempt.remainingAttempts > 1 ? 's' : ''} restante${attempt.remainingAttempts > 1 ? 's' : ''}).`,
    });
    return;
  }

  const incomingHash = hashPassword(password, admin.salt);
  // Comparaison à temps constant pour éliminer les attaques temporelles (timing attacks)
  let isPasswordMatch = false;
  try {
    const incomingBuf = Buffer.from(incomingHash, 'hex');
    const storedBuf = Buffer.from(admin.passwordHash, 'hex');
    isPasswordMatch = incomingBuf.length === storedBuf.length && crypto.timingSafeEqual(incomingBuf, storedBuf);
  } catch {
    isPasswordMatch = false;
  }

  if (!isPasswordMatch) {
    const attempt = recordFailedLogin(rateLimitKey);
    if (attempt.blocked) {
      res.status(429).json({
        error: `Accès temporairement bloqué pendant ${attempt.remainingMinutes} minutes suite à 5 tentatives infructueuses.`,
      });
      return;
    }
    res.status(401).json({
      error: `Identifiants invalides (${attempt.remainingAttempts} tentative${attempt.remainingAttempts > 1 ? 's' : ''} restante${attempt.remainingAttempts > 1 ? 's' : ''}).`,
    });
    return;
  }

  // Connexion réussie : réinitialisation du compteur d'échecs
  resetFailedLogin(rateLimitKey);

  const token = createSessionToken(admin.id);
  res.json({
    token,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
});

// POST /api/admin/logout
router.post('/admin/logout', requireAuth, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    revokeSessionToken(authHeader.substring(7).trim());
  }
  res.json({ success: true, message: 'Déconnecté avec succès' });
});

// GET /api/admin/me
router.get('/admin/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.adminUser });
});

// PUT /api/admin/change-password
router.put('/admin/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' });
    return;
  }

  const data = db.get();
  const currentHash = hashPassword(currentPassword, data.admin.salt);
  if (currentHash !== data.admin.passwordHash) {
    res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
    return;
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  data.admin.salt = newSalt;
  data.admin.passwordHash = hashPassword(newPassword, newSalt);
  db.save();

  res.json({ success: true, message: 'Mot de passe administrateur mis à jour avec succès.' });
});

// ----------------------------------------------------
// ADMIN DASHBOARD STATS
// ----------------------------------------------------

router.get('/admin/stats', requireAuth, (req, res) => {
  const data = db.get();
  const totalProjects = data.projects.length;
  const publishedProjects = data.projects.filter(p => p.status === 'published').length;
  const draftProjects = data.projects.filter(p => p.status === 'draft').length;

  const totalPosts = data.posts.length;
  const publishedPosts = data.posts.filter(p => p.status === 'published').length;
  const draftPosts = data.posts.filter(p => p.status === 'draft').length;

  const totalMessages = data.messages.length;
  const unreadMessages = data.messages.filter(m => m.status === 'unread').length;

  const totalSkills = data.skills.length;
  const totalServices = data.services.length;

  res.json({
    totalProjects,
    publishedProjects,
    draftProjects,
    totalPosts,
    publishedPosts,
    draftPosts,
    totalMessages,
    unreadMessages,
    totalSkills,
    totalServices,
    recentActivities: data.activities.slice(0, 8),
  });
});

// ----------------------------------------------------
// ADMIN PROJECTS CRUD
// ----------------------------------------------------

router.get('/admin/projects', requireAuth, (req, res) => {
  const data = db.get();
  res.json(data.projects);
});

router.post('/admin/projects', requireAuth, (req, res) => {
  const body = req.body;
  if (!body.title || !body.shortDescription) {
    res.status(400).json({ error: 'Le titre et la description courte sont requis.' });
    return;
  }

  const data = db.get();
  const slug = body.slug ? slugify(body.slug) : slugify(body.title);

  // Check if slug already exists
  if (data.projects.some(p => p.slug === slug)) {
    res.status(400).json({ error: `Le slug "${slug}" est déjà utilisé par un autre projet.` });
    return;
  }

  const newProject: Project = {
    id: `proj_${Date.now()}`,
    title: String(body.title).trim(),
    slug,
    shortDescription: String(body.shortDescription).trim(),
    fullDescription: String(body.fullDescription || '').trim(),
    problem: body.problem || '',
    solution: body.solution || '',
    mainImage: body.mainImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    gallery: Array.isArray(body.gallery) ? body.gallery : [],
    category: body.category || 'Architecture & Web',
    technologies: Array.isArray(body.technologies) ? body.technologies : [],
    features: Array.isArray(body.features) ? body.features : [],
    year: String(body.year || new Date().getFullYear()),
    client: body.client || '',
    role: body.role || '',
    url: body.url || '',
    github: body.github || '',
    status: body.status === 'draft' ? 'draft' : 'published',
    featured: Boolean(body.featured),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metaTitle: body.metaTitle || `${body.title} — Portfolio Alexandre Mercier`,
    metaDescription: body.metaDescription || body.shortDescription,
    metaKeywords: body.metaKeywords || '',
  };

  data.projects.unshift(newProject);
  db.addActivity('project_created', `Nouveau projet créé : ${newProject.title}`);

  res.status(201).json(newProject);
});

router.put('/admin/projects/:id', requireAuth, (req, res) => {
  const data = db.get();
  const index = data.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Projet introuvable' });
    return;
  }

  const body = req.body;
  const existing = data.projects[index];
  const slug = body.slug ? slugify(body.slug) : existing.slug;

  // Check slug uniqueness
  if (slug !== existing.slug && data.projects.some(p => p.id !== existing.id && p.slug === slug)) {
    res.status(400).json({ error: `Le slug "${slug}" est déjà utilisé.` });
    return;
  }

  const updated: Project = {
    ...existing,
    ...body,
    slug,
    updatedAt: new Date().toISOString(),
  };

  data.projects[index] = updated;
  db.addActivity('project_updated', `Projet mis à jour : ${updated.title}`);

  res.json(updated);
});

router.patch('/admin/projects/:id/toggle-status', requireAuth, (req, res) => {
  const data = db.get();
  const project = data.projects.find(p => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Projet introuvable' });
    return;
  }

  project.status = project.status === 'published' ? 'draft' : 'published';
  project.updatedAt = new Date().toISOString();
  db.save();

  res.json({ success: true, status: project.status });
});

router.delete('/admin/projects/:id', requireAuth, (req, res) => {
  const data = db.get();
  const index = data.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Projet introuvable' });
    return;
  }

  const removed = data.projects.splice(index, 1)[0];
  db.save();

  res.json({ success: true, message: `Projet "${removed.title}" supprimé avec succès.` });
});

// ----------------------------------------------------
// ADMIN POSTS (BLOG) CRUD
// ----------------------------------------------------

router.get('/admin/posts', requireAuth, (req, res) => {
  const data = db.get();
  res.json(data.posts);
});

router.post('/admin/posts', requireAuth, (req, res) => {
  const body = req.body;
  if (!body.title || !body.excerpt || !body.content) {
    res.status(400).json({ error: 'Le titre, l’extrait et le contenu sont requis.' });
    return;
  }

  const data = db.get();
  const slug = body.slug ? slugify(body.slug) : slugify(body.title);

  if (data.posts.some(p => p.slug === slug)) {
    res.status(400).json({ error: `Le slug "${slug}" est déjà utilisé par un autre article.` });
    return;
  }

  const newPost: Post = {
    id: `post_${Date.now()}`,
    title: String(body.title).trim(),
    slug,
    excerpt: String(body.excerpt).trim(),
    content: String(body.content).trim(),
    mainImage: body.mainImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    ogImage: body.ogImage || body.mainImage,
    category: body.category || 'Génie Logiciel',
    tags: Array.isArray(body.tags) ? body.tags : [],
    author: body.author || data.profile.name,
    readingTime: body.readingTime || '5 min',
    status: body.status === 'draft' ? 'draft' : 'published',
    publishedAt: body.status === 'published' ? new Date().toISOString() : '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metaTitle: body.metaTitle || `${body.title} — Blog Alexandre Mercier`,
    metaDescription: body.metaDescription || body.excerpt,
  };

  data.posts.unshift(newPost);
  db.addActivity('post_created', `Nouvel article créé : ${newPost.title}`);

  res.status(201).json(newPost);
});

router.put('/admin/posts/:id', requireAuth, (req, res) => {
  const data = db.get();
  const index = data.posts.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Article introuvable' });
    return;
  }

  const body = req.body;
  const existing = data.posts[index];
  const slug = body.slug ? slugify(body.slug) : existing.slug;

  if (slug !== existing.slug && data.posts.some(p => p.id !== existing.id && p.slug === slug)) {
    res.status(400).json({ error: `Le slug "${slug}" est déjà utilisé.` });
    return;
  }

  const updated: Post = {
    ...existing,
    ...body,
    slug,
    updatedAt: new Date().toISOString(),
  };

  // If moving from draft to published, record publication date
  if (existing.status === 'draft' && updated.status === 'published' && !updated.publishedAt) {
    updated.publishedAt = new Date().toISOString();
  }

  data.posts[index] = updated;
  db.save();

  res.json(updated);
});

router.patch('/admin/posts/:id/toggle-status', requireAuth, (req, res) => {
  const data = db.get();
  const post = data.posts.find(p => p.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Article introuvable' });
    return;
  }

  post.status = post.status === 'published' ? 'draft' : 'published';
  if (post.status === 'published' && !post.publishedAt) {
    post.publishedAt = new Date().toISOString();
  }
  post.updatedAt = new Date().toISOString();
  db.save();

  res.json({ success: true, status: post.status });
});

router.delete('/admin/posts/:id', requireAuth, (req, res) => {
  const data = db.get();
  const index = data.posts.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Article introuvable' });
    return;
  }

  const removed = data.posts.splice(index, 1)[0];
  db.save();

  res.json({ success: true, message: `Article "${removed.title}" supprimé avec succès.` });
});

// ----------------------------------------------------
// ADMIN SKILLS CRUD
// ----------------------------------------------------

router.get('/admin/skills', requireAuth, (req, res) => {
  res.json(db.get().skills);
});

router.post('/admin/skills', requireAuth, (req, res) => {
  const { name, category, icon, level, order, status } = req.body;
  if (!name || !category) {
    res.status(400).json({ error: 'Le nom et la catégorie sont obligatoires.' });
    return;
  }

  const data = db.get();
  const newSkill: Skill = {
    id: `sk_${Date.now()}`,
    name: String(name).trim(),
    category: String(category).trim(),
    icon: icon || 'Code',
    level: Math.min(100, Math.max(0, Number(level) || 80)),
    order: Number(order) || data.skills.length + 1,
    status: status === 'inactive' ? 'inactive' : 'active',
  };

  data.skills.push(newSkill);
  db.save();
  res.status(201).json(newSkill);
});

router.put('/admin/skills/:id', requireAuth, (req, res) => {
  const data = db.get();
  const skill = data.skills.find(s => s.id === req.params.id);
  if (!skill) {
    res.status(404).json({ error: 'Compétence introuvable' });
    return;
  }

  Object.assign(skill, req.body);
  if (skill.level !== undefined) {
    skill.level = Math.min(100, Math.max(0, Number(skill.level)));
  }
  db.save();
  res.json(skill);
});

router.delete('/admin/skills/:id', requireAuth, (req, res) => {
  const data = db.get();
  const index = data.skills.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Compétence introuvable' });
    return;
  }
  data.skills.splice(index, 1);
  db.save();
  res.json({ success: true });
});

// ----------------------------------------------------
// ADMIN SERVICES CRUD
// ----------------------------------------------------

router.get('/admin/services', requireAuth, (req, res) => {
  res.json(db.get().services);
});

router.post('/admin/services', requireAuth, (req, res) => {
  const { title, description, icon, order, status } = req.body;
  if (!title || !description) {
    res.status(400).json({ error: 'Le titre et la description sont requis.' });
    return;
  }

  const data = db.get();
  const newService: Service = {
    id: `srv_${Date.now()}`,
    title: String(title).trim(),
    description: String(description).trim(),
    icon: icon || 'Cpu',
    order: Number(order) || data.services.length + 1,
    status: status === 'inactive' ? 'inactive' : 'active',
  };

  data.services.push(newService);
  db.save();
  res.status(201).json(newService);
});

router.put('/admin/services/:id', requireAuth, (req, res) => {
  const data = db.get();
  const service = data.services.find(s => s.id === req.params.id);
  if (!service) {
    res.status(404).json({ error: 'Service introuvable' });
    return;
  }

  Object.assign(service, req.body);
  db.save();
  res.json(service);
});

router.delete('/admin/services/:id', requireAuth, (req, res) => {
  const data = db.get();
  const index = data.services.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Service introuvable' });
    return;
  }
  data.services.splice(index, 1);
  db.save();
  res.json({ success: true });
});

// ----------------------------------------------------
// ADMIN EXPERIENCES & FORMATIONS
// ----------------------------------------------------

router.get('/admin/experiences', requireAuth, (req, res) => {
  res.json(db.get().experiences);
});

router.post('/admin/experiences', requireAuth, (req, res) => {
  const body = req.body;
  const data = db.get();
  const newExp: Experience = {
    id: `exp_${Date.now()}`,
    role: body.role || 'Ingénieur Logiciel',
    company: body.company || 'Entreprise',
    location: body.location || 'Paris',
    startDate: body.startDate || '2023',
    endDate: body.current ? 'Présent' : body.endDate || '2024',
    current: Boolean(body.current),
    description: body.description || '',
    technologies: Array.isArray(body.technologies) ? body.technologies : [],
  };
  data.experiences.unshift(newExp);
  db.save();
  res.status(201).json(newExp);
});

router.put('/admin/experiences/:id', requireAuth, (req, res) => {
  const data = db.get();
  const exp = data.experiences.find(e => e.id === req.params.id);
  if (!exp) {
    res.status(404).json({ error: 'Expérience introuvable' });
    return;
  }
  Object.assign(exp, req.body);
  db.save();
  res.json(exp);
});

router.delete('/admin/experiences/:id', requireAuth, (req, res) => {
  const data = db.get();
  const index = data.experiences.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Expérience introuvable' });
    return;
  }
  data.experiences.splice(index, 1);
  db.save();
  res.json({ success: true });
});

router.get('/admin/educations', requireAuth, (req, res) => {
  res.json(db.get().educations);
});

router.post('/admin/educations', requireAuth, (req, res) => {
  const body = req.body;
  const data = db.get();
  const newEdu: Education = {
    id: `edu_${Date.now()}`,
    degree: body.degree || 'Diplôme',
    school: body.school || 'Établissement',
    location: body.location || 'France',
    startDate: body.startDate || '2020',
    endDate: body.endDate || '2023',
    description: body.description || '',
  };
  data.educations.unshift(newEdu);
  db.save();
  res.status(201).json(newEdu);
});

router.put('/admin/educations/:id', requireAuth, (req, res) => {
  const data = db.get();
  const edu = data.educations.find(e => e.id === req.params.id);
  if (!edu) {
    res.status(404).json({ error: 'Formation introuvable' });
    return;
  }
  Object.assign(edu, req.body);
  db.save();
  res.json(edu);
});

router.delete('/admin/educations/:id', requireAuth, (req, res) => {
  const data = db.get();
  const index = data.educations.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Formation introuvable' });
    return;
  }
  data.educations.splice(index, 1);
  db.save();
  res.json({ success: true });
});

// ----------------------------------------------------
// ADMIN PROFILE & SETTINGS
// ----------------------------------------------------

router.put('/admin/profile', requireAuth, (req, res) => {
  const data = db.get();
  data.profile = {
    ...data.profile,
    ...req.body,
  };
  db.save();
  res.json(data.profile);
});

router.put('/admin/settings', requireAuth, (req, res) => {
  const data = db.get();
  data.settings = {
    ...data.settings,
    ...req.body,
  };
  db.save();
  res.json(data.settings);
});

// ----------------------------------------------------
// ADMIN MESSAGES
// ----------------------------------------------------

router.get('/admin/messages', requireAuth, (req, res) => {
  res.json(db.get().messages);
});

router.patch('/admin/messages/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  const data = db.get();
  const msg = data.messages.find(m => m.id === req.params.id);
  if (!msg) {
    res.status(404).json({ error: 'Message introuvable' });
    return;
  }
  msg.status = status;
  db.save();
  res.json(msg);
});

router.patch('/admin/messages/:id/read', requireAuth, (req, res) => {
  const data = db.get();
  const msg = data.messages.find(m => m.id === req.params.id);
  if (!msg) {
    res.status(404).json({ error: 'Message introuvable' });
    return;
  }
  msg.status = 'read';
  db.save();
  res.json(msg);
});

router.delete('/admin/messages/:id', requireAuth, (req, res) => {
  const data = db.get();
  const index = data.messages.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Message introuvable' });
    return;
  }
  data.messages.splice(index, 1);
  db.save();
  res.json({ success: true });
});

// ----------------------------------------------------
// MEDIA UPLOAD & ASSETS
// ----------------------------------------------------

const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

router.get('/admin/media', requireAuth, (req, res) => {
  res.json(db.get().media);
});

router.post('/admin/upload', requireAuth, (req, res) => {
  const { fileName, fileData, mimeType } = req.body;

  if (!fileData || !fileName) {
    res.status(400).json({ error: 'Fichier manquant ou invalide.' });
    return;
  }

  // Validate allowed extensions and MIME types
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'];
  if (mimeType && !allowedMimes.includes(mimeType)) {
    res.status(400).json({ error: 'Format de fichier non supporté. Formats acceptés : JPG, PNG, WEBP, SVG, PDF.' });
    return;
  }

  try {
    // base64 decode
    const base64Content = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const buffer = Buffer.from(base64Content, 'base64');

    // 10MB limit
    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'Le fichier est trop volumineux (maximum 10 Mo).' });
      return;
    }

    const ext = path.extname(fileName) || '.png';
    const safeBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${safeBase}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;
    const mediaItem: MediaItem = {
      id: `med_${Date.now()}`,
      name: fileName,
      url: publicUrl,
      size: buffer.length,
      mimeType: mimeType || 'image/jpeg',
      uploadedAt: new Date().toISOString(),
    };

    const data = db.get();
    data.media.unshift(mediaItem);
    db.save();

    res.status(201).json(mediaItem);
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Échec de l’enregistrement du fichier sur le serveur.' });
  }
});

router.delete('/admin/media/:id', requireAuth, (req, res) => {
  const data = db.get();
  const index = data.media.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Média introuvable' });
    return;
  }

  const item = data.media[index];
  if (item.url.startsWith('/uploads/')) {
    const filename = path.basename(item.url);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Failed to remove disk file:', e);
      }
    }
  }

  data.media.splice(index, 1);
  db.save();
  res.json({ success: true });
});

// Reset database to initial seed data
router.post('/admin/reset-data', requireAuth, (req, res) => {
  db.resetToDefault();
  res.json({ success: true, message: 'Base de données réinitialisée aux données de démonstration avec succès.' });
});

export default router;
