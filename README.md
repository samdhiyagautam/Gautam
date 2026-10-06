# Portfolio - Recruiter-First Personal Portfolio

A premium, recruiter-first personal portfolio and professional brand system built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Recruiter-First Design**: Optimized for 20-30 second profile comprehension
- **Complete CMS**: Self-managed admin panel at `/admin`
- **Modern Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Authentication**: Supabase Auth with magic link sign-in
- **Content Management**: Draft → Preview → Publish workflow
- **SEO Ready**: Metadata, Open Graph, sitemap, robots.txt
- **Accessible**: Semantic HTML, keyboard navigation, visible focus states, reduced-motion support (formal WCAG audit not yet performed)
- **Responsive**: Mobile-first design, works on all screen sizes
- **Dark/Light Mode**: System-aware with manual toggle

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Forms**: Server actions with Zod validation
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   │   ├── layout.tsx     # Admin layout with sidebar
│   │   ├── page.tsx       # Dashboard
│   │   ├── profile/       # Profile management
│   │   ├── experience/    # Experience management
│   │   ├── skills/        # Skills management
│   │   ├── projects/      # Projects management
│   │   ├── resume/        # Resume management
│   │   ├── seo/           # SEO settings
│   │   └── settings/      # Site settings
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   ├── about/             # About page
│   ├── experience/        # Experience page
│   ├── skills/            # Skills page
│   ├── projects/          # Projects page
│   ├── resume/            # Resume page
│   ├── contact/           # Contact page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   ├── providers.tsx      # Context providers
│   ├── robots.ts          # robots.txt
│   └── sitemap.ts         # sitemap.xml
├── components/
│   ├── ui/                # Reusable UI primitives
│   ├── portfolio/         # Portfolio-specific components
│   └── admin/             # Admin-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configs
│   ├── supabase/          # Supabase clients
│   ├── auth.ts            # Auth utilities
│   ├── constants.ts       # Site constants
│   └── utils.ts           # Helper functions
├── types/                 # TypeScript type definitions
├── actions/              # Server actions (admin CMS mutations)
├── proxy.ts              # Auth session refresh + admin redirect gate
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Configure your `.env.local` with Supabase credentials
5. Run development server:
   ```bash
   npm run dev
   ```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Your Name Portfolio

# Admin
ADMIN_EMAIL=your_email@example.com

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=portfolio-assets
```

## Admin Panel

Access the admin panel at `/admin` after signing in with your configured admin email.

### Features

- **Dashboard**: Portfolio overview and quick actions
- **Profile**: Manage name, headline, bio, contact info
- **Experience**: Add/edit/delete work experience entries
- **Skills**: Manage skills by category with proficiency levels
- **Projects**: Full project CRUD with featured status
- **Resume**: Upload and version PDF resumes
- **SEO**: Meta tags, Open Graph, structured data
- **Settings**: Auth, appearance, database config

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase Setup

1. Create a new Supabase project
2. Enable Email authentication
3. Create storage bucket `portfolio-assets`
4. Set up Row Level Security policies
5. Add environment variables to Vercel

## Customization

### Content Placeholders

Replace all `[ADD ...]` placeholders in:
- `src/lib/constants.ts` - Profile info, experience, skills, fallback projects
- `src/app/layout.tsx` - SEO metadata
- `.env.local` - Environment variables

### Resume

Add your resume PDF to `public/resume.pdf` to enable download.

### OG Image

Add `public/og-image.png` (1200x630px) for social sharing.

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
```

## License

MIT License - feel free to use for your own portfolio.