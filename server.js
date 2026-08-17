import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { z } from 'zod';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const app = express();
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && (!process.env.DATABASE_URL || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('Production requires DATABASE_URL and JWT_SECRET (32+ characters).');
}

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined
}) : null;

const memory = {
  projects: [
    { id: 1, title: 'Nexcent', category: 'SaaS Landing Page', technologies: ['Next.js', 'Tailwind CSS'], featured: true, link: '#', sort_order: 1 },
    { id: 2, title: 'ShopKart', category: 'E-commerce Website', technologies: ['React', 'Node.js'], featured: false, link: '#', sort_order: 2 },
    { id: 3, title: 'Doob.', category: 'Creative Agency', technologies: ['React', 'Framer Motion'], featured: false, link: '#', sort_order: 3 },
    { id: 4, title: 'Velora', category: 'Portfolio Template', technologies: ['Next.js', 'GSAP'], featured: false, link: '#', sort_order: 4 }
  ],
  experiences: [
    { id: 1, year: '2022', title: 'Started Web Development', highlight: '', description: 'Began my journey with HTML, CSS & JavaScript', sort_order: 1 },
    { id: 2, year: '2023', title: 'Frontend Developer', highlight: 'at TechFlow', description: 'Worked on multiple client projects', sort_order: 2 },
    { id: 3, year: '2024', title: 'Full Stack Developer', highlight: 'Freelancer', description: 'Building complete web solutions', sort_order: 3 },
    { id: 4, year: '2025', title: 'Building My Own Products', highlight: '', description: 'Working on SaaS & AI based products', sort_order: 4 }
  ],
  services: [
    { id: 1, title: 'Frontend Development', description: 'Fast, responsive and polished interfaces built for real users.', icon: 'ti ti-layout-dashboard', features: ['React', 'Next.js', 'Responsive UI'], sort_order: 1 },
    { id: 2, title: 'Backend Development', description: 'Secure APIs and server-side systems ready for production workloads.', icon: 'ti ti-server-2', features: ['Node.js', 'Express', 'PostgreSQL'], sort_order: 2 },
    { id: 3, title: 'UI / UX Implementation', description: 'Modern visual systems translated into smooth, accessible web experiences.', icon: 'ti ti-palette', features: ['Design Systems', 'Animations', 'Accessibility'], sort_order: 3 },
    { id: 4, title: 'Performance & Optimization', description: 'Practical improvements for speed, stability, SEO and maintainability.', icon: 'ti ti-gauge', features: ['Core Web Vitals', 'SEO', 'Clean Code'], sort_order: 4 }
  ],
  status_stats: [
    { id: 1, stat_key: 'skills', value: 8, suffix: '+', label: 'Skills', icon: 'ti ti-code', sort_order: 1 },
    { id: 2, stat_key: 'projects', value: 10, suffix: '+', label: 'Projects', icon: 'ti ti-layers-intersect', sort_order: 2 },
    { id: 3, stat_key: 'clients', value: 5, suffix: '+', label: 'Clients', icon: 'ti ti-users', sort_order: 3 },
    { id: 4, stat_key: 'experience', value: 2, suffix: '+', label: 'Experience', icon: 'ti ti-briefcase', sort_order: 4 }
  ],
  testimonials: [
    { id: 1, name: 'Rohit Sharma', role: 'Founder, Nexcent', quote: '“Devansh is an exceptional developer. He delivered our project on time with amazing quality.”', initials: 'RS', sort_order: 1 },
    { id: 2, name: 'Aarav Mehta', role: 'CEO, TechNova', quote: '“Working with Devansh was smooth, creative and professional. The final experience was beyond our expectations.”', initials: 'AM', sort_order: 2 },
    { id: 3, name: 'Priya Verma', role: 'Product Manager', quote: '“He understands design as well as development. The attention to detail made a huge difference.”', initials: 'PV', sort_order: 3 }
  ],
  messages: []
};

app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(v => v.trim()) : true,
  credentials: false
}));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false });
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, message: { error: 'Too many contact requests. Please try again later.' } });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { error: 'Too many login attempts. Please try again later.' } });
app.use('/api', apiLimiter);

const projectSchema = z.object({
  title: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(100),
  technologies: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  featured: z.boolean().default(false),
  link: z.string().trim().url().or(z.literal('#')).default('#'),
  sort_order: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true)
});
const experienceSchema = z.object({
  year: z.string().trim().min(1).max(20),
  title: z.string().trim().min(2).max(120),
  highlight: z.string().trim().max(120).default(''),
  description: z.string().trim().min(2).max(500),
  sort_order: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true)
});
const serviceSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(600),
  icon: z.string().trim().min(2).max(80).default('ti ti-code'),
  features: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  sort_order: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true)
});
const statusSchema = z.object({
  stat_key: z.string().trim().regex(/^[a-z0-9_-]{2,40}$/),
  value: z.number().int().min(0).max(1000000000),
  suffix: z.string().trim().max(10).default('+'),
  label: z.string().trim().min(1).max(60),
  icon: z.string().trim().min(2).max(80).default('ti ti-chart-bar'),
  sort_order: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true)
});
const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(100),
  role: z.string().trim().min(2).max(120),
  quote: z.string().trim().min(10).max(600),
  initials: z.string().trim().max(5).default(''),
  sort_order: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true)
});
const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional().default('')
});
const idSchema = z.coerce.number().int().positive();

