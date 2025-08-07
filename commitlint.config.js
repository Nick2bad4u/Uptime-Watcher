/**
 * Commitlint configuration for the Uptime Watcher project.
 * Enforces conventional commit message format to maintain consistency
 * and enable automated changelog generation.
 *
 * Uses @commitlint/config-conventional for standard commit format:
 * - type(scope): description
 * - Examples: feat(auth): add login functionality, fix(api): resolve timeout issue
 */
// eslint-disable-next-line unicorn/prefer-module
module.exports = {
    $schema: "https://www.schemastore.org/commitlintrc.json",
    extends: ["@commitlint/config-conventional"],
};
