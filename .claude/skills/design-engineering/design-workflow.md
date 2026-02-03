# Design Workflow

Practical habits for interaction design development.

## Prototyping Philosophy

Skip high-fidelity design tools for interaction work. Jump into code early—you need the final medium to assess feasibility.

### Working With the Material

Code is your material. Like a chair maker testing wood vs concrete, code introduces constraints that shape ideas:

- Framework limitations
- Native system behaviors
- Performance characteristics
- Platform ecosystem

Constraints don't just ground ideas—they shape them. Happy accidents through trial and error influence design direction.

### Prototype Quality

```typescript
// Early prototype: hack together fast
// Hard code values, use hacks, skip clean code
// Goal: get close to production feel quickly
const MAGIC_NUMBER = 47; // Fine for now

// Only polish essential parts
// Don't reduce duct tape until validating the idea
```

## Debugging Techniques

### Visual Debug Tools

Console logging fails at high frequencies. Instead:

```tsx
// Render state visually
<pre>{JSON.stringify(state, null, 2)}</pre>

// Debug rectangles for spatial issues
<div className="debug-rect" />
```

### State Shortcuts

```typescript
useShortcuts({
  L: () => setState("loading"),
  E: () => setState("error"),
  S: () => setState("success"),
  R: () => reset(),
});
```

Faster than manually triggering each state through UI.

### Reduce Complexity

When stuck, remove surrounding code until the issue stops:

1. Move component to isolated page
2. Remove unrelated logic
3. Map out the "broken area"
4. Inspect in isolation

## Motion Analysis

### Slow Motion Review

1. Use browser Animation tab to slow down
2. Manually slow physics in code
3. Record video and scrub frame-by-frame

Complex choreography often requires video scrubbing to understand why something feels off.

## Optical Alignment

### Zoom In

Enable macOS zoom: Accessibility > Zoom > Use scroll gesture with modifier keys

### Measure Precisely

Use PixelSnap to measure elements. Don't hesitate to nudge by 1-2px with transform if:
- Browser inconsistency
- Font baseline doesn't align with icon
- Not hacking around something solvable otherwise

## Iteration Management

### Clipboard History

```bash
# Snapshot entire files to clipboard
# Restore iterations from clipboard history (⌥Z in Raycast)
```

Faster than git for rapid iteration.

### Save Everything

Always save iterations:
- Screenshots
- Videos
- Code snapshots

Ideas build scaffolding for future work—the DD home page used prototypes from unreleased portfolio work.

## Pull Request Quality

### Before and After

Always include visual comparison:

```markdown
| Before | After |
|:------:|:-----:|
| ![before](./before.png) | ![after](./after.png) |
```

- Screenshot only affected areas (not entire screen)
- Keep positioning consistent for easy comparison
- Use "Capture Previous Area" for exact framing
- Cut videos short—show problem and solution concisely

### Context

Include:
- Links to relevant routes
- Description of changes
- Motivation for the change

## Subject Framing

For videos/screenshots:
- Frame elements with perfect centering
- Use equal padding from all sides
- Worth the time for cleaner documentation

## Recording iPhone

For clean device recordings:
1. Connect Bluetooth mouse (Accessibility > Touch > AssistiveTouch)
2. Mouse gestures show in screen recording
3. Record via QuickTime: File > New Movie Recording > Select iPhone
4. Always shows 9:41 time, full battery

## Debug Tools Becoming Features

Sometimes debug interfaces belong in the final product:

```typescript
// Coordinate display: started as debug
// Kept it—complemented "reveal of source" theme
<Debug style={{ opacity: isAltPressed ? 1 : 0 }}>
  x: {x}, y: {y}
</Debug>
```
