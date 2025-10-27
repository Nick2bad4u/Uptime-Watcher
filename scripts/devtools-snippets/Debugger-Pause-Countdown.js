/* eslint-disable */
(function () {
    const delayMs = 5000;
    let remaining = delayMs / 1000;

    console.log(`Debugger pausing in ${remaining}s...`);

    const countdown = setInterval(() => {
        remaining--;
        if (remaining > 0) console.log(`${remaining}s remaining...`);
    }, 1000);

    setTimeout(function () {
        clearInterval(countdown);
        console.log("Debugger paused - inspect your element now!");
        debugger;
    }, delayMs);
})();
