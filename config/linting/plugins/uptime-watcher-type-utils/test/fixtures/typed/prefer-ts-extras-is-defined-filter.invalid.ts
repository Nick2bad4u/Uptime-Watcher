interface MonitorRecord {
    readonly id: string;
}

declare const maybeNumbers: readonly unknown[];
declare const maybeMonitors: readonly unknown[];
declare const maybeStrings: readonly unknown[];

const numbers = maybeNumbers.filter(
    (value): value is number => value !== undefined
);
const monitors = maybeMonitors.filter(
    (monitor): monitor is MonitorRecord => monitor !== undefined
);
const strings = maybeStrings.filter(
    (entry) => entry !== undefined
);

const totalCount = numbers.length + monitors.length + strings.length;
if (totalCount < 0) {
    throw new TypeError("Unreachable total count");
}

export const __typedFixtureModule = "typed-fixture-module";
