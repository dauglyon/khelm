# Integration: design-system -> collaboration

## Imports Required

### Theme and Tokens
- `vars` (theme contract) -- `color.text`, `color.textMid`, `color.textLight` for presence indicators, `color.status.error` for disconnection/lock-denied feedback
- `sprinkles` for utility styling on presence indicators and lock UI overlays

### Components
- **Badge** (`status`, `label`) -- presence status indicators (online/idle/offline mapped to status colors), lock-denied inline toast status
- **Icon** -- AI participant icon in presence list, lock holder avatar overlay, presence dot indicators
- **IconButton** -- "Stop generating" button on AI-locked cards
- **Button** (`variant: 'outline'`, `size: 'sm'`) -- "Resume" button for re-acquiring lost lock after reconnection
- **Stack** -- layout for participant list, presence avatar row in card header and session header
- **Spinner** (`size: 16`) -- reconnecting indicator during Socket.IO reconnection

### Animation Utilities
- **fadeIn** variant -- presence indicator appearance/disappearance when users join/leave
- **easing.out** -- transition for presence state changes (online -> idle -> offline)
- CSS **pulse** keyframe -- pulsing ring on AI avatar during active generation, chat button pulse on card error

## Acceptance Criteria

1. Presence indicators in the session header and participant list use consistent avatar sizing and colored rings from `vars` tokens
2. Online/idle/offline status uses distinct visual treatment sourced from design-system tokens -- online uses `color.status.complete`, idle uses `color.status.queued`, offline uses `color.textLight`
3. Lock holder avatar badge on cards uses a colored ring from the user's assigned color (color from a predefined palette using `vars` tokens)
4. AI participant icon in presence list and lock avatar uses `Icon` component
5. "Stop generating" button on AI-locked cards uses `IconButton` with appropriate `aria-label`
6. Lock-denied inline toast uses `vars.color.status.error` for the indicator and `vars.color.text` for the message
7. Disabled controls on locked cards use `vars.color.textLight` for greyed-out appearance
8. Reconnecting state uses `Spinner` component
9. Presence transitions (join/leave) use `fadeIn` Motion variant
10. No raw hex color values in collaboration code -- all sourced from `vars`
