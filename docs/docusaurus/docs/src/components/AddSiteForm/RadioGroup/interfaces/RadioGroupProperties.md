# Interface: RadioGroupProperties

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L56)

Properties for the RadioGroup component.

## Properties

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L58)

Whether the radio group is disabled

***

### error?

> `readonly` `optional` **error**: `string`

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L60)

Error message to display below the radio group

***

### helpText?

> `readonly` `optional` **helpText**: `string`

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L62)

Help text to show below the field when no error is present

***

### id

> `readonly` **id**: `string`

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L64)

Unique identifier for the radio group, used for accessibility

***

### label

> `readonly` **label**: `string`

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L66)

Label text to display above the radio group

***

### name

> `readonly` **name**: `string`

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L68)

Name attribute for radio inputs (should be unique within the form)

***

### onChange()

> `readonly` **onChange**: (`value`) => `void`

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L70)

Callback function triggered when selection changes

#### Parameters

##### value

`string`

#### Returns

`void`

***

### options

> `readonly` **options**: [`RadioOption`](RadioOption.md)[]

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L72)

Array of radio options to display

***

### required?

> `readonly` `optional` **required**: `boolean`

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L74)

Whether a selection is required

***

### value

> `readonly` **value**: `string`

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L76)

Currently selected value
