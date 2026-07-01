export const waitForAnimation = (durationMs = 300): Promise<void> =>
    new Promise((resolve) => {
        const timer = globalThis.setTimeout(() => {
            globalThis.clearTimeout(timer);
            resolve();
        }, durationMs);
    });
