---
name: Agentic
url: https://duna.com/
colors:
  primary: '#1b0624'
  primary-hover: '#2e0a42'
  accent: '#aeec1d'
  background: '#ffffff'
  surface-light: '#f7f7f5'
  surface-medium: '#edece7'
  text-primary: '#000000'
  text-secondary: '#1a1816'
  text-muted: '#4d4846'
  text-light-muted: '#898683'
  text-inverse: '#ffffff'
  link: '#1b0624'
  link-footer: '#46838c'
  link-footer-hover: '#2e6369'
  border-light: '#dbd9cd'
  border-dark: 'rgba(255, 255, 255, 0.08)'
typography:
  display:
    family: 'GT America Regular'
    size: 80px
    weight: 400
    line-height: 1.2
  heading:
    family: 'GT America Regular'
    size: 44px
    weight: 400
    line-height: 1.2
  body:
    family: 'Inter'
    size: 16px
    weight: 500
    line-height: 1.2
  caption:
    family: 'Inter'
    size: 12px
    weight: 400
    line-height: 1.5
spacing:
  base: 4px
  scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64]
radius:
  sm: 12px
  md: 16px
  lg: 24px
  full: 999px
elevation:
  card: 'rgba(45, 32, 50, 0.08) 0px 0.602187px 1.80656px -0.666667px, rgba(45, 32, 50, 0.09) 0px 2.28853px 6.8656px -1.33333px, rgba(45, 32, 50, 0.12) 0px 10px 30px -2px'
  hover: 'rgba(45, 32, 50, 0.12) 0px 2px 6px -1px, rgba(45, 32, 50, 0.15) 0px 8px 24px -2px'
  overlay: 'rgba(45, 32, 50, 0.2) 0px 10px 30px -5px'
motion:
  duration-base: '0.4s'
  easing-standard: 'ease-out'
components:
  button-primary:
    bg: '{colors.primary}'
    text: '{colors.text-inverse}'
    radius: '{radius.sm}'
    padding: '16px 24px'
  button-secondary:
    bg: '{colors.background}'
    text: '{colors.primary}'
    radius: '{radius.sm}'
    padding: '16px 24px'
  card:
    bg: '{colors.surface-medium}'
    radius: '{radius.md}'
    shadow: '{elevation.card}'
---

# Design System Inspired by Duna

## 1. Visual Theme & Atmosphere
Duna's design system conveys a refined and professional aesthetic, blending a dark, sophisticated primary color (`#1b0624`) with a vibrant lime green accent (`#aeec1d`). The visual experience is anchored by a unique painterly landscape illustration in the hero section, featuring soft, muted tones and natural elements. Typography is a key differentiator, employing the distinct `GT America Regular` font for impactful headlines up to `80px`, contrasted with the highly legible `Inter` sans-serif for body text at `16px` with a `500` weight.

The layout emphasizes clarity and spaciousness through generous use of whitespace, particularly `64px` vertical section padding and `48px` horizontal padding. Interactive elements like buttons and cards feature subtle `12px` to `16px` border radii and a complex, soft shadow (`rgba(45, 32, 50, 0.08) 0px...`) that adds a premium sense of depth. No significant animation is detected, maintaining a static, focused content delivery.

**Key Characteristics**
*   Painterly landscape illustration in hero.
*   `GT America Regular` for prominent headlines.
*   Dark primary buttons (`#1b0624`) with `12px` radius.
*   Subtle, multi-layered shadows on cards.
*   Ample `48px` to `64px` section padding.
*   `Inter` font `16px/500` for body text.
*   Vibrant `#aeec1d` lime green accent.

## 2. Color Palette & Roles
Duna employs a concise and impactful color palette, primarily leveraging dark tones for brand identity and text, complemented by a single vibrant accent.

-   **Primary**
    -   `primary: #1b0624` — A deep, dark purple-black. This serves as the dominant brand color for primary call-to-action buttons, prominent text accents, and navigation links.
    -   `primary-hover: #2e0a42` — A slightly darker shade of the primary color, used for the hover state of primary interactive elements (inferred from screenshot).
