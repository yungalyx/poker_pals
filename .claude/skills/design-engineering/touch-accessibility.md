# Touch & Accessibility

Touch devices, mobile considerations, keyboard navigation, and accessibility.

Based on Emil Kowalski's design engineering practices and Rauno Freiberg's "Devouring Details".

## Affordance vs Ergonomics

- **Affordance**: Obvious how to use something before interacting
- **Ergonomics**: Ease of use once interacting
- Both are worth considering BEFORE fancy animations and visual appeal

## Visual Depth for Interactivity

Use slightly subtler background colors to make interactive elements stand out:

```css
/* Background: subtle gray */
--bg-page: #EDEDED; /* light mode */
--bg-page: #282828; /* dark mode */

/* Interactive elements: pure colors */
--bg-interactive: #FFFFFF; /* light mode */
--bg-interactive: #000000; /* dark mode */
```

Visually lift interactive elements from the page.

---

## Touch Devices

### Hover Effects

Disable hover effects on touch devices. Touch devices trigger hover on tap, causing false positives:

```css
/* Only apply hover on devices that support it */
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    transform: scale(1.05);
  }
}
```

**Important:** Don't rely on hover effects for the UI to work properly. Hover should enhance, not enable functionality.

### Touch Action

Disable `touch-action` for custom components that implement pan and zoom gestures to prevent interference from native behavior:

```css
.custom-canvas {
  touch-action: none;
}
```

### Double-Tap Zoom

Set `touch-action: manipulation` to prevent double-tap zoom on controls:

```css
button, a, input {
  touch-action: manipulation;
}
```

### Tap Targets

Ensure minimal tap target of all buttons on touch devices is at least 44px:

```css
.icon-button {
  /* Visual size can be smaller */
  width: 24px;
  height: 24px;
  position: relative;
}

/* But hit area should be 44px */
.icon-button::before {
  content: '';
  position: absolute;
  inset: -10px;
}
```

Or use padding:

```css
.small-button {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Concentric Hit Areas

Multiple hit areas can look appealing AND maximize space:

```tsx
// NOT nested buttons (invalid HTML)
// Siblings with expanded hit areas
<div>
  <button className="logo-btn">{/* Logo */}</button>
  <div className="issues">
    <button className="issues-btn">3 Issues</button>
    <button className="close-btn">×</button>
  </div>
</div>
```

**Never nest `<button>` elements.**

### Video Autoplay

Apply `muted` and `playsinline` to `<video>` tags to autoplay on iOS without opening a fullscreen video popup:

```html
<video autoplay muted playsinline loop>
  <source src="video.mp4" type="video/mp4" />
</video>
```

### OS-Specific Shortcuts

Replace `Cmd` with `Ctrl` based on operating system:

```js
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const modKey = isMac ? 'Cmd' : 'Ctrl';

// Display: "Save (Cmd+S)" on Mac, "Save (Ctrl+S)" on Windows
```

---

## Keyboard Navigation

### Tab Order

Tabbing should work consistently across the site. Users should only be able to tab through visible elements:

```css
/* Hide from tab order when not visible */
.hidden-panel {
  visibility: hidden;
}

/* Or use inert attribute */
<div inert={!isVisible}>...</div>
```

### Scroll Into View

Ensure keyboard navigation scrolls elements into view if needed:

```jsx
function handleFocus(e) {
  e.target.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });
}
```

### Focus Management

When opening modals or dialogs, move focus to the first interactive element or the modal itself. When closing, return focus to the trigger element.

```typescript
// When opening panel/dialog with interactive content
if (open) {
  contentRef.current.focus();
} else {
  triggerRef.current.focus(); // Return focus when closing
}
```

Don't leave users stuck on elements no longer on screen.

### Two Ways to Perform Actions

Always offer:
1. Visual button (discoverable for beginners)
2. Keyboard shortcut (efficient for power users)

```tsx
// Tooltip describes both
<Button
  onClick={toggleCode}
  aria-label="View source code (Press C)"
/>
```

Beginners learn available actions, then discover gestures/shortcuts.

---

## Focus Rings

### Never Remove Focus Rings

```css
/* BAD: Removes landmark for keyboard users */
button { outline: none; }

/* GOOD: Customize instead */
button {
  border-radius: 2px;
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}
```

Focus rings tell keyboard users which element they'll activate with Enter.

### Focus Ring Contrast

Adapt focus ring colors to context:

```css
/* Error state: white inset ring has better contrast against red */
.error-state {
  outline: 2px solid white;
  outline-offset: -2px;
}

