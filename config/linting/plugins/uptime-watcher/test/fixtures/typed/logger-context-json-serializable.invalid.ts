declare const logger: {
    debug(message: string, context?: unknown): void;
};

logger.debug("monitor update", {
    cache: new Map<string, string>(),
    onDone: () => "done",
});

export const __typedFixtureModule = "typed-fixture-module";
