# Coding Conventions

**Analysis Date:** 2026-10-08

## Naming Patterns

**Files:**
- Component files use `PascalCase` and descriptive names such as `src/components/Navbar.tsx`, `src/components/Header.tsx`, and `src/sections/Hero.tsx`.
- Feature group directories are named in `PascalCase` or lowercase nouns, as in `src/sections/HeroSection/` and `src/components/header/`.
- Hook and utility files use lower camel case in `src/hooks/useLenis.ts`, `src/hooks/useReducedMotion.ts`, and `src/lib/gsap.ts`.

**Functions:**
- React components are usually declared as `export default function Name()` or `export function Name()`; examples appear in `src/App.tsx`, `src/components/Navbar.tsx`, and `src/hooks/useHomeMotion.ts`.
- Hook names follow the `useX` convention, matching the React rules enforced by `src/.oxlintrc.json` and the `react/rules-of-hooks` lint rule.

**Variables:**
- Local constants and arrays use lower camel case, e.g. `const LINKS = [...]` in `src/components/header/DesktopNavigation.tsx` and `src/components/header/MobileNavigation.tsx`.
- Boolean flags are named as state-like toggles (for example `menuOpen` in `src/components/Navbar.tsx`).

**Types:**
- Prop object shapes are declared with PascalCase type aliases such as `type MobileNavigationProps = { ... }` in `src/components/header/MobileNavigation.tsx`.
- Inline object literals are kept local and simple rather than moved to separate DTO files.

## Code Style

**Formatting:**
- Files use single quotes for imports and string literals, with no semicolon termination, matching the default style in `src/App.tsx`, `src/main.tsx`, and `src/lib/lenis.ts`.
- JSX attributes are written in the standard React style and maintain one component per file when possible.
- The project relies on the default TypeScript + JSX formatting pattern rather than a dedicated Prettier config.

**Linting:**
- Linting is enabled through `oxlint` in `package.json` and configured in `src/.oxlintrc.json`.
- The active rules include `react/rules-of-hooks` and `react/only-export-components`, indicating a lightweight React-focused lint policy rather than a large custom rule set.

## Import Organization

**Order:**
1. Third-party modules such as `react`, `gsap`, and `lenis`
2. Internal relative imports from sibling or parent modules
3. Local helper imports from the same directory or feature subtree

**Examples:**
- `src/hooks/useLenis.ts` imports `useEffect` from `react`, then local modules using relative paths.
- `src/components/Navbar.tsx` imports `useState` from `react` and then feature-specific components from `./header/...`.
- `src/lib/gsap.ts` imports GSAP packages before exporting the shared setup helpers.

**Path Aliases:**
- A Vite alias for `@` is configured in `vite.config.ts`, but most app code still uses relative imports instead of alias-based imports.
- The alias exists for convenience but is not the dominant convention in the current codebase.

## Error Handling

**Patterns:**
- Defensive early returns are common in hooks and effects; examples include the guard in `src/hooks/useHomeMotion.ts` (`if (!main || reducedMotion) return`) and the `useLenis` effect in `src/hooks/useLenis.ts`.
- Cleanup is returned explicitly from effects to avoid stale listeners or repeated GSAP registrations.
- The app does not appear to use centralized error boundaries, logging-based exception handling, or explicit API error flows.

## Logging

**Framework:** console-based or none; no structured logger is present in the app.

**Patterns:**
- Logging is intentionally minimal; the codebase prefers local guards, effect cleanup, and animation state over runtime debugging output.
- Comments are used for subtle behavior explanations instead of logs when the logic is not obvious.

## Comments

**When to Comment:**
- Comments are used sparingly only to explain non-obvious animation or motion logic, as in the JSDoc block in `src/hooks/useLenis.ts` and the `src/lib/gsap.ts` helper comments.
- Routine UI code is left self-explanatory without inline documentation.

**JSDoc/TSDoc:**
- JSDoc appears only in a few utility/hook files, not throughout the codebase.
- The style is concise and implementation-focused rather than exhaustive API documentation.

## Function Design

**Size:**
- Components and hooks are generally small, focused, and created around a single feature or visual block.
- The project prefers composition over large multi-purpose components, as seen in `src/sections/HeroSection/components/HeroContent.tsx` and `src/sections/HeroSection/components/HeroMedia.tsx`.

**Parameters:**
- Props are passed as explicit objects or as semantically named values when a function is used only in one place.
- Configuration objects are kept close to the consuming component rather than abstracted into heavy config layers.

**Return Values:**
- Utility functions return values directly and do not rely on shared mutable state; cleanup functions are returned from effects when needed.

## Module Design

**Exports:**
- Default exports are common for page and section components, while special-purpose helpers use named exports.
- For example, `src/App.tsx` and `src/components/Navbar.tsx` default-export components, while `src/lib/gsap.ts` and `src/hooks/useHomeMotion.ts` expose named utilities.

**Barrel Files:**
- No index barrel files or central module exports were detected in the active app structure.
- The codebase favors direct file-to-file imports over barrel-based access patterns.

---

*Convention analysis: 2026-10-08*
