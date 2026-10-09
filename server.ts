import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import apiRouter from './server/api.ts';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Support JSON payloads up to 50MB (useful for base64 image/file uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directory exists and serve files statically
const UPLOADS_DIR = path.resolve(__dirname, 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

const PUBLIC_DIR = path.resolve(__dirname, 'public');
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
}

const PUBLIC_UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');
if (fs.existsSync(PUBLIC_UPLOADS_DIR)) {
  app.use('/uploads', express.static(PUBLIC_UPLOADS_DIR));
}

// Fallback for missing uploads: return 404 instead of letting Vite SPA return index.html
app.use('/uploads', (req, res) => {
  // Fallback to default avatar if Rene avatar is requested or avatar missing
  const defaultAvatar = path.resolve(__dirname, 'public', 'images', 'rene_avatar.jpg');
  if (fs.existsSync(defaultAvatar)) {
    res.sendFile(defaultAvatar);
  } else {
    res.status(404).type('text/plain').send('Upload not found');
  }
});

// SITEMAP & ROBOTS.TXT
app.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/

Sitemap: ${protocol}://${host}/sitemap.xml
`;
  res.type('text/plain').send(robots);
});

app.get('/sitemap.xml', (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;
  const data = db.get();

  interface SitemapItem {
    loc: string;
    priority: string;
    changefreq: string;
    lastmod?: string;
  }

  const staticUrls: SitemapItem[] = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${baseUrl}/a-propos`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/projets`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/blog`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/contact`, priority: '0.7', changefreq: 'monthly' },
  ];

  const projectUrls: SitemapItem[] = data.projects
    .filter(p => p.status === 'published')
    .map(p => ({
      loc: `${baseUrl}/projets/${p.slug}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : undefined,
    }));

  const postUrls: SitemapItem[] = data.posts
    .filter(p => p.status === 'published')
    .map(p => ({
      loc: `${baseUrl}/blog/${p.slug}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : undefined,
    }));

  const allUrls = [...staticUrls, ...projectUrls, ...postUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml').send(xml);
});

// REST API
app.use('/api', apiRouter);

// Set up Vite or Static File Serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DevPortfolio Server] running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
