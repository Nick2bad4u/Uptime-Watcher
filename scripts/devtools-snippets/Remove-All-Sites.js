/* eslint-disable */
/**
 * Remove All Sites - Deletes all sites from the database
 *
 * ⚠️ WARNING: This action cannot be undone! This will delete ALL sites and
 * their monitoring history.
 */
(async () => {
    console.log("🗑️  Starting to remove all sites...");

    // @ts-expect-error -- For use after application is running
    if (!window.electronAPI?.sites?.deleteAllSites) {
        console.error("❌ electronAPI.sites.deleteAllSites not available");
        return;
    }

    // Confirm before deletion
    const confirmDelete = confirm(
        "⚠️ WARNING: This will delete ALL sites and their data!\n\n" +
            "This action CANNOT be undone.\n\n" +
            "Are you sure you want to continue?"
    );

    if (!confirmDelete) {
        console.log("❌ Operation cancelled by user");
        return;
    }

    try {
        // @ts-expect-error -- For use after application is running
        const deletedCount = await window.electronAPI.sites.deleteAllSites();
        console.log(`✅ Successfully deleted ${deletedCount} site(s)`);
        console.log("🎉 All sites have been removed from the database");
    } catch (error) {
        console.error("❌ Failed to delete sites:", error);
    }
})();
