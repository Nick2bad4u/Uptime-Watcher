declare const logger: {
    debug(message: string, context?: unknown): void;
};

logger.debug("monitor update", {
    attempt: 2,
    status: "up",
    tags: ["prod", "edge"],
});

export const __typedFixtureModule = "typed-fixture-module";
