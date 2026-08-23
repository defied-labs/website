# Defied

An open-source oriented software development collective that builds high-quality software products and services for businesses and individuals.

![Defied Hero](apps/web/public/og-image.png)

**Try it live:** [defied.dev](https://defied.sgattix.online) <!-- Update with actual deployed URL -->

---

## Quick Start

### Web Application (Marketing Site & Dashboard)

```bash
# Install dependencies
pnpm install

# Start all development servers
pnpm dev

# Or start just the web app on port 2029
pnpm dev:web
```

Open [http://localhost:2029](http://localhost:2029) to see the web application.

### API Server

```bash
# Start the NestJS API server on port 3000 (default)
pnpm dev:server
```

### Documentation Site

```bash
# Start the docs site on port 4001
pnpm dev:docs
```

### Database

```bash
# Push schema changes to database
pnpm db:push

# Open Prisma Studio to view/edit data
pnpm db:studio

# Generate Prisma Client after schema changes
pnpm db:generate
```

---

## Features

- **Modern Web Stack** — Next.js 15 with React 19, Tailwind CSS v4, and React Compiler
- **Type-Safe API** — NestJS server with Prisma ORM and Zod validation
- **Authentication** — Better Auth with magic links, social providers, and Stripe billing
- **Content Management** — Payload CMS integrated for dynamic content
- **Documentation** — Fumadocs-powered docs site with MDX support
- **Developer Experience** — Turborepo monorepo with shared configs, TypeScript strict mode
- **Database** — MariaDB via Prisma with type-safe client generation
- **Design System** — shadcn/ui components with Radix primitives and custom animations

---

## How It Works

### Monorepo Architecture

This project uses **Turborepo** to manage a monorepo containing:

| Package           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `apps/web`        | Next.js 15 marketing site, dashboard, and auth flows     |
| `apps/server`     | NestJS REST API with Prisma, Better Auth, Stripe         |
| `apps/docs`       | Fumadocs documentation site with MDX                     |
| `packages/auth`   | Shared Better Auth configuration & adapters              |
| `packages/db`     | Prisma schema, migrations, and generated client          |
| `packages/config` | Shared TypeScript, ESLint, Tailwind configs              |
| `packages/env`    | Zod-validated environment variables for all environments |

### Key Technical Decisions

- **React Server Components + Server Actions** — The web app leverages Next.js 15's RSC architecture for minimal client-side JS, with Server Actions handling mutations (auth, forms, Stripe checkout).
- **Shared Auth Package** — `@defied/auth` centralizes Better Auth config (Prisma adapter, email, Stripe) so both web and server stay in sync without duplication.
- **Prisma + MariaDB** — Chosen for relational fidelity and Prisma's type-safe client; the `@prisma/adapter-mariadb` driver enables serverless-compatible connections.
- **Payload CMS on SQLite (dev) / Postgres (prod)** — Payload runs inside the Next.js app for content editing; dev uses file-based SQLite for zero-config local development.
- **Turborepo Pipeline** — `dev`, `build`, `check-types` are cached and parallelized; `db:*` tasks target only the db package for fast iteration.

---

## Environment Variables

Create `.env` files in each app/package as needed. The `@defied/env` package validates all variables at startup.

### Required for Web (`apps/web/.env`)

```env
# Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:2029

# Database (Prisma)
DATABASE_URL="mysql://user:pass@localhost:3306/defied"

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass
EMAIL_FROM="Defied <noreply@defied.dev>"

# Payload CMS
PAYLOAD_SECRET=your-payload-secret
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:2029
```

### Required for Server (`apps/server/.env`)

```env
# Same as web, plus:
PORT=3000
NODE_ENV=development
```

> **Note:** Copy `.env.example` files (if present) and fill in values. Never commit real secrets.

---

## Local Development Requirements

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 10.0.0 (enforced via `packageManager` field)
- **MariaDB** ≥ 10.6 (or use Docker: `docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=defied mariadb:10.6`)
- **Bun** ≥ 1.1 (optional, for `compile` script in server)

---

## Project Structure

```
defied/
├── apps/
│   ├── web/          # Next.js 15 marketing site + dashboard
│   ├── server/       # NestJS REST API
│   └── docs/         # Fumadocs documentation
├── packages/
│   ├── auth/         # Better Auth shared config
│   ├── db/           # Prisma schema & client
│   ├── config/       # Shared TS/ESLint/Tailwind config
│   └── env/          # Zod-validated env schemas
├── turbo.json        # Turborepo pipeline config
└── package.json      # Root workspace scripts
```

---

## Credits & Acknowledgements

- **Better Auth** — Modern authentication for TypeScript apps
- **Prisma** — Type-safe database ORM
- **Payload CMS** — Headless CMS built for Next.js
- **Fumadocs** — Beautiful documentation framework
- **shadcn/ui / Radix UI** — Accessible component primitives
- **Tailwind CSS** — Utility-first styling
- **Turborepo** — High-performance build system
- **NestJS** — Progressive Node.js framework
- **Stripe** — Payments infrastructure
- **Nodemailer** — Email delivery
- **All open-source contributors** who make this ecosystem possible

---

## License

MIT License — see [LICENSE](LICENSE) for details.
