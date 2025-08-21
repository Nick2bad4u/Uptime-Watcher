# Function: handleSubmit()

> **handleSubmit**(`event`, `properties`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/AddSiteForm/Submit.tsx:401](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/Submit.tsx#L401)

Handles form submission for adding sites or monitors.

Performs comprehensive validation based on add mode and monitor type:

- For new sites: validates site name and monitor configuration
- For existing sites: validates site selection and monitor configuration
- For HTTP monitors: validates URL format and protocol
- For port monitors: validates host and port number

## Parameters

### event

[`FormEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2011)

Form submission event

### properties

[`FormSubmitProperties`](../type-aliases/FormSubmitProperties.md)

Form state, actions, and dependencies

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when submission is complete

## Example

```tsx
const handleFormSubmit = (e: FormEvent) => {
    handleSubmit(e, {
        ...formState,
        ...formActions,
        ...storeActions,
        generateUuid,
        logger,
        onSuccess: () => setIsVisible(false),
    });
};
```