-   **Accent Colors**
    -   `accent: #aeec1d` — A bright, energetic lime green. Used sparingly for small highlight badges, status indicators, and subtle decorative elements to draw attention.
-   **Interactive**
    -   `link: #1b0624` — The primary color is also used for standard text links within content and navigation, maintaining brand consistency.
    -   `link-footer: #46838c` — A muted teal-blue used specifically for links in the footer section, providing a distinct visual identity in that context.
    -   `link-footer-hover: #2e6369` — A darker shade of the footer link color for its hover state (inferred from screenshot).
-   **Neutral Scale**
    -   `text-primary: #000000` — Pure black, used for the most common body text and general content.
    -   `text-secondary: #1a1816` — A very dark grey, used for secondary headings and larger body text where a slightly softer tone than pure black is desired.
    -   `text-muted: #4d4846` — A darker grey, used for less prominent text such as descriptions, sub-labels, and supporting information.
    -   `text-light-muted: #898683` — A light grey, reserved for very subtle text elements, captions, or legal disclaimers.
    -   `text-inverse: #ffffff` — Pure white, used for text that appears on dark backgrounds, such as primary buttons or dark hero sections.
-   **Surface & Borders**
    -   `background: #ffffff` — The default pure white background for the main page canvas.
    -   `surface-light: #f7f7f5` — A very light off-white, used for subtle differentiation of section backgrounds.
    -   `surface-medium: #edece7` — A light, neutral beige-grey, commonly used for card backgrounds and other contained content blocks.
    -   `border-light: #dbd9cd` — A subtle, light grey-beige, used for delicate borders and dividers on light backgrounds.
    -   `border-dark: rgba(255, 255, 255, 0.08)` — A transparent white with low opacity, used for borders on dark backgrounds to provide subtle separation without harsh lines.

## 3. Typography Rules
-   **Font Family**: `GT America Regular`, `Inter`, `sans-serif` (system fallback), `Times New Roman` (monospace fallback).
-   **Hierarchy**:
    -   **Display**: `GT America Regular` `80px` `400` · line-height `1.2` · tracking `-0.02em` · Used for the most impactful hero statements.
    -   **H1**: `GT America Regular` `44px` `400` · line-height `1.2` · tracking `-0.02em` · Main section titles and key messages.
    -   **H2**: `GT America Regular` `32px` `400` · line-height `1.2` · tracking `-0.02em` · Sub-section headings and feature titles.
    -   **Body**: `Inter` `16px` `500` · line-height `1.2` · tracking `normal` · Standard paragraph text and detailed descriptions.
    -   **Small**: `Inter` `14px` `400` · line-height `1.5` · tracking `normal` · Supporting text, sub-descriptions, and meta-information.
    -   **Caption**: `Inter` `12px` `400` · line-height `1.5` · tracking `normal` · Legal disclaimers, timestamps, and very fine print.
    -   **Code/Mono**: `Times New Roman` `12px` `400` · line-height `1.5` · tracking `normal` · (inferred for code snippets or technical representations).
-   **Principles**
    -   Headlines leverage the distinctive `GT America Regular` typeface with generous sizing and subtle negative letter spacing to create a modern, bold presence.
    -   Body and supporting text rely on `Inter` for its high legibility and clean aesthetic, ensuring content is easily digestible.
    -   A consistent line-height of `1.2` for headings and `1.5` for body text maintains visual rhythm and readability across different text scales.
    -   Font weights are predominantly `400` (Regular) and `500` (Medium), providing clear hierarchy without excessive visual noise.

## 4. Component Stylings

### Buttons
Duna features three primary button styles: Primary (dark, high contrast), Secondary (light, outlined), and Ghost (text-only). Each button includes a subtle `0.4s ease-out` transition for interactive states.

#### Primary Button
A high-contrast button with a dark background and inverse text, used for primary calls to action. It features `12px` rounded corners and a slight darkening on hover.

