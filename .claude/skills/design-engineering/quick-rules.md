# Quick Rules Cheatsheet

The most critical, actionable rules from Devouring Details in scannable format.

---

## Responsiveness

| Rule | Why |
|------|-----|
| **Never delay response to user input** | Feels like lag/skipping a beat |
| **Never fade in menus/popovers** | Users will immediately interact with them |
| **Always fade out on close** | Confirms success, not freeze/error |
| **Skip animation when updates faster than animation** | Prevents cognitive overload |
| **Remove motion from high-frequency tooltips** | Brain processes faster than animation |

---

## Springs & Motion

| Rule | Why |
|------|-----|
| **Use springs for all rotation/translation/scale** | Looks better than easing |
| **Never reuse spring configs between animations** | Each needs tuning for size/context |
| **No bounce on hover/press** | No momentum to reflect |
| **Bounce OK on swipe/throw gestures** | Has velocity to carry |
| **Usually avoid mass parameter** | Makes movement lethargic |
| **Scale down on press only, not hover** | Maps to physical pressure |

---

## Choreography

| Rule | Why |
|------|-----|
| **Elements should move at different speeds/times** | Nature doesn't move in concert |
| **Stagger without introducing lag** | First items must appear immediately |
| **Use blur (1-2px) for overlapping layers** | Softens transitions |
| **Double exit animation velocity** | Cleans up stale state faster |
| **Animate inner container, not root** | Contents won't jarring re-center |

---

## Ergonomics

| Rule | Why |
|------|-----|
| **Minimum touch target: 44px** | Comfortable to press |
| **Wrap icon + input in `<label>`** | Clicking icon focuses input |
| **Never remove focus rings—customize** | Keyboard users need landmarks |
| **Transfer focus to overlays** | Don't strand users |
| **Let users submit forms and see errors** | Easier than tooltip hunting |
| **Two ways to perform touch actions** | Button + gesture |

---

## Scroll

| Rule | Why |
|------|-----|
| **Prefer native scroll over wheel events** | Smoother, works on mobile free |
| **Use clip-path over width for animations** | GPU accelerated, no distortion |
| **Snap cursor to data points** | Eliminates ambiguity |
| **Support both horizontal and vertical scroll** | Different input preferences |

---

## Code Structure

| Rule | Why |
|------|-----|
| **Never nest `<button>` elements** | Invalid HTML |
| **Avoid z-index—restructure markup** | z-index is usually a hack |
| **Use `initial={false}` to skip mount animation** | Prevents jarring page load |
| **Direct DOM updates for high-frequency** | Avoids React re-renders |
| **Derive booleans from existing props** | Reduces prop count |
| **Union props over booleans** | Prevents impossible states |

---

## Robustness

| Rule | Why |
|------|-----|
| **If it can't work 100%, don't do it** | 80% success = "lipstick on a pig" |
| **Interactions must tolerate spamming** | Real users click fast |
| **All animations must be interruptible** | Users won't wait |
| **Test with mechanical mouse wheel** | Reveals choppy scroll |
| **Bind state to keyboard shortcuts** | Faster testing |

---

## Common Pitfalls

| Mistake | Fix |
|---------|-----|
| Animating root element in morph | Animate inner container |
| Using wheel event for scroll | Use native scroll event |
| Width animation for resize | Use clip-path |
| Bounce on button hover | Reserve bounce for gestures |
| Waiting for previous layer to fade | Blur + immediate response |
| Animation on initial render | `initial={false}` |
| Nested buttons | Siblings with expanded hit areas |
| State transitions on page load | Only respond to input/system changes |

---

## Values to Remember

```
Min touch target: 44px
Default spring: { stiffness: 200, damping: 20 }
iOS deceleration rate: 0.998
Blur for overlap: 1-4px
Exit velocity multiplier: 2x
Stagger delay: ~0.05s (50ms)
```
