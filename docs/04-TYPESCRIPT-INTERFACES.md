# 04 - TypeScript Interfaces

Denne guiden viser hvordan du definerer TypeScript-typer og interfaces for prosjektet.

---

## Innhold

1. [Hvorfor interfaces?](#hvorfor-interfaces)
2. [Bruker-interface](#bruker-interface)
3. [Jobb-interface](#jobb-interface)
4. [Konstanter](#konstanter)
5. [Type-definisjoner](#type-definisjoner)
6. [Bruk i kode](#bruk-i-kode)
7. [Sjekkliste](#sjekkliste)

---

## Hvorfor interfaces?

TypeScript interfaces gir:

- **Type-sikkerhet** - Fanger feil ved kompilering
- **Autofullføring** - Bedre utvikleropplevelse
- **Dokumentasjon** - Koden er selvdokumenterende
- **Refaktorering** - Enklere å endre strukturer

---

## Bruker-interface

### Fil: `src/interfaces/index.ts`

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

### Forklaring av felt

| Felt | Type | Beskrivelse |
|------|------|-------------|
| `id` | `string` | UUID fra database |
| `name` | `string` | Fullt navn |
| `email` | `string` | E-postadresse (unik) |
| `password` | `string` | Hashet passord |
| `role` | Union type | Enten 'recruiter' eller 'job-seeker' |
| `profile_pic` | `string` | URL til profilbilde |
| `resume_url` | `string` | URL til CV (for jobbsøkere) |
| `bio` | `string` | Kort beskrivelse |
| `created_at` | `string \| null` | Opprettelsestidspunkt |
| `updated_at` | `string` | Siste oppdatering |

### Union Types for roller

```typescript
// Definerer tillatte verdier
role: 'recruiter' | 'job-seeker'

// Alternativ: Bruk enum
enum UserRole {
  RECRUITER = 'recruiter',
  JOB_SEEKER = 'job-seeker'
}

// Med enum
role: UserRole
```

---

## Jobb-interface

### Legg til i `src/interfaces/index.ts`

```typescript
export interface IJob {
    id: string;
    title: string;
    description: string;
    company: string;
    location: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
    recruiter_id: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
```

### Søknad-interface

```typescript
export interface IApplication {
    id: string;
    job_id: string;
    user_id: string;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
    cover_letter: string;
    created_at: string;
    updated_at: string;
}
```

---

## Konstanter

### Fil: `src/constants/index.ts`

```typescript
export const userRoles = [
    { label: "Job Seeker", value: "job-seeker" },
    { label: "Recruiter", value: "recruiter" },
]

export const jobTypes = [
    { label: "Full-time", value: "full-time" },
    { label: "Part-time", value: "part-time" },
    { label: "Contract", value: "contract" },
    { label: "Internship", value: "internship" },
]

export const applicationStatuses = [
    { label: "Pending", value: "pending" },
    { label: "Reviewed", value: "reviewed" },
    { label: "Accepted", value: "accepted" },
    { label: "Rejected", value: "rejected" },
]
```

### Bruk i komponenter

```tsx
import { userRoles } from '@/constants'

// I Select-komponent
{userRoles.map((role) => (
  <SelectItem key={role.value} value={role.value}>
    {role.label}
  </SelectItem>
))}
```

---

## Type-definisjoner

### CSS Module-typer

**Fil:** `src/types/css.d.ts`

```typescript
declare module '*.css'
```

### API Response-typer

**Fil:** `src/types/api.d.ts`

```typescript
// Generisk API-respons
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

// Spesifikk for autentisering
export interface AuthResponse {
    success: boolean;
    message: string;
    data?: string; // JWT token
}

// Bruker uten passord (for frontend)
export type SafeUser = Omit<IUser, 'password'>;
```

---

## Bruk i kode

### I Server Actions

```typescript
import { IUser } from '@/interfaces';

export const registerUser = async (payload: Partial<IUser>) => {
    // payload har type-sikkerhet
    const email = payload.email; // string | undefined

    // TypeScript varsler om feil bruk
    // payload.unknownField // Feil!
}
```

### I komponenter

```typescript
import { IUser } from '@/interfaces';

interface Props {
    user: IUser;
    onUpdate: (user: Partial<IUser>) => void;
}

function UserProfile({ user, onUpdate }: Props) {
    return (
        <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
        </div>
    );
}
```

### Med React Hook Form

```typescript
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
    role: z.enum(['recruiter', 'job-seeker']),
});

// Inferer type fra schema
type FormData = z.infer<typeof formSchema>;
// = { name: string; email: string; password: string; role: 'recruiter' | 'job-seeker' }
```

---

## Partial og Omit

### Partial<T>

Gjør alle felt valgfrie:

```typescript
// Alle felt er required
interface IUser {
    id: string;
    name: string;
    email: string;
}

// Alle felt blir valgfrie
type PartialUser = Partial<IUser>;
// = { id?: string; name?: string; email?: string; }

// Bruk: Når du bare sender noen felt
const updateUser = async (data: Partial<IUser>) => { ... }
updateUser({ name: 'Nytt navn' }); // OK
```

### Omit<T, K>

Fjerner spesifikke felt:

```typescript
// Fjern passord for sikker visning
type SafeUser = Omit<IUser, 'password'>;

// Fjern flere felt
type PublicUser = Omit<IUser, 'password' | 'email'>;
```

### Pick<T, K>

Velger kun spesifikke felt:

```typescript
// Kun autentiseringsfelt
type LoginCredentials = Pick<IUser, 'email' | 'password'>;
// = { email: string; password: string; }
```

---

## Best Practices

### 1. Prefix med I

```typescript
// Interface - prefix med I
interface IUser { ... }

// Type - ingen prefix
type UserRole = 'recruiter' | 'job-seeker';
```

### 2. Eksporter alt fra index

```typescript
// src/interfaces/index.ts
export interface IUser { ... }
export interface IJob { ... }
export interface IApplication { ... }

// Import
import { IUser, IJob } from '@/interfaces';
```

### 3. Unngå `any`

```typescript
// Dårlig
const user: any = response.data;

// Bra
const user = response.data as IUser;

// Best
const user: IUser = response.data;
```

### 4. Bruk readonly for immutable data

```typescript
interface IConfig {
    readonly apiUrl: string;
    readonly apiKey: string;
}
```

---

## Sjekkliste

### Interfaces
- [ ] `src/interfaces/index.ts` opprettet
- [ ] `IUser` interface definert
- [ ] Rolle-typer definert (`'recruiter' | 'job-seeker'`)
- [ ] Valgfrie interfaces for jobs, applications

### Konstanter
- [ ] `src/constants/index.ts` opprettet
- [ ] `userRoles` array definert
- [ ] Andre konstanter etter behov

### Type-definisjoner
- [ ] `src/types/css.d.ts` opprettet
- [ ] API response-typer definert (valgfritt)

### Verifisering
- [ ] Ingen TypeScript-feil i prosjektet
- [ ] Autofullføring fungerer
- [ ] Typer brukes konsekvent

---

## Neste steg

Gå videre til [05-AUTHENTICATION.md](./05-AUTHENTICATION.md) for å implementere autentisering.

---

*Forrige: [03-SUPABASE-DATABASE.md](./03-SUPABASE-DATABASE.md) | Neste: [05-AUTHENTICATION.md](./05-AUTHENTICATION.md)*
