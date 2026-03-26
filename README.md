# Gettin' It Done

**Production URL**: [https://gettin-it-done.lovable.app](https://gettin-it-done.lovable.app)

Gettin' It Done is a modular task management application built with modern web technologies.

## Tech Stack

This project is built with:

- **Frontend:** React, Vite, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui, lucide-react
- **Date Manipulation:** date-fns
- **Backend & Auth:** Supabase (PostgreSQL, Authentication, Row Level Security)
- **Serverless:** Supabase Edge Functions (Deno)
- **Package Manager & Test Runner:** npm (for primary deps), Bun (for unit testing)

## Project Structure

The codebase is organized into modular directories under `src/`:

- `components/`: Reusable UI components.
- `contexts/`: React context providers (e.g., AuthContext, ThemeContext).
- `hooks/`: Custom React hooks.
- `integrations/`: Third-party service integrations.
- `lib/`: Utility functions (e.g., `task-utils.ts` for centralized task logic).
- `pages/`: Route components.
- `services/`: API and external service abstractions.
- `types/`: TypeScript type definitions.

Supabase Edge Functions are located in the `supabase/functions/` directory.

## Getting Started

### Prerequisites

- Node.js & npm (use `npm install --legacy-peer-deps` to avoid peer dependency conflicts).
- Bun (for testing).

### Installation

1. Clone the repository:
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. Install dependencies:
   ```sh
   npm install --legacy-peer-deps
   ```

### Running Locally

Start the development server with auto-reloading and an instant preview:

```sh
npm run dev
```

The development server typically runs on `http://localhost:5173`.

## Testing & Linting

We use Bun for running unit tests and ESLint for code quality.

**Run tests:**
```sh
bun test
```

**Run linter:**
```sh
npm run lint
```

## Performance & Best Practices

- **Array Methods:** Prioritize reducing array traversals. Consolidate multiple `.filter()` calls into a single loop when possible.
- **Supabase Bulk Updates:** Use `.upsert()` with an array of objects to minimize network roundtrips. Ensure arrays are chunked (e.g., chunks of 100) when using `.in()` queries to prevent URI length limits.
- **Row Level Security:** Include `user_id` in database operations (especially upserts to the `user_tasks` table) to comply with Row Level Security (RLS) constraints.
- **Edge Functions:** Must implement a restricted CORS policy validating the `Origin` header against an allowlist (including the production URL and localhost) and returning the `Vary: Origin` header.

## Deployment

Changes pushed to the main branch are automatically reflected in the production environment via Lovable. You can also manually publish through the Lovable interface.
