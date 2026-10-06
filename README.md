# Nestly

> A cozy digital agenda that feels like a real one: a 3D cover that opens like a book, two pages at a time, real page turning, and writing that appears as if drawn by a pencil.

Nestly is a full-stack web application for keeping a personal agenda, diary or notebook. It combines a classic structured-planner workflow (daily sections such as expenses, checklists, mood, appointments and free text) with a tactile, handcrafted interface: a WebGL book cover, a 3D page flip, and a handwriting-style reveal with sound.

- **Status:** feature-complete for v1; production deployment still to be done (see [Roadmap](#roadmap)).
- **Monorepo:** `nestly-backend` (Spring Boot) and `nestly-frontend` (Next.js).

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [API overview](#api-overview)
- [Testing and quality](#testing-and-quality)
- [Project structure](#project-structure)
- [Key design decisions](#key-design-decisions)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Credits and licensing](#credits-and-licensing)

---

## Features

**Agendas**
- Three base templates: **notebook** (numbered pages), **standard** and **diary** (one page per day).
- A 3D book cover with a configurable colour; rename and recolour at any time.
- Permanent deletion protected by typed-name confirmation.

**Page structure**
- Five section types: free text, checklist, expenses, appointments, mood.
- Add, remove and reorder sections with a **live page preview**.
- Changes are **retroactive**: every existing page is brought in line with the new structure, and removing a section that holds data requires explicit, server-enforced confirmation.

**The book**
- Two-page spread (single page on small screens) inside a frame tinted with the cover colour.
- A real **3D page flip** around the binding, with perspective, shading and prefetching of neighbouring spreads.
- Jump to any date with a month calendar (days with content are marked), to any page number in notebooks, or with the keyboard (`←` / `→`).
- Opening animation: the cover swings open, a glow fills the screen, and the page is revealed. Click or `Esc` skips it.

**Writing**
- Debounced autosave; pending edits are flushed when a page is left.
- "Confirm" turns a section into handwriting: words fade in, a pencil follows them, with a pencil-on-paper sound (mutable).
- Drafts are kept when the session expires and restored after logging in again; save failures and out-of-date pages are surfaced instead of failing silently.

**Search**
- Full-text search inside an agenda with typo tolerance, accent-insensitive matching and highlighted snippets; selecting a result flips the book to that page.

**Accounts and security**
- Email and password accounts; short-lived JWT access tokens with rotating, revocable refresh tokens in an `httpOnly` cookie.
- Strict per-user data isolation on every endpoint.

**Accessibility and resilience**
- `prefers-reduced-motion` is honoured (no flip, glow, pencil or sound).
- A 2D cover fallback when WebGL is unavailable.
- Keyboard-reachable controls with visible focus, labelled icon buttons, and text contrast checked against WCAG AA.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Backend | Java 21, Spring Boot 4.1, Spring Security, Spring Data JPA (Hibernate), Maven |
| Database | PostgreSQL 16, Flyway migrations, JSONB for section data |
| Search | Meilisearch 1.54 (via a database outbox) |
| Auth | JWT (jjwt 0.12), BCrypt, rotating refresh tokens |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| 3D and animation | three.js, React Three Fiber, drei, GSAP |
| Tests | JUnit 5, MockMvc, Testcontainers (PostgreSQL, Meilisearch); Vitest, Testing Library |
| Tooling | Docker Compose, ESLint |

---

## Architecture

```text
┌────────────────────┐   HTTPS/JSON    ┌───────────────────────┐        ┌──────────────┐
│  Next.js frontend  │ ──────────────▶ │  Spring Boot backend  │ ─────▶ │ PostgreSQL   │
│  (React, WebGL)    │ ◀────────────── │  controller/service/  │        └──────────────┘
└────────────────────┘                 │  repository/domain    │        ┌──────────────┐
                                       │                       │ ─────▶ │ Meilisearch  │
                                       └───────────────────────┘        └──────────────┘
```

### Backend

A layered architecture with DTOs kept separate from entities:

`controller` → `service` → `repository` → `domain`, plus `dto`, `config` (security, JWT, CORS), `job` (scheduled cleanup) and `search` (Meilisearch client, indexer, outbox).

- **Ownership is enforced in the query**, never after loading: a resource that belongs to someone else returns `404`, which does not reveal that it exists.
- **Pages are created on first access**, from the agenda's current structure, with a race-safe `INSERT … ON CONFLICT DO NOTHING`.
- **Structure changes** reconcile all existing pages in a single transaction using set-based SQL.
- **Search indexing** uses a transactional outbox: every relevant change writes a row in the same transaction; a scheduled worker batches the rows, rebuilds one document per page and sends it to Meilisearch. If Meilisearch is down, work waits in the queue. Searches always go through the backend, which applies the user and agenda filter; the frontend never talks to Meilisearch.

### Data model

| Table | Purpose |
| --- | --- |
| `users` | Accounts (email, BCrypt password hash) |
| `agendas` | Base template, structure template (JSONB), cover theme |
| `pages` | A date **or** a page number (enforced by a check constraint and partial unique indexes) |
| `sections` | Typed section instance with its data (JSONB) and order |
| `refresh_tokens` | Hashed refresh tokens, grouped in families for reuse detection |
| `search_outbox` | Pending search-index work |

### Frontend

- **App Router** pages for the home list, authentication, agenda creation, summary, structure editor, and the book (`/agendas/{id}/book?date=…` or `?page=…`).
- **The book** is a single mounted component: spreads are fetched in ranges, neighbouring spreads are prefetched, and a GSAP timeline turns a leaf made of a live front page and a back face, so edits in progress are never lost during a flip.
- **Authentication client:** `authFetch` attaches the access token, renews it once on `401` using a Web Lock so concurrent requests and tabs share a single refresh, and falls back to the login page (keeping unsaved drafts) when the session is gone.
- **Design system:** semantic Tailwind tokens (`paper`, `ink`, `accent`…), Nunito for the interface, Patrick Hand for handwriting, one light, pastel theme.

---

## Getting started

### Prerequisites

- **Java 21**
- **Node.js 20.9 or newer** (developed on Node 24)
- **Docker** with Docker Compose (PostgreSQL, Meilisearch and the backend tests)
- Git

### 1. Clone and start the infrastructure

```bash
git clone <repository-url> nestly
cd nestly
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
docker compose up -d
```

This starts PostgreSQL (host port `5433`) and Meilisearch (`7700`). The values in `.env.example` are for local development only.

### 2. Run the backend

```bash
cd nestly-backend
./mvnw spring-boot:run      # Windows: .\mvnw.cmd spring-boot:run
```

The backend listens on `http://localhost:8080`. Flyway creates the schema on first start. The default development values already match the Compose services; to override anything, copy `nestly-backend/.env.example` to `nestly-backend/.env` (it is loaded automatically and ignored by Git).

On first start the search index is created and filled with any existing content.

### 3. Run the frontend

```bash
cd nestly-frontend
npm install
npm run dev
```

Open `http://localhost:3000`, register an account and create your first agenda.

---

## Configuration

### Backend (environment variables or `nestly-backend/.env`)

| Variable | Default (dev) | Description |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `dev` | `dev` or `prod` |
| `DATABASE_URL` | (dev: built in) | JDBC URL; required in `prod` |
| `DB_USERNAME`, `DB_PASSWORD` | `nestly` | Database credentials; required in `prod` |
| `JWT_SECRET` | dev-only value | HMAC secret, at least 32 characters; **required in `prod`** |
| `JWT_EXPIRATION_MINUTES` | `15` | Access-token lifetime |
| `REFRESH_TOKEN_EXPIRATION_DAYS` | `30` | Refresh-token lifetime |
| `REFRESH_COOKIE_SECURE` | `false` (`true` in `prod`) | Sets the `Secure` flag on the refresh cookie |
| `REFRESH_TOKEN_CLEANUP_CRON` | `0 0 3 * * *` | When expired refresh tokens are purged |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated list of allowed origins |
| `MEILISEARCH_URL` | `http://localhost:7700` | Required in `prod` |
| `MEILISEARCH_API_KEY` | dev master key | Required in `prod` |
| `MEILISEARCH_INDEX` | `pages` | Index name |
| `SEARCH_SYNC_INTERVAL_MS` | `3000` | How often the outbox is processed |

### Frontend

| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Base URL of the backend |

### Infrastructure (`.env` in the repository root)

`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `MEILI_MASTER_KEY` (at least 16 characters), `MEILI_PORT`.

---

## API overview

All endpoints except those marked public require `Authorization: Bearer <access token>`.

| Method and path | Description |
| --- | --- |
| `POST /api/auth/register` | Create an account (public) |
| `POST /api/auth/login` | Log in; returns an access token and sets the refresh cookie (public) |
| `POST /api/auth/refresh` | Rotate the refresh token and issue a new access token (public, uses the cookie) |
| `POST /api/auth/logout` | Revoke the session (public, uses the cookie) |
| `GET /api/auth/me` | Current user |
| `GET /api/agendas`, `POST /api/agendas` | List / create agendas |
| `GET`, `PUT`, `DELETE /api/agendas/{id}` | Read / rename and recolour / delete |
| `PATCH /api/agendas/{id}/structure-template` | Change the page structure (retroactive; `409` when data would be lost without `confirmDataLoss`) |
| `GET /api/agendas/{id}/pages/by-date-range?from&count` | Pages for a range of days (created on demand, at most 7) |
| `GET /api/agendas/{id}/pages/by-number-range?from&count` | Pages for a range of numbers (notebooks) |
| `GET /api/agendas/{id}/pages/days-with-content?month=YYYY-MM` | Days of a month that hold content |
| `PATCH /api/agendas/{id}/pages/{pageId}/sections/{sectionId}` | Save a section's data |
| `GET /api/agendas/{id}/search?q=` | Full-text search with highlighted segments |
| `GET /actuator/health` | Health check (public) |

---

## Testing and quality

```bash
# Backend: 34 integration tests against real PostgreSQL and Meilisearch containers (Docker must be running)
cd nestly-backend
./mvnw test

# Frontend: 55 unit and component tests, linting and type-checking
cd nestly-frontend
npm test
npm run lint
npx tsc --noEmit
```

The backend suite uses Testcontainers rather than an in-memory database, because the schema relies on PostgreSQL features (JSONB, partial unique indexes, `gen_random_uuid()`). It covers authentication and refresh-token rotation and reuse detection, per-user isolation on every endpoint, retroactive structure changes and data-loss protection, concurrent page creation, and search indexing and querying. The frontend suite covers date handling across daylight-saving changes, autosave semantics, token renewal under concurrent requests, save-result mapping and the search panel.

---

## Project structure

```text
nestly/
├── docker-compose.yml          PostgreSQL and Meilisearch for development
├── .env.example                Infrastructure variables
├── nestly-backend/
│   └── src/
│       ├── main/java/com/nestly/backend/
│       │   ├── config/         Security, JWT filter, CORS, refresh cookie
│       │   ├── controller/     REST controllers
│       │   ├── domain/         JPA entities and enums
│       │   ├── dto/            Request and response types
│       │   ├── job/            Scheduled maintenance
│       │   ├── repository/     Spring Data repositories
│       │   ├── search/         Meilisearch client, outbox, indexer, search service
│       │   └── service/        Business logic
│       ├── main/resources/db/migration/   Flyway migrations
│       └── test/               Integration tests (Testcontainers)
└── nestly-frontend/
    ├── public/sounds/          Pencil sound and its licence
    └── src/
        ├── app/                Routes (home, auth, agendas, structure, book)
        ├── components/         ui, cover, spread, sections, handwriting, opening, structure
        └── lib/                API client, auth, dates, autosave, search, hooks
```

---

## Key design decisions

| Decision | Rationale and trade-off |
| --- | --- |
| Monorepo, Maven | One repository to clone and review; simpler than separate repositories at this size |
| Section data as JSONB | New section types do not require schema changes; the cost is validation in application code |
| BCrypt for passwords | Mature and sufficient here; Argon2 would be stronger but adds a native dependency |
| Access token in `localStorage`, refresh token in an `httpOnly` cookie | Simple client and cross-tab sharing for the short-lived token; the long-lived credential is not readable by scripts. CSRF protection is disabled because the access token is never sent as a cookie |
| Refresh-token rotation with family revocation | A stolen token that is reused is detected and the whole session is revoked |
| Search through a database outbox | Search stays consistent with the data and survives Meilisearch outages, at the cost of a few seconds of delay |
| Two-page spread with a rigid 3D leaf | Real page turning that keeps editable content, instead of a curl library built for static content |
| Retroactive structure changes | Every page always matches the current template; removing populated sections requires confirmation |
| One light theme | A single, coherent pastel identity on every device; no dark mode by design |

---

## Known limitations

- **Production deployment is not set up yet:** no container images for the application, CI pipeline, HTTPS configuration or secret management.
- The refresh cookie is `SameSite=Lax`; hosting the frontend and backend on different registrable domains requires `SameSite=None; Secure`.
- Search is eventually consistent (a few seconds), and accepted Meilisearch tasks that fail later are not reported.
- A lost response to a refresh request makes the next refresh look like token reuse and ends the session.
- No password recovery, email verification or social login.
- No offline mode.
- Only solid-colour cover themes are available.

---

## Roadmap

- Containerised deployment, HTTPS, secret management and continuous integration.
- Drag-to-flip gesture for the pages.
- Patterned cover themes (floral, dots, stripes) generated procedurally.
- Optional hardening: an automated end-to-end suite, search across all agendas.

---

## Credits and licensing

- Pencil sound: *“Writing with pencil – energetic”* by fthgurdy, [Freesound](https://freesound.org/people/fthgurdy/sounds/376706/), licensed CC0 1.0.
- Fonts: Nunito and Patrick Hand (SIL Open Font License), served through `next/font`.
- Built with Spring Boot, Next.js, three.js, GSAP and Meilisearch, each under its own open-source licence.

This repository does not have a licence yet; until one is added, all rights are reserved by the author.