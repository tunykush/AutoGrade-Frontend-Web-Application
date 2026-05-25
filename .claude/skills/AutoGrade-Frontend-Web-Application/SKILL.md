```markdown
# AutoGrade-Frontend-Web-Application Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to contributing to the **AutoGrade-Frontend-Web-Application**, a TypeScript-based web application built with Next.js. It covers coding conventions, common workflows for adding features or updating the codebase, and best practices for testing. Whether you're adding API endpoints, building UI pages, or updating authentication, this guide will help you follow the repository's established patterns and maintain code consistency.

## Coding Conventions

### File Naming

- **CamelCase** is used for file and folder names.
  - Example: `authContext.tsx`, `userProfile.tsx`

### Import Style

- **Absolute imports** are preferred over relative imports.
  - Example:
    ```typescript
    import { AuthContext } from 'src/context/AuthContext';
    ```

### Export Style

- **Named exports** are used instead of default exports.
  - Example:
    ```typescript
    // Good
    export function LoginForm() { ... }

    // Bad
    export default LoginForm;
    ```

### Commit Messages

- Freeform style, typically around 39 characters.
- Prefixes are not enforced, but referencing the affected route, page, or feature is common.

## Workflows

### Add or Update API Endpoint

**Trigger:** When you need to add a new backend API endpoint or modify existing backend functionality.  
**Command:** `/new-api-endpoint`

1. Create or modify files under `src/app/api/[endpoint]/route.ts`.
2. Optionally, add related files such as tests or type definitions.
3. Commit your changes with a message referencing the route or feature.

**Example:**
```typescript
// src/app/api/grades/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Implementation here
  return NextResponse.json({ grades: [] });
}
```

---

### Add or Update Main UI Page

**Trigger:** When creating or significantly modifying a user-facing page.  
**Command:** `/new-ui-page`

1. Create or modify files under `src/app/[page]/page.tsx` or nested routes.
2. Optionally update layout files or supporting components.
3. Commit your changes with a message referencing the page or feature.

**Example:**
```tsx
// src/app/dashboard/page.tsx
import { Dashboard } from 'src/components/dashboard/Dashboard';

export function DashboardPage() {
  return <Dashboard />;
}
```

---

### Add or Update Shared UI Component

**Trigger:** When creating or improving a reusable UI component.  
**Command:** `/new-ui-component`

1. Create or modify files under `src/components/ui/` or `src/components/[category]/`.
2. Optionally update associated stylesheets.
3. Commit your changes with a message referencing the component.

**Example:**
```tsx
// src/components/ui/Button.tsx
export function Button({ children, ...props }) {
  return <button {...props}>{children}</button>;
}
```

---

### Update Authentication or Auth UI

**Trigger:** When changing authentication logic or its UI presentation.  
**Command:** `/update-auth`

1. Modify files under `src/components/auth/`.
2. Update related API routes (`src/app/api/signin/route.ts`, etc.).
3. Update context or state management if needed (e.g., `src/context/AuthContext.tsx`).
4. Commit your changes with a message referencing authentication.

**Example:**
```tsx
// src/components/auth/SignInForm.tsx
import { useContext } from 'react';
import { AuthContext } from 'src/context/AuthContext';

export function SignInForm() {
  // Implementation here
}
```

---

### Update Branding or Logo Assets

**Trigger:** When changing or adding branding or partner logos.  
**Command:** `/update-logo`

1. Add or modify files under `public/logos/`.
2. Commit your changes with a message referencing logos or branding.

**Example:**
```
public/logos/new-partner-logo.png
```

## Testing Patterns

- **Test file pattern:** `*.test.*`
- **Testing framework:** Not explicitly detected; check existing test files for framework clues.
- Place test files alongside the files they test or in a dedicated `__tests__` directory.
- Example test file: `Button.test.tsx`

## Commands

| Command             | Purpose                                                    |
|---------------------|------------------------------------------------------------|
| /new-api-endpoint   | Add or update an API endpoint route                        |
| /new-ui-page        | Add or update a main UI page                               |
| /new-ui-component   | Add or update a shared/reusable UI component               |
| /update-auth        | Update authentication logic or UI                          |
| /update-logo        | Add or update branding or logo assets                      |
```
