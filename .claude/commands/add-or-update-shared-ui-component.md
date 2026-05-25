---
name: add-or-update-shared-ui-component
description: Workflow command scaffold for add-or-update-shared-ui-component in AutoGrade-Frontend-Web-Application.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-shared-ui-component

Use this workflow when working on **add-or-update-shared-ui-component** in `AutoGrade-Frontend-Web-Application`.

## Goal

Adds or updates reusable UI components used across multiple pages.

## Common Files

- `src/components/ui/*.tsx`
- `src/components/ui/*.css`
- `src/components/*/*.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or modify files under src/components/ui/ or src/components/[category]/
- Optionally update stylesheets or related files
- Commit with a message referencing the component

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.