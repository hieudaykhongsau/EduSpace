# Design System Document: The Intellectual Canvas
 
## 1. Overview & Creative North Star
### Creative North Star: "The Distilled Academy"
To move beyond the utilitarian "utility-box" feel of standard educational tools, this design system adopts the **Distilled Academy** aesthetic. We are not just building a classroom; we are building a sanctuary for focus. 
 
The system rejects the "standard grid" in favor of **intentional asymmetry and tonal depth**. By blending the reliability of a professional suite (Google Classroom) with the fluid, kinetic energy of modern communication (Zoom/Messenger), we create an environment that feels both authoritative and alive. We break the "template" look by using high-contrast typography scales—pairing the functional precision of **Inter** with the editorial authority of **Manrope**.
 
---
 
## 2. Colors & Surface Philosophy
The palette is built on "Professional Blue" and "Vibrant Purple," but their implementation must be sophisticated, not saturating.
 
### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning. 
Structure is defined through **Background Color Shifts**. For example, a chat sidebar (`surface-container-low`) sits against a main video stage (`surface`) without a stroke. The eye should perceive boundaries through shifts in value, not rigid lines.
 
### Surface Hierarchy & Nesting
Treat the UI as physical layers of "Fine Paper" and "Frosted Glass." 
*   **Base:** `surface` (#f9f9ff)
*   **Secondary Content:** `surface-container-low` (#f2f3fd)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) for maximum lift.
*   **Overlays:** Use `surface-bright` for floating elements to create a "glow" effect.
 
### The "Glass & Gradient" Rule
To escape the "flat" look, apply **Glassmorphism** to floating video controls and chat overlays. Use a `surface-variant` with 60% opacity and a 16px backdrop-blur. 
*   **Signature Textures:** Main CTAs (e.g., "Join Class") should use a linear gradient from `primary` (#005bbf) to `primary-container` (#1a73e8) at a 135-degree angle to provide a "tactile" soul.
 
---
 
## 3. Typography
We use a dual-font strategy to balance academic rigor with conversational accessibility.
 
*   **Display & Headlines (Manrope):** Used for "Moments of Arrival"—dashboards, class titles, and high-level headers. The wide apertures of Manrope feel modern and premium.
    *   *Display-LG:* 3.5rem (The "Hero" statement).
*   **Titles & Body (Inter):** Used for the "Work"—chat messages, assignment details, and UI labels. Inter provides unparalleled legibility at small sizes.
    *   *Body-MD:* 0.875rem (The workhorse for chat and descriptions).
*   **Hierarchy Tip:** Always pair a `headline-sm` (Manrope) with a `label-md` (Inter) in all-caps with +5% letter spacing to create an editorial, "curated" feel.
 
---
 
## 4. Elevation & Depth
Traditional drop shadows are banned. We use **Tonal Layering** and **Ambient Light**.
 
*   **The Layering Principle:** Achieve depth by stacking tiers. A student’s assignment card (`surface-container-lowest`) should sit on a class feed (`surface-container-low`). This creates a soft, natural lift.
*   **Ambient Shadows:** For floating modals or "Raise Hand" notifications, use:
    *   `box-shadow: 0 12px 32px -4px rgba(25, 28, 35, 0.06);` 
    *   The shadow color must be a tint of `on-surface` (#191c23), never pure black.
*   **The Ghost Border:** If a boundary is strictly required for accessibility, use `outline-variant` at **15% opacity**. It should be felt, not seen.
 
---
 
## 5. Components
 
### Buttons & Interaction
*   **Primary:** Gradient-filled (`primary` to `primary-container`) with a `md` (0.75rem) corner radius. On hover, increase the gradient saturation.
*   **Secondary:** No fill. Use a `surface-container-high` background.
*   **Tertiary:** Pure text using `primary` color, bolded, with a 2px underline appearing only on hover.
 
### Video Conferencing Module
*   **The Stage:** Use `inverse-surface` (#2d3038) for the video container to create a "Cinematic" focus.
*   **Participant Cards:** Soft `lg` (1rem) corners. The active speaker should not have a border, but a `secondary` (Vibrant Purple) "Glow" shadow.
 
### Chat & Messaging
*   **Bubbles:** Forbid dividers. Use `surface-container-highest` for incoming messages and `primary` for outgoing. 
*   **Spacing:** Use "Grouped Spacing"—messages from the same person have 2px spacing; messages between different people have 12px.
 
### Cards & Lists
*   **The "No-Divider" Rule:** Use `0.75rem` of vertical white space to separate list items. If the list is dense, use alternating tonal shifts (zebra-striping with `surface` and `surface-container-low`).
 
### Input Fields
*   **State:** Soft `DEFAULT` (0.5rem) corners. 
*   **Focus:** Instead of a thick border, the background should shift to `surface-container-lowest` and the `outline` should animate from 10% to 100% opacity in `primary`.
 
---
 
## 6. Do’s and Don'ts
 
### Do
*   **Do** use asymmetrical layouts for dashboards (e.g., a wide 8-column main feed with a 4-column "Upcoming Tasks" column that starts 40px lower than the header).
*   **Do** use the "Vibrant Purple" (`secondary`) exclusively for "Human" elements: Chat notifications, active speakers, and student avatars. 
*   **Do** maximize white space. If a screen feels "busy," increase the padding of the parent container by 24px before removing content.
 
### Don’t
*   **Don’t** use 100% black text. Always use `on-surface` (#191c23) to keep the "Editorial" feel.
*   **Don’t** use "Sharp" corners. Even for full-screen modals, maintain at least a `sm` (0.25rem) radius to keep the platform "Accessible."
*   **Don’t** use standard "Drop Shadows" on cards. If it doesn't lift through color, it shouldn't lift at all.
 
---
 
## 7. Dark Mode Strategy
In Dark Mode, the `surface` tokens flip to deep charcoals, but the **Tonal Layering** remains identical. The `primary` blue should be swapped for `primary-fixed-dim` (#adc7ff) to ensure AA+ accessibility against dark backgrounds without causing eye strain during late-night study sessions.