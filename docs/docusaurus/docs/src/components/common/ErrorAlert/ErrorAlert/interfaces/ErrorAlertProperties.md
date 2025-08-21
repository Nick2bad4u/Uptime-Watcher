# Interface: ErrorAlertProperties

Defined in: [src/components/common/ErrorAlert/ErrorAlert.tsx:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/ErrorAlert/ErrorAlert.tsx#L37)

Props for the ErrorAlert component.

## Properties

### className?

> `readonly` `optional` **className**: `string`

Defined in: [src/components/common/ErrorAlert/ErrorAlert.tsx:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/ErrorAlert/ErrorAlert.tsx#L39)

Optional custom className for additional styling

***

### message

> `readonly` **message**: `string`

Defined in: [src/components/common/ErrorAlert/ErrorAlert.tsx:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/ErrorAlert/ErrorAlert.tsx#L41)

The error message to display

***

### onDismiss()?

> `readonly` `optional` **onDismiss**: () => `void`

Defined in: [src/components/common/ErrorAlert/ErrorAlert.tsx:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/ErrorAlert/ErrorAlert.tsx#L43)

Optional callback when the error is dismissed

#### Returns

`void`

***

### variant?

> `readonly` `optional` **variant**: [`ErrorAlertVariant`](../type-aliases/ErrorAlertVariant.md)

Defined in: [src/components/common/ErrorAlert/ErrorAlert.tsx:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/ErrorAlert/ErrorAlert.tsx#L45)

Error severity variant for styling
