---
name: ui-component-enhancement
description: Workflow command scaffold for ui-component-enhancement in AutoGrade-Frontend-Web-Application.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /ui-component-enhancement

Use this workflow when working on **ui-component-enhancement** in `AutoGrade-Frontend-Web-Application`.

## Goal

Adds or updates UI components, often for shared visual elements or effects.

## Common Files

- `src/components/ui/*.tsx`
- `src/components/ui/*.css`
- `src/app/*/page.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or modify files under src/components/ui/
- Optionally update CSS files under src/components/ui/
- Optionally update pages to use the new/updated component

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.