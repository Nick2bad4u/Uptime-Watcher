# Interface: AddSiteFormActions

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L62)

Form actions interface containing all form manipulation functions.

## Remarks

Provides a complete set of methods for manipulating form state, including
validation, field updates, and form lifecycle management. All setter methods
trigger re-renders and validation updates.

## Properties

### isFormValid()

> **isFormValid**: () => `boolean`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L64)

Whether the form is currently valid

#### Returns

`boolean`

***

### resetForm()

> **resetForm**: () => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L66)

Reset form to initial state

#### Returns

`void`

***

### setAddMode()

> **setAddMode**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L68)

Set form operation mode

#### Parameters

##### value

[`FormMode`](../type-aliases/FormMode.md)

#### Returns

`void`

***

### setCheckInterval()

> **setCheckInterval**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L70)

Set check interval

#### Parameters

##### value

`number`

#### Returns

`void`

***

### setExpectedValue()

> **setExpectedValue**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L72)

Set expected value field value

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setFormError()

> **setFormError**: (`error`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L74)

Set form error message

#### Parameters

##### error

`undefined` | `string`

#### Returns

`void`

***

### setHost()

> **setHost**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L76)

Set host field value

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setMonitorType()

> **setMonitorType**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L78)

Set monitor type

#### Parameters

##### value

`"http"` | `"port"` | `"ping"` | `"dns"`

#### Returns

`void`

***

### setName()

> **setName**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L80)

Set site name field value

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setPort()

> **setPort**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L82)

Set port field value

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setRecordType()

> **setRecordType**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L84)

Set record type field value

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setSelectedExistingSite()

> **setSelectedExistingSite**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L86)

Set selected existing site

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setSiteId()

> **setSiteId**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L88)

Set site ID

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setUrl()

> **setUrl**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L90)

Set URL field value

#### Parameters

##### value

`string`

#### Returns

`void`
