# Custom Layout Guide - Next.js

En guide for å implementere dynamiske layouts basert på ruter i Next.js.

---

## Innholdsfortegnelse

1. [Hva er Custom Layout?](#hva-er-custom-layout)
2. [Hvorfor bruke Custom Layout?](#hvorfor-bruke-custom-layout)
3. [Arkitektur](#arkitektur)
4. [Implementering steg-for-steg](#implementering-steg-for-steg)
5. [Filstruktur](#filstruktur)
6. [Kode forklart](#kode-forklart)
7. [Utvidelser](#utvidelser)
8. [Gjenbruk i andre prosjekter](#gjenbruk-i-andre-prosjekter)

---

## Hva er Custom Layout?

Custom Layout er et mønster der du viser **forskjellige layouts** basert på hvilken side brukeren er på.

**Eksempel fra dette prosjektet:**

| Rute | Layout | Beskrivelse |
|------|--------|-------------|
| `/` | Ingen wrapper | Bare innholdet |
| `/login` | Ingen wrapper | Bare innholdet |
| `/register` | Ingen wrapper | Bare innholdet |
| `/job-seeker/*` | PrivateLayout | Header + innhold |
| `/recruiter/*` | PrivateLayout | Header + innhold |

---

## Hvorfor bruke Custom Layout?

### Problemet

I Next.js App Router har du én `layout.tsx` som wrapper alle sider. Men hva hvis du vil:

- Vise header kun på innloggede sider?
- Ha sidebar kun i dashboard?
- Ha forskjellig navigasjon for admin vs bruker?

### Løsningen

CustomLayout-komponenten sjekker **ruten** og velger riktig layout dynamisk:

```
┌─────────────────────────────────────────────────────────────┐
│                     RootLayout                              │
│                    (layout.tsx)                             │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  CustomLayout                       │   │
│   │                                                     │   │
│   │   if (isPrivate) {                                  │   │
│   │     return <PrivateLayout>{children}</PrivateLayout>│   │
│   │   }                                                 │   │
│   │   return children                                   │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Arkitektur

### Komponenthierarki

```
RootLayout (layout.tsx)
    │
    └── CustomLayout (index.tsx)
            │
            ├── Offentlige sider → {children} direkte
            │
            └── Private sider → PrivateLayout
                                    │
                                    ├── Header
                                    └── {children}
```

### Flytdiagram

```
Bruker besøker side
        │
        ▼
CustomLayout sjekker path
        │
        ├── /login, /register, /
        │   └── Vis {children} direkte (ingen wrapper)
        │
        └── /job-seeker/*, /recruiter/*
            └── Vis PrivateLayout
                    │
                    ├── Header (logo, meny, etc.)
                    └── {children} (sideinnhold)
```

---

## Implementering steg-for-steg

### Steg 1: Opprett mappestruktur

```bash
mkdir -p src/custom-layout
touch src/custom-layout/index.tsx
touch src/custom-layout/private.tsx
touch src/custom-layout/header.tsx
```

### Steg 2: Opprett Header-komponent

**Fil:** `src/custom-layout/header.tsx`

```tsx
import React from 'react'

function Header() {
  return (
    <div className='bg-primary p-5 flex justify-between items-center'>
      <h1 className='text-white font-bold text-2xl'>Next-Hire</h1>

      {/* Legg til mer her: navigasjon, brukerinfo, logout-knapp */}
    </div>
  )
}

export default Header
```

### Steg 3: Opprett PrivateLayout

**Fil:** `src/custom-layout/private.tsx`

```tsx
import React from 'react'
import Header from './header'

function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Header vises på alle private sider */}
      <Header />

      {/* Sideinnhold med padding */}
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

export default PrivateLayout
```

### Steg 4: Opprett CustomLayout (hovedlogikk)

**Fil:** `src/custom-layout/index.tsx`

```tsx
'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import PrivateLayout from './private'

function CustomLayout({ children }: { children: React.ReactNode }) {
  // Hent nåværende URL-path
  const path = usePathname()

  // Definer hvilke ruter som er "private" (trenger spesiell layout)
  const isPrivate = path.startsWith('/job-seeker') || path.startsWith('/recruiter')

  // Hvis IKKE privat → vis innholdet direkte (ingen wrapper)
  if (!isPrivate) {
    return children
  }

  // Hvis privat → wrap i PrivateLayout
  return <PrivateLayout>{children}</PrivateLayout>
}

export default CustomLayout
```

### Steg 5: Integrer i RootLayout

**Fil:** `src/app/layout.tsx`

```tsx
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import CustomLayout from "@/custom-layout"  // <-- Importer

export const metadata: Metadata = {
  title: "Next Job Board",
  description: "Job board application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Wrap children med CustomLayout */}
        <CustomLayout>
          {children}
        </CustomLayout>

        <Toaster />
      </body>
    </html>
  )
}
```

---

## Filstruktur

```
src/
├── app/
│   ├── layout.tsx              # Importerer CustomLayout
│   ├── (public)/
│   │   ├── page.tsx            # Vises UTEN PrivateLayout
│   │   ├── login/page.tsx      # Vises UTEN PrivateLayout
│   │   └── register/page.tsx   # Vises UTEN PrivateLayout
│   └── (private)/
│       ├── job-seeker/
│       │   └── dashboard/
│       │       └── page.tsx    # Vises MED PrivateLayout
│       └── recruiter/
│           └── dashboard/
│               └── page.tsx    # Vises MED PrivateLayout
│
└── custom-layout/
    ├── index.tsx               # Hovedlogikk (velger layout)
    ├── private.tsx             # Layout for innloggede brukere
    └── header.tsx              # Header-komponent
```

---

## Kode forklart

### index.tsx - Hovedlogikk

```tsx
'use client'  // Nødvendig fordi vi bruker usePathname (client hook)
import React from 'react'
import { usePathname } from 'next/navigation'
import PrivateLayout from './private'

function CustomLayout({ children }: { children: React.ReactNode }) {
  // usePathname() returnerer nåværende URL-path
  // Eksempel: "/job-seeker/dashboard" → path = "/job-seeker/dashboard"
  const path = usePathname()

  // Sjekk om pathen starter med en "privat" prefix
  // startsWith() returnerer true/false
  const isPrivate = path.startsWith('/job-seeker') || path.startsWith('/recruiter')

  // Betinget rendering:
  // - Hvis offentlig side → returner children uten wrapper
  // - Hvis privat side → wrap children i PrivateLayout
  if (!isPrivate) {
    return children
  }

  return <PrivateLayout>{children}</PrivateLayout>
}

export default CustomLayout
```

### private.tsx - Layout-wrapper

```tsx
import React from 'react'
import Header from './header'

// Props: children er sideinnholdet som skal vises
function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Header er ALLTID synlig på private sider */}
      <Header />

      {/* children er det faktiske sideinnholdet */}
      {/* p-5 gir padding rundt innholdet */}
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

export default PrivateLayout
```

### header.tsx - Header-komponent

```tsx
import React from 'react'

function Header() {
  return (
    // Flexbox for horisontal layout
    // justify-between: elementer på hver side
    // items-center: vertikal sentrering
    <div className='bg-primary p-5 flex justify-between items-center'>
      <h1 className='text-white font-bold text-2xl'>Next-Hire</h1>

      {/* Her kan du legge til:
          - Navigasjonslenker
          - Brukerinfo
          - Logout-knapp
          - Dropdown-meny
      */}
    </div>
  )
}

export default Header
```

---

## Utvidelser

### Legg til Sidebar

```tsx
// src/custom-layout/sidebar.tsx
import React from 'react'
import Link from 'next/link'

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 min-h-screen p-4">
      <nav className="space-y-2">
        <Link href="/job-seeker/dashboard" className="block p-2 hover:bg-gray-200 rounded">
          Dashboard
        </Link>
        <Link href="/job-seeker/profile" className="block p-2 hover:bg-gray-200 rounded">
          Profil
        </Link>
        <Link href="/job-seeker/jobs" className="block p-2 hover:bg-gray-200 rounded">
          Jobber
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar
```

```tsx
// src/custom-layout/private.tsx (oppdatert)
import React from 'react'
import Header from './header'
import Sidebar from './sidebar'

function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-5">
          {children}
        </main>
      </div>
    </div>
  )
}

