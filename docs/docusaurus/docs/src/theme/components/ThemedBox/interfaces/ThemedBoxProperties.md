# Interface: ThemedBoxProperties

Defined in: [src/theme/components/ThemedBox.tsx:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L35)

The props accepted by the [ThemedBox](../functions/ThemedBox.md) component.

## Remarks

All properties are optional except `children`. Several props have default
values which are applied when the prop is omitted (see individual property
docs below).

## Properties

### aria-label?

> `readonly` `optional` **aria-label**: `string`

Defined in: [src/theme/components/ThemedBox.tsx:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L44)

Accessible label forwarded to the rendered element.

#### Remarks

This maps the HTML attribute `aria-label` to a JavaScript-safe name in
JSX consumers. It is used automatically when the component is interactive
(when `onClick` is provided).

***

### as?

> `readonly` `optional` **as**: [`BoxElement`](../../types/type-aliases/BoxElement.md)

Defined in: [src/theme/components/ThemedBox.tsx:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L51)

Element type to render (for example `div`, `button`, `section`).

#### Default Value

```ts
"div"
```

***

### border?

> `readonly` `optional` **border**: `boolean`

Defined in: [src/theme/components/ThemedBox.tsx:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L58)

Render a visible border when true.

#### Default Value

```ts
false
```

***

### children

> `readonly` **children**: [`ReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L427)

Defined in: [src/theme/components/ThemedBox.tsx:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L63)

Child nodes to render inside the box.

***

### className?

> `readonly` `optional` **className**: `string`

Defined in: [src/theme/components/ThemedBox.tsx:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L68)

Additional CSS class names appended to the component's generated classes.

***

### onClick()?

> `readonly` `optional` **onClick**: (`e?`) => `void`

Defined in: [src/theme/components/ThemedBox.tsx:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L77)

Click handler for interactive usage.

#### Parameters

##### e?

[`MouseEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2067)\<[`HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement), [`MouseEvent`](https://developer.mozilla.org/docs/Web/API/MouseEvent)\>

#### Returns

`void`

#### Remarks

When provided the component will add keyboard handling and ARIA
attributes for accessibility if the rendered element is a `div`.

***

### onMouseEnter()?

> `readonly` `optional` **onMouseEnter**: () => `void`

Defined in: [src/theme/components/ThemedBox.tsx:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L82)

Mouse enter callback.

#### Returns

`void`

***

### onMouseLeave()?

> `readonly` `optional` **onMouseLeave**: () => `void`

Defined in: [src/theme/components/ThemedBox.tsx:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L87)

Mouse leave callback.

#### Returns

`void`

***

### padding?

> `readonly` `optional` **padding**: [`BoxPadding`](../../types/type-aliases/BoxPadding.md)

Defined in: [src/theme/components/ThemedBox.tsx:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L94)

Padding size variant.

#### Default Value

```ts
"md"
```

***

### role?

> `readonly` `optional` **role**: `string`

Defined in: [src/theme/components/ThemedBox.tsx:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L99)

Explicit ARIA role to apply when the component becomes interactive.

***

### rounded?

> `readonly` `optional` **rounded**: [`BoxRounded`](../../types/type-aliases/BoxRounded.md)

Defined in: [src/theme/components/ThemedBox.tsx:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L106)

Border radius variant.

#### Default Value

```ts
"md"
```

***

### shadow?

> `readonly` `optional` **shadow**: [`BoxShadow`](../../types/type-aliases/BoxShadow.md)

Defined in: [src/theme/components/ThemedBox.tsx:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L111)

Shadow depth variant. When omitted, no shadow class is added.

***

### style?

> `readonly` `optional` **style**: [`CSSProperties`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2383)

Defined in: [src/theme/components/ThemedBox.tsx:118](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L118)

Inline style object forwarded to the element.

#### Default Value

```ts
{ } (internal singleton)
```

***

### surface?

> `readonly` `optional` **surface**: [`BoxSurface`](../../types/type-aliases/BoxSurface.md)

Defined in: [src/theme/components/ThemedBox.tsx:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L125)

Surface variant used to select contextual surface styles.

#### Default Value

```ts
"base"
```

***

### tabIndex?

> `readonly` `optional` **tabIndex**: `number`

Defined in: [src/theme/components/ThemedBox.tsx:131](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L131)

Explicit tabIndex for interactive elements. When omitted and the
component is interactive, a sensible default is applied.

***

### variant?

> `readonly` `optional` **variant**: [`BoxVariant`](../../types/type-aliases/BoxVariant.md)

Defined in: [src/theme/components/ThemedBox.tsx:138](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBox.tsx#L138)

Visual variant used to choose background styling.

#### Default Value

```ts
"primary"
```
