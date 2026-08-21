# DECISIONS

## What did I improve?

- Built the assignment as a full-stack product flow instead of a static mockup: React landing page, prompt composer, integration selector, ASP.NET Core API, OpenAI-backed generation, SSE streaming, and a rendered technical plan workspace.
- Made selected integrations part of the AI context by sending them from the client as `requestedIntegrations` and injecting them into the backend system prompt as connected integration context.
- Added a dummy integration catalog for Stripe, Shopify, Gmail, Slack, and Google Sheets with frontend fallback data so the landing page remains usable even if the API is unavailable during a local demo.
- Made the result screen display the actual AI model output instead of a locally generated technical-plan template.
- Kept the code organized by feature slices on both frontend and backend so the task stays understandable and easy to extend.


## Problems found and how I solved them

### 1. The frontend was not consistently connected to the deployed API

The first implementation used relative `/api/v1/...` requests, which worked when the React client and .NET API were served from the same origin, but failed when the frontend was deployed separately on Vercel and the backend lived on Railway.

I fixed this by centralizing URL resolution inside `src/client/src/shared/api/client.ts`. `apiFetch` and `streamApi` now resolve relative endpoints against `VITE_API_BASE_URL`, with the Railway backend URL as the production fallback. This keeps feature code clean and avoids hardcoding the backend URL in every hook or page.

### 2. CORS and Railway 502 looked like the same problem

The browser reported missing CORS headers, but the important clue was `502`. When Railway returns `502`, the ASP.NET app may not be running or reachable, so CORS middleware never gets a chance to add headers.

I fixed the deployment side by making the Docker runtime listen on Railway's dynamic `$PORT` instead of a fixed local port. I also made CORS configurable: if `Cors:AllowedOrigins` is provided, the API uses those origins; otherwise it allows any origin for the demo API flow. That made the API reachable from Vercel/local frontend environments without changing every frontend request.

### 3. Vite build failed on `import.meta.env`

After adding `VITE_API_BASE_URL`, TypeScript failed with `Property 'env' does not exist on type 'ImportMeta'`.

I fixed this by adding `src/client/src/vite-env.d.ts` with the Vite client type reference. This gives TypeScript the correct `ImportMetaEnv` shape during `npm run build`.

### 4. The AI response was too large to read as one block

The model response was being rendered as one large `rawContent` block. That made long architecture plans hard to navigate and gave the feeling that content was being eaten by the UI.

I added response sectioning in the frontend. The generated plan is now split into `Planning`, `Architecture`, and `Implementation` sections. The document workspace renders one section at a time with `Previous` and `Next` pagination, while still preserving the full `rawContent` for copy, export, and saving. Saved builds also support the same section pagination, including older saved plans that only have raw markdown.

### 5. Some responses stopped before the final section was complete

In longer generations, Groq could stop mid-section because the model hit its output-token limit. In the UI this looked like the response randomly stopped in the middle of an implementation step.

I fixed this in the backend by increasing Groq's `max_completion_tokens` default and reading the provider's `finish_reason` from the streaming response. If Groq reports `length`, the API automatically asks the model to continue the same section from the last generated excerpt. This continuation is bounded so it can recover incomplete sections without entering an infinite loop.

### 6. Integration context was too shallow

The client was correctly sending selected integration IDs such as `stripe`, `slack`, or `shopify`, but the AI prompt only received those IDs. That was not enough to make the generated plan deeply reflect each selected integration.

I fixed this by injecting full integration catalog metadata into the system prompt. For each selected integration, the backend now includes the display name, category, auth type, capabilities, business role, and documentation URL. The prompt explicitly instructs the model to use every selected integration in flows, APIs, data models, environment variables, webhook handling, and implementation code.

## What did I intentionally leave out?

- Real OAuth or API-key connection flows for the integrations. The task only requires integrations as AI context, not actual external service connectivity.
- User accounts, teams, billing, and permission models beyond lightweight demo save behavior.
- A full generated-project compiler/export pipeline. The app focuses on showing the AI response and technical plan rather than producing a production ZIP from generated code.
- Heavy observability, retries, rate limits, and prompt evaluation infrastructure. These are production needs, but too large for the intended two-hour task scope.
- Exhaustive automated test coverage. I prioritized the working vertical slice and kept the implementation small.

## What is the biggest production risk?

The biggest risk is the AI generation boundary: prompt injection, inconsistent model output, latency, token cost, and provider failure can all directly affect the user experience. Before production, I would add stricter response schemas, request tracing, rate limits, timeout and retry policies, cost guards, abuse detection, and tests that prove selected integrations reliably change the generated output.
