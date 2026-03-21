# Preflight Decisions — design-system

## Resolved

1. **Missing packages**: Install `@vanilla-extract/sprinkles` and `motion` before starting dependent tasks.

2. **Existing stub overwrites**: Tasks 01 and 04 overwrite existing stubs (`contract.css.ts`, `index.ts`) from the Vite scaffold.

3. **Button color tokens**: No new tokens in the contract. Button maps semantic names internally: primary→text, danger→status.error, neutral→textMid.

4. **Status/type color animations**: Use vanilla-extract `styleVariants` + CSS `transition` for status and inputType color changes. NOT Motion variants. Motion is for layout/enter/exit only.

5. **Font loading**: Google Fonts CDN via `<link>` tags in `index.html`. Use font-family names directly in theme tokens (e.g., `'DM Sans', system-ui, sans-serif`). No `fontFace()` or `globalFontFace()` calls needed.

6. **Package.json version**: Bump `@vanilla-extract/css` from `^1.17.1` to `^1.20`.

7. **Sprinkles color scale**: Curated subset — base 6 (bg, surface, border, text, textMid, textLight) + status 4 (thinking, running, complete, error). InputType colors accessed via `styleVariants`, not sprinkles.

8. **Dynamic token colors (Chip, Badge, Card)**: Use `styleVariants()` from vanilla-extract — one variant per inputType/status at build time. Idiomatic vanilla-extract.

9. **Easing duplication**: Intentional — theme contract stores CSS custom properties for vanilla-extract styles, `easing.ts` stores raw values for Motion. Both needed.

10. **Checkbox icon**: Use inline SVG to avoid undeclared dependency on Task 10 (Icon component).

## NEEDS USER REVIEW

None — all items resolved.