const q = async (text, params = []) => {
  if (!pool) return null;
  return pool.query(text, params);
};

async function publicList(table, fields) {
  if (!pool) return memory[table];
  const result = await q(`SELECT ${fields} FROM ${table} WHERE published = TRUE ORDER BY sort_order ASC, id ASC`);
  return result.rows;
}

function safeJson(row) {
  if (!row) return row;
  if (row.technologies && typeof row.technologies === 'string') row.technologies = JSON.parse(row.technologies);
  return row;
}

function auth(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET || 'dev-only-secret');
    next();
  } catch { return res.status(401).json({ error: 'Invalid or expired token.' }); }
}

app.get('/api/health', async (_req, res) => {
  let database = 'memory';
  if (pool) {
    try { await q('SELECT 1'); database = 'postgresql'; } catch { database = 'unavailable'; }
  }
  res.json({ ok: database !== 'unavailable', service: 'portfolio-api', database, time: new Date().toISOString() });
});

app.get('/api/projects', async (_req, res, next) => {
  try { res.json((await publicList('projects', 'id,title,category,technologies,featured,link,sort_order')).map(safeJson)); } catch (e) { next(e); }
});
app.get('/api/experience', async (_req, res, next) => {
  try { res.json(await publicList('experiences', 'id,year,title,highlight,description,sort_order')); } catch (e) { next(e); }
});
app.get('/api/testimonials', async (_req, res, next) => {
  try { res.json(await publicList('testimonials', 'id,name,role,quote,initials,sort_order')); } catch (e) { next(e); }
});
app.get('/api/services', async (_req, res, next) => {
  try { res.json((await publicList('services', 'id,title,description,icon,features,sort_order')).map(safeJson)); } catch (e) { next(e); }
});
app.get('/api/status', async (_req, res, next) => {
  try {
    const rows = await publicList('status_stats', 'id,stat_key,value,suffix,label,icon,sort_order');
    res.json(rows);
  } catch (e) { next(e); }
});

app.post('/api/contact', contactLimiter, async (req, res, next) => {
  try {
    const parsed = contactSchema.parse(req.body);
    if (parsed.website) return res.status(200).json({ ok: true, message: 'Thanks. Your message has been received.' });
    const ip = req.ip || 'unknown';
    const ipHash = crypto.createHash('sha256').update(`${ip}:${process.env.JWT_SECRET || 'dev'}`).digest('hex');
    if (pool) {
      await q(`INSERT INTO contact_messages (name,email,subject,message,ip_hash,user_agent) VALUES ($1,$2,$3,$4,$5,$6)`, [parsed.name, parsed.email, parsed.subject, parsed.message, ipHash, req.get('user-agent')?.slice(0, 500) || null]);
    } else {
      memory.messages.push({ ...parsed, created_at: new Date().toISOString(), ip_hash: ipHash });
    }
    res.status(201).json({ ok: true, message: 'Thanks. Your message has been received.' });
  } catch (e) { next(e); }
});

app.post('/api/auth/login', loginLimiter, async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(8).max(200) }).parse(req.body);
    if (!pool) return res.status(503).json({ error: 'Admin login requires a configured database.' });
    const result = await q('SELECT id,email,password_hash FROM admins WHERE email=$1', [body.email.toLowerCase()]);
    const admin = result.rows[0];
    if (!admin || !(await bcrypt.compare(body.password, admin.password_hash))) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ sub: admin.id, email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h', issuer: 'shubham-portfolio' });
    res.json({ token, expiresIn: 7200, admin: { id: admin.id, email: admin.email } });
  } catch (e) { next(e); }
});

