# Task 13: SessionHeader -- Editable Title + Member Display

**ID:** app-shell/13
**Status:** pending
**Deps:** app-shell/10, app-shell/05

## Context

This task implements the `SessionHeader` component that sits in the header region of the workspace layout. It displays the session title as an inline-editable field, shows member avatars as presence dots, and provides an actions menu for archive/delete operations. It uses `useSession` and `useUpdateSession` hooks (task 10) for reading and writing session data.

## Implementation Requirements

### Files to Create/Modify

1. **`src/features/sessions/components/SessionHeader.tsx`** (~70 lines)
   - Inline-editable title:
     - Displays as text by default
     - Click or focus activates edit mode (text input replaces text)
     - Blur or Enter commits the change via `useUpdateSession`
     - Escape cancels and reverts to original value
     - Shows saving indicator during update
   - Member avatars:
     - Display up to 5 member avatar circles (placeholder colored circles with initials)
     - "+N" overflow indicator for more than 5 members
   - Actions menu:
     - Archive session (calls `useUpdateSession` with `status: 'archived'`)
     - Delete session (calls `useDeleteSession`, navigates to `/` on success)
     - Confirm dialog before delete

2. **`src/features/sessions/components/SessionHeader.css.ts`** (~35 lines)
   - Inline edit styles (seamless text-to-input transition)
   - Avatar group styles (overlapping circles)
   - Actions menu positioning
   - Uses theme tokens for all colors and typography

3. **`src/features/sessions/components/MemberAvatars.tsx`** (~30 lines)
   - Renders a row of avatar circles from member data
   - Each avatar shows initials derived from `displayName`
   - Overflow indicator for > 5 members
   - Color-coded backgrounds (deterministic from user ID)

4. **`src/features/sessions/components/MemberAvatars.css.ts`** (~20 lines)
   - Overlapping circle layout (negative margin)
   - Sizing and border styles

5. **`src/features/sessions/components/Header.tsx`** (modify)
   - Replace placeholder title and avatar areas with `<SessionHeader />` when on a session route
   - Keep the static logo on the left

### Tests

6. **`src/features/sessions/components/SessionHeader.test.tsx`** (~70 lines)
   - Test: displays session title
   - Test: clicking title enters edit mode
   - Test: submitting edit calls update API
   - Test: Escape cancels edit
   - Test: member avatars render
   - Test: overflow indicator shows for > 5 members
   - Test: delete action navigates to home

## Demo Reference

Acceptance criterion 3: "Creating a session navigates to `/session/:id` with the layout skeleton visible"
(SessionHeader is part of that visible skeleton with real data)

## Integration Proofs

```bash
# 1. SessionHeader tests pass
npx vitest run src/features/sessions/components/SessionHeader.test.tsx --reporter=verbose

# 2. MemberAvatars renders correctly
npx vitest run src/features/sessions/components/MemberAvatars.test.tsx --reporter=verbose

# 3. Inline edit persists via API (tested with MSW)
# (verified in SessionHeader tests above)

# 4. TypeScript compiles
npx tsc --noEmit
```

## Acceptance Criteria

- [ ] Session title displays as text and is clickable to edit
- [ ] Edit mode replaces text with an input field
- [ ] Enter or blur commits the title change via API
- [ ] Escape cancels edit and reverts to original title
- [ ] Saving indicator shown during update
- [ ] Member avatars display with initials
- [ ] Overflow indicator for more than 5 members
- [ ] Archive action updates session status
- [ ] Delete action removes session and navigates to home
- [ ] Delete has a confirmation step
- [ ] Tests verify edit flow, member display, and delete flow
- [ ] `npx tsc --noEmit` passes

## Anti-Patterns

- Do NOT use `contentEditable` for inline editing -- use a controlled input that swaps in on click
- Do NOT call the API on every keystroke -- only on commit (blur/Enter)
- Do NOT skip the delete confirmation -- destructive actions need a safeguard
- Do NOT hardcode avatar colors -- derive deterministically from user ID for consistency
- Do NOT render more than 5 individual avatars -- use the overflow indicator
- Do NOT fetch session data in this component -- receive it via the `useSession` hook called by the parent page