/* Default state: branded color works better */
.default-state {
  outline: 2px solid var(--brand-color);
  outline-offset: 2px;
}
```

### Focus Ring on Container (Input Fields)

```tsx
// BAD: Icon blocks input focus or doesn't trigger it
<div>
  <Icon />
  <Input />
</div>

// GOOD: Clicking icon focuses input
<label>
  <Icon />
  <Input />
</label>
```

```css
label {
  &:focus-within {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
  }

  input {
    outline: none; /* Ring on container instead */
  }
}
```

---

## Accessibility

### ARIA Labels

Always set aria labels on buttons with an icon as content:

```html
<button aria-label="Close dialog">
  <CloseIcon />
</button>

<button aria-label="Search">
  <SearchIcon />
</button>
```

### Code Illustrations

Illustrations built in code should have proper `aria-label` attribute:

```jsx
<div
  role="img"
  aria-label="Abstract geometric pattern"
  className="decorative-illustration"
/>
```

### Hide Decorative Elements

```tsx
<TailSVG aria-hidden />
<GestureHint aria-hidden />
```

### Color Independence

Never use color as the only indicator:

```tsx
// BAD: Only color shows error
<Input className={hasError ? "border-red" : ""} />

// GOOD: Color + icon + text
<Input className={hasError ? "border-red" : ""}>
  {hasError && <ErrorIcon />}
  {hasError && <span>{errorMessage}</span>}
</Input>
```

### Reduced Motion

See [animations.md](animations.md) for `prefers-reduced-motion` implementation. Every animation needs reduced motion support.

### Videos

For users who prefer reduced motion, show play buttons instead of autoplaying videos:

```jsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<video
  autoPlay={!prefersReducedMotion}
  controls={prefersReducedMotion}
  muted
  playsinline
/>
```

### Time-Limited Actions

Ensure any time-limited action is frozen when the user switches tabs. Use the `visibilitychange` event:

```js
let timeoutId;
let remainingTime;
let startTime;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause the timer
    clearTimeout(timeoutId);
    remainingTime -= Date.now() - startTime;
  } else {
    // Resume the timer
    startTime = Date.now();
    timeoutId = setTimeout(callback, remainingTime);
  }
});
```

---

## Fitts' Law & Reachability

Place interactive elements close to the pointer:

- Mobile: position actions near bottom (thumb reachable)
- Desktop: consider shifting page so next click target is under cursor

### Reachability

If an element would move off-screen, reposition it to stay accessible:

```typescript
// Element bounces back when reaching screen edge
// Like throwing a ball against a wall
if (position.y > screenHeight) {
  animateToPosition({ y: screenHeight - offset });
}
```

This collision physics makes interfaces feel more alive while solving usability issues.

---

## Scroll & Drag Indication

### Scroll Indication

```tsx
// BAD: No indication content is scrollable

// GOOD: Left margin indicates where content begins
// and shows more items to the right
<div style={{ marginLeft: 16 }}>
  {items}
</div>
```

### Drag Indication

Use handles to indicate draggability:

```tsx
<div className="drag-handle">
  <GripIcon />
</div>
```

But handles alone aren't enough—ensure the hit area is large enough.

---

## Feedback

Ensure feedback components are visible on the page. Feedback is important—don't hide it behind hover states or modals.

---

## Tooltips

### Delay and Animation

Tooltips should have a delay before appearing to prevent accidental activation:

```css
.tooltip {
  transition-delay: 200ms;
}
```

**Sequential tooltips:** Once a tooltip is open, hovering over other tooltips should open them with no delay and no animation. Track "warm" state:

```jsx
const [isWarm, setIsWarm] = useState(false);

// When any tooltip opens, set warm state
// Clear warm state after 300ms of no tooltip being open
```

### Submenus

Apply a safe-area for submenus using clippath to ensure diagonal movement works. Users should be able to move diagonally from parent menu to submenu without the submenu closing.

```css
.submenu-trigger::after {
  content: '';
  position: absolute;
  /* Creates a "safe zone" for cursor movement */
  clip-path: polygon(0 0, 100% 0, 100% 100%);
  /* Adjust based on submenu position */
}
```

---

## Form Accessibility

### Let Users Submit and See Errors

Don't disable submit buttons—let users submit and receive explicit feedback:

```tsx
// BAD: Disabled button with tooltip
<Button disabled={!isValid}>Submit</Button>

// GOOD: Submit shows what's missing
<Button type="submit">Submit</Button>
// Form validation reveals missing fields on submit
```

With complex forms, it's easier to find missed fields with explicit error messages.
