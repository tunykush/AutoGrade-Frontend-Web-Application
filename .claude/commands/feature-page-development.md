---
name: feature-page-development
description: Workflow command scaffold for feature-page-development in AutoGrade-Frontend-Web-Application.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-page-development

Use this workflow when working on **feature-page-development** in `AutoGrade-Frontend-Web-Application`.

## Goal

Implements or updates a feature page in the application, often with related UI components.

## Common Files

- `src/app/*/page.tsx`
- `src/app/*/*/page.tsx`
- `src/components/*/*.tsx`
- `src/components/ui/*.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a page file under src/app/[feature]/page.tsx or nested route
- Create or update related UI components under src/components/[section] or src/components/ui
- Optionally update global styles or layout

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.