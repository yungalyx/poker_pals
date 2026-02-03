# Interaction Implementation

Patterns for gesture physics, scroll behavior, and interactive effects.

---

## Rubber Banding (Damping)

Communicates content boundaries without hard stops or explicit indicators.

```typescript
function dampen(
  val: number,
  [min, max]: [number, number],
  factor: number = 2
): number {
  if (val > max) {
    const extra = val - max;
    const dampenedExtra = extra > 0 ? Math.sqrt(extra) : -Math.sqrt(-extra);
    return max + dampenedExtra * factor;
  } else if (val < min) {
    const extra = val - min;
    const dampenedExtra = extra > 0 ? Math.sqrt(extra) : -Math.sqrt(-extra);
    return min + dampenedExtra * factor;
  }
  return val;
}

// Usage
function onPan(_, { offset }) {
  const dampenedY = dampen(offset.y, [-max, max]);
  y.set(dampenedY);
}
```

### When to Use Damping

- Scrolling past content bounds
- Dragging elements with conceptual weight
- Creating sensation of pulling against resistance

---

## Velocity Projection

Calculate where an element would land if movement continued:

```typescript
// Deceleration rate from iOS UIScrollView
function project(initialVelocity: number, decelerationRate = 0.998) {
  return (
    ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate)
  );
}

function onDragEnd(translation: Point, velocity: Point) {
  const projectedPosition = {
    x: translation.x + project(velocity.x),
    y: translation.y + project(velocity.y),
  };

  const nearestCorner = getNearestCorner(projectedPosition);
  animate(nearestCorner);
}
```

### Why Projection Matters

Without projection: must drag element halfway to target.
With projection: short flicks move element based on intent.

This transforms drag gestures into swipe gestures.

---

## Snapping with Velocity

```typescript
function onScrollEnd() {
  const centerX = closestIndex * FRAME_STEP;
  scrolledToX.current = centerX;

  document.documentElement.scrollTop = centerX;
  animate(translateX, -centerX, {
    stiffness: 500,
    damping: 30,
  });

  setActiveIndex(closestIndex);
}
```

### Break Infinite Loops

When programmatically setting scroll position:

```typescript
function onScroll() {
  // Prevent loop when we set scroll position
  if (scrolledToX.current === window.scrollY) {
    return;
  }

  if (translateX.isAnimating()) {
    translateX.stop(); // Allow interruption
  } else {
    translateX.jump(-window.scrollY);
    setActiveIndex(null);
  }
}
```

---

## Native Scroll vs Wheel Events

Always prefer native scroll:

```typescript
// BAD: Wheel event - choppy on mechanical mouse
function onWheel(e) {
  translateX.set(translateX.get() + e.deltaY);
}

// GOOD: Native scroll - smoother values, free rubber banding
// Set document height to scrollable width
const scrollHeight = scrollableWidth - containerWidth;
document.body.style.height = `calc(100vh + ${scrollHeight}px)`;

// Map vertical scroll to horizontal movement
<motion.div
  style={{
    position: "fixed",
    x: scrollY, // scrollY mapped to x
  }}
/>
```

Benefits of native scroll:
- Smoother values across devices
- Free rubber banding
- Keyboard scrolling works
- Better scroll bar affordance
- Works on mobile out of the box

---

## Cursor Snapping

Always snap to data points—eliminates ambiguity:

```typescript
const LINE_GAP = 6;
const LINE_WIDTH = 1;
const LINE_STEP = LINE_WIDTH + LINE_GAP;

function getSnappedX(clientX: number) {
  const { scrollLeft } = rootRef.current;
  const { offsetLeft } = boundsRef.current;
  const offset = scrollLeft - offsetLeft;
  const rootRect = rootRef.current.getBoundingClientRect();
  const relativeX = clientX - rootRect.left + offset;
  return Math.floor(relativeX / LINE_STEP) * LINE_STEP + offsetLeft - scrollLeft;
}
```

---

## Shortest Path Rotation

For radial interfaces, calculate both directions and choose shortest:

```typescript
function getRotateForIndex(index: number, rotate: number) {
  const { degree } = DATA[index];
  const v1 = degree * 2 * -1;
  const v2 = (degree - LINE_COUNT) * 2 * -1;
  const delta1 = rotate - v1;
  const delta2 = rotate - v2;

  if (Math.abs(delta1) < Math.abs(delta2)) {
    return rotate - delta1;
  }
  return rotate - delta2;
}
```

Prevents disorienting long rotations.

