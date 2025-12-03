# 13 - Server Actions for Jobber (CRUD)

Implementere CRUD-operasjoner (Create, Read, Update, Delete) for jobbannonser.

---

## Innhold

1. [Oversikt](#oversikt)
2. [IJob Interface](#ijob-interface)
3. [createJob - Opprett jobb](#createjob---opprett-jobb)
4. [getJobById - Hent én jobb](#getjobbyid---hent-én-jobb)
5. [editJobById - Oppdater jobb](#editjobbyid---oppdater-jobb)
6. [deleteJobById - Slett jobb](#deletejobbyid---slett-jobb)
7. [getJobsOfRecruiter - Rekrutterens jobber](#getjobsofrecruiter---rekrutterens-jobber)
8. [getAllActiveJobs - Alle aktive jobber](#getallactivejobs---alle-aktive-jobber)
9. [Bruk i komponenter](#bruk-i-komponenter)
10. [Sjekkliste](#sjekkliste)

---

## Oversikt

### CRUD-operasjoner

| Operasjon | Funksjon | SQL-ekvivalent |
|-----------|----------|----------------|
| **C**reate | `createJob` | INSERT |
| **R**ead | `getJobById`, `getAllActiveJobs` | SELECT |
| **U**pdate | `editJobById` | UPDATE |
| **D**elete | `deleteJobById` | DELETE |

### Fil: `src/actions/jobs.ts`

```typescript
"use server";

import supabaseConfig from "@/config/supabase-config";
import { IJob } from "@/interfaces";
```

**Forklaring:**
- `"use server"` - Markerer at alle funksjoner kjører på serveren
- `supabaseConfig` - Vår Supabase-klient for database-tilgang
- `IJob` - TypeScript-interface som definerer jobb-strukturen

---

## IJob Interface

### Hva er et Interface?

Et interface definerer **formen** på et objekt - hvilke felt det har og hvilke typer.

```typescript
// src/interfaces/index.ts

export interface IJob {
  id: number;                    // Unik ID
  recruiter_id: string;          // Referanse til bruker
  title: string;                 // Stillingstittel
  description: string;           // Beskrivelse
  location: string;              // Arbeidssted
  skills: string[];              // Liste med ferdigheter
  job_type: string;              // full-time, part-time, etc.
  min_salary: number;            // Minimumslønn
  max_salary: number;            // Maksimumslønn
  exp_required: string;          // Erfaring påkrevd
  last_date_to_apply: string;    // Søknadsfrist
  status: string;                // open, closed
  created_at: string;            // Opprettet dato
  updated_at: string;            // Sist oppdatert

  // Runtime felt (kommer fra JOIN)
  recruiter: IUser;              // Rekruttereren som la ut jobben
}
```

### Partial<IJob>

`Partial<IJob>` gjør ALLE felt valgfrie. Nyttig for:
- Oppretting (ikke alle felt er påkrevd)
- Oppdatering (vil bare endre noen felt)

```typescript
// Alle felt påkrevd
const job: IJob = { /* må ha alle felt */ };

// Alle felt valgfrie
const partialJob: Partial<IJob> = {
  title: "Ny tittel"  // Kun dette feltet
};
```

---

## createJob - Opprett jobb

### Kode

```typescript
export const createJob = async (payload: Partial<IJob>) => {
  try {
    const insertJob = await supabaseConfig
      .from("jobs")          // Velg tabell
      .insert([payload]);    // Sett inn data (array fordi vi kan sette inn flere)

    if (insertJob.error) {
      throw new Error(insertJob.error.message);
    }

    return {
      success: true,
      message: "Job created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
```

### Forklaring steg for steg

1. **`async (payload: Partial<IJob>)`** - Asynkron funksjon som tar inn jobb-data
2. **`supabaseConfig.from("jobs")`** - Velger `jobs`-tabellen
3. **`.insert([payload])`** - Setter inn dataen
4. **`if (insertJob.error)`** - Sjekker om noe gikk galt
5. **`return { success, message }`** - Returnerer resultat

### Bruk

```typescript
// I en komponent
const response = await createJob({
  title: "Frontend-utvikler",
  description: "Vi søker...",
  location: "Oslo",
  recruiter_id: currentUser.id,
  status: "open"
});

if (response.success) {
  toast.success(response.message);
}
```

---

## getJobById - Hent én jobb

### Kode

```typescript
export const getJobById = async (jobId: number) => {
  try {
    const jobResponse = await supabaseConfig
      .from("jobs")
      .select("* , recruiter:user_profiles(name , id)")  // Hent også rekrutterer
      .eq("id", jobId);                                   // Hvor id = jobId

    if (jobResponse.error || jobResponse.data.length === 0) {
      throw new Error("Job not found");
    }

    const job = jobResponse.data[0];  // Hent første (og eneste) resultat

    return {
      success: true,
      data: job,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
```

### Forklaring av SELECT med JOIN

```typescript
.select("* , recruiter:user_profiles(name , id)")
```

| Del | Betydning |
|-----|-----------|
| `*` | Hent alle kolonner fra `jobs` |
| `,` | Og i tillegg... |
| `recruiter:` | Gi dette et alias/navn |
| `user_profiles` | Fra tabellen `user_profiles` |
| `(name, id)` | Hent bare disse kolonnene |

**Resultat:**
```json
{
  "id": 1,
  "title": "Frontend-utvikler",
  "location": "Oslo",
  "recruiter": {
    "id": "abc-123",
    "name": "Ola Nordmann"
  }
}
```

### Bruk

```typescript
const response = await getJobById(123);

if (response.success) {
  const job = response.data;
  console.log(job.title);           // "Frontend-utvikler"
  console.log(job.recruiter.name);  // "Ola Nordmann"
}
```

---

## editJobById - Oppdater jobb

### Kode

```typescript
export const editJobById = async (jobId: number, payload: Partial<IJob>) => {
  try {
    const updateJob = await supabaseConfig
      .from("jobs")
      .update(payload)           // Oppdater med nye verdier
      .eq("id", jobId);          // Hvor id = jobId

    if (updateJob.error) {
      throw new Error(updateJob.error.message);
    }

    return {
      success: true,
      message: "Job updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
```

### Hvorfor Partial<IJob>?

Med `Partial` kan du oppdatere bare noen felt:

```typescript
// Oppdater bare tittel
await editJobById(123, { title: "Ny tittel" });

// Oppdater bare lønn
await editJobById(123, { min_salary: 500000, max_salary: 700000 });

// Oppdater flere felt
await editJobById(123, {
  title: "Senior Frontend",
  status: "closed"
});
```

---

## deleteJobById - Slett jobb

### Kode

```typescript
export const deleteJobById = async (jobId: number) => {
  try {
    const deleteJob = await supabaseConfig
      .from("jobs")
      .delete()                  // Slett
      .eq("id", jobId);          // Hvor id = jobId

    if (deleteJob.error) {
      throw new Error(deleteJob.error.message);
    }

    return {
      success: true,
      message: "Job deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
```

### Bruk

```typescript
const handleDelete = async (jobId: number) => {
  const confirmed = window.confirm("Er du sikker?");
  if (!confirmed) return;

  const response = await deleteJobById(jobId);

  if (response.success) {
    toast.success(response.message);
    // Oppdater liste
  } else {
    toast.error(response.message);
  }
};
```

---

## getJobsOfRecruiter - Rekrutterens jobber

### Kode

```typescript
export const getJobsOfRecruiter = async (recruiterId: number) => {
  try {
    const jobsResponse = await supabaseConfig
      .from("jobs")
      .select("*")
      .eq("recruiter_id", recruiterId)               // Kun denne rekrutterens
      .order("created_at", { ascending: false });    // Nyeste først

    if (jobsResponse.error) {
      throw new Error(jobsResponse.error.message);
    }

    return {
      success: true,
      data: jobsResponse.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
```

### Forklaring

- `.eq("recruiter_id", recruiterId)` - Filtrer på rekrutterer
- `.order("created_at", { ascending: false })` - Sorter nyeste først

---

## getAllActiveJobs - Alle aktive jobber

### Kode med filtrering

```typescript
export const getAllActiveJobs = async (filters: any) => {
  try {
    // Start med grunnleggende query
    const qry = supabaseConfig
      .from("jobs")
      .select("* , recruiter:user_profiles(name , id)")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    // Legg til filtre hvis de finnes
    if (filters.keywords) {
      qry.contains(
        "skills",
        filters.keywords.split(",").map((kw: string) => kw.trim())
      );
    }

    if (filters.location) {
      qry.ilike("location", `%${filters.location}%`);
    }

    if (filters.jobType) {
      qry.eq("job_type", filters.jobType);
    }

    if (filters.minSalary) {
      qry.gte("min_salary", Number(filters.minSalary));
    }

    if (filters.maxSalary) {
      qry.lte("max_salary", Number(filters.maxSalary));
    }

    if (filters.experienceLevel) {
      let from = filters.experienceLevel.split("-")[0];
      let to = filters.experienceLevel.split("-")[1];
      qry.gte("exp_required", Number(from));
      qry.lte("exp_required", Number(to));
    }

    const jobsResponse = await qry;

    if (jobsResponse.error) {
      throw new Error(jobsResponse.error.message);
    }

    return {
      success: true,
      data: jobsResponse.data,
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
};
```

### Supabase filter-metoder

| Metode | SQL | Eksempel |
|--------|-----|----------|
| `.eq()` | `=` | `eq("status", "open")` |
| `.neq()` | `!=` | `neq("status", "closed")` |
| `.gt()` | `>` | `gt("salary", 500000)` |
| `.gte()` | `>=` | `gte("salary", 500000)` |
| `.lt()` | `<` | `lt("salary", 1000000)` |
| `.lte()` | `<=` | `lte("salary", 1000000)` |
| `.like()` | `LIKE` | `like("title", "%developer%")` |
| `.ilike()` | `ILIKE` | `ilike("location", "%oslo%")` (case-insensitive) |
| `.contains()` | `@>` | `contains("skills", ["React"])` (array) |

---

## Bruk i komponenter

### Liste-visning

```tsx
'use client'

import { useEffect, useState } from 'react';
import { getAllActiveJobs } from '@/actions/jobs';
import { IJob } from '@/interfaces';

function JobListPage() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const response = await getAllActiveJobs({});
      if (response.success) {
        setJobs(response.data);
      }
      setLoading(false);
    }
    fetchJobs();
  }, []);

  if (loading) return <div>Laster...</div>;

  return (
    <div>
      {jobs.map(job => (
        <div key={job.id}>
          <h2>{job.title}</h2>
          <p>{job.location}</p>
          <p>{job.recruiter?.name}</p>
        </div>
      ))}
    </div>
  );
}
```

### Opprett-skjema

```tsx
'use client'

import { createJob } from '@/actions/jobs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

function CreateJobPage() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const payload = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      status: 'open',
    };

    const response = await createJob(payload);

    if (response.success) {
      toast.success(response.message);
      router.push('/recruiter/jobs');
    } else {
      toast.error(response.message);
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="title" placeholder="Tittel" />
      <textarea name="description" placeholder="Beskrivelse" />
      <input name="location" placeholder="Sted" />
      <button type="submit">Opprett</button>
    </form>
  );
}
```

---

## Komplett jobs.ts

```typescript
"use server";

import supabaseConfig from "@/config/supabase-config";
import { IJob } from "@/interfaces";

export const createJob = async (payload: Partial<IJob>) => {
  try {
    const insertJob = await supabaseConfig.from("jobs").insert([payload]);
    if (insertJob.error) {
      throw new Error(insertJob.error.message);
    }
    return { success: true, message: "Job created successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getJobById = async (jobId: number) => {
  try {
    const jobResponse = await supabaseConfig
      .from("jobs")
      .select("* , recruiter:user_profiles(name , id)")
      .eq("id", jobId);

    if (jobResponse.error || jobResponse.data.length === 0) {
      throw new Error("Job not found");
    }
    return { success: true, data: jobResponse.data[0] };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const editJobById = async (jobId: number, payload: Partial<IJob>) => {
  try {
    const updateJob = await supabaseConfig
      .from("jobs")
      .update(payload)
      .eq("id", jobId);

    if (updateJob.error) {
      throw new Error(updateJob.error.message);
    }
    return { success: true, message: "Job updated successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const deleteJobById = async (jobId: number) => {
  try {
    const deleteJob = await supabaseConfig
      .from("jobs")
      .delete()
      .eq("id", jobId);

    if (deleteJob.error) {
      throw new Error(deleteJob.error.message);
    }
    return { success: true, message: "Job deleted successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getJobsOfRecruiter = async (recruiterId: number) => {
  try {
    const jobsResponse = await supabaseConfig
      .from("jobs")
      .select("*")
      .eq("recruiter_id", recruiterId)
      .order("created_at", { ascending: false });

    if (jobsResponse.error) {
      throw new Error(jobsResponse.error.message);
    }
    return { success: true, data: jobsResponse.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getAllActiveJobs = async (filters: any) => {
  try {
    const qry = supabaseConfig
      .from("jobs")
      .select("* , recruiter:user_profiles(name , id)")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (filters.keywords) {
      qry.contains("skills", filters.keywords.split(",").map((kw: string) => kw.trim()));
    }
    if (filters.location) {
      qry.ilike("location", `%${filters.location}%`);
    }
    if (filters.jobType) {
      qry.eq("job_type", filters.jobType);
    }
    if (filters.minSalary) {
      qry.gte("min_salary", Number(filters.minSalary));
    }
    if (filters.maxSalary) {
      qry.lte("max_salary", Number(filters.maxSalary));
    }

    const jobsResponse = await qry;
    if (jobsResponse.error) {
      throw new Error(jobsResponse.error.message);
    }
    return { success: true, data: jobsResponse.data };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
};
```

---

## Sjekkliste

### Interface
- [ ] `IJob` interface definert i `src/interfaces/index.ts`
- [ ] Alle felt har riktig type

### Server Actions
- [ ] `src/actions/jobs.ts` opprettet
- [ ] `"use server"` på toppen
- [ ] `createJob` implementert
- [ ] `getJobById` implementert
- [ ] `editJobById` implementert
- [ ] `deleteJobById` implementert
- [ ] `getJobsOfRecruiter` implementert
- [ ] `getAllActiveJobs` implementert

### Database
- [ ] `jobs` tabell opprettet i Supabase
- [ ] RLS-policies satt opp
- [ ] Indekser på ofte brukte kolonner

### Testing
- [ ] Kan opprette jobb
- [ ] Kan hente jobb
- [ ] Kan oppdatere jobb
- [ ] Kan slette jobb
- [ ] Filtrering fungerer

---

## Tips

- **Alltid returner `{ success, message/data }`** - Konsistent respons-format
- **Bruk `Partial<T>`** for create/update - Ikke alle felt er påkrevd
- **Feilhåndtering med try/catch** - Fang database-feil
- **Logg feil i utvikling** - `console.error(error)` hjelper debugging

---

*Forrige: [12-STATE-MANAGEMENT.md](./12-STATE-MANAGEMENT.md)*
