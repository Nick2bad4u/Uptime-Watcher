# Function: handleSubmit()

> **handleSubmit**(`event`, `properties`): `Promise`\<`void`\>

Defined in: [src/components/AddSiteForm/Submit.tsx:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/components/AddSiteForm/Submit.tsx#L82)

Handles form submission for adding sites or monitors.

Performs comprehensive validation based on add mode and monitor type:
- For new sites: validates site name and monitor configuration
- For existing sites: validates site selection and monitor configuration
- For HTTP monitors: validates URL format and protocol
- For port monitors: validates host and port number

## Parameters

### event

`FormEvent`

### properties

`FormSubmitProperties`

## Returns

`Promise`\<`void`\>

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
