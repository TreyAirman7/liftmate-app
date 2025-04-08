# ADR 005: Animation Library Selection

**Date:** 2025-04-08

**Status:** Accepted

**Context:**

The application requires various UI animations and transitions to enhance user experience, provide feedback, and implement gamification elements. Requirements include chart transitions, celebratory effects (confetti/particles), progress indicator animations, interactive hover effects, physics-based transitions (springs), generative backgrounds, custom loading indicators, and contextual icon animations. A consistent and capable animation approach is needed.

**Decision:**

1.  **Primary Library: Framer Motion (Motion for React)**
    *   Chosen for its comprehensive features covering physics-based animations (springs), SVG animation capabilities, gesture handling (drag/drop), layout animations, and robust transition control (`AnimatePresence`).
    *   Provides a unified API for many of the required animation types, promoting consistency.
    *   Integrates well with React components.

2.  **Supplementary Approach: CSS Animations/Transitions**
    *   To be used for simpler, performant animations where Framer Motion's complexity is not required (e.g., basic hover effects, simple fades, pulsing skeleton loaders).

3.  **Specialized Library (Conditional): tsParticles (react-tsparticles)**
    *   To be considered specifically for complex particle effects (e.g., detailed confetti, workout completion bursts) if Framer Motion's built-in capabilities are insufficient or overly complex to configure for these specific needs. Performance impact must be carefully evaluated if used.

4.  **Charting Library Animations:**
    *   The animation capabilities of the *currently integrated* charting library will be leveraged first for chart data transitions. Framer Motion may be used to supplement or replace these if the built-in features are inadequate.

**Consequences:**

*   **Pros:**
    *   Provides a powerful and flexible foundation for most animation needs.
    *   Encourages consistency in animation implementation.
    *   Good documentation and community support for Framer Motion.
    *   Leverages hardware acceleration where possible.
*   **Cons:**
    *   Adds Framer Motion as a dependency, increasing bundle size (mitigated by tree-shaking).
    *   Potential learning curve for developers unfamiliar with Framer Motion.
    *   Requires careful implementation to avoid performance issues, especially with complex layout animations or excessive use.
    *   `tsParticles`, if used, adds another dependency and potential performance overhead.

**Alternatives Considered:**

*   **CSS Only:** Simpler, potentially more performant for basic cases, but lacks physics, complex sequencing, and gesture integration capabilities required for several features.
*   **React Spring:** Another capable physics-based library, but Framer Motion offers a slightly broader feature set (including layout animations and easier gesture integration) relevant to the requirements.
*   **GSAP (GreenSock Animation Platform):** Very powerful imperative animation library, but less idiomatic for declarative React state-driven animations compared to Framer Motion or React Spring.
*   **Lottie:** Excellent for complex vector animations designed externally (e.g., After Effects), but overkill for most state-based UI transitions and adds a significant dependency.