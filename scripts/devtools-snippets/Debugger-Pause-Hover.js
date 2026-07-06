(function () {
    let isPaused = false;

    document.addEventListener("mouseover", function (e) {
        if (!isPaused) {
            const target = e.target;
            if (!(target instanceof Element)) {
                return;
            }

            console.log("Hovering over:", target);
            console.log("Click the element again to pause debugger...");

            target.addEventListener(
                "click",
                function pauseOnClick() {
                    isPaused = true;
                    debugger;
                    target.removeEventListener("click", pauseOnClick);
                },
                { once: true }
            );
        }
    });

    console.log(
        "Hover over elements, then click to pause debugger for inspection"
    );
})();
