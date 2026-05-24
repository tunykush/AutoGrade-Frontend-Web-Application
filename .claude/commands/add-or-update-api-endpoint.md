---
name: add-or-update-api-endpoint
description: Workflow command scaffold for add-or-update-api-endpoint in AutoGrade-Frontend-Web-Application.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-api-endpoint

Use this workflow when working on **add-or-update-api-endpoint** in `AutoGrade-Frontend-Web-Application`.

## Goal

Adds new API endpoints or updates existing ones for backend functionality.

## Common Files

- `src/app/api/*/route.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or modify a file under src/app/api/[endpoint]/route.ts
- Optionally update related files or add more endpoints in the same commit

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.