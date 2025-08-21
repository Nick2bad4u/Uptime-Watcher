# Interface: StoreActions

Defined in: [src/components/AddSiteForm/Submit.tsx:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/Submit.tsx#L46)

Store actions interface for form submission operations.

## Remarks

Defines the required store methods needed for form submission. This interface
decouples the submission logic from specific store implementations, making
the code more testable and flexible.

## Properties

### addMonitorToSite()

> **addMonitorToSite**: (`siteId`, `monitor`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/AddSiteForm/Submit.tsx:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/Submit.tsx#L48)

Add a monitor to an existing site

#### Parameters

##### siteId

`string`

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### clearError()

> **clearError**: () => `void`

Defined in: [src/components/AddSiteForm/Submit.tsx:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/Submit.tsx#L50)

Clear any existing error state

#### Returns

`void`

***

### createSite()

> **createSite**: (`siteData`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/AddSiteForm/Submit.tsx:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/Submit.tsx#L52)

Create a new site with monitors

#### Parameters

##### siteData

###### identifier

`string`

###### monitoring?

`boolean`

###### monitors?

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]

###### name?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
