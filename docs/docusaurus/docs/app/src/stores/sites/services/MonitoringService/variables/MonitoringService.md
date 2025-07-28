# Variable: MonitoringService

> `const` **MonitoringService**: `object`

Defined in: [src/stores/sites/services/MonitoringService.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/services/MonitoringService.ts#L32)

## Type declaration

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Initialize the service by ensuring electron API is available

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Remarks

This method is automatically called by all other service methods
to ensure the electron API is ready before making IPC calls.

#### Throws

Error if electron API cannot be initialized

### startMonitoring()

> **startMonitoring**(`siteId`, `monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Start monitoring for a specific monitor

#### Parameters

##### siteId

`string`

The identifier of the site containing the monitor

##### monitorId

`string`

The identifier of the specific monitor to start

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Throws

Error if the electron API is unavailable or the operation fails

#### Example

```typescript
await MonitoringService.startMonitoring("site-123", "monitor-456");
```

### startSiteMonitoring()

> **startSiteMonitoring**(`siteId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Start monitoring for all monitors of a site

#### Parameters

##### siteId

`string`

The identifier of the site to start monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Throws

Error if the electron API is unavailable or the operation fails

#### Remarks

This method starts monitoring for all monitors associated with the specified site.
It calls the same backend API as startMonitoring but without the monitorId parameter,
which signals the backend to start all monitors for the site.

#### Example

```typescript
await MonitoringService.startSiteMonitoring("site-123");
```

### stopMonitoring()

> **stopMonitoring**(`siteId`, `monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Stop monitoring for a specific monitor

#### Parameters

##### siteId

`string`

The identifier of the site containing the monitor

##### monitorId

`string`

The identifier of the specific monitor to stop

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Throws

Error if the electron API is unavailable or the operation fails

#### Example

```typescript
await MonitoringService.stopMonitoring("site-123", "monitor-456");
```

### stopSiteMonitoring()

> **stopSiteMonitoring**(`siteId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Stop monitoring for all monitors of a site

#### Parameters

##### siteId

`string`

The identifier of the site to stop monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Throws

Error if the electron API is unavailable or the operation fails

#### Remarks

This method stops monitoring for all monitors associated with the specified site.
It calls the same backend API as stopMonitoring but without the monitorId parameter,
which signals the backend to stop all monitors for the site.

#### Example

```typescript
await MonitoringService.stopSiteMonitoring("site-123");
```
