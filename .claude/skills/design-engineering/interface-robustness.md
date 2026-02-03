# Interface Robustness

Building interactions that work 100% of the time.

## The 80/20 Rule (Inverted)

If your interaction works 80% of the time but fails 20% of the time, the perception of quality is shattered. The result feels like "lipstick on a pig."

The bar for core interactions (scrolling, text input, navigation) is so high that there is no room for "it kinda works."

## Critical Rule

**If a complementary detail can't be done reliably, it should not be done at all.**

Example: Don't build a custom animated text caret if you can't make it work reliably 100% of the time.

## Testing Philosophy

Interface with your interactions like your job title includes "QA":

1. Navigate back and forth
2. Assess every aspect until you stop getting "splinters"
3. Try clicking and quickly scrolling
4. Spam interactions rapidly
5. Test on low battery / slow devices

### Questions to Ask

- How long to receive feedback to a click?
- Did something shift after clicking?
- Visual glitches if I click and quickly scroll?
- Can I break it by scrolling really fast?
- Does it work under "unhappy conditions"?

## State Debugging

Build debug tools to rapidly test all states:

```typescript
useShortcuts({
  I: () => setIssueCount((prev) => prev + 1),
  X: () => setIsExpanded((prev) => !prev),
  R: () => setCount((c) => c + 1),
});
```

Interactions should feel robust, interruptible, and tolerate spamming without breaking.

## Spammability Testing

```typescript
// Spam the state rapidly to find edge cases
// This reveals timing bugs, race conditions, animation conflicts
for (let i = 0; i < 10; i++) {
  setTimeout(() => toggle(), i * 50);
}
```

## Initial State Handling

Never animate on initial render:

```typescript
// BAD: Animates from collapsed to expanded on page load
<motion.div animate={{ width: expanded ? 300 : 100 }} />

// GOOD: Skip animation on initial render
<motion.div
  initial={false}
  animate={{ width: expanded ? 300 : 100 }}
/>

// Or use measured values with fallback
const width = measuredWidth ? measuredWidth : "auto";
```

State transitions should only respond to input or system changes.

## Async Content Stability

For elements with async content, defer measured values until dimensions stabilize:

```typescript
const [isStable, setIsStable] = useState(false);
const measuredWidth = useMeasureWidth(ref);

useEffect(() => {
  if (measuredWidth > 0) {
    // Wait for content to load before using measurements
    const timer = setTimeout(() => setIsStable(true), 100);
    return () => clearTimeout(timer);
  }
}, [measuredWidth]);

const width = isStable ? measuredWidth : "auto";
```

## High-Frequency Update Handling

```typescript
const ANIMATION_DURATION_MS = 150;
const deltaMs = Date.now() - lastUpdate.current;
lastUpdate.current = Date.now();

// Skip animations that can't complete before next update
if (deltaMs <= ANIMATION_DURATION_MS) {
  return;
}
```

## Infinite Loop Prevention

When programmatically setting values that trigger events:

```typescript
function onScrollEnd() {
  const centerX = closestIndex * FRAME_STEP;
  scrolledToX.current = centerX; // Capture target
  document.documentElement.scrollTop = centerX;
}

function onScroll() {
  // Break loop if we're at programmatic target
  if (scrolledToX.current === window.scrollY) {
    return;
  }
  // ... handle user scroll
}
```

## Before Shipping Checklist

- [ ] Test with mechanical mouse wheel (not just trackpad)
- [ ] Test rapid clicking/tapping
- [ ] Test interrupting animations mid-flight
- [ ] Test on slow network
- [ ] Test initial page load (no unwanted animations)
- [ ] Test state transitions in all directions
- [ ] Test keyboard navigation
- [ ] Verify focus management in overlays
