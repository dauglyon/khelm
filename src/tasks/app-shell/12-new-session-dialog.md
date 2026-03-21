# Task 12: NewSessionDialog + Create Flow

**ID:** app-shell/12
**Status:** pending
**Deps:** app-shell/10, app-shell/05

## Context

This task implements the session creation flow. A `NewSessionDialog` component provides a title input and create button. On success, the user is navigated to `/session/:id` for the newly created session. The dialog can be triggered either from the `/session/new` route or as a modal from the SessionList create button. It uses the `useCreateSession` hook (task 10) for the mutation.

## Implementation Requirements

### Files to Create/Modify

1. **`src/features/sessions/components/NewSessionDialog.tsx`** (~60 lines)
   - Form with:
     - Title text input (required, auto-focused)
     - "Create" submit button
     - "Cancel" button (navigates back or closes modal)
   - Uses `useCreateSession()` hook for the mutation
   - On success: navigates to `/session/${newSession.id}`
   - Shows loading state on submit button while creating
   - Shows error message if creation fails
   - Handles both route (`/session/new`) and modal usage patterns

2. **`src/features/sessions/components/NewSessionDialog.css.ts`** (~20 lines)
   - Dialog/form styling using theme tokens
   - Max-width constraint (e.g., 400px)
   - Input and button spacing

3. **`src/features/sessions/pages/NewSessionPage.tsx`** (modify)
   - Replace placeholder with `<NewSessionDialog />`
   - Provide a simple centered layout for the dialog

4. **`src/features/sessions/components/SessionList.tsx`** (modify, ~5 lines)
   - Wire "Create Session" button to navigate to `/session/new`
   - (Alternative: open NewSessionDialog as a modal -- either pattern is acceptable)

### Tests

5. **`src/features/sessions/components/NewSessionDialog.test.tsx`** (~50 lines)
   - Test: renders title input and create button
   - Test: create button is disabled when title is empty
   - Test: submitting creates a session via API
   - Test: navigates to new session on success
   - Test: shows error on failure

## Demo Reference

Acceptance criterion 3: "Creating a session navigates to `/session/:id` with the layout skeleton visible"

## Integration Proofs

```bash
# 1. Dialog tests pass
npx vitest run src/features/sessions/components/NewSessionDialog.test.tsx --reporter=verbose

# 2. Full create flow: submit -> API call -> navigate
# (verified in the test above)

# 3. TypeScript compiles
npx tsc --noEmit
```

## Acceptance Criteria

- [ ] `NewSessionDialog` renders a form with title input and create/cancel buttons
- [ ] Title input is required and auto-focused
- [ ] Create button submits the form and calls `useCreateSession`
- [ ] On success, navigates to `/session/:id` for the new session
- [ ] Loading state shown on button during creation
- [ ] Error message displayed if creation fails
- [ ] Cancel button navigates back or closes dialog
- [ ] Create button is disabled when title is empty
- [ ] Tests verify form behavior, success flow, and error handling
- [ ] `npx tsc --noEmit` passes

## Anti-Patterns

- Do NOT use `window.alert` for errors -- render error inline in the form
- Do NOT allow empty title submission -- validate before calling the hook
- Do NOT navigate before the API call succeeds -- wait for the mutation response
- Do NOT use an uncontrolled form -- use React state for the title input
- Do NOT import mutation logic directly from generated code -- use `useCreateSession` wrapper
