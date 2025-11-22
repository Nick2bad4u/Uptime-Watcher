/* eslint-disable */
/**
 * List All Sites - Displays all sites and their monitors
 */
(async () => {
    console.log("📋 Fetching all sites...");

    // @ts-expect-error -- For use after application is running
    if (!window.electronAPI?.sites?.getSites) {
        console.error("❌ electronAPI.sites.getSites not available");
        return;
    }

    try {
        // @ts-expect-error -- For use after application is running
        const sites = await window.electronAPI.sites.getSites();

        console.log(`\n📊 Total sites: ${sites.length}\n`);

        if (sites.length === 0) {
            console.log("ℹ️  No sites configured");
            return;
        }

        sites.forEach((site, index) => {
            console.log(`${index + 1}. ${site.name} (${site.identifier})`);
            console.log(`   Monitoring: ${site.monitoring ? "✅" : "❌"}`);
            console.log(`   Monitors: ${site.monitors.length}`);

            site.monitors.forEach((monitor, mIndex) => {
                console.log(
                    `      ${mIndex + 1}. ${monitor.type} - ${monitor.status || "pending"}`
                );
                if (monitor.url) console.log(`         URL: ${monitor.url}`);
                if (monitor.host)
                    console.log(
                        `         Host: ${monitor.host}${monitor.port ? ":" + monitor.port : ""}`
                    );
            });
            console.log("");
        });
    } catch (error) {
        console.error("❌ Failed to fetch sites:", error);
    }
})();
