# AccioPilot

AccioPilot coordinates AI-assisted engineering tasks while keeping execution isolated and approval explicit.

## Current foundation

- Strict TypeScript workspaces for shared contracts and domain rules.
- Centralized, version-checked task lifecycle transitions.
- Deterministic mock coding-agent adapter with cancellation checks and bounded-input contracts.
- Placeholder-only environment configuration in [.env.example](./.env.example).

## Development

```sh
npm install
npm run typecheck
npm test
```

The next implementation slice should add the API persistence boundary (MongoDB repositories, ownership checks, and append-only events) before provider integrations or UI work. No push, merge, deployment, shell endpoint, or external agent invocation is implemented by this foundation.

## API layout

The backend is organized by transport responsibility under [apps/api/src](./apps/api/src):

- `server.ts` starts the process; `app.ts` composes middleware and routers.
- `routes/` contains feature routers for auth, GitHub, projects, tasks, integrations, and runners.
- `middleware/` contains authentication, request IDs, validation, rate-limit, CSRF, and error-handler seams.
- `controllers/`, `presenters/`, and `sse/` are reserved for the persistence-backed review workflow.
