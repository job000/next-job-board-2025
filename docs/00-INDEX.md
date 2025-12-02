# Next.js Fullstack Prosjekt - Implementasjonsguide

Komplett implementasjonsguide for å bygge en fullstack Next.js-applikasjon fra scratch.

---

## Om denne guiden

Denne guiden er laget for å kunne **gjenbruke arkitekturen og koden** i nye prosjekter. Følg stegene i rekkefølge for å bygge en komplett applikasjon.

**Prosjekttype:** Jobbportal (Job Board)
**Teknologier:** Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS

---

## Implementasjonsoversikt

| # | Fil | Innhold | Tid |
|---|-----|---------|-----|
| 01 | [PROJECT-SETUP.md](./01-PROJECT-SETUP.md) | Opprette nytt Next.js-prosjekt | 10 min |
| 02 | [TAILWIND-SHADCN.md](./02-TAILWIND-SHADCN.md) | Styling med Tailwind og Shadcn/ui | 15 min |
| 03 | [SUPABASE-DATABASE.md](./03-SUPABASE-DATABASE.md) | Database-oppsett med Supabase | 20 min |
| 04 | [TYPESCRIPT-INTERFACES.md](./04-TYPESCRIPT-INTERFACES.md) | TypeScript-typer og interfaces | 10 min |
| 05 | [AUTHENTICATION.md](./05-AUTHENTICATION.md) | Brukerautentisering (register/login) | 30 min |
| 06 | [FORM-VALIDATION.md](./06-FORM-VALIDATION.md) | Skjemaer med React Hook Form + Zod | 20 min |
| 07 | [PROXY-MIDDLEWARE.md](./07-PROXY-MIDDLEWARE.md) | Rutebeskyttelse med proxy.ts | 15 min |
| 08 | [CUSTOM-LAYOUTS.md](./08-CUSTOM-LAYOUTS.md) | Dynamiske layouts med brukerdata | 15 min |
| 09 | [PAGES-ROUTING.md](./09-PAGES-ROUTING.md) | Sider og ruting | 20 min |
| 10 | [COMPONENTS.md](./10-COMPONENTS.md) | Gjenbrukbare komponenter | 15 min |
| 11 | [DEPLOYMENT.md](./11-DEPLOYMENT.md) | Produksjonssetting | 15 min |
| 12 | [STATE-MANAGEMENT.md](./12-STATE-MANAGEMENT.md) | Global state med Zustand | 20 min |

**Total estimert tid:** ~3.5 timer

---

## Arkitekturoversikt

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Pages     │  │ Components  │  │   Layouts   │          │
│  │  (Routes)   │  │    (UI)     │  │  (Wrapper)  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                             │
│  React Hook Form + Zod (Validering)                         │
│  Tailwind CSS + Shadcn/ui (Styling)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Server Actions
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Actions   │  │   Proxy     │  │   Config    │          │
│  │ (users.ts)  │  │ (proxy.ts)  │  │ (supabase)  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                             │
│  bcrypt (Hashing) + JWT (Tokens)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Supabase Client
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                              │
│                      (Supabase)                             │
│                                                             │
│  user_profiles: id, name, email, password, role, etc.       │
└─────────────────────────────────────────────────────────────┘
```

---

## Mappestruktur

```
prosjekt/
│
├── docs/                         # Dokumentasjon
│   ├── 00-INDEX.md
│   ├── 01-PROJECT-SETUP.md
│   └── ...
│
├── public/                       # Statiske filer
│
├── src/
│   ├── actions/                  # Server Actions
│   │   └── users.ts
│   │
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/             # Offentlige sider
│   │   ├── (private)/            # Beskyttede sider
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                   # Shadcn/ui komponenter
│   │   └── functional/           # Funksjonelle komponenter
│   │       └── logout-btn.tsx
│   │
│   ├── config/                   # Konfigurasjon
│   │   └── supabase-config.ts
│   │
│   ├── constants/                # Konstanter
│   │   └── index.ts
│   │
│   ├── custom-layout/            # Layout-system
│   │   ├── index.tsx             # CustomLayout wrapper
│   │   ├── private.tsx           # PrivateLayout med brukerdata
│   │   ├── header.tsx            # Header med brukerinfo
│   │   └── sidebar-menuitems.tsx # Rollebasert sidebar-navigasjon
│   │
│   ├── interfaces/               # TypeScript-typer
│   │   └── index.ts
│   │
│   ├── lib/                      # Hjelpefunksjoner
│   │   └── utils.ts
│   │
│   ├── store/                    # Zustand state management
│   │   └── users-store.ts        # Bruker-store
│   │
│   ├── types/                    # Type-definisjoner
│   │   └── css.d.ts
│   │
│   └── proxy.ts                  # Rutebeskyttelse
│
├── .env                          # Miljovariabler
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Teknologistakk

