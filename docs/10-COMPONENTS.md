# 10 - Komponenter

Denne guiden viser hvordan du organiserer og bruker gjenbrukbare komponenter.

---

## Innhold

1. [Komponentstruktur](#komponentstruktur)
2. [UI-komponenter (Shadcn)](#ui-komponenter-shadcn)
3. [Funksjonelle komponenter](#funksjonelle-komponenter)
4. [Komponentmønstre](#komponentmønstre)
5. [Props og TypeScript](#props-og-typescript)
6. [Client vs Server Components](#client-vs-server-components)
7. [Sjekkliste](#sjekkliste)

---

## Komponentstruktur

### Mappeorganisering

```
src/components/
├── ui/                     # Shadcn/ui komponenter
│   ├── button.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   └── form.tsx
│
└── functional/             # Appspesifikke komponenter
    ├── logout-button.tsx
    ├── user-avatar.tsx
    ├── job-card.tsx
    └── search-bar.tsx
```

### Forskjell på UI og Functional

| Type | Formål | Eksempler |
|------|--------|-----------|
| **UI** | Generiske, stiliserte elementer | Button, Input, Card |
| **Functional** | Appspesifikk logikk | LogoutButton, JobCard |

---

## UI-komponenter (Shadcn)

### Installere komponenter

```bash
# Individuelt
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add form

# Flere samtidig
npx shadcn@latest add button input label select form card
```

### Button-varianter

```tsx
import { Button } from '@/components/ui/button';

// Varianter
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Destructive</Button>

// Størrelser
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// States
<Button disabled>Disabled</Button>
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

### Input med Label

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="john@example.com"
  />
</div>
```

### Select

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select onValueChange={handleChange} value={value}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

## Funksjonelle komponenter

### LogoutButton

**Fil:** `src/components/functional/logout-button.tsx`

```tsx
'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import cookie from 'js-cookie';
import toast from 'react-hot-toast';

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  showIcon?: boolean;
}

function LogoutButton({
  variant = 'ghost',
  showIcon = true
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    cookie.remove('token');
    cookie.remove('role');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <Button variant={variant} onClick={handleLogout}>
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      Logout
    </Button>
  );
}

export default LogoutButton;
```

### UserAvatar

**Fil:** `src/components/functional/user-avatar.tsx`

```tsx
import React from 'react';
import { IUser } from '@/interfaces';

interface UserAvatarProps {
  user: IUser;
  size?: 'sm' | 'md' | 'lg';
}

function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  // Hvis profilbilde finnes
  if (user.profile_pic) {
    return (
      <img
        src={user.profile_pic}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  // Fallback: Initialer
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-primary text-white flex items-center justify-center font-semibold`}>
      {initials}
    </div>
  );
}

export default UserAvatar;
```

### JobCard

**Fil:** `src/components/functional/job-card.tsx`

```tsx
import React from 'react';
import { IJob } from '@/interfaces';
import { Button } from '@/components/ui/button';
import { MapPin, Building, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface JobCardProps {
  job: IJob;
  showApplyButton?: boolean;
}

function JobCard({ job, showApplyButton = true }: JobCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{job.title}</h3>
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <Building className="h-4 w-4" />
            <span>{job.company}</span>
          </div>
        </div>
        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
          {job.job_type}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
        {job.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
        )}
        {job.salary_min && job.salary_max && (
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} {job.salary_currency}
          </div>
        )}
      </div>

      <p className="mt-3 text-gray-600 line-clamp-2">
        {job.description}
      </p>

      {showApplyButton && (
        <div className="mt-4 flex gap-2">
          <Link href={`/job-seeker/jobs/${job.id}`}>
            <Button variant="outline" size="sm">View Details</Button>
          </Link>
          <Button size="sm">Apply Now</Button>
        </div>
      )}
    </div>
  );
}

export default JobCard;
```

### SearchBar

**Fil:** `src/components/functional/search-bar.tsx`

```tsx
'use client'

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

function SearchBar({
  onSearch,
  placeholder = 'Search...'
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <Button type="submit">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  );
}

export default SearchBar;
```

---

## Komponentmønstre

### Composition Pattern

```tsx
// Card med fleksibel innhold
function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-lg shadow p-4">{children}</div>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b pb-2 mb-2">{children}</div>;
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// Bruk
<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    <p>Content here</p>
  </CardContent>
</Card>
```

### Render Props Pattern

```tsx
interface DataLoaderProps<T> {
  fetchData: () => Promise<T>;
  render: (data: T) => React.ReactNode;
}

function DataLoader<T>({ fetchData, render }: DataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return <>{render(data)}</>;
}

// Bruk
<DataLoader
  fetchData={fetchUsers}
  render={(users) => (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  )}
/>
```

---

## Props og TypeScript

### Definere Props-interface

```tsx
interface ButtonProps {
  // Required props
  children: React.ReactNode;

  // Optional props med default
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;

  // Event handlers
  onClick?: () => void;

  // Spread HTML attributes
  className?: string;
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className,
}: ButtonProps) {
  // ...
}
```

### Extending Native Props

```tsx
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <button {...props} />;
}

