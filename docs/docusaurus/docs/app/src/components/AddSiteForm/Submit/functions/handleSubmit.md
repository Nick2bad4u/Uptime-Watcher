# Function: handleSubmit()

> **handleSubmit**(`event`, `properties`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/AddSiteForm/Submit.tsx:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/Submit.tsx#L91)

Handles form submission for adding sites or monitors.

Performs comprehensive validation based on add mode and monitor type:
- For new sites: validates site name and monitor configuration
- For existing sites: validates site selection and monitor configuration
- For HTTP monitors: validates URL format and protocol
- For port monitors: validates host and port number

## Parameters

### event

[`FormEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2011)

Form submission event

### properties

[`FormSubmitProperties`](../type-aliases/FormSubmitProperties.md)

Form state, actions, and dependencies

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when submission is complete

## Example

```tsx
const handleFormSubmit = (e: React.FormEvent) => {
  handleSubmit(e, {
    ...formState,
    ...formActions,
    ...storeActions,
    generateUuid,
    logger,
    onSuccess: () => setIsVisible(false)
  });
};
```
