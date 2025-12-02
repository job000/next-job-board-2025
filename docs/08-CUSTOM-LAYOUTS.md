# 08 - Custom Layouts

Implementere dynamiske layouts basert på ruter.

---

## Innhold

1. [Oversikt](#oversikt)
2. [Arkitektur](#arkitektur)
3. [CustomLayout-komponent](#customlayout-komponent)
4. [PrivateLayout](#privatelayout)
5. [Header-komponent](#header-komponent)
6. [Header med Sidebar-meny](#header-med-sidebar-meny-faktisk-implementasjon)
7. [SidebarMenuItems - Rollebasert navigasjon](#sidebarmenu-items---rollebasert-navigasjon)
8. [Mappestruktur for private sider](#mappestruktur-for-private-sider)
9. [Opprette nye sider](#opprette-nye-sider-for-et-prosjekt)
10. [Tilpasning for andre prosjekttyper](#tilpasning-for-andre-prosjekttyper)
11. [Integrering i layout.tsx](#integrering-i-layouttsx)
12. [Utvide med flere layouts](#utvide-med-flere-layouts)
13. [Sjekkliste](#sjekkliste)

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

PrivateLayout henter brukerdata ved mount og lagrer i Zustand store.

### Fil: `src/custom-layout/private.tsx`

```typescript
import React, { useEffect } from "react";
import Header from "./header";
import { getLoggedInUser } from "@/actions/users";
import toast from "react-hot-toast";
import useUsersStore, { IUsersStore } from "@/store/users-store";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/spinner";

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { setUser }: IUsersStore = useUsersStore() as IUsersStore;
  const [loading, setLoading] = React.useState<boolean>(true);
  const router = useRouter();

  const fetchUser = async () => {
    setLoading(true);
    const response = await getLoggedInUser();
    if (!response.success) {
      toast.error(response.message);
      Cookie.remove("token");
      router.push("/login");
      return;
    }
    setUser(response.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <Header />
      <div className="p-5">{children}</div>
    </div>
  );
}

export default PrivateLayout;
```

### Viktige funksjoner

| Funksjon | Beskrivelse |
|----------|-------------|
| `fetchUser()` | Henter brukerdata fra server |
| `setUser()` | Lagrer bruker i Zustand store |
| `<Spinner />` | Viser loading-spinner mens data hentes |
| Feilhåndtering | Redirect til login ved feil |

### Spinner-komponent

PrivateLayout bruker en gjenbrukbar Spinner-komponent for loading-tilstand.

Se [10-COMPONENTS.md](./10-COMPONENTS.md) for detaljer om Spinner-komponenten.

### Dataflyt

```
┌─────────────────────────────────────────┐
│ PrivateLayout mount                     │
│         │                               │
│         ▼                               │
│   fetchUser()                           │
│         │                               │
│         ▼                               │
│   getLoggedInUser() (Server Action)     │
│         │                               │
│    ┌────┴────┐                          │
│    │         │                          │
│  Success   Error                        │
│    │         │                          │
│    ▼         ▼                          │
│ setUser()  Redirect                     │
│    │       to /login                    │
│    ▼                                    │
│ Zustand Store oppdatert                 │
│    │                                    │
│    ▼                                    │
│ Header og children kan bruke user       │
└─────────────────────────────────────────┘
```

### Struktur

```
┌─────────────────────────────────────────┐
│ <div>                                    │
│   ┌─────────────────────────────────┐   │
│   │ <Header />                       │   │
│   │ (bruker Zustand for user-data)   │   │
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

Header-komponenten henter brukerdata fra Zustand store.

### Fil: `src/custom-layout/header.tsx`

```typescript
import React from 'react'
import useUsersStore, { IUsersStore } from '@/store/users-store';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

function Header() {
  // Hent user fra Zustand store
  const { user }: IUsersStore = useUsersStore() as IUsersStore;

  return (
    <div className='bg-primary p-5 flex justify-between items-center'>
      <h1 className='text-white font-bold text-2xl'>Next-Hire</h1>
      <div className='flex gap-5 items-center'>
        <h1 className='text-sm text-white'>
          {user?.name} ({user?.role})
        </h1>
        <Button variant="secondary">
          <Menu color='gray' size={15}/>
        </Button>
      </div>
    </div>
  )
}

export default Header
```

### Forklaring

| Del | Beskrivelse |
|-----|-------------|
| `useUsersStore()` | Henter brukerdata fra global store |
| `user?.name` | Valgfri chaining - unngår feil hvis user er null |
| `{user?.role}` | Viser brukerens rolle |

---

## Header med Sidebar-meny (Faktisk implementasjon)

Header-komponenten åpner en sidebar-meny ved klikk på meny-knappen.

### Fil: `src/custom-layout/header.tsx`

```typescript
import React from 'react'
import useUsersStore, { IUsersStore } from '@/store/users-store';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import SidebarMenuItems from './sidebar-menuitems';

function Header() {
  const { user }: IUsersStore = useUsersStore() as IUsersStore;
  const [openMenuItems, setOpenMenuItems] = React.useState<boolean>(false);

  return (
    <div className='bg-primary p-5 flex justify-between items-center'>
      <h1 className='text-white font-bold text-2xl'>Next-Hire</h1>
      <div className='flex gap-5 items-center'>
        <h1 className='text-sm text-white'>{user?.name} ({user?.role})</h1>
        <Button variant="secondary" onClick={() => setOpenMenuItems(true)}>
          <Menu color='gray' size={15}/>
        </Button>
      </div>
      <SidebarMenuItems
        openMenuItems={openMenuItems}
        setOpenMenuItems={setOpenMenuItems}
        role={user?.role || ''}
      />
    </div>
  )
}

export default Header
```

### Forklaring

| Del | Beskrivelse |
|-----|-------------|
| `openMenuItems` | State for å åpne/lukke sidebar |
| `setOpenMenuItems(true)` | Åpner sidebar ved klikk |
| `SidebarMenuItems` | Sidebar-komponent med navigasjon |
| `role={user?.role}` | Sender rolle til sidebar for riktig meny |

---

## SidebarMenuItems - Rollebasert navigasjon

Sidebar-komponenten viser forskjellige menyer basert på brukerens rolle.

### Installer Sheet-komponent

```bash
npx shadcn@latest add sheet
```

### Fil: `src/custom-layout/sidebar-menuitems.tsx`

```typescript
import LogoutButton from "@/components/functional/logout-btn";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LayoutDashboard, Briefcase, FileText, UserSquare } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface SidebarMenuItemsProps {
  openMenuItems: boolean;
  setOpenMenuItems: (open: boolean) => void;
  role: string;
}

function SidebarMenuItems({
  openMenuItems,
  setOpenMenuItems,
  role,
}: SidebarMenuItemsProps) {
  const iconSize = 15;
  const pathname = usePathname();
  const router = useRouter();

  // ========================================
  // MENYVALG FOR JOB SEEKER
  // Tilpass disse for ditt prosjekt
  // ========================================
  const jobSeekerMenuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={iconSize} />,
      path: "/job-seeker/dashboard",
    },
    {
      title: "Jobs",
      icon: <Briefcase size={iconSize} />,
      path: "/job-seeker/jobs",
    },
    {
      title: "Applications",
      icon: <FileText size={iconSize} />,
      path: "/job-seeker/applications",
    },
    {
      title: "Profile",
      icon: <UserSquare size={iconSize} />,
      path: "/job-seeker/profile",
    },
  ];

  // ========================================
  // MENYVALG FOR RECRUITER
  // Tilpass disse for ditt prosjekt
  // ========================================
  const recruiterMenuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={iconSize} />,
      path: "/recruiter/dashboard",
    },
    {
      title: "My Jobs",
      icon: <Briefcase size={iconSize} />,
      path: "/recruiter/jobs",
    },
    {
      title: "Applications",
      icon: <FileText size={iconSize} />,
      path: "/recruiter/applications",
    },
    {
      title: "Profile",
      icon: <UserSquare size={iconSize} />,
      path: "/recruiter/profile",
    },
  ];

  // Velg meny basert på rolle
  const menuItemsToRender =
    role === "recruiter" ? recruiterMenuItems : jobSeekerMenuItems;

  return (
    <Sheet open={openMenuItems} onOpenChange={setOpenMenuItems}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle></SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-14 px-10 py-10">
          {menuItemsToRender.map((item) => (
            <div
              onClick={() => {
                router.push(item.path);
                setOpenMenuItems(false);
              }}
              className={`cursor-pointer p-3 flex gap-3 items-center ${
                pathname === item.path
                  ? "bg-gray-100 rounded-lg border border-primary"
                  : ""
              }`}
              key={item.title}
            >
              {item.icon}
              <span className="text-sm">{item.title}</span>
            </div>
          ))}

          <LogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SidebarMenuItems;
```

### Menystruktur

| Felt | Type | Beskrivelse |
|------|------|-------------|
| `title` | string | Visningsnavn i menyen |
| `icon` | ReactNode | Lucide-ikon |
| `path` | string | URL-sti til siden |

### Tilpasse menyer for nye prosjekter

For å legge til/fjerne menypunkter, rediger arrayene:

```typescript
// Eksempel: Legg til ny side
const jobSeekerMenuItems = [
  // ... eksisterende
  {
    title: "Settings",                    // Ny side
    icon: <Settings size={iconSize} />,   // Nytt ikon
    path: "/job-seeker/settings",         // Ny path
  },
];

// Eksempel: Fjern en side
const recruiterMenuItems = [
  // Fjern ved å slette objektet fra arrayen
];
```

### Tilgjengelige Lucide-ikoner

```typescript
import {
  LayoutDashboard,  // Dashboard
  Briefcase,        // Jobs
  FileText,         // Applications/Documents
  UserSquare,       // Profile
  Settings,         // Settings
  Bell,             // Notifications
  MessageSquare,    // Messages
  Heart,            // Favorites
  Search,           // Search
  Plus,             // Add/Create
} from "lucide-react";
```

---

## Mappestruktur for private sider

```
src/app/(private)/
├── job-seeker/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── jobs/
│   │   └── page.tsx
│   ├── applications/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx
│
└── recruiter/
    ├── dashboard/
    │   └── page.tsx
    ├── jobs/
    │   └── page.tsx
    ├── applications/
    │   └── page.tsx
    └── profile/
        └── page.tsx
```

### Eksempel: Recruiter Profile Page

**Fil:** `src/app/(private)/recruiter/profile/page.tsx`

```typescript
import React from 'react'

function RecruiterProfilePage() {
  return (
    <div>
      Welcome to the Recruiter Profile Page
    </div>
  )
}

export default RecruiterProfilePage
```

### Eksempel: Recruiter Jobs Page

**Fil:** `src/app/(private)/recruiter/jobs/page.tsx`

```typescript
import React from 'react'

function RecruiterJobsPage() {
  return (
    <div>
      Welcome to the Recruiter Jobs Page
    </div>
  )
}

export default RecruiterJobsPage
```

---

## Opprette nye sider for et prosjekt

### Steg 1: Legg til i menyarray

```typescript
// I sidebar-menuitems.tsx
const recruiterMenuItems = [
  // ... eksisterende
  {
    title: "Reports",
    icon: <BarChart size={iconSize} />,
    path: "/recruiter/reports",
  },
];
```

### Steg 2: Opprett mappe og page.tsx

```bash
mkdir -p src/app/\(private\)/recruiter/reports
```

### Steg 3: Opprett side-komponenten

```typescript
// src/app/(private)/recruiter/reports/page.tsx
import React from 'react'

function RecruiterReportsPage() {
  return (
    <div>
      <h1>Reports</h1>
      {/* Innhold her */}
    </div>
  )
}

export default RecruiterReportsPage
```

---

## Tilpasning for andre prosjekttyper

### E-commerce (Admin/Customer)

```typescript
const adminMenuItems = [
  { title: "Dashboard", icon: <LayoutDashboard />, path: "/admin/dashboard" },
  { title: "Products", icon: <Package />, path: "/admin/products" },
  { title: "Orders", icon: <ShoppingCart />, path: "/admin/orders" },
  { title: "Customers", icon: <Users />, path: "/admin/customers" },
  { title: "Settings", icon: <Settings />, path: "/admin/settings" },
];

const customerMenuItems = [
  { title: "Dashboard", icon: <LayoutDashboard />, path: "/customer/dashboard" },
  { title: "Orders", icon: <ShoppingCart />, path: "/customer/orders" },
  { title: "Wishlist", icon: <Heart />, path: "/customer/wishlist" },
  { title: "Profile", icon: <UserSquare />, path: "/customer/profile" },
];
```

### SaaS (User/Admin)

```typescript
const userMenuItems = [
  { title: "Dashboard", icon: <LayoutDashboard />, path: "/user/dashboard" },
  { title: "Projects", icon: <Folder />, path: "/user/projects" },
  { title: "Team", icon: <Users />, path: "/user/team" },
  { title: "Billing", icon: <CreditCard />, path: "/user/billing" },
  { title: "Settings", icon: <Settings />, path: "/user/settings" },
];
```

### Blog/CMS (Author/Editor)

```typescript
const authorMenuItems = [
  { title: "Dashboard", icon: <LayoutDashboard />, path: "/author/dashboard" },
  { title: "My Posts", icon: <FileText />, path: "/author/posts" },
  { title: "Drafts", icon: <Edit />, path: "/author/drafts" },
  { title: "Profile", icon: <UserSquare />, path: "/author/profile" },
];
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
- [ ] `src/custom-layout/sidebar-menuitems.tsx` opprettet
- [ ] `src/store/users-store.ts` opprettet

### CustomLayout
- [ ] Bruker `usePathname()` for rutedeteksjon
- [ ] Har `'use client'` direktiv
- [ ] Returnerer children for offentlige ruter
- [ ] Wrapper med PrivateLayout for private ruter

### PrivateLayout
- [ ] Inkluderer Header
- [ ] Wrapper children med padding
- [ ] Henter brukerdata med `getLoggedInUser()`
- [ ] Lagrer bruker i Zustand store med `setUser()`
- [ ] Viser loading state
- [ ] Redirecter til login ved feil

### Header
- [ ] Henter bruker fra Zustand store
- [ ] Viser brukernavn og rolle
- [ ] Har meny-knapp som åpner sidebar
- [ ] Sender rolle til SidebarMenuItems

### SidebarMenuItems
- [ ] Sheet-komponent installert (`npx shadcn@latest add sheet`)
- [ ] Rollebaserte menyarrayer definert
- [ ] Aktiv side markert med styling
- [ ] Navigasjon med `router.push()`
- [ ] LogoutButton inkludert
- [ ] Lukker sidebar ved navigasjon

### Private sider opprettet
- [ ] `/recruiter/dashboard`
- [ ] `/recruiter/jobs`
- [ ] `/recruiter/applications`
- [ ] `/recruiter/profile`
- [ ] `/job-seeker/dashboard`
- [ ] `/job-seeker/jobs`
- [ ] `/job-seeker/applications`
- [ ] `/job-seeker/profile`

### Integrering
- [ ] CustomLayout brukes i `layout.tsx`
- [ ] Wrapper children i body
- [ ] Zustand store tilgjengelig globalt

### Testing
- [ ] Offentlige sider viser ingen header
- [ ] Private sider viser header med brukerinfo
- [ ] Sidebar åpnes ved klikk på meny
- [ ] Riktig meny vises basert på rolle
- [ ] Navigasjon fungerer
- [ ] Aktiv side er markert

---

## Neste steg

Gå videre til [09-PAGES-ROUTING.md](./09-PAGES-ROUTING.md) for å sette opp sider og ruting.

---

*Forrige: [07-PROXY-MIDDLEWARE.md](./07-PROXY-MIDDLEWARE.md) | Neste: [09-PAGES-ROUTING.md](./09-PAGES-ROUTING.md)*
