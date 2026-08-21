# Stunning Builder — AI Architecture & Build Engine

> Turn software ideas into implementation-ready technical build plans.

---

## Overview

**Stunning Builder** is an enterprise-grade AI architecture synthesis platform. It combines an editorial command-first frontend with a high-throughput .NET 10 Feature-Driven API, PostgreSQL persistence, and Redis real-time streaming.

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router.
- **Backend API**: ASP.NET Core (.NET 10) Minimal APIs, Feature-Driven vertical slices.
- **Database**: PostgreSQL with EF Core 10 & Npgsql.
- **Cache & Real-Time Bus**: Redis (StackExchange.Redis) Pub/Sub and caching.
- **AI Orchestration**: Groq or OpenAI chat models with Server-Sent Events (SSE) token streaming.

---


## Architecture

Stunning Builder is structured as a full-stack, feature-driven system. The frontend owns the product experience and document rendering, while the backend owns AI orchestration, integration context injection, persistence, health checks, and deployment/runtime concerns.

```text
Browser / Vercel Frontend
        |
        | HTTPS + SSE
        v
ASP.NET Core .NET 10 API / Railway
        |
        |-- AI Feature
        |   |-- builds the system prompt
        |   |-- injects selected integration context
        |   |-- streams Groq/OpenAI output with continuation handling
        |
        |-- Integrations Feature
        |   |-- exposes the supported catalog
        |   |-- stores app-level integration connections
        |
        |-- Apps Feature
        |   |-- saves generated build plans
        |   |-- stores plan metadata and raw markdown
        |
        |-- Builds Feature
        |   |-- simulates async build execution
        |   |-- publishes progress through Redis when available
        |
        |-- PostgreSQL
        |   |-- apps
        |   |-- generation sessions
        |   |-- integration connections
        |   |-- app builds
        |
        |-- Redis
            |-- health checks
            |-- build progress pub/sub
```

### Frontend architecture

The React client is organized around product features instead of generic technical folders:

```text
src/client/src
|-- app
|   |-- providers
|   |-- router
|
|-- features
|   |-- auth
|   |-- builder
|   |-- builds
|   |-- generation
|   |-- integrations
|
|-- shared
    |-- api
    |-- components
    |-- hooks
    |-- icons
    |-- utils
```

Important frontend responsibilities:

- `shared/api/client.ts` centralizes API URL resolution for both JSON requests and SSE streaming.
- `builder` owns the landing page, prompt composer, and selected integration context.
- `integrations` loads the integration catalog and renders the command-palette style picker.
- `generation` streams tokens, builds a `GeneratedPlan`, splits markdown into document sections, and renders paginated output.
- `builds` loads saved plans from the API/local fallback and reuses the same document reader for saved output.

### Backend architecture

The ASP.NET Core API uses vertical feature slices:

```text
src/StunningBuilder.Api
|-- Common
|   |-- Database
|   |-- Errors
|   |-- Health
|   |-- Redis
|   |-- Routing
|
|-- Features
    |-- Ai
    |-- Apps
    |-- Builds
    |-- Integrations
```

Important backend responsibilities:

- `Common/Routing` maps all versioned `/api/v1` endpoints.
- `Common/Database` resolves Railway/local PostgreSQL connection strings.
- `Common/Redis` resolves Railway/local Redis connection strings and registers health checks.
- `Features/Ai` owns generation DTOs, SSE endpoints, Groq/OpenAI routing, prompt construction, and continuation handling.
- `Features/Integrations` owns the supported integration catalog and app integration connections.
- `Features/Apps` stores saved app/build-plan metadata.
- `Features/Builds` simulates background build execution and optional Redis progress publishing.

### Generation flow

1. The user writes a product idea in the prompt composer.
2. The user selects context integrations such as Stripe, Slack, Shopify, Gmail, or Google Sheets.
3. The frontend sends:

```json
{
  "prompt": "Build a cooking SaaS...",
  "template": "saas",
  "framework": "nextjs",
  "requestedIntegrations": ["stripe", "slack", "shopify"]
}
```

4. The backend builds a system prompt using the framework, template, app metadata, and selected integration context.
5. For every selected integration, the backend injects catalog details: name, category, auth type, capabilities, business role, and documentation URL.
6. The API streams the response through `/api/v1/generate/stream`.
7. The frontend accumulates the stream into `rawContent`.
8. The frontend splits the markdown into paginated sections: Planning, Architecture, and Implementation.
9. The full markdown remains available for copy, export, and saved builds.

### Streaming and response completeness

Large AI answers can stop early when the provider reaches its output-token limit. To reduce incomplete plans:

- Groq requests include `max_completion_tokens`.
- The API reads the provider `finish_reason`.
- If Groq returns `length`, the API automatically sends a continuation prompt for the same section.
- Continuation is bounded to avoid infinite loops.
- The frontend paginates the final document so long responses stay readable without losing the full `rawContent`.

### Saved builds flow

Generated plans can be saved through `/api/v1/apps`. The saved payload keeps both metadata and the complete generated plan:

```json
{
  "name": "Cooking SaaS Starter",
  "description": "AI model response for...",
  "template": "saas",
  "framework": "nextjs",
  "settingsJson": "{ integrations, plan }"
}
```

If the API is unavailable during a demo, the frontend falls back to local storage so the user can still save and reopen plans.

---

## 🚀 Quick Start

### 1. Start the Backend API (.NET 10)
```bash
dotnet user-secrets set "Groq:ApiKey" "your_groq_key" --project "src/StunningBuilder.Api/StunningBuilder.Api.csproj"
dotnet run --project "src/StunningBuilder.Api/StunningBuilder.Api.csproj" --urls "http://localhost:5176"
```

You can alternatively set the `GROQ_API_KEY` environment variable before starting the API.
- **API Endpoint**: `http://localhost:5176`
- **Scalar Interactive Docs**: `http://localhost:5176/scalar/v1`
- **Health Checks**: `http://localhost:5176/health`

### 2. Start the Frontend Client (React)
```bash
cd src/client
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🛠 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Live PostgreSQL and Redis health status |
| `GET` | `/api/v1/integrations` | Supported ecosystem connectors (Stripe, Shopify, Gmail, Slack, Sheets) |
| `POST` | `/api/v1/generate/stream` | Server-Sent Events (SSE) technical plan streaming |
| `GET` | `/api/v1/apps` | List all saved applications and build plans |
| `POST` | `/api/v1/apps` | Create a new app or save an architectural plan |
| `GET` | `/api/v1/apps/{id}/integrations` | Manage third-party credentials and webhook settings |
| `POST` | `/api/v1/apps/{id}/builds` | Trigger asynchronous background build simulation |
| `GET` | `/api/v1/apps/{id}/builds/{buildId}/download` | Download generated project ZIP archive |

---

## 🚢 Docker Deployment

```bash
docker-compose up --build
```

## Production configuration notes

For a hosted frontend, set the client API base URL at build time:

```bash
VITE_API_BASE_URL=https://stunningio-task-production.up.railway.app
```

For the Railway backend, the important runtime variables are:

```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
GROQ_API_KEY=...
Groq__DefaultModel=openai/gpt-oss-120b
Groq__MaxCompletionTokens=4096
```

The streaming generation endpoint returns one complete technical plan, but the UI paginates it into:

- Planning
- Architecture
- Implementation

The full markdown response is still preserved in `rawContent` for copy, export, and saved builds.

