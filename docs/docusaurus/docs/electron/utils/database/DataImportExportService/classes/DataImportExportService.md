# Class: DataImportExportService

Defined in: [electron/utils/database/DataImportExportService.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataImportExportService.ts#L83)

Service for handling data import/export operations.

Separates data operations from side effects for better testability. Handles
the complete lifecycle of data import/export including validation,
transformation, and persistence.

## Constructors

### Constructor

> **new DataImportExportService**(`config`): `DataImportExportService`

Defined in: [electron/utils/database/DataImportExportService.ts:304](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataImportExportService.ts#L304)

#### Parameters

##### config

[`DataImportExportConfig`](../interfaces/DataImportExportConfig.md)

#### Returns

`DataImportExportService`

## Methods

### exportAllData()

> **exportAllData**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [electron/utils/database/DataImportExportService.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataImportExportService.ts#L103)

Export all application data as JSON string. Pure data operation without
side effects.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### importDataFromJson()

> **importDataFromJson**(`jsonData`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `settings`: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>; `sites`: [`ImportSite`](../interfaces/ImportSite.md)[]; \`\>

Defined in: [electron/utils/database/DataImportExportService.ts:145](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataImportExportService.ts#L145)

Import data from JSON string. Pure data operation that returns the
imported data.

#### Parameters

##### jsonData

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `settings`: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>; `sites`: [`ImportSite`](../interfaces/ImportSite.md)[]; \`\>

***

### persistImportedData()

> **persistImportedData**(`sites`, `settings`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/database/DataImportExportService.ts:191](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataImportExportService.ts#L191)

Import sites and settings into database. Database operation that persists
the imported data.

#### Parameters

##### sites

[`ImportSite`](../interfaces/ImportSite.md)[]

##### settings

`undefined` | `null` | [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
