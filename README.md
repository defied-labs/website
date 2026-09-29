# Defied
An open-source oriented software development collective that builds high-quality software products and services for businesses and individuals.

## Defied website (The one that you find here)
A fullstack web application built with Next.js 15, NestJS, Prisma, Payload CMS, and Fumadocs. It serves as a marketing site and documentation hub for Defied.

![Defied Hero](apps/web/public/og-image.png)

**Try it live:** [defied.dev](https://defied.sgattix.online)

---

## Quick Start
Open this link: [defied.dev](https://defied.sgattix.online)

---

## Features
- Landing page with marketing content and call-to-actions
- Fumadocs-powered documentation site with MDX support

---

## How to run the project locally
1. Clone the repository:
   ```bash
   git clone https://github.com/defied-labs/website.git
   ```
2. Navigate to the project directory:
   ```bash
    cd website
    ```
3. Install dependencies:
   ```bash
    pnpm install
    ```
    4. Start the development server:
   ```bash
    pnpm dev
    ```

## Environment configuration

Each app and package has an `.env.example` that documents its contract. Copy the
example into the relevant workspace directory and keep secrets out of git.

The server and web app support `APP_ENV=development`, `staging`, or `production`.
They load `.env.<APP_ENV>` first and then `.env` (the web app also checks
`.env.local`). Missing required values fail startup or build with a validation
error; there are no production fallbacks for secrets, URLs, or database targets.

The Nest server logs the selected environment and non-secret provider endpoints at
startup. Its anonymous operational checks are available at `/health`,
`/health/db`, `/health/auth`, and `/health/mail`.

## How it works
The landing page uses WebGL for interactive 3D graphics, while the documentation site is powered by Fumadocs, which allows for easy content management and MDX support. The backend is built with NestJS and Prisma, providing a robust API for the frontend to consume.

## Credits
- [Next.js](https://nextjs.org/)
- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [Payload CMS](https://payloadcms.com/)
- [Fumadocs](https://fumadocs.com/)