### Frontend
| Teknologi | Versjon | Formal |
|-----------|---------|--------|
| Next.js | 16.0.5 | React-rammeverk |
| React | 19.2.0 | UI-bibliotek |
| TypeScript | 5.x | Type-sikkerhet |
| Tailwind CSS | 4.x | Styling |
| Shadcn/ui | - | UI-komponenter |
| Lucide React | 0.555.0 | Ikoner |

### Backend
| Teknologi | Versjon | Formal |
|-----------|---------|--------|
| Supabase | 2.86.0 | Database (PostgreSQL) |
| bcryptjs | 3.0.3 | Passord-hashing |
| jsonwebtoken | 9.0.2 | JWT-tokens |

### Skjema/Validering
| Teknologi | Versjon | Formal |
|-----------|---------|--------|
| React Hook Form | 7.67.0 | Skjemahandtering |
| Zod | 4.1.13 | Validering |
| @hookform/resolvers | 5.2.2 | Kobling |

### State Management
| Teknologi | Versjon | Formal |
|-----------|---------|--------|
| Zustand | 5.x | Global state management |

### Andre
| Teknologi | Versjon | Formal |
|-----------|---------|--------|
| react-hot-toast | 2.6.0 | Notifikasjoner |
| js-cookie | 3.0.5 | Cookie-handtering |
| clsx | 2.1.1 | CSS-klasser |
| tailwind-merge | 3.4.0 | Tailwind-klasser |

---

## Hurtigstart

### For nye prosjekter

1. Folg guidene i rekkefolge (01 → 11)
2. Tilpass kode til ditt prosjekt
3. Bruk sjekklister i hver guide

### For eksisterende prosjekter

1. Velg relevant guide
2. Kopier nodvendig kode
3. Tilpass til din struktur

---

## Sjekkliste - Komplett prosjekt

### Oppsett
- [ ] Next.js-prosjekt opprettet
- [ ] TypeScript konfigurert
- [ ] Tailwind CSS installert
- [ ] Shadcn/ui satt opp

### Database
- [ ] Supabase-prosjekt opprettet
- [ ] Tabeller opprettet
- [ ] RLS-policies konfigurert
- [ ] Miljovariabler satt

### Autentisering
- [ ] Brukerregistrering
- [ ] Innlogging
- [ ] JWT-tokens
- [ ] Cookie-handtering

### Sider
- [ ] Hjemmeside
- [ ] Login-side
- [ ] Register-side
- [ ] Dashboard(s)

### Sikkerhet
- [ ] Passord-hashing
- [ ] Rutebeskyttelse
- [ ] Input-validering
- [ ] Feilhandtering

### State Management
- [ ] Zustand installert
- [ ] User store opprettet
- [ ] Global brukerdata tilgjengelig

---

## Tilpasning for ulike prosjekter

### E-commerce
- Endre roller: `customer`, `admin`
- Legg til: produkter, handlekurv, ordre

### SaaS
- Endre roller: `user`, `admin`, `superadmin`
- Legg til: abonnementer, team, fakturering

### Blog/CMS
- Endre roller: `reader`, `author`, `editor`
- Legg til: artikler, kategorier, kommentarer

### Sosial plattform
- Endre roller: `user`, `moderator`, `admin`
- Legg til: profiler, posts, venner

---

## Relaterte ressurser

- [Next.js Dokumentasjon](https://nextjs.org/docs)
- [Supabase Dokumentasjon](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

*Sist oppdatert: Desember 2024*
