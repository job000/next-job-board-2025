# A0 - JavaScript og TypeScript Grunnleggende

Denne guiden forklarer grunnleggende JavaScript/TypeScript-konsepter som brukes gjennom hele prosjektet.

---

## Innhold

1. [Funksjoner](#funksjoner)
2. [Arrow Functions](#arrow-functions)
3. [Export og Import](#export-og-import)
4. [TypeScript-typer](#typescript-typer)
5. [Async/Await](#asyncawait)
6. [Destructuring](#destructuring)
7. [Spread Operator](#spread-operator)
8. [Props - Sende data til komponenter](#props---sende-data-til-komponenter)
9. [React-komponenter (rafc/rafce)](#react-komponenter-rafcrafce)

---

## Funksjoner

### Vanlig funksjon

```javascript
// Tradisjonell funksjon
function sayHello(name) {
  return "Hello " + name;
}

sayHello("Ola");  // "Hello Ola"
```

### Når bruke vanlig funksjon?
- Når du trenger `this` (sjelden i React)
- For funksjoner som "hoistes" (kan kalles før de defineres)

---

## Arrow Functions

### Grunnleggende syntaks

```javascript
// Arrow function (pilfunksjon)
const sayHello = (name) => {
  return "Hello " + name;
};

// Kortversjon (implicit return) - kun én linje
const sayHello = (name) => "Hello " + name;

// Uten parameter
const getDate = () => new Date();

// Med én parameter (parenteser valgfritt)
const double = x => x * 2;

// Med flere parametere
const add = (a, b) => a + b;
```

### Sammenligning

| Syntaks | Når bruke |
|---------|-----------|
| `() => { ... }` | Flere linjer kode, trenger `return` |
| `() => verdi` | Én linje, returnerer automatisk |
| `x => x * 2` | Én parameter, én linje |
| `(a, b) => a + b` | Flere parametere |

### Eksempler fra prosjektet

```typescript
// Server Action med flere linjer
export const createJob = async (payload: Partial<IJob>) => {
  try {
    // ... logikk
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

// Enkel arrow function
const double = (x) => x * 2;

// Array-metoder med arrow functions
const names = users.map(user => user.name);
const adults = users.filter(user => user.age >= 18);
```

---

## Export og Import

### Named Export vs Default Export

```typescript
// ===== NAMED EXPORT =====
// fil: math.ts
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// Import (MÅ bruke samme navn, MÅ ha {})
import { add, subtract } from './math';

// ===== DEFAULT EXPORT =====
// fil: Calculator.tsx
function Calculator() {
  return <div>Kalkulator</div>;
}
export default Calculator;

// Import (kan velge hvilket som helst navn)
import Calculator from './Calculator';
import Kalk from './Calculator';  // Samme komponent, annet navn
```

### Sammenligning

| Type | Syntaks Export | Syntaks Import | Når bruke |
|------|----------------|----------------|-----------|
| **Named** | `export const foo` | `import { foo }` | Flere ting fra samme fil |
| **Default** | `export default Foo` | `import Foo` | Hovedkomponent/funksjon i fil |

### Vanlige mønstre i prosjektet

```typescript
// Server Actions - named exports (flere funksjoner)
// src/actions/jobs.ts
export const createJob = async () => { ... };
export const getJobById = async () => { ... };
export const deleteJob = async () => { ... };

// Import
import { createJob, getJobById } from '@/actions/jobs';

// Komponenter - default export (én komponent per fil)
// src/components/ui/button.tsx
export default function Button() { ... }

// Import
import Button from '@/components/ui/button';

// Re-export fra index.ts
// src/interfaces/index.ts
export interface IUser { ... }
export interface IJob { ... }

// Import alt på én gang
import { IUser, IJob } from '@/interfaces';
```

---

## TypeScript-typer

### Grunnleggende typer

```typescript
// Primitive typer
const name: string = "Ola";
const age: number = 25;
const isActive: boolean = true;
const data: null = null;
const nothing: undefined = undefined;

// Arrays
const names: string[] = ["Ola", "Kari"];
const numbers: number[] = [1, 2, 3];

// Object med interface
interface IUser {
  name: string;
  age: number;
  email?: string;  // ? = valgfritt felt
}

const user: IUser = {
  name: "Ola",
  age: 25
  // email er valgfritt, trenger ikke være med
};
```

### Partial<T> - Gjør alle felt valgfrie

```typescript
interface IJob {
  id: number;
  title: string;
  description: string;
  salary: number;
}

// Partial gjør ALLE felt valgfrie
// Nyttig når du oppdaterer - trenger ikke sende alt
type PartialJob = Partial<IJob>;
// Samme som:
// {
//   id?: number;
//   title?: string;
//   description?: string;
//   salary?: number;
// }

// Bruk i funksjon
export const updateJob = async (payload: Partial<IJob>) => {
  // payload kan inneholde bare title, eller bare salary, osv.
};

// Kall funksjonen - trenger ikke alle felt
updateJob({ title: "Ny tittel" });  // OK!
updateJob({ salary: 50000 });       // OK!
```

### Vanlige TypeScript-mønstre

```typescript
// Type for funksjonparameter
function greet(name: string): string {
  return `Hello ${name}`;
}

// Type for async funksjon
async function fetchUser(id: number): Promise<IUser> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Type for React-komponent props
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// any - unngå hvis mulig, men nyttig for ukjent data
const response: any = await someExternalAPI();
```

---

## Async/Await

### Hva er det?

`async/await` gjør asynkron kode (som tar tid) lettere å lese.

```typescript
// UTEN async/await (Promise chains)
function getUser(id) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
    .then(user => {
      console.log(user);
      return user;
    })
    .catch(error => {
      console.error(error);
    });
}

// MED async/await (mye lettere å lese!)
async function getUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    console.log(user);
    return user;
  } catch (error) {
    console.error(error);
  }
}
```

### Regler for async/await

1. Funksjonen MÅ ha `async` foran
2. `await` kan KUN brukes inne i `async` funksjoner
3. `await` "pauser" koden til Promise er ferdig

### Eksempler fra prosjektet

```typescript
// Server Action
export const createJob = async (payload: Partial<IJob>) => {
  try {
    // await pauser til insert er ferdig
    const insertJob = await supabaseConfig
      .from("jobs")
      .insert([payload]);

    if (insertJob.error) {
      throw new Error(insertJob.error.message);
    }

    return { success: true, message: "Job created" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// I en React-komponent
async function onSubmit(values) {
  setLoading(true);
  const response = await createJob(values);  // Venter på svar
  if (response.success) {
    toast.success(response.message);
  }
  setLoading(false);
}
```

---

## Destructuring

### Object Destructuring

```typescript
// UTEN destructuring
const user = { name: "Ola", age: 25, email: "ola@test.no" };
const name = user.name;
const age = user.age;

// MED destructuring
const { name, age, email } = user;

// Med nytt variabelnavn
const { name: userName, age: userAge } = user;

// Med default verdi
const { name, role = "user" } = user;  // role = "user" hvis undefined
```

### Array Destructuring

```typescript
// Array destructuring
const colors = ["red", "green", "blue"];
const [first, second, third] = colors;
// first = "red", second = "green", third = "blue"

// Hopp over elementer
const [first, , third] = colors;
// first = "red", third = "blue"

// React useState bruker dette!
const [count, setCount] = useState(0);
```

### Bruk i funksjonsparametere

```typescript
// UTEN destructuring
function UserCard(props) {
  return <div>{props.user.name}</div>;
}

// MED destructuring i parameterlisten
function UserCard({ user }) {
  return <div>{user.name}</div>;
}

// Enda dypere destructuring
function UserCard({ user: { name, email } }) {
  return <div>{name} - {email}</div>;
}

// Med TypeScript
interface Props {
  user: IUser;
  onEdit: () => void;
}

function UserCard({ user, onEdit }: Props) {
  return (
    <div onClick={onEdit}>
      {user.name}
    </div>
  );
}
```

---

## Spread Operator

### Hva gjør `...`?

Spread operator (`...`) "pakker ut" innholdet av arrays eller objekter.

```typescript
// ===== ARRAYS =====
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];  // [1, 2, 3, 4, 5, 6]

// Legg til element
const withNew = [...arr1, 4];  // [1, 2, 3, 4]

// ===== OBJECTS =====
const user = { name: "Ola", age: 25 };
const updatedUser = { ...user, age: 26 };
// { name: "Ola", age: 26 } - age overskrevet

// Legg til nye felt
const userWithRole = { ...user, role: "admin" };
// { name: "Ola", age: 25, role: "admin" }
```

### Vanlig bruk i prosjektet

```typescript
// Oppdater state (React)
setUser({ ...user, name: "Nytt navn" });

// Send alle props videre
<Input {...field} />  // Samme som: value={field.value} onChange={field.onChange} etc.

// Merge objekter
const payload = {
  ...formData,
  password: hashedPassword
};
```

---

## Props - Sende data til komponenter

### Hva er Props?

**Props** (properties) er måten du sender data fra en forelder-komponent til en barn-komponent.

```tsx
// Forelder sender data
<PageTitle title="Mine jobber" />

// Barn mottar data via props
function PageTitle({ title }) {
  return <div>{title}</div>;
}
```

### Grunnleggende Props

```tsx
// ===== UTEN TypeScript =====
function Greeting({ name }) {
  return <h1>Hei, {name}!</h1>;
}

// Bruk:
<Greeting name="Ola" />
// Resultat: <h1>Hei, Ola!</h1>
```

### Props med TypeScript (anbefalt)

```tsx
// ===== MED TypeScript - Inline type =====
function PageTitle({ title }: { title: string }) {
  return (
    <div>{title}</div>
  );
}

// Bruk:
<PageTitle title="Dashboard" />
```

### Forklaring av syntaksen

```tsx
function PageTitle({ title }: { title: string }) {
//                 ↑ ↑ ↑ ↑    ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑
//                 │ │ │ │    └─────────────── TypeScript-type
//                 │ │ │ │
//                 │ │ │ └── Destructuring: henter 'title' fra props
//                 │ │ └──── Krøllparentes: pakker ut props-objektet
//                 │ └────── Parameternavn (props)
//                 └──────── Funksjonens parameter
```

**Steg for steg:**
1. Komponenten mottar et objekt: `{ title: "Dashboard" }`
2. `{ title }` destrukturerer og henter ut `title`
3. `: { title: string }` sier at `title` må være tekst

### Interface for Props (for flere props)

```tsx
// Definer interface for props
interface PageTitleProps {
  title: string;
  subtitle?: string;  // ? = valgfri
  size?: 'small' | 'medium' | 'large';
}

function PageTitle({ title, subtitle, size = 'medium' }: PageTitleProps) {
  return (
    <div>
      <h1 className={size === 'large' ? 'text-4xl' : 'text-2xl'}>
        {title}
      </h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

// Bruk:
<PageTitle title="Jobber" />
<PageTitle title="Jobber" subtitle="Alle aktive stillinger" />
<PageTitle title="Jobber" size="large" />
```

### Vanlige Props-typer

```tsx
interface ExampleProps {
  // Tekst
  title: string;

  // Tall
  count: number;

  // Boolean
  isActive: boolean;

  // Array
  items: string[];

  // Objekt
  user: { name: string; email: string };

  // Funksjon (callback)
  onClick: () => void;
  onSubmit: (data: FormData) => void;

  // React children (innhold mellom tags)
  children: React.ReactNode;

  // Valgfri prop
  subtitle?: string;
}
```

### Props med children

```tsx
// children = alt som er mellom åpning og lukking av komponenten
interface CardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div className="border rounded p-4">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

// Bruk:
<Card title="Min boks">
  <p>Dette er innholdet!</p>
  <button>Klikk meg</button>
</Card>
```

### Props med funksjoner (callbacks)

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;  // Funksjon uten parameter
}

function Button({ label, onClick }: ButtonProps) {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
}

// Bruk:
<Button
  label="Slett"
  onClick={() => console.log('Slettet!')}
/>

// Eller med en eksisterende funksjon:
const handleDelete = () => {
  console.log('Slettet!');
};

<Button label="Slett" onClick={handleDelete} />
```

### Eksempler fra prosjektet

```tsx
// 1. Enkel tekst-prop
// src/components/functional/page-title.tsx
function PageTitle({ title }: { title: string }) {
  return <div>{title}</div>;
}

<PageTitle title="Recruiter Dashboard" />

// 2. Flere props med interface
interface JobCardProps {
  job: IJob;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  return (
    <div>
      <h3>{job.title}</h3>
      <p>{job.location}</p>
      <button onClick={() => onEdit(job.id)}>Rediger</button>
      <button onClick={() => onDelete(job.id)}>Slett</button>
    </div>
  );
}

// 3. Layout med children
interface LayoutProps {
  children: React.ReactNode;
}

function PrivateLayout({ children }: LayoutProps) {
  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}
```

### Spread props videre

```tsx
// Send alle props til et annet element
interface InputProps {
  label: string;
  // ...og alle standard input-attributter
}

function FormInput({ label, ...rest }: InputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label>{label}</label>
      <input {...rest} />  {/* Sender alle andre props til input */}
    </div>
  );
}

// Bruk:
<FormInput
  label="E-post"
  type="email"
  placeholder="ola@test.no"
  required
/>
```

---

## React-komponenter (rafc/rafce)

### Hva betyr rafc og rafce?

Dette er VS Code snippets (snarveier) for å lage React-komponenter raskt:

| Snippet | Står for | Lager |
|---------|----------|-------|
| `rafc` | React Arrow Function Component | Arrow function uten export på samme linje |
| `rafce` | React Arrow Function Component Export | Arrow function med export default |

### rafc - React Arrow Function Component

```tsx
// Skriv "rafc" og trykk Tab:
const MyComponent = () => {
  return (
    <div>MyComponent</div>
  )
}

export default MyComponent
```

### rafce - React Arrow Function Component Export

```tsx
// Skriv "rafce" og trykk Tab:
import React from 'react'

const MyComponent = () => {
  return (
    <div>MyComponent</div>
  )
}

export default MyComponent
```

### Vanlig function component

```tsx
// Skriv "rfc" og trykk Tab:
import React from 'react'

export default function MyComponent() {
  return (
    <div>MyComponent</div>
  )
}
```

### Hvilken bruke?

| Type | Når bruke |
|------|-----------|
| `function` | Vanligste, anbefalt av Next.js |
| `const () =>` | Personlig preferanse, fungerer likt |

**I praksis:** Velg én stil og vær konsistent. Begge fungerer likt i React.

### Eksempel fra prosjektet

```tsx
// Vanlig function (brukes i de fleste sider)
function RecruiterDashboard() {
  return (
    <div>
      This is Recruiter Dashboard
    </div>
  )
}

export default RecruiterDashboard

// Arrow function med 'use client'
'use client'

const LoginPage = () => {
  const [loading, setLoading] = React.useState(false);

  return (
    <div>Login form here</div>
  )
}

export default LoginPage
```

---

## Oppsummering

| Konsept | Eksempel | Når bruke |
|---------|----------|-----------|
| Arrow function | `const fn = () => {}` | Callbacks, korte funksjoner |
| Named export | `export const fn` | Flere eksporter fra én fil |
| Default export | `export default Fn` | Én hovedeksport per fil |
| Partial<T> | `Partial<IJob>` | Når ikke alle felt er påkrevd |
| async/await | `await fetch()` | Asynkrone operasjoner |
| Destructuring | `const { name } = user` | Hente ut verdier |
| Spread | `{ ...user, age: 26 }` | Kopiere/merge objekter |
| Props | `{ title }: { title: string }` | Sende data til komponenter |
| rafc/rafce | VS Code snippet | Lage komponenter raskt |

---

## Tips

1. **Bruk TypeScript-hints** - Hold musepekeren over variabler for å se typen
2. **Installer ES7+ React snippets** i VS Code for rafc/rafce
3. **Konsistens** - Velg én stil (function vs arrow) og hold deg til den
4. **Partial er din venn** - Bruk det for oppdateringsfunksjoner

---

*Neste: [A1-NEXTJS-ROUTING-STRUCTURE.md](./A1-NEXTJS-ROUTING-STRUCTURE.md)*
