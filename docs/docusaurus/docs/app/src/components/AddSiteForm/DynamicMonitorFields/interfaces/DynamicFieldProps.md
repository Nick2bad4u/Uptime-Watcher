# Interface: DynamicFieldProps

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/DynamicMonitorFields.tsx#L28)

Props for the DynamicField component.

## Properties

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/DynamicMonitorFields.tsx#L32)

Whether the field is disabled.

***

### field

> `readonly` **field**: [`MonitorFieldDefinition`](../../../../../shared/types/interfaces/MonitorFieldDefinition.md)

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/DynamicMonitorFields.tsx#L36)

Field definition describing the field's properties.

***

### onChange()

> `readonly` **onChange**: (`value`) => `void`

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/DynamicMonitorFields.tsx#L42)

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

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/DynamicMonitorFields.tsx#L46)

Current value of the field.
