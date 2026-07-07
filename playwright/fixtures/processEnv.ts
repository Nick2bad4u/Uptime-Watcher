const shouldDropForceColor = (
    environment: Readonly<NodeJS.ProcessEnv>
): boolean => Boolean(environment["NO_COLOR"] && environment["FORCE_COLOR"]);

export const sanitizeProcessEnvInPlace = (
    environment: NodeJS.ProcessEnv = process.env
): void => {
    if (shouldDropForceColor(environment)) {
        Reflect.deleteProperty(environment, "FORCE_COLOR");
    }
};

export const createSanitizedProcessEnv = (
    environment: Readonly<NodeJS.ProcessEnv> = process.env
): NodeJS.ProcessEnv => {
    const sanitizedEnvironment: NodeJS.ProcessEnv = { ...environment };

    sanitizeProcessEnvInPlace(sanitizedEnvironment);

    return sanitizedEnvironment;
};

export const createStringProcessEnv = (
    environment: Readonly<NodeJS.ProcessEnv> = process.env
): Record<string, string> => {
    const sanitizedEnvironment = createSanitizedProcessEnv(environment);

    return Object.entries(sanitizedEnvironment).reduce<Record<string, string>>(
        (accumulator, [key, value]) => {
            if (typeof value === "string") {
                accumulator[key] = value;
            }

            return accumulator;
        },
        {}
    );
};
