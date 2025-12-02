# 01 - Prosjektoppsett

Denne guiden viser hvordan du oppretter et nytt Next.js-prosjekt fra scratch.

---

## Innhold

1. [Forutsetninger](#forutsetninger)
2. [Opprett prosjekt](#opprett-prosjekt)
3. [Prosjektstruktur](#prosjektstruktur)
4. [Konfigurasjonsfiler](#konfigurasjonsfiler)
5. [Mappestruktur](#mappestruktur)
6. [Scripts](#scripts)
7. [Sjekkliste](#sjekkliste)

---

## Forutsetninger

### Nodvendig programvare

| Program | Minimum versjon | Sjekk kommando |
|---------|-----------------|----------------|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| Git | 2.x | `git --version` |

### Installer Node.js

**macOS (Homebrew):**
```bash
brew install node
```

**Windows:**
Last ned fra https://nodejs.org

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Opprett prosjekt

### Steg 1: Kjor create-next-app

```bash
npx create-next-app@latest mitt-prosjekt
```

### Steg 2: Svar pa sporsmal

```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like your code inside a `src/` directory? … Yes
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to use Turbopack for `next dev`? … Yes
✔ Would you like to customize the import alias (@/* by default)? … No
```

**Anbefalte valg:**
- **TypeScript:** Yes - Gir type-sikkerhet
- **ESLint:** Yes - Finner feil i koden
- **Tailwind CSS:** Yes - Moderne CSS-rammeverk
- **src/ directory:** Yes - Bedre organisering
- **App Router:** Yes - Nyeste Next.js-mønster
- **Turbopack:** Yes - Raskere utvikling (valgfritt)
- **Import alias:** No - Standard @/* er bra

### Steg 3: Ga inn i prosjektmappen

```bash
cd mitt-prosjekt
```

### Steg 4: Start utviklingsserver

```bash
npm run dev
```

Apne http://localhost:3000 i nettleseren.

---

## Prosjektstruktur

Etter opprettelse ser prosjektet slik ut:

```
mitt-prosjekt/
├── node_modules/          # Installerte pakker (ikke rediger)
├── public/                # Statiske filer (bilder, ikoner)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   └── app/
│       ├── fonts/         # Lokale fonter
│       ├── favicon.ico    # Nettleser-ikon
│       ├── globals.css    # Globale stiler
│       ├── layout.tsx     # Rot-layout
│       └── page.tsx       # Hjemmeside
├── .eslintrc.json         # ESLint-konfigurasjon
├── .gitignore             # Git-ignorering
├── next-env.d.ts          # Next.js TypeScript-typer
├── next.config.ts         # Next.js-konfigurasjon
├── package-lock.json      # Versjonslås
├── package.json           # Prosjektinfo og avhengigheter
├── postcss.config.mjs     # PostCSS (for Tailwind)
├── README.md              # Prosjektbeskrivelse
├── tailwind.config.ts     # Tailwind-konfigurasjon
└── tsconfig.json          # TypeScript-konfigurasjon
```

---

## Konfigurasjonsfiler

### package.json

```json
{
  "name": "mitt-prosjekt",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^16.0.0",
    "postcss": "^8",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Viktig:** `paths` lar deg bruke `@/` i stedet for relative stier:
```typescript
// I stedet for:
import { Button } from '../../../components/ui/button'

// Kan du skrive:
import { Button } from '@/components/ui/button'
```

### next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Legg til konfigurasjon her ved behov
};

export default nextConfig;
```

---

## Mappestruktur

### Opprett nodvendige mapper

```bash
# Fra prosjektets rotmappe
mkdir -p src/actions
mkdir -p src/components/ui
mkdir -p src/components/functional
mkdir -p src/config
mkdir -p src/constants
mkdir -p src/custom-layout
mkdir -p src/interfaces
mkdir -p src/lib
mkdir -p src/types
mkdir -p "src/app/(public)"
mkdir -p "src/app/(private)"
```

### Endelig struktur

```
src/
├── actions/              # Server Actions (backend-logikk)
├── app/
│   ├── (public)/         # Offentlige sider
│   ├── (private)/        # Beskyttede sider
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/               # UI-komponenter (Shadcn)
│   └── functional/       # Funksjonelle komponenter
├── config/               # Konfigurasjon (database, etc.)
├── constants/            # Konstanter og statiske data
├── custom-layout/        # Layout-komponenter
├── interfaces/           # TypeScript-interfaces
├── lib/                  # Hjelpefunksjoner
└── types/                # Type-definisjoner
```

### Forklaring av mapper

| Mappe | Formal | Eksempler |
|-------|--------|-----------|
| `actions/` | Server-side logikk | `users.ts`, `jobs.ts` |
| `app/(public)/` | Sider uten innlogging | Login, Register, Home |
| `app/(private)/` | Sider med innlogging | Dashboard, Profile |
| `components/ui/` | Gjenbrukbare UI-deler | Button, Input, Select |
| `components/functional/` | Logikk-komponenter | LogoutButton, SearchBar |
| `config/` | Tilkoblinger | Supabase, Firebase |
| `constants/` | Statiske verdier | Roller, kategorier |
| `custom-layout/` | Layout-wrapper | Header, Sidebar |
| `interfaces/` | TypeScript-typer | IUser, IJob |
| `lib/` | Hjelpefunksjoner | utils, formatters |
| `types/` | Globale typer | CSS modules |

---

## Scripts

### Tilgjengelige kommandoer

```bash
# Start utviklingsserver (med hot reload)
npm run dev

# Bygg for produksjon
npm run build

# Start produksjonsserver
npm run start

# Kjor ESLint
npm run lint
```

### Tips for utvikling

```bash
# Kjor pa en spesifikk port
npm run dev -- -p 3001

# Apne i nettleser automatisk
npm run dev -- -o

# Vis verbose output
npm run dev -- --verbose
```

---

## Opprett basisfiler

### src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Merk:** Denne krever `clsx` og `tailwind-merge`. Installeres i neste guide.

### src/types/css.d.ts

```typescript
declare module '*.css'
```

### .env

```env
# Database
SUPABASE_PROJECT_URL=
SUPABASE_API_KEY=

# Autentisering
JWT_SECRET=
```

**VIKTIG:** Legg til `.env` i `.gitignore`:

```
# .gitignore
.env
.env.local
.env.*.local
```

---

## Sjekkliste

### Prosjektoppsett
- [ ] Node.js 18+ installert
- [ ] `npx create-next-app@latest` kjort
- [ ] TypeScript valgt
- [ ] Tailwind CSS valgt
- [ ] App Router valgt
- [ ] `src/` directory valgt

### Mappestruktur
- [ ] `src/actions/` opprettet
- [ ] `src/components/ui/` opprettet
- [ ] `src/components/functional/` opprettet
- [ ] `src/config/` opprettet
- [ ] `src/constants/` opprettet
- [ ] `src/custom-layout/` opprettet
- [ ] `src/interfaces/` opprettet
- [ ] `src/lib/` opprettet
- [ ] `src/types/` opprettet
- [ ] `src/app/(public)/` opprettet
- [ ] `src/app/(private)/` opprettet

### Konfigurasjon
- [ ] `.env` fil opprettet
- [ ] `.env` lagt til i `.gitignore`
- [ ] `src/lib/utils.ts` opprettet
- [ ] `src/types/css.d.ts` opprettet

### Verifisering
- [ ] `npm run dev` fungerer
- [ ] http://localhost:3000 viser siden
- [ ] Ingen feil i terminalen

---

## Neste steg

Ga videre til [02-TAILWIND-SHADCN.md](./02-TAILWIND-SHADCN.md) for a sette opp styling.

---

## Feilsoking

### "Command not found: npx"

Node.js er ikke installert. Installer fra nodejs.org.

### "Port 3000 is already in use"

```bash
# Finn prosessen
lsof -i :3000

# Drep prosessen (erstatt PID)
kill -9 <PID>

# Eller bruk en annen port
npm run dev -- -p 3001
```

### "Module not found"

```bash
# Slett node_modules og installer pa nytt
rm -rf node_modules
rm package-lock.json
npm install
```

---

*Neste: [02-TAILWIND-SHADCN.md](./02-TAILWIND-SHADCN.md)*
