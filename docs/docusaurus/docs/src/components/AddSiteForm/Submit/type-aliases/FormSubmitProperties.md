# Type Alias: FormSubmitProperties

> **FormSubmitProperties** = [`AddSiteFormState`](../../../SiteDetails/useAddSiteForm/interfaces/AddSiteFormState.md) & [`Pick`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)\<[`AddSiteFormActions`](../../../SiteDetails/useAddSiteForm/interfaces/AddSiteFormActions.md), `"setFormError"`\> & [`StoreActions`](../interfaces/StoreActions.md) & `object`

Defined in: [src/components/AddSiteForm/Submit.tsx:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/Submit.tsx#L68)

Properties interface for form submission handling.

## Type declaration

### generateUuid()

> **generateUuid**: () => `string`

UUID generator function for creating unique identifiers

#### Returns

`string`

### logger

> **logger**: [`Logger`](../../../../services/logger/type-aliases/Logger.md)

Logger instance for debugging and error tracking

### onSuccess()?

> `optional` **onSuccess**: () => `void`

Optional callback executed after successful submission

#### Returns

`void`

## Remarks

Combines form state, actions, and store methods for the submission handler.
