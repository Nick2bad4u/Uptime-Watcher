/* eslint-disable */
/**
 * Add Minimal Test Sites - Adds 3 basic sites for quick testing
 */
(async () => {
    console.log("🚀 Adding minimal test sites...");
    // @ts-expect-error -- For use after application is running
    if (!window.electronAPI?.sites?.addSite) {
        console.error("❌ electronAPI.sites.addSite not available");
        return;
    }

    const timestamp = Date.now();
    const sites = [
        {
            identifier: `quick-http-${timestamp}`,
            name: "Quick HTTP Test",
            monitoring: false,
            monitors: [
                {
                    id: `monitor-http-${timestamp}`,
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 60000,
                    timeout: 10000,
                    retryAttempts: 3,
                    monitoring: false,
                    status: "pending",
                    responseTime: 0,
                    history: [],
                },
            ],
        },
        {
            identifier: `quick-port-${timestamp}`,
            name: "Quick Port Test",
            monitoring: false,
            monitors: [
                {
                    id: `monitor-port-${timestamp}`,
                    type: "port",
                    host: "example.com",
                    port: 443,
                    checkInterval: 60000,
                    timeout: 10000,
                    retryAttempts: 3,
                    monitoring: false,
                    status: "pending",
                    responseTime: 0,
                    history: [],
                },
            ],
        },
        {
            identifier: `quick-ping-${timestamp}`,
            name: "Quick Ping Test",
            monitoring: false,
            monitors: [
                {
                    id: `monitor-ping-${timestamp}`,
                    type: "ping",
                    host: "8.8.8.8",
                    checkInterval: 60000,
                    timeout: 10000,
                    retryAttempts: 3,
                    monitoring: false,
                    status: "pending",
                    responseTime: 0,
                    history: [],
                },
            ],
        },
    ];

    let count = 0;
    for (const site of sites) {
        try {
            // @ts-expect-error -- For use after application is running
            await window.electronAPI.sites.addSite(site);
            console.log(`✅ Added: ${site.name}`);
            count++;
        } catch (error) {
            console.error(`❌ Failed to add ${site.name}:`, error);
        }
    }

    console.log(`\n✅ Added ${count} test site(s)`);
})();
