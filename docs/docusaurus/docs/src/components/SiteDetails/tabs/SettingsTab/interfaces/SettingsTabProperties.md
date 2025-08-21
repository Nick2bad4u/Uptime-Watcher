# Interface: SettingsTabProperties

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L48)

Props for the SettingsTab component.

## Properties

### currentSite

> `readonly` **currentSite**: [`Site`](../../../../../../shared/types/interfaces/Site.md)

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L50)

Current site being configured

***

### handleIntervalChange()

> `readonly` **handleIntervalChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L52)

Handler for monitor check interval changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### handleRemoveSite()

> `readonly` **handleRemoveSite**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L56)

Handler for removing/deleting the site

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleRetryAttemptsChange()

> `readonly` **handleRetryAttemptsChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L58)

Handler for monitor retry attempts changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

***

### handleSaveInterval()

> `readonly` **handleSaveInterval**: () => `void`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L62)

Handler for saving interval changes

#### Returns

`void`

***

### handleSaveName()

> `readonly` **handleSaveName**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L64)

Handler for saving site name changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveRetryAttempts()

> `readonly` **handleSaveRetryAttempts**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L66)

Handler for saving retry attempts changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveTimeout()

> `readonly` **handleSaveTimeout**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L68)

Handler for saving timeout changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleTimeoutChange()

> `readonly` **handleTimeoutChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L70)

Handler for monitor timeout changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

***

### hasUnsavedChanges

> `readonly` **hasUnsavedChanges**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L74)

Whether there are unsaved changes pending

***

### intervalChanged

> `readonly` **intervalChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L76)

Whether the check interval has been modified

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L78)

Whether any async operation is in progress

***

### localCheckInterval

> `readonly` **localCheckInterval**: `number`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L80)

Local state value for check interval

***

### localName

> `readonly` **localName**: `string`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L82)

Local state value for site name

***

### localRetryAttempts

> `readonly` **localRetryAttempts**: `number`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L84)

Local state value for retry attempts

***

### localTimeout

> `readonly` **localTimeout**: `number`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L88)

Local state value for timeout in seconds (converted to ms when saving)

***

### retryAttemptsChanged

> `readonly` **retryAttemptsChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L90)

Whether the retry attempts have been changed

***

### selectedMonitor

> `readonly` **selectedMonitor**: [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L92)

Currently selected monitor being configured

***

### setLocalName()

> `readonly` **setLocalName**: (`name`) => `void`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L94)

Function to update local site name state

#### Parameters

##### name

`string`

#### Returns

`void`

***

### timeoutChanged

> `readonly` **timeoutChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SettingsTab.tsx#L96)

Whether the timeout has been changed
