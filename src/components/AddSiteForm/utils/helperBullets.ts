/**
 * AddSiteForm helper bullet generation.
 *
 * @remarks
 * Extracted from AddSiteForm.tsx to keep the component lean and to centralize
 * normalization + de-duplication rules.
 */

/**
 * A single helper bullet rendered under the AddSiteForm.
 */
export interface HelperBullet {
    readonly id: string;
    readonly text: string;
}

/**
 * Inputs for {@link buildAddSiteFormHelperBullets}.
 */
export interface BuildAddSiteFormHelperBulletsArgs {
    addMode: "existing" | "new";
    checkIntervalLabel: string;
    helpTexts: {
        primary: string;
        secondary: string;
    };
}

const normalizeText = (value: string): string => {
    const lower = value.trim().toLowerCase();
    let collapsedWhitespace = "";
    let lastWasWhitespace = false;

    for (const character of lower) {
        const isWhitespace =
            character === " " ||
            character === "\n" ||
            character === "\t" ||
            character === "\r";

        if (isWhitespace) {
            if (!lastWasWhitespace) {
                collapsedWhitespace += " ";
                lastWasWhitespace = true;
            }
        } else {
            collapsedWhitespace += character;
            lastWasWhitespace = false;
        }
    }

    while (
        collapsedWhitespace.endsWith(".") ||
        collapsedWhitespace.endsWith("!")
    ) {
        collapsedWhitespace = collapsedWhitespace.slice(0, -1);
    }

    return collapsedWhitespace;
};

const shouldHideFooterHelpText = (value: string): boolean => {
    const normalized = normalizeText(value);

    // URL guidance is already rendered directly beneath the URL field via
    // field-level helpText.
    if (normalized.includes("://") || normalized.includes("full url")) {
        return true;
    }

    // Interval guidance is shown as an explicit, more actionable footer bullet.
    if (
        normalized.includes("monitoring interval") ||
        normalized.includes("check interval")
    ) {
        return true;
    }

    return false;
};

/**
 * Builds the helper bullet list shown at the bottom of AddSiteForm.
 */
export function buildAddSiteFormHelperBullets(
    args: BuildAddSiteFormHelperBulletsArgs
): HelperBullet[] {
    const seen = new Set<string>();
    const modeBulletText =
        args.addMode === "new"
            ? "Provide a descriptive site name for new entries"
            : "Select a site to add the monitor to";

    const bullets: HelperBullet[] = [
        {
            id: "mode",
            text: modeBulletText,
        },
    ];

    seen.add(normalizeText(modeBulletText));

    const addUniqueBullet = (id: string, text: string): void => {
        const normalized = normalizeText(text);
        if (normalized.length === 0 || seen.has(normalized)) {
            return;
        }

        seen.add(normalized);
        bullets.push({ id, text });
    };

    let preferredHelpText: HelperBullet | null = null;

    if (
        args.helpTexts.primary &&
        !shouldHideFooterHelpText(args.helpTexts.primary)
    ) {
        preferredHelpText = {
            id: `primary-${args.helpTexts.primary}`,
            text: args.helpTexts.primary,
        };
    } else if (
        args.helpTexts.secondary &&
        !shouldHideFooterHelpText(args.helpTexts.secondary)
    ) {
        preferredHelpText = {
            id: `secondary-${args.helpTexts.secondary}`,
            text: args.helpTexts.secondary,
        };
    }

    if (preferredHelpText) {
        addUniqueBullet(preferredHelpText.id, preferredHelpText.text);
    }

    addUniqueBullet(
        "interval",
        `Checks run every ${args.checkIntervalLabel}. You can change this later.`
    );

    return bullets;
}
