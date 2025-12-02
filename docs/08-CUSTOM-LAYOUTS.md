# 08 - Custom Layouts

Denne guiden viser hvordan du implementerer dynamiske layouts basert på ruter.

---

## Innhold

1. [Oversikt](#oversikt)
2. [Arkitektur](#arkitektur)
3. [CustomLayout-komponent](#customlayout-komponent)
4. [PrivateLayout](#privatelayout)
5. [Header-komponent](#header-komponent)
6. [Integrering i layout.tsx](#integrering-i-layouttsx)
7. [Utvide med flere layouts](#utvide-med-flere-layouts)
8. [Sjekkliste](#sjekkliste)

---

## Oversikt

### Hvorfor custom layouts?

Next.js har innebygd layout-system, men noen ganger trenger du:
- **Dynamiske layouts** basert på rute
- **Rollebaserte layouts** for ulike brukertyper
- **Betinget rendering** av header/sidebar

### Eksempel

```
Offentlige sider:
┌─────────────────────────────────────────┐
│              Rent innhold               │
│           (ingen header/nav)            │
└─────────────────────────────────────────┘

Private sider:
┌─────────────────────────────────────────┐
│              Header                     │
├─────────────────────────────────────────┤
│                                         │
│              Innhold                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## Arkitektur

### Mappestruktur

```
src/
├── custom-layout/
│   ├── index.tsx       # Hoved-wrapper (CustomLayout)
│   ├── private.tsx     # Layout for innloggede brukere
│   └── header.tsx      # Header-komponent
│
└── app/
    └── layout.tsx      # Bruker CustomLayout
```

### Dataflyt

```
layout.tsx
    │
    └── CustomLayout (index.tsx)
            │
            ├── Offentlig rute? → Returner children direkte
            │
            └── Privat rute? → PrivateLayout
                                    │
                                    ├── Header
                                    └── Children
```

---

## CustomLayout-komponent

### Fil: `src/custom-layout/index.tsx`

```typescript
'use client'
import React from 'react'
import { usePathname } from 'next/navigation';
import PrivateLayout from './private';

function CustomLayout({ children }: { children: React.ReactNode }) {
    const path = usePathname();

    // Definer hvilke ruter som er private
    const isPrivate = path.startsWith('/job-seeker') ||
                      path.startsWith('/recruiter');

    // Offentlige ruter: returner children direkte
    if (!isPrivate) {
        return children;
    }

    // Private ruter: bruk PrivateLayout
    return <PrivateLayout>{children}</PrivateLayout>;
}

export default CustomLayout
```

### Forklaring

| Del | Beskrivelse |
|-----|-------------|
| `'use client'` | Kreves for hooks som `usePathname` |
| `usePathname()` | Henter gjeldende URL-sti |
| `isPrivate` | Boolean som sjekker om ruten er privat |
| `children` | Sideinnholdet som skal rendres |

---

## PrivateLayout

### Fil: `src/custom-layout/private.tsx`

```typescript
import React from 'react'
import Header from './header';

function PrivateLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Header />
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}

export default PrivateLayout
```

### Struktur

```
┌─────────────────────────────────────────┐
│ <div>                                    │
│   ┌─────────────────────────────────┐   │
│   │ <Header />                       │   │
│   └─────────────────────────────────┘   │
│   ┌─────────────────────────────────┐   │
│   │ <div className="p-5">            │   │
│   │   {children}                     │   │
│   │ </div>                           │   │
│   └─────────────────────────────────┘   │
│ </div>                                   │
└─────────────────────────────────────────┘
```

---

## Header-komponent

### Fil: `src/custom-layout/header.tsx`

```typescript
import React from 'react'

function Header() {
  return (
    <div className='bg-primary p-5 flex justify-between items-center'>
      <h1 className='text-white font-bold text-2xl'>Next-Hire</h1>
    </div>
  )
}

export default Header
```

### Utvid med navigasjon

```typescript
'use client'
import React from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import cookie from 'js-cookie';
import { useRouter } from 'next/navigation';

function Header() {
  const path = usePathname();
  const router = useRouter();

  // Bestem rolle fra path
  const isRecruiter = path.startsWith('/recruiter');
  const role = isRecruiter ? 'recruiter' : 'job-seeker';

  // Navigasjonslenker basert på rolle
  const navLinks = isRecruiter ? [
    { href: '/recruiter/dashboard', label: 'Dashboard' },
    { href: '/recruiter/jobs', label: 'My Jobs' },
    { href: '/recruiter/applications', label: 'Applications' },
  ] : [
    { href: '/job-seeker/dashboard', label: 'Dashboard' },
    { href: '/job-seeker/jobs', label: 'Browse Jobs' },
    { href: '/job-seeker/applications', label: 'My Applications' },
  ];

  // Utlogging
  const handleLogout = () => {
    cookie.remove('token');
    cookie.remove('role');
    router.push('/login');
  };

  return (
    <header className='bg-primary p-5 flex justify-between items-center'>
      <h1 className='text-white font-bold text-2xl'>Next-Hire</h1>

      <nav className='flex gap-4'>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-white hover:underline ${
              path === link.href ? 'underline font-bold' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Button variant="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </header>
  );
}

export default Header
```

---

## Integrering i layout.tsx

### Fil: `src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import CustomLayout from "@/custom-layout";

export const metadata: Metadata = {
  title: "Next-Hire - Job Board",
  description: "Find your next opportunity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" />
        <CustomLayout>
          {children}
        </CustomLayout>
      </body>
    </html>
  );
}
```

### Viktig: CustomLayout wrapper alt

```
<body>
  <Toaster />           ← Toast-notifikasjoner
  <CustomLayout>        ← Dynamisk layout-wrapper
    {children}          ← Sideinnhold
  </CustomLayout>
</body>
```

---

## Utvide med flere layouts

### Legg til AdminLayout

**Fil:** `src/custom-layout/admin.tsx`

```typescript
import React from 'react'
import AdminSidebar from './admin-sidebar';
import AdminHeader from './admin-header';

function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader />
                <main className="p-5">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout
```

### Oppdater CustomLayout

```typescript
'use client'
import React from 'react'
import { usePathname } from 'next/navigation';
import PrivateLayout from './private';
import AdminLayout from './admin';

function CustomLayout({ children }: { children: React.ReactNode }) {
    const path = usePathname();

    // Admin-ruter
    if (path.startsWith('/admin')) {
        return <AdminLayout>{children}</AdminLayout>;
    }

    // Private ruter (job-seeker/recruiter)
    if (path.startsWith('/job-seeker') || path.startsWith('/recruiter')) {
        return <PrivateLayout>{children}</PrivateLayout>;
    }

    // Offentlige ruter
    return children;
}

export default CustomLayout
```

---

## Rollebasert header

### Dynamisk navigasjon

```typescript
'use client'
import React, { useEffect, useState } from 'react'
import { getLoggedInUser } from '@/actions/users';
import { IUser } from '@/interfaces';

function Header() {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getLoggedInUser();
      if (response.success) {
        setUser(response.data);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className='bg-primary p-5 flex justify-between items-center'>
      <h1 className='text-white font-bold text-2xl'>Next-Hire</h1>

      {user && (
        <div className='flex items-center gap-4'>
          <span className='text-white'>
            Welcome, {user.name}
          </span>
          <span className='text-white/70 text-sm'>
            ({user.role})
          </span>
        </div>
      )}
    </header>
  );
}
```

---

## Best Practices

### 1. Bruk 'use client' bare når nødvendig

```typescript
// index.tsx - trenger 'use client' for usePathname
'use client'

// private.tsx - trenger IKKE 'use client' (ingen hooks)
import React from 'react'
```

### 2. Hold layouts enkle

```typescript
// GOD - enkel og fokusert
function PrivateLayout({ children }) {
  return (
    <div>
      <Header />
      <div className="p-5">{children}</div>
    </div>
  );
}

// UNNGÅ - for mye logikk i layout
function PrivateLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ... masse logikk
}
```

### 3. Skill mellom layout og komponenter

```
Layout:       Strukturell wrapper (header + content + footer)
Komponenter:  Interaktive elementer (header med navigasjon)
```

---

## Sjekkliste

### Filer
- [ ] `src/custom-layout/index.tsx` opprettet
- [ ] `src/custom-layout/private.tsx` opprettet
- [ ] `src/custom-layout/header.tsx` opprettet

### CustomLayout
- [ ] Bruker `usePathname()` for rutedeteksjon
- [ ] Har `'use client'` direktiv
- [ ] Returnerer children for offentlige ruter
- [ ] Wrapper med PrivateLayout for private ruter

### PrivateLayout
- [ ] Inkluderer Header
- [ ] Wrapper children med padding

### Integrering
- [ ] CustomLayout brukes i `layout.tsx`
- [ ] Wrapper children i body

### Testing
- [ ] Offentlige sider viser ingen header
- [ ] Private sider viser header
- [ ] Navigasjon fungerer

---

## Neste steg

Gå videre til [09-PAGES-ROUTING.md](./09-PAGES-ROUTING.md) for å sette opp sider og ruting.

---

*Forrige: [07-PROXY-MIDDLEWARE.md](./07-PROXY-MIDDLEWARE.md) | Neste: [09-PAGES-ROUTING.md](./09-PAGES-ROUTING.md)*