export default PrivateLayout
```

### Forskjellige layouts per rolle

```tsx
// src/custom-layout/index.tsx (utvidet)
'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import JobSeekerLayout from './job-seeker-layout'
import RecruiterLayout from './recruiter-layout'
import AdminLayout from './admin-layout'

function CustomLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()

  // Sjekk hvilken type bruker
  if (path.startsWith('/job-seeker')) {
    return <JobSeekerLayout>{children}</JobSeekerLayout>
  }

  if (path.startsWith('/recruiter')) {
    return <RecruiterLayout>{children}</RecruiterLayout>
  }

  if (path.startsWith('/admin')) {
    return <AdminLayout>{children}</AdminLayout>
  }

  // Offentlige sider
  return children
}

export default CustomLayout
```

### Legg til Footer

```tsx
// src/custom-layout/footer.tsx
import React from 'react'

function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p>&copy; 2024 Next-Hire. Alle rettigheter reservert.</p>
    </footer>
  )
}

export default Footer
```

```tsx
// src/custom-layout/private.tsx (med footer)
import React from 'react'
import Header from './header'
import Footer from './footer'

function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-5">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default PrivateLayout
```

---

## Gjenbruk i andre prosjekter

### Kopier disse filene

```
src/custom-layout/
├── index.tsx      # Tilpass rute-sjekkene
├── private.tsx    # Tilpass layout-struktur
└── header.tsx     # Tilpass header-innhold
```

### Tilpass for ditt prosjekt

**1. Endre rute-sjekker i index.tsx:**

```tsx
// Eksempel for e-commerce
const isPrivate = path.startsWith('/account') ||
                  path.startsWith('/orders') ||
                  path.startsWith('/checkout')

