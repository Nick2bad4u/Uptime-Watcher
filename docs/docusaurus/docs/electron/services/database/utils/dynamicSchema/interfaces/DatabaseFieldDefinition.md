# Interface: DatabaseFieldDefinition

Defined in: [electron/services/database/utils/dynamicSchema.ts:164](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L164)

Database field definition for dynamic monitor schema.

## Remarks

Used to describe dynamically generated columns for monitor types. All fields
are mapped from monitor type registry definitions and used in dynamic schema
generation.

## Properties

### columnName

> **columnName**: `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:171](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L171)

Column name in database (snake_case).

#### Remarks

Generated from the monitor type field name.

***

### defaultValue?

> `optional` **defaultValue**: `null` \| `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:180](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L180)

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

Defined in: [electron/services/database/utils/dynamicSchema.ts:184](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L184)

Monitor type this field belongs to.

***

### nullable

> **nullable**: `boolean`

Defined in: [electron/services/database/utils/dynamicSchema.ts:193](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L193)

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

Defined in: [electron/services/database/utils/dynamicSchema.ts:197](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L197)

Field name from monitor type definition (camelCase).

***

### sqlType

> **sqlType**: `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:204](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L204)

SQL data type for the column.

#### Remarks

Determined by monitor type registry field type.
