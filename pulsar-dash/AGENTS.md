# AGENTS.md - Agentic Coding Guidelines

## Project Overview
This is a Next.js 16 application with TypeScript, Tailwind CSS 4, and Radix UI components. It uses the App Router architecture.

## Package Manager
**Always use pnpm instead of npm** for package management.

## Workflow Rules

### Commit Strategy
- Complete one area of work before starting another
- Commit after finishing each area, even if multiple areas were requested
- Do not batch multiple unrelated changes into one commit

### Commit Message Format
```
[area]: Summary of the change

Description of what the change is, what problem it solves, and any relevant context.
```

Example:
```
vitest: Add Vitest testing framework

- Install vitest, @testing-library/react, jsdom dependencies
- Create vitest.config.ts with jsdom environment
- Add test scripts to package.json
- Create test/setup.ts for test utilities
```

Areas: `vitest`, `frontend`, `backend`, `api`, `websocket`, `ui`, `docs`, `deps`, etc.

## Commands

### Development
```bash
pnpm dev      # Start development server at http://localhost:3000
pnpm build    # Build for production
pnpm start    # Start production server
```

### Linting
```bash
pnpm lint     # Run ESLint on entire project
```

### Type Checking
```bash
pnpm typecheck # Run TypeScript compiler check (strict mode enabled)
```

### Testing
```bash
pnpm test        # Run tests in watch mode
pnpm test:run    # Run tests once
pnpm test:watch  # Run tests in watch mode
pnpm test:coverage # Run tests with coverage report
```

## Code Style Guidelines

### File Organization
- App Router pages: `app/` directory with `page.tsx`, `layout.tsx`
- React components: `components/ui/` for reusable components
- Utilities: `lib/utils.ts` for shared utilities
- Use `@/` path alias for imports (configured in tsconfig.json)

### TypeScript
- Strict mode is enabled in tsconfig.json
- Always type function parameters and return values
- Use `React.ComponentProps<"element">` for native HTML element props
- Use explicit type annotations rather than `any`

```typescript
// Good
function Input({ className, type, ...props }: React.ComponentProps<"input">)

// Avoid
function Input(props: any)
```

### Component Patterns
- Use functional components with arrow functions or `function` keyword
- Export components as named exports alongside their variants/utilities
- Use `data-slot` attributes for component identification
- Use `data-variant` and `data-size` for variant styling

```typescript
function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  )
}
```

### Styling with Tailwind CSS
- Use `cn()` utility from `@/lib/utils` to merge Tailwind classes
- Use design tokens: `bg-primary`, `text-muted-foreground`, `border-input`, etc.
- Use `dark:` prefix for dark mode styles
- Use `aria-invalid:` for error states
- Components use `rounded-none` (no border-radius by default)

```typescript
import { cn } from "@/lib/utils"

className={cn(
  "bg-background border-input focus-visible:ring-ring",
  className
)}
```

### Variants with class-variance-authority
- Define variants using CVA for reusable component variants
- Export both the component and the variants object

```typescript
const buttonVariants = cva("base classes", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
})
```

### Imports
- Order imports: external libraries → React → internal utilities → components
- Use path alias `@/` for internal imports
- Use `type` keyword for type-only imports

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"
```

### Naming Conventions
- Components: PascalCase (`Button`, `CardHeader`)
- Functions/variables: camelCase (`buttonVariants`, `cn`)
- Files: kebab-case for config, PascalCase for components
- CSS classes in strings: Tailwind conventions

### Error Handling
- Use React's error boundary patterns for component errors
- Validate props with TypeScript types
- Handle edge cases in component props with defaults

### Dark Mode
- Use `next-themes` with `ThemeProvider` component
- Use `dark:` prefix for dark mode styles
- Use design token colors that support both modes

### Accessibility
- Always include `aria-invalid` for form validation states
- Use proper `data-slot` attributes for component identification
- Include focus styles with `focus-visible:ring-*`
- Use Radix UI primitives for accessible interactive components
