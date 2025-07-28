# Class: DataImportExportService

Defined in: [electron/utils/database/DataImportExportService.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/DataImportExportService.ts#L55)

Service for handling data import/export operations.

Separates data operations from side effects for better testability.
Handles the complete lifecycle of data import/export including validation,
transformation, and persistence.

## Constructors

### Constructor

> **new DataImportExportService**(`config`): `DataImportExportService`

Defined in: [electron/utils/database/DataImportExportService.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/DataImportExportService.ts#L68)

#### Parameters

##### config

[`DataImportExportConfig`](../interfaces/DataImportExportConfig.md)

#### Returns

`DataImportExportService`

## Methods

### exportAllData()

> **exportAllData**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [electron/utils/database/DataImportExportService.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/DataImportExportService.ts#L79)

Export all application data as JSON string.
Pure data operation without side effects.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### importDataFromJson()

> **importDataFromJson**(`jsonData`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `settings`: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>; `sites`: [`ImportSite`](../interfaces/ImportSite.md)[]; \`\>

Defined in: [electron/utils/database/DataImportExportService.ts:112](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/DataImportExportService.ts#L112)

Import data from JSON string.
Pure data operation that returns the imported data.

#### Parameters

##### jsonData

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `settings`: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>; `sites`: [`ImportSite`](../interfaces/ImportSite.md)[]; \`\>

***

### persistImportedData()

> **persistImportedData**(`sites`, `settings`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/database/DataImportExportService.ts:145](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/DataImportExportService.ts#L145)

Import sites and settings into database.
Database operation that persists the imported data.

#### Parameters

##### sites

[`ImportSite`](../interfaces/ImportSite.md)[]

##### settings

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
