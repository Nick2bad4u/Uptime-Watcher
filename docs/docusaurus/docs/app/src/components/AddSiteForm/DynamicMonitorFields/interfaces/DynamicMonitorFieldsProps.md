# Interface: DynamicMonitorFieldsProps

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/DynamicMonitorFields.tsx#L54)

Props for the [DynamicMonitorFields](../functions/DynamicMonitorFields.md) component.

## Properties

### isLoading?

> `readonly` `optional` **isLoading**: `boolean`

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/DynamicMonitorFields.tsx#L58)

Whether the form is in a loading state.

***

### monitorType

> `readonly` **monitorType**: `string`

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/DynamicMonitorFields.tsx#L62)

The selected monitor type for which to render fields.

***

### onChange

> `readonly` **onChange**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, (`value`) => `void`\>

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/DynamicMonitorFields.tsx#L66)

Change handlers for each field, keyed by field name.

***

### values

> `readonly` **values**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `number` \| `string`\>

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/DynamicMonitorFields.tsx#L70)

Current values for each field, keyed by field name.
