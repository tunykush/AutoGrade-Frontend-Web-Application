---
name: add-or-update-api-endpoint
description: Workflow command scaffold for add-or-update-api-endpoint in AutoGrade-Frontend-Web-Application.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-api-endpoint

Use this workflow when working on **add-or-update-api-endpoint** in `AutoGrade-Frontend-Web-Application`.

## Goal

Adds or updates one or more API endpoint routes for new backend functionality.

## Common Files

- `src/app/api/*/route.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or modify files under src/app/api/[endpoint]/route.ts
- Optionally add related files for new endpoints (e.g., tests, types)
- Commit with a message referencing routes, fixes, or additions

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.