/**
 * Commitlint configuration for the Uptime Watcher project.
 * Enforces conventional commit message format to maintain consistency
 * and enable automated changelog generation.
 * 
 * Uses @commitlint/config-conventional for standard commit format:
 * - type(scope): description
 * - Examples: feat(auth): add login functionality, fix(api): resolve timeout issue
 */
module.exports = {
    extends: ["@commitlint/config-conventional"],
};
