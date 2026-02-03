# Animations

Based on Emil Kowalski's "Animations on the Web" course and Rauno Freiberg's "Devouring Details".

## Quick Decision

1. **Is this element entering or exiting?** → Use `ease-out`
2. **Is an on-screen element moving?** → Use `ease-in-out`
3. **Is this a hover/color transition?** → Use `ease`
4. **Will users see this 100+ times daily?** → Don't animate it

## The Easing Blueprint

### ease-out (Most Common)

Use for **user-initiated interactions**: dropdowns, modals, tooltips, any element entering or exiting the screen.

```css
/* Sorted weak to strong */
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
--ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
--ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
--ease-out-circ: cubic-bezier(0.075, 0.82, 0.165, 1);
```

Why it works: Acceleration at the start creates an instant, responsive feeling. The element "jumps" toward its destination then settles in.

### ease-in-out (For Movement)

Use when **elements already on screen need to move or morph**. Mimics natural motion like a car accelerating then braking.

```css
/* Sorted weak to strong */
--ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);
--ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
--ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
--ease-in-out-quint: cubic-bezier(0.86, 0, 0.07, 1);
--ease-in-out-expo: cubic-bezier(1, 0, 0, 1);
--ease-in-out-circ: cubic-bezier(0.785, 0.135, 0.15, 0.86);
```

### ease (For Hover Effects)

Use for **hover states and color transitions**. The asymmetrical curve (faster start, slower end) feels elegant for gentle animations.

```css
transition: background-color 150ms ease;
```

### linear (Avoid in UI)

Only use for:
- Constant-speed animations (marquees, tickers)
- Time visualization (hold-to-delete progress indicators)

Linear feels robotic and unnatural for interactive elements.

### ease-in (Almost Never)

**Avoid for UI animations.** Makes interfaces feel sluggish because the slow start delays visual feedback.

## Paired Elements Rule

Elements that animate together must use the same easing and duration. Modal + overlay, tooltip + arrow, drawer + backdrop—if they move as a unit, they should feel like a unit.

```css
/* Both use the same timing */
.modal { transition: transform 200ms ease-out; }
.overlay { transition: opacity 200ms ease-out; }
```

## Duration Guidelines

| Element Type | Duration |
| --- | --- |
| Micro-interactions | 100-150ms |
| Standard UI (tooltips, dropdowns) | 150-250ms |
| Modals, drawers | 200-300ms |
| Page transitions | 300-400ms |

**Rule:** UI animations should stay under 300ms. Larger elements animate slower than smaller ones.

## The Frequency Principle

Determine how often users will see the animation:

- **100+ times/day** → No animation (or drastically reduced)
- **Occasional use** → Standard animation
- **Rare/first-time** → Can add delight

**Example:** Raycast never animates its menu toggle because users open it hundreds of times daily.

## When to Animate

**Do animate:**
- Enter/exit transitions for spatial consistency
- State changes that benefit from visual continuity
- Responses to user actions (feedback)
- Rarely-used interactions where delight adds value

**Don't animate:**
- Keyboard-initiated actions
- Hover effects on frequently-used elements
- Anything users interact with 100+ times daily
- When speed matters more than smoothness

**Marketing vs. Product:**
- Marketing: More elaborate, longer durations allowed
- Product: Fast, purposeful, never frivolous

---

## Spring Animations

Springs feel more natural because they don't have fixed durations—they simulate real physics. Great interactions are modeled after properties from the real world because we naturally recognize them as familiar.

### Why Springs?

- Any rotation, translation, or scaling movement looks better with a spring
- CSS `linear()` springs are NOT fluidly interruptible—use a library like motion/react
- True spring physics retain momentum and transition with smooth arcs when interrupted

### When to Use Springs

- Drag interactions with momentum
- Elements that should feel "alive" (Dynamic Island)
- Gestures that can be interrupted mid-animation
- Organic, playful interfaces

### Configuration

**Apple's approach (recommended):**

```js
// Duration + bounce (easier to understand)
{ type: "spring", duration: 0.5, bounce: 0.2 }
```

**Traditional physics:**

```js
// Mass, stiffness, damping (more control)
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

**Default starting point:**

```typescript
const SPRING = {
  type: "spring",
  stiffness: 200,
  damping: 20,
};
```

### Spring Mental Model

- **Higher stiffness** = faster movement
- **Lower damping** = more bounce/overshoot
- **Mass** = usually avoid; makes movement feel lethargic and unresponsive

**Exception:** Mass works well for pendulum/swaying motion where left-right settling feels natural.

### Bounce Guidelines

Only add bounce when the interaction has momentum:

```typescript
// BAD: Bouncy spring on hover/press - feels jarring (no momentum)
transition={{
  type: "spring",
  stiffness: 250,
  damping: 10, // Low damping = bouncy
}}

