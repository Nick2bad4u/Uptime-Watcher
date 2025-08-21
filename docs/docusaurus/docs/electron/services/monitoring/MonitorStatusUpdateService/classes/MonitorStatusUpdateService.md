# Class: MonitorStatusUpdateService

Defined in: [electron/services/monitoring/MonitorStatusUpdateService.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorStatusUpdateService.ts#L61)

Service for conditionally updating monitor status based on operation
correlation.

## Remarks

Validates operations before applying status updates to prevent race
conditions between monitor state changes and delayed check results.

## Constructors

### Constructor

> **new MonitorStatusUpdateService**(`operationRegistry`, `monitorRepository`, `sites`): `MonitorStatusUpdateService`

Defined in: [electron/services/monitoring/MonitorStatusUpdateService.ts:221](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorStatusUpdateService.ts#L221)

Creates a new MonitorStatusUpdateService.

#### Parameters

##### operationRegistry

[`MonitorOperationRegistry`](../../MonitorOperationRegistry/classes/MonitorOperationRegistry.md)

Registry for validating operations

##### monitorRepository

[`MonitorRepository`](../../../database/MonitorRepository/classes/MonitorRepository.md)

Repository for monitor operations

##### sites

[`StandardizedCache`](../../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Site cache for updating cached monitor states

#### Returns

`MonitorStatusUpdateService`

## Methods

### updateMonitorStatus()

> **updateMonitorStatus**(`result`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/services/monitoring/MonitorStatusUpdateService.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorStatusUpdateService.ts#L85)

Update monitor status only if the operation is still valid.

#### Parameters

##### result

[`StatusUpdateMonitorCheckResult`](../interfaces/StatusUpdateMonitorCheckResult.md)

Check result with operation correlation

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if update was applied, false if
  ignored
