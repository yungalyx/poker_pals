# Inferred Intent

Making the layer between software and user intent really thin.

## Core Principle

Inferred intent creates "magical" experiences—as if someone read your mind and predicted what you wanted without asking. These interactions usually solve tedious pain points when you need them most.

## Examples to Learn From

### Clipboard Intelligence

```typescript
// Vercel: Paste multiple env vars at once
// Instead of filling one-by-one, detect clipboard has multiple lines
function onPaste(e) {
  const text = e.clipboardData.getData("text");
  const lines = text.split("\n").filter(Boolean);

  if (lines.length > 1) {
    // Generate fields for each line
    setEnvVars(lines.map(parseEnvLine));
  }
}
```

### Smart Text Handling

From 1992 Apple HIG—still relevant:

- Cut a word with spaces around it → system also cuts the spaces
- Paste word next to another with no space → system adds space if part of sentence

### Context-Aware Defaults

```typescript
// Raycast bookmark extension: infer from active tab
const activeWindow = await getActiveWindow();
const { url, favicon, title } = await getActiveTabByBrowser[activeWindow]();
// User only needs to press ⌘⇧B - no copying/pasting URLs
```

### Movement Velocity

macOS window dragging considers your speed:

- Moving quickly → lets you easily go off screen
- Moving slowly → resistance to help align against edges

### Proximity-Based Suggestions

iOS share sheet suggests recipients using on-device knowledge about frequent and recent contacts when in a crowded room.

## Implementation Patterns

### Velocity-Based Behavior

```typescript
function onDrag(event, { velocity }) {
  const speed = Math.abs(velocity.x);

  if (speed > FAST_THRESHOLD) {
    // Quick movement: allow off-screen
    allowOverflow = true;
  } else {
    // Slow movement: snap to edges
    snapToGuides = true;
  }
}
```

### Context Detection

```typescript
// Adjust interface based on context
if (isConnectedToCarPlay || isDriving) {
  // Spotify-style: larger touch targets, simplified UI
  setAccessibleMode(true);
}

// Apple Wallet: detect presenting for scanning
if (isNearNFCReader) {
  increaseBrightness();
}
```

## Design Questions to Ask

1. What tedious step is the user trying to skip?
2. What context can we infer from their environment/behavior?
3. What would make them feel like we "read their mind"?

The goal: make the interface between intent and software really thin.
