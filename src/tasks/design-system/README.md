# Design System Tasks

The design-system domain provides the visual foundation for The Helm: a vanilla-extract theme system with typed design tokens, a Sprinkles utility-class API, shared UI primitives (buttons, inputs, cards, layout helpers), CSS keyframe animations for loading states, Motion variant objects for stateful transitions, and a LazyMotion provider for code-split animation features. All color, typography, spacing, and easing values flow through a single theme contract so downstream domains never reference raw values.

## Implementation Targets

| Target | Path | Description |
|--------|------|-------------|
| Theme contract | `src/theme/contract.css.ts` | Token shape via `createThemeContract` |
| Theme values | `src/theme/theme.css.ts` | Token values via `createTheme` |
| Sprinkles | `src/theme/sprinkles.css.ts` | Utility-class API from tokens |
| Typography | `src/theme/typography.css.ts` | Font-face declarations, type recipes |
| Theme barrel | `src/theme/index.ts` | Re-exports for public API |
| Easing | `src/common/animations/easing.ts` | Named easing constants |
| Keyframes | `src/common/animations/keyframes.css.ts` | CSS shimmer, pulse, spin, fadeInUp |
| LazyMotion | `src/common/animations/LazyMotionProvider.tsx` | App-level LazyMotion wrapper |
| Motion variants | `src/common/animations/variants.ts` | Predefined variant objects |
| Stack | `src/common/components/Stack/` | Flex layout utility |
| Icon | `src/common/components/Icon/` | SVG icon wrapper |
| Spinner | `src/common/components/Spinner/` | CSS spin loading indicator |
| Skeleton | `src/common/components/Skeleton/` | Shimmer placeholder |
| Button | `src/common/components/Button/` | Solid/outline/ghost button |
| IconButton | `src/common/components/IconButton/` | Square icon-only button |
| TextInput | `src/common/components/TextInput/` | Text input with adornments |
| Select | `src/common/components/Select/` | Select dropdown |
| Checkbox | `src/common/components/Checkbox/` | Checkbox with label |
| Chip | `src/common/components/Chip/` | Input-type badge pill |
| Badge | `src/common/components/Badge/` | Status indicator dot + label |
| Card | `src/common/components/Card/` | Presentational card container |

## Task Table

| ID | Summary | Deps | Status | Preflight |
|----|---------|------|--------|-----------|
| 01 | Theme contract and values | none | done | done |
| 02 | Sprinkles utility API | 01 | done | done |
| 03 | Typography scale and font-face | 01 | done | done |
| 04 | Theme barrel export | 01, 02, 03 | done | done |
| 05 | Easing constants | 01 | done | done |
| 06 | CSS keyframe animations | 01, 05 | done | done |
| 07 | LazyMotion provider | none | done | done |
| 08 | Motion variants | 05, 07 | done | done |
| 09 | Stack component | 02 | done | done |
| 10 | Icon component | 02 | done | done |
| 11 | Spinner component | 02, 06 | done | done |
| 12 | Skeleton component | 02, 06 | done | done |
| 13 | Button component | 02, 03, 10, 11 | done | done |
| 14 | IconButton component | 13 | done | done |
| 15 | TextInput component | 02, 03 | done | done |
| 16 | Select component | 15, 10 | done | done |
| 17 | Checkbox component | 02, 03 | done | done |
| 18 | Chip component | 02, 03, 10 | done | done |
| 19 | Badge component | 02, 06 | done | done |
| 20 | Card component | 02, 08 | done | done |

## Critical Path DAG

```
01 (contract+values)
├── 02 (sprinkles)
│   ├── 09 (Stack)
│   ├── 10 (Icon)
│   │   ├── 16 (Select) ←── 15
│   │   ├── 18 (Chip)
│   │   └── 13 (Button) ←── 03, 11
│   │       └── 14 (IconButton)
│   ├── 11 (Spinner) ←── 06
│   ├── 12 (Skeleton) ←── 06
│   ├── 15 (TextInput) ←── 03
│   ├── 17 (Checkbox) ←── 03
│   ├── 19 (Badge) ←── 06
│   └── 20 (Card) ←── 08
├── 03 (typography)
│   ├── 13, 15, 17, 18
│   └── 04 (barrel) ←── 02
├── 05 (easing)
│   ├── 06 (keyframes)
│   │   ├── 11, 12, 19
│   │   └── (used by Spinner, Skeleton, Badge)
│   └── 08 (motion variants) ←── 07
│       └── 20 (Card)
07 (LazyMotion provider)
└── 08 (motion variants)
```

## Parallelism Opportunities

### Wave 1 (no deps)
- **01** Theme contract and values
- **07** LazyMotion provider

### Wave 2 (after 01)
- **02** Sprinkles utility API
- **03** Typography scale and font-face
- **05** Easing constants

### Wave 3 (after 02, 03, 05, 07)
- **04** Theme barrel export
- **06** CSS keyframe animations
- **08** Motion variants
- **09** Stack component
- **10** Icon component

### Wave 4 (after 06, 10)
- **11** Spinner component
- **12** Skeleton component
- **15** TextInput component
- **17** Checkbox component

### Wave 5 (after 11, 13, 15)
- **13** Button component
- **16** Select component
- **18** Chip component
- **19** Badge component
- **20** Card component

### Wave 6 (after 13)
- **14** IconButton component
