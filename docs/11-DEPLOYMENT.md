# 11 - Deployment

Denne guiden viser hvordan du deployer Next.js-applikasjonen til produksjon.

---

## Innhold

1. [Forberedelser](#forberedelser)
2. [Vercel deployment](#vercel-deployment)
3. [Miljøvariabler](#miljøvariabler)
4. [Bygg og test lokalt](#bygg-og-test-lokalt)
5. [Supabase produksjon](#supabase-produksjon)
6. [Domene og SSL](#domene-og-ssl)
7. [Andre plattformer](#andre-plattformer)
8. [Sjekkliste](#sjekkliste)

---

## Forberedelser

### Sjekk før deployment

1. **Miljøvariabler dokumentert**
   ```env
   SUPABASE_PROJECT_URL=
   SUPABASE_API_KEY=
   JWT_SECRET=
   ```

2. **Ingen hardkodede verdier**
   ```typescript
   // FEIL
   const apiUrl = 'https://xxx.supabase.co';

   // RIKTIG
   const apiUrl = process.env.SUPABASE_PROJECT_URL;
   ```

3. **Bygg fungerer lokalt**
   ```bash
   npm run build
   ```

4. **Ingen TypeScript-feil**
   ```bash
   npm run lint
   ```

### Sjekkliste før deploy

- [ ] Alle miljøvariabler i `.env.example`
- [ ] `.env` er i `.gitignore`
- [ ] `npm run build` fungerer
- [ ] `npm run lint` ingen feil
- [ ] Supabase RLS policies konfigurert
- [ ] Sensitiv data fjernet fra kode

---

## Vercel deployment

### Hvorfor Vercel?

- Laget av Next.js-teamet
- Automatisk CI/CD
- Edge network (rask globally)
- Gratis hobby-plan

### Steg 1: Push til GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Steg 2: Koble til Vercel

1. Gå til [vercel.com](https://vercel.com)
2. Klikk "Sign Up" → "Continue with GitHub"
3. Klikk "Add New..." → "Project"
4. Velg ditt repository
5. Klikk "Import"

### Steg 3: Konfigurer prosjekt

| Innstilling | Verdi |
|-------------|-------|
| Framework Preset | Next.js |
| Root Directory | `./` (eller `src` hvis relevant) |
| Build Command | `npm run build` |
| Output Directory | `.next` |

### Steg 4: Legg til miljøvariabler

I Vercel dashboard:
1. Gå til prosjektet
2. Settings → Environment Variables
3. Legg til:

```
SUPABASE_PROJECT_URL = https://xxx.supabase.co
SUPABASE_API_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6...
JWT_SECRET = din_hemmelige_nøkkel
```

**Viktig:** Velg hvilke environments (Production, Preview, Development)

### Steg 5: Deploy

Klikk "Deploy" - Vercel vil:
1. Klone repository
2. Installere avhengigheter
3. Kjøre build
4. Deploye til edge network

---

## Miljøvariabler

### Vercel miljøer

| Miljø | Bruk | URL |
|-------|------|-----|
| Production | Live site | ditt-prosjekt.vercel.app |
| Preview | Pull requests | ditt-prosjekt-git-branch.vercel.app |
| Development | Lokal utvikling | localhost:3000 |

### Legge til variabler

**Via Dashboard:**
1. Project Settings → Environment Variables
2. Add New
3. Velg miljøer
4. Save

**Via CLI:**
```bash
# Installer Vercel CLI
npm i -g vercel

# Logg inn
vercel login

# Legg til variabel
vercel env add SUPABASE_PROJECT_URL
```

### Sensitive variabler

For ekstra sikkerhet:
- Bruk Vercel's "Sensitive" toggle
- Variabler vises ikke i UI etter lagring
- Bruk forskjellige verdier per miljø

---

## Bygg og test lokalt

### Bygg for produksjon

```bash
npm run build
```

Output viser:
```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB        89.2 kB
├ ○ /login                               4.1 kB        88.1 kB
├ ○ /register                            4.3 kB        88.3 kB
├ ○ /job-seeker/dashboard                3.8 kB        87.8 kB
└ ○ /recruiter/dashboard                 3.9 kB        87.9 kB

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses getStaticProps)
λ  (Dynamic)  server-rendered on demand using Node.js
```

### Start produksjonsserver lokalt

```bash
npm run start
```

Åpne http://localhost:3000 og test:
- Alle sider laster
- Autentisering fungerer
- Database-tilkobling fungerer

### Vanlige build-feil

#### TypeScript-feil
```bash
# Sjekk typer
npx tsc --noEmit
```

#### ESLint-feil
```bash
npm run lint
# Eller fiks automatisk
npm run lint -- --fix
```

#### Manglende miljøvariabler
```typescript
// Legg til fallback eller sjekk
if (!process.env.SUPABASE_PROJECT_URL) {
  throw new Error('Missing SUPABASE_PROJECT_URL');
}
```

---

## Supabase produksjon

### Sikkerhet for produksjon

#### 1. Strengere RLS policies

```sql
-- Kun egen profil
CREATE POLICY "users_read_own_profile"
ON user_profiles
FOR SELECT
USING (auth.uid()::text = id::text);

-- Kun rekrutterer kan opprette jobber
CREATE POLICY "only_recruiters_create_jobs"
ON jobs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id::text = auth.uid()::text
    AND role = 'recruiter'
  )
);
```

#### 2. Begrens API-tilgang

I Supabase Dashboard:
1. Authentication → URL Configuration
2. Legg til din Vercel-URL i "Site URL"
3. Legg til i "Redirect URLs"

#### 3. Overvåking

- Aktiver Supabase logs
- Sett opp alerts for feil
- Monitor database-bruk

---

## Domene og SSL

### Legg til custom domene

1. I Vercel: Project Settings → Domains
2. Klikk "Add"
3. Skriv inn domenet (f.eks. `minapp.no`)
4. Følg DNS-instruksjonene

### DNS-oppsett

**For apex domain (minapp.no):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomain (www.minapp.no):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL

Vercel håndterer SSL automatisk:
- Gratis Let's Encrypt sertifikater
- Automatisk fornyelse
- HTTPS enforced

---

## Andre plattformer

### Netlify

```bash
# Installer
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Railway

1. Gå til [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Velg repository
4. Legg til miljøvariabler
5. Deploy

### Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

**next.config.ts for Docker:**
```typescript
const nextConfig = {
  output: 'standalone',
};
```

---

## CI/CD med GitHub Actions

### Automatisk deployment

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Overvåking og logging

### Vercel Analytics

1. Project Settings → Analytics
2. Enable Web Analytics
3. Legg til i `layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Feilsporing med Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Sjekkliste

### Før deployment
- [ ] `npm run build` fungerer
- [ ] `npm run lint` ingen feil
- [ ] Miljøvariabler dokumentert
- [ ] `.env` i `.gitignore`
- [ ] Sensitiv data fjernet

### Vercel oppsett
- [ ] Repository koblet
- [ ] Miljøvariabler lagt til
- [ ] Build vellykket
- [ ] Preview deployments fungerer

### Supabase
- [ ] RLS policies for produksjon
- [ ] Site URL konfigurert
- [ ] API-nøkler sikret

### Post-deployment
- [ ] Alle sider fungerer
- [ ] Autentisering fungerer
- [ ] Database-tilkobling fungerer
- [ ] Custom domene (valgfritt)
- [ ] SSL aktivert
- [ ] Analytics/logging (valgfritt)

---

## Oppsummering

Gratulerer! Du har nå en fullstendig guide for å bygge og deploye en Next.js fullstack-applikasjon.

### Hva du har lært

1. **Prosjektoppsett** - Next.js med TypeScript
2. **Styling** - Tailwind CSS og Shadcn/ui
3. **Database** - Supabase med PostgreSQL
4. **TypeScript** - Interfaces og typer
5. **Autentisering** - bcrypt og JWT
6. **Skjemaer** - React Hook Form og Zod
7. **Rutebeskyttelse** - proxy.ts
8. **Layouts** - Dynamiske layouts
9. **Sider** - App Router
10. **Komponenter** - Gjenbrukbare UI
11. **Deployment** - Vercel

### Neste skritt

- Legg til flere features (jobbsøknader, profiler)
- Implementer søk og filtrering
- Legg til e-postvarsler
- Implementer chat/messaging
- Legg til betalingsintegrasjon

---

*Forrige: [10-COMPONENTS.md](./10-COMPONENTS.md) | Tilbake til: [00-INDEX.md](./00-INDEX.md)*