// Eksempel for SaaS
const isPrivate = path.startsWith('/dashboard') ||
                  path.startsWith('/settings') ||
                  path.startsWith('/billing')

// Eksempel for admin-panel
const isAdmin = path.startsWith('/admin')
const isUser = path.startsWith('/user')
```

**2. Tilpass PrivateLayout:**

```tsx
// Med sidebar
<div className="flex">
  <Sidebar />
  <main>{children}</main>
</div>

// Uten sidebar
<div>
  <Header />
  <main>{children}</main>
</div>

// Med breadcrumbs
<div>
  <Header />
  <Breadcrumbs />
  <main>{children}</main>
</div>
```

**3. Oppdater layout.tsx:**

```tsx
import CustomLayout from "@/custom-layout"

// Wrap children
<CustomLayout>
  {children}
</CustomLayout>
```

### Sjekkliste for nye prosjekter

- [ ] Opprett `src/custom-layout/` mappe
- [ ] Opprett `index.tsx` med rute-logikk
- [ ] Opprett `private.tsx` (eller andre layout-varianter)
- [ ] Opprett `header.tsx` og andre komponenter
- [ ] Importer `CustomLayout` i `layout.tsx`
- [ ] Wrap `{children}` med `<CustomLayout>`
- [ ] Test at riktig layout vises på riktige ruter

---

## Vanlige feil

### 1. "usePathname" krever 'use client'

```tsx
// ❌ Feil - mangler 'use client'
import { usePathname } from 'next/navigation'

// ✅ Riktig
'use client'
import { usePathname } from 'next/navigation'
```

### 2. Layout vises ikke

**Sjekk:**
- Er `CustomLayout` importert i `layout.tsx`?
- Er `{children}` wrappet med `<CustomLayout>`?
- Matcher rute-sjekkene i `index.tsx` URLen?

### 3. Styling fungerer ikke

**Sjekk:**
- Er Tailwind CSS konfigurert?
- Er `globals.css` importert i `layout.tsx`?
- Finnes fargene (f.eks. `bg-primary`) i Tailwind-config?

---

## Fordeler med dette mønsteret

| Fordel | Beskrivelse |
|--------|-------------|
| **Enkel** | Én fil som kontrollerer all layout-logikk |
| **Skalerbar** | Lett å legge til nye layout-typer |
| **Gjenbrukbar** | Kopier til nye prosjekter |
| **Sentralisert** | All layout-logikk på ett sted |
| **Fleksibel** | Kan kombineres med Next.js route groups |

---

## Relaterte dokumenter

- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - Autentisering
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Prosjektoversikt
- [PROXY_GUIDE.md](./PROXY_GUIDE.md) - Proxy/rutebeskyttelse

---

*Sist oppdatert: Desember 2024*
