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

### Job Seeker Dashboard

**Fil:** `src/app/(private)/job-seeker/dashboard/page.tsx`

```typescript
'use client'

import React, { useEffect, useState } from 'react';
import { getLoggedInUser } from '@/actions/users';
import { IUser } from '@/interfaces';

function JobSeekerDashboard() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getLoggedInUser();
      if (response.success) {
        setUser(response.data);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Job Seeker Dashboard</h1>

      {user && (
        <div className="bg-white p-4 rounded shadow">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Applications</h3>
          <p className="text-2xl">0</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Saved Jobs</h3>
          <p className="text-2xl">0</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Profile Views</h3>
          <p className="text-2xl">0</p>
        </div>
      </div>
    </div>
  );
}

export default JobSeekerDashboard;
```

### Recruiter Dashboard

**Fil:** `src/app/(private)/recruiter/dashboard/page.tsx`

```typescript
'use client'

import React, { useEffect, useState } from 'react';
import { getLoggedInUser } from '@/actions/users';
import { IUser } from '@/interfaces';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function RecruiterDashboard() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getLoggedInUser();
      if (response.success) {
        setUser(response.data);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
        <Link href="/recruiter/jobs/new">
          <Button>Post New Job</Button>
        </Link>
      </div>

      {user && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <p><strong>Welcome,</strong> {user.name}</p>
          <p className="text-gray-500">{user.email}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Active Jobs</h3>
          <p className="text-2xl">0</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Total Applications</h3>
          <p className="text-2xl">0</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Pending Reviews</h3>
          <p className="text-2xl">0</p>
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
```

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

### Mappestruktur
- [ ] `src/app/(public)/` opprettet
- [ ] `src/app/(public)/login/page.tsx` opprettet
- [ ] `src/app/(public)/register/page.tsx` opprettet
- [ ] `src/app/(private)/job-seeker/dashboard/page.tsx` opprettet
- [ ] `src/app/(private)/recruiter/dashboard/page.tsx` opprettet

### Ruting
- [ ] Hjemmeside (`/`) fungerer
- [ ] Login (`/login`) fungerer
- [ ] Register (`/register`) fungerer
- [ ] Dashboards fungerer

### Navigasjon
- [ ] `Link`-komponent brukes for navigasjon
- [ ] `useRouter` fra `next/navigation`
- [ ] Redirect etter login fungerer

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
