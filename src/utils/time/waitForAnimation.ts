export const waitForAnimation = (durationMs = 300): Promise<void> =>
    new Promise((resolve) => {
        const timer = window.setTimeout(() => {
            window.clearTimeout(timer);
            resolve();
        }, durationMs);
    });
