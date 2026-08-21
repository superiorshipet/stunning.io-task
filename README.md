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
Groq__MaxCompletionTokens=8192
```

The streaming generation endpoint returns one complete technical plan, but the UI paginates it into:

- Planning
- Architecture
- Implementation

The full markdown response is still preserved in `rawContent` for copy, export, and saved builds.

