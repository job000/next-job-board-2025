# Proxy Guide - Next.js 16+

En komplett guide til proxy.ts (tidligere middleware.ts) i Next.js 16.

---

## Innholdsfortegnelse

1. [Hva er Proxy?](#hva-er-proxy)
2. [Middleware vs Proxy](#middleware-vs-proxy)
3. [Plassering av filen](#plassering-av-filen)
4. [Grunnleggende oppsett](#grunnleggende-oppsett)
5. [Hvordan Proxy fungerer](#hvordan-proxy-fungerer)
6. [Vanlige bruksomrader](#vanlige-bruksomrader)
7. [Matcher-konfigurasjon](#matcher-konfigurasjon)
8. [Praktiske eksempler](#praktiske-eksempler)
9. [Feilsoking](#feilsoking)
10. [Best Practices](#best-practices)

---

## Hva er Proxy?

Proxy er en funksjon som kjorer **for hver forespørsel** til serveren din. Den lar deg:

- Sjekke om brukeren er innlogget
- Omdirigere basert pa betingelser
- Legge til headers
- Blokkere tilgang til visse sider
- Logge forespørsler

```
┌─────────────────────────────────────────────────────────────┐
│                     BRUKER                                  │
│                                                             │
│   Skriver: https://minapp.no/dashboard                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Forespørsel
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     PROXY.TS                                │
│                                                             │
│   1. Sjekker ruten (/dashboard)                             │
│   2. Er brukeren innlogget? (har token?)                    │
│   3. Hvis JA  → La forespørselen ga videre                  │
│   4. Hvis NEI → Omdiriger til /login                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS                                 │
│                                                             │
│   Viser siden eller omdirigerer                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Middleware vs Proxy

### Historikk

| Next.js versjon | Filnavn | Funksjonsnavn |
|-----------------|---------|---------------|
| 12 - 15 | `middleware.ts` | `middleware()` |
| 16+ | `proxy.ts` | `proxy()` |

### Viktig endring i Next.js 16

```
⚠️ The "middleware" file convention is deprecated.
   Please use "proxy" instead.
```

**Før (Next.js 12-15):**
```typescript
// middleware.ts
export function middleware(request) { ... }
```

**Na (Next.js 16+):**
```typescript
// proxy.ts
export function proxy(request) { ... }
```

---

## Plassering av filen

### Riktig plassering

Proxy-filen **MA** ligge pa et av disse stedene:

```
Alternativ 1 (anbefalt med src/):
mitt-prosjekt/
└── src/
    └── proxy.ts    ← HER

Alternativ 2 (uten src/):
mitt-prosjekt/
└── proxy.ts        ← HER
```

### Feil plassering

```
mitt-prosjekt/
└── src/
    └── app/
        └── proxy.ts    ← FEIL! Vil ikke fungere
```

### Viktig regel

- Bare EN proxy-fil per prosjekt
- Filen MA hete `proxy.ts` (eller `proxy.js`)
- Funksjonen MA hete `proxy` eller vaere default export

---

## Grunnleggende oppsett

### Minimal proxy.ts

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // La alle forespørsler ga videre
  return NextResponse.next()
}
```

### Fullstendig proxy.ts med config

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Din logikk her
  return NextResponse.next()
}

// Bestem hvilke ruter proxy skal kjore pa
export const config = {
  matcher: [
    // Kjor pa alle ruter unntatt statiske filer
    '/((?!_next|.*\\..*).*)',
  ],
}
```

---

## Hvordan Proxy fungerer

### Livssyklus

```
1. Bruker gar til en URL
         │
         ▼
2. Next.js sjekker: Matcher denne URLen proxy config?
         │
         ├── NEI → Hopp over proxy, vis siden direkte
         │
         └── JA → Kjor proxy-funksjonen
                       │
                       ▼
3. Proxy-funksjonen returnerer:
         │
         ├── NextResponse.next()     → Fortsett til siden
         ├── NextResponse.redirect() → Omdiriger til annen URL
         ├── NextResponse.rewrite()  → Vis annen side (URL forblir)
         └── NextResponse.json()     → Returner JSON (API)
```

### Returtyper

| Metode | Hva den gjor | Eksempel |
|--------|--------------|----------|
| `NextResponse.next()` | La forespørselen ga videre | Bruker er autentisert |
| `NextResponse.redirect(url)` | Send bruker til annen URL | Ikke innlogget → /login |
| `NextResponse.rewrite(url)` | Vis annen side, behold URL | A/B testing |
| `NextResponse.json(data)` | Returner JSON | API-respons |

---

## Vanlige bruksomrader

### 1. Autentisering (beskyttede sider)

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Definer beskyttede ruter
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const isProtected = protectedRoutes.some(route => path.startsWith(route))

  // Hent token fra cookie
  const token = request.cookies.get('token')?.value

  // Hvis beskyttet rute og ingen token → omdiriger til login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

### 2. Rollebasert tilgang

```typescript
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const role = request.cookies.get('role')?.value
  const token = request.cookies.get('token')?.value

  // Admin-sider krever admin-rolle
  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Recruiter-sider krever recruiter-rolle
  if (path.startsWith('/recruiter') && role !== 'recruiter') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Job-seeker-sider krever job-seeker-rolle
  if (path.startsWith('/job-seeker') && role !== 'job-seeker') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}
```

### 3. Omdiriger innloggede brukere vekk fra login

```typescript
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('token')?.value
  const role = request.cookies.get('role')?.value

  // Offentlige auth-sider
  const authPages = ['/login', '/register', '/forgot-password']
  const isAuthPage = authPages.includes(path)

  // Hvis bruker er innlogget og prøver a ga til login/register
  // → omdiriger til dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
  }

  return NextResponse.next()
}
```

### 4. Komplett eksempel (fra dette prosjektet)

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const route = request.nextUrl.pathname

  // Definer private ruter (krever innlogging)
  const isPrivate = route.startsWith('/job-seeker') ||
                    route.startsWith('/recruiter')

  // Hent token fra cookie
  const token = request.cookies.get('token')?.value

  // ─────────────────────────────────────────────
  // REGEL 1: Private ruter uten token → login
  // ─────────────────────────────────────────────
  if (isPrivate && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ─────────────────────────────────────────────
  // REGEL 2: Offentlige ruter med token → dashboard
  // ─────────────────────────────────────────────
  if (!isPrivate && token) {
    try {
      const role = request.cookies.get('role')?.value
      const dashboardPath = `/${role}/dashboard`
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    } catch (error) {
      console.error('Proxy error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ─────────────────────────────────────────────
  // REGEL 3: Alt annet → la ga videre
  // ─────────────────────────────────────────────
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

---

## Matcher-konfigurasjon

### Hva er matcher?

Matcher bestemmer hvilke URL-er proxy skal kjore pa. Uten matcher kjorer proxy pa ALLE forespørsler (inkludert bilder, CSS, etc.).

### Standard matcher (anbefalt)

```typescript
export const config = {
  matcher: [
    // Hopp over Next.js internals og statiske filer
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Alltid kjor for API-ruter
    '/(api|trpc)(.*)',
  ],
}
```

### Forklaring av regex

```
/((?!_next|[^?]*\\.(?:html?|css|...)).*)

Betyr:
- (?!_next)     → IKKE match /_next/* (Next.js interne filer)
- [^?]*\\.      → IKKE match filer med filendelser
- (?:html?|css) → IKKE match .html, .htm, .css, etc.
```

### Enklere matcher-eksempler

```typescript
// Kun spesifikke ruter
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
}

// Alt unntatt API
export const config = {
  matcher: ['/((?!api).*)'],
}

// Kun API-ruter
export const config = {
  matcher: ['/api/:path*'],
}
```

### Matcher syntaks

| Pattern | Matcher | Eksempler |
|---------|---------|-----------|
| `/about` | Eksakt match | `/about` |
| `/dashboard/:path` | Ett segment | `/dashboard/stats` |
| `/dashboard/:path*` | Alle undersider | `/dashboard/stats/monthly` |
| `/(auth)/:path*` | Gruppe | `/login`, `/register` |

---

## Praktiske eksempler

### Eksempel 1: Enkel auth-sjekk

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const path = request.nextUrl.pathname

  // Liste over beskyttede ruter
  const protectedPaths = ['/dashboard', '/profile', '/settings']

  // Sjekk om ruten er beskyttet
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  if (isProtected && !token) {
    // Lagre opprinnelig URL for redirect etter login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
```

### Eksempel 2: Legg til custom headers

```typescript
export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  // Legg til sikkerhets-headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  return response
}
```

### Eksempel 3: Logging

```typescript
export function proxy(request: NextRequest) {
  // Logg alle forespørsler
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`)

  return NextResponse.next()
}
```

### Eksempel 4: Geo-basert omdirigering

```typescript
export function proxy(request: NextRequest) {
  const country = request.geo?.country || 'US'

  // Omdiriger norske brukere til norsk versjon
  if (country === 'NO' && !request.nextUrl.pathname.startsWith('/no')) {
    return NextResponse.redirect(new URL('/no' + request.nextUrl.pathname, request.url))
  }

  return NextResponse.next()
}
```

---

## Feilsoking

### Vanlige feil

#### 1. "Both middleware and proxy files detected"

```
Error: Both middleware file "./src/middleware.ts" and proxy file
"./src/proxy.ts" are detected. Please use "./src/proxy.ts" only.
```

**Løsning:** Slett `middleware.ts`, behold kun `proxy.ts`

```bash
rm src/middleware.ts
```

#### 2. "Must export a function"

```
Error: The file "./src/proxy.ts" must export a function
```

**Løsning:** Sjekk at funksjonen heter `proxy` og er eksportert:

```typescript
// ✅ Riktig
export function proxy(request: NextRequest) { ... }

// ✅ Også riktig (default export)
export default function proxy(request: NextRequest) { ... }

// ❌ Feil - funksjonen heter ikke proxy
export function middleware(request: NextRequest) { ... }

// ❌ Feil - ikke eksportert
function proxy(request: NextRequest) { ... }
```

#### 3. Uendelig redirect-løkke

**Symptom:** Siden laster i det uendelige eller viser "too many redirects"

**Arsak:** Proxy omdirigerer til en side som ogsa omdirigerer tilbake

**Løsning:** Ekskluder login-siden fra omdirigering:

```typescript
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // VIKTIG: Ikke omdiriger hvis allerede pa login
  if (path === '/login') {
    return NextResponse.next()
  }

  // ... resten av logikken
}
```

#### 4. Proxy kjorer ikke

**Sjekkliste:**
- [ ] Filen heter `proxy.ts` (ikke `middleware.ts`)
- [ ] Filen ligger i `src/` eller rot-mappen
- [ ] Funksjonen heter `proxy` og er eksportert
- [ ] Matcher inkluderer ruten du tester
- [ ] Dev-serveren er restartet

#### 5. Cookies er undefined

```typescript
// ❌ Kan gi undefined
const token = request.cookies.get('token')

// ✅ Trygg tilgang
const token = request.cookies.get('token')?.value || null
```

---

## Best Practices

### 1. Hold proxy enkel

```typescript
// ✅ God - enkel og lesbar
export function proxy(request: NextRequest) {
  const isPrivate = request.nextUrl.pathname.startsWith('/dashboard')
  const hasToken = request.cookies.has('token')

  if (isPrivate && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

### 2. Unnga tung logikk

Proxy kjorer pa HVER forespørsel. Unnga:
- Database-kall
- API-forespørsler
- Kompleks JWT-verifisering

```typescript
// ❌ Darlig - for tregt
export async function proxy(request: NextRequest) {
  const user = await fetchUserFromDatabase()  // TREGT!
  // ...
}

// ✅ Bra - kun sjekk cookie
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  // ...
}
```

### 3. Bruk matcher for ytelse

```typescript
// ✅ Kjor kun pa relevante ruter
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
}
```

### 4. Handter feil gracefully

```typescript
export function proxy(request: NextRequest) {
  try {
    // Din logikk
  } catch (error) {
    console.error('Proxy error:', error)
    // Fallback - la forespørselen ga videre
    return NextResponse.next()
  }
}
```

### 5. Test grundig

Test disse scenarioene:
- [ ] Ikke innlogget bruker → beskyttet side
- [ ] Innlogget bruker → login-side
- [ ] Innlogget bruker → beskyttet side
- [ ] Feil rolle → feil dashboard
- [ ] Ugyldig/utlopt token

---

## Oppsummering

| Emne | Detalj |
|------|--------|
| Filnavn | `proxy.ts` |
| Plassering | `src/proxy.ts` eller `proxy.ts` (rot) |
| Funksjonsnavn | `proxy` |
| Kjorer | For HVER forespørsel (basert pa matcher) |
| Brukes til | Auth, redirects, headers, logging |
| Ikke brukes til | Database-kall, tung logikk |

---

## Relaterte dokumenter

- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - Autentisering
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Prosjektoversikt

---

*Sist oppdatert: Desember 2024*
