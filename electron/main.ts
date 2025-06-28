import log from "electron-log/main";

import { ApplicationService } from "./services/application";
import { logger } from "./utils/logger";

// Configure electron-log for main process
log.initialize({ preload: true });
log.transports.file.level = "info";
log.transports.console.level = "debug";
log.transports.file.fileName = "uptime-watcher-main.log";
log.transports.file.maxSize = 1024 * 1024 * 5; // 5MB max file size
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
log.transports.console.format = "[{h}:{i}:{s}.{ms}] [{level}] {text}";

/**
 * Main entry point for the Electron application.
 * Uses modular ApplicationService for clean separation of concerns.
 */
class Main {
    private applicationService: ApplicationService;

    constructor() {
        logger.info("Starting Uptime Watcher application");
        this.applicationService = new ApplicationService();

        // Setup cleanup on app quit
        process.on("before-exit", () => {
            this.applicationService.cleanup();
        });
    }
}

// Start the application
new Main();
