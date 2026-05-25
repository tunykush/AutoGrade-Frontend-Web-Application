---
name: add-or-update-main-ui-page
description: Workflow command scaffold for add-or-update-main-ui-page in AutoGrade-Frontend-Web-Application.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-main-ui-page

Use this workflow when working on **add-or-update-main-ui-page** in `AutoGrade-Frontend-Web-Application`.

## Goal

Adds or updates main UI pages, often for new features or major UI changes.

## Common Files

- `src/app/*/page.tsx`
- `src/app/*/*/page.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or modify files under src/app/[page]/page.tsx or nested routes
- Optionally update layout or supporting components
- Commit with a message referencing the page or feature

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.