function crudRoutes({ route, table, schema, columns }) {
  app.get(`/api/admin/${route}`, auth, async (_req, res, next) => {
    try { const result = await q(`SELECT ${columns} FROM ${table} ORDER BY sort_order ASC,id ASC`); res.json(result.rows.map(safeJson)); } catch (e) { next(e); }
  });
  app.post(`/api/admin/${route}`, auth, async (req, res, next) => {
    try {
      const data = schema.parse(req.body);
      const values = Object.values(data).map(v => Array.isArray(v) ? JSON.stringify(v) : v);
      const names = Object.keys(data);
      const result = await q(`INSERT INTO ${table} (${names.join(',')}) VALUES (${names.map((_,i)=>`$${i+1}`).join(',')}) RETURNING ${columns}`, values);
      res.status(201).json(safeJson(result.rows[0]));
    } catch (e) { next(e); }
  });
  app.put(`/api/admin/${route}/:id`, auth, async (req, res, next) => {
    try {
      const id = idSchema.parse(req.params.id);
      const data = schema.parse(req.body);
      const names = Object.keys(data);
      const values = names.map(k => Array.isArray(data[k]) ? JSON.stringify(data[k]) : data[k]);
      values.push(id);
      const result = await q(`UPDATE ${table} SET ${names.map((n,i)=>`${n}=$${i+1}`).join(',')}, updated_at=NOW() WHERE id=$${values.length} RETURNING ${columns}`, values);
      if (!result.rowCount) return res.status(404).json({ error: 'Not found.' });
      res.json(safeJson(result.rows[0]));
    } catch (e) { next(e); }
  });
  app.delete(`/api/admin/${route}/:id`, auth, async (req, res, next) => {
    try {
      const id = idSchema.parse(req.params.id);
      const result = await q(`DELETE FROM ${table} WHERE id=$1`, [id]);
      if (!result.rowCount) return res.status(404).json({ error: 'Not found.' });
      res.status(204).end();
    } catch (e) { next(e); }
  });
}

if (pool) {
  crudRoutes({ route: 'projects', table: 'projects', schema: projectSchema, columns: 'id,title,category,technologies,featured,link,sort_order,published,created_at,updated_at' });
  crudRoutes({ route: 'experience', table: 'experiences', schema: experienceSchema, columns: 'id,year,title,highlight,description,sort_order,published,created_at,updated_at' });
  crudRoutes({ route: 'testimonials', table: 'testimonials', schema: testimonialSchema, columns: 'id,name,role,quote,initials,sort_order,published,created_at,updated_at' });
  crudRoutes({ route: 'services', table: 'services', schema: serviceSchema, columns: 'id,title,description,icon,features,sort_order,published,created_at,updated_at' });

  app.get('/api/admin/status', auth, async (_req, res, next) => {
    try { const result = await q('SELECT id,stat_key,value,suffix,label,icon,sort_order,published,updated_at FROM status_stats ORDER BY sort_order ASC,id ASC'); res.json(result.rows); } catch (e) { next(e); }
  });
  app.put('/api/admin/status/:id', auth, async (req, res, next) => {
    try {
      const id = idSchema.parse(req.params.id);
      const data = statusSchema.parse(req.body);
      const values = [data.stat_key,data.value,data.suffix,data.label,data.icon,data.sort_order,data.published,id];
      const result = await q('UPDATE status_stats SET stat_key=$1,value=$2,suffix=$3,label=$4,icon=$5,sort_order=$6,published=$7,updated_at=NOW() WHERE id=$8 RETURNING id,stat_key,value,suffix,label,icon,sort_order,published,updated_at', values);
      if (!result.rowCount) return res.status(404).json({ error: 'Not found.' });
      res.json(result.rows[0]);
    } catch (e) { next(e); }
  });
  app.post('/api/admin/status', auth, async (req, res, next) => {
    try {
      const data = statusSchema.parse(req.body);
      const result = await q('INSERT INTO status_stats (stat_key,value,suffix,label,icon,sort_order,published) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,stat_key,value,suffix,label,icon,sort_order,published,updated_at', [data.stat_key,data.value,data.suffix,data.label,data.icon,data.sort_order,data.published]);
      res.status(201).json(result.rows[0]);
    } catch (e) { next(e); }
  });
  app.delete('/api/admin/status/:id', auth, async (req, res, next) => {
    try { const id=idSchema.parse(req.params.id); const result=await q('DELETE FROM status_stats WHERE id=$1',[id]); if(!result.rowCount) return res.status(404).json({error:'Not found.'}); res.status(204).end(); } catch(e){ next(e); }
  });

  app.get('/api/admin/messages', auth, async (_req, res, next) => {
    try { const result = await q(`SELECT id,name,email,subject,message,status,created_at FROM contact_messages ORDER BY created_at DESC LIMIT 200`); res.json(result.rows); } catch (e) { next(e); }
  });
  app.patch('/api/admin/messages/:id', auth, async (req, res, next) => {
    try {
      const id = idSchema.parse(req.params.id);
      const status = z.enum(['new','read','replied','archived']).parse(req.body.status);
      const result = await q('UPDATE contact_messages SET status=$1 WHERE id=$2 RETURNING id,name,email,subject,message,status,created_at', [status,id]);
      if (!result.rowCount) return res.status(404).json({ error: 'Not found.' });
      res.json(result.rows[0]);
    } catch (e) { next(e); }
  });
}

app.use(express.static(root, { extensions: ['html'], maxAge: isProduction ? '1d' : 0 }));
app.get(/^(?!\/api(?:\/|$)).*/, (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(root, 'index.html'));
});

app.use((err, _req, res, _next) => {
  if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed.', details: err.issues.map(i => ({ path: i.path, message: i.message })) });
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const server = app.listen(port, () => console.log(`Portfolio running on http://localhost:${port}`));

const shutdown = async () => {
  server.close(async () => { if (pool) await pool.end(); process.exit(0); });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