// GOOD: No bounce but still satisfying spring feel
transition={{
  type: "spring",
  stiffness: 250,
  damping: 25, // Higher damping = smooth
}}
```

| Interaction | Bounce? | Why |
|-------------|---------|-----|
| Hover/press | No | No momentum to reflect |
| Swipe/throw | Yes | Has velocity to carry |
| Button tap | No | Maps to physical pressure |
| Card flick | Yes | Conceptually light, has momentum |

### Conceptual Weight

Never reuse spring values between different interactions. Tune based on:

- Visual size of the moving element
- Type of interaction (hover vs swipe vs drag)
- Conceptual weight of the element

| Element Type | Motion Style | Example Config |
|--------------|--------------|----------------|
| Heavy (images, clipboard) | Spring with friction | `{ stiffness: 200, damping: 25 }` |
| Precision tools (layers) | Linear, immediate | `{ stiffness: 500, damping: 40 }` |
| Light (cards, chips) | Less bounce | `{ stiffness: 300, damping: 30 }` |
| Destructive actions | More friction | Hold-to-confirm patterns |

### Interruptibility

**CRITICAL: All animations must be interruptible.** Real-world actions are interruptible—flipping a page doesn't lock you out.

```typescript
if (translateX.isAnimating()) {
  translateX.stop(); // Allow immediate interruption
}
```

Springs maintain velocity when interrupted—CSS animations restart from zero. This makes springs ideal for gestures users might change mid-motion.

---

## Motion Choreography

"Things don't come to a stop all at once; first there's one part and then another" — Walt Disney

Elements should move at different speeds and times, especially if they are conceptually distinct or have different sizes.

### Staggering

Slightly delay movement based on element order. Creates beautiful effects similar to nature (schools of fish, leaves on trees).

```tsx
items.map((item, index) => (
  <motion.div
    key={index}
    transition={{
      delay: index * 0.05, // 50ms between each
    }}
  />
))
```

**Staggering Rules:**
- Without staggering, motion feels lifeless and visually uninteresting
- Don't stagger so much that it feels like lag
- First few elements should appear immediately
- Use staggering to reduce overlapping layers without delaying response

### Follow Through

Secondary elements (labels, indicators) can be delayed while primary transition is immediate:

```typescript
// Primary action: immediate scale
// Secondary action: 400ms delayed label fade
const labelTransition = {
  ...spring,
  delay: 0.4, // Choreographed delay
};
```

The delay doesn't feel terrible because the primary response (scale) is immediate.

### Avoiding Overlapping Layers

Overlapping layers feel terrible—they produce clutter, break rhythm, look unappealing, and confuse users.

**Never delay response to avoid overlap.** Instead:

1. **Blur crossfading elements** — even 1-2px makes layers blend smoothly

```typescript
const exit = {
  opacity: 0,
  filter: "blur(4px)", // Softens overlap
};
```

2. **Faster exit animations** — gets rid of stale state quickly

```typescript
const exit = {
  ...initial,
  transition: {
    stiffness: transition.stiffness * 2, // Double exit velocity
  },
};
```

3. **Scale + blur for icon crossfades** — scale by 0.5, blur by ~7px

### Morph Transitions (Dynamic Island Style)

**Animate the right element:**

```tsx
// BAD: Animating root element - contents jarring re-center
<motion.footer animate={{ width: bounds.width }}>
  <div>{contents}</div>
</motion.footer>

// GOOD: Animate container with dynamic content
<footer>
  <motion.div animate={{ width: bounds.width }}>
    <div>{contents}</div>
  </motion.div>
  <Menu /> {/* Pushed aside smoothly */}
</footer>
```

**Inner layer strategy:** Don't move inner layers during morph—just crossfade between them:

```tsx
<motion.div className="overflow-hidden" animate={{ width, height }}>
  <AnimatePresence mode="wait">
    <motion.div key={activeState}>
      {contents}
    </motion.div>
  </AnimatePresence>
</motion.div>
```

---

## Physical Metaphors

### Gesture Origins

| Gesture | Physical Origin |
|---------|-----------------|
| Swiping | Page turning (books for thousands of years) |
| Pinching | Picking up tiny objects (precision) |
| Pressing | Applied pressure (scale down on press, not hover) |

```typescript
// Scale up on hover, down on press
// Simulates physical pressure response
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }} // Only scale DOWN on press
/>
```

### Velocity and Momentum

Dynamic Island retains momentum and angle at which it was thrown. Never perfectly centered or consistent timing.

```typescript
// Preserve gesture angle and speed in animation
function onDragEnd(_, { velocity }) {
  animate({
    x: targetX,
    y: targetY,
    transition: {
      velocity: velocity, // Carry momentum into animation
    },
  });
}
```

### Physical Boundaries

```typescript
// Element rebounding off screen edge
// Like throwing ball against wall
if (position.y > screenHeight) {
  animateToBounceBack();
}
```

Makes interface feel more alive while solving usability (keeping things reachable).

---

## Motion/React Library Patterns

### Basic Animation

```tsx
<motion.div
  animate={{
    x: active ? 100 : 0,
    rotate: active ? 90 : 0,
  }}
