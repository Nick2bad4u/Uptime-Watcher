/**
 * Numeric string predicates for strict backend coercion.
 */

function isAsciiDigit(character: string | undefined): boolean {
    return (
        typeof character === "string" &&
        character.length === 1 &&
        character >= "0" &&
        character <= "9"
    );
}

function consumeAsciiDigits(value: string, startIndex: number): number {
    let index = startIndex;

    while (isAsciiDigit(value[index])) {
        index += 1;
    }

    return index;
}

/**
 * Returns true for signed decimal strings with an integer part.
 *
 * @remarks
 * Accepted examples: `0`, `-10`, `+10`, `3.14`. Rejected examples: `.5`, `1.`,
 * `1e3`, `0x10`, `Infinity`.
 */
export function isStrictPlainDecimalNumberString(value: string): boolean {
    if (value.length === 0) {
        return false;
    }

    let index = value.startsWith("+") || value.startsWith("-") ? 1 : 0;
    const integerStartIndex = index;

    index = consumeAsciiDigits(value, index);
    if (index === integerStartIndex) {
        return false;
    }

    if (value[index] === ".") {
        index += 1;
        const decimalStartIndex = index;
        index = consumeAsciiDigits(value, index);

        if (index === decimalStartIndex) {
            return false;
        }
    }

    return index === value.length;
}
