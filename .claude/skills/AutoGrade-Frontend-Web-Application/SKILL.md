```markdown
# AutoGrade-Frontend-Web-Application Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns, coding conventions, and workflows used in the `AutoGrade-Frontend-Web-Application` repository. The project is a TypeScript-based web application built with Next.js, featuring modular UI components, API endpoints, authentication flows, and branding assets. By following these patterns, you can confidently contribute new features, update UI, manage authentication, and maintain consistency across the codebase.

---

## Coding Conventions

### File Naming

- **CamelCase** is used for file names.
  - Example: `userProfile.tsx`, `authContext.tsx`

### Import Style

- **Absolute imports** are preferred.
  - Example:
    ```typescript
    import { Button } from 'src/components/ui/Button';
    ```

### Export Style

- **Named exports** are used.
  - Example:
    ```typescript
    export function AuthProvider({ children }: Props) { ... }
    ```

### Component Structure

- Place shared or reusable UI components in `src/components/ui/`.
- Feature-specific components go under `src/components/[feature]/`.

### API Endpoints

- API routes are defined in `src/app/api/[endpoint]/route.ts`.
- Each endpoint has its own folder.

---

## Workflows

### Add or Update API Endpoint

**Trigger:** When you need to expose new backend functionality or fix API routes.  
**Command:** `/new-api-endpoint`

1. Create or modify a file under `src/app/api/[endpoint]/route.ts`.
2. Optionally update related files or add more endpoints in the same commit.

**Example:**
```typescript
// src/app/api/grades/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Fetch and return grades
  return NextResponse.json({ grades: [] });
}
```

---

### Feature Page Development

**Trigger:** When you want to add or enhance a user-facing page or feature.  
**Command:** `/new-feature-page`

1. Create or update a page file under `src/app/[feature]/page.tsx` or a nested route.
2. Create or update related UI components under `src/components/[section]` or `src/components/ui`.
3. Optionally update global styles or layout.

**Example:**
```tsx
// src/app/dashboard/page.tsx
import { DashboardHeader } from 'src/components/dashboard/DashboardHeader';

export default function DashboardPage() {
  return (
    <main>
      <DashboardHeader />
      {/* ... */}
    </main>
  );
}
```

---

### UI Component Enhancement

**Trigger:** When you want to introduce a new UI element or update the look/feel of existing components.  
**Command:** `/new-ui-component`

1. Create or modify files under `src/components/ui/`.
2. Optionally update CSS files under `src/components/ui/`.
3. Optionally update pages to use the new/updated component.

**Example:**
```tsx
// src/components/ui/Alert.tsx
export function Alert({ message }: { message: string }) {
  return <div className="alert">{message}</div>;
}
```

---

### Authentication Flow Update

**Trigger:** When you want to add, fix, or enhance authentication features.  
**Command:** `/update-auth-flow`

1. Modify files under `src/components/auth/`.
2. Modify or add API routes under:
   - `src/app/api/signin/route.ts`
   - `src/app/api/signout/route.ts`
   - `src/app/api/signup/route.ts`
3. Optionally update context or shared state in `src/context/AuthContext.tsx`.

**Example:**
```tsx
// src/components/auth/SignInForm.tsx
import { signIn } from 'src/app/api/signin/route';

export function SignInForm() {
  // handle sign-in logic
}
```

---

### Branding Logo Update

**Trigger:** When you want to update or add new logos or branding images.  
**Command:** `/update-logo`

1. Add or replace image files under `public/logos/`.
2. Optionally update references in UI components or pages.

**Example:**
```tsx
// src/components/ui/Logo.tsx
export function Logo() {
  return <img src="/logos/new-logo.svg" alt="App Logo" />;
}
```

---

## Testing Patterns

- **Test files** use the pattern `*.test.*` (e.g., `button.test.tsx`).
- **Testing framework** is not specified in the repository analysis.
- Place test files alongside the components or in a dedicated `__tests__` directory.

**Example:**
```typescript
// src/components/ui/Button.test.tsx
import { render } from '@testing-library/react';
import { Button } from './Button';

test('renders button', () => {
  render(<Button>Click me</Button>);
});
```

---

## Commands

| Command              | Purpose                                                |
|----------------------|--------------------------------------------------------|
| /new-api-endpoint    | Add or update an API endpoint                          |
| /new-feature-page    | Implement or update a feature page                     |
| /new-ui-component    | Add or enhance a shared UI component                   |
| /update-auth-flow    | Update authentication UI or API endpoints              |
| /update-logo         | Add or update branding assets (logos, images)          |
```
