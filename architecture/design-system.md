# Domain: Design System

Theme setup, design tokens, shared UI primitives, and animation utilities for The Helm.

## Tech Stack

| Tool | Role |
|------|------|
| vanilla-extract | Zero-runtime, type-safe CSS-in-TypeScript |
| Sprinkles (vanilla-extract) | Utility-class API built from design tokens |
| Motion (Framer Motion) | Layout FLIP, AnimatePresence, variants, Typewriter |
| CSS @keyframes | Shimmer/pulse loading states (compositor thread) |
| LazyMotion | ~4.6 KB initial; async-load `domMax` (~25 KB) for drag/layout |

## Directory Structure

```
src/
  theme/
    contract.css.ts       # createThemeContract — token shape (no values)
    theme.css.ts           # createTheme — token values bound to contract
    sprinkles.css.ts       # defineProperties + createSprinkles from tokens
    typography.css.ts      # Font-face declarations, typographic recipes
    index.ts               # Re-exports: theme, vars, sprinkles
  common/
    components/
      Button/
      IconButton/
      TextInput/
      Select/
      Checkbox/
      Chip/
      Badge/
      Card/
      Stack/
      Icon/
      Skeleton/
      Spinner/
    animations/
      variants.ts          # Motion variant objects (card states, panels)
      keyframes.css.ts      # CSS @keyframes (shimmer, pulse)
      easing.ts             # Named easing constants from tokens
      LazyMotionProvider.tsx # App-level LazyMotion wrapper
```

## Design Tokens

