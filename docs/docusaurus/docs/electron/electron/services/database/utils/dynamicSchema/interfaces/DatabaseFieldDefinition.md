# Interface: DatabaseFieldDefinition

Defined in: [electron/services/database/utils/dynamicSchema.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/dynamicSchema.ts#L11)

Database field definition for dynamic monitor schema.

## Properties

### columnName

> **columnName**: `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/dynamicSchema.ts#L13)

Column name in database

***

### defaultValue?

> `optional` **defaultValue**: `null` \| `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/dynamicSchema.ts#L15)

Default value for the column (null for dynamic fields)

***

### monitorType

> **monitorType**: `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/dynamicSchema.ts#L17)

Monitor type this field belongs to

***

### nullable

> **nullable**: `boolean`

Defined in: [electron/services/database/utils/dynamicSchema.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/dynamicSchema.ts#L19)

Whether column allows NULL values

***

### sourceField

> **sourceField**: `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/dynamicSchema.ts#L21)

Field name from monitor type definition

***

### sqlType

> **sqlType**: `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/dynamicSchema.ts#L23)

SQL data type
