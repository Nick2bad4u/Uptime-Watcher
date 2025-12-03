export const withIgnoredIpcEvent = <Args extends unknown[], ReturnValue>(
    handler: (...args: Args) => ReturnValue
): ((...args: Args) => ReturnValue) => handler;