All token values are defined in [architecture/README.md — Design Tokens](README.md#design-tokens). That document is the single source of truth for raw values. This spec defines how those values map into the vanilla-extract theme system.

### Theme Contract

The contract defines the token shape without values. All consuming code references `vars` (the contract), never raw values.

| Contract Path | Source in README |
|---------------|-----------------|
| `color.bg` | Color Palette — bg |
| `color.surface` | Color Palette — surface |
| `color.border` | Color Palette — border |
| `color.text` | Color Palette — text |
| `color.textMid` | Color Palette — textMid |
| `color.textLight` | Color Palette — textLight |
| `color.status.thinking` | Status Colors — thinking |
| `color.status.running` | Status Colors — running |
| `color.status.complete` | Status Colors — complete |
| `color.status.queued` | Status Colors — queued |
| `color.status.error` | Status Colors — error |
| `color.inputType.[type].fg` | Input Type Colors — Foreground |
| `color.inputType.[type].bg` | Input Type Colors — Background |
| `color.inputType.[type].border` | Input Type Colors — Border |
| `font.mono` | Typography — Mono |
| `font.sans` | Typography — Sans |
| `font.serif` | Typography — Serif |
| `easing.out` | Easing — out |
| `easing.inOut` | Easing — inOut |
| `easing.outQuart` | Easing — outQuart |

`[type]` = `sql`, `python`, `literature`, `hypothesis`, `note`, `dataIngest`, `task`.

### Sprinkles Properties

Sprinkles exposes a subset of tokens as composable utility classes.

| Property Group | CSS Properties | Scale Source |
|----------------|---------------|-------------|
| Color | `color`, `backgroundColor`, `borderColor` | `color.*` tokens |
| Spacing | `padding`, `margin`, `gap` | `4, 8, 12, 16, 20, 24, 32, 48, 64` px |
| Typography | `fontFamily`, `fontSize`, `fontWeight`, `lineHeight` | `font.*` tokens + scale |
| Layout | `display`, `flexDirection`, `alignItems`, `justifyContent` | Enum values |
| Sizing | `width`, `height`, `maxWidth`, `minHeight` | Fraction + fixed values |
| Border | `borderRadius`, `borderWidth`, `borderStyle` | `2, 4, 8, 12, 9999` px |

### Typography Scale

| Name | Size | Weight | Line Height | Font |
|------|------|--------|-------------|------|
| displayLg | 28px | 700 | 1.2 | Sans |
| displaySm | 22px | 600 | 1.3 | Sans |
| heading | 18px | 600 | 1.4 | Sans |
| body | 15px | 400 | 1.5 | Sans |
| bodySm | 13px | 400 | 1.5 | Sans |
| caption | 11px | 500 | 1.4 | Sans |
| mono | 14px | 400 | 1.6 | Mono |
| monoSm | 12px | 400 | 1.6 | Mono |

## Shared UI Primitives

### Buttons

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Height: 28 / 36 / 44 px |
| `color` | `'primary' \| 'danger' \| 'neutral'` | `'primary'` | Maps to token colors |
| `icon` | `ReactNode` | — | Leading icon slot |
| `loading` | `boolean` | `false` | Replaces icon with Spinner |
| `disabled` | `boolean` | `false` | Disabled state |

`IconButton` — same as Button but square, icon-only, `aria-label` required.

### Text Inputs

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `size` | `'sm' \| 'md'` | `'md'` | Height: 32 / 40 px |
| `error` | `boolean \| string` | `false` | Error border + message |
| `prefix` | `ReactNode` | — | Left adornment (icon/text) |
| `suffix` | `ReactNode` | — | Right adornment |

Also: `Select` (same size scale, chevron suffix), `Checkbox` (label, indeterminate).

### Chip

Used for input-type badges and mention pills.

| Prop | Type | Notes |
|------|------|-------|
| `inputType` | InputType enum | Derives fg/bg/border from `color.inputType.*` tokens |
| `label` | `string` | Display text |
| `onRemove` | `() => void` | Optional close button |
| `size` | `'sm' \| 'md'` | Height: 20 / 26 px |

### Badge

Status indicator dot + label.

| Prop | Type | Notes |
|------|------|-------|
| `status` | `'thinking' \| 'running' \| 'complete' \| 'error'` | Color from `color.status.*` |
| `label` | `string` | Optional text beside dot |
| `pulse` | `boolean` | CSS pulse animation on dot for `thinking`/`running` |

### Card

Presentational container only. Business logic lives in the `card` domain.

| Prop | Type | Notes |
|------|------|-------|
| `inputType` | InputType enum | Top-border accent color from `color.inputType.*` |
| `selected` | `boolean` | Elevated shadow + border highlight |
| `children` | `ReactNode` | Card content |

Renders: `surface` background, `border` border, `8px` border-radius, `16px` padding. Top 3px accent bar colored by `inputType`.

### Stack

Flex layout utility component.

| Prop | Type | Default |
|------|------|---------|
| `direction` | `'row' \| 'column'` | `'column'` |
| `gap` | spacing scale value | `8` |
| `align` | CSS align-items | `'stretch'` |
| `justify` | CSS justify-content | `'flex-start'` |
| `wrap` | `boolean` | `false` |

### Icon

Wrapper for SVG icons. Provides consistent sizing and color inheritance.

| Prop | Type | Default |
|------|------|---------|
| `name` | string (icon registry key) | — |
| `size` | `16 \| 20 \| 24` | `20` |
| `color` | `'currentColor' \| token path` | `'currentColor'` |

Icon source: inline SVGs registered in an icon map. No icon font, no sprite sheet.

### Skeleton

Placeholder with shimmer animation for loading states.

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'text' \| 'rect' \| 'circle'` | `'text'` |
| `width` | `string \| number` | `'100%'` |
| `height` | `string \| number` | Derived from variant |
| `lines` | `number` | `1` (text variant only) |

Uses CSS `@keyframes shimmer` — no JS animation.

### Spinner

Animated loading indicator.

| Prop | Type | Default |
|------|------|---------|
| `size` | `16 \| 20 \| 24` | `20` |
| `color` | token path | `color.textMid` |

Uses CSS `@keyframes spin` — no JS animation.

## Animation Utilities

### Motion Variants

Predefined variant objects for Motion's `variants` prop. Each maps state names to animation configs using easing tokens from the theme.

| Variant Set | States | Usage |
|-------------|--------|-------|
| `cardStatus` | `thinking`, `running`, `complete`, `error` | Border-color + subtle scale pulse per status |
| `cardEnterExit` | `initial`, `animate`, `exit` | Fade + slide-up on enter, fade + scale-down on exit |
| `panelSlide` | `hidden`, `visible` | Slide from right edge with backdrop fade |
| `fadeIn` | `initial`, `animate` | Simple opacity 0 to 1 |
| `staggerContainer` | `initial`, `animate` | Parent with `staggerChildren` timing |
| `staggerChild` | `initial`, `animate` | Child fade + translateY for list items |
| `dropzone` | `idle`, `active`, `accept`, `reject` | Border dash animation + scale on file hover |

All variant objects export both the `variants` record and a matching `transition` config using the theme easing values.

### CSS Keyframe Animations

Defined in `keyframes.css.ts` via vanilla-extract `keyframes()`. Run on compositor thread, zero JS cost.

| Animation | Properties Animated | Duration | Usage |
|-----------|-------------------|----------|-------|
| `shimmer` | `transform: translateX` | 1.5s linear infinite | Skeleton loading |
| `pulse` | `opacity` | 1.5s ease-in-out infinite | Status dot for thinking/running |
| `spin` | `transform: rotate` | 0.8s linear infinite | Spinner component |
| `fadeInUp` | `opacity`, `transform: translateY` | 300ms outQuart | Toast/notification entry |

### Easing Constants

Exported as both CSS string and Motion-compatible array formats.

| Name | CSS Format | Motion Format |
|------|-----------|---------------|
| `out` | `cubic-bezier(0.16, 1, 0.3, 1)` | `[0.16, 1, 0.3, 1]` |
| `inOut` | `cubic-bezier(0.4, 0, 0.2, 1)` | `[0.4, 0, 0.2, 1]` |
| `outQuart` | `cubic-bezier(0.25, 1, 0.5, 1)` | `[0.25, 1, 0.5, 1]` |

### LazyMotion Provider

Single `<LazyMotionProvider>` at the app root. Loads `domAnimation` features synchronously (4.6 KB, covers opacity/transform). Async-loads `domMax` (drag, layout FLIP) on first use.

## Accessibility

| Concern | Requirement |
|---------|-------------|
| Reduced motion | Respect `prefers-reduced-motion: reduce`. Disable Motion animations, set CSS keyframe `animation-duration: 0.01ms`. |
| Focus indicators | All interactive primitives show visible focus ring (2px offset, `color.text`) on `:focus-visible`. |
| Color contrast | All text/background pairs meet WCAG 2.1 AA (4.5:1 body, 3:1 large text). |
| Icon buttons | Require `aria-label`. Lint rule enforces. |
| Status badges | Status communicated via `aria-live="polite"` region, not color alone. |

## Dependencies

| Package | Version Constraint | Purpose |
|---------|-------------------|---------|
| `@vanilla-extract/css` | ^1.20 | Core style API |
| `@vanilla-extract/sprinkles` | ^1.7 | Utility-class API |
| `@vanilla-extract/vite-plugin` | ^5.0 | Vite integration |
| `motion` | ^12.0 | Animation library |

## Boundaries

- This domain owns `src/theme/` and `src/common/components/` and `src/common/animations/`.
- This domain does NOT own feature-specific components (those live in their respective domain directories).
- Other domains import from `src/theme` and `src/common/components/` — never reach into internal files.
- All color, typography, easing, and spacing values flow through the theme contract. No raw hex/px values in feature code.
