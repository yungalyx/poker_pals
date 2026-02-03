---
name: design-engineering
description: "Design engineering principles and patterns for building polished, accessible web interfaces with high-quality interactions. Use this skill when building UI components, reviewing frontend code, implementing forms, handling touch interactions, optimizing performance, creating marketing pages, or implementing gesture-based interactions. Triggers on: design engineering, UI polish, input fields, form validation, button states, touch devices, mobile UX, accessibility, a11y, keyboard navigation, aria labels, font rendering, typography, layout shift, z-index, animations, transitions, easing, springs, spring physics, hover effects, tap targets, iOS Safari, prefers-reduced-motion, marketing pages, landing pages, dark mode, theme switching, scrollbars, gradients, shadows, virtualization, preloading, interaction design, gesture physics, rubber banding, velocity projection, motion choreography, staggering, interruptibility, drag gestures, swipe gestures, scroll snapping, clip-path animations, focus rings, affordance, ergonomics, inferred intent."
---

# Design Engineering Principles

A comprehensive guide for building polished, accessible web interfaces with high-quality interactions.

**Sources:**
- Emil Kowalski's "Animations on the Web" course
- Rauno Freiberg's "Devouring Details" (devouringdetails.com)

## Philosophy

> "Interaction design is an artform to make experiences that fluidly respond to human intent. Our north star is to make the layer between software and user intent really thin."

## Quick Reference

| Category | When to Use |
| --- | --- |
| [Animations](animations.md) | Enter/exit transitions, springs, choreography, motion/react |
| [UI Polish](ui-polish.md) | Typography, visual design, layout, colors |
| [Forms & Controls](forms-controls.md) | Inputs, buttons, form submission |
| [Touch & Accessibility](touch-accessibility.md) | Mobile, touch devices, keyboard nav, focus rings |
| [Component Design](component-design.md) | Compound components, composition, props API |
| [Marketing](marketing.md) | Landing pages, blogs, docs sites |
| [Performance](performance.md) | Virtualization, preloading, optimization |
| [Design Philosophy](design-philosophy.md) | Mindset, craft, quality principles |
| [Design Workflow](design-workflow.md) | Prototyping, debugging, iteration |
| [Inferred Intent](inferred-intent.md) | "Magical" experiences, smart defaults |
| [Interaction Responsiveness](interaction-responsiveness.md) | Input-response loops, when to skip animation |
| [Interface Robustness](interface-robustness.md) | 100% reliability, testing philosophy |
| [Interaction Implementation](interaction-implementation.md) | Gesture physics, scroll behavior, proximity effects |
| [Usability vs Aesthetics](usability-aesthetics-balance.md) | Creative tension, audience considerations |
| [Quick Rules](quick-rules.md) | Scannable cheatsheet tables |
| [Implementation Snippets](implementation-snippets.md) | Copy-paste CSS and TypeScript utilities |

## Core Principles

### 1. Immediate Response

Never delay response to user input. The input-response loop is fundamental. Transition immediately in response to user input—don't wait for previous animations to complete.

### 2. 100% Reliability

If your interaction works 80% of the time but fails 20%, the perception of quality is shattered. If a complementary detail can't be done reliably, it should not be done at all.

### 3. Interruptibility

All animations must be interruptible. Real-world actions are interruptible—flipping a page doesn't lock you out. Never make users wait for animations to complete.

### 4. Spring Physics

Use springs for all rotation, translation, and scaling movement. CSS `linear()` springs are NOT fluidly interruptible—use motion/react. True spring physics retain momentum and transition with smooth arcs when interrupted.

### 5. Touch-First, Hover-Enhanced

Design for touch first, then add hover enhancements. Disable hover effects on touch devices. Ensure 44px minimum tap targets. Never rely on hover for core functionality.

### 6. Accessibility by Default

Every animation needs `prefers-reduced-motion` support. Every icon button needs an aria label. Every interactive element needs proper focus states. Never remove focus rings—customize them.

## Decision Flowcharts

### Should I Animate This?

```
Will users see this 100+ times daily?
├── Yes → Don't animate
└── No
    ├── Is this user-initiated?
    │   └── Yes → Animate with ease-out or spring
    └── Is this a page transition?
        └── Yes → Animate (300-400ms max)
```

### What Motion Type Should I Use?

```
Does the interaction have momentum (swipe/drag)?
├── Yes → Spring with bounce allowed
└── No (hover/press/tap)
    └── Spring with higher damping (no bounce)
```

### Should I Add Bounce?

```
Is there velocity from user gesture?
├── Yes (swipe, throw, flick) → Bounce OK
└── No (hover, press, tap) → No bounce
```

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| `transition: all` | Specify exact properties |
| Bounce on hover/press | Reserve bounce for gestures with velocity |
| Waiting for animation to finish | Make all animations interruptible |
| Animating `height`/`width` | Use `transform`, `opacity`, or `clip-path` |
| Wheel event for scroll | Use native scroll (smoother, free rubber banding) |
| Animation on page load | Use `initial={false}` to skip |
| Overlapping layers without blur | Add 1-4px blur to exiting element |
| Nested `<button>` elements | Use siblings with expanded hit areas |
| Removing focus rings | Customize with `outline`, never remove |
| z-index: 9999 | Use fixed scale or restructure markup |

## Review Checklist

When reviewing UI code, check:

- [ ] All animations interruptible
- [ ] No animation on initial page load
- [ ] Reduced motion support for all animations
- [ ] Touch targets are 44px minimum
- [ ] Hover effects disabled on touch devices
- [ ] Keyboard navigation works properly
- [ ] Focus rings present and customized
- [ ] Icon buttons have aria labels
- [ ] Forms submit with Enter/Cmd+Enter
- [ ] Inputs are 16px+ to prevent iOS zoom
- [ ] No `transition: all`
- [ ] Springs tuned per animation (not reused)
- [ ] Blur used for overlapping layer transitions

## Reference Files

### Mindset & Principles
- [design-philosophy.md](design-philosophy.md) - Core mindset, quotes, anti-patterns
- [usability-aesthetics-balance.md](usability-aesthetics-balance.md) - Navigating creative tension

### Responsiveness & Feedback
- [interaction-responsiveness.md](interaction-responsiveness.md) - Input-response loops, when to reduce motion
- [interface-robustness.md](interface-robustness.md) - Building 100% reliable interactions
- [inferred-intent.md](inferred-intent.md) - Creating "magical" experiences

### Motion & Animation
- [animations.md](animations.md) - Easing, springs, choreography, motion/react patterns

### Ergonomics & Accessibility
- [touch-accessibility.md](touch-accessibility.md) - Touch devices, keyboard nav, focus rings, a11y

### Implementation
- [interaction-implementation.md](interaction-implementation.md) - Gesture physics, scroll, proximity, snapping
- [component-design.md](component-design.md) - Compound components, composition, props API
- [implementation-snippets.md](implementation-snippets.md) - Copy-paste CSS and TypeScript utilities

### Visual Design
- [ui-polish.md](ui-polish.md) - Typography, shadows, gradients, scrollbars

### Domain-Specific
- [forms-controls.md](forms-controls.md) - Inputs, buttons, form patterns
- [marketing.md](marketing.md) - Landing pages, blogs, docs
- [performance.md](performance.md) - Virtualization, preloading, optimization

### Quick Reference
- [quick-rules.md](quick-rules.md) - All critical rules in scannable tables
- [design-workflow.md](design-workflow.md) - Prototyping, debugging, PR quality
