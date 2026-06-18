# Repository Guidelines

## Project Structure & Module Organization

This repository stores AI-assisted learning material, not an application runtime. `README.md` describes the learning goal. `.learn/topics/<topic-slug>/state.json` is the source of truth for progress; `knowledge-map.md` is generated from it. Session notes live in `.learn/topics/<topic-slug>/sessions/<domain-slug>/`, and hands-on exercises live in `.learn/topics/<topic-slug>/exercises/<concept-slug>/`. Local Codex skills and scripts live under `.codex/skills/`. The Vue source repository is expected as a sibling checkout at `/Users/naldomac/Projects/vuejs/core`, not vendored into this repo.

## Build, Test, and Development Commands

There is no package-level build command. Use the learning scripts directly:

- `node .codex/skills/learn-anything-status/scripts/status.mjs --locale zh-CN .learn/topics/vuejs3-source` prints the current learning status.
- `node .codex/skills/learn-anything-explain/scripts/render.mjs .learn/topics/vuejs3-source` validates `state.json` and regenerates `knowledge-map.md`.
- `node .learn/topics/vuejs3-source/exercises/monorepo-packages/starter-round4.mjs` runs a specific exercise test file.

## Coding Style & Naming Conventions

Use Markdown for learning sessions and exercise guides. Keep session filenames descriptive and dated, for example `共享工具与辅助-2026-06-16.md`. Use 2-space indentation in JSON and JavaScript, ESM syntax, `node:` built-in imports, and no semicolons in `.mjs` exercise files. User-facing learning content is usually Simplified Chinese; keep commands, APIs, package names, and error output in English.

## Testing Guidelines

After editing `state.json`, always run the relevant `render.mjs` command to validate schema and refresh generated output. After editing an exercise starter, run that file with Node and confirm the expected success message. Do not treat `knowledge-map.md` as manually maintained; regenerate it from `state.json`.

## Commit & Pull Request Guidelines

Follow the existing Chinese Conventional Commit style, such as `chore: 完成 Vue 包结构进阶练习`. Before committing, check `git status --short` and avoid reverting unrelated user changes. Pull requests should summarize the learning topic changed, list commands run, mention any generated files, and note whether external source paths such as `/Users/naldomac/Projects/vuejs/core` are required.

## Security & Configuration Tips

Do not commit `node_modules/`, build output, logs, `.env*`, or editor artifacts. Keep external repositories as sibling checkouts instead of nested Git repositories.
