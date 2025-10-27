/* eslint-disable */
(function () {
    let isPaused = false;

    document.addEventListener("mouseover", function (e) {
        if (!isPaused) {
            console.log("Hovering over:", e.target);
            console.log("Click the element again to pause debugger...");

            // @ts-expect-error -- For use after application is running
            e.target.addEventListener(
                "click",
                function pauseOnClick() {
                    isPaused = true;
                    debugger;
                    // @ts-expect-error -- For use after application is running
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
