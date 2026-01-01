---
name: "TypeScript-Storybook-Testing-Guidelines"
description: "High-quality Storybook authoring and testing guidelines for TypeScript React components, focusing on .stories.tsx files"
applyTo: "**/*.stories.tsx, **/*.stories.ts, **/*.stories.mdx"
---

# Storybook Authoring & Testing Guidelines (TypeScript React)

These guidelines describe **how to write high-quality Storybook stories** in TypeScript for React components and how to **test them effectively** (interaction tests, visual/regression tests, accessibility checks). They focus on `*.stories.tsx` files.

Use these instructions whenever creating or editing Storybook stories.

---

## 1. File Naming, Location, and Basic Structure

### 1.1 File Naming

-   Use the extension:
    -   `ComponentName.stories.tsx` for React components (preferred).
    -   `ComponentName.stories.ts` for non-JSX/utility stories (rare).
-   One `.stories.tsx` file per **component** or **closely related set of components**.

**Examples:**

-   `Button.stories.tsx`
-   `TextField.stories.tsx`
-   `Dialog.stories.tsx`

### 1.2 Placement

-   Co-locate stories near the component by default:

    ```
    src/components/Button/Button.tsx
    src/components/Button/Button.stories.tsx
    ```

-   For shared or design-system components:
    -   Use a consistent and shallow hierarchy in `title` (e.g., `"Forms/Button"`, `"Data Display/Badge"`).

---

## 2. Storybook CSF Basics (Component Story Format)

Use **CSF** (`export default` meta + named story exports).

### 2.1 Essential Imports

```ts
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
```

### 2.2 Meta Definition

-   Always define a typed `meta` with `satisfies Meta<typeof Component>`.

```ts
const meta = {
    title: "Forms/Button",
    component: Button,
    tags: ["autodocs"], // enables Storybook Docs auto-generation
    parameters: {
        layout: "centered",
    },
    argTypes: {
        onClick: { action: "clicked" },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;
```

**Guidelines:**

-   `title`:
    -   Use a **category** and a **component name**: `"Category/ComponentName"`.
    -   Keep hierarchy shallow (1–2 levels).
-   `tags`:
    -   Use `"autodocs"` when you want docs pages.
    -   Use custom tags sparingly (e.g., `"wip"`, `"deprecated"`), only if your project recognizes them.
-   `parameters`:
    -   Prefer **per-story overrides** instead of setting everything globally.
    -   Common ones: `layout`, `controls`, `actions`, `backgrounds`, `docs`, `viewport`.

---

## 3. Writing High-Quality Stories

### 3.1 Principles

Each story should:

1. Represent a **single, meaningful state** of the component.
2. Use **realistic data** and values.
3. Be **stable** (no random or time-based variability).
4. Be **test-friendly** (deterministic and accessible).

### 3.2 Basic Story Pattern

```ts
export const Primary: Story = {
    args: {
        variant: "primary",
        children: "Primary button",
    },
};
```

-   Prefer the **object** style (`StoryObj`) rather than functions.
-   Use `args` to configure props; avoid inline JSX when possible.

### 3.3 Naming Stories

-   Use descriptive, user-facing names:
    -   `Primary`, `Secondary`, `Disabled`, `WithIcon`, `Loading`, `ErrorState`.
-   Avoid:
    -   `Default1`, `Default2`, `TestCaseA`.
-   Story names should communicate **scenario + distinctive behavior**.

### 3.4 Using Args

-   `args`:
    -   Represent a single state of the component.
    -   Should be minimal, but enough to clearly show the intended behavior.

```ts
export const Disabled: Story = {
    args: {
        variant: "primary",
        disabled: true,
        children: "Disabled button",
    },
};
```

-   Prefer `children` with short text that explains the state (e.g., `"Disabled button"`).

---

## 4. Reuse and Composition with Template Stories

For components with many variants, use a strongly typed Template function only when needed.

### 4.1 Template Pattern (when necessary)

```ts
import type { Meta, StoryFn } from "@storybook/react";

const meta = {
    title: "Forms/Button",
    component: Button,
} satisfies Meta<typeof Button>;

export default meta;

const Template: StoryFn<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    variant: "primary",
    children: "Primary button",
};

export const Secondary = Template.bind({});
Secondary.args = {
    variant: "secondary",
    children: "Secondary button",
};
```

**Guidelines:**

-   Prefer `StoryObj` style for **new stories**.
-   Use Template pattern only for **older stories** or when explicitly requested by project convention.

---

## 5. Accessibility (a11y) in Stories

### 5.1 General a11y Guidelines

-   Ensure interactive elements have proper roles and labels.
-   Use text and ARIA labels that reflect real use.
-   Avoid disabling focusable elements unless the story is about disabled state.

### 5.2 a11y Parameters

Use Storybook’s a11y addon (if available) and configure per story when needed:

```ts
export const Accessible: Story = {
    args: {
        // ...
    },
    parameters: {
        a11y: {
            // override axe rules only when absolutely necessary
            // disable: true is strongly discouraged
        },
    },
};
```

-   Avoid `a11y: { disable: true }` unless the story is explicitly known to be inaccessible and documenting that behavior.

---

## 6. Controls, ArgTypes, and Documentation

### 6.1 ArgTypes

Use `argTypes` to control how props are exposed in the controls panel.

```ts
const meta = {
    // ...
    argTypes: {
        variant: {
            control: { type: "select" },
            options: ["primary", "secondary", "ghost"],
        },
        onClick: { action: "clicked" },
    },
} satisfies Meta<typeof Button>;
```

**Best Practices:**

