# Interface: TextFieldProperties

Defined in: [src/components/AddSiteForm/TextField.tsx:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L67)

Properties for the TextField component.

## Properties

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/components/AddSiteForm/TextField.tsx:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L69)

Whether the field is disabled

***

### error?

> `readonly` `optional` **error**: `string`

Defined in: [src/components/AddSiteForm/TextField.tsx:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L71)

Error message to display below the input field

***

### helpText?

> `readonly` `optional` **helpText**: `string`

Defined in: [src/components/AddSiteForm/TextField.tsx:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L73)

Help text to show below the field when no error is present

***

### id

> `readonly` **id**: `string`

Defined in: [src/components/AddSiteForm/TextField.tsx:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L75)

Unique identifier for the input field, used for accessibility

***

### label

> `readonly` **label**: `string`

Defined in: [src/components/AddSiteForm/TextField.tsx:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L77)

Label text to display above the input field

***

### max?

> `readonly` `optional` **max**: `number`

Defined in: [src/components/AddSiteForm/TextField.tsx:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L79)

Maximum value for number inputs (ignored for text/url types)

***

### min?

> `readonly` `optional` **min**: `number`

Defined in: [src/components/AddSiteForm/TextField.tsx:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L81)

Minimum value for number inputs (ignored for text/url types)

***

### onChange()

> `readonly` **onChange**: (`value`) => `void`

Defined in: [src/components/AddSiteForm/TextField.tsx:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L83)

Callback function triggered when value changes

#### Parameters

##### value

`string`

#### Returns

`void`

***

### placeholder?

> `readonly` `optional` **placeholder**: `string`

Defined in: [src/components/AddSiteForm/TextField.tsx:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L85)

Placeholder text displayed when input is empty

***

### required?

> `readonly` `optional` **required**: `boolean`

Defined in: [src/components/AddSiteForm/TextField.tsx:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L87)

Whether the field is required

***

### type?

> `readonly` `optional` **type**: `"number"` \| `"text"` \| `"url"`

Defined in: [src/components/AddSiteForm/TextField.tsx:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L89)

Input type - text, url, or number

***

### value

> `readonly` **value**: `string`

Defined in: [src/components/AddSiteForm/TextField.tsx:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L91)

Current field value
