// Test script to trigger manual site check and verify event flow
// Run this in the browser console after the app loads

console.log("Testing event flow...");

// First, get the list of sites
window.electronAPI.sites
    .getSites()
    .then((sites) => {
        console.log("Sites loaded:", sites);

        if (sites && sites.length > 0) {
            const site = sites[0];
            console.log("Testing with site:", site.identifier);

            if (site.monitors && site.monitors.length > 0) {
                const monitor = site.monitors[0];
                console.log("Testing with monitor:", monitor.id);

                // Trigger a manual check
                return window.electronAPI.sites.checkSiteNow(site.identifier, monitor.id.toString());
            } else {
                console.error("No monitors found in site");
            }
        } else {
            console.error("No sites found");
        }
    })
    .then((result) => {
        console.log("Manual check result:", result);
    })
    .catch((error) => {
        console.error("Test failed:", error);
    });