// Nå støtter Button alle native button-attributter
<Button type="submit" disabled onClick={handleClick}>
  Submit
</Button>
```

### Generic Components

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Bruk med type inference
<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
/>
```

---

## Client vs Server Components

### Server Components (default)

```tsx
// Ingen 'use client' = Server Component
import supabase from '@/config/supabase-config';

async function UserList() {
  // Kan bruke async/await direkte
  const { data: users } = await supabase
    .from('user_profiles')
    .select('*');

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Client Components

```tsx
'use client'

import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### Når bruke hva?

| Server Component | Client Component |
|------------------|------------------|
| Data fetching | Interaktivitet (onClick, onChange) |
| Tilgang til backend | useState, useEffect |
| Sensitiv logikk | Browser APIs |
| Stor bundle size | Event listeners |

### Blande Server og Client

```tsx
// ServerComponent.tsx (Server)
import ClientButton from './ClientButton';

async function ServerComponent() {
  const data = await fetchData();

  return (
    <div>
      <h1>{data.title}</h1>
      <ClientButton />  {/* Client component i Server component */}
    </div>
  );
}

// ClientButton.tsx (Client)
'use client'
export default function ClientButton() {
  return <button onClick={() => alert('Clicked!')}>Click</button>;
}
```

---

## Export patterns

### Named exports

```tsx
// components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Label } from './label';

// Import
import { Button, Input, Label } from '@/components/ui';
```

### Default exports

```tsx
// components/functional/job-card.tsx
export default function JobCard() { ... }

// Import
import JobCard from '@/components/functional/job-card';
```

### Barrel exports

```tsx
// components/functional/index.ts
export { default as JobCard } from './job-card';
export { default as LogoutButton } from './logout-button';
export { default as UserAvatar } from './user-avatar';

// Import
import { JobCard, LogoutButton, UserAvatar } from '@/components/functional';
```

---

## Sjekkliste

### Mappestruktur
- [ ] `src/components/ui/` for Shadcn-komponenter
- [ ] `src/components/functional/` for app-komponenter

### Shadcn-komponenter
- [ ] Button installert
- [ ] Input installert
- [ ] Label installert
- [ ] Select installert
- [ ] Form installert

### Funksjonelle komponenter
- [ ] LogoutButton opprettet
- [ ] Andre nødvendige komponenter

### TypeScript
- [ ] Props-interfaces definert
- [ ] Typer for alle props
- [ ] Generic types der relevant

### Client/Server
- [ ] `'use client'` kun der nødvendig
- [ ] Server components for data fetching
- [ ] Client components for interaktivitet

---

## Neste steg

Gå videre til [11-DEPLOYMENT.md](./11-DEPLOYMENT.md) for å deploye applikasjonen.

---

*Forrige: [09-PAGES-ROUTING.md](./09-PAGES-ROUTING.md) | Neste: [11-DEPLOYMENT.md](./11-DEPLOYMENT.md)*
