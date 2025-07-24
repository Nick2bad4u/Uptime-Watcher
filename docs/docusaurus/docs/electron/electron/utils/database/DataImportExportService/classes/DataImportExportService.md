# Class: DataImportExportService

Defined in: [electron/utils/database/DataImportExportService.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/DataImportExportService.ts#L48)

Service for handling data import/export operations.
Separates data operations from side effects for better testability.

## Constructors

### Constructor

> **new DataImportExportService**(`config`): `DataImportExportService`

Defined in: [electron/utils/database/DataImportExportService.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/DataImportExportService.ts#L61)

#### Parameters

##### config

[`DataImportExportConfig`](../interfaces/DataImportExportConfig.md)

#### Returns

`DataImportExportService`

## Methods

### exportAllData()

> **exportAllData**(): `Promise`\<`string`\>

Defined in: [electron/utils/database/DataImportExportService.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/DataImportExportService.ts#L72)

Export all application data as JSON string.
Pure data operation without side effects.

#### Returns

`Promise`\<`string`\>

***

### importDataFromJson()

> **importDataFromJson**(`jsonData`): `Promise`\<\` `settings`: `Record`\<`string`, `string`\>; `sites`: [`ImportSite`](../interfaces/ImportSite.md)[]; \`\>

Defined in: [electron/utils/database/DataImportExportService.ts:105](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/DataImportExportService.ts#L105)

Import data from JSON string.
Pure data operation that returns the imported data.

#### Parameters

##### jsonData

`string`

#### Returns

`Promise`\<\` `settings`: `Record`\<`string`, `string`\>; `sites`: [`ImportSite`](../interfaces/ImportSite.md)[]; \`\>

***

### persistImportedData()

> **persistImportedData**(`sites`, `settings`): `Promise`\<`void`\>

Defined in: [electron/utils/database/DataImportExportService.ts:138](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/DataImportExportService.ts#L138)

Import sites and settings into database.
Database operation that persists the imported data.

#### Parameters

##### sites

[`ImportSite`](../interfaces/ImportSite.md)[]

##### settings

`Record`\<`string`, `string`\>

#### Returns

`Promise`\<`void`\>
