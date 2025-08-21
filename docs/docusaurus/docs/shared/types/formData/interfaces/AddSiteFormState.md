# Interface: AddSiteFormState

Defined in: [shared/types/formData.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L24)

Add site form state interface.

## Remarks

Represents the complete state of the add site form including UI state and
form data.

## Properties

### addMode

> **addMode**: [`FormMode`](../type-aliases/FormMode.md)

Defined in: [shared/types/formData.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L26)

Current form mode

***

### formData

> **formData**: [`SiteFormData`](SiteFormData.md)

Defined in: [shared/types/formData.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L28)

Complete form data

***

### formError?

> `optional` **formError**: `string`

Defined in: [shared/types/formData.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L30)

Form error message

***

### selectedExistingSite

> **selectedExistingSite**: `string`

Defined in: [shared/types/formData.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L32)

Selected existing site ID (when addMode is "existing")
