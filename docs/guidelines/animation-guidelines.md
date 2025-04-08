# LiftMate Animation Guidelines

**Date:** 2025-04-08

**Version:** 1.0

## 1. Purpose of Animation

Animations should be used purposefully to enhance the user experience, not merely for decoration. Key purposes include:

*   **Feedback:** Confirm user actions (e.g., button press effect, save confirmation).
*   **State Indication:** Clearly show changes in UI state (e.g., loading indicators, toggles, transitions between views).
*   **Focus & Guidance:** Direct user attention to important elements or guide them through flows.
*   **Delight & Engagement:** Add personality and make interactions more enjoyable (e.g., celebratory effects, subtle thematic elements), but use sparingly.
*   **Spatial Relationships:** Help users understand UI structure and transitions between elements or pages.

## 2. Core Principles

*   **Consistency:** Strive for a consistent feel across all animations.
    *   **Primary Library:** Use **Framer Motion** for most JavaScript-driven animations (state changes, interactions, layout, SVG). See [ADR-005](./../adr/005-animation-library-selection.md).
    *   **Simple Effects:** Use **CSS Transitions/Animations** for basic, non-interactive effects (e.g., hover states, simple fades, loading pulses) where performance is critical and JS control isn't needed.
    *   **Easing:** Prefer Framer Motion's default spring physics for interactive elements for a natural feel. For duration-based animations, use standard ease-in-out curves unless a different effect is specifically desired.
    *   **Duration:** Keep durations for common feedback animations short (e.g., 150-300ms). Longer durations can be used for larger transitions or specific effects, but avoid making the user wait unnecessarily.
*   **Performance:** Animations should be smooth and not degrade application performance.
    *   **Animate Transforms & Opacity:** Prioritize animating `transform` (translate, scale, rotate) and `opacity`, as these are typically handled efficiently by the browser's compositor.
    *   **Avoid Layout Thrashing:** Be cautious animating properties that affect layout (e.g., `width`, `height`, `margin`, `padding`), especially on many elements simultaneously. Use Framer Motion's layout animations where appropriate.
    *   **Optimize Particles/Complex Effects:** If using libraries like `tsParticles`, limit particle count and complexity. Test performance thoroughly on target devices/browsers.
    *   **Debounce/Throttle:** For animations triggered by frequent events (e.g., scroll, resize), use debouncing or throttling techniques.
*   **Subtlety:** Most UI animations should be subtle and enhance the flow, not distract or overwhelm the user. Reserve more noticeable or elaborate animations for significant events (e.g., PR celebrations, workout completion).
*   **Accessibility:** Design animations inclusively.
    *   **Respect `prefers-reduced-motion`:** All non-essential animations MUST respect the user's motion preference. Use CSS media queries (`@media (prefers-reduced-motion: reduce)`) or Framer Motion's built-in handling where applicable to disable or significantly reduce animations.
    *   **Avoid Flashing/Strobing:** Do not create animations that flash rapidly, which can trigger seizures.
    *   **Information:** Ensure critical information conveyed by animation is also available through static text or other non-animated means.

## 3. Library Usage Notes

*   **Framer Motion:**
    *   Use `motion` components (e.g., `motion.div`, `motion.button`, `motion.svg`) as the basis for animations.
    *   Utilize the `animate`, `initial`, `exit`, `whileHover`, `whileTap`, `variants` props for declarative control.
    *   Use `AnimatePresence` for enter/exit animations when components mount/unmount.
    *   Leverage `transition` prop to configure animation type (spring, tween), duration, easing, delay, etc.
    *   Use layout animations (`layout` prop) for smooth transitions when element size or position changes, but test performance.
*   **tsParticles (Conditional):**
    *   Use only when Framer Motion or CSS cannot achieve the desired complex particle effect efficiently.
    *   Configure presets carefully, focusing on minimizing particle count and computational overhead.
    *   Ensure proper cleanup of particle instances when components unmount.

## 4. Review

Animation implementations should be reviewed considering these guidelines, focusing on purpose, performance, consistency, and accessibility.