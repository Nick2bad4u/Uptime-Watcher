/**
 * Global teardown for Playwright Electron tests.
 *
 * @packageDocumentation Invoked
 *
 * once after the Playwright suite wraps up.
 */

/**
 * Reports completion of Playwright global teardown.
 *
 * @remarks
 * Electron applications launched by tests are closed by `launchElectronApp`
 * cleanup hooks, which target only the child process they own. Keeping global
 * teardown side-effect free avoids terminating unrelated Electron apps that
 * happen to be open on a developer machine.
 */
async function globalTeardown(): Promise<void> {
    console.log("🧹 Cleaning up after Playwright tests...");
    console.log("✅ Cleanup complete");
}

export default globalTeardown;