```css
.button-primary {
  background-color: var(--color-primary, #1b0624);
  color: var(--color-text-inverse, #ffffff);
  font-family: var(--typography-body-family, 'Inter'), sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 16px 24px;
  border: none;
  border-radius: var(--radius-sm, 12px);
  cursor: pointer;
  transition: background-color var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out);
}

.button-primary:hover {
  background-color: var(--color-primary-hover, #2e0a42); /* inferred from screenshot */
}

.button-primary:active {
  background-color: var(--color-primary, #1b0624);
  transform: translateY(1px); /* inferred from screenshot */
  transition: transform 0.1s ease-out; /* inferred from screenshot */
}

.button-primary:disabled {
  background-color: var(--color-text-light-muted, #898683); /* inferred from screenshot */
  color: var(--color-text-inverse, #ffffff);
  cursor: not-allowed;
}
```


<details>
<summary>Secondary Button</summary>

A light-themed button with a subtle border and dark text, used for secondary actions or less prominent calls to action. It lightens on hover.

```css
.button-secondary {
  background-color: var(--color-background, #ffffff);
  color: var(--color-primary, #1b0624);
  font-family: var(--typography-body-family, 'Inter'), sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 16px 24px;
  border: 1px solid var(--color-border-light, #dbd9cd); /* inferred from screenshot */
  border-radius: var(--radius-sm, 12px);
  cursor: pointer;
  transition: background-color var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out), border-color var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out);
}

.button-secondary:hover {
  background-color: var(--color-surface-light, #f7f7f5); /* inferred from screenshot */
  border-color: var(--color-text-light-muted, #898683); /* inferred from screenshot */
}

.button-secondary:active {
  background-color: var(--color-surface-medium, #edece7); /* inferred from screenshot */
  transform: translateY(1px); /* inferred from screenshot */
  transition: transform 0.1s ease-out; /* inferred from screenshot */
}

.button-secondary:disabled {
  background-color: var(--color-surface-light, #f7f7f5); /* inferred from screenshot */
  color: var(--color-text-light-muted, #898683);
  border-color: var(--color-text-light-muted, #898683);
  cursor: not-allowed;
}
```

</details>

<details>
<summary>Ghost Button</summary>

A text-only button with a transparent background, used for tertiary actions or navigation within content. It darkens on hover.

```css
.button-ghost {
  background-color: transparent;
  color: var(--color-primary, #1b0624);
  font-family: var(--typography-body-family, 'Inter'), sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 16px 24px;
  border: none;
  border-radius: var(--radius-sm, 12px);
  cursor: pointer;
  transition: color var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out);
}

.button-ghost:hover {
  color: var(--color-text-secondary, #1a1816); /* inferred from screenshot */
}

.button-ghost:active {
  color: var(--color-text-primary, #000000); /* inferred from screenshot */
  transform: translateY(1px); /* inferred from screenshot */
  transition: transform 0.1s ease-out; /* inferred from screenshot */
}

.button-ghost:disabled {
  color: var(--color-text-light-muted, #898683);
  cursor: not-allowed;
}
```

</details>
### Cards & Containers
Cards are used to group related content, featuring a light background, `16px` border radius, and a subtle shadow. On hover, the shadow slightly strengthens to indicate interactivity.

```css
.card {
  background-color: var(--color-surface-medium, #edece7);
  color: var(--color-text-primary, #000000);
  padding: 32px;
  border-radius: var(--radius-md, 16px);
  box-shadow: var(--elevation-card, rgba(45, 32, 50, 0.08) 0px 0.602187px 1.80656px -0.666667px, rgba(45, 32, 50, 0.09) 0px 2.28853px 6.8656px -1.33333px, rgba(45, 32, 50, 0.12) 0px 10px 30px -2px);
  transition: box-shadow var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out);
}

.card:hover {
  box-shadow: var(--elevation-hover, rgba(45, 32, 50, 0.12) 0px 2px 6px -1px, rgba(45, 32, 50, 0.15) 0px 8px 24px -2px); /* inferred from screenshot */
}
```

