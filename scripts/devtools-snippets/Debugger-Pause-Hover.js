(function () {
    let isPaused = false;

    document.addEventListener("mouseover", function (e) {
        if (!isPaused) {
            console.log("Hovering over:", e.target);
            console.log("Click the element again to pause debugger...");

            // Runtime browser snippet: event targets are DOM elements in this workflow.
            e.target.addEventListener(
                "click",
                function pauseOnClick() {
                    isPaused = true;
                    debugger;
                    // Runtime browser snippet: event targets are DOM elements in this workflow.
                    e.target.removeEventListener("click", pauseOnClick);
                },
                { once: true }
            );
        }
    });

    console.log(
        "Hover over elements, then click to pause debugger for inspection"
    );
})();
