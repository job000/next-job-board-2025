# Next-Hire Job Board - Komplett Prosjektdokumentasjon

En fullstendig guide til prosjektet med forklaringer og instruksjoner for å bygge lignende løsninger.

---

## Innholdsfortegnelse

1. [Prosjektoversikt](#prosjektoversikt)
2. [Teknologier brukt](#teknologier-brukt)
3. [Mappestruktur](#mappestruktur)
4. [Kom i gang fra scratch](#kom-i-gang-fra-scratch)
5. [Konfigurasjonsfiler forklart](#konfigurasjonsfiler-forklart)
6. [Kildekode forklart](#kildekode-forklart)
7. [UI-komponenter](#ui-komponenter)
8. [Database-oppsett](#database-oppsett)
9. [Autentisering](#autentisering)
10. [Gjenbrukbare deler](#gjenbrukbare-deler)
11. [Videreutvikling](#videreutvikling)

---

## Prosjektoversikt

### Hva er dette prosjektet?

**Next-Hire** er en jobbportal-applikasjon bygget med Next.js 16. Applikasjonen lar:

- **Jobbsøkere** registrere seg og søke etter jobber
- **Rekrutterere** registrere seg og legge ut stillingsannonser

### Hovedfunksjoner

| Funksjon | Status | Beskrivelse |
|----------|--------|-------------|
| Brukerregistrering | Ferdig | Registrer med navn, e-post, passord og rolle |
| Innlogging | Ferdig | Logg inn med e-post, passord og rolle |
| JWT-autentisering | Ferdig | Sikker token-basert autentisering |
| Hjemmeside | Ferdig | Landingsside med hero-seksjon |
| Glemt passord | Påbegynt | Skjelett opprettet |
| Jobbsøk | Ikke startet | Planlagt funksjon |
| Stillingsannonser | Ikke startet | Planlagt funksjon |

### Arkitektur

```
┌─────────────────────────────────────────────────────────────┐
│                       NETTLESER                             │
│                                                             │
│   Hjemmeside    Login-side    Register-side                 │
│   (page.tsx)    (page.tsx)    (page.tsx)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Server Actions
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER                           │
│                                                             │
│   src/actions/users.ts                                      │
│   - registerUser()                                          │
│   - loginUser()                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Supabase Client
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                               │
│                                                             │
│   Tabell: user_profiles                                     │
│   - id, name, email, password, role, etc.                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Teknologier brukt

### Kjerneteknologier

| Teknologi | Versjon | Formål |
|-----------|---------|--------|
| Next.js | 16.0.5 | React-rammeverk med App Router |
| React | 19.2.0 | UI-bibliotek |
| TypeScript | 5.x | Type-sikkerhet |
| Tailwind CSS | 4.x | Styling |

### Backend/Database

| Teknologi | Versjon | Formål |
|-----------|---------|--------|
| Supabase | 2.86.0 | PostgreSQL-database i skyen |
| bcryptjs | 3.0.3 | Passord-hashing |
| jsonwebtoken | 9.0.2 | JWT-tokens |

### Skjema og validering

| Teknologi | Versjon | Formål |
|-----------|---------|--------|
| React Hook Form | 7.67.0 | Skjemahåndtering |
| Zod | 4.1.13 | Skjemavalidering |
| @hookform/resolvers | 5.2.2 | Kobler Zod til React Hook Form |

### UI-komponenter

| Teknologi | Versjon | Formål |
|-----------|---------|--------|
| Shadcn/ui | - | Komponentbibliotek |
| Radix UI | Diverse | Headless UI-komponenter |
| Lucide React | 0.555.0 | Ikoner |
| class-variance-authority | 0.7.1 | Komponentvarianter |

### Andre

| Teknologi | Versjon | Formål |
|-----------|---------|--------|
| react-hot-toast | 2.6.0 | Toast-meldinger |
| js-cookie | 3.0.5 | Cookie-håndtering |
| clsx | 2.1.1 | Betingede CSS-klasser |
| tailwind-merge | 3.4.0 | Merge Tailwind-klasser |

---

## Mappestruktur

```
next-job-board-2025/
│
├── .env                      # Miljøvariabler (hemmelig!)
├── .gitignore                # Filer som ikke skal til Git
├── package.json              # Avhengigheter og scripts
├── tsconfig.json             # TypeScript-konfigurasjon
├── next.config.ts            # Next.js-konfigurasjon
├── postcss.config.mjs        # PostCSS for Tailwind
├── components.json           # Shadcn/ui-konfigurasjon
│
├── public/                   # Statiske filer (bilder, ikoner)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   └── vercel.svg
│
└── src/                      # Kildekode
    │
    ├── actions/              # Server Actions (backend-logikk)
    │   └── users.ts          # Registrering og innlogging
    │
    ├── app/                  # Next.js App Router
    │   ├── layout.tsx        # Rot-layout
    │   ├── globals.css       # Globale stiler
    │   ├── favicon.ico       # Nettleser-ikon
    │   │
    │   ├── (public)/         # Offentlige sider
    │   │   ├── page.tsx      # Hjemmeside (/)
    │   │   ├── login/        # Innlogging (/login)
    │   │   │   └── page.tsx
    │   │   ├── register/     # Registrering (/register)
    │   │   │   └── page.tsx
    │   │   └── forgotpassword/
    │   │       └── forgotpassword.tsx
    │   │
    │   └── (private)/        # Beskyttede sider (tom)
    │
    ├── components/           # Gjenbrukbare komponenter
    │   └── ui/               # Shadcn/ui-komponenter
    │       ├── button.tsx
    │       ├── form.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       └── select.tsx
    │
    ├── config/               # Konfigurasjon
    │   └── supabase-config.ts
    │
    ├── constants/            # Konstanter
    │   └── index.ts          # Brukerroller, etc.
    │
    ├── interfaces/           # TypeScript-typer
    │   └── index.ts          # IUser, etc.
    │
    ├── lib/                  # Hjelpefunksjoner
    │   └── utils.ts          # cn() funksjon
    │
    └── types/                # Type-definisjoner
        └── css.d.ts          # CSS-modultyper
```

### Forklaring av mappene

| Mappe | Formål |
|-------|--------|
| `src/actions/` | Server-side kode som kjører på serveren. Sikker håndtering av database og autentisering. |
| `src/app/` | Alle sider i applikasjonen. Next.js App Router bruker filbasert ruting. |
| `src/app/(public)/` | Sider alle kan se (ikke innlogget). Parenteser lager en "route group" uten URL-påvirkning. |
| `src/app/(private)/` | Sider kun for innloggede brukere. Tomt for nå. |
| `src/components/ui/` | Gjenbrukbare UI-komponenter fra Shadcn/ui. |
| `src/config/` | Konfigurasjonsfiler (database-tilkobling, etc.) |
| `src/constants/` | Verdier som ikke endres (roller, kategorier, etc.) |
| `src/interfaces/` | TypeScript interface-definisjoner |
| `src/lib/` | Hjelpefunksjoner brukt over hele appen |

---

## Kom i gang fra scratch

### Steg 1: Opprett Next.js-prosjekt

```bash
npx create-next-app@latest mitt-prosjekt
```

Velg følgende alternativer:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Turbopack: **Yes** (valgfritt)
- Import alias: **@/*** (standard)

### Steg 2: Installer avhengigheter

```bash
# Hovedavhengigheter
npm install @supabase/supabase-js bcryptjs jsonwebtoken zod react-hook-form @hookform/resolvers react-hot-toast js-cookie lucide-react

# TypeScript-typer
npm install -D @types/bcryptjs @types/jsonwebtoken @types/js-cookie
```

### Steg 3: Installer Shadcn/ui

```bash
npx shadcn@latest init
```

Velg:
- Style: **New York**
- Base color: **Neutral**
- CSS variables: **Yes**

Installer komponenter:

```bash
npx shadcn@latest add button input label select form
```

### Steg 4: Opprett mappestruktur

```bash
# Opprett mapper
mkdir -p src/actions
mkdir -p src/config
mkdir -p src/constants
mkdir -p src/interfaces
mkdir -p src/types
mkdir -p "src/app/(public)/login"
mkdir -p "src/app/(public)/register"
mkdir -p "src/app/(private)"
```

### Steg 5: Opprett miljøvariabler

Opprett `.env` i rotmappen:

```env
SUPABASE_PROJECT_URL=https://din-prosjekt.supabase.co
SUPABASE_API_KEY=din_anon_key
JWT_SECRET=din_hemmelige_nøkkel_minst_32_tegn
```

### Steg 6: Sett opp Supabase

Se [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) for detaljert Supabase-oppsett.

---

## Konfigurasjonsfiler forklart

### package.json

```json
{
  "name": "next-job-board-2025",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",      // Start utviklingsserver
    "build": "next build",  // Bygg for produksjon
    "start": "next start"   // Start produksjonsserver
  },
  "dependencies": {
    // ... alle pakker appen trenger
  },
  "devDependencies": {
    // ... pakker kun for utvikling
  }
}
```

**Viktige kommandoer:**
- `npm run dev` - Start appen lokalt på http://localhost:3000
- `npm run build` - Bygg appen for produksjon
- `npm run start` - Kjør produksjonsversjonen

### tsconfig.json

TypeScript-konfigurasjon. Viktige deler:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]  // Lar deg bruke @/components i stedet for ../../components
    }
  }
}
```

### components.json

Shadcn/ui-konfigurasjon:

```json
{
  "style": "new-york",           // Designstil
  "rsc": true,                   // React Server Components
  "tsx": true,                   // TypeScript
  "tailwind": {
    "css": "src/app/globals.css", // Hvor CSS-variabler er
    "baseColor": "neutral",       // Fargepalett
    "cssVariables": true          // Bruk CSS-variabler
  },
  "aliases": {
    "components": "@/components", // Hvor komponenter lagres
    "utils": "@/lib/utils",       // Hvor utils er
    "ui": "@/components/ui"       // Hvor UI-komponenter er
  }
}
```

---

## Kildekode forklart

### src/config/supabase-config.ts

```typescript
import { createClient } from '@supabase/supabase-js'

// Hent verdier fra miljøvariabler
const supabaseUrl = process.env.SUPABASE_PROJECT_URL || ''
const supabaseKey = process.env.SUPABASE_API_KEY || ''

// Opprett Supabase-klient
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
```

**Hva gjør dette?**
- Oppretter en tilkobling til Supabase-databasen
- Bruker miljøvariabler for å holde nøkler hemmelige
- Eksporterer klienten slik at andre filer kan bruke den

---

### src/interfaces/index.ts

```typescript
export interface IUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'recruiter' | 'job-seeker';
    profile_pic: string;
    resume_url: string;
    bio: string;
    created_at: string | null;
    updated_at: string;
}
```

**Hva gjør dette?**
- Definerer "formen" på en bruker
- TypeScript bruker dette for å gi feilmeldinger hvis du bruker feil datatype
- Alle steder som bruker brukerdata refererer til dette interface

---

### src/constants/index.ts

```typescript
export const userRoles = [
    { label: "Job Seeker", value: "job-seeker" },
    { label: "Recruiter", value: "recruiter" },
]
```

**Hva gjør dette?**
- Definerer tilgjengelige brukerroller
- Brukes i dropdown-menyer på register- og login-sider
- Ett sted å endre hvis du vil legge til nye roller

---

### src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Hva gjør dette?**
- `cn()` kombinerer CSS-klasser intelligent
- Løser konflikter mellom Tailwind-klasser
- Brukes i alle UI-komponenter

**Eksempel:**
```typescript
cn("px-4 py-2", "px-6")  // Resultat: "py-2 px-6" (px-4 erstattes)
cn("bg-red-500", isActive && "bg-blue-500")  // Betinget klasse
```

---

### src/app/layout.tsx

```typescript
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Next Job Board - Dev",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased ${montserrat.className}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

**Hva gjør dette?**
- Rot-layout som wrapper alle sider
- Setter opp Montserrat-font fra Google Fonts
- Inkluderer `<Toaster />` for toast-meldinger
- `children` er innholdet fra hver side

---

### src/app/(public)/page.tsx (Hjemmeside)

```typescript
import React from 'react'
import { Button } from "@/components/ui/button";
import Link from 'next/link';

function HomePage() {
  return (
    <div>
      {/* Header */}
      <div className='px-5 flex justify-between py-5 bg-primary'>
        <h1 className='font-bold text-2xl text-white'>Next-Hire</h1>
        <Button variant={'outline'}>
          <Link href={'/login'}>Login</Link>
        </Button>
      </div>

      {/* Hero-seksjon */}
      <div className="grid grid-cols-2 min-h-[80vh] items-center px-20 mt-5">
        <div className="col-span-1 flex flex-col items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-primary text-4xl font-bold">
              Find your dream job today
            </h1>
            <p className='text-sm font-semibold text-gray-600'>
              Welcome to Next-Hire Job Board...
            </p>
            <Button>
              <Link href={'/register'}>Get Started</Link>
            </Button>
          </div>
        </div>
        <div className="col-span-1 flex justify-center">
          <img src={'...'} className='object-contain h-96' />
        </div>
      </div>
    </div>
  )
}

export default HomePage
```

**Hva gjør dette?**
- Viser landingssiden med logo, CTA-knapper og hero-bilde
- Bruker Tailwind CSS for styling
- Lenker til login og register med Next.js `<Link>`

---

### src/actions/users.ts

Se [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) for fullstendig forklaring av:
- `registerUser()` - Registrering med passord-hashing
- `loginUser()` - Innlogging med JWT-generering

---

## UI-komponenter

### Button (src/components/ui/button.tsx)

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center...",  // Base-stiler
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white...",
        outline: "border bg-background...",
        secondary: "bg-secondary...",
        ghost: "hover:bg-accent...",
        link: "text-primary underline-offset-4...",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

**Bruk:**
```tsx
<Button>Standard knapp</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive" size="lg">Slett</Button>
```

### Form (src/components/ui/form.tsx)

Integrerer React Hook Form med UI-komponenter:

```tsx
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>E-post</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />  {/* Viser valideringsfeil */}
      </FormItem>
    )}
  />
</Form>
```

---

## Database-oppsett

### Supabase-tabell: user_profiles

```sql
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('recruiter', 'job-seeker')) NOT NULL,
  profile_pic TEXT,
  resume_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert" ON user_profiles
FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "allow_select" ON user_profiles
FOR SELECT TO public USING (true);
```

---

## Autentisering

Autentiseringsflyt er fullstendig dokumentert i [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md).

### Kort oppsummering:

1. **Registrering:**
   - Bruker fyller ut skjema
   - Zod validerer input
   - Server Action hasher passord med bcrypt
   - Bruker lagres i Supabase

2. **Innlogging:**
   - Bruker fyller ut skjema
   - Server Action verifiserer passord
   - JWT-token genereres
   - Token lagres i cookie

3. **Beskyttede sider:**
   - Sjekk om token finnes i cookie
   - Verifiser token med JWT
   - Vis side eller redirect til login

---

## Gjenbrukbare deler

### Del 1: Supabase-oppsett

Kan gjenbrukes i ethvert prosjekt:

1. `src/config/supabase-config.ts`
2. `.env` med Supabase-nøkler

### Del 2: Autentisering

Komplett auth-system som kan kopieres:

1. `src/actions/users.ts` (registerUser, loginUser)
2. `src/interfaces/index.ts` (IUser)
3. Login- og register-sider

### Del 3: UI-komponenter

Shadcn/ui-komponenter som kan gjenbrukes:

1. Kjør `npx shadcn@latest init` i nytt prosjekt
2. Kopier `src/components/ui/`
3. Kopier `src/lib/utils.ts`

### Del 4: Form-validering

Zod + React Hook Form mønster:

```typescript
// 1. Definer schema
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// 2. Opprett form
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "", password: "" },
})

// 3. Submit-handler
async function onSubmit(values: z.infer<typeof formSchema>) {
  // Kall API
}
```

---

## Videreutvikling

### Planlagte funksjoner

| Funksjon | Prioritet | Beskrivelse |
|----------|-----------|-------------|
| Jobbsøk | Høy | Søk og filtrer jobber |
| Stillingsannonser | Høy | Opprett og administrer jobber |
| Brukerprofile | Medium | Rediger profil, last opp CV |
| Dashboard | Medium | Statistikk og oversikt |
| Søknader | Medium | Søk på jobber, se søknader |
| Notifikasjoner | Lav | E-post og push-varsler |

### Foreslått neste steg

1. **Opprett jobs-tabell i Supabase:**

```sql
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract')),
  recruiter_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **Opprett Server Actions for jobber:**

```typescript
// src/actions/jobs.ts
'use server';

export const createJob = async (payload) => { ... }
export const getJobs = async (filters) => { ... }
export const getJobById = async (id) => { ... }
```

3. **Opprett sider:**
   - `/jobs` - Liste over jobber
   - `/jobs/[id]` - Enkelt jobb
   - `/jobs/create` - Opprett jobb (kun rekrutterer)

---

## Kommandoer

### Utvikling

```bash
npm run dev          # Start utviklingsserver
npm run build        # Bygg for produksjon
npm run start        # Start produksjonsserver
```

### Shadcn/ui

```bash
npx shadcn@latest add [komponent]   # Legg til komponent
npx shadcn@latest diff              # Sjekk oppdateringer
```

### Git

```bash
git add .
git commit -m "Beskrivelse"
git push
```

---

## Nyttige ressurser

- [Next.js Dokumentasjon](https://nextjs.org/docs)
- [Supabase Dokumentasjon](https://supabase.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

## Relaterte dokumenter

- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - Detaljert auth-guide
- [README.md](./README.md) - Rask prosjektoversikt

---

*Sist oppdatert: Desember 2024*