### Inputs & Forms

#### Text Input
Standard text input fields have a white background, dark text, and a light border. The focus state highlights the border and adds a subtle focus ring.

```css
.input-text {
  background-color: var(--color-background, #ffffff);
  color: var(--color-text-primary, #000000);
  font-family: var(--typography-body-family, 'Inter'), sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 16px;
  border: 1px solid var(--color-border-light, #dbd9cd);
  border-radius: var(--radius-sm, 12px);
  transition: border-color var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out), box-shadow var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out);
}

.input-text:focus {
  border-color: var(--color-primary, #1b0624);
  outline: 2px solid var(--color-primary, #1b0624); /* inferred from screenshot */
  outline-offset: 2px; /* inferred from screenshot */
  box-shadow: 0 0 0 2px var(--color-primary, #1b0624); /* inferred from screenshot */
}

.input-text:disabled {
  background-color: var(--color-surface-light, #f7f7f5);
  color: var(--color-text-light-muted, #898683);
  border-color: var(--color-border-light, #dbd9cd);
  cursor: not-allowed;
}
```


<details>
<summary>Form Label</summary>

Labels for form fields use a dark secondary text color.

```css
.form-label {
  color: var(--color-text-secondary, #1a1816);
  font-family: var(--typography-body-family, 'Inter'), sans-serif;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
}
```

</details>

<details>
<summary>Checkbox/Radio</summary>

Standard checkbox and radio button styling, with the primary brand color for the checked state.

```css
.checkbox, .radio {
  appearance: none;
  width: 20px; /* inferred from screenshot */
  height: 20px; /* inferred from screenshot */
  border: 1px solid var(--color-border-light, #dbd9cd);
  border-radius: 4px; /* inferred from screenshot */
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
  transition: background-color 0.2s ease-out, border-color 0.2s ease-out; /* inferred from screenshot */
}

.radio {
  border-radius: var(--radius-full, 999px);
}

.checkbox:checked, .radio:checked {
  background-color: var(--color-primary, #1b0624);
  border-color: var(--color-primary, #1b0624);
}

.checkbox:focus, .radio:focus {
  outline: 2px solid var(--color-primary, #1b0624); /* inferred from screenshot */
  outline-offset: 2px; /* inferred from screenshot */
}

.checkbox:disabled, .radio:disabled {
  background-color: var(--color-surface-light, #f7f7f5);
  border-color: var(--color-border-light, #dbd9cd);
  cursor: not-allowed;
}
```

</details>
### Navigation

#### Top Navigation Bar
The top navigation bar is transparent over the hero image and becomes a solid white background on scroll (inferred). It features navigation links and a primary call-to-action button.

```css
.nav-bar {
  background-color: transparent; /* inferred from screenshot */
  padding: 24px 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 10; /* inferred from elevation.zIndexValues */
  transition: background-color var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out); /* inferred from screenshot */
}

/* Example scrolled state */
.nav-bar.scrolled {
  background-color: var(--color-background, #ffffff); /* inferred from screenshot */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* inferred from screenshot */
}
```


<details>
<summary>Navigation Link</summary>

Links within the navigation bar use the primary brand color and darken slightly on hover.

```css
.nav-link {
  color: var(--color-primary, #1b0624);
  font-family: var(--typography-body-family, 'Inter'), sans-serif;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: var(--radius-sm, 12px); /* inferred from screenshot */
  transition: color var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out), background-color var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out);
}

.nav-link:hover {
  color: var(--color-text-secondary, #1a1816); /* inferred from screenshot */
  background-color: var(--color-surface-light, #f7f7f5); /* inferred from screenshot */
}

.nav-link.active,
.nav-link[aria-current="page"] {
  color: var(--color-text-primary, #000000); /* inferred from screenshot */
  font-weight: 700; /* inferred from screenshot */
}
```

</details>

