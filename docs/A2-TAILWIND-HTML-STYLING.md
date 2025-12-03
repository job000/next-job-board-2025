# A2 - HTML, CSS og Tailwind Grunnleggende

Denne guiden forklarer HTML-struktur, CSS-styling og hvordan Tailwind CSS fungerer.

---

## Innhold

1. [HTML Grunnleggende](#html-grunnleggende)
2. [CSS Grunnleggende](#css-grunnleggende)
3. [Tailwind CSS Konsepter](#tailwind-css-konsepter)
4. [Vanlige Tailwind-klasser](#vanlige-tailwind-klasser)
5. [Flexbox og Layout](#flexbox-og-layout)
6. [JavaScript i JSX](#javascript-i-jsx)
7. [Betinget Styling](#betinget-styling)
8. [Responsiv Design](#responsiv-design)

---

## HTML Grunnleggende

### Hva er HTML-elementer?

HTML-elementer er byggesteinene i nettsider. I React bruker vi JSX (JavaScript + HTML).

```tsx
// Grunnleggende HTML-elementer
<div>En boks/container</div>
<p>Et avsnitt med tekst</p>
<h1>Overskrift nivå 1</h1>
<h2>Overskrift nivå 2</h2>
<span>Inline tekst</span>
<button>En knapp</button>
<a href="/link">En lenke</a>
<img src="bilde.jpg" alt="Beskrivelse" />
<input type="text" placeholder="Skriv her" />
```

### Vanlige elementer

| Element | Bruk | Eksempel |
|---------|------|----------|
| `<div>` | Container/boks | Wrapper for andre elementer |
| `<span>` | Inline tekst | Tekst i en setning |
| `<p>` | Avsnitt | Lengre tekst |
| `<h1>-<h6>` | Overskrifter | Titler |
| `<button>` | Knapp | Klikk-handlinger |
| `<input>` | Tekstfelt | Skjema-input |
| `<form>` | Skjema | Wrapper for inputs |
| `<ul>/<li>` | Liste | Punktlister |

### Nesting (elementer inni hverandre)

```tsx
<div>                           {/* Ytre boks */}
  <h1>Tittel</h1>               {/* Overskrift */}
  <div>                         {/* Indre boks */}
    <p>Tekst her</p>            {/* Avsnitt */}
    <button>Klikk meg</button>  {/* Knapp */}
  </div>
</div>
```

---

## CSS Grunnleggende

### Tradisjonell CSS

```css
/* styles.css */
.my-button {
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
}

.my-button:hover {
  background-color: darkblue;
}
```

```tsx
// Bruk i React
import './styles.css';

<button className="my-button">Klikk meg</button>
```

### CSS Egenskaper - Oversikt

| Egenskap | Hva det gjør | Eksempel |
|----------|--------------|----------|
| `color` | Tekstfarge | `color: red` |
| `background-color` | Bakgrunnsfarge | `background-color: blue` |
| `padding` | Innvendig avstand | `padding: 10px` |
| `margin` | Utvendig avstand | `margin: 20px` |
| `border` | Ramme | `border: 1px solid black` |
| `border-radius` | Avrundede hjørner | `border-radius: 5px` |
| `width` / `height` | Størrelse | `width: 100px` |
| `font-size` | Tekststørrelse | `font-size: 16px` |
| `font-weight` | Tekst-tykkelse | `font-weight: bold` |
| `display` | Layout-type | `display: flex` |

---

## Tailwind CSS Konsepter

### Hvordan className fungerer

I React bruker vi `className` (ikke `class` som i vanlig HTML) for å legge til CSS-klasser.

```tsx
// Én klasse
<div className="flex">

// Flere klasser - separert med mellomrom
<div className="flex flex-col gap-5">
//              ↑    ↑        ↑
//              │    │        └── Tredje klasse: gap-5
//              │    └─────────── Andre klasse: flex-col
//              └──────────────── Første klasse: flex
```

**Forklaring av `flex flex-col gap-5`:**

| Klasse | Hva den gjør | CSS som genereres |
|--------|--------------|-------------------|
| `flex` | Aktiverer flexbox på elementet | `display: flex` |
| `flex-col` | Endrer retning til vertikal (kolonne) | `flex-direction: column` |
| `gap-5` | Legger til 1.25rem (20px) mellomrom mellom barna | `gap: 1.25rem` |

**Visuell forklaring:**

```
UTEN flex flex-col gap-5:          MED flex flex-col gap-5:
┌─────────────────────┐            ┌─────────────────────┐
│ PageTitle │ JobForm │            │ PageTitle           │
│           │         │            │                     │
└─────────────────────┘            │ ← 20px gap →        │
                                   │                     │
                                   │ JobForm             │
                                   │                     │
                                   └─────────────────────┘
```

**Praktisk eksempel fra prosjektet:**

```tsx
function EditJobPage() {
  return (
    <div className='flex flex-col gap-5'>
      {/*        ↑    ↑        ↑
          │    │        └── 5 = 1.25rem mellomrom
          │    └─────────── Elementer under hverandre
          └──────────────── Bruk flexbox              */}
      <PageTitle title="Edit Job" />
      <JobForm />
    </div>
  )
}
```

### Andre vanlige attributter

```tsx
// onClick - kjør funksjon ved klikk
<button onClick={() => console.log('Klikket!')}>
  Klikk meg
</button>

// disabled - deaktiver elementet
<button disabled={isLoading}>
  {isLoading ? 'Laster...' : 'Send'}
</button>

// placeholder - tekst i tomt input-felt
<input placeholder="Skriv navn her" />

// type - type input
<input type="email" />
<input type="password" />

// src og alt - for bilder
<img src="/logo.png" alt="Firmalogo" />

// href - for lenker
<a href="/about">Om oss</a>
```

---

### Hva er Tailwind?

Tailwind = ferdiglagde CSS-klasser du bruker direkte i HTML.

```tsx
// UTEN Tailwind (krever egen CSS-fil)
<button className="my-custom-button">Klikk</button>

// MED Tailwind (alt i className)
<button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
  Klikk
</button>
```

### Hvorfor Tailwind?

| Fordel | Forklaring |
|--------|------------|
| Ingen CSS-filer | Alt i className |
| Konsistent design | Ferdigdefinerte verdier |
| Rask utvikling | Ikke lag nye klasser |
| Responsivt innebygd | `md:`, `lg:` prefixer |

---

## Vanlige Tailwind-klasser

### Spacing (p = padding, m = margin)

```tsx
// Padding (innvendig avstand)
<div className="p-4">      {/* Padding alle sider: 1rem (16px) */}
<div className="px-4">     {/* Padding høyre/venstre */}
<div className="py-4">     {/* Padding topp/bunn */}
<div className="pt-4">     {/* Padding kun topp */}
<div className="pb-4">     {/* Padding kun bunn */}
<div className="pl-4">     {/* Padding kun venstre */}
<div className="pr-4">     {/* Padding kun høyre */}

// Margin (utvendig avstand)
<div className="m-4">      {/* Margin alle sider */}
<div className="mx-4">     {/* Margin høyre/venstre */}
<div className="my-4">     {/* Margin topp/bunn */}
<div className="mt-4">     {/* Margin kun topp */}
<div className="mb-4">     {/* Margin kun bunn */}
```

**Tallene betyr:**

| Tall | Verdi |
|------|-------|
| 1 | 0.25rem (4px) |
| 2 | 0.5rem (8px) |
| 4 | 1rem (16px) |
| 5 | 1.25rem (20px) |
| 6 | 1.5rem (24px) |
| 8 | 2rem (32px) |

### Farger

```tsx
// Bakgrunnsfarger
<div className="bg-white">       {/* Hvit bakgrunn */}
<div className="bg-gray-100">    {/* Lys grå */}
<div className="bg-gray-200">    {/* Grå */}
<div className="bg-blue-500">    {/* Blå */}
<div className="bg-red-500">     {/* Rød */}
<div className="bg-green-500">   {/* Grønn */}
<div className="bg-primary">     {/* Prosjektets primærfarge */}

// Tekstfarger
<p className="text-white">       {/* Hvit tekst */}
<p className="text-gray-500">    {/* Grå tekst */}
<p className="text-gray-600">    {/* Mørkere grå */}
<p className="text-blue-500">    {/* Blå tekst */}
<p className="text-primary">     {/* Primærfarge */}
```

### Tekst

```tsx
// Størrelse
<p className="text-xs">      {/* Ekstra liten */}
<p className="text-sm">      {/* Liten */}
<p className="text-base">    {/* Normal */}
<p className="text-lg">      {/* Stor */}
<p className="text-xl">      {/* Ekstra stor */}
<p className="text-2xl">     {/* 2x stor */}
<p className="text-4xl">     {/* 4x stor */}

// Tykkelse
<p className="font-normal">  {/* Normal */}
<p className="font-medium">  {/* Medium */}
<p className="font-semibold">{/* Semi-bold */}
<p className="font-bold">    {/* Bold */}

// Justering
<p className="text-left">    {/* Venstrejustert */}
<p className="text-center">  {/* Sentrert */}
<p className="text-right">   {/* Høyrejustert */}
```

### Størrelser

```tsx
// Width (bredde)
<div className="w-full">     {/* 100% bredde */}
<div className="w-1/2">      {/* 50% bredde */}
<div className="w-1/3">      {/* 33% bredde */}
<div className="w-64">       {/* 16rem (256px) */}
<div className="w-[450px]">  {/* Eksakt 450px */}

// Height (høyde)
<div className="h-full">     {/* 100% høyde */}
<div className="h-screen">   {/* 100vh (hele skjermen) */}
<div className="h-64">       {/* 16rem */}
<div className="min-h-screen">{/* Minimum 100vh */}
```

### Border og runding

```tsx
// Border (ramme)
<div className="border">           {/* 1px ramme */}
<div className="border-2">         {/* 2px ramme */}
<div className="border-gray-300">  {/* Grå ramme */}

// Border-radius (avrunding)
<div className="rounded">      {/* Lett avrundet */}
<div className="rounded-md">   {/* Medium avrundet */}
<div className="rounded-lg">   {/* Mer avrundet */}
<div className="rounded-full"> {/* Helt rund (sirkel) */}
```

### Shadow (skygge)

```tsx
<div className="shadow">       {/* Liten skygge */}
<div className="shadow-md">    {/* Medium skygge */}
<div className="shadow-lg">    {/* Stor skygge */}
```

---

## Flexbox og Layout

### Hva er Flexbox?

Flexbox er en CSS-layout som plasserer elementer i en rad eller kolonne.

```tsx
// Flexbox container
<div className="flex">
  <div>Element 1</div>
  <div>Element 2</div>
  <div>Element 3</div>
</div>
```

### Retning

```tsx
// Rad (default) - elementer ved siden av hverandre
<div className="flex flex-row">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>
// Resultat: [1] [2] [3]

// Kolonne - elementer under hverandre
<div className="flex flex-col">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>
// Resultat:
// [1]
// [2]
// [3]
```

### Justering

```tsx
// justify-* = horisontal justering (main axis)
<div className="flex justify-start">   {/* Venstre */}
<div className="flex justify-center">  {/* Senter */}
<div className="flex justify-end">     {/* Høyre */}
<div className="flex justify-between"> {/* Mellomrom mellom */}

// items-* = vertikal justering (cross axis)
<div className="flex items-start">     {/* Topp */}
<div className="flex items-center">    {/* Midt */}
<div className="flex items-end">       {/* Bunn */}
```

### Vanlige layout-mønstre

```tsx
// Sentrere vertikalt og horisontalt
<div className="flex items-center justify-center h-screen">
  <div>Jeg er sentrert!</div>
</div>

// Header med logo til venstre, meny til høyre
<div className="flex justify-between items-center p-4">
  <div>Logo</div>
  <div>Meny</div>
</div>

// Sidebar-layout
<div className="flex">
  <div className="w-64">Sidebar</div>
  <div className="flex-1">Hovedinnhold</div>
</div>

// Kort-grid
<div className="flex flex-wrap gap-4">
  <div className="w-64">Kort 1</div>
  <div className="w-64">Kort 2</div>
  <div className="w-64">Kort 3</div>
</div>
```

### Gap (mellomrom mellom elementer)

```tsx
<div className="flex gap-4">    {/* 1rem mellom hvert element */}
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

<div className="flex gap-2">    {/* 0.5rem mellom */}
<div className="flex gap-8">    {/* 2rem mellom */}
```

---

## JavaScript i JSX

### Hvordan bruke variabler

I JSX bruker du `{}` for å sette inn JavaScript.

```tsx
function UserCard() {
  const name = "Ola Nordmann";
  const age = 25;
  const isActive = true;

  return (
    <div>
      {/* Sett inn variabel */}
      <h1>{name}</h1>
      <p>Alder: {age}</p>

      {/* Beregning */}
      <p>Fødselsår: {2024 - age}</p>

      {/* Betinget innhold */}
      <span>{isActive ? "Aktiv" : "Inaktiv"}</span>
    </div>
  );
}
```

### Loope over lister

```tsx
function UserList() {
  const users = [
    { id: 1, name: "Ola" },
    { id: 2, name: "Kari" },
    { id: 3, name: "Per" },
  ];

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Betingelser

```tsx
function UserProfile({ user }) {
  return (
    <div>
      {/* If-else med ternary */}
      {user.isAdmin ? (
        <span>Administrator</span>
      ) : (
        <span>Vanlig bruker</span>
      )}

      {/* Bare vis hvis true */}
      {user.isPremium && <span>Premium medlem</span>}

      {/* Vis komponent eller null */}
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} />
      ) : null}
    </div>
  );
}
```

---

## Betinget Styling

### Med template literals

```tsx
function Button({ variant }) {
  return (
    <button className={`
      px-4 py-2 rounded
      ${variant === 'primary' ? 'bg-blue-500 text-white' : ''}
      ${variant === 'secondary' ? 'bg-gray-200 text-black' : ''}
    `}>
      Klikk meg
    </button>
  );
}
```

### Med cn() funksjonen (anbefalt)

```tsx
import { cn } from "@/lib/utils";

function Button({ variant, disabled }) {
  return (
    <button className={cn(
      "px-4 py-2 rounded",  // Basis-klasser
      variant === 'primary' && "bg-blue-500 text-white",
      variant === 'secondary' && "bg-gray-200 text-black",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      Klikk meg
    </button>
  );
}
```

### Eksempler fra prosjektet

```tsx
// Aktiv meny-item
<li className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-primary text-white",
  !isActive && "text-gray-600 hover:bg-gray-100"
)}>
  {menuItem.label}
</li>

// Feilmelding
<input className={cn(
  "border rounded px-3 py-2",
  hasError && "border-red-500",
  !hasError && "border-gray-300"
)} />
```

---

## Responsiv Design

### Breakpoints

Tailwind bruker prefixer for ulike skjermstørrelser:

| Prefix | Min-bredde | Enheter |
|--------|------------|---------|
| (ingen) | 0px | Mobil først |
| `sm:` | 640px | Små enheter |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Store skjermer |
| `2xl:` | 1536px | Ekstra store |

### Hvordan det fungerer

```tsx
// Mobil først - legg til for større skjermer
<div className="
  flex flex-col    {/* Mobil: vertikal */}
  md:flex-row      {/* Tablet+: horisontal */}
">
  <div>Sidebar</div>
  <div>Innhold</div>
</div>
```

### Vanlige mønstre

```tsx
// Skjul på mobil, vis på desktop
<div className="hidden md:block">
  Bare synlig på tablet og oppover
</div>

// Vis på mobil, skjul på desktop
<div className="block md:hidden">
  Bare synlig på mobil
</div>

// Ulik bredde per skjermstørrelse
<div className="
  w-full           {/* Mobil: 100% */}
  md:w-1/2         {/* Tablet: 50% */}
  lg:w-1/3         {/* Desktop: 33% */}
">
  Kort
</div>

// Ulik padding
<div className="
  p-4              {/* Mobil: liten padding */}
  md:p-8           {/* Tablet: større padding */}
">
  Innhold
</div>
```

---

## Praktiske eksempler

### Login-kort

```tsx
<div className="bg-gray-200 flex items-center justify-center min-h-screen">
  <div className="bg-white flex flex-col shadow rounded p-5 w-[450px]">
    <h1 className="text-primary font-bold text-lg">Login</h1>
    <hr className="border border-gray-300 my-4" />

    <input
      className="border border-gray-300 rounded px-3 py-2 mb-4"
      placeholder="E-post"
    />

    <button className="bg-primary text-white px-4 py-2 rounded w-full">
      Logg inn
    </button>
  </div>
</div>
```

### Produkt-kort

```tsx
<div className="bg-white rounded-lg shadow-md p-4 w-64">
  <img
    src="/product.jpg"
    alt="Produkt"
    className="w-full h-48 object-cover rounded"
  />
  <h3 className="font-bold text-lg mt-2">Produktnavn</h3>
  <p className="text-gray-600 text-sm">Beskrivelse her</p>
  <div className="flex justify-between items-center mt-4">
    <span className="font-bold text-xl">499 kr</span>
    <button className="bg-blue-500 text-white px-4 py-2 rounded">
      Kjøp
    </button>
  </div>
</div>
```

### Header med meny

```tsx
<header className="bg-white shadow-sm px-6 py-4">
  <div className="flex justify-between items-center">
    <h1 className="text-xl font-bold text-primary">Logo</h1>

    <nav className="hidden md:flex gap-6">
      <a href="/" className="text-gray-600 hover:text-primary">Hjem</a>
      <a href="/about" className="text-gray-600 hover:text-primary">Om oss</a>
      <a href="/contact" className="text-gray-600 hover:text-primary">Kontakt</a>
    </nav>

    <button className="md:hidden">
      <MenuIcon />
    </button>
  </div>
</header>
```

---

## Oppsummering

| Klasse | Hva det gjør |
|--------|--------------|
| `flex` | Aktiverer flexbox |
| `flex-col` | Vertikal retning |
| `items-center` | Sentrerer vertikalt |
| `justify-center` | Sentrerer horisontalt |
| `justify-between` | Mellomrom mellom |
| `gap-4` | Mellomrom mellom elementer |
| `p-4` | Padding alle sider |
| `px-4` | Padding høyre/venstre |
| `py-4` | Padding topp/bunn |
| `m-4` | Margin alle sider |
| `bg-white` | Hvit bakgrunn |
| `text-gray-600` | Grå tekst |
| `text-lg` | Stor tekst |
| `font-bold` | Fet tekst |
| `rounded` | Avrundede hjørner |
| `shadow` | Skygge |
| `w-full` | 100% bredde |
| `h-screen` | 100vh høyde |
| `md:` | Fra tablet og oppover |

---

## Nyttige ressurser

- [Tailwind CSS Cheat Sheet](https://tailwindcomponents.com/cheatsheet/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

*Forrige: [A1-NEXTJS-ROUTING-STRUCTURE.md](./A1-NEXTJS-ROUTING-STRUCTURE.md) | Neste: [13-SERVER-ACTIONS-JOBS.md](./13-SERVER-ACTIONS-JOBS.md)*
