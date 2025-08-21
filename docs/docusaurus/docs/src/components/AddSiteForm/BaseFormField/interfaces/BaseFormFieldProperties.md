# Interface: BaseFormFieldProperties

Defined in: [src/components/AddSiteForm/BaseFormField.tsx:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/BaseFormField.tsx#L54)

Properties for the BaseFormField component.

## Properties

### children()

> `readonly` **children**: (`ariaProps`) => [`ReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L427)

Defined in: [src/components/AddSiteForm/BaseFormField.tsx:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/BaseFormField.tsx#L56)

Render function that receives ARIA properties

#### Parameters

##### ariaProps

[`AriaProperties`](AriaProperties.md)

#### Returns

[`ReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L427)

***

### error?

> `readonly` `optional` **error**: `string`

Defined in: [src/components/AddSiteForm/BaseFormField.tsx:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/BaseFormField.tsx#L58)

Error message to display below the field

***

### helpText?

> `readonly` `optional` **helpText**: `string`

Defined in: [src/components/AddSiteForm/BaseFormField.tsx:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/BaseFormField.tsx#L60)

Help text to show below the field when no error is present

***

### id

> `readonly` **id**: `string`

Defined in: [src/components/AddSiteForm/BaseFormField.tsx:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/BaseFormField.tsx#L62)

Unique identifier for the field

***

### label

> `readonly` **label**: `string`

Defined in: [src/components/AddSiteForm/BaseFormField.tsx:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/BaseFormField.tsx#L64)

Label text to display above the field

***

### required?

> `readonly` `optional` **required**: `boolean`

Defined in: [src/components/AddSiteForm/BaseFormField.tsx:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/BaseFormField.tsx#L66)

Whether the field is required
