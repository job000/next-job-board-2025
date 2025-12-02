# 03 - Supabase Database

Denne guiden viser hvordan du setter opp Supabase som backend-database.

---

## Innhold

1. [Hva er Supabase?](#hva-er-supabase)
2. [Opprett Supabase-prosjekt](#opprett-supabase-prosjekt)
3. [Opprett database-tabeller](#opprett-database-tabeller)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Miljovariabler](#miljovariabler)
6. [Supabase-klient](#supabase-klient)
7. [Teste tilkoblingen](#teste-tilkoblingen)
8. [Sjekkliste](#sjekkliste)

---

## Hva er Supabase?

**Supabase** er en hosted database-tjeneste som gir deg:

- **PostgreSQL-database** - Kraftig, relasjonell database
- **Auto-generert API** - REST og GraphQL ut av boksen
- **Dashboard** - Visuelt grensesnitt for å se og redigere data
- **Row Level Security** - Sikkerhet på rad-nivå

### Hvorfor Supabase?

| Fordel | Beskrivelse |
|--------|-------------|
| Gratis å starte | 500 MB database, 50k mndl. brukere |
| Ingen server å drifte | Alt hostes for deg |
| SQL-tilgang | Full kontroll med SQL Editor i dashboard |
| Enkelt API | JavaScript-klient med TypeScript-støtte |

### Gratis plan inkluderer

- 500 MB database
- 1 GB fillagring
- 50 000 mndl. aktive brukere
- 2 GB bandwidth

---

## Opprett Supabase-prosjekt

### Steg 1: Opprett konto

1. Ga til [supabase.com](https://supabase.com)
2. Klikk "Start your project"
3. Logg inn med GitHub (anbefalt) eller e-post

### Steg 2: Opprett nytt prosjekt

1. Klikk "New Project"
2. Velg organisasjon (eller opprett ny)
3. Fyll inn:

| Felt | Verdi |
|------|-------|
| **Name** | `mitt-prosjekt` (eller ønsket navn) |
| **Database Password** | Generer sterkt passord (LAGRE DETTE!) |
| **Region** | Velg nærmeste (f.eks. `West EU (Ireland)`) |

4. Klikk "Create new project"
5. Vent 2-3 minutter mens prosjektet opprettes

### Steg 3: Hent API-nokler

1. Ga til **Project Settings** (tannhjul nederst til venstre)
2. Klikk **API** i menyen
3. Kopier:
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

**VIKTIG:** Aldri del `service_role` nokelen offentlig!

---

## Opprett database-tabeller

### Metode 1: SQL Editor (anbefalt)

1. I Supabase-dashboardet, klikk **SQL Editor** i menyen
2. Klikk **New query**
3. Lim inn SQL-koden nedenfor
4. Klikk **Run** (eller Ctrl/Cmd + Enter)

### SQL for bruker-tabell

```sql
-- =====================================================
-- BRUKER-TABELL
-- =====================================================

CREATE TABLE user_profiles (
  -- Unik ID (UUID genereres automatisk)
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Grunnleggende brukerinfo
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,

  -- Rolle (kun disse verdiene tillatt)
  role TEXT NOT NULL CHECK (role IN ('recruiter', 'job-seeker')),

  -- Profilinfo (valgfritt)
  profile_pic TEXT,
  resume_url TEXT,
  bio TEXT,

  -- Tidsstempler
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indeks for raskere oppslag pa e-post
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Indeks for raskere oppslag pa rolle
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Kommentar
COMMENT ON TABLE user_profiles IS 'Brukerprofiler for applikasjonen';
```

### SQL for jobbannonser (eksempel)

```sql
-- =====================================================
-- JOBB-TABELL (for fremtidig bruk)
-- =====================================================

CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Jobb-detaljer
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,

  -- Lonn
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'NOK',

  -- Type
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),

  -- Relasjon til rekrutterer
  recruiter_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Tidsstempler
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indekser
CREATE INDEX idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX idx_jobs_active ON jobs(is_active);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
```

---

## Row Level Security (RLS)

### Hva er RLS?

**Row Level Security (RLS)** er Supabase sin sikkerhetsfunksjon som bestemmer hvem som kan lese/skrive hvilke rader.

**Uten RLS:** Alle med API-nøkkelen kan lese/skrive alt.
**Med RLS:** Du definerer regler (policies) for hvem som har tilgang til hva.

**Tips:** Aktiver alltid RLS i produksjon! For utvikling kan du starte med åpne policies.

### Aktiver RLS

```sql
-- Aktiver RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Aktiver RLS for jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
```

### Policies for user_profiles

```sql
-- =====================================================
-- POLICIES FOR user_profiles
-- =====================================================

-- Policy: Tillat innsetting (registrering)
CREATE POLICY "allow_insert_user_profiles"
ON user_profiles
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Tillat lesing (for autentisering)
CREATE POLICY "allow_select_user_profiles"
ON user_profiles
FOR SELECT
TO public
USING (true);

-- Policy: Tillat oppdatering av egen profil
CREATE POLICY "allow_update_own_profile"
ON user_profiles
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
```

### Policies for jobs

```sql
-- =====================================================
-- POLICIES FOR jobs
-- =====================================================

-- Policy: Alle kan lese aktive jobber
CREATE POLICY "anyone_can_read_active_jobs"
ON jobs
FOR SELECT
TO public
USING (is_active = true);

-- Policy: Rekrutterere kan opprette jobber
CREATE POLICY "recruiters_can_insert_jobs"
ON jobs
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Rekrutterere kan oppdatere egne jobber
CREATE POLICY "recruiters_can_update_own_jobs"
ON jobs
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Policy: Rekrutterere kan slette egne jobber
CREATE POLICY "recruiters_can_delete_own_jobs"
ON jobs
FOR DELETE
TO public
USING (true);
```

### Strengere RLS for produksjon

For produksjon bor du bruke strengere policies:

```sql
-- Eksempel: Kun egen profil
CREATE POLICY "users_read_own_profile"
ON user_profiles
FOR SELECT
USING (auth.uid()::text = id::text);

-- Eksempel: Kun rekrutterer kan opprette jobber
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

---

## Miljovariabler

### Opprett .env fil

I prosjektets rotmappe, opprett/oppdater `.env`:

```env
# Supabase
SUPABASE_PROJECT_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT (for egen token-generering)
JWT_SECRET=din_hemmelige_nokkel_minst_32_tegn
```

### Generer JWT_SECRET

```bash
# I terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Eller bruk en passordgenerator med minst 32 tegn.

### Sikre .env

Sjekk at `.gitignore` inneholder:

```
# Environment
.env
.env.local
.env.*.local
```

---

## Supabase-klient

### Installer Supabase

```bash
npm install @supabase/supabase-js
```

### Opprett konfigurasjonsfil

**Fil:** `src/config/supabase-config.ts`

```typescript
/**
 * Supabase Client Configuration
 *
 * Oppretter en tilkobling til Supabase-databasen.
 * Brukes i Server Actions for database-operasjoner.
 */

import { createClient } from '@supabase/supabase-js'

// Hent miljovariabler
const supabaseUrl = process.env.SUPABASE_PROJECT_URL || ''
const supabaseKey = process.env.SUPABASE_API_KEY || ''

// Valider at variabler er satt
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found in environment variables')
}

// Opprett og eksporter klient
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
```

### Alternativ: Med TypeScript-typer

```typescript
import { createClient } from '@supabase/supabase-js'

// Definer database-typer
interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          name: string
          email: string
          password: string
          role: 'recruiter' | 'job-seeker'
          profile_pic: string | null
          resume_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
    }
  }
}

const supabaseUrl = process.env.SUPABASE_PROJECT_URL || ''
const supabaseKey = process.env.SUPABASE_API_KEY || ''

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export default supabase
```

---

## Teste tilkoblingen

### Enkel test i Server Action

Opprett `src/actions/test-db.ts`:

```typescript
'use server'

import supabase from '@/config/supabase-config'

export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Database tilkoblet!' }
  } catch (error) {
    return { success: false, message: 'Tilkobling feilet' }
  }
}
```

### Test i en side

```tsx
// src/app/test/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { testConnection } from '@/actions/test-db'

export default function TestPage() {
  const [status, setStatus] = useState('Tester...')

  useEffect(() => {
    testConnection().then(result => {
      setStatus(result.success ? 'Tilkoblet!' : result.message)
    })
  }, [])

  return <div>Database status: {status}</div>
}
```

---

## Vanlige database-operasjoner

### SELECT (hente data)

```typescript
// Hent alle brukere
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')

// Hent spesifikk bruker
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('email', 'bruker@eksempel.no')
  .single()

// Hent med filter
const { data, error } = await supabase
  .from('user_profiles')
  .select('id, name, email')
  .eq('role', 'recruiter')
  .order('created_at', { ascending: false })
  .limit(10)
```

### INSERT (legge til data)

```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .insert({
    name: 'Ola Nordmann',
    email: 'ola@eksempel.no',
    password: 'hashet_passord',
    role: 'job-seeker'
  })
  .select()  // Returner den nye raden
```

### UPDATE (oppdatere data)

```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .update({ name: 'Nytt Navn' })
  .eq('id', 'bruker-id')
  .select()
```

### DELETE (slette data)

```typescript
const { error } = await supabase
  .from('user_profiles')
  .delete()
  .eq('id', 'bruker-id')
```

---

## Sjekkliste

### Supabase-oppsett
- [ ] Supabase-konto opprettet
- [ ] Nytt prosjekt opprettet
- [ ] Database-passord lagret trygt
- [ ] Project URL kopiert
- [ ] anon API key kopiert

### Database
- [ ] `user_profiles` tabell opprettet
- [ ] Indekser opprettet
- [ ] RLS aktivert
- [ ] Policies opprettet

### Kode
- [ ] `@supabase/supabase-js` installert
- [ ] `.env` fil opprettet
- [ ] `SUPABASE_PROJECT_URL` satt
- [ ] `SUPABASE_API_KEY` satt
- [ ] `JWT_SECRET` satt
- [ ] `src/config/supabase-config.ts` opprettet

### Sikkerhet
- [ ] `.env` i `.gitignore`
- [ ] RLS aktivert pa alle tabeller
- [ ] Policies konfigurert
- [ ] service_role key IKKE brukt i frontend

### Verifisering
- [ ] Test-tilkobling fungerer
- [ ] Kan lese fra database
- [ ] Kan skrive til database

---

## Neste steg

Ga videre til [04-TYPESCRIPT-INTERFACES.md](./04-TYPESCRIPT-INTERFACES.md) for a definere TypeScript-typer.

---

## Tips og triks

### Supabase Dashboard
- **Table Editor** - Se og rediger data visuelt
- **SQL Editor** - Kjør SQL direkte
- **Logs** - Se alle API-kall og feil
- **API Docs** - Auto-generert dokumentasjon for dine tabeller

### Database-tips
- **Bruk UUID for ID** - Sikrere enn auto-increment
- **Legg til indekser** på kolonner du søker på ofte (email, role)
- **Timestamps** - Alltid ha `created_at` og `updated_at`

### Supabase-klient tips
```typescript
// Hent én rad
.single()  // Returnerer objekt, ikke array

// Sortering
.order('created_at', { ascending: false })  // Nyeste først

// Begrens antall
.limit(10)  // Kun 10 rader
```

---

## Feilsøking

### "Invalid API key"

- Sjekk at `SUPABASE_API_KEY` er korrekt kopiert
- Sjekk at det ikke er ekstra mellomrom
- Restart dev-serveren etter endring i `.env`

### "Permission denied for table"

- RLS er aktivert men policies mangler
- Legg til riktige policies

### "relation does not exist"

- Tabellen er ikke opprettet
- Sjekk for skrivefeil i tabellnavn

### Miljøvariabler leses ikke

```bash
# Restart dev-server
npm run dev
```

Sjekk at filen heter eksakt `.env` (ikke `.env.txt`).

---

*Forrige: [02-TAILWIND-SHADCN.md](./02-TAILWIND-SHADCN.md) | Neste: [04-TYPESCRIPT-INTERFACES.md](./04-TYPESCRIPT-INTERFACES.md)*
