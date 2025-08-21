# Interface: DynamicFieldProps

Defined in: [src/components/AddSiteForm/DynamicField.tsx:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicField.tsx#L62)

Props for the [DynamicField](../functions/DynamicField.md) component.

## Properties

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/components/AddSiteForm/DynamicField.tsx:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicField.tsx#L66)

Whether the field is disabled.

***

### field

> `readonly` **field**: [`MonitorFieldDefinition`](../../../../../shared/types/interfaces/MonitorFieldDefinition.md)

Defined in: [src/components/AddSiteForm/DynamicField.tsx:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicField.tsx#L70)

Field definition describing the field's properties.

***

### onChange()

> `readonly` **onChange**: (`value`) => `void`

Defined in: [src/components/AddSiteForm/DynamicField.tsx:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicField.tsx#L76)

Change handler for the field value.

#### Parameters

##### value

The new value for the field.

`string` | `number`

#### Returns

`void`

***

### value

> `readonly` **value**: `string` \| `number`

Defined in: [src/components/AddSiteForm/DynamicField.tsx:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicField.tsx#L80)

Current value of the field.
