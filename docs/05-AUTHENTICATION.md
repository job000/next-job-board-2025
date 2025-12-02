# 05 - Autentisering

Denne guiden viser hvordan du implementerer brukerregistrering og innlogging med bcrypt og JWT.

---

## Innhold

1. [Oversikt](#oversikt)
2. [Installer avhengigheter](#installer-avhengigheter)
3. [Server Actions](#server-actions)
4. [Registrering](#registrering)
5. [Innlogging](#innlogging)
6. [Hent innlogget bruker](#hent-innlogget-bruker)
7. [Cookie-håndtering](#cookie-håndtering)
8. [Sikkerhet](#sikkerhet)
9. [Sjekkliste](#sjekkliste)

---

## Oversikt

### Autentiseringsflyt

```
┌─────────────────────────────────────────────────────────────────┐
│                     REGISTRERING                                 │
│                                                                  │
│  1. Bruker fyller ut skjema                                     │
│  2. Frontend validerer med Zod                                  │
│  3. Server Action mottar data                                   │
│  4. Sjekker om e-post finnes                                    │
│  5. Hasher passord med bcrypt                                   │
│  6. Lagrer i Supabase                                           │
│  7. Returnerer suksess/feil                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       INNLOGGING                                 │
│                                                                  │
│  1. Bruker fyller ut skjema                                     │
│  2. Frontend validerer med Zod                                  │
│  3. Server Action mottar data                                   │
│  4. Henter bruker fra database                                  │
│  5. Sammenligner passord med bcrypt                             │
│  6. Verifiserer rolle                                           │
│  7. Genererer JWT-token                                         │
│  8. Frontend lagrer token i cookie                              │
│  9. Redirect til dashboard                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Teknologier

| Teknologi | Formål |
|-----------|--------|
| bcryptjs | Passord-hashing |
| jsonwebtoken | JWT-tokens |
| js-cookie | Cookie-håndtering (frontend) |
| next/headers | Cookie-håndtering (backend) |

---

## Installer avhengigheter

```bash
npm install bcryptjs jsonwebtoken js-cookie
npm install -D @types/bcryptjs @types/jsonwebtoken @types/js-cookie
```

---

## Server Actions

### Fil: `src/actions/users.ts`

```typescript
'use server';

import supabaseConfig from '@/config/supabase-config';
import { IUser } from '@/interfaces';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
```

### Viktig: 'use server' direktiv

- Må være øverst i filen
- Markerer funksjoner som Server Actions
- Kjører kun på serveren (trygt for sensitiv logikk)

---

## Registrering

### registerUser funksjon

```typescript
export const registerUser = async (payload: Partial<IUser>) => {
    try {
        // Steg 1: Sjekk om bruker allerede eksisterer
        const userExists = await supabaseConfig
            .from('user_profiles')
            .select('*')
            .eq('email', payload.email);

        if (userExists.error) {
            throw new Error(userExists.error.message);
        }

        if (userExists.data && userExists.data.length > 0) {
            throw new Error('User already exists with this email.');
        }

        // Steg 2: Hash passordet
        const hashedPassword = await bcrypt.hash(payload.password || '', 10);

        // Steg 3: Sett inn ny bruker i database
        const { data: newUser, error: newUserError } = await supabaseConfig
            .from('user_profiles')
            .insert({
                ...payload,
                password: hashedPassword
            });

        if (newUserError) {
            throw new Error(newUserError.message);
        }

        return {
            success: true,
            message: 'User registered successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: (error as Error).message,
        };
    }
}
```

### Steg-for-steg forklaring

#### 1. Sjekk eksisterende bruker

```typescript
const userExists = await supabaseConfig
    .from('user_profiles')
    .select('*')
    .eq('email', payload.email);
```

- Søker i `user_profiles` tabellen
- Sjekker om e-post allerede finnes

#### 2. Hash passord

```typescript
const hashedPassword = await bcrypt.hash(payload.password || '', 10);
```

- `10` er "salt rounds" (anbefalt: 10-12)
- Høyere tall = sikrere, men tregere
- Aldri lagre passord i klartekst!

#### 3. Lagre i database

```typescript
const { data: newUser, error: newUserError } = await supabaseConfig
    .from('user_profiles')
    .insert({
        ...payload,
        password: hashedPassword  // Overskriver klartekst-passord
    });
```

---

## Innlogging

### loginUser funksjon

```typescript
export const loginUser = async (payload: Partial<IUser>) => {
    try {
        // Steg 1: Hent bruker fra database
        const userResponse = await supabaseConfig
            .from('user_profiles')
            .select('*')
            .eq('email', payload.email?.toLowerCase());

        if (userResponse.error || userResponse.data.length === 0) {
            throw new Error('User not found with this email.');
        }

        // Steg 2: Sammenlign passord
        const user = userResponse.data[0] as IUser;
        const isPasswordValid = await bcrypt.compare(
            payload.password || '',
            user.password
        );

        if (!isPasswordValid) {
            throw new Error('Invalid password.');
        }

        // Steg 3: Verifiser rolle
        if (user.role !== payload.role) {
            throw new Error('Unauthorized role access.');
        }

        // Steg 4: Generer JWT-token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );

        return {
            success: true,
            message: 'Login successful',
            data: token
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }
};
```

### Steg-for-steg forklaring

#### 1. Hent bruker

```typescript
const userResponse = await supabaseConfig
    .from('user_profiles')
    .select('*')
    .eq('email', payload.email?.toLowerCase());
```

- Konverterer e-post til lowercase for konsistens

#### 2. Sammenlign passord

```typescript
const isPasswordValid = await bcrypt.compare(
    payload.password || '',  // Klartekst fra bruker
    user.password            // Hashet fra database
);
```

- `bcrypt.compare` håndterer salt automatisk
- Returnerer `true` eller `false`

#### 3. Verifiser rolle

```typescript
if (user.role !== payload.role) {
    throw new Error('Unauthorized role access.');
}
```

- Sikrer at bruker logger inn med riktig rolle
- Rekrutterer kan ikke logge inn som jobbsøker

#### 4. Generer JWT

```typescript
const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },  // Payload
    process.env.JWT_SECRET || 'default_secret',           // Hemmelighet
    { expiresIn: '24h' }                                  // Utløpstid
);
```

---

## Hent innlogget bruker

### getLoggedInUser funksjon

```typescript
export const getLoggedInUser = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            throw new Error('No authentication token found.');
        }

        // Verifiser JWT-token
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        if (!decoded || !decoded.id) {
            throw new Error('Invalid token.');
        }

        // Hent brukerdetaljer fra database
        const userResponse = await supabaseConfig
            .from('user_profiles')
            .select('*')
            .eq('email', decoded.email);

        if (userResponse.error || !userResponse.data) {
            throw new Error('User not found.');
        }

        const user = userResponse.data[0];
        // Fjern passord før retur
        delete user.password;

        return {
            success: true,
            message: 'User fetched successfully',
            data: user
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        };
    }
};
```

### Viktige punkter

1. **Hent token fra cookie** (server-side med `cookies()`)
2. **Verifiser token** med `jwt.verify`
3. **Fjern passord** før retur til frontend

---

## Cookie-håndtering

### Frontend (js-cookie)

```typescript
import cookie from 'js-cookie';

// Lagre token etter innlogging
if (response.success) {
    cookie.set('token', response.data);
    cookie.set('role', values.role || '');
}

// Fjern token ved utlogging
cookie.remove('token');
cookie.remove('role');

// Hent token
const token = cookie.get('token');
```

### Backend (next/headers)

```typescript
import { cookies } from 'next/headers';

// Hent cookie
const cookieStore = await cookies();
const token = cookieStore.get('token')?.value;

// Sett cookie (i Server Action eller Route Handler)
cookieStore.set('token', tokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 timer
});
```

---

## Sikkerhet

### Best Practices

1. **Aldri lagre passord i klartekst**
   ```typescript
   // FEIL
   insert({ password: payload.password })

   // RIKTIG
   insert({ password: await bcrypt.hash(payload.password, 10) })
   ```

2. **Bruk miljøvariabler for hemmeligheter**
   ```typescript
   // FEIL
   jwt.sign(payload, 'min_hemmelighet')

   // RIKTIG
   jwt.sign(payload, process.env.JWT_SECRET!)
   ```

3. **Sett utløpstid på tokens**
   ```typescript
   jwt.sign(payload, secret, { expiresIn: '24h' })
   ```

4. **Fjern passord før retur**
   ```typescript
   delete user.password;
   return { data: user };
   ```

5. **Valider input**
   - Bruk Zod på frontend
   - Valider også på backend

### Miljøvariabler

```env
# .env
JWT_SECRET=din_hemmelige_nokkel_minst_32_tegn_lang
```

Generer sikker nøkkel:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Komplett users.ts

```typescript
'use server';

import supabaseConfig from '@/config/supabase-config';
import { IUser } from '@/interfaces';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const registerUser = async (payload: Partial<IUser>) => {
    try {
        const userExists = await supabaseConfig
            .from('user_profiles')
            .select('*')
            .eq('email', payload.email);

        if (userExists.error) {
            throw new Error(userExists.error.message);
        }

        if (userExists.data && userExists.data.length > 0) {
            throw new Error('User already exists with this email.');
        }

        const hashedPassword = await bcrypt.hash(payload.password || '', 10);

        const { data: newUser, error: newUserError } = await supabaseConfig
            .from('user_profiles')
            .insert({
                ...payload,
                password: hashedPassword
            });

        if (newUserError) {
            throw new Error(newUserError.message);
        }

        return {
            success: true,
            message: 'User registered successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: (error as Error).message,
        };
    }
}

export const loginUser = async (payload: Partial<IUser>) => {
    try {
        const userResponse = await supabaseConfig
            .from('user_profiles')
            .select('*')
            .eq('email', payload.email?.toLowerCase());

        if (userResponse.error || userResponse.data.length === 0) {
            throw new Error('User not found with this email.');
        }

        const user = userResponse.data[0] as IUser;
        const isPasswordValid = await bcrypt.compare(
            payload.password || '',
            user.password
        );

        if (!isPasswordValid) {
            throw new Error('Invalid password.');
        }

        if (user.role !== payload.role) {
            throw new Error('Unauthorized role access.');
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );

        return { success: true, message: 'Login successful', data: token };
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }
};

export const getLoggedInUser = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            throw new Error('No authentication token found.');
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        if (!decoded || !decoded.id) {
            throw new Error('Invalid token.');
        }

        const userResponse = await supabaseConfig
            .from('user_profiles')
            .select('*')
            .eq('email', decoded.email);

        if (userResponse.error || !userResponse.data) {
            throw new Error('User not found.');
        }

        const user = userResponse.data[0];
        delete user.password;

        return { success: true, message: 'User fetched successfully', data: user };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};
```

---

## Sjekkliste

### Avhengigheter
- [ ] `bcryptjs` installert
- [ ] `jsonwebtoken` installert
- [ ] `js-cookie` installert
- [ ] TypeScript-typer installert

### Server Actions
- [ ] `src/actions/users.ts` opprettet
- [ ] `'use server'` direktiv på toppen
- [ ] `registerUser` funksjon implementert
- [ ] `loginUser` funksjon implementert
- [ ] `getLoggedInUser` funksjon implementert

### Sikkerhet
- [ ] Passord hashes med bcrypt
- [ ] JWT_SECRET i miljøvariabler
- [ ] Token utløpstid satt
- [ ] Passord fjernet før retur

### Testing
- [ ] Registrering fungerer
- [ ] Innlogging fungerer
- [ ] Token lagres i cookie
- [ ] getLoggedInUser returnerer brukerdata

---

## Neste steg

Gå videre til [06-FORM-VALIDATION.md](./06-FORM-VALIDATION.md) for å implementere skjemaer med React Hook Form og Zod.

---

*Forrige: [04-TYPESCRIPT-INTERFACES.md](./04-TYPESCRIPT-INTERFACES.md) | Neste: [06-FORM-VALIDATION.md](./06-FORM-VALIDATION.md)*
