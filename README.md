# Shubham.dev Portfolio — Production Backend

This version keeps the existing animated frontend and adds a production-oriented Express API with PostgreSQL support, validation, security middleware, rate limiting, admin JWT authentication, CRUD APIs, and a real contact-message workflow.

## Stack
- Frontend: HTML, CSS, vanilla JavaScript, GSAP/ScrollTrigger
- Backend: Node.js + Express
- Database: PostgreSQL
- Validation: Zod
- Auth: JWT + bcrypt
- Security: Helmet, CORS, rate limiting, payload limits, parameterized SQL

## Run locally
1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env` and update the database credentials.
3. Create the PostgreSQL database named in `DATABASE_URL`.
4. Run `npm install`.
5. Run `npm run seed` once to create tables, admin and demo content.
6. Run `npm start`.
7. Open `http://localhost:3000`.

## API
Public:
- `GET /api/health`
- `GET /api/projects`
- `GET /api/experience`
- `GET /api/testimonials`
- `POST /api/contact`

Admin:
- `POST /api/auth/login`
- `GET/POST /api/admin/projects`
- `PUT/DELETE /api/admin/projects/:id`
- `GET/POST /api/admin/experience`
- `PUT/DELETE /api/admin/experience/:id`
- `GET/POST /api/admin/testimonials`
- `PUT/DELETE /api/admin/testimonials/:id`
- `GET /api/admin/messages`
- `PATCH /api/admin/messages/:id`

Admin endpoints require `Authorization: Bearer <token>`.

## Production checklist
- Use a managed PostgreSQL instance and a strong random `JWT_SECRET`.
- Set `NODE_ENV=production`, `CORS_ORIGIN` to the real site origin and `TRUST_PROXY=true` only when deployed behind a trusted reverse proxy.
- Never commit `.env` or production credentials.
- Put HTTPS in front of the Node process through the hosting provider/reverse proxy.
- Run `npm run seed` only during initial setup or controlled migrations.
