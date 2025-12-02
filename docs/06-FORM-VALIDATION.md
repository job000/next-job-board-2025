# 06 - Skjemavalidering

Implementere skjemaer med React Hook Form og Zod-validering.

---

## Innhold

1. [Oversikt](#oversikt)
2. [Installer avhengigheter](#installer-avhengigheter)
3. [Zod-skjemaer](#zod-skjemaer)
4. [React Hook Form oppsett](#react-hook-form-oppsett)
5. [Registreringsskjema](#registreringsskjema)
6. [Innloggingsskjema](#innloggingsskjema)
7. [Feilhåndtering](#feilhåndtering)
8. [Toast-notifikasjoner](#toast-notifikasjoner)
9. [Sjekkliste](#sjekkliste)

---

## Oversikt

### Hvorfor React Hook Form + Zod?

| Teknologi | Hva det gjør | Fordel |
|-----------|--------------|--------|
| **React Hook Form** | Håndterer skjema-state | Minimal re-rendering, bedre ytelse |
| **Zod** | Definerer valideringsregler | TypeScript-typer genereres automatisk |
| **@hookform/resolvers** | Kobler dem sammen | Sømløs integrasjon |

**Hvorfor ikke bare vanlig HTML-validering?**
- Konsistent validering på client og server
- Egendefinerte feilmeldinger
- Kompleks validering (f.eks. "passord må matche")
- TypeScript-typer fra schema

### Valideringsflyt

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Bruker skriver i felt                                       │
│  2. Zod-schema validerer input                                  │
│  3. React Hook Form viser feilmeldinger                         │
│  4. Ved submit → Validering kjører                              │
│  5. Hvis gyldig → Server Action kalles                          │
│  6. Toast viser resultat                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Installer avhengigheter

```bash
npm install react-hook-form zod @hookform/resolvers react-hot-toast
```

| Pakke | Versjon | Formål |
|-------|---------|--------|
| `react-hook-form` | 7.x | Skjemahåndtering |
| `zod` | 4.x | Validering |
| `@hookform/resolvers` | 5.x | Kobling RHF + Zod |
| `react-hot-toast` | 2.x | Notifikasjoner |

---

## Zod-skjemaer

### Registreringsskjema

```typescript
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters." }),

  email: z.email({ message: "Invalid email address." }),

  password: z.string()
    .min(6, { message: "Password must be at least 6 characters." }),

  role: z.enum(['recruiter', 'job-seeker'])
    .optional(),
});

// Inferer TypeScript-type fra schema
type RegisterFormData = z.infer<typeof registerSchema>;
```

### Innloggingsskjema

```typescript
const loginSchema = z.object({
  email: z.email({ message: "Invalid email address." }),

  password: z.string()
    .min(6, { message: "Password must be at least 6 characters." }),

  role: z.enum(['recruiter', 'job-seeker'])
    .optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
```

### Vanlige Zod-valideringer

```typescript
// String-valideringer
z.string()
z.string().min(2)
z.string().max(100)
z.string().length(10)
z.string().email()
z.string().url()
z.string().regex(/^[a-z]+$/)

// Nummer-valideringer
z.number()
z.number().min(0)
z.number().max(100)
z.number().positive()
z.number().int()

// Enum
z.enum(['option1', 'option2'])

// Valgfri
z.string().optional()
z.string().nullable()

// Egendefinert melding
z.string().min(2, { message: "Minimum 2 tegn" })
```

---

## React Hook Form oppsett

### Grunnleggende struktur

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Definer schema
const formSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

// 2. Inferer type
type FormData = z.infer<typeof formSchema>;

function MyForm() {
  // 3. Initialiser form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 4. Submit-handler
  async function onSubmit(values: FormData) {
    console.log(values);
  }

  // 5. Render skjema
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Felt her */}
    </form>
  );
}
```

---

## Registreringsskjema

### Komplett implementasjon

**Fil:** `src/app/(public)/register/page.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { userRoles } from '@/constants';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoveLeft } from 'lucide-react';
import { registerUser } from '@/actions/users';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Zod-schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(['recruiter', 'job-seeker']).optional(),
})

function RegisterPage() {
  // State for loading
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  // Initialiser form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "job-seeker",
    },
  })

  // Submit-handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const response = await registerUser(values);

    if (response.success) {
      toast.success(response.message);
      form.reset();
      router.push('/login');
    } else {
      toast.error(response.message);
    }
    setLoading(false);
  }

  return (
    <div className='bg-gray-200 flex items-center justify-center min-h-screen'>
      <div className='bg-white flex flex-col shadow rounded p-5 w-[450px]'>

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h1 className='text-primary font-bold text-lg'>Register account</h1>
          <Button variant={'ghost'} className='flex items-center gap-1'>
            <MoveLeft className='text-gray-500'/>
            <Link href={'/'}>Home</Link>
          </Button>
        </div>

        <hr className='border border-gray-300 my-4' />

        {/* Skjema */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* Navn */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* E-post */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Passord */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rolle */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit-knapp */}
            <Button type="submit" className='w-full' disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>

            {/* Link til login */}
            <div className='flex justify-center gap-1'>
              <p className='text-sm'>Already have an account?</p>
              <Link href={'/login'} className='text-sm underline'>Login</Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default RegisterPage
```

---

## Innloggingsskjema

### Komplett implementasjon

**Fil:** `src/app/(public)/login/page.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { userRoles } from '@/constants';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoveLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { loginUser } from '@/actions/users';
import cookie from 'js-cookie';

// Zod-schema
const formSchema = z.object({
  email: z.email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(['recruiter', 'job-seeker']).optional(),
})

function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "job-seeker",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const response: any = await loginUser(values);

      if (response.success) {
        toast.success(response.message);
        form.reset();

        // Lagre token og rolle i cookies
        const token = response.data;
        if (token) {
          cookie.set('token', token);
          cookie.set('role', values.role || '');
        }

        // Redirect til dashboard
        router.push(`/${values.role}/dashboard`);
        setLoading(false);
      } else {
        toast.error(response.message || 'Login failed.');
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }

  return (
    <div className='bg-gray-200 flex items-center justify-center min-h-screen'>
      <div className='bg-white flex flex-col shadow rounded p-5 w-[450px]'>

        <div className="flex justify-between items-center mb-5">
          <h1 className='text-primary font-bold text-lg'>Login to your account</h1>
          <Button variant={'ghost'} className='flex items-center gap-1'>
            <MoveLeft className='text-gray-500'/>
            <Link href={'/'}>Home</Link>
          </Button>
        </div>

        <hr className='border border-gray-300 my-4' />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className='w-full'>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className='flex justify-center gap-1'>
              <p className='text-sm text-gray-600'>Don't have an account?</p>
              <Link href={'/register'} className='text-sm text-primary font-medium'>
                Register
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
```

---

## Feilhåndtering

### Viktige patterns

#### 1. useState for loading

```typescript
// VIKTIG: useState MÅ være på komponent-nivå, IKKE inne i funksjoner
const [loading, setLoading] = React.useState(false);

async function onSubmit(values: FormData) {
  setLoading(true);
  try {
    // ... logikk
  } finally {
    setLoading(false);  // Alltid sett loading til false
  }
}
```

#### 2. Håndter både success og error

```typescript
if (response.success) {
  toast.success(response.message);
  // ... suksess-logikk
} else {
  toast.error(response.message || 'Something went wrong');
}
setLoading(false);  // I begge tilfeller!
```

#### 3. Try-catch for uventede feil

```typescript
async function onSubmit(values: FormData) {
  try {
    setLoading(true);
    const response = await loginUser(values);
    // ... håndtering
  } catch (error) {
    toast.error('An unexpected error occurred');
  } finally {
    setLoading(false);
  }
}
```

---

## Toast-notifikasjoner

### Oppsett

**Fil:** `src/app/layout.tsx`

```typescript
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
```

### Bruk

```typescript
import toast from 'react-hot-toast';

// Suksess
toast.success('Operation successful!');

// Feil
toast.error('Something went wrong');

// Loading
const loadingToast = toast.loading('Processing...');
// Når ferdig:
toast.dismiss(loadingToast);

// Egendefinert
toast('Hello!', {
  icon: '👋',
  duration: 4000,
});
```

### VIKTIG: Riktig import

```typescript
// RIKTIG
import toast from 'react-hot-toast';

// FEIL - vil gi problemer
import toast from 'react-hot-toast/headless';
```

---

## Vanlige feil og løsninger

### 1. useState inside function

```typescript
// FEIL - useState inne i onSubmit
async function onSubmit(values) {
  const [loading, setLoading] = useState(false);  // FEIL!
}

// RIKTIG - useState på komponent-nivå
function MyComponent() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(values) {
    setLoading(true);
  }
}
```

### 2. useRouter fra feil pakke

```typescript
// FEIL - Pages Router
import { useRouter } from 'next/router';

// RIKTIG - App Router
import { useRouter } from 'next/navigation';
```

### 3. Loading state ikke tilbakestilt

```typescript
// FEIL - loading forblir true ved feil
if (response.success) {
  setLoading(false);
}
// Hva skjer ved error? Loading er fortsatt true!

// RIKTIG
if (response.success) {
  // ...
  setLoading(false);
} else {
  toast.error(response.message);
  setLoading(false);  // Husk dette!
}
```

---

## Tips og triks

### Zod tips
```typescript
// Gjenbruk typer fra schema
type FormData = z.infer<typeof formSchema>;

// Egendefinert validering
z.string().refine((val) => val.includes('@'), {
  message: "Må inneholde @",
});

// Passord-bekreftelse
z.object({
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passordene må matche",
  path: ["confirmPassword"],
});
```

### React Hook Form tips
- **`form.reset()`** - Nullstiller skjemaet
- **`form.setValue("field", value)`** - Sett verdi programmatisk
- **`form.watch("field")`** - Lytt til endringer i et felt
- **`form.formState.errors`** - Alle feil i skjemaet

### Debugging
- **Console.log values** i `onSubmit` for å se hva som sendes
- **Se feil:** `console.log(form.formState.errors)`
- **Sjekk at `<Toaster />`** er i layout.tsx hvis toast ikke vises

---

## Sjekkliste

### Avhengigheter
- [ ] `react-hook-form` installert
- [ ] `zod` installert
- [ ] `@hookform/resolvers` installert
- [ ] `react-hot-toast` installert

### Zod-skjemaer
- [ ] Registreringsskjema definert
- [ ] Innloggingsskjema definert
- [ ] Feilmeldinger er norske/engelske

### React Hook Form
- [ ] `useForm` med `zodResolver`
- [ ] `defaultValues` satt
- [ ] `handleSubmit` brukes

### Komponenter
- [ ] Shadcn Form-komponenter brukes
- [ ] FormField for hvert felt
- [ ] FormMessage viser feil

### Feilhåndtering
- [ ] Loading state implementert
- [ ] Toast for success/error
- [ ] Loading tilbakestilles i alle tilfeller

### Layout
- [ ] `<Toaster />` i layout.tsx

---

## Neste steg

Gå videre til [07-PROXY-MIDDLEWARE.md](./07-PROXY-MIDDLEWARE.md) for å implementere rutebeskyttelse.

---

*Forrige: [05-AUTHENTICATION.md](./05-AUTHENTICATION.md) | Neste: [07-PROXY-MIDDLEWARE.md](./07-PROXY-MIDDLEWARE.md)*
