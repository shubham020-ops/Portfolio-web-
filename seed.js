import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!process.env.DATABASE_URL || !adminEmail || !adminPassword) {
  throw new Error('DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD are required for seeding.');
}

const root = path.resolve(new URL('.', import.meta.url).pathname, '..');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query(await fs.readFile(path.join(root, 'server', 'schema.sql'), 'utf8'));
    const hash = await bcrypt.hash(adminPassword, 12);
    await client.query(
      `INSERT INTO admins (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [adminEmail.toLowerCase(), hash]
    );

    const projects = [
      ['Nexcent', 'SaaS Landing Page', ['Next.js', 'Tailwind CSS'], true, '#', 1],
      ['ShopKart', 'E-commerce Website', ['React', 'Node.js'], false, '#', 2],
      ['Doob.', 'Creative Agency', ['React', 'Framer Motion'], false, '#', 3],
      ['Velora', 'Portfolio Template', ['Next.js', 'GSAP'], false, '#', 4]
    ];
    for (const p of projects) {
      await client.query(
        `INSERT INTO projects (title, category, technologies, featured, link, sort_order)
         SELECT $1,$2,$3::jsonb,$4,$5,$6
         WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title=$1)`,
        [p[0], p[1], JSON.stringify(p[2]), p[3], p[4], p[5]]
      );
    }

    const experience = [
      ['2022', 'Started Web Development', '', 'Began my journey with HTML, CSS & JavaScript', 1],
      ['2023', 'Frontend Developer', 'at TechFlow', 'Worked on multiple client projects', 2],
      ['2024', 'Full Stack Developer', 'Freelancer', 'Building complete web solutions', 3],
      ['2025', 'Building My Own Products', '', 'Working on SaaS & AI based products', 4]
    ];
    for (const e of experience) {
      await client.query(
        `INSERT INTO experiences (year,title,highlight,description,sort_order)
         SELECT $1,$2,$3,$4,$5 WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE year=$1 AND title=$2)`, e
      );
    }

    const testimonials = [
      ['Rohit Sharma', 'Founder, Nexcent', '“Devansh is an exceptional developer. He delivered our project on time with amazing quality.”', 'RS', 1],
      ['Aarav Mehta', 'CEO, TechNova', '“Working with Devansh was smooth, creative and professional. The final experience was beyond our expectations.”', 'AM', 2],
      ['Priya Verma', 'Product Manager', '“He understands design as well as development. The attention to detail made a huge difference.”', 'PV', 3]
    ];
    for (const t of testimonials) {
      await client.query(
        `INSERT INTO testimonials (name,role,quote,initials,sort_order)
         SELECT $1,$2,$3,$4,$5 WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name=$1 AND role=$2)`, t
      );
    }


    const services = [
      ['Frontend Development','Fast, responsive and polished interfaces built for real users.','ti ti-layout-dashboard',['React','Next.js','Responsive UI'],1],
      ['Backend Development','Secure APIs and server-side systems ready for production workloads.','ti ti-server-2',['Node.js','Express','PostgreSQL'],2],
      ['UI / UX Implementation','Modern visual systems translated into smooth, accessible web experiences.','ti ti-palette',['Design Systems','Animations','Accessibility'],3],
      ['Performance & Optimization','Practical improvements for speed, stability, SEO and maintainability.','ti ti-gauge',['Core Web Vitals','SEO','Clean Code'],4]
    ];
    for (const s of services) {
      await client.query(
        `INSERT INTO services (title,description,icon,features,sort_order)
         SELECT $1,$2,$3,$4::jsonb,$5 WHERE NOT EXISTS (SELECT 1 FROM services WHERE title=$1)`,
        [s[0],s[1],s[2],JSON.stringify(s[3]),s[4]]
      );
    }

    const statusStats = [
      ['skills',8,'+','Skills','ti ti-code',1],
      ['projects',10,'+','Projects','ti ti-layers-intersect',2],
      ['clients',5,'+','Clients','ti ti-users',3],
      ['experience',2,'+','Experience','ti ti-briefcase',4]
    ];
    for (const s of statusStats) {
      await client.query(
        `INSERT INTO status_stats (stat_key,value,suffix,label,icon,sort_order)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (stat_key) DO NOTHING`, s
      );
    }
    console.log('Database schema and seed data are ready.');
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch((error) => { console.error(error); process.exit(1); });
