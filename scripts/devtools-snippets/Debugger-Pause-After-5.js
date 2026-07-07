// Pause debugger after delay with options for interactive element inspection
(function () {
    const delayMs = 5000; // milliseconds before debugger pauses

    console.log(
        `Debugger will pause in ${delayMs}ms for element inspection...`
    );

    setTimeout(function () {
        // biome-ignore lint/suspicious/noDebugger: DevTools snippet intentionally pauses execution for element inspection.
        debugger; // Pauses here - use this time to hover/interact with elements
    }, delayMs);
})();
