/* eslint-disable */
(function () {
    const selector = ".your-hover-element"; // Change to your target selector
    const delayMs = 5000;

    const element = document.querySelector(selector);
    if (!element) {
        console.error(`Element not found: ${selector}`);
        return;
    }

    element.addEventListener(
        "mouseenter",
        function () {
            console.log("Element hovered! Pausing debugger in", delayMs, "ms");
            setTimeout(function () {
                debugger;
            }, delayMs);
        },
        { once: true }
    );

    console.log(`Ready - hover over "${selector}" to trigger debugger`);
})();
