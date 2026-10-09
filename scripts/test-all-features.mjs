// Automated end-to-end verification script for DevPortfolio & CMS
const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, headers: res.headers, text, json };
}

async function runTests() {
  console.log('🚀 Démarrage des tests complets des fonctionnalités...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, label, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${label}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${label} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  // 1. PUBLIC ROUTES & SEO
  console.log('\n--- 1. ROUTES PUBLIQUES & SEO ---');
  {
    const rRobots = await request('/robots.txt');
    assert(rRobots.status === 200 && rRobots.text.includes('Disallow: /admin/'), 'robots.txt bloque bien /admin/');
    assert(rRobots.text.includes('Sitemap:'), 'robots.txt référence le sitemap');

    const rSitemap = await request('/sitemap.xml');
    assert(rSitemap.status === 200 && rSitemap.text.includes('<urlset'), 'sitemap.xml est généré au format XML valide');

    const rProfile = await request('/api/profile');
    assert(rProfile.status === 200 && rProfile.json?.name, 'GET /api/profile renvoie les données du profil');

    const rSettings = await request('/api/settings');
    assert(rSettings.status === 200 && rSettings.json?.siteTitle, 'GET /api/settings renvoie les paramètres du site');

    const rSkills = await request('/api/skills');
    assert(rSkills.status === 200 && Array.isArray(rSkills.json) && rSkills.json.length > 0, 'GET /api/skills renvoie les compétences');

    const rProjects = await request('/api/projects');
    assert(rProjects.status === 200 && Array.isArray(rProjects.json) && rProjects.json.length > 0, 'GET /api/projects renvoie la liste des projets');

    const firstSlug = rProjects.json?.[0]?.slug;
    if (firstSlug) {
      const rProjectDetail = await request(`/api/projects/${firstSlug}`);
      assert(rProjectDetail.status === 200 && rProjectDetail.json?.slug === firstSlug, `GET /api/projects/${firstSlug} détail projet valide`);
    }

    const rPosts = await request('/api/posts');
    assert(rPosts.status === 200 && Array.isArray(rPosts.json) && rPosts.json.length > 0, 'GET /api/posts renvoie les articles de blog');

    const firstPostSlug = rPosts.json?.[0]?.slug;
    if (firstPostSlug) {
      const rPostDetail = await request(`/api/posts/${firstPostSlug}`);
      assert(rPostDetail.status === 200 && rPostDetail.json?.post?.slug === firstPostSlug, `GET /api/posts/${firstPostSlug} détail article valide`);
    }

    const rServices = await request('/api/services');
    assert(rServices.status === 200 && Array.isArray(rServices.json) && rServices.json.length > 0, 'GET /api/services renvoie les prestations');

    const rExp = await request('/api/experiences');
    assert(rExp.status === 200 && Array.isArray(rExp.json) && rExp.json.length > 0, 'GET /api/experiences renvoie le parcours professionnel');

    const rStats = await request('/api/stats');
    assert(rStats.status === 200 && typeof rStats.json?.projectsCount === 'number', 'GET /api/stats renvoie les compteurs');
  }

  // 2. CONTACT FORM
  console.log('\n--- 2. FORMULAIRE DE CONTACT ---');
  {
    const rContact = await request('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Client Test',
        email: 'client@example.com',
        subject: 'Demande de devis logiciel',
        message: 'Bonjour, ceci est un test automatique de contact pour vérifier le bon fonctionnement.',
      }),
    });
    assert(rContact.status === 201 && rContact.json?.success, 'POST /api/contact enregistre avec succès un nouveau message');
  }

  // 3. ADMIN AUTHENTICATION & ACCESS
  console.log('\n--- 3. AUTHENTIFICATION ADMIN & SÉCURITÉ ---');
  let token = '';
  {
    // Tentative sans token sur route protégée
    const rNoAuth = await request('/api/admin/me');
    assert(rNoAuth.status === 401, 'Accès non-authentifié à /api/admin/me renvoie 401 Unauthorized');

    // Connexion valide avec email admin
    const rLogin = await request('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@portfolio.dev', password: 'admin1234' }),
    });
    assert(rLogin.status === 200 && rLogin.json?.token, 'POST /api/admin/login authentifie avec succès avec admin@portfolio.dev');
    token = rLogin.json?.token;

    // Connexion valide avec email personnel de l'utilisateur
    const rLoginUser = await request('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'kagambegarene5@gmail.com', password: 'admin1234' }),
    });
    assert(rLoginUser.status === 200 && rLoginUser.json?.token, 'POST /api/admin/login authentifie également avec kagambegarene5@gmail.com');

    // Vérification du profil connecté
    const rMe = await request('/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(rMe.status === 200 && rMe.json?.user?.role === 'superadmin', 'GET /api/admin/me valide le token et le rôle superadmin');
  }

  // 4. ADMIN CMS CRUD OPERATIONS
  console.log('\n--- 4. OPÉRATIONS CMS ADMINISTRATEUR (CRUD) ---');
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Test Messages
  {
    const rMsgs = await request('/api/admin/messages', { headers: authHeaders });
    assert(rMsgs.status === 200 && Array.isArray(rMsgs.json), 'GET /api/admin/messages liste les messages reçus');
    const testMsg = rMsgs.json?.find(m => m.name === 'Client Test');
    if (testMsg) {
      const rRead = await request(`/api/admin/messages/${testMsg.id}/read`, {
        method: 'PATCH',
        headers: authHeaders,
      });
      assert(rRead.status === 200, `PATCH /api/admin/messages/${testMsg.id}/read marque le message comme lu`);

      const rDelMsg = await request(`/api/admin/messages/${testMsg.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      assert(rDelMsg.status === 200, 'DELETE /api/admin/messages/:id supprime le message de test');
    }
  }

  // Test Projects CRUD
  let createdProjId = '';
  {
    const rCreateProj = await request('/api/admin/projects', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Projet Test Automation',
        shortDescription: 'Description courte de test',
        fullDescription: 'Description complète de test automatisé.',
        category: 'Architecture & SaaS',
        technologies: ['TypeScript', 'Node.js', 'React'],
        status: 'published',
        featured: false,
      }),
    });
    assert(rCreateProj.status === 201 && rCreateProj.json?.id, 'POST /api/admin/projects crée un nouveau projet');
    createdProjId = rCreateProj.json?.id;

    if (createdProjId) {
      const rUpdateProj = await request(`/api/admin/projects/${createdProjId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          title: 'Projet Test Automation (Modifié)',
          shortDescription: 'Description modifiée avec succès',
        }),
      });
      assert(rUpdateProj.status === 200 && rUpdateProj.json?.title?.includes('Modifié'), 'PUT /api/admin/projects/:id met à jour le projet');

      const rDelProj = await request(`/api/admin/projects/${createdProjId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      assert(rDelProj.status === 200, 'DELETE /api/admin/projects/:id supprime le projet créé');
    }
  }

  // Test Skills CRUD
  let createdSkillId = '';
  {
    const rCreateSkill = await request('/api/admin/skills', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Skill Test Automatisé',
        category: 'backend',
        level: 95,
        icon: 'Server',
      }),
    });
    assert(rCreateSkill.status === 201 && rCreateSkill.json?.id, 'POST /api/admin/skills crée une nouvelle compétence');
    createdSkillId = rCreateSkill.json?.id;

    if (createdSkillId) {
      const rDelSkill = await request(`/api/admin/skills/${createdSkillId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      assert(rDelSkill.status === 200, 'DELETE /api/admin/skills/:id supprime la compétence');
    }
  }

  // Test Services CRUD
  let createdServiceId = '';
  {
    const rCreateSvc = await request('/api/admin/services', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Prestation Test Audit & Architecture',
        description: 'Audit approfondi de systèmes distribués et architecture logicielle.',
        icon: 'Layers',
        features: ['Analyse de code', 'Revue de sécurité'],
        order: 99,
      }),
    });
    assert(rCreateSvc.status === 201 && rCreateSvc.json?.id, 'POST /api/admin/services crée une nouvelle prestation');
    createdServiceId = rCreateSvc.json?.id;

    if (createdServiceId) {
      const rDelSvc = await request(`/api/admin/services/${createdServiceId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      assert(rDelSvc.status === 200, 'DELETE /api/admin/services/:id supprime la prestation de test');
    }
  }

  // Test Blog Posts CRUD
  let createdPostId = '';
  {
    const rCreatePost = await request('/api/admin/posts', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Article Test Déploiement Cloud',
        excerpt: 'Introduction au déploiement sans temps d arrêt.',
        content: '# Déploiement sans coupure\n\nGuide des meilleures pratiques d ingénierie.',
        category: 'DevOps & Cloud',
        tags: ['Docker', 'CI/CD'],
        status: 'draft',
      }),
    });
    assert(rCreatePost.status === 201 && rCreatePost.json?.id, 'POST /api/admin/posts crée un article de blog');
    createdPostId = rCreatePost.json?.id;

    if (createdPostId) {
      const rDelPost = await request(`/api/admin/posts/${createdPostId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      assert(rDelPost.status === 200, 'DELETE /api/admin/posts/:id supprime l article de blog de test');
    }
  }

  // 5. SECURITY HEADERS CHECK
  console.log('\n--- 5. SÉCURITÉ HTTP & EN-TÊTES ---');
  {
    const rHead = await request('/');
    const headers = rHead.headers;
    assert(headers.get('x-content-type-options') === 'nosniff', 'Header X-Content-Type-Options: nosniff est actif');
    assert(headers.get('x-frame-options') === 'SAMEORIGIN', 'Header X-Frame-Options: SAMEORIGIN est actif');
    assert(!headers.get('x-powered-by'), 'Header X-Powered-By est bien masqué');
  }

  console.log('\n=============================================');
  console.log(`Résultats des tests : ${passed} réussis, ${failed} échoués`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Erreur critique pendant les tests:', err);
  process.exit(1);
});
