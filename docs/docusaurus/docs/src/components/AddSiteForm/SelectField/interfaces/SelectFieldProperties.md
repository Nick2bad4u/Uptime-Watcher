# Interface: SelectFieldProperties

Defined in: [src/components/AddSiteForm/SelectField.tsx:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L55)

Properties for the SelectField component.

## Properties

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/components/AddSiteForm/SelectField.tsx:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L57)

Whether the field is disabled

***

### error?

> `readonly` `optional` **error**: `string`

Defined in: [src/components/AddSiteForm/SelectField.tsx:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L59)

Error message to display below the select field

***

### helpText?

> `readonly` `optional` **helpText**: `string`

Defined in: [src/components/AddSiteForm/SelectField.tsx:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L61)

Help text to show below the field when no error is present

***

### id

> `readonly` **id**: `string`

Defined in: [src/components/AddSiteForm/SelectField.tsx:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L63)

Unique identifier for the select field, used for accessibility

***

### label

> `readonly` **label**: `string`

Defined in: [src/components/AddSiteForm/SelectField.tsx:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L65)

Label text to display above the select field

***

### onChange()

> `readonly` **onChange**: (`value`) => `void`

Defined in: [src/components/AddSiteForm/SelectField.tsx:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L67)

Callback function triggered when selection changes

#### Parameters

##### value

`string`

#### Returns

`void`

***

### options

> `readonly` **options**: [`SelectOption`](SelectOption.md)[]

Defined in: [src/components/AddSiteForm/SelectField.tsx:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L69)

Array of options to display in the dropdown

***

### placeholder?

> `readonly` `optional` **placeholder**: `string`

Defined in: [src/components/AddSiteForm/SelectField.tsx:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L71)

Placeholder text shown when no option is selected

***

### required?

> `readonly` `optional` **required**: `boolean`

Defined in: [src/components/AddSiteForm/SelectField.tsx:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L73)

Whether the field is required

***

### value

> `readonly` **value**: `string` \| `number`

Defined in: [src/components/AddSiteForm/SelectField.tsx:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L75)

Current selected value (string or number)
