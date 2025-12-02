# 12 - State Management med Zustand

Denne guiden viser hvordan du implementerer global state management med Zustand.

---

## Innhold

1. [Oversikt](#oversikt)
2. [Installer Zustand](#installer-zustand)
3. [Opprett User Store](#opprett-user-store)
4. [Integrer i PrivateLayout](#integrer-i-privatelayout)
5. [Bruk i komponenter](#bruk-i-komponenter)
6. [Dataflyt](#dataflyt)
7. [Best Practices](#best-practices)
8. [Sjekkliste](#sjekkliste)

---

## Oversikt

### Hvorfor Zustand?

| Fordel | Beskrivelse |
|--------|-------------|
| **Enkelt** | Minimal boilerplate sammenlignet med Redux |
| **Lite** | ~1KB minified |
| **TypeScript** | God TypeScript-støtte |
| **Fleksibelt** | Fungerer både i client og server components |
| **Ingen Provider** | Trenger ikke wrappe appen i Provider |

### Arkitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZUSTAND DATAFLYT                              │
│                                                                  │
│  PrivateLayout                                                  │
│       │                                                          │
│       ├── fetchUser() ved mount                                  │
│       │       │                                                  │
│       │       ▼                                                  │
│       │   getLoggedInUser()                                     │
│       │       │                                                  │
│       │       ▼                                                  │
│       └── setUser(data) ──────► Zustand Store                   │
│                                      │                          │
│                                      ▼                          │
│                              ┌───────────────┐                  │
│                              │ user: IUser   │                  │
│                              └───────────────┘                  │
│                                      │                          │
│                      ┌───────────────┼───────────────┐          │
│                      ▼               ▼               ▼          │
│                   Header      Dashboard        Andre sider      │
│                   (user)       (user)           (user)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Installer Zustand

```bash
npm install zustand
```

---

## Opprett User Store

### Fil: `src/store/users-store.ts`

```typescript
import { IUser } from '@/interfaces'
import { create } from 'zustand'

// Opprett store
const useUsersStore = create((set) => ({
  // Initial state
  user: null,

  // Actions
  setUser: (payload: IUser) => set(() => ({ user: payload })),
}))

export default useUsersStore;

// TypeScript interface for store
export interface IUsersStore {
  user: IUser | null;
  setUser: (payload: IUser) => void;
}
```

### Forklaring

| Del | Beskrivelse |
|-----|-------------|
| `create()` | Zustand-funksjon for å opprette store |
| `set()` | Funksjon for å oppdatere state |
| `user: null` | Initial state - ingen bruker |
| `setUser` | Action for å sette brukerdata |
| `IUsersStore` | TypeScript interface for type-sikkerhet |

### Utvide med flere actions

```typescript
const useUsersStore = create((set) => ({
  user: null,

  // Sett bruker
  setUser: (payload: IUser) => set(() => ({ user: payload })),

  // Fjern bruker (logout)
  clearUser: () => set(() => ({ user: null })),

  // Oppdater spesifikke felt
  updateUser: (updates: Partial<IUser>) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),
}))

export interface IUsersStore {
  user: IUser | null;
  setUser: (payload: IUser) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<IUser>) => void;
}
```

---

## Integrer i PrivateLayout

### Fil: `src/custom-layout/private.tsx`

```typescript
import React, { useState } from 'react'
import Header from './header';
import { useEffect } from 'react';
import { getLoggedInUser } from '@/actions/users';
import useUsersStore, { IUsersStore } from '@/store/users-store';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

function PrivateLayout({ children }: { children: React.ReactNode }) {
  // Hent setUser fra store
  const { setUser }: IUsersStore = useUsersStore() as IUsersStore;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Hent brukerdata ved mount
  const fetchUser = async () => {
    setLoading(true);
    const response = await getLoggedInUser();

    if (!response.success) {
      toast.error(response.message);
      Cookies.remove('token');
      router.push('/login');
      return;
    }

    // Lagre bruker i global state
    setUser(response.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Vis loading mens brukerdata hentes
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="p-5">{children}</div>
    </div>
  );
}

export default PrivateLayout
```

### Viktige punkter

1. **Hent bruker én gang** - PrivateLayout henter brukerdata ved mount
2. **Global tilgang** - Alle barn-komponenter kan bruke `useUsersStore()`
3. **Loading state** - Viser loading mens data hentes
4. **Feilhåndtering** - Redirect til login hvis autentisering feiler

---

## Bruk i komponenter

### I Header

**Fil:** `src/custom-layout/header.tsx`

```typescript
import React from 'react'
import useUsersStore, { IUsersStore } from '@/store/users-store';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

function Header() {
  // Hent user fra store
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

### I Dashboard

**Fil:** `src/app/(private)/recruiter/dashboard/page.tsx`

```typescript
'use client';
import LogoutButton from '@/components/functional/logout-btn';
import useUsersStore, { IUsersStore } from '@/store/users-store';

function RecruiterDashboardPage() {
  // Hent user fra store
  const { user } = useUsersStore() as IUsersStore;

  return (
    <div className='flex flex-col gap-5'>
      <h1 className='text-2xl font-bold'>Recruiter Dashboard</h1>

      {user && (
        <div className='flex flex-col border p-5 w-max border-gray-300'>
          <h1>Welcome, {user.id}</h1>
          <h1>Your name: {user.name}</h1>
          <h1>Your email: {user.email}</h1>
          <h1>Your role: {user.role}</h1>
          <LogoutButton />
        </div>
      )}
    </div>
  )
}

export default RecruiterDashboardPage;
```

### I LogoutButton

**Fil:** `src/components/functional/logout-btn.tsx`

```typescript
'use client';
import React from 'react'
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import Cookie from 'js-cookie';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    try {
      // Fjern cookies
      Cookie.remove('token');
      Cookie.remove('role');

      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      // Håndter feil
    }
  }

  return (
    <div>
      <Button className='flex items-center gap-1' onClick={onLogout}>
        <LogOut size={16} />
        Logout
      </Button>
    </div>
  )
}

export default LogoutButton
```

---

## Dataflyt

### Komplett flyt

```
1. Bruker logger inn
   └── loginUser() returnerer JWT token
   └── Token lagres i cookie

2. Bruker navigerer til privat side
   └── proxy.ts sjekker token → OK

3. PrivateLayout rendres
   └── useEffect kjører fetchUser()
   └── getLoggedInUser() verifiserer token
   └── Brukerdata returneres
   └── setUser(data) kalles
   └── Zustand store oppdateres

4. Header og Dashboard rendres
   └── useUsersStore() henter user
   └── Brukerinfo vises

5. Bruker logger ut
   └── LogoutButton.onLogout()
   └── Cookies fjernes
   └── Redirect til /login
```

### Sekvensdiagram

```
┌──────────┐     ┌──────────────┐     ┌─────────┐     ┌────────┐
│  Bruker  │     │PrivateLayout │     │  Store  │     │ Header │
└────┬─────┘     └──────┬───────┘     └────┬────┘     └────┬───┘
     │                  │                  │               │
     │ Besøk /dashboard │                  │               │
     │─────────────────>│                  │               │
     │                  │                  │               │
     │                  │ fetchUser()      │               │
     │                  │─────────────────>│               │
     │                  │                  │               │
     │                  │ setUser(data)    │               │
     │                  │─────────────────>│               │
     │                  │                  │               │
     │                  │                  │ useUsersStore()
     │                  │                  │<──────────────│
     │                  │                  │               │
     │                  │                  │ user data     │
     │                  │                  │──────────────>│
     │                  │                  │               │
     │           Vis brukerinfo            │               │
     │<────────────────────────────────────────────────────│
```

---

## Best Practices

### 1. Type-sikkerhet

```typescript
// Bruk type assertion for bedre type-sikkerhet
const { user, setUser } = useUsersStore() as IUsersStore;

// Eller bruk selector for spesifikke verdier
const user = useUsersStore((state) => (state as IUsersStore).user);
```

### 2. Selectors for ytelse

```typescript
// Unngå unødvendige re-renders
// Dårlig - hele store trigget re-render
const store = useUsersStore();

// Bra - kun user-endringer trigger re-render
const user = useUsersStore((state) => (state as IUsersStore).user);
```

### 3. Persist state (valgfritt)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUsersStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (payload: IUser) => set({ user: payload }),
    }),
    {
      name: 'user-storage', // localStorage key
    }
  )
)
```

### 4. DevTools (for debugging)

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const useUsersStore = create(
  devtools(
    (set) => ({
      user: null,
      setUser: (payload: IUser) => set({ user: payload }),
    }),
    { name: 'UserStore' }
  )
)
```

---

## Flere stores

### Oppsett for flere stores

```
src/store/
├── users-store.ts      # Brukerdata
├── jobs-store.ts       # Jobbannonser
└── ui-store.ts         # UI-state (sidebar, modal)
```

### Eksempel: Jobs Store

```typescript
// src/store/jobs-store.ts
import { IJob } from '@/interfaces'
import { create } from 'zustand'

const useJobsStore = create((set) => ({
  jobs: [],
  selectedJob: null,

  setJobs: (jobs: IJob[]) => set({ jobs }),
  setSelectedJob: (job: IJob | null) => set({ selectedJob: job }),
  addJob: (job: IJob) => set((state) => ({
    jobs: [...state.jobs, job]
  })),
}))

export default useJobsStore;
```

### Eksempel: UI Store

```typescript
// src/store/ui-store.ts
import { create } from 'zustand'

const useUIStore = create((set) => ({
  sidebarOpen: true,
  modalOpen: false,

  toggleSidebar: () => set((state) => ({
    sidebarOpen: !state.sidebarOpen
  })),
  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
}))

export default useUIStore;
```

---

## Sjekkliste

### Oppsett
- [ ] `zustand` installert
- [ ] `src/store/` mappe opprettet
- [ ] `users-store.ts` opprettet

### Store implementasjon
- [ ] `useUsersStore` eksportert
- [ ] `IUsersStore` interface definert
- [ ] `user` state definert
- [ ] `setUser` action definert

### Integrasjon
- [ ] PrivateLayout bruker `setUser`
- [ ] Header bruker `user` fra store
- [ ] Dashboard bruker `user` fra store

### Testing
- [ ] Brukerdata vises i Header
- [ ] Brukerdata vises i Dashboard
- [ ] Loading state fungerer
- [ ] Feilhåndtering fungerer

---

## Neste steg

Du har nå en komplett state management-løsning. Vurder å:
- Legge til flere stores (jobs, applications)
- Implementere persist middleware
- Legge til DevTools for debugging

---

*Forrige: [11-DEPLOYMENT.md](./11-DEPLOYMENT.md) | Tilbake til: [00-INDEX.md](./00-INDEX.md)*
