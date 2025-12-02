# 02 - Tailwind CSS og Shadcn/ui

Denne guiden viser hvordan du setter opp styling med Tailwind CSS og Shadcn/ui-komponenter.

---

## Innhold

1. [Oversikt](#oversikt)
2. [Installer tilleggspakker](#installer-tilleggspakker)
3. [Konfigurer Tailwind](#konfigurer-tailwind)
4. [Installer Shadcn/ui](#installer-shadcnui)
5. [Legg til komponenter](#legg-til-komponenter)
6. [Utils-funksjon](#utils-funksjon)
7. [CSS-variabler](#css-variabler)
8. [Sjekkliste](#sjekkliste)

---

## Oversikt

### Hvorfor Tailwind CSS?

**Tailwind** lar deg style direkte i HTML med utility-klasser. Fordeler:
- Ingen egen CSS-fil å vedlikeholde
- Konsistent design med ferdigdefinerte verdier (spacing, farger)
- Enkel responsiv design med `md:`, `lg:` prefixer

```html
<!-- Tradisjonell CSS - krever egen .css fil -->
<button class="primary-button">Klikk meg</button>

<!-- Tailwind CSS - alt i ett sted -->
<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
  Klikk meg
</button>
```

### Hvorfor Shadcn/ui?

**Shadcn/ui** gir deg profesjonelle UI-komponenter som:
- **Du eier koden** - kopieres inn i prosjektet, ikke node_modules
- **Fullt tilpassbar** - endre hva du vil
- **Tilgjengelig (a11y)** - bygget på Radix UI som håndterer tastatur/skjermleser
- **TypeScript-støtte** - full intellisense

Bygget med:
- Radix UI (tilgjengelighet)
- Tailwind CSS (styling)
- class-variance-authority (varianter)

**Tips:** Start med Button, Input, Label, Select - de dekker de fleste behov.

---

## Installer tilleggspakker

### Nodvendige pakker

```bash
npm install clsx tailwind-merge class-variance-authority lucide-react
```

| Pakke | Formal |
|-------|--------|
| `clsx` | Kombinerer CSS-klasser betinget |
| `tailwind-merge` | Merger Tailwind-klasser intelligent |
| `class-variance-authority` | Lager komponentvarianter |
| `lucide-react` | Ikonbibliotek |

### Radix UI-pakker (for Shadcn)

```bash
npm install @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-select
```

Flere pakker installeres etter behov nar du legger til komponenter.

---

## Konfigurer Tailwind

### globals.css

Erstatt innholdet i `src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  /* Bakgrunner */
  --background: oklch(100% 0 0);
  --foreground: oklch(14.08% 0.004 285.82);

  /* Kort/panels */
  --card: oklch(100% 0 0);
  --card-foreground: oklch(14.08% 0.004 285.82);

  /* Popover/dropdowns */
  --popover: oklch(100% 0 0);
  --popover-foreground: oklch(14.08% 0.004 285.82);

  /* Primaerfarge (knapper, lenker) */
  --primary: oklch(20.47% 0.006 285.88);
  --primary-foreground: oklch(98.51% 0 0);

  /* Sekundaerfarge */
  --secondary: oklch(96.76% 0.001 285.81);
  --secondary-foreground: oklch(20.47% 0.006 285.88);

  /* Dempet/muted */
  --muted: oklch(96.76% 0.001 285.81);
  --muted-foreground: oklch(55.19% 0.014 285.94);

  /* Accent (hover-effekter) */
  --accent: oklch(96.76% 0.001 285.81);
  --accent-foreground: oklch(20.47% 0.006 285.88);

  /* Destruktive handlinger (slett, feil) */
  --destructive: oklch(57.71% 0.215 27.33);
  --destructive-foreground: oklch(98.51% 0 0);

  /* Rammer */
  --border: oklch(91.97% 0.004 286.32);

  /* Input-felt */
  --input: oklch(91.97% 0.004 286.32);

  /* Fokusring */
  --ring: oklch(70.9% 0.015 286.07);

  /* Border-radius */
  --radius: 0.625rem;
}

/* Mork modus */
.dark {
  --background: oklch(14.08% 0.004 285.82);
  --foreground: oklch(98.51% 0 0);
  --card: oklch(14.08% 0.004 285.82);
  --card-foreground: oklch(98.51% 0 0);
  --popover: oklch(14.08% 0.004 285.82);
  --popover-foreground: oklch(98.51% 0 0);
  --primary: oklch(98.51% 0 0);
  --primary-foreground: oklch(20.47% 0.006 285.88);
  --secondary: oklch(26.54% 0.006 285.88);
  --secondary-foreground: oklch(98.51% 0 0);
  --muted: oklch(26.54% 0.006 285.88);
  --muted-foreground: oklch(70.9% 0.015 286.07);
  --accent: oklch(26.54% 0.006 285.88);
  --accent-foreground: oklch(98.51% 0 0);
  --destructive: oklch(57.71% 0.215 27.33);
  --destructive-foreground: oklch(98.51% 0 0);
  --border: oklch(26.54% 0.006 285.88);
  --input: oklch(26.54% 0.006 285.88);
  --ring: oklch(84.15% 0.01 286.38);
}

/* Globale stiler */
* {
  border-color: var(--border);
}

body {
  background-color: var(--background);
  color: var(--foreground);
}
```

---

## Installer Shadcn/ui

### Steg 1: Initialiser Shadcn

```bash
npx shadcn@latest init
```

### Steg 2: Svar pa sporsmal

```
✔ Which style would you like to use? › New York
✔ Which color would you like to use as the base color? › Neutral
✔ Would you like to use CSS variables for theming? › yes
```

**Anbefalte valg:**
- **Style:** New York (moderne, rent)
- **Base color:** Neutral (fleksibelt)
- **CSS variables:** Yes (enkel tematisering)

### Steg 3: Verifiser components.json

Etter initialisering opprettes `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## Legg til komponenter

### Installer komponenter

```bash
# Button - knapper
npx shadcn@latest add button

# Input - tekstfelt
npx shadcn@latest add input

# Label - skjemaetiketter
npx shadcn@latest add label

# Select - dropdown
npx shadcn@latest add select

# Form - skjemahandtering
npx shadcn@latest add form
```

### Installer flere ved behov

```bash
# Alle vanlige komponenter
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add avatar
npx shadcn@latest add badge
```

### Filstruktur etter installasjon

```
src/components/ui/
├── button.tsx
├── form.tsx
├── input.tsx
├── label.tsx
└── select.tsx
```

---

## Utils-funksjon

### src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Kombinerer CSS-klasser intelligent
 *
 * Eksempler:
 * cn("px-4 py-2", "px-6")           → "py-2 px-6"
 * cn("bg-red-500", isActive && "bg-blue-500") → betinget klasse
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Bruk av cn()

```tsx
import { cn } from "@/lib/utils"

// Enkel bruk
<div className={cn("p-4", "bg-white")}>

// Betinget klasse
<button className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500",
  disabled && "opacity-50"
)}>

// Med varianter
<div className={cn(
  "base-style",
  variant === "primary" && "bg-primary",
  variant === "secondary" && "bg-secondary"
)}>
```

---

## CSS-variabler

### Tilgjengelige variabler

| Variabel | Bruk | Tailwind-klasse |
|----------|------|-----------------|
| `--background` | Sidebakgrunn | `bg-background` |
| `--foreground` | Hovedtekst | `text-foreground` |
| `--primary` | Primaerknapper | `bg-primary`, `text-primary` |
| `--secondary` | Sekundaerelementer | `bg-secondary` |
| `--muted` | Dempet bakgrunn | `bg-muted`, `text-muted-foreground` |
| `--accent` | Hover-effekter | `bg-accent` |
| `--destructive` | Feil/slett | `bg-destructive` |
| `--border` | Rammer | `border-border` |
| `--ring` | Fokusringer | `ring-ring` |
| `--radius` | Border-radius | Brukes i komponenter |

### Eksempel pa bruk

```tsx
// Bakgrunn
<div className="bg-background">

// Tekst
<p className="text-foreground">Hovedtekst</p>
<p className="text-muted-foreground">Dempet tekst</p>

// Knapper
<button className="bg-primary text-primary-foreground">Primaer</button>
<button className="bg-secondary text-secondary-foreground">Sekundaer</button>
<button className="bg-destructive text-destructive-foreground">Slett</button>

// Rammer
<div className="border border-border rounded-md">

// Fokus
<input className="focus:ring-2 focus:ring-ring">
```

---

## Komponenteksempler

### Button

```tsx
import { Button } from "@/components/ui/button"

// Varianter
<Button>Standard</Button>
<Button variant="secondary">Sekundaer</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Slett</Button>

// Storrelser
<Button size="sm">Liten</Button>
<Button size="default">Normal</Button>
<Button size="lg">Stor</Button>
<Button size="icon"><Icon /></Button>

// Med ikon
import { Mail } from "lucide-react"
<Button>
  <Mail className="mr-2 h-4 w-4" />
  Send e-post
</Button>

// Disabled
<Button disabled>Deaktivert</Button>

// Loading
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Laster...
</Button>
```

### Input

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="email">E-post</Label>
  <Input
    id="email"
    type="email"
    placeholder="navn@eksempel.no"
  />
</div>

// Med feilmelding
<div className="space-y-2">
  <Label htmlFor="email">E-post</Label>
  <Input
    id="email"
    type="email"
    className="border-red-500"
  />
  <p className="text-sm text-red-500">Ugyldig e-post</p>
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
} from "@/components/ui/select"

<Select>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Velg rolle" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="job-seeker">Jobbsoker</SelectItem>
    <SelectItem value="recruiter">Rekrutterer</SelectItem>
  </SelectContent>
</Select>
```

---

## Tilpass farger

### Endre primaerfarge

I `globals.css`, endre `--primary`:

```css
:root {
  /* Bla primaerfarge */
  --primary: oklch(54.61% 0.214 262.87);

  /* Gronn primaerfarge */
  --primary: oklch(59.59% 0.183 149.77);

  /* Rod primaerfarge */
  --primary: oklch(57.71% 0.215 27.33);
}
```

### Fargekonvertering

Bruk https://oklch.com for a konvertere farger til OKLCH-format.

---

## Sjekkliste

### Pakker installert
- [ ] `clsx`
- [ ] `tailwind-merge`
- [ ] `class-variance-authority`
- [ ] `lucide-react`
- [ ] `@radix-ui/react-slot`
- [ ] `@radix-ui/react-label`
- [ ] `@radix-ui/react-select`

### Shadcn/ui
- [ ] `npx shadcn@latest init` kjort
- [ ] `components.json` opprettet
- [ ] Button-komponent installert
- [ ] Input-komponent installert
- [ ] Label-komponent installert
- [ ] Select-komponent installert
- [ ] Form-komponent installert

### Filer
- [ ] `src/lib/utils.ts` opprettet
- [ ] `src/app/globals.css` oppdatert
- [ ] Komponenter i `src/components/ui/`

### Verifisering
- [ ] Importer fungerer: `import { Button } from "@/components/ui/button"`
- [ ] CSS-variabler fungerer: `bg-primary`
- [ ] Ingen TypeScript-feil

---

## Neste steg

Ga videre til [03-SUPABASE-DATABASE.md](./03-SUPABASE-DATABASE.md) for a sette opp database.

---

## Tips og triks

### Tailwind tips
- **Hover-effekter:** Bruk `hover:` prefix, f.eks. `hover:bg-blue-600`
- **Responsivt:** Bruk `md:` for tablet, `lg:` for desktop, f.eks. `md:flex-row`
- **Dark mode:** Bruk `dark:` prefix når dark mode er aktivert
- **Gruppering:** Bruk `group` og `group-hover:` for å style barn basert på forelder

### Shadcn tips
- **Ikke installer alle komponenter** - legg til etter behov
- **Se kildekoden** i `src/components/ui/` for å forstå hvordan de fungerer
- **Tilpass varianter** i komponentfilen for prosjektspesifikk styling

### cn() funksjonen
`cn()` er en hjelpefunksjon som kombinerer Tailwind-klasser intelligent:
```tsx
// Slår sammen klasser og løser konflikter
cn("px-4", "px-6")  // → "px-6" (siste vinner)

// Betingede klasser
cn("base-class", isActive && "active-class")
```

---

## Feilsøking

### "Cannot find module '@/lib/utils'"

Sjekk at `src/lib/utils.ts` eksisterer og at `tsconfig.json` har riktig `paths`:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

### Komponenter vises ikke riktig

1. Sjekk at `globals.css` er importert i `layout.tsx`
2. Sjekk at CSS-variablene er definert
3. Restart dev-serveren

### Tailwind-klasser fungerer ikke

```bash
# Restart dev-server
npm run dev
```

---

*Forrige: [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md) | Neste: [03-SUPABASE-DATABASE.md](./03-SUPABASE-DATABASE.md)*