-   Use controls for boolean, number, select, text, and color props.
-   Use `action` handlers for event callbacks (`onClick`, `onChange`, etc.)
-   Hide implementation-specific or internal props:

    ```ts
    argTypes: {
      internalProp: { table: { disable: true } },
    }
    ```

### 6.2 Story-level Documentation

-   Use `parameters.docs.description.story` for per-story descriptions:

```ts
export const WithIcon: Story = {
    args: {
        variant: "primary",
        children: "Save",
        startIcon: <SaveIcon />,
    },
    parameters: {
        docs: {
            description: {
                story: "A primary button with a leading icon for save actions.",
            },
        },
    },
};
```

-   Keep descriptions concise, and focus on **behavior and usage**, not implementation details.

---

## 7. Interaction Testing (`play` functions)

Use Storybook’s **`play`** function for interaction tests, typically with Testing Library utilities:

```ts
import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect } from "@storybook/test";
import { TextField } from "./TextField";

const meta = {
    title: "Forms/TextField",
    component: TextField,
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilledAndSubmitted: Story = {
    args: {
        label: "Email",
        placeholder: "you@example.com",
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step("Type an email", async () => {
            const input = canvas.getByLabelText("Email");
            await userEvent.type(input, "user@example.com");
            await expect(input).toHaveValue("user@example.com");
        });

        await step("Submit the form", async () => {
            const submitButton = canvas.getByRole("button", {
                name: /submit/i,
            });
            await userEvent.click(submitButton);

            const success = await canvas.findByText(/submitted successfully/i);
            await expect(success).toBeInTheDocument();
        });
    },
};
```

### 7.1 Guidelines for `play` Tests

-   Use `step` to break the interaction into logical phases.
-   Use **Testing Library** queries (`getByRole`, `getByLabelText`, `getByText`) and avoid query patterns that depend on DOM structure (like `querySelector`).
-   Ensure tests are **deterministic**:
    -   Avoid random delays.
    -   Wait for expected UI changes using `findBy*` or `waitFor`.
-   Use `expect` from `@storybook/test` to add assertions.

### 7.2 When to Use `play` Functions

Use `play` when:

-   Validating that the component behaves correctly upon user interaction.
-   Demonstrating a multi-step flow (typing, clicking, navigation).
-   Testing integration between multiple sub-components in a story.

Avoid `play` when:

-   Simply rendering static state (that’s already covered by the story).
-   The behavior is more easily tested in a dedicated unit/integration test.

---

## 8. Storybook Testing Strategies

### 8.1 Chromatic / Visual Regression

If using a visual regression tool (e.g., Chromatic):

-   Each story represents a **snapshot**; ensure stories are stable:
    -   Avoid current timestamps, random numbers, or environment-dependent content.
    -   Use fixed mock data instead of live API calls.
-   For stories that cannot be stable, mark them appropriately using parameters (e.g., dynamic content, animations).

```ts
export const Animated: Story = {
    args: {
        // ...
    },
    parameters: {
        chromatic: { disableSnapshot: true }, // if animations cannot be stabilized
    },
};
```

### 8.2 Unit/Integration Tests with Storybook Stories

-   Consider reusing stories as **fixtures** in unit tests (via Storybook’s testing utilities if your setup allows).
-   Prefer coverage of **core logic** in separate unit tests, and use Storybook interaction tests for **user flows and visual behavior**.

---

## 9. Handling State, Data, and Async Behavior

### 9.1 Stateless vs. Stateful

-   Prefer stories that treat the component as **controlled** (via `args`).
-   Use `args` and the `render` (or `decorators`) option to manage local state when necessary.

```ts
export const ControlledInput: Story = {
    render: (args) => {
        const [value, setValue] = React.useState("");

        return (
            <TextField
                {...args}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        );
    },
    args: {
        label: "Name",
    },
};
```

### 9.2 Async Data and MSW Handlers

-   Avoid real network calls in stories—Storybook should remain deterministic offline.
-   Register request mocks with MSW, which is already initialised globally in `storybook/preview.ts` via `msw-storybook-addon`.
-   Keep handlers local to the story (or colocated helper) so they are easy to trace and reset between stories.

```ts
import { rest } from "msw";

const mockSites = [
    {
        id: "demo-site",
        label: "Demo",
        status: "up",
    },
];

export const WithMockedData: Story = {
    parameters: {
        msw: {
            handlers: [
                rest.get("/api/sites", (_request, response, context) =>
                    response(context.delay(100), context.json(mockSites))
                ),
            ],
        },
    },
    args: {
        sites: mockSites,
    },
};
```

-   Use `context.delay(0)` or deterministic delays when demonstrating loading states; avoid randomised latency.
-   When mocking Electron bridge behaviour, reuse helpers from `storybook/setup/electron-api-mock.ts` instead of ad-hoc stubs.

### 9.3 Resilience for Electron-Specific Stories

-   Stories that rely on preload APIs must import the shared mock (`electron-api-mock`) and update the mock implementation via `window.electronAPI.__setMock(...)` before rendering.
-   Provide fallbacks for environments where the Electron bridge is unavailable so that stories also work in Chromatic/CI.
-   Reset any global mock state in a `play` function `finally` block to avoid leaking configuration to the next story.

---

## 10. Final Checklist Before Raising a PR

-   ✅ Story renders deterministically with no reliance on the system clock, randomness, or real network calls.
-   ✅ Args, controls, and documentation match the actual component API (cross-check with `ComponentProps<typeof Component>`).
-   ✅ a11y checks pass locally (`npm run storybook:test-server` + `npm run test:storybook:runner:a11y`).
-   ✅ Added or updated stories follow the enforced lint rules (`npm run test:storybook:runner`).
-   ✅ Any MSW handlers or Electron mocks are colocated and cleaned up.
