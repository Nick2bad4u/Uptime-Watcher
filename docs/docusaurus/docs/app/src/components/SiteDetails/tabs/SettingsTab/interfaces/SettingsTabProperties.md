# Interface: SettingsTabProperties

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L34)

Props for the SettingsTab component.

## Properties

### currentSite

> `readonly` **currentSite**: [`Site`](../../../../../../shared/types/interfaces/Site.md)

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L36)

Current site being configured

***

### handleIntervalChange()

> `readonly` **handleIntervalChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L38)

Handler for monitor check interval changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### handleRemoveSite()

> `readonly` **handleRemoveSite**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L40)

Handler for removing/deleting the site

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleRetryAttemptsChange()

> `readonly` **handleRetryAttemptsChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L42)

Handler for monitor retry attempts changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

***

### handleSaveInterval()

> `readonly` **handleSaveInterval**: () => `void`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L44)

Handler for saving interval changes

#### Returns

`void`

***

### handleSaveName()

> `readonly` **handleSaveName**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L46)

Handler for saving site name changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveRetryAttempts()

> `readonly` **handleSaveRetryAttempts**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L48)

Handler for saving retry attempts changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleSaveTimeout()

> `readonly` **handleSaveTimeout**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L50)

Handler for saving timeout changes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleTimeoutChange()

> `readonly` **handleTimeoutChange**: (`e`) => `void`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L52)

Handler for monitor timeout changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

#### Returns

`void`

***

### hasUnsavedChanges

> `readonly` **hasUnsavedChanges**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L54)

Whether there are unsaved changes pending

***

### intervalChanged

> `readonly` **intervalChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L56)

Whether the check interval has been modified

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L58)

Whether any async operation is in progress

***

### localCheckInterval

> `readonly` **localCheckInterval**: `number`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L60)

Local state value for check interval

***

### localName

> `readonly` **localName**: `string`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L62)

Local state value for site name

***

### localRetryAttempts

> `readonly` **localRetryAttempts**: `number`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L64)

Local state value for retry attempts

***

### localTimeout

> `readonly` **localTimeout**: `number`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L66)

Local state value for timeout in seconds (converted to ms when saving)

***

### retryAttemptsChanged

> `readonly` **retryAttemptsChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L68)

Whether the retry attempts have been changed

***

### selectedMonitor

> `readonly` **selectedMonitor**: [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L70)

Currently selected monitor being configured

***

### setLocalName()

> `readonly` **setLocalName**: (`name`) => `void`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L72)

Function to update local site name state

#### Parameters

##### name

`string`

#### Returns

`void`

***

### timeoutChanged

> `readonly` **timeoutChanged**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SettingsTab.tsx:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/SettingsTab.tsx#L74)

Whether the timeout has been changed
