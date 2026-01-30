
# PCHubBR

PC hardware price comparison site (CPUs, GPUs, Motherboards). Shows offers across stores, price history, alerts, and computes automatic `offerScore` for highlighting good deals.

---

## Quick overview

- Framework: Next.js (App Router)
- Language: TypeScript
- ORM: Prisma (PostgreSQL)
- UI: Tailwind CSS + shadcn/ui + Radix

This README documents how to clone, configure and run the project locally (including DB setup and seed data) so you can replicate the working environment.

---

## Prerequisites

- Node.js >= 18.18.0 (20.x recommended)
- npm >= 9 (or pnpm/yarn)
- PostgreSQL database (Supabase recommended) with connection strings
- Git

Optional (recommended for development):
- `npx` (comes with npm)
- `psql` (or Supabase dashboard) to inspect DB

---

## Repository clone

```bash
git clone https://github.com/IrmaoDJorel/PCHubBR.git
cd PCHubBR
```

---

## Environment variables

Create a `.env` file in the project root (copy `.env.example` if present). Minimum required variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="random-string-min-32-chars"
RESEND_API_KEY="re_xxx"
EMAIL_FROM="noreply@yourdomain.com"
CRON_SECRET="random-cron-token"
```

Notes:
- Use Supabase connection strings if using Supabase. `DATABASE_URL` is usually the pooled URL; `DIRECT_URL` is the direct connection used for migrations/seeding.
- Keep secrets out of version control.

---

## Install dependencies

```bash
npm install
# or: pnpm install
```

---

## Prisma: generate client, apply schema and seed

After setting `.env`, perform these steps.

1. Generate Prisma Client:

```bash
npx prisma generate
```

2. Apply schema to database (development):

- With migrations (recommended for tracked schema changes):

```bash
npx prisma migrate dev --name init
```

- Or quick sync (no migration files):

```bash
npx prisma db push
```

3. Seed the database with example data (creates stores, products, offers, snapshots and runs the initial offer recalculation):

```bash
npx prisma db seed
```

If seed reports missing tables (Prisma P2021), run `npx prisma db push` or `npx prisma migrate dev` first.

Open Prisma Studio to inspect data:

```bash
npx prisma studio
```

---

## Run the app (development)

Start Next.js dev server:

```bash
npm run dev
```

Default local URL: `http://localhost:3000` (if 3000 busy Next will pick the next port).

If the dev server fails because of a stale lock file, remove the lock and restart (Windows PowerShell):

```powershell
# project root
Remove-Item -Force .next\\dev\\lock
npm run dev
```

---

## Common maintenance & troubleshooting

- Regenerate Prisma client after schema changes:

```bash
npx prisma generate
```

- Re-run seed (safe in dev):

```bash
npx prisma db seed
```

- If products/offers don't appear: ensure `offerScore` values are calculated. Run the offer recalculation script:

```bash
node scripts/run-offer-calculation.js
```

- If you see `prisma.$use is not a function`: the codebase now guards middleware attachment to avoid crashing. To resolve client issues, regenerate Prisma Client and restart the app:

```bash
npx prisma generate
npm run dev
```

- If you see CORS/JSON errors in browser when fetching API routes and the response is HTML starting with `<!DOCTYPE`, check that the API route returned an error page (stack trace) instead of JSON — inspect server terminal for stack traces and fix the underlying error.

- If seed fails due to incompatible DB state, use migrations or reset (warning: destructive):

```bash
npx prisma migrate reset
# then
npx prisma db seed
```

---

## Useful scripts

- `npm run dev` — start development server
- `npm run build` — build production
- `npm run start` — start production server
- `npm run lint` — run linter
- `npx prisma studio` — open Prisma Studio

Project-specific utilities (under `scripts/`):
- `node scripts/run-offer-calculation.js` — recalculate offers for all products
- `node scripts/seed-offers.js` — add sample offers

---

## Project structure (high level)

- `app/` — Next.js App Router pages and API routes
- `components/` — React UI components
- `lib/` — utilities (including `prisma.ts` client)
- `prisma/` — Prisma schema, seeds and migrations
- `scripts/` — helper scripts

---

## Contributing

1. Fork repository
2. Create a feature branch: `git checkout -b feature/your-change`
3. Commit and push
4. Open a PR describing the change

Follow existing code style and run linters/tests before opening PR.

---

## License & authorship

This project is authored by Ian Raçano Gonzalez (project owner). Check repository metadata for license details.

---

If you want, I can:
- try again to write this directly to `README.md` in the repo,
- create a `.env.example` file with placeholders,
- or open a branch and commit these docs.

Thank you — good luck developing!
