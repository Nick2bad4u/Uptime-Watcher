---
name: "CSS-Guidelines"
description: "CSS development standards and best practices using Tailwind CSS v4 and modern CSS features."
applyTo: "**/*.css"
---

# CSS Development Instructions

Instructions for writing high-quality, maintainable, and modern CSS in this project. The project uses **Tailwind CSS v4** with a CSS-first configuration approach, leveraging modern CSS features like logical properties, nesting, and `color-mix`.

---

## Project Context

-   **Framework**: Tailwind CSS v4 (CSS-first configuration).
-   **Structure**: Component-based CSS files imported into a central `index.css`.
-   **Methodology**: Hybrid approach using Tailwind utilities and custom BEM-like component classes.
-   **Linting**: Stylelint is enforced.

---

## Syntax and Modern Features

### Logical Properties

-   **ALWAYS** use logical properties instead of physical properties to ensure support for different writing modes (LTR/RTL).
    -   `margin-left` / `margin-right` -> `margin-inline-start` / `margin-inline-end`
    -   `margin-top` / `margin-bottom` -> `margin-block-start` / `margin-block-end`
    -   `width` -> `inline-size`
    -   `height` -> `block-size`
    -   `top` / `bottom` / `left` / `right` -> `inset-block-start` / `inset-block-end` / `inset-inline-start` / `inset-inline-end`

### Nesting

-   **USE** native CSS nesting for cleaner and more readable code.
-   Use `&` to reference the parent selector.

```css
.card {
    /* ... */

    &__header {
        /* ... */
    }

    &:hover {
        /* ... */
    }

    @media (width >= 768px) {
        /* ... */
    }
}
```

### Color Manipulation

-   **USE** `color-mix()` for creating color variations (transparency, tints, shades) instead of `opacity` or pre-calculated hex codes. This maintains the opaque background where needed.

```css
.element {
    background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-border-primary) 80%, black);
}
```

### Cascade Layers

-   **USE** `@layer` to control the cascade and specificity of your styles, especially when overriding or extending framework defaults.
-   Common layers: `base`, `components`, `utilities`.

```css
@layer components {
    .btn {
        /* ... */
    }
}
```

### Fluid Typography and Spacing

-   **USE** `clamp()` for responsive values that adapt to the viewport width.

```css
.container {
    padding: clamp(1rem, 5vw, 3rem);
    font-size: clamp(1rem, 1rem + 0.5vw, 1.5rem);
}
```

---

## Naming Conventions

-   **Components**: Use a BEM-like naming convention for custom component classes to avoid conflicts and ensure clarity.
    -   Block: `.dashboard-overview`
    -   Element: `.dashboard-overview__card`
    -   Modifier: `.dashboard-overview__card--active`
-   **Themed Components**: Prefix generic themed components with `.themed-` (e.g., `.themed-box`, `.themed-input`, `.themed-button`).
-   **Utilities**: Use standard Tailwind utility names or follow the pattern for custom utilities (e.g., `.text-sm`, `.flex`).

---

## Theming and Variables

-   **CSS Variables**: Use CSS custom properties for all design tokens (colors, spacing, shadows, radii).
    -   Colors: `--color-primary-500`, `--color-surface-elevated`, `--color-text-primary`
    -   Spacing: `--spacing-md`, `--spacing-lg`
    -   Shadows: `--shadow-elevation-1`, `--shadow-base-color`
-   **Tailwind Configuration**: Define theme extensions in the `@theme` block in `index.css` or relevant CSS files.

```css
@theme {
    --animate-fade-in: fade-in 0.2s ease-out forwards;
    --radius-xl: 0.75rem;
}
```

---

## Responsiveness

-   **Media Queries**: Nest media queries within the selector they modify when possible.
-   **Breakpoints**: Use standard breakpoints or project-specific variables (e.g., `--breakpoint-3xl`).
-   **Mobile-First**: Write base styles for mobile first, then use media queries for larger screens.

```css
.grid {
    grid-template-columns: 1fr;

    @media (width >= 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

---

## Accessibility

-   **Reduced Motion**: Always include a `@media (prefers-reduced-motion: reduce)` block for elements with transitions or animations.

```css
.card {
    transition: transform var(--transition-normal);

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
}
```

-   **Dark Mode**: Use `@media (prefers-color-scheme: dark)` or `.dark` class (if configured) for dark mode overrides.
-   **High Contrast**: Consider `@media (prefers-contrast: more)` for accessibility enhancements.

---

## Best Practices

-   **Grouping**: Group related properties together (Layout, Box Model, Typography, Visuals, Misc).
-   **Comments**: Use comments to explain complex logic, magic numbers, or `stylelint-disable` reasons.
-   **Imports**: Keep `index.css` clean by importing component-specific CSS files.
-   **Avoid**:
    -   Using `!important` unless absolutely necessary.
    -   Deeply nested selectors (more than 3 levels).
    -   Hardcoded colors (always use variables).
