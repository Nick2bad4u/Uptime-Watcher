(() => {
    const selector = ".your-hover-element"; // Change to your target selector

    const element = document.querySelector(selector);
    if (!element) {
        console.error(`Element not found: ${selector}`);
        return;
    }

    element.addEventListener("mouseenter", () => {
        debugger; // Pauses immediately on hover
    });

    console.log(`Ready - hover over "${selector}" to pause debugger instantly`);
})();
