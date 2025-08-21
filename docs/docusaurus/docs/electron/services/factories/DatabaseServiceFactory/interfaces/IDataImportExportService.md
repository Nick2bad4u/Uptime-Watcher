# Interface: IDataImportExportService

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/factories/DatabaseServiceFactory.ts#L74)

Abstract interface for import/export service operations.

## Remarks

Used for type safety and dependency injection for import/export-related
operations.

## Properties

### exportAllData()

> **exportAllData**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/factories/DatabaseServiceFactory.ts#L75)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### importDataFromJson()

> **importDataFromJson**: (`data`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `settings`: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>; `sites`: [`ImportSite`](../../../../utils/database/DataImportExportService/interfaces/ImportSite.md)[]; \`\>

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/factories/DatabaseServiceFactory.ts#L76)

#### Parameters

##### data

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `settings`: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>; `sites`: [`ImportSite`](../../../../utils/database/DataImportExportService/interfaces/ImportSite.md)[]; \`\>

***

### persistImportedData()

> **persistImportedData**: (`sites`, `settings`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/factories/DatabaseServiceFactory.ts#L79)

#### Parameters

##### sites

[`ImportSite`](../../../../utils/database/DataImportExportService/interfaces/ImportSite.md)[]

##### settings

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
