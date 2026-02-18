declare const logger: {
    debug(message: string, context?: unknown): void;
    error(message: string, error?: unknown, context?: unknown): void;
};

logger.debug("monitor update", {
    attempt: 2,
    status: "up",
    tags: ["prod", "edge"],
});

const stateSyncAction: "bulk-sync" | "delete" | "update" = "bulk-sync";

logger.debug("state sync", {
    action: stateSyncAction,
    source: "database",
});

const dynamicPayload: unknown = {
    status: "unknown-shape",
};

logger.debug("runtime normalized payload", dynamicPayload);

logger.error("background operation failed", new Error("boom"), {
    operation: "background-load",
});

export const __typedFixtureModule = "typed-fixture-module";
