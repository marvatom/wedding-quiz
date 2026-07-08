# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

The code lives in the GitHub repo **[marvatom/wedding-quiz](https://github.com/marvatom/wedding-quiz)**. The scaffold is committed — see Working notes for build commands and framework details.

## Repository & deployment

- **Canonical repo:** `marvatom/wedding-quiz` on GitHub. This is where code, tooling, and content live.
- **Claude owns the full lifecycle via the GitHub MCP server.** Scaffolding code, committing, opening/merging PRs, configuring the Pages source, and triggering/verifying the deploy all happen through GitHub MCP tools — not by asking the user to run git or click through the GitHub UI. The local working directory may be used for drafting, but GitHub is the source of truth.
- **Publishing target: GitHub Pages** for this repo, served at **`https://marvatom.github.io/wedding-quiz/`** (a project page, so everything lives under the `/wedding-quiz/` subpath — see the base-path note below).
- Prefer a **GitHub Actions Pages workflow** (build step → `actions/deploy-pages`) over the legacy "deploy from branch" setting, since the design expects a build step that transforms YAML→JSON and emits QR URLs. Configure the Pages source to "GitHub Actions" through the MCP.

## What this is

A single-purpose static web app: a **wedding quiz**. Guests scan a QR code (printed on tables, favors, etc.) with their phone, which opens a URL for one specific question. The question renders, the guest picks from multiple choices, submits, and sees whether they were right **immediately**. That's the whole product.

## Hard constraints (these shape every decision)

- **Fully static, no backend.** Deployed on **GitHub Pages** at `https://marvatom.github.io/wedding-quiz/`. There is no server, no database, no API. All logic runs client-side in the browser. Nothing persists between sessions and no answers are collected or stored anywhere.
- **Questions and answers live in a static YAML file.** This is the single source of truth for quiz content. Each question has a stem, multiple answer choices, and a marker for which choice(s) are correct — **at least one** correct answer per question, possibly more than one.
- **URLs address questions by an opaque hash, not by index.** A QR code encodes a URL whose hash maps to a specific question. Guests must not be able to guess `?q=1`, `?q=2`, … and walk the whole quiz, and the mapping should not reveal the question order. The hash → question resolution happens client-side (the YAML, or a generated index derived from it, is loaded in the browser).
- **Config is read only at generation time, never live.** The YAML content is consumed once by the build step, which bakes it into the generated site. The deployed site does not re-read or fetch the YAML at runtime. Any change to the quiz content means **regenerating and redeploying** the web — there is no live/hot config.
- **Simple, image-free design that renders reliably on mobile.** Guests view this on phones, so the UI must be a clean, text-only, responsive layout — **no images, photos, or icon assets**. Prioritize legibility, large touch targets, and reliable rendering across mobile browsers over any visual flourish.

## Architecture to build

Because there's no backend, expect roughly three concerns:

1. **Content** — the YAML file(s) defining questions, choices, and correct answers. Keep this human-editable; the couple/organizer edits quiz content here, not in code.
2. **Hash mapping** — a stable, non-sequential identifier per question that the QR URL carries. Decide whether hashes are precomputed and stored alongside each question in the YAML, or derived. Whatever the scheme, there must be a **generator step** that produces the QR-code URLs for every question (organizers print these), and the runtime must resolve an incoming hash back to its question.
3. **Runtime UI** — loads the YAML (or a build-time-generated JSON index), resolves the URL hash to one question, renders choices, validates the submitted answer against the correct set (supporting multi-correct questions), and shows immediate feedback.

## Key implementation decisions

- **Framework choice is Claude's to make.** Pick an appropriate, well-supported static-site-generation approach for a tiny quiz — Claude selects the framework/tooling (a lightweight SSG or a minimal build script) rather than deferring the choice back to the user. Favor mature, low-maintenance tooling with good GitHub Pages support and no runtime backend. Record the actual choice and why in the Working notes once made.
- **YAML is consumed at build time only.** The build step parses the YAML, generates the site (one resolved page/state per question plus the hash index), and emits the QR-code URL list. The runtime ships no YAML parser and never fetches the config — this follows directly from the "config read only at generation time" constraint above.
- **GitHub Pages base path.** This deploys to a **project page** (`marvatom.github.io/wedding-quiz/`), so all asset and hash-route URLs must account for the `/wedding-quiz/` subpath — use relative paths or a configured base, never root-absolute (`/…`) paths. The generated QR-code URLs must include this subpath.

## Working notes

### Build commands
- `npm install` — install dependencies (first time or after package.json changes)
- `npm run build` — build site to `dist/` via Eleventy
- `npm run dev` — build and serve locally with live reload
- `npm run qr-urls` — print QR code URL for every question (run after build to get current URLs)

### Framework
**Eleventy (11ty) v3** with Nunjucks templates. Chosen because: native YAML `_data/` support, pagination API generates one HTML page per question at build time, zero runtime dependencies, good GitHub Pages + Actions support.

### Hash scheme
Question hashes are **derived at build time** — SHA-256 of the question stem, first 8 hex characters. Nothing is stored in the YAML. If you change a question stem, its URL changes and any printed QR codes for that question must be regenerated.

### Deploy workflow
File: `.github/workflows/deploy.yml`. Triggers on push to `main` and manually via `workflow_dispatch`. Build step runs `npm ci && npm run build` (output: `dist/`), deploy step uploads to GitHub Pages via `actions/deploy-pages@v4`. Pages source must be set to "GitHub Actions" in the repo settings.

### Content editing
Edit `src/_data/questions.yaml`. After any change: commit and push to `main` — the workflow auto-deploys. Run `npm run qr-urls` if question stems changed, then reprint any affected QR codes.

### Note on correct-answer visibility
The correct answer is baked into each question's HTML (needed for client-side validation with no backend). Guests who inspect page source can find it. The opaque URL hash prevents walking all questions, but a motivated guest could still find the answer by reading source. This is an accepted tradeoff for a fully static app.
