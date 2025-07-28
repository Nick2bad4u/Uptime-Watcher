# Interface: IDataImportExportService

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L63)

Abstract interface for import/export service operations.

## Remarks

Used for type safety and dependency injection for import/export-related operations.

## Methods

### exportAllData()

> **exportAllData**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L64)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### importDataFromJson()

> **importDataFromJson**(`data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `settings`: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>; `sites`: `unknown`[]; \`\>

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L65)

#### Parameters

##### data

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `settings`: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>; `sites`: `unknown`[]; \`\>

***

### persistImportedData()

> **persistImportedData**(`sites`, `settings`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/factories/DatabaseServiceFactory.ts#L66)

#### Parameters

##### sites

`unknown`[]

##### settings

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
