# Type Alias: MonitorFormData

> **MonitorFormData** = [`HttpFormData`](../interfaces/HttpFormData.md) \| [`PingFormData`](../interfaces/PingFormData.md) \| [`PortFormData`](../interfaces/PortFormData.md)

Defined in: [shared/types/formData.ts:241](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L241)

Union type representing all possible monitor form data types.

## Remarks

Use this type when you need to handle form data for any monitor type.
TypeScript will ensure type safety through discriminated unions based on the
`type` field.