/>
```

### Per-Property Transitions

```tsx
<motion.div
  animate={{ x: 100, rotate: 90 }}
  transition={{
    x: { type: "spring", stiffness: 128, damping: 15 },
    rotate: { type: "spring", stiffness: 200, damping: 20 },
  }}
/>
```

### Shared Layout Animations

```tsx
// Assign same layoutId to elements that should morph
{showFeedback && (
  <motion.div layoutId="morph-indicator" transition={SPRING} />
)}
{!showFeedback && (
  <motion.div layoutId="morph-indicator" transition={SPRING} />
)}
```

### Exit Animations with AnimatePresence

```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
    />
  )}
</AnimatePresence>
```

Use `popLayout` mode on AnimatePresence when an element has an exit animation and is in a group.

### Motion Values (No Re-renders)

```tsx
const x = useMotionValue(0);
const y = useMotionValue(0);

function onPan(_, { offset }) {
  x.set(offset.x);
  y.set(offset.y);
}

<motion.div style={{ x, y }} />
```

### Derived Motion Values

```tsx
const scrollY = useMotionValue(0);
const blur = useTransform(scrollY, (y) => clamp(y * 0.005, [0, 4]));

<motion.div style={{ filter: `blur(${blur}px)` }} />
```

### Skip Initial Animation

```tsx
<motion.div
  initial={false} // Skip initial animation
  animate={{ width: expanded ? 300 : 100 }}
/>
```

### Gesture Callbacks

```tsx
<motion.div
  onPan={(event, info) => {
    // info.offset - total offset from start
    // info.delta - change since last event
    // info.velocity - current velocity
  }}
  onPanEnd={(event, info) => {
    const projected = project(info.velocity.x);
  }}
/>
```

### Listening to Motion Value Changes

```tsx
useMotionValueEvent(scrollX, "change", (x) => {
  if (x > threshold) {
    setActive(true);
  }
});
```

---

## Performance

### The Golden Rule

Only animate `transform` and `opacity`. These skip layout and paint stages, running entirely on the GPU.

**Avoid animating:**
- `padding`, `margin`, `height`, `width` (trigger layout)
- `blur` filters above 20px (expensive, especially Safari)
- CSS variables in deep component trees

### Optimization Techniques

```css
/* Force GPU acceleration */
.animated-element {
  will-change: transform;
}
```

**React-specific:**
- Animate outside React's render cycle when possible
- Use refs to update styles directly instead of state
- Re-renders on every frame = dropped frames

**Framer Motion:**

```jsx
// Hardware accelerated (transform as string)
<motion.div animate={{ transform: "translateX(100px)" }} />

// NOT hardware accelerated (more readable)
<motion.div animate={{ x: 100 }} />
```

### CSS vs. JavaScript

- CSS animations run off main thread (smoother under load)
- JS animations (Framer Motion, React Spring) use `requestAnimationFrame`
- CSS better for simple, predetermined animations
- JS better for dynamic, interruptible animations

---

## Accessibility

### prefers-reduced-motion

Whenever you add an animation, also add a media query to disable it:

```css
.modal {
  animation: fadeIn 200ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .modal {
    animation: none;
  }
}
```

### Reduced Motion Guidelines

- Every animated element needs its own `prefers-reduced-motion` media query
- Set `animation: none` or `transition: none` (no `!important`)
- No exceptions for opacity or color—disable all animations
- Show play buttons instead of autoplay videos

### Framer Motion Implementation

```jsx
import { useReducedMotion } from "framer-motion";

function Component() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    />
  );
}
```

---

## Practical Tips

| Scenario | Solution |
| --- | --- |
| Make buttons feel responsive | Add `transform: scale(0.97)` on `:active` |
| Element appears from nowhere | Start from `scale(0.95)`, not `scale(0)` |
| Shaky/jittery animations | Add `will-change: transform` |
| Hover causes flicker | Animate child element, not parent |
| Popover scales from wrong point | Set `transform-origin` to trigger location |
| Sequential tooltips feel slow | Skip delay/animation after first tooltip |
| Small buttons hard to tap | Use 44px minimum hit area (pseudo-element) |
| Something still feels off | Add subtle blur (under 20px) to mask it |
| Hover triggers on mobile | Use `@media (hover: hover) and (pointer: fine)` |
| Overlapping layers look bad | Add 1-4px blur to exiting element |
| Exit feels slow | Double exit animation velocity |

## Theme Transitions

**Important:** Switching themes should not trigger transitions and animations on elements. Disable transitions during theme changes to prevent flash of animated content.

## Drag Gestures

When implementing drag-to-dismiss or similar gestures, ensure velocity-based swiping works. Usually velocity (`swipeAmount / timeTaken`) higher than `0.10` should be sufficient to trigger the action.

## Looping Animations

Pause looping animations when off-screen to save resources.
