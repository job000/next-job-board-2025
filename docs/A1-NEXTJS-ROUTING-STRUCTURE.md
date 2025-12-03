# A1 - Next.js Routing og Mappestruktur

Denne guiden forklarer hvordan Next.js App Router fungerer, inkludert mapper, filer og ruting.

---

## Innhold

1. [Filbasert ruting](#filbasert-ruting)
2. [Spesielle filer](#spesielle-filer)
3. [Route Groups - (mappenavn)](#route-groups---mappenavn)
4. [Dynamiske ruter - [id]](#dynamiske-ruter---id)
5. [Layouts](#layouts)
6. [Server vs Client Components](#server-vs-client-components)
7. [Vanlige mønstre](#vanlige-mønstre)

---

## Filbasert ruting

### Hvordan det fungerer

I Next.js bestemmer **mappestrukturen** URL-ene. Hver `page.tsx` fil blir en rute.

```
src/app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
├── contact/
│   └── page.tsx          → /contact
└── products/
    ├── page.tsx          → /products
    └── shoes/
        └── page.tsx      → /products/shoes
```

### Regler

| Regel | Forklaring |
|-------|------------|
| `page.tsx` = rute | Bare filer som heter `page.tsx` blir URL-er |
| Mappe = URL-segment | `products/shoes` → `/products/shoes` |
| Nesting = hierarki | Mapper inni mapper = lengre URL-er |

### Eksempel

```tsx
// src/app/products/page.tsx
// Denne filen vises på: /products

function ProductsPage() {
  return (
    <div>
      <h1>Alle produkter</h1>
    </div>
  );
}

export default ProductsPage;
```

---

## Spesielle filer

Next.js har spesielle filnavn som har bestemte funksjoner:

| Fil | Formål | Påkrevd? |
|-----|--------|----------|
| `page.tsx` | UI for ruten | Ja, for å ha en rute |
| `layout.tsx` | Wrapper rundt sider | Nei |
| `loading.tsx` | Vises mens siden laster | Nei |
| `error.tsx` | Vises ved feil | Nei |
| `not-found.tsx` | 404-side | Nei |

### page.tsx

```tsx
// src/app/about/page.tsx
// Dette er INNHOLDET på /about

function AboutPage() {
  return (
    <div>
      <h1>Om oss</h1>
      <p>Vi er et firma...</p>
    </div>
  );
}

export default AboutPage;
```

### layout.tsx

```tsx
// src/app/layout.tsx
// Wrapper rundt ALLE sider

export default function RootLayout({
  children,  // = innholdet fra page.tsx
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body>
        <header>Header her</header>
        {children}  {/* Side-innhold vises her */}
        <footer>Footer her</footer>
      </body>
    </html>
  );
}
```

### loading.tsx

```tsx
// src/app/products/loading.tsx
// Vises automatisk mens produkter hentes

function Loading() {
  return <div>Laster produkter...</div>;
}

export default Loading;
```

### error.tsx

```tsx
// src/app/products/error.tsx
'use client'  // MÅ være client component

function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Noe gikk galt!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Prøv igjen</button>
    </div>
  );
}

export default Error;
```

---

## Route Groups - (mappenavn)

### Hva er det?

Mapper med parenteser `(navn)` organiserer filer UTEN å påvirke URL-en.

```
src/app/
├── (public)/           # Grupperer offentlige sider
│   ├── login/
│   │   └── page.tsx    → /login (IKKE /public/login)
│   └── register/
│       └── page.tsx    → /register
│
└── (private)/          # Grupperer beskyttede sider
    ├── dashboard/
    │   └── page.tsx    → /dashboard (IKKE /private/dashboard)
    └── profile/
        └── page.tsx    → /profile
```

### Hvorfor bruke det?

| Fordel | Forklaring |
|--------|------------|
| **Organisering** | Skill offentlige og private sider |
| **Ulike layouts** | Hvert group kan ha egen `layout.tsx` |
| **Logisk struktur** | Lettere å finne filer |

### Eksempel fra prosjektet

```
src/app/
├── (public)/
│   ├── login/page.tsx       → /login
│   └── register/page.tsx    → /register
│
└── (private)/
    ├── job-seeker/
    │   └── dashboard/page.tsx   → /job-seeker/dashboard
    │
    └── recruiter/
        └── dashboard/page.tsx   → /recruiter/dashboard
```

### Lag route groups

```bash
# I terminal (parenteser krever anførselstegn)
mkdir -p "src/app/(public)/login"
mkdir -p "src/app/(public)/register"
mkdir -p "src/app/(private)/dashboard"
```

---

## Dynamiske ruter - [id]

### Hva er det?

Mapper med brackets `[variabel]` fanger opp dynamiske verdier i URL-en.

```
src/app/products/[id]/page.tsx
```

Dette matcher:
- `/products/1` → id = "1"
- `/products/123` → id = "123"
- `/products/abc` → id = "abc"

### Hvordan hente verdien

```tsx
// src/app/products/[id]/page.tsx

interface Props {
  params: Promise<{ id: string }>;  // I Next.js 15+ er params en Promise
}

async function ProductPage({ params }: Props) {
  const { id } = await params;

  return (
    <div>
      <h1>Produkt ID: {id}</h1>
    </div>
  );
}

export default ProductPage;
```

### Med database-henting

```tsx
// src/app/(private)/recruiter/jobs/[id]/page.tsx

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
    return <div>Jobb ikke funnet</div>;
  }

  return (
    <div>
      <h1>{job.title}</h1>
      <p>{job.description}</p>
    </div>
  );
}

export default JobDetailPage;
```

### Flere dynamiske segmenter

```
src/app/users/[userId]/posts/[postId]/page.tsx
```

```tsx
interface Props {
  params: Promise<{ userId: string; postId: string }>;
}

async function UserPostPage({ params }: Props) {
  const { userId, postId } = await params;

  return (
    <div>
      Bruker: {userId}, Post: {postId}
    </div>
  );
}
```

---

## Layouts

### Hva er layouts?

Layouts wrapper sider og bevarer state ved navigering.

### Rot-layout (påkrevd)

```tsx
// src/app/layout.tsx
// Denne wrapper HELE appen

import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
```

### Nested layouts

```tsx
// src/app/(private)/layout.tsx
// Denne wrapper bare sider i (private)

import PrivateLayout from '@/custom-layout/private';

export default function PrivateGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateLayout>{children}</PrivateLayout>;
}
```

### Layout-hierarki

```
RootLayout (src/app/layout.tsx)
└── Innhold fra page.tsx ELLER
└── PrivateLayout (src/app/(private)/layout.tsx)
    └── Innhold fra (private)/*/page.tsx
```

---

## Server vs Client Components

### Default: Server Components

I Next.js er alle komponenter **Server Components** som standard.

```tsx
// src/app/products/page.tsx
// Dette er en Server Component (default)

async function ProductsPage() {
  // Kan gjøre database-kall direkte
  const products = await fetch('https://api.example.com/products');

  return (
    <div>
      {products.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
}

export default ProductsPage;
```

### Client Component: 'use client'

Legg til `'use client'` øverst for interaktivitet.

```tsx
// src/app/counter/page.tsx
'use client'  // Denne linjen gjør det til Client Component

import { useState } from 'react';

function CounterPage() {
  const [count, setCount] = useState(0);  // useState krever 'use client'

  return (
    <div>
      <p>Teller: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Øk
      </button>
    </div>
  );
}

export default CounterPage;
```

### Når bruke hva?

| Server Component | Client Component |
|------------------|------------------|
| Database-kall | useState, useEffect |
| Hente data | onClick, onChange |
| Ingen interaktivitet | Skjemaer |
| SEO-viktig innhold | Animasjoner |

### Eksempel fra prosjektet

```tsx
// SERVER Component - dashboard (bare viser data)
// src/app/(private)/recruiter/dashboard/page.tsx
function RecruiterDashboard() {
  return <div>This is Recruiter Dashboard</div>;
}

// CLIENT Component - login (har skjema med state)
// src/app/(public)/login/page.tsx
'use client'
function LoginPage() {
  const [loading, setLoading] = useState(false);
  // ...
}
```

---

## Vanlige mønstre

### 1. Enkel side uten data

```tsx
// src/app/about/page.tsx
function AboutPage() {
  return (
    <div>
      <h1>Om oss</h1>
      <p>Vi er et firma som lager ting.</p>
    </div>
  );
}

export default AboutPage;
```

### 2. Side med database-data

```tsx
// src/app/products/page.tsx
import supabase from '@/config/supabase-config';

async function ProductsPage() {
  const { data: products } = await supabase
    .from('products')
    .select('*');

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}

export default ProductsPage;
```

### 3. Side med skjema (client)

```tsx
// src/app/contact/page.tsx
'use client'

import { useState } from 'react';

function ContactPage() {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    console.log(message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}

export default ContactPage;
```

### 4. Dynamisk side med parameter

```tsx
// src/app/products/[id]/page.tsx
interface Props {
  params: Promise<{ id: string }>;
}

async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  return <div>Produkt {id}</div>;
}

export default ProductDetailPage;
```

---

## Oppsummering

| Konsept | Syntaks | Formål |
|---------|---------|--------|
| Rute | `page.tsx` | Lager en URL |
| Layout | `layout.tsx` | Wrapper sider |
| Route Group | `(mappenavn)` | Organiserer uten å påvirke URL |
| Dynamisk rute | `[id]` | Fanger variabel fra URL |
| Client Component | `'use client'` | For interaktivitet |

### Mappestruktur-oppsummering

```
src/app/
├── page.tsx                    → /
├── layout.tsx                  → Rot-layout
├── globals.css                 → Global CSS
│
├── (public)/                   → Gruppe (ikke i URL)
│   ├── login/page.tsx          → /login
│   └── register/page.tsx       → /register
│
├── (private)/                  → Gruppe (ikke i URL)
│   └── recruiter/
│       ├── dashboard/page.tsx  → /recruiter/dashboard
│       └── jobs/
│           ├── page.tsx        → /recruiter/jobs
│           └── [id]/page.tsx   → /recruiter/jobs/123
│
└── api/                        → API-ruter (backend)
    └── users/route.ts          → /api/users
```

---

*Forrige: [A0-JAVASCRIPT-TYPESCRIPT-BASICS.md](./A0-JAVASCRIPT-TYPESCRIPT-BASICS.md) | Neste: [A2-TAILWIND-HTML-STYLING.md](./A2-TAILWIND-HTML-STYLING.md)*
