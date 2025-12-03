# 09 - Sider og Ruting

Denne guiden viser hvordan du organiserer sider med Next.js App Router.

---

## Innhold

1. [App Router oversikt](#app-router-oversikt)
2. [Mappestruktur](#mappestruktur)
3. [Route Groups](#route-groups)
4. [Offentlige sider](#offentlige-sider)
5. [Private sider](#private-sider)
6. [Dynamiske ruter](#dynamiske-ruter)
7. [Navigasjon](#navigasjon)
8. [Sjekkliste](#sjekkliste)

---

## App Router oversikt

### Filbasert ruting

Next.js App Router bruker mappestruktur for å definere ruter:

```
src/app/
├── page.tsx          → /
├── login/
│   └── page.tsx      → /login
├── register/
│   └── page.tsx      → /register
└── dashboard/
    └── page.tsx      → /dashboard
```

### Spesielle filer

| Fil | Formål |
|-----|--------|
| `page.tsx` | UI for ruten |
| `layout.tsx` | Delt layout for ruten og barn |
| `loading.tsx` | Loading UI (React Suspense) |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404-side |

---

## Mappestruktur

### Anbefalt struktur for prosjektet

```
src/app/
├── (public)/                    # Route group - offentlige sider
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── layout.tsx               # Valgfri: spesifikt layout
│
├── (private)/                   # Route group - krever auth
│   ├── job-seeker/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── jobs/
│   │   │   └── page.tsx
│   │   └── applications/
│   │       └── page.tsx
│   │
│   └── recruiter/
│       ├── dashboard/
│       │   └── page.tsx
│       ├── jobs/
│       │   ├── page.tsx
│       │   ├── new/
│       │   │   └── page.tsx
│       │   └── [id]/
│       │       └── page.tsx
│       └── applications/
│           └── page.tsx
│
├── globals.css
├── layout.tsx                   # Rot-layout
└── page.tsx                     # Hjemmeside (/)
```

---

## Route Groups

### Hva er Route Groups?

Mapper med parenteser `(navn)` grupperer ruter uten å påvirke URL:

```
src/app/(public)/login/page.tsx  → /login      (ikke /public/login)
src/app/(private)/dashboard/     → /dashboard  (ikke /private/dashboard)
```

### Fordeler

1. **Organisering** - Skill offentlige og private sider
2. **Layouts** - Ulike layouts per gruppe
3. **Logisk gruppering** - Relaterte sider sammen

### Opprette Route Groups

```bash
mkdir -p "src/app/(public)"
mkdir -p "src/app/(private)/job-seeker"
mkdir -p "src/app/(private)/recruiter"
```

**Merk:** Anførselstegn rundt stier med parenteser i terminal.

---

## Offentlige sider

### Hjemmeside

**Fil:** `src/app/page.tsx`

```typescript
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Next-Hire</h1>
      <p className="text-gray-600 mb-8">Find your next opportunity</p>

      <div className="flex gap-4">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Register</Button>
        </Link>
      </div>
    </div>
  );
}
```

### Login-side

**Fil:** `src/app/(public)/login/page.tsx`

Se [06-FORM-VALIDATION.md](./06-FORM-VALIDATION.md) for komplett implementasjon.

### Register-side

**Fil:** `src/app/(public)/register/page.tsx`

Se [06-FORM-VALIDATION.md](./06-FORM-VALIDATION.md) for komplett implementasjon.

---

## Private sider

Private sider bruker Zustand global state for brukerdata. Se [12-STATE-MANAGEMENT.md](./12-STATE-MANAGEMENT.md) for detaljer.

### Komplett mappestruktur for private sider

```
src/app/(private)/
├── job-seeker/
│   └── dashboard/
│       └── page.tsx
│
└── recruiter/
    ├── dashboard/
    │   └── page.tsx
    ├── jobs/
    │   ├── page.tsx              → /recruiter/jobs (liste)
    │   ├── add/
    │   │   └── page.tsx          → /recruiter/jobs/add (ny jobb)
    │   └── edit/
    │       └── [id]/
    │           └── page.tsx      → /recruiter/jobs/edit/123 (rediger)
    ├── applications/
    │   └── page.tsx
    └── profile/
        └── page.tsx
```

### Recruiter Dashboard

**Fil:** `src/app/(private)/recruiter/dashboard/page.tsx`

```typescript
import React from 'react'

function RecruiterDashboard() {
  return (
    <div>
      This is Recruiter Dashboard
    </div>
  )
}

export default RecruiterDashboard
```

### Job Seeker Dashboard

**Fil:** `src/app/(private)/job-seeker/dashboard/page.tsx`

```typescript
import React from 'react'

function JobSeekerDashboard() {
  return (
    <div>
      This is Job Seeker Dashboard
    </div>
  )
}

export default JobSeekerDashboard
```

---

### Recruiter Jobs-sider (CRUD-struktur)

Recruiter har en komplett jobs-seksjon med liste, opprett og rediger:

#### Jobs Liste

**Fil:** `src/app/(private)/recruiter/jobs/page.tsx`

```tsx
import PageTitle from '@/components/functional/page-title'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function RecruiterJobsPage() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <PageTitle title="Jobs" />
        <Button className='flex items-center gap-1'>
          <Plus size={14} />
          <Link href="/recruiter/jobs/add">Add New Job</Link>
        </Button>
      </div>
      <div>
        {/* Job listings would go here */}
      </div>
    </div>
  )
}

export default RecruiterJobsPage
```

#### Forklaring av Jobs Liste

| Del | Beskrivelse |
|-----|-------------|
| `PageTitle` | Gjenbrukbar komponent for sidetittel |
| `flex justify-between` | Plasserer tittel og knapp på hver side |
| `Plus` | Lucide-ikon for "legg til" |
| `Link href="/recruiter/jobs/add"` | Navigasjon til opprett-siden |

#### Add New Job

**Fil:** `src/app/(private)/recruiter/jobs/add/page.tsx`

```tsx
import JobForm from '@/components/functional/job-form'
import PageTitle from '@/components/functional/page-title'
import React from 'react'

function AddJobPage() {
  return (
    <div className='flex flex-col gap-5'>
        <PageTitle title="Add New Job" />
        <JobForm />
    </div>
  )
}

export default AddJobPage
```

#### Edit Job (Dynamisk rute)

**Fil:** `src/app/(private)/recruiter/jobs/edit/[id]/page.tsx`

```tsx
import JobForm from '@/components/functional/job-form'
import PageTitle from '@/components/functional/page-title'
import React from 'react'

function EditJobPage() {
  return (
    <div className='flex flex-col gap-5'>
      <PageTitle title="Edit Job" />
      <JobForm />
    </div>
  )
}

export default EditJobPage
```

#### Rute-oversikt for Jobs

| URL | Fil | Formål |
|-----|-----|--------|
| `/recruiter/jobs` | `jobs/page.tsx` | Liste over alle jobber |
| `/recruiter/jobs/add` | `jobs/add/page.tsx` | Opprett ny jobb |
| `/recruiter/jobs/edit/123` | `jobs/edit/[id]/page.tsx` | Rediger jobb med ID 123 |

#### Mappestruktur visualisert

```
recruiter/jobs/
├── page.tsx              → /recruiter/jobs
├── add/
│   └── page.tsx          → /recruiter/jobs/add
└── edit/
    └── [id]/
        └── page.tsx      → /recruiter/jobs/edit/:id
```

---

### Viktig: Server Components som default

Dashboard-sidene er nå **Server Components** (ingen `'use client'`). Brukerdata hentes allerede av PrivateLayout og lagres i Zustand store.

Hvis du trenger brukerdata i en side, legg til `'use client'` og bruk Zustand:

```typescript
'use client';
import useUsersStore, { IUsersStore } from '@/store/users-store';

function MyPage() {
  const { user } = useUsersStore() as IUsersStore;

  return <div>Welcome, {user?.name}</div>;
}
```

### Andre private sider

De andre private sidene (Jobs, Applications, Profile) følger samme enkle mønster:

**Recruiter sider:**
- `/recruiter/jobs` → `src/app/(private)/recruiter/jobs/page.tsx`
- `/recruiter/applications` → `src/app/(private)/recruiter/applications/page.tsx`
- `/recruiter/profile` → `src/app/(private)/recruiter/profile/page.tsx`

**Job Seeker sider:**
- `/job-seeker/jobs` → `src/app/(private)/job-seeker/jobs/page.tsx`
- `/job-seeker/applications` → `src/app/(private)/job-seeker/applications/page.tsx`
- `/job-seeker/profile` → `src/app/(private)/job-seeker/profile/page.tsx`

### Eksempel: Enkel side-mal

```typescript
import React from 'react'

function PageName() {
  return (
    <div>
      Welcome to the Page
    </div>
  )
}

export default PageName
```

### Legge til ny privat side

1. **Opprett mappe og fil:**
   ```bash
   mkdir -p "src/app/(private)/recruiter/new-page"
   touch "src/app/(private)/recruiter/new-page/page.tsx"
   ```

2. **Lag enkel side:**
   ```typescript
   import React from 'react'

   function NewPage() {
     return (
       <div>
         <h1>New Page</h1>
       </div>
     )
   }

   export default NewPage
   ```

3. **Legg til brukerdata (valgfritt):**
   ```typescript
   'use client';
   import useUsersStore, { IUsersStore } from '@/store/users-store';

   function NewPage() {
     const { user } = useUsersStore() as IUsersStore;

     return (
       <div>
         <h1>New Page</h1>
         <p>Velkommen, {user?.name}</p>
       </div>
     );
   }

   export default NewPage;
   ```

4. **Legg til i sidebar-meny:**

   Se [08-CUSTOM-LAYOUTS.md](./08-CUSTOM-LAYOUTS.md) for hvordan du legger til nye menypunkter i sidebar.

---

## Dynamiske ruter

### Hva er dynamiske ruter?

Ruter med variable segmenter:

```
/jobs/123     → [id] = "123"
/jobs/456     → [id] = "456"
/users/john   → [username] = "john"
```

### Opprette dynamisk rute

**Mappe:** `src/app/(private)/recruiter/jobs/[id]/`

**Fil:** `src/app/(private)/recruiter/jobs/[id]/page.tsx`

```typescript
interface Props {
  params: Promise<{ id: string }>;
}

async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div>
      <h1>Job ID: {id}</h1>
      {/* Hent og vis jobbdetaljer */}
    </div>
  );
}

export default JobDetailPage;
```

### Med data-henting

```typescript
import supabase from '@/config/supabase-config';

interface Props {
  params: Promise<{ id: string }>;
}

async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  // Hent jobb fra database
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !job) {
    return <div>Job not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="text-gray-600">{job.company}</p>
      <p className="mt-4">{job.description}</p>
    </div>
  );
}

export default JobDetailPage;
```

---

## Navigasjon

### Link-komponent

```typescript
import Link from 'next/link';

// Enkel lenke
<Link href="/login">Login</Link>

// Med styling
<Link href="/login" className="text-blue-500 hover:underline">
  Login
</Link>

// Med dynamisk rute
<Link href={`/jobs/${job.id}`}>
  View Job
</Link>
```

### useRouter (programmatisk)

```typescript
'use client'
import { useRouter } from 'next/navigation';

function MyComponent() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard');  // Navigate
    router.replace('/login');   // Replace (ingen history)
    router.back();              // Tilbake
    router.refresh();           // Refresh data
  };
}
```

### VIKTIG: Riktig import

```typescript
// App Router (Next.js 13+)
import { useRouter } from 'next/navigation';  ✓

// Pages Router (gammel)
import { useRouter } from 'next/router';      ✗
```

---

## Loading og Error states

### Loading

**Fil:** `src/app/(private)/job-seeker/dashboard/loading.tsx`

```typescript
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
```

### Error

**Fil:** `src/app/(private)/job-seeker/dashboard/error.tsx`

```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <h2 className="text-xl font-bold text-red-500">Something went wrong!</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-primary text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

### Not Found

**Fil:** `src/app/not-found.tsx`

```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600 mt-2">Page not found</p>
      <Link href="/" className="mt-4 text-primary hover:underline">
        Go home
      </Link>
    </div>
  );
}
```

---

## Metadata

### Statisk metadata

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Next-Hire',
  description: 'Your job seeker dashboard',
};

export default function DashboardPage() {
  return <div>Dashboard</div>;
}
```

### Dynamisk metadata

```typescript
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // Hent data for å generere metadata
  return {
    title: `Job ${id} - Next-Hire`,
  };
}

export default async function JobPage({ params }: Props) {
  // ...
}
```

---

## Sjekkliste

### Mappestruktur - Offentlige sider
- [ ] `src/app/(public)/` opprettet
- [ ] `src/app/(public)/login/page.tsx` opprettet
- [ ] `src/app/(public)/register/page.tsx` opprettet

### Mappestruktur - Recruiter sider
- [ ] `src/app/(private)/recruiter/dashboard/page.tsx` opprettet
- [ ] `src/app/(private)/recruiter/jobs/page.tsx` opprettet (liste)
- [ ] `src/app/(private)/recruiter/jobs/add/page.tsx` opprettet (ny jobb)
- [ ] `src/app/(private)/recruiter/jobs/edit/[id]/page.tsx` opprettet (rediger)
- [ ] `src/app/(private)/recruiter/applications/page.tsx` opprettet
- [ ] `src/app/(private)/recruiter/profile/page.tsx` opprettet

### Mappestruktur - Job Seeker sider
- [ ] `src/app/(private)/job-seeker/dashboard/page.tsx` opprettet
- [ ] `src/app/(private)/job-seeker/jobs/page.tsx` opprettet
- [ ] `src/app/(private)/job-seeker/applications/page.tsx` opprettet
- [ ] `src/app/(private)/job-seeker/profile/page.tsx` opprettet

### Ruting
- [ ] Hjemmeside (`/`) fungerer
- [ ] Login (`/login`) fungerer
- [ ] Register (`/register`) fungerer
- [ ] Recruiter Dashboard (`/recruiter/dashboard`) fungerer
- [ ] Job Seeker Dashboard (`/job-seeker/dashboard`) fungerer
- [ ] Alle sider tilgjengelige via sidebar-meny

### Zustand-integrasjon
- [ ] PrivateLayout henter brukerdata og lagrer i store
- [ ] Sider som trenger brukerdata bruker `'use client'` + `useUsersStore`
- [ ] Enkle sider kan være Server Components (ingen `'use client'`)

### Navigasjon
- [ ] `Link`-komponent brukes for navigasjon
- [ ] `useRouter` fra `next/navigation`
- [ ] Redirect etter login fungerer
- [ ] Sidebar-meny navigerer korrekt

### Dynamiske ruter
- [ ] `[id]`-mapper opprettet (hvis relevant)
- [ ] Params hentes korrekt

### Spesielle filer
- [ ] `loading.tsx` opprettet (valgfritt)
- [ ] `error.tsx` opprettet (valgfritt)
- [ ] `not-found.tsx` opprettet (valgfritt)

---

## Neste steg

Gå videre til [10-COMPONENTS.md](./10-COMPONENTS.md) for å lære om gjenbrukbare komponenter.

---

*Forrige: [08-CUSTOM-LAYOUTS.md](./08-CUSTOM-LAYOUTS.md) | Neste: [10-COMPONENTS.md](./10-COMPONENTS.md)*
