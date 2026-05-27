# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

We're building the app descriobed in @SPEC.md. Read that file foe general architectual tasks or to double-check the exact database structure, tech tack or application architecture.

Keep your replies extremly concise and focus on conveying the key information. No unecessary fluff, no long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

## Commands

```bash
bun run dev      # start dev server at http://localhost:3000
bun run build    # production build
bun run start    # start production server
bun run lint     # run ESLint
```

Use `bun` (not `npm` or `yarn`) for all package management.

## Environment

Copy `.env.example` to `.env.local` before running. Required vars:

- `BETTER_AUTH_SECRET` — must be 32+ characters
- `DB_PATH` — SQLite database path (e.g. `data/app.db`)

## Architecture

This is a **Next.js 16 App Router** project. All routes live under `app/` using the file-system router. The root layout (`app/layout.tsx`) wraps the entire app with Geist fonts and global CSS.

**Key dependencies and their roles:**
- **better-auth** — authentication (server-side, configured via env vars)
- **TipTap** (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`) — rich text editor
- **Zod v4** — schema validation
- **Tailwind CSS v4** — utility-first styling via PostCSS

**Path alias:** `@/` maps to the project root (e.g. `@/app/...`, `@/lib/...`).

**TypeScript** is strict mode. The `bun.lock` file is the source of truth for dependency versions.

## Testing in Browser

Before testing any routes, always check if the local server is running (`curl -s http://localhost:3000`). If it's not up, stop and ask the user to start it with `bun run dev`.
