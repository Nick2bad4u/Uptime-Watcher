# Function: ThemedBox()

> **ThemedBox**(`__namedParameters`): [`DetailedReactHTMLElement`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L378)\<\` `aria-label?`: `string`; `className`: `string`; `onClick`: `undefined` \| (`e`) => `void`; `onKeyDown?`: (`e`) => `void`; `onMouseEnter`: `undefined` \| () => `void`; `onMouseLeave`: `undefined` \| () => `void`; `role?`: `string`; `style`: [`CSSProperties`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2383); `tabIndex?`: `number`; `type?`: `"button"`; \`, [`HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement)\>

Defined in: [src/theme/components/ThemedBox.tsx:195](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L195)

Themed box component for container layout and visual consistency.

## Parameters

### \_\_namedParameters

[`ThemedBoxProperties`](../interfaces/ThemedBoxProperties.md)

## Returns

[`DetailedReactHTMLElement`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L378)\<\` `aria-label?`: `string`; `className`: `string`; `onClick`: `undefined` \| (`e`) => `void`; `onKeyDown?`: (`e`) => `void`; `onMouseEnter`: `undefined` \| () => `void`; `onMouseLeave`: `undefined` \| () => `void`; `role?`: `string`; `style`: [`CSSProperties`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2383); `tabIndex?`: `number`; `type?`: `"button"`; \`, [`HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement)\>

A React element representing the themed box.

## Remarks

This component composes utility CSS classes (from [CSS\_CLASSES](../../types/variables/CSS_CLASSES.md) and
local `themed-box--*` classes) to provide consistent padding, rounding,
shadows, and surface/variant backgrounds. When an `onClick` handler is
provided the component augments the rendered element with keyboard handling
and ARIA attributes to behave like a button when the element is a `div`.

## Example

```tsx
<ThemedBox padding="lg" rounded="xl" variant="secondary">
    <p>Content</p>
</ThemedBox>;
```
