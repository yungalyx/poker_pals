# Interaction Responsiveness

Guidelines for building responsive, non-jarring interfaces that feel alive.

## Core Principle

Every interaction must respond with feedback. The "input-response" loop is fundamental—like the text caret blinking when you stop typing to communicate the system is still responsive.

## Critical Rules

### Never Delay Response to User Input

- Transition immediately in response to user input
- Don't wait for previous animations to complete before showing new state
- The response to the primary property must be immediate; choreograph secondary elements with delays

### Reduce Responsiveness for High-Frequency Actions

- Never fade in popovers/menus that users will immediately interact with
- Skip animations for data that updates faster than animations can run
- Remove motion from tooltips on high-frequency hover interactions (e.g., graph data points)
- Keyboard/mouse interactions can skip animation more than touch—there's inherent disconnect between peripheral input and screen

```typescript
// Skip animations when updates happen faster than animation duration
const ANIMATION_DURATION_MS = 150;
const deltaMs = Date.now() - lastUpdate.current;
lastUpdate.current = Date.now();

if (deltaMs <= ANIMATION_DURATION_MS) {
  return; // Skip this animation
}
```

### Match Response to Input Magnitude

- Bouncy springs on hover/press feel jarring—lacks momentum
- Bouncy springs on swipe gestures feel great—has velocity
- Confetti on a cancel button is inappropriate—exaggerated output for mundane input
- Reserve creative expression for moments of magnitude (completing a goal, achieving milestones)

### Sound Effects

- Easy to misuse in productivity software—users want to get work done
- ALWAYS disable on mobile—OS pauses music when websites play sounds
- Use sparingly and only where viscerally satisfying (e.g., subtle tick between data points)
- Consider different pitches for enter/exit states for dynamic feel

## Loading States

- Loading indicators communicate the system understood you and is thinking
- Don't fade out menus immediately—fade out confirms interaction success and no error/freeze
- State transitions should only play in response to input or system changes, never on initial page load

```typescript
// Avoid animation on initial render
const measuredWidth = useMeasureWidth(ref);
const width = measuredWidth ? measuredWidth : "auto";
```

## Implementation Pattern

```typescript
// Direct DOM manipulation for high-frequency interactions
// Avoids React re-renders for mouse/scroll handlers
const ref = useRef(null);

function onMouseMove(e) {
  ref.current.style.translate = `${e.clientX}px ${e.clientY}px`;
}
```
