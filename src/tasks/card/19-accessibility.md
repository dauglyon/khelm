# Task 19: Card Accessibility and Reduced Motion

## Dependencies

- **03-card-header**: `CardHeader` component
- **04-status-indicator**: `StatusIndicator` component
- **05-card-shell**: `Card` component
- **14-chat-panel-layout**: `ChatPanel` component
- All body renderers (07-11)

## Context

The architecture spec (card.md > Accessibility) defines specific requirements: keyboard navigation for all card actions, screen reader announcements for status changes, reduced motion support, and focus management for the chat panel. This task is an accessibility audit and enhancement pass across all card components.

## Implementation Requirements

### Files to Modify

1. **`src/features/cards/Card.tsx`** -- add aria attributes, live region
2. **`src/features/cards/CardHeader.tsx`** -- keyboard navigation, aria-labels
3. **`src/features/cards/StatusIndicator.tsx`** -- reduced motion, aria-label
4. **`src/features/cards/ChatPanel.tsx`** -- focus management, keyboard handling
5. **`src/features/cards/bodies/*.tsx`** -- table accessibility, semantic HTML
6. **`src/features/cards/accessibility.css.ts`** -- reduced motion styles (~30 lines)

### Files to Create

1. **`src/features/cards/__tests__/accessibility.test.tsx`** (~120 lines)

### Keyboard Navigation (per spec)

| Action | Key | Behavior |
|--------|-----|----------|
| Reach card actions | Tab | Tab through shortname, type badge, each action button |
| Activate button | Enter / Space | Triggers the focused button's action |
| Close chat panel | Escape | Closes the chat panel, returns focus to chat button |
| Edit shortname | Enter (when shortname focused) | Enters edit mode |
| Save shortname | Enter (in edit mode) | Saves and exits edit mode |
| Cancel shortname edit | Escape | Discards changes, exits edit mode |
| Navigate chat input | Tab into panel | Focus moves to input field |

### Screen Reader Support (per spec)

| Concern | Implementation |
|---------|---------------|
| Card identity | `aria-label` on card container: "{shortname}, {type} card, status: {status}" |
| Status changes | `aria-live="polite"` region that announces status changes |
| Type badge | `aria-label` on badge: "Type: {type}" |
| Action buttons | `aria-label` on each button: "Open chat", "Copy card", "Pin card", "Delete card" |
| Result tables | `role="table"`, `<th scope="col">` for column headers |
| Chat messages | `role="log"` on message list, `aria-live="polite"` for new messages |

### Live Region for Status Changes

```tsx
// In Card.tsx:
<div aria-live="polite" className={visuallyHidden}>
  {statusAnnouncement}
</div>
```

- `statusAnnouncement` updates when `status` changes
- Text: "{shortname} status changed to {status}"
- Visually hidden (screen reader only)

### Reduced Motion (per spec)

When `prefers-reduced-motion: reduce` is active:

| Component | Change |
|-----------|--------|
| StatusIndicator | No pulse, no spin, no shake, no spring. Static icons only. |
| Chat panel | No slide animation. Instant show/hide. |
| Status transitions | No AnimatePresence cross-fade. Instant switch. |
| Shimmer overlay | Disabled. Show static placeholder. |
| Streaming cursor | No blink animation. Static cursor or no cursor. |
| Reference pill highlight | No scale pulse. Static highlight (border change). |

### Implementation: useReducedMotion Hook

```typescript
function useReducedMotion(): boolean {
  // matchMedia('(prefers-reduced-motion: reduce)')
  // Returns true if reduced motion preferred
  // Listens for changes
}
```

Use this hook in components that have animations. When `true`, replace Motion animations with instant transitions and disable CSS keyframes.

### CSS Approach

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all CSS keyframe animations */
  .statusDot, .shimmer, .cursor {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

### Focus Management (per spec)

| Scenario | Focus target |
|----------|-------------|
| Chat panel opens | Input field in chat panel |
| Chat panel closes | Chat action button in card header |
| Delete confirmation appears | Confirm button (or cancel button for safety) |
| Delete confirmation dismissed | Delete button |

Use `useRef` + `useEffect` for focus management. Focus moves on mount/unmount transitions.

## Demo Reference

**Vignette 1**: Screen reader user navigates to a card. They hear "Query metagenomes, SQL card, status: complete". They Tab to action buttons. Each announces its label. They press Enter on "Open chat". Focus moves to chat input.

**Vignette 2**: User has `prefers-reduced-motion: reduce` enabled. Cards appear instantly (no fade-in). Status dots show static icons. The chat panel appears without sliding. The shimmer placeholder is a static gray block.

## Integration Proofs

1. **Keyboard navigation test**: Render a card. Tab through all interactive elements. Assert each receives focus in order: shortname, action buttons.
2. **Escape closes chat test**: Open chat panel via button. Press Escape. Assert panel closes. Assert focus returns to chat button.
3. **Screen reader label test**: Render a card with `shortname: 'test'`, `type: 'sql'`, `status: 'complete'`. Assert `aria-label` contains all three.
4. **Live region test**: Render card with `status: 'running'`. Change status to `complete`. Assert live region text updates to announce the change.
5. **Reduced motion test**: Mock `prefers-reduced-motion: reduce`. Render `StatusIndicator` with `status: 'thinking'`. Assert no pulse animation class.
6. **Table accessibility test**: Render `SqlBody` with result. Assert table has `role="table"` or uses `<table>`. Assert column headers use `<th scope="col">`.
7. **Focus management test**: Render card, open chat. Assert input field has focus. Close chat. Assert chat button has focus.

## Acceptance Criteria

- [ ] All card actions reachable via Tab key
- [ ] Enter/Space activates focused buttons
- [ ] Escape closes chat panel
- [ ] Card container has descriptive `aria-label`
- [ ] Status changes announced via `aria-live="polite"` region
- [ ] All action buttons have `aria-label` attributes
- [ ] Result tables use semantic HTML (`<table>`, `<th>`, `<td>`)
- [ ] Chat message list has `role="log"`
- [ ] `useReducedMotion` hook implemented and used
- [ ] All animations disabled/replaced when reduced motion is preferred
- [ ] Focus management correct for chat panel open/close
- [ ] Focus management correct for delete confirmation
- [ ] All tests pass

## Anti-Patterns

- Do not use `div` with `onClick` for interactive elements -- use `button` elements
- Do not rely on color alone to communicate status -- include text or icon
- Do not use `aria-live="assertive"` for status changes -- "polite" is correct
- Do not skip focus management for modal-like panels -- it is a WCAG requirement
- Do not use `outline: none` on focus -- always show focus indicators
- Do not test accessibility manually only -- use automated tests with axe-core or similar
