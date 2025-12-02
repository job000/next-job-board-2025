# 07 - Proxy/Middleware (Rutebeskyttelse)

Denne guiden viser hvordan du beskytter ruter med proxy.ts i Next.js 16.

---

## Innhold

1. [Oversikt](#oversikt)
2. [proxy.ts vs middleware.ts](#proxyts-vs-middlewarets)
3. [Implementasjon](#implementasjon)
4. [Rutelogikk](#rutelogikk)
5. [Config og matcher](#config-og-matcher)
6. [Feilsøking](#feilsøking)
7. [Sjekkliste](#sjekkliste)

---

## Oversikt

### Hva er rutebeskyttelse?

Rutebeskyttelse sikrer at:
- Uinnloggede brukere ikke kan se beskyttede sider
- Innloggede brukere redirectes fra login/register til dashboard
- Brukere kun ser sider relevant for sin rolle

### Flyt

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROXY-LOGIKK                                  │
│                                                                  │
│  Request kommer inn                                             │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────┐                                           │
│  │ Er ruten privat? │                                           │
│  └──────────────────┘                                           │
│         │                                                        │
│    ┌────┴────┐                                                  │
│    │         │                                                  │
│   JA        NEI                                                 │
│    │         │                                                  │
│    ▼         ▼                                                  │
│  Token?   Token?                                                │
│    │         │                                                  │
│  Nei→Login  Ja→Dashboard                                        │
│  Ja→Fortsett Nei→Fortsett                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## proxy.ts vs middleware.ts

### Viktig endring i Next.js 16

I Next.js 16 brukes **`proxy.ts`** i stedet for `middleware.ts`:

| Next.js versjon | Fil | Funksjonsnavn |
|-----------------|-----|---------------|
| < 16 | `middleware.ts` | `middleware()` |
| 16+ | `proxy.ts` | `proxy()` |

### Plasering

```
src/
├── proxy.ts          ← Plasser her (i src/)
├── app/
├── components/
└── ...
```

**VIKTIG:** Filen må hete `proxy.ts` og ligge i `src/`-mappen (ikke i `app/`).

### Konflikt mellom begge filer

Hvis du har **både** `middleware.ts` og `proxy.ts`, får du feil:

```
Error: A]proxy.ts` and `middleware.ts` both exist.
Please remove one of them.
```

**Løsning:** Slett `middleware.ts` og behold kun `proxy.ts`.

---

## Implementasjon

### Fil: `src/proxy.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const route = request.nextUrl.pathname;

  // Definer private ruter
  const isPrivate = route.startsWith('/job-seeker') ||
                    route.startsWith('/recruiter');

  // Hent token fra cookies
  const token = request.cookies.get('token')?.value;

  // Scenario 1: Privat rute uten token → Redirect til login
  if (isPrivate && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Scenario 2: Offentlig rute med token → Redirect til dashboard
  if (!isPrivate && token) {
    try {
      const role = request.cookies.get('role')?.value;
      const path = `/${role}/dashboard`;
      return NextResponse.redirect(new URL(path, request.url));
    } catch (error: any) {
      console.error('Proxy error:', error.message);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Scenario 3: Tillat normal navigering
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

---

## Rutelogikk

### Private ruter

```typescript
const isPrivate = route.startsWith('/job-seeker') ||
                  route.startsWith('/recruiter');
```

Ruter som starter med disse prefiksene krever autentisering:
- `/job-seeker/dashboard`
- `/job-seeker/applications`
- `/recruiter/dashboard`
- `/recruiter/jobs`

### Scenario 1: Privat rute uten token

```typescript
if (isPrivate && !token) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

**Eksempel:**
- Bruker besøker `/recruiter/dashboard` uten å være logget inn
- Redirectes til `/login`

### Scenario 2: Offentlig rute med token

```typescript
if (!isPrivate && token) {
  const role = request.cookies.get('role')?.value;
  return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
}
```

**Eksempel:**
- Innlogget bruker (rolle: recruiter) besøker `/login`
- Redirectes til `/recruiter/dashboard`

### Scenario 3: Normal navigering

```typescript
return NextResponse.next();
```

**Eksempler:**
- Uinnlogget bruker besøker `/` → Tillatt
- Innlogget bruker besøker `/recruiter/jobs` → Tillatt

---

## Config og matcher

### Hva er matcher?

Matcher definerer hvilke ruter proxy-funksjonen skal kjøre på:

```typescript
export const config = {
  matcher: [
    // Ekskluder Next.js internals og statiske filer
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Kjør alltid for API-ruter
    '/(api|trpc)(.*)',
  ],
}
```

### Forklaring av regex

| Del | Betydning |
|-----|-----------|
| `(?!_next\|...)` | Negative lookahead - ekskluder disse |
| `_next` | Next.js interne filer |
| `\\.(?:html?\|css\|...)` | Statiske filer (.html, .css, etc.) |
| `/(api\|trpc)(.*)` | Inkluder API-ruter |

### Forenklet alternativ

For enklere prosjekter kan du bruke:

```typescript
export const config = {
  matcher: [
    '/job-seeker/:path*',
    '/recruiter/:path*',
    '/login',
    '/register',
    '/',
  ],
}
```

---

## Viktige NextResponse-metoder

### redirect

```typescript
// Redirect til annen side
return NextResponse.redirect(new URL('/login', request.url));
```

### next

```typescript
// Fortsett til siden normalt
return NextResponse.next();
```

### rewrite

```typescript
// Vis annen side uten å endre URL
return NextResponse.rewrite(new URL('/404', request.url));
```

### VIKTIG: Ikke returner Error

```typescript
// FEIL - vil krasje
return new Error('Unauthorized');

// RIKTIG - redirect i stedet
return NextResponse.redirect(new URL('/login', request.url));
```

---

## Rollebasert tilgang

### Utvid logikken

```typescript
export function proxy(request: NextRequest) {
  const route = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // Recruiter-sider
  if (route.startsWith('/recruiter') && role !== 'recruiter') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Job-seeker-sider
  if (route.startsWith('/job-seeker') && role !== 'job-seeker') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // ... rest av logikken
}
```

---

## Feilsøking

### Problem: Infinite redirect loop

**Symptom:** Siden laster evig eller viser "Too many redirects"

**Årsak:** Proxy redirecter til en side som også triggers proxy

**Løsning:**
```typescript
// Legg til sjekk for login/register sidene
if (!isPrivate && token) {
  // Ikke redirect hvis allerede på dashboard
  if (route.includes('/dashboard')) {
    return NextResponse.next();
  }
  // ... redirect logikk
}
```

### Problem: "proxy.ts and middleware.ts both exist"

**Løsning:** Slett `middleware.ts`:
```bash
rm src/middleware.ts
```

### Problem: Proxy kjører ikke

**Sjekk:**
1. Filen heter `proxy.ts` (ikke `Proxy.ts` eller `proxy.js`)
2. Ligger i `src/` mappen
3. Eksporterer `proxy` funksjon (ikke `middleware`)
4. Har `export const config` med matcher

### Problem: Cookies ikke tilgjengelige

**Sjekk:**
```typescript
// Bruk ?. for sikker tilgang
const token = request.cookies.get('token')?.value;

// Ikke dette:
const token = request.cookies.get('token').value; // Kan krasje!
```

---

## Testing

### Manuell testing

1. **Test uten innlogging:**
   - Besøk `/recruiter/dashboard`
   - Skal redirecte til `/login`

2. **Test med innlogging:**
   - Logg inn
   - Besøk `/login`
   - Skal redirecte til dashboard

3. **Test rolletilgang:**
   - Logg inn som job-seeker
   - Prøv å besøke `/recruiter/dashboard`
   - Skal redirecte eller vise unauthorized

### Debug-logging

```typescript
export function proxy(request: NextRequest) {
  console.log('Proxy triggered for:', request.nextUrl.pathname);
  console.log('Token:', request.cookies.get('token')?.value ? 'exists' : 'missing');
  console.log('Role:', request.cookies.get('role')?.value);

  // ... rest av koden
}
```

---

## Komplett proxy.ts

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const route = request.nextUrl.pathname;
  const isPrivate = route.startsWith('/job-seeker') ||
                    route.startsWith('/recruiter');

  const token = request.cookies.get('token')?.value;

  // Privat rute uten token → Login
  if (isPrivate && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Offentlig rute med token → Dashboard
  if (!isPrivate && token) {
    try {
      const role = request.cookies.get('role')?.value;
      const path = `/${role}/dashboard`;
      return NextResponse.redirect(new URL(path, request.url));
    } catch (error: any) {
      console.error('Proxy error:', error.message);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

---

## Sjekkliste

### Oppsett
- [ ] `src/proxy.ts` opprettet
- [ ] Eksporterer `proxy` funksjon
- [ ] Har `export const config` med matcher
- [ ] `middleware.ts` slettet (hvis den finnes)

### Logikk
- [ ] Private ruter definert
- [ ] Redirect til login for uautentiserte
- [ ] Redirect til dashboard for autentiserte
- [ ] Token og rolle leses fra cookies

### Testing
- [ ] Uautentisert tilgang til private ruter → Login
- [ ] Autentisert tilgang til offentlige ruter → Dashboard
- [ ] Normal navigering fungerer

### Feilhåndtering
- [ ] Ingen `return new Error()`
- [ ] Try-catch rundt kritisk logikk
- [ ] Fallback til login ved feil

---

## Neste steg

Gå videre til [08-CUSTOM-LAYOUTS.md](./08-CUSTOM-LAYOUTS.md) for å implementere dynamiske layouts.

---

*Forrige: [06-FORM-VALIDATION.md](./06-FORM-VALIDATION.md) | Neste: [08-CUSTOM-LAYOUTS.md](./08-CUSTOM-LAYOUTS.md)*
