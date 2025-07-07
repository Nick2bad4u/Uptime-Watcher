// Frontend event test script
// Run this in the browser console to test event reception

console.log("=== Frontend Event Test ===");

// Test 1: Check if electronAPI is available
console.log("1. electronAPI available:", typeof window.electronAPI);
console.log("   events available:", typeof window.electronAPI?.events);
console.log("   onStatusUpdate available:", typeof window.electronAPI?.events?.onStatusUpdate);
console.log("   onTestEvent available:", typeof window.electronAPI?.events?.onTestEvent);

// Test 2: Set up test event listeners
if (window.electronAPI?.events) {
    console.log("2. Setting up test event listeners...");

    // Test event listener
    if (window.electronAPI.events.onTestEvent) {
        window.electronAPI.events.onTestEvent((data) => {
            console.log("*** FRONTEND RECEIVED TEST EVENT ***", data);
        });
        console.log("   Test event listener set up");
    }

    // Status update listener
    if (window.electronAPI.events.onStatusUpdate) {
        window.electronAPI.events.onStatusUpdate((data) => {
            console.log("*** FRONTEND RECEIVED STATUS UPDATE ***", data);
        });
        console.log("   Status update listener set up");
    }
} else {
    console.log("2. electronAPI.events not available");
}

// Test 3: Trigger a manual check to test event flow
console.log("3. Triggering manual site check...");
if (window.electronAPI?.sites?.getSites) {
    window.electronAPI.sites
        .getSites()
        .then((sites) => {
            console.log("   Sites loaded:", sites?.length || 0);

            if (sites && sites.length > 0) {
                const site = sites[0];
                if (site.monitors && site.monitors.length > 0) {
                    const monitor = site.monitors[0];
                    console.log(`   Triggering check for site: ${site.identifier}, monitor: ${monitor.id}`);

                    return window.electronAPI.sites.checkSiteNow(site.identifier, monitor.id.toString());
                }
            }
            console.log("   No sites or monitors available for testing");
            return null;
        })
        .then((result) => {
            console.log("   Manual check completed:", result);
        })
        .catch((error) => {
            console.error("   Manual check failed:", error);
        });
} else {
    console.log("   electronAPI.sites.getSites not available");
}

console.log("=== Test Complete - Watch for event logs above ===");
