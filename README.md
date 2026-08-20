# Stunning Builder — AI Architecture & Build Engine

> Turn software ideas into implementation-ready technical build plans.

---

## 🌟 Overview

**Stunning Builder** is an enterprise-grade AI architecture synthesis platform. It combines an editorial command-first frontend with a high-throughput .NET 10 Feature-Driven API, PostgreSQL persistence, and Redis real-time streaming.

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router.
- **Backend API**: ASP.NET Core (.NET 10) Minimal APIs, Feature-Driven vertical slices.
- **Database**: PostgreSQL with EF Core 10 & Npgsql.
- **Cache & Real-Time Bus**: Redis (StackExchange.Redis) Pub/Sub and caching.
- **AI Orchestration**: Official OpenAI SDK with Server-Sent Events (SSE) token streaming and offline fallback generator.

---

## 🚀 Quick Start

### 1. Start the Backend API (.NET 10)
```bash
dotnet run --project "src/StunningBuilder.Api/StunningBuilder.Api.csproj" --urls "http://localhost:5176"
```
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
