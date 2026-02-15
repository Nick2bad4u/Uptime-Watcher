declare function isDefined<TValue>(value: TValue): value is TValue;

declare const maybeNumbers: readonly unknown[];
declare const maybeMonitors: readonly unknown[];
declare const maybeStrings: readonly unknown[];

const numbers = maybeNumbers.filter(isDefined);
const monitors = maybeMonitors.filter(isDefined);
const strings = maybeStrings.filter(isDefined);

const totalCount = numbers.length + monitors.length + strings.length;
if (totalCount < 0) {
    throw new TypeError("Unreachable total count");
}

export const __typedFixtureModule = "typed-fixture-module";