<details>
<summary>Dropdown Menu</summary>

(No explicit dropdown menu observed in source screenshots.)

</details>
### Links

#### Standard Link
Standard inline text links use the primary brand color and show an underline on hover.

```css
.link-standard {
  color: var(--color-link, #1b0624);
  text-decoration: none;
  transition: text-decoration-color 0.2s ease-out, color 0.2s ease-out; /* inferred from screenshot */
}

.link-standard:hover {
  text-decoration: underline;
  text-decoration-color: var(--color-link, #1b0624);
  color: var(--color-text-secondary, #1a1816); /* inferred from screenshot */
}

.link-standard:visited {
  color: var(--color-link, #1b0624); /* inferred from screenshot */
}
```


<details>
<summary>Secondary Link</summary>

Links used in less prominent areas, such as the footer, use a distinct teal color.

```css
.link-secondary {
  color: var(--color-link-footer, #46838c);
  text-decoration: none;
  transition: color var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out);
}

.link-secondary:hover {
  color: var(--color-link-footer-hover, #2e6369); /* inferred from screenshot */
  text-decoration: underline; /* inferred from screenshot */
}

.link-secondary:visited {
  color: var(--color-link-footer, #46838c); /* inferred from screenshot */
}
```

</details>
### Badges
Duna uses small, pill-shaped badges for informational highlights.

#### Primary Badge
A dark badge with inverse text, used for important announcements.

```css
.badge-primary {
  background-color: var(--color-primary, #1b0624);
  color: var(--color-text-inverse, #ffffff);
  font-family: var(--typography-caption-family, 'Inter'), sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: var(--radius-full, 999px);
  display: inline-flex;
  align-items: center;
  gap: 4px; /* inferred from screenshot */
}
```


<details>
<summary>Accent Badge</summary>

A lime green badge with primary text, used for highlighting specific features or categories.

```css
.badge-accent {
  background-color: var(--color-accent, #aeec1d);
  color: var(--color-primary, #1b0624);
  font-family: var(--typography-caption-family, 'Inter'), sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: var(--radius-full, 999px);
  display: inline-flex;
  align-items: center;
  gap: 4px; /* inferred from screenshot */
}
```

</details>
## 5. Layout Principles
-   **Spacing System**: Base unit `4px` → scale `[0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64]`.
    -   **Usage Context**:
        -   `4px`: Smallest inline gaps, icon-to-text spacing.
        -   `8px`: Padding within small components, spacing between form elements.
        -   `12px`: Button internal padding, spacing between list items.
        -   `16px`: Component internal padding, spacing between related content blocks.
        -   `20px`: Vertical spacing between paragraphs or minor sections.
        -   `24px`: Standard vertical spacing between major elements, card internal padding.
        -   `32px`: Sectional padding within larger containers, spacing between distinct components.
        -   `40px`: Larger vertical separation, spacing for feature blocks.
        -   `48px`: Horizontal padding for main content areas, large component spacing.
        -   `64px`: Generous vertical padding between main page sections.
-   **Grid & Container** _Note: container widths and column counts are not extracted from the source. The values below are reasonable defaults inferred from the visible layout density._
    -   **Max Width**: `1280px` (inferred from screenshot)
    -   **Columns**: `12` (inferred from screenshot)
    -   **Gutter**: `24px` (inferred from screenshot)
    -   **Section Padding**: `64px` vertical, `48px` horizontal (inferred from screenshot)
-   **Whitespace Philosophy**: Duna employs ample and deliberate whitespace to create a sense of calm and focus. Large vertical and horizontal padding around sections, and within components, contributes to a spacious and uncluttered visual environment, allowing content to breathe and stand out. This approach enhances readability and guides the user's eye through the content hierarchy.
-   **Border Radius Scale**:
    -   `sm: 12px` — Used for buttons, input fields, and small interactive elements.
    -   `md: 16px` — Applied to cards, larger content containers, and image frames.
    -   `lg: 24px` — For prominent UI elements or distinct content blocks requiring a softer, more inviting appearance.
    -   `full: 999px` — Reserved for pill-shaped badges, avatars, or other circular elements.

