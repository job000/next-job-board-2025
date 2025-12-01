# Autentisering Guide - Next.js + Supabase

En komplett steg-for-steg guide for nybegynnere.

---

## Innholdsfortegnelse

1. [Hva du vil lære](#hva-du-vil-lære)
2. [Forutsetninger](#forutsetninger)
3. [Grunnleggende begreper](#grunnleggende-begreper)
4. [Prosjektstruktur](#prosjektstruktur)
5. [Steg 1: Installer pakker](#steg-1-installer-pakker)
6. [Steg 2: Sett opp Supabase](#steg-2-sett-opp-supabase)
7. [Steg 3: Miljøvariabler](#steg-3-miljøvariabler)
8. [Steg 4: Supabase-konfigurasjon](#steg-4-supabase-konfigurasjon)
9. [Steg 5: TypeScript Interface](#steg-5-typescript-interface)
10. [Steg 6: Server Actions (Backend)](#steg-6-server-actions-backend)
11. [Steg 7: Register-side (Frontend)](#steg-7-register-side-frontend)
12. [Steg 8: Login-side (Frontend)](#steg-8-login-side-frontend)
13. [Steg 9: Toast-meldinger](#steg-9-toast-meldinger)
14. [Sikkerhet](#sikkerhet)
15. [Produksjonsklargjering](#produksjonsklargjering)
16. [Feilsoking](#feilsoking)
17. [Ordliste](#ordliste)

---

## Hva du vil lære

Etter denne guiden vil du kunne:

- Opprette en brukerregistrering med sikker passordlagring
- Implementere innlogging med JWT-tokens
- Koble frontend til backend med Server Actions
- Validere brukerinput sikkert
- Unngå vanlige sikkerhetsfeil

---

## Forutsetninger

Før du starter, sorg for at du har:

1. **Node.js installert** (versjon 18 eller nyere)
   - Sjekk: Apne terminal og skriv `node --version`
   - Last ned fra: https://nodejs.org

2. **En kodeeditor**
   - Anbefalt: Visual Studio Code (https://code.visualstudio.com)

3. **Et Next.js-prosjekt**
   - Hvis du ikke har et, opprett med:
   ```bash
   npx create-next-app@latest mitt-prosjekt
   ```
   - Velg "Yes" pa TypeScript, ESLint, Tailwind CSS, og App Router

4. **En Supabase-konto**
   - Gratis a opprette pa https://supabase.com

---

## Grunnleggende begreper

Hvis du er ny til webutvikling, her er noen viktige begreper:

### Frontend vs Backend

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│         (Det brukeren ser og interagerer med)               │
│                                                             │
│   - Skjemaer (input-felt, knapper)                          │
│   - Sidevisning                                             │
│   - Brukergrensesnitt                                       │
│   - Kjorer i nettleseren                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Sender data
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│         (Logikk som kjorer pa serveren)                     │
│                                                             │
│   - Hasjing av passord                                      │
│   - Database-operasjoner                                    │
│   - Generering av tokens                                    │
│   - Sikkerhetskontroller                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Lagrer/henter data
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE                             │
│           (Supabase - lagrer brukerdata)                    │
│                                                             │
│   - Brukerinformasjon                                       │
│   - Hasjede passord                                         │
│   - Roller                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Hva er en JWT Token?

JWT (JSON Web Token) er som et digitalt ID-kort:

```
Nar du logger inn:
1. Du sender e-post + passord
2. Serveren sjekker at det stemmer
3. Serveren lager en "billett" (JWT token)
4. Du far billetten og lagrer den i nettleseren
5. Hver gang du gar til en beskyttet side, viser du billetten
```

### Hva er hashing?

Hashing gjor passordet uleselig:

```
Passord:     "mittPassord123"
                   │
                   ▼ bcrypt.hash()
                   │
Hashet:      "$2a$10$xK8fJ9..."  (kan ikke reverseres!)
```

**Viktig:** Hasjing er ENVEI. Du kan ikke fa tilbake det originale passordet.

---

## Prosjektstruktur

Slik vil prosjektet ditt se ut nar du er ferdig:

```
mitt-prosjekt/
│
├── .env                          # Hemmelige nokler (ALDRI del denne!)
├── .gitignore                    # Filer som ikke skal til GitHub
│
└── src/
    ├── actions/
    │   └── users.ts              # Backend-logikk
    │
    ├── app/
    │   ├── (public)/
    │   │   ├── login/
    │   │   │   └── page.tsx      # Login-side
    │   │   └── register/
    │   │       └── page.tsx      # Registreringsside
    │   └── layout.tsx            # Hovedoppsett
    │
    ├── components/
    │   └── ui/                   # UI-komponenter
    │
    ├── config/
    │   └── supabase-config.ts    # Database-tilkobling
    │
    └── interfaces/
        └── index.ts              # TypeScript-definisjoner
```

---

## Steg 1: Installer pakker

### Hva er en pakke?

En pakke er ferdiglaget kode som andre har skrevet. I stedet for a skrive alt selv, bruker vi pakker for vanlige oppgaver.

### Installer hovedpakkene

Apne terminalen i prosjektmappen din og kjor:

```bash
npm install @supabase/supabase-js bcryptjs jsonwebtoken zod react-hook-form @hookform/resolvers react-hot-toast js-cookie
```

**Hva gjor hver pakke:**

| Pakke | Hva den gjor |
|-------|--------------|
| `@supabase/supabase-js` | Kobler til Supabase-databasen |
| `bcryptjs` | Hasjer passord sikkert |
| `jsonwebtoken` | Lager og verifiserer JWT-tokens |
| `zod` | Validerer at brukerdata er gyldig |
| `react-hook-form` | Handterer skjemaer enkelt |
| `@hookform/resolvers` | Kobler zod til react-hook-form |
| `react-hot-toast` | Viser pop-up meldinger |
| `js-cookie` | Lagrer tokens i nettleseren |

### Installer TypeScript-typer

```bash
npm install -D @types/bcryptjs @types/jsonwebtoken @types/js-cookie
```

**Merk:** `-D` betyr "development dependency" - kun nodvendig under utvikling.

---

## Steg 2: Sett opp Supabase

### 2.1 Opprett konto

1. Ga til [supabase.com](https://supabase.com)
2. Klikk "Start your project"
3. Logg inn med GitHub eller e-post

### 2.2 Opprett nytt prosjekt

1. Klikk "New Project"
2. Fyll inn:
   - **Name:** `job-board` (eller hva du vil)
   - **Database Password:** Lag et sterkt passord (lagre det trygt!)
   - **Region:** Velg narmeste (f.eks. "West EU")
3. Klikk "Create new project"
4. Vent ca. 2 minutter mens prosjektet settes opp

### 2.3 Opprett database-tabell

1. I venstremenyen, klikk "SQL Editor"
2. Klikk "New query"
3. Lim inn folgende SQL-kode:

```sql
-- Opprett tabell for brukerprofiler
CREATE TABLE user_profiles (
  -- Unik ID for hver bruker (genereres automatisk)
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Brukerinformasjon
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,

  -- Rolle: enten 'recruiter' eller 'job-seeker'
  role TEXT CHECK (role IN ('recruiter', 'job-seeker')) NOT NULL,

  -- Valgfrie felt
  profile_pic TEXT,
  resume_url TEXT,
  bio TEXT,

  -- Tidsstempler
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legg til indeks pa e-post for raskere sok
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
```

4. Klikk "Run" (eller trykk Ctrl/Cmd + Enter)
5. Du skal se "Success. No rows returned"

### 2.4 Sett opp sikkerhet (RLS)

Row Level Security (RLS) beskytter dataene dine:

```sql
-- Aktiver RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Tillat innsetting av nye brukere (registrering)
CREATE POLICY "allow_insert" ON user_profiles
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Tillat lesing kun via server (ikke direkte fra nettleser)
CREATE POLICY "allow_select" ON user_profiles
FOR SELECT
TO public
USING (true);
```

**Hva betyr dette?**
- RLS sikrer at brukere kun kan se/endre data de har tilgang til
- For produksjon bor du ha strengere regler (mer om dette i sikkerhetsdelen)

### 2.5 Hent API-nokler

1. Ga til "Project Settings" (tannhjul-ikon nederst til venstre)
2. Klikk "API" i menyen
3. Finn og kopier:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** En lang tekst som starter med `eyJ...`

**VIKTIG:** Disse noklene er sensitive. Del dem ALDRI offentlig!

---

## Steg 3: Miljovariabler

### Hva er miljovariabler?

Miljovariabler er hemmelige verdier som:
- Ikke skal deles med andre
- Ikke skal lastes opp til GitHub
- Varierer mellom utvikling og produksjon

### Opprett .env-fil

1. I rotmappen til prosjektet, opprett en fil som heter `.env`
2. Legg til folgende (erstatt med dine egne verdier):

```env
# Supabase-tilkobling
SUPABASE_PROJECT_URL=https://din-prosjekt-id.supabase.co
SUPABASE_API_KEY=din_anon_key_her

# JWT-hemmelighet (lag din egen tilfeldige streng)
JWT_SECRET=en_lang_tilfeldig_streng_minst_32_tegn
```

### Lag en sterk JWT_SECRET

Du kan bruke denne kommandoen i terminalen:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Eller bruk en passordgenerator og lag minst 32 tilfeldige tegn.

### Beskytt .env-filen

Sjekk at `.gitignore` inneholder:

```
# Environment files
.env
.env.local
.env.*.local
```

Hvis ikke, legg det til!

**Hvorfor?** Hvis .env lastes opp til GitHub, kan hvem som helst se dine hemmelige nokler.

---

## Steg 4: Supabase-konfigurasjon

### Opprett konfigurasjonsfil

Opprett filen `src/config/supabase-config.ts`:

```typescript
/**
 * Supabase Client Configuration
 *
 * Denne filen oppretter en tilkobling til Supabase-databasen.
 * Vi bruker miljovariabler for a holde noklene hemmelige.
 */

import { createClient } from '@supabase/supabase-js'

// Hent verdier fra miljovariabler
const supabaseUrl = process.env.SUPABASE_PROJECT_URL || ''
const supabaseKey = process.env.SUPABASE_API_KEY || ''

// Opprett og eksporter Supabase-klienten
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
```

### Forklaring linje for linje

```typescript
import { createClient } from '@supabase/supabase-js'
```
- Importerer `createClient`-funksjonen fra Supabase-pakken

```typescript
const supabaseUrl = process.env.SUPABASE_PROJECT_URL || ''
```
- Henter URL-en fra miljovariabler
- `|| ''` betyr: bruk tom streng hvis variabelen mangler

```typescript
const supabase = createClient(supabaseUrl, supabaseKey)
```
- Oppretter tilkoblingen til Supabase

```typescript
export default supabase
```
- Gjor tilkoblingen tilgjengelig for andre filer

---

## Steg 5: TypeScript Interface

### Hva er et Interface?

Et interface definerer "formen" pa dataene dine. Det hjelper med:
- Autofullforelse i editoren
- Feilmeldinger hvis du bruker feil datatype
- Dokumentasjon av datastrukturen

### Opprett interface-fil

Opprett `src/interfaces/index.ts`:

```typescript
/**
 * User Interface
 *
 * Definerer strukturen for en bruker i systemet.
 * Alle felt ma matche kolonnenavn i databasen.
 */

export interface IUser {
    // Unik bruker-ID (generert av Supabase)
    id: string;

    // Fullt navn
    name: string;

    // E-postadresse (unik per bruker)
    email: string;

    // Hasjet passord (aldri lagret i klartekst!)
    password: string;

    // Brukerrolle
    role: 'recruiter' | 'job-seeker';

    // Valgfrie felt
    profile_pic: string;
    resume_url: string;
    bio: string;

    // Tidsstempler
    created_at: string | null;
    updated_at: string;
}
```

### Forklaring av typer

```typescript
role: 'recruiter' | 'job-seeker';
```
- `|` betyr "eller"
- Rolle KAN KUN vaere en av disse to verdiene
- TypeScript vil gi feil hvis du prover noe annet

```typescript
created_at: string | null;
```
- Kan vaere en streng ELLER null
- Nyttig for felt som kanskje ikke har verdi

---

## Steg 6: Server Actions (Backend)

### Hva er Server Actions?

Server Actions er funksjoner som:
- Kjorer pa serveren (ikke i nettleseren)
- Holder sensitiv logikk skjult fra brukere
- Kan kommunisere direkte med databasen

### Opprett server actions-fil

Opprett `src/actions/users.ts`:

```typescript
'use server';

/**
 * User Authentication Actions
 *
 * Disse funksjonene handterer brukerregistrering og innlogging.
 * De kjorer KUN pa serveren for sikkerhet.
 */

import supabase from '@/config/supabase-config';
import { IUser } from '@/interfaces';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ============================================================
// REGISTRERING
// ============================================================

export const registerUser = async (payload: Partial<IUser>) => {
    try {
        // ─────────────────────────────────────────────────
        // STEG 1: Valider input
        // ─────────────────────────────────────────────────

        // Sjekk at e-post er gyldig
        if (!payload.email || !payload.email.includes('@')) {
            throw new Error('Ugyldig e-postadresse.');
        }

        // Sjekk at passord er sterkt nok
        if (!payload.password || payload.password.length < 6) {
            throw new Error('Passord ma vaere minst 6 tegn.');
        }

        // ─────────────────────────────────────────────────
        // STEG 2: Sjekk om bruker allerede eksisterer
        // ─────────────────────────────────────────────────

        const userExists = await supabase
            .from('user_profiles')
            .select('email')  // Hent kun e-post (mer effektivt)
            .eq('email', payload.email.toLowerCase().trim());

        if (userExists.error) {
            console.error('Database error:', userExists.error);
            throw new Error('Noe gikk galt. Prov igjen.');
        }

        if (userExists.data && userExists.data.length > 0) {
            throw new Error('En bruker med denne e-posten finnes allerede.');
        }

        // ─────────────────────────────────────────────────
        // STEG 3: Hash passordet
        // ─────────────────────────────────────────────────

        // Salt rounds = 12 (anbefalt for god sikkerhet)
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

        // ─────────────────────────────────────────────────
        // STEG 4: Lagre bruker i database
        // ─────────────────────────────────────────────────

        const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
                name: payload.name?.trim(),
                email: payload.email.toLowerCase().trim(),
                password: hashedPassword,
                role: payload.role || 'job-seeker'
            });

        if (insertError) {
            console.error('Insert error:', insertError);
            throw new Error('Kunne ikke opprette bruker. Prov igjen.');
        }

        // ─────────────────────────────────────────────────
        // STEG 5: Returner suksess
        // ─────────────────────────────────────────────────

        return {
            success: true,
            message: 'Bruker registrert! Du kan na logge inn.',
        };

    } catch (error) {
        // Fang alle feil og returner en pen melding
        return {
            success: false,
            message: (error as Error).message,
        };
    }
}

// ============================================================
// INNLOGGING
// ============================================================

export const loginUser = async (payload: Partial<IUser>) => {
    try {
        // ─────────────────────────────────────────────────
        // STEG 1: Valider input
        // ─────────────────────────────────────────────────

        if (!payload.email || !payload.password) {
            throw new Error('E-post og passord er pakrevd.');
        }

        // ─────────────────────────────────────────────────
        // STEG 2: Hent bruker fra database
        // ─────────────────────────────────────────────────

        const userResponse = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', payload.email.toLowerCase().trim())
            .single();

        // VIKTIG: Gi samme feilmelding for bade "bruker finnes ikke"
        // og "feil passord" - dette forhindrer "user enumeration"
        if (userResponse.error) {
            throw new Error('Feil e-post eller passord.');
        }

        const user = userResponse.data as IUser;

        // ─────────────────────────────────────────────────
        // STEG 3: Verifiser passord
        // ─────────────────────────────────────────────────

        const isPasswordValid = await bcrypt.compare(
            payload.password,
            user.password
        );

        if (!isPasswordValid) {
            // Samme feilmelding som over (sikkerhet)
            throw new Error('Feil e-post eller passord.');
        }

        // ─────────────────────────────────────────────────
        // STEG 4: Sjekk rolle (valgfritt)
        // ─────────────────────────────────────────────────

        if (payload.role && user.role !== payload.role) {
            throw new Error('Du har ikke tilgang med denne rollen.');
        }

        // ─────────────────────────────────────────────────
        // STEG 5: Generer JWT token
        // ─────────────────────────────────────────────────

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || '',
            { expiresIn: '24h' }  // Token utloper etter 24 timer
        );

        // ─────────────────────────────────────────────────
        // STEG 6: Returner suksess med token
        // ─────────────────────────────────────────────────

        return {
            success: true,
            message: 'Innlogging vellykket!',
            data: token
        };

    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }
};
```

### Viktige sikkerhetsmerknader i koden

1. **Identiske feilmeldinger for e-post/passord**
   - Forhindrer at angripere kan finne ut hvilke e-poster som er registrert

2. **Salt rounds = 12**
   - Gjor hashing tregere = vanskeligere a knekke

3. **Input-validering**
   - Sjekker at data er gyldig for den brukes

4. **Trim og lowercase pa e-post**
   - " John@Email.com " blir "john@email.com"
   - Forhindrer duplikater

---

## Steg 7: Register-side (Frontend)

### Opprett register-side

Opprett `src/app/(public)/register/page.tsx`:

```tsx
'use client'

/**
 * Register Page
 *
 * Denne siden lar nye brukere opprette en konto.
 *
 * Viktige konsepter:
 * - 'use client': Gjor at komponenten kjorer i nettleseren
 * - Zod: Validerer at brukerdata er gyldig
 * - react-hook-form: Handterer skjemadata
 */

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

// Form-biblioteker
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

// UI-komponenter (fra shadcn/ui eller egen implementasjon)
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Backend-funksjon og navigasjon
import { registerUser } from '@/actions/users';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────
// VALIDERING: Definerer regler for skjemaet
// ─────────────────────────────────────────────────

const formSchema = z.object({
  // Navn: Minst 2 tegn
  name: z.string()
    .min(2, { message: "Navn ma vaere minst 2 tegn." })
    .max(100, { message: "Navn kan ikke vaere mer enn 100 tegn." }),

  // E-post: Ma vaere gyldig e-postformat
  email: z.string()
    .email({ message: "Ugyldig e-postadresse." }),

  // Passord: Minst 6 tegn
  password: z.string()
    .min(6, { message: "Passord ma vaere minst 6 tegn." })
    .max(100, { message: "Passord kan ikke vaere mer enn 100 tegn." }),

  // Rolle: Ma vaere en av de definerte verdiene
  role: z.enum(['recruiter', 'job-seeker'], {
    errorMap: () => ({ message: "Velg en gyldig rolle." })
  }),
})

// ─────────────────────────────────────────────────
// HOVEDKOMPONENT
// ─────────────────────────────────────────────────

function RegisterPage() {
  // State for lasting
  const [loading, setLoading] = React.useState(false);

  // Router for a navigere etter registrering
  const router = useRouter();

  // Initialiser skjema med react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "job-seeker",
    },
  })

  // ─────────────────────────────────────────────────
  // SUBMIT-HANDLER: Kalles nar skjemaet sendes
  // ─────────────────────────────────────────────────

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      // Kall backend-funksjonen
      const response = await registerUser(values);

      if (response.success) {
        // Vis suksessmelding
        toast.success(response.message);

        // Nullstill skjema
        form.reset();

        // Naviger til login-siden
        router.push('/login');
      } else {
        // Vis feilmelding
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Noe gikk galt. Prov igjen.');
    } finally {
      // Stopp lasting uansett resultat
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────
  // RENDER: Det brukeren ser
  // ─────────────────────────────────────────────────

  return (
    <div className='bg-gray-200 flex items-center justify-center min-h-screen'>
      <div className='bg-white flex flex-col shadow rounded p-5 w-[450px]'>

        {/* Overskrift */}
        <h1 className='text-primary font-bold text-lg mb-5'>
          Opprett konto
        </h1>

        {/* Skjema */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Navn-felt */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fullt navn</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ola Nordmann"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* E-post-felt */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ola@eksempel.no"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Passord-felt */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passord</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Minst 6 tegn"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rolle-felt */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jeg er en...</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg rolle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job-seeker">Jobbsoker</SelectItem>
                        <SelectItem value="recruiter">Rekrutterer</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit-knapp */}
            <Button type="submit" className='w-full' disabled={loading}>
              {loading ? 'Oppretter konto...' : 'Opprett konto'}
            </Button>

            {/* Link til login */}
            <p className='text-sm text-center text-gray-600'>
              Har du allerede en konto?{' '}
              <Link href='/login' className='text-primary underline'>
                Logg inn
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default RegisterPage
```

---

## Steg 8: Login-side (Frontend)

### Opprett login-side

Opprett `src/app/(public)/login/page.tsx`:

```tsx
'use client'

/**
 * Login Page
 *
 * Denne siden lar eksisterende brukere logge inn.
 */

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { loginUser } from '@/actions/users';
import cookie from 'js-cookie';

// Validering
const formSchema = z.object({
  email: z.string().email({ message: "Ugyldig e-postadresse." }),
  password: z.string().min(6, { message: "Passord ma vaere minst 6 tegn." }),
  role: z.enum(['recruiter', 'job-seeker']),
})

function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "job-seeker",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      const response = await loginUser(values);

      if (response.success) {
        toast.success(response.message);

        // Lagre token sikkert i cookie
        const token = response.data;
        if (token) {
          // Sett cookie med sikre innstillinger
          cookie.set('token', token, {
            expires: 1,        // 1 dag
            secure: true,      // Kun HTTPS i produksjon
            sameSite: 'strict' // Beskytt mot CSRF
          });
        }

        form.reset();
        router.push('/');
      } else {
        toast.error(response.message || 'Innlogging feilet.');
      }
    } catch (error) {
      toast.error('Noe gikk galt. Prov igjen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='bg-gray-200 flex items-center justify-center min-h-screen'>
      <div className='bg-white flex flex-col shadow rounded p-5 w-[450px]'>
        <h1 className='text-primary font-bold text-lg mb-5'>
          Logg inn
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ola@eksempel.no"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passord</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Ditt passord"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logg inn som</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg rolle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job-seeker">Jobbsoker</SelectItem>
                        <SelectItem value="recruiter">Rekrutterer</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className='w-full' disabled={loading}>
              {loading ? 'Logger inn...' : 'Logg inn'}
            </Button>

            <p className='text-sm text-center text-gray-600'>
              Har du ikke en konto?{' '}
              <Link href='/register' className='text-primary underline'>
                Opprett konto
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
```

---

## Steg 9: Toast-meldinger

### Sett opp Toaster i layout

Oppdater `src/app/layout.tsx`:

```tsx
import { Toaster } from "react-hot-toast";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body>
        {children}

        {/* Toast-meldinger vises her */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
```

---

## Sikkerhet

### Sikkerhetstiltak i denne losningen

| Tiltak | Beskrivelse | Hvorfor viktig |
|--------|-------------|----------------|
| **Passord-hashing** | bcrypt med 12 salt rounds | Selv om databasen lekkes, er passord ikke lesbare |
| **JWT tokens** | Utloper etter 24 timer | Begrenser skade hvis token stjeles |
| **Server Actions** | Sensitiv kode kjorer pa server | Brukere kan ikke se eller manipulere logikken |
| **Input-validering** | Zod validerer all input | Forhindrer ugyldig eller ondsinnet data |
| **Generiske feilmeldinger** | "Feil e-post eller passord" | Forhindrer at angripere finner gyldige e-poster |
| **HTTPS cookies** | `secure: true` pa cookies | Forhindrer avlytting av tokens |
| **SameSite cookies** | `sameSite: 'strict'` | Beskytter mot CSRF-angrep |

### Viktige sikkerhetsoppgraderinger for produksjon

For du gar i produksjon, gjor folgende:

#### 1. Strengere RLS-regler

```sql
-- Slett den apne policyen
DROP POLICY IF EXISTS "allow_insert" ON user_profiles;
DROP POLICY IF EXISTS "allow_select" ON user_profiles;

-- Ny policy: Kun autentiserte brukere kan lese egne data
CREATE POLICY "users_can_read_own_profile" ON user_profiles
FOR SELECT
USING (auth.uid()::text = id::text);

-- Ny policy: Kun tillat innsetting via service role
CREATE POLICY "service_role_insert" ON user_profiles
FOR INSERT
TO service_role
WITH CHECK (true);
```

#### 2. Rate Limiting

Legg til beskyttelse mot brute-force angrep:

```typescript
// Eksempel med enkel rate limiting
const loginAttempts = new Map<string, number>();

export const loginUser = async (payload: Partial<IUser>) => {
    const ip = // hent IP-adresse
    const attempts = loginAttempts.get(ip) || 0;

    if (attempts > 5) {
        return {
            success: false,
            message: 'For mange forsok. Vent 15 minutter.'
        };
    }

    // ... resten av login-logikken
}
```

#### 3. Sterkere passordkrav

```typescript
const formSchema = z.object({
  password: z.string()
    .min(8, "Passord ma vaere minst 8 tegn")
    .regex(/[A-Z]/, "Ma inneholde minst en stor bokstav")
    .regex(/[a-z]/, "Ma inneholde minst en liten bokstav")
    .regex(/[0-9]/, "Ma inneholde minst ett tall")
    .regex(/[^A-Za-z0-9]/, "Ma inneholde minst ett spesialtegn"),
})
```

#### 4. HTTPS

- Bruk ALLTID HTTPS i produksjon
- Supabase og Vercel gjor dette automatisk

### Vanlige sarbarhetert a unnga

| Sarbarhet | Hvordan vi unnga det |
|-----------|---------------------|
| **SQL Injection** | Supabase bruker parameteriserte sporringer automatisk |
| **XSS (Cross-Site Scripting)** | React escaper automatisk output |
| **CSRF** | SameSite cookies og Server Actions |
| **Brute Force** | Rate limiting (ma implementeres) |
| **User Enumeration** | Generiske feilmeldinger |
| **Passord i klartekst** | bcrypt hashing |

---

## Produksjonsklargjoring

### Sjekkliste for produksjon

- [ ] Bytt til sterke, unike verdier i `.env`
- [ ] Fjern console.log-meldinger
- [ ] Aktiver strengere RLS-regler
- [ ] Implementer rate limiting
- [ ] Test med ugyldige inputs
- [ ] Sett opp feillogging (f.eks. Sentry)
- [ ] Aktiver HTTPS
- [ ] Backup av database

### Deploy til Vercel

1. Push koden til GitHub
2. Ga til [vercel.com](https://vercel.com)
3. Importer prosjektet
4. Legg til miljovariabler i Vercel-dashboardet
5. Deploy!

---

## Feilsoking

### Vanlige feil og losninger

| Feilmelding | Arsak | Losning |
|-------------|-------|---------|
| "User not found" | Bruker ikke registrert | Registrer bruker forst |
| "RLS policy violation" | Manglende database-policy | Legg til RLS-policy i Supabase |
| Toast vises ikke | Feil import | Bruk `react-hot-toast`, ikke `react-hot-toast/headless` |
| "useRouter" feil | Feil import | Bruk `next/navigation`, ikke `next/router` |
| "useState in function" | Hook brukt feil sted | Flytt hooks til toppen av komponenten |
| Miljovariabler virker ikke | Feil filnavn eller ikke restartet | Sjekk at filen heter `.env` og restart dev server |

### Debug-tips

1. **Sjekk konsollen i nettleseren** (F12 -> Console)
2. **Sjekk terminalen** der du kjorer `npm run dev`
3. **Legg til console.log** for a se hva som skjer:

```typescript
console.log('Payload mottatt:', payload);
console.log('Response fra Supabase:', userResponse);
```

4. **Test API-et direkte** i Supabase SQL Editor

---

## Ordliste

| Begrep | Forklaring |
|--------|------------|
| **API** | Application Programming Interface - maten programmer snakker sammen |
| **Backend** | Serversiden av applikasjonen (skjult for brukere) |
| **bcrypt** | Bibliotek for sikker passord-hashing |
| **Cookie** | Liten datafil lagret i nettleseren |
| **CSRF** | Cross-Site Request Forgery - en type angrep |
| **Frontend** | Klientsiden (det brukeren ser i nettleseren) |
| **Hash** | Envei-kryptering av data |
| **Interface** | TypeScript-definisjon av datastruktur |
| **JWT** | JSON Web Token - digital "billett" for autentisering |
| **Miljovariabel** | Hemmelig verdi som ikke skal deles |
| **RLS** | Row Level Security - database-sikkerhet |
| **Salt** | Tilfeldig data lagt til for passord for a gjore hashing sikrere |
| **Server Action** | Next.js-funksjon som kjorer pa serveren |
| **Supabase** | Database-tjeneste (PostgreSQL i skyen) |
| **Token** | Digital nokel for autentisering |
| **TypeScript** | JavaScript med typer |
| **Zod** | Bibliotek for datavalidering |

---

## Fullfort sjekkliste

- [ ] Node.js installert
- [ ] Next.js-prosjekt opprettet
- [ ] npm-pakker installert
- [ ] Supabase-prosjekt opprettet
- [ ] Database-tabell opprettet
- [ ] RLS-policies lagt til
- [ ] `.env`-fil opprettet
- [ ] `.gitignore` oppdatert
- [ ] Supabase-config opprettet
- [ ] Interface definert
- [ ] Server Actions implementert
- [ ] Register-side opprettet
- [ ] Login-side opprettet
- [ ] Toaster lagt til i layout
- [ ] Testet registrering
- [ ] Testet innlogging

---

## Nyttige lenker

- [Next.js Dokumentasjon](https://nextjs.org/docs)
- [Supabase Dokumentasjon](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [OWASP Sikkerhetsguide](https://owasp.org/www-project-web-security-testing-guide/)

---

*Sist oppdatert: Desember 2024*
