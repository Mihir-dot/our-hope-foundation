# Our Hope Foundation

Australian NPO platform for **disability family education and community development**.

**Brand:** Our Hope Foundation  
**Tagline:** Nurturing Abilities · Inspiring Futures · Building Tomorrows

## Stack

| Layer | Tech |
|-------|------|
| Web | Next.js 15 (App Router), React 19, Framer Motion |
| API | Node.js, Express, TypeScript |
| DB | MongoDB + Mongoose |
| Payments | Stripe Checkout (one-off + monthly, AUD) |
| Monorepo | pnpm workspaces |

## Quick start

```bash
# Requires Node 20+, pnpm 9, MongoDB on localhost:27017
export PATH="$HOME/.local/bin:$PATH"

cp .env.example .env   # already present in this workspace
pnpm install
pnpm --filter @ohf/shared build
pnpm seed
pnpm dev               # API :4000 + Web :3000
```

- Public site: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  
- API health: http://localhost:4000/api/v1/health  

**Seed owner**

- Email: `owner@ourhopefoundation.org.au`  
- Password: `ChangeMeOwner123!`

## Apps

- `apps/web` — public site + `/admin` CMS  
- `apps/api` — REST API under `/api/v1`  
- `packages/shared` — brand, vocab, Zod schemas  

## Features (Phase 1)

- Dynamic pages (block CMS), menus, programs, learning pathways, resources, stories, speakers  
- Events / webinars with registration + waitlist  
- Stripe donate (mock checkout when keys empty)  
- Enquiries CRM, newsletter double opt-in  
- Media (local `/uploads` or S3)  
- Roles: owner, admin, editor, finance  
- SEO: sitemap, robots, metadata  

## Design mockups

See `design-mockups/` for earlier UI directionals. Live UI uses the Our Hope Foundation logo colours (navy, teal, orange donate CTAs) on a light canvas.