## 6. Depth & Elevation
Duna uses a subtle, multi-layered shadow to provide depth, primarily for interactive components and cards. Z-index values are explicitly defined for stacking order.

-   **Flat (z-0)**: `none` — Default state for most background elements and static content.
-   **Base (z-1)**: `none` — Standard interactive elements like links and text inputs that do not cast a shadow.
-   **Card (z-2)**: `rgba(45, 32, 50, 0.08) 0px 0.602187px 1.80656px -0.666667px, rgba(45, 32, 50, 0.09) 0px 2.28853px 6.8656px -1.33333px, rgba(45, 32, 50, 0.12) 0px 10px 30px -2px` — Applied to standard cards and content blocks, providing a soft lift.
-   **Hover (z-3)**: `rgba(45, 32, 50, 0.12) 0px 2px 6px -1px, rgba(45, 32, 50, 0.15) 0px 8px 24px -2px` — Slightly stronger shadow for interactive cards on hover (inferred from screenshot).
-   **Dropdown (z-4)**: `rgba(45, 32, 50, 0.2) 0px 10px 30px -5px` — Used for dropdown menus or tooltips (inferred from screenshot).
-   **Modal (z-5)**: `rgba(45, 32, 50, 0.2) 0px 10px 30px -5px` — For fixed overlays and modal dialogs, ensuring they appear above all other content (inferred from screenshot).

**Shadow Philosophy**: Duna's shadow philosophy is characterized by a single, nuanced shadow style that creates a refined sense of depth. The shadow is dark-tinted (`rgba(45, 32, 50, ...)`) and multi-layered, providing a gentle, natural lift for interactive elements and cards without appearing heavy or distracting. This subtle approach reinforces the brand's professional and polished aesthetic.

## 7. Do's and Don'ts

### Do's
-   **Do** use `GT America Regular` for all display and heading elements, ensuring a consistent brand voice.
-   **Do** apply `text-primary: #000000` for body text on `background: #ffffff`, which has a WCAG ratio of 21:1 (AAA).
-   **Do** maintain a minimum `24px` vertical spacing between distinct `Card` components for clarity.
-   **Do** use `primary: #1b0624` for all `Primary Button` backgrounds to highlight key calls to action.
-   **Do** apply `radius.sm: 12px` to all buttons and input fields for a consistent soft-rounded aesthetic.
-   **Do** use `link-footer: #46838c` for all footer links, ensuring it passes AA-large contrast (4.3:1) on `background: #ffffff`.
-   **Do** ensure `Accent Badge` elements use `accent: #aeec1d` as background and `primary: #1b0624` for text.
-   **Do** incorporate `48px` horizontal padding and `64px` vertical padding for main page sections.
-   **Do** use `text-muted: #4d4846` for secondary descriptions, which achieves a 9.01:1 (AAA) contrast on `background: #ffffff`.
-   **Do** apply a `2px` `primary: #1b0624` outline-offset on `:focus` states for `Text Input` fields.

### Don'ts
-   **Don't** use `text-light-muted: #898683` for body text on `background: #ffffff`, as its 3.62:1 ratio only passes AA-large, not AAA.
-   **Don't** introduce custom spacing values; adhere strictly to the `[0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64]px` scale.
-   **Don't** use `Inter` for display or heading typography; reserve `GT America Regular` for these roles.
-   **Don't** apply `elevation.card` shadow to simple `link-standard` elements; reserve it for `Card` components.
-   **Don't** use `primary: #1b0624` as a background color for `Secondary Button` variants.
-   **Don't** use `text-inverse: #ffffff` on `surface-light: #f7f7f5` backgrounds, as it would result in low contrast.
-   **Don't** deviate from `radius.md: 16px` for `Card` components.
-   **Don't** use `text-light-muted: #898683` for any interactive element text.
-   **Don't** apply `text-decoration: underline` by default to `link-standard` elements; it should appear only on `:hover`.
-   **Don't** use `font-weight: 400` for `Body` text; always use `font-weight: 500`.

