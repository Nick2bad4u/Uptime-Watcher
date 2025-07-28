# Interface: DatabaseFieldDefinition

Defined in: [electron/services/database/utils/dynamicSchema.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L22)

Database field definition for dynamic monitor schema.

## Remarks

Used to describe dynamically generated columns for monitor types. All fields are mapped from monitor type registry definitions and used in dynamic schema generation.

## Properties

### columnName

> **columnName**: `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L29)

Column name in database (snake_case).

#### Remarks

Generated from the monitor type field name.

***

### defaultValue?

> `optional` **defaultValue**: `null` \| `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L38)

Default value for the column.

#### Remarks

Always `null` for dynamic fields.

#### Default Value

```ts
null
```

***

### monitorType

> **monitorType**: `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L42)

Monitor type this field belongs to.

***

### nullable

> **nullable**: `boolean`

Defined in: [electron/services/database/utils/dynamicSchema.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L51)

Whether column allows NULL values.

#### Remarks

All dynamic fields are nullable.

#### Default Value

```ts
true
```

***

### sourceField

> **sourceField**: `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L55)

Field name from monitor type definition (camelCase).

***

### sqlType

> **sqlType**: `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L62)

SQL data type for the column.

#### Remarks

Determined by monitor type registry field type.
