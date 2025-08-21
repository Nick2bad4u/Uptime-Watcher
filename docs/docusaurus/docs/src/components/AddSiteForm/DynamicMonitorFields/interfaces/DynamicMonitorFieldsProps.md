# Interface: DynamicMonitorFieldsProps

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicMonitorFields.tsx#L30)

Props for the [DynamicMonitorFields](../functions/DynamicMonitorFields.md) component.

## Properties

### isLoading?

> `readonly` `optional` **isLoading**: `boolean`

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicMonitorFields.tsx#L34)

Whether the form is in a loading state.

***

### monitorType

> `readonly` **monitorType**: `string`

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicMonitorFields.tsx#L38)

The selected monitor type for which to render fields.

***

### onChange

> `readonly` **onChange**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, (`value`) => `void`\>

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicMonitorFields.tsx#L42)

Change handlers for each field, keyed by field name.

***

### values

> `readonly` **values**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `number` \| `string`\>

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicMonitorFields.tsx#L46)

Current values for each field, keyed by field name.