## 8. Responsive Behavior *(Note: breakpoints below are industry-standard recommendations, not measurements from the source. Adjust to the brand's actual media queries when implementing.)*
-   **Breakpoints**:
    -   **Mobile Small** (~375px): `(max-width: 719.98px)`: Stack content vertically, hide secondary navigation.
    -   **Mobile Large** (~719px): `(max-width: 719px)`: Adjust typography sizes, optimize image scaling.
    -   **Tablet** (~1199px): `(max-width: 1199px) and (min-width: 720px)`: Two-column layouts, larger touch targets.
    -   **Desktop** (~1599px): `(min-width: 1200px) and (max-width: 1599px)`: Standard multi-column layouts.
    -   **Desktop Large** (~1600px): `(min-width: 1600px)`: Maximize content width, larger hero images.
-   **Touch Targets**:
    -   Ensure all interactive elements, like `Primary Button` and `nav-link`, have a minimum tap area of `44px` by `44px`.
    -   Maintain at least `12px` of clear space between adjacent touch targets to prevent accidental taps.
-   **Collapsing Strategy**:
    -   **Navigation**: Collapse main navigation links into a hamburger menu below `719px`; the "Schedule a demo" `Primary Button` remains visible.
    -   **Cards**: `Card` components transition from multi-column grids to single-column stacking on mobile breakpoints.
    -   **Typography**: `Display` and `Heading` font sizes scale down significantly on smaller viewports for readability.
    -   **Padding**: Sectional padding (e.g., `64px`) reduces to `32px` or `24px` on mobile to optimize screen real estate.
    -   **Forms**: `Text Input` fields expand to full width on mobile, and labels stack above inputs.
    -   **Spacing**: Larger spacing values like `48px` and `64px` are often halved on mobile for a denser layout.

## 9. Agent Prompt Guide
-   **Quick Color Reference**
    -   `primary: #1b0624`
    -   `primary-hover: #2e0a42`
    -   `accent: #aeec1d`
    -   `background: #ffffff`
    -   `surface-light: #f7f7f5`
    -   `surface-medium: #edece7`
    -   `text-primary: #000000`
    -   `text-secondary: #1a1816`
    -   `text-muted: #4d4846`
    -   `text-light-muted: #898683`
    -   `text-inverse: #ffffff`
    -   `link: #1b0624`
    -   `link-footer: #46838c`
    -   `link-footer-hover: #2e6369`
    -   `border-light: #dbd9cd`
    -   `border-dark: rgba(255, 255, 255, 0.08)`
-   **Iteration Guide**
    1.  Always use `primary: #1b0624` for `Primary Button` backgrounds.
    2.  Always use `GT America Regular` for `Display` and `Heading` text roles.
    3.  Always use `Inter` `16px/500` for `Body` text.
    4.  Always use spacing values from the `[0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64]px` scale.
    5.  Always apply `radius.sm: 12px` to buttons and inputs, and `radius.md: 16px` to `Card` components.
    6.  Always ensure `Primary Button` height is approximately `52px` (32px padding + 16px font size + 2px line height, inferred).
    7.  Always include `:focus` state with a `2px` `primary: #1b0624` outline for `Text Input` fields.
    8.  Always ensure `nav-link` has a `:hover` state that changes color to `text-secondary: #1a1816` and background to `surface-light: #f7f7f5`.
    9.  Always use `elevation.card` for `Card` components, and `elevation.hover` for their `:hover` state.
    10. Always reduce main section padding from `64px` to `32px` on mobile breakpoints below `720px`.
    11. Always ensure `text-primary: #000000` on `background: #ffffff` passes AAA contrast (21:1).
    12. Always apply `transition: background-color var(--motion-duration-base, 0.4s) var(--motion-easing-standard, ease-out);` to interactive elements.