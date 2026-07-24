---
noteId: "7850f120875011f18c64adcd1b2aa011"
tags: []

---

# Fildza Portfolio

Personal portfolio for **Mohamad Fildza Azman** — IT Support / Computer Forensics
student. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4,
shadcn/ui (Base UI primitives), Framer Motion, and Supabase.

The public site works immediately with zero configuration: content is
seeded from the resume (`src/lib/resume-data.ts`) and only switches to
live Supabase data once a project is connected. Nothing here is fake
placeholder copy — everything you see out of the box is real, resume-sourced
content; anything not on the resume (achievements, extra certificates, a
resume PDF, a profile photo) is left empty until you add it from `/admin`.

## Stack

- **Next.js 16** (App Router, Turbopack) — see `AGENTS.md`, this version has
  real breaking changes vs. Next 15 (async `params`/`searchParams`,
  `proxy.ts` instead of `middleware.ts`, `images.remotePatterns`, etc.)
- **TypeScript**, **Tailwind CSS v4**, **shadcn/ui** (Base UI, not Radix)
- **Framer Motion** for animation
- **Supabase**: Postgres, Auth, Storage — optional but required for the CMS
- **GitHub REST/GraphQL API** for live projects + activity

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in values, see below — safe to leave blank
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site, resume page,
and admin login all work even with an empty `.env.local` — you just won't
have a working CMS or contact form storage until Supabase is connected.

## Environment Variables

See `.env.example` for the full list. Nothing is required to run `npm run dev`
or `npm run build` — every Supabase-backed feature checks for configuration
first and falls back gracefully (fallback content on the public site, a
"not connected" message in `/admin`).

| Variable | Required for | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | CMS, contact form storage, auth | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same | same |
| `NEXT_PUBLIC_GITHUB_USERNAME` | Projects / GitHub Activity sections | your GitHub handle |
| `GITHUB_TOKEN` | pinned repos + higher rate limits | github.com/settings/tokens (no scopes needed for public data) |
| `NEXT_PUBLIC_SITE_URL` | correct SEO/OpenGraph URLs | your production domain |

## Connecting Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy the Project URL and anon key into `.env.local`.
3. Open the SQL Editor and run, in order:
   - `supabase/schema.sql` — tables, RLS policies, storage bucket
   - `supabase/seed.sql` — seeds the resume content into the database
4. In **Authentication → Users**, create yourself an admin user (email + password).
   This project has a single-admin model: any authenticated user can manage
   content, so don't enable public sign-ups.
5. In **Authentication → Providers → Email**, you can disable "Confirm email"
   for a smoother first login, or confirm the invite email Supabase sends.
6. Sign in at `/admin/login`.

Storage: `schema.sql` creates one public bucket, `portfolio-media`, used for
project images, certificate files/images, resume PDF, and profile photo
uploads from the admin dashboard.

## Admin Dashboard

`/admin` — sign in with the Supabase user you created. From there you can
manage Experience, Education, Projects, Skills, Certificates, Achievements,
Social Links, the resume PDF, the profile photo, and read/manage contact
form submissions. All of it is backed by Supabase + Row Level Security:
public visitors get read-only access to content tables and can only insert
into `contact_messages`; writes everywhere else require an authenticated
session.

## Project Structure

```
src/
  app/
    (site)/            marketing site: layout with navbar/footer, home, /resume
    admin/
      login/            sign-in page
      (dashboard)/       auth-gated CMS pages (one folder per resource)
    actions/            server actions (contact form, auth)
    sitemap.ts, robots.ts, opengraph-image.tsx
  components/
    sections/           homepage sections (hero, about, projects, ...)
    admin/               generic CrudManager table+form used by every admin page
    layout/, shared/, ui/
  lib/
    resume-data.ts       fallback content sourced from the resume
    queries.ts            Supabase-or-fallback data access for the public site
    github.ts              GitHub REST/GraphQL helpers
    supabase/              browser/server/admin Supabase clients
    admin-actions.ts        generic authenticated CRUD server actions
  proxy.ts              Next 16's middleware replacement — refreshes the
                         Supabase session and guards /admin/*
supabase/
  schema.sql            tables, RLS policies, storage bucket
  seed.sql               resume content seed data
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel ([vercel.com/new](https://vercel.com/new)).
3. Add the environment variables from `.env.example` in the Vercel project
   settings (Production + Preview).
4. Deploy. No build configuration needed — `next build` just works.
5. Update `NEXT_PUBLIC_SITE_URL` to your real Vercel/custom domain and redeploy
   so sitemap/OpenGraph URLs are correct.

## Notes on this Next.js version

This project was scaffolded with **Next.js 16.2.11**, not 15 — see
`AGENTS.md` for the note on breaking changes, and
`node_modules/next/dist/docs/app/guides/upgrading/version-16.md` for the
full list. The parts that affect this codebase: `params`/`searchParams` are
always Promises, `src/proxy.ts` replaces `middleware.ts`, and
`images.remotePatterns` is used instead of the deprecated `images.domains`.