---

## Proximity Effects

Scale/animate elements based on distance from cursor:

```typescript
function transformScale(
  distance: number,
  initialValue: number,
  baseValue: number,
  intensity: number
) {
  if (Math.abs(distance) > DISTANCE_LIMIT) {
    return initialValue;
  }

  const normalizedDistance = initialValue - Math.abs(distance) / DISTANCE_LIMIT;
  const scaleFactor = normalizedDistance * normalizedDistance;
  return baseValue + intensity * scaleFactor;
}
```

### With Velocity Falloff

```typescript
const currentVelocity = Math.abs(scrollX.getVelocity());
const transitionDurationMs = 300;
const velocityFactor = Math.min(1, currentVelocity / transitionDurationMs);

const lerped = lerp(initialValue, targetScale, velocityFactor);
value.set(lerped);
```

---

## Clip-Path Animations

Animate size without distorting contents:

```typescript
const FRAME_WIDTH = 72;
const FRAME_WIDTH_EXPANDED = 480;
const FRAME_WIDTH_DIFF = FRAME_WIDTH_EXPANDED - FRAME_WIDTH;
const FRAME_DIFF_CENTER = FRAME_WIDTH_DIFF / 2;

// Clipped state
let clipPath = `inset(0 ${FRAME_DIFF_CENTER}px 0 ${FRAME_DIFF_CENTER}px)`;

// Expanded state
if (activeIndex === index) {
  clipPath = "inset(0px 0px 0px 0px)";
}
```

Benefits:
- GPU accelerated (unlike `width`)
- No image distortion (unlike `scale`)
- Smooth clipping effect

---

## Intersection Detection

Detect overlapping elements:

```typescript
function areIntersecting(
  el1: HTMLElement,
  el2: HTMLElement,
  padding = 0
) {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();

  return !(
    rect1.right + padding < rect2.left ||
    rect1.left - padding > rect2.right ||
    rect1.bottom + padding < rect2.top ||
    rect1.top - padding > rect2.bottom
  );
}
```

Use for dynamic blur/fade when layers overlap on scroll.

---

## Scroll-Based Interpolation

Interpolate values based on scroll position:

```typescript
const blur = useTransform(scrollY, (y) => {
  if (intersectingAtY.get() === 0) return 0;

  const offsetY = Math.abs(y) - intersectingAtY.get();
  return clamp(offsetY * 0.005, [0, 4]);
});
```

---

## Scroll Fading

Fade fixed headers to prevent harsh clipping:

```tsx
<Fade
  side="top"
  stop="50%"
  blur="4px"
  height="48px"
/>
```

```typescript
function onScroll(e) {
  const opacity = clamp(e.currentTarget.scrollTop / 15, [0, 1]);
  fadeRef.current.style.opacity = String(opacity);
}
```

The `15` controls how fast the fade appears—tune per use case.

---

## Transition End Events

Sync UI with animation completion:

```typescript
function navigate(target: HTMLElement) {
  sidebarRef.current.addEventListener(
    "transitionend",
    () => target.scrollIntoView(),
    { once: true } // Auto-cleanup
  );
  closeSidebar();
}
```

---

## Layered Scale Transformations

Create smooth zoom effects with two scales:

1. Scale container up (e.g., 60%) - creates zoom illusion
2. Scale inner elements down (e.g., 20%) - compensates for distortion

```tsx
<motion.div style={{ scale: zoomScale }}>
  <motion.div style={{ scale: 1 / zoomScale * 0.8 }}>
    {/* Contents stay readable */}
  </motion.div>
</motion.div>
```

---

## Custom Cursors

For data-dense interfaces, adapt cursor to content:

- Snap cursor to data points
- Match cursor shape to data visualization
- Dampen Y movement while locked on X axis
- Reduce cursor opacity when freely moving (blends better)

```typescript
// Dampen Y movement for stability
function onPointerMove({ movementY }) {
  movementY = movementY / 5; // Damping factor
  const newY = y.get() + movementY;
  y.jump(newY);
}
```

---

## Staged Interactions

Use distance thresholds, not just time delays:

```typescript
function onPan(_, { offset }) {
  const damping = collapsed ? 1 : 0.5;
  const dampenedY = offset.y * damping;

  // Snap only after 35px - gives moment to register
  if (dampenedY > 35) {
    setCollapsed(true);
  }

  y.set(dampenedY);
}
```

Resetting damping after snap amplifies the effect—feels like peeling off a sticker.
