(function () {
    const selector = ".your-hover-element"; // Change to your target selector

    const element = document.querySelector(selector);
    if (!element) {
        console.error(`Element not found: ${selector}`);
        return;
    }

    element.addEventListener("mouseenter", function () {
        // biome-ignore lint/suspicious/noDebugger: DevTools snippet intentionally pauses execution on hover for inspection.
        debugger; // Pauses immediately on hover
    });

    console.log(`Ready - hover over "${selector}" to pause debugger instantly`);
})();
