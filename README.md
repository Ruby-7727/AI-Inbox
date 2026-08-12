# AI Inbox

AI Inbox is an AI Product Manager portfolio prototype that turns screenshots into structured items and suggested actions.

This repository contains a clickable frontend prototype with screenshot selection, preview, validation, upload progress, processing, and structured Zhipu AI vision analysis. Authentication and persistence are not implemented yet.

## Product scope

The reference screens define one primary journey:

1. A user uploads, drops, or pastes a screenshot.
2. AI Inbox shows a stable multi-step processing state.
3. The result is classified as an event, product, place, task, or knowledge item.
4. High-confidence results expose suggested actions immediately.
5. Low-confidence or incomplete fields require confirmation before an action.
6. Items remain discoverable through Inbox, Saved, To Do, and semantic Search views.

The first implementation should optimize this happy path and its recovery states before adding integrations or advanced customization.

## Application architecture

- **Next.js App Router** owns pages, layouts, server rendering, and API routes.
- **UI modules** are split into layout, inbox, cards, actions, and shadcn-style primitives.
- **Supabase** will own anonymous users, PostgreSQL records, and private screenshot storage.
- **Zhipu AI GLM-4.5V** is called only from server-side API routes; credentials never enter the browser bundle.
- **Vercel** will host the single Next.js application. Processing should remain request-based and lightweight enough for free-tier limits.

Suggested data flow:

`browser upload -> API analysis route -> Zhipu GLM-4.5V structured result -> review/detail screen`

## Route map

- `/inbox` — recent recognized items and empty state
- `/saved` — saved products, places, and knowledge
- `/todo` — tasks and events grouped by status/time
- `/search` — semantic retrieval across recognized content
- `/analyze` — upload processing, result review, and confidence handling
- `/api/analyze` — validates screenshot uploads and returns a runtime-validated GLM-4.5V analysis

## Module boundaries

- `components/ui` — generic shadcn-style primitives
- `components/layout` — application shell and navigation
- `components/inbox` — inbox-only compositions
- `components/cards` — reusable recognized-item cards
- `components/actions` — suggested-action controls
- `lib/supabase` — browser/server clients and repositories
- `lib/ai` — prompts, schemas, and server-only analysis orchestration
- `types` — shared domain contracts

## Design foundation

The global tokens follow the supplied prototypes: bright blue primary actions, cool near-white canvas, white cards, blue-gray borders, restrained shadows, rounded 12px surfaces, and high-contrast neutral typography. Tokens are defined in `app/globals.css` and exposed to Tailwind utilities.

## Local setup

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and set `ZHIPU_API_KEY` before analyzing screenshots. The active model is `glm-4.5v`.

Verify the response contract without making API calls:

```bash
pnpm test:analysis-contract
```

To run the five-category live Vision evaluation, add the screenshots described in `tests/fixtures/README.md`, start the app with the API key configured, and run:

```bash
pnpm test:ai
```
