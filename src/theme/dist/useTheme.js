"use strict";
exports.__esModule = true;
exports.useAvailabilityColors = exports.useThemeClasses = exports.useStatusColors = exports.useThemeValue = exports.useTheme = void 0;
var react_1 = require("react");
var store_1 = require("../store");
var ThemeManager_1 = require("./ThemeManager");
function useTheme() {
    var _a = store_1.useStore(), settings = _a.settings, updateSettings = _a.updateSettings;
    var _b = react_1.useState("light"), systemTheme = _b[0], setSystemTheme = _b[1];
    var _c = react_1.useState(0), themeVersion = _c[0], setThemeVersion = _c[1]; // Force re-renders
    // Memoized getCurrentTheme to satisfy useEffect deps and avoid unnecessary re-renders
    var getCurrentTheme = react_1.useCallback(function () {
        var themeName = settings.theme;
        return ThemeManager_1.themeManager.getTheme(themeName);
    }, [settings.theme]);
    var _d = react_1.useState(getCurrentTheme), currentTheme = _d[0], setCurrentTheme = _d[1];
    // Update theme when settings or systemTheme change
    react_1.useEffect(function () {
        var newTheme = getCurrentTheme();
        setCurrentTheme(newTheme);
        ThemeManager_1.themeManager.applyTheme(newTheme);
        setThemeVersion(function (prev) { return prev + 1; }); // Force re-render of all themed components
    }, [settings.theme, systemTheme, getCurrentTheme]);
    // Listen for system theme changes
    react_1.useEffect(function () {
        var cleanup = ThemeManager_1.themeManager.onSystemThemeChange(function (isDark) {
            var newSystemTheme = isDark ? "dark" : "light";
            setSystemTheme(newSystemTheme);
        });
        // Set initial system theme
        setSystemTheme(ThemeManager_1.themeManager.getSystemThemePreference());
        return cleanup;
    }, []);
    // Change theme
    var setTheme = function (themeName) {
        updateSettings({ theme: themeName });
    };
    // Toggle between light and dark
    var toggleTheme = function () {
        var newTheme = currentTheme.isDark ? "light" : "dark";
        setTheme(newTheme);
    };
    // Get theme-aware color
    var getColor = function (path) {
        var keys = path.split(".");
        var value = keys.reduce(function (acc, key) {
            return acc && typeof acc === "object" && Object.prototype.hasOwnProperty.call(acc, key)
                ? // eslint-disable-next-line security/detect-object-injection -- Object.prototype.hasOwnProperty ensures safety
                    acc[key]
                : undefined;
        }, currentTheme.colors);
        return typeof value === "string" ? value : "#000000";
    };
    // Get status color
    var getStatusColor = function (status) {
        // Only allow known status keys
        var allowedStatuses = ["up", "down", "pending", "unknown"];
        if (allowedStatuses.includes(status)) {
            // eslint-disable-next-line security/detect-object-injection -- currentTheme.colors.status is validated against allowedStatuses
            return currentTheme.colors.status[status];
        }
        // Fallback to a safe color if status is invalid
        return "#000000";
    };
    // Get available themes
    var availableThemes = ThemeManager_1.themeManager.getAvailableThemes();
    return {
        availableThemes: availableThemes,
        currentTheme: currentTheme,
        getColor: getColor,
        getStatusColor: getStatusColor,
        isDark: currentTheme.isDark,
        setTheme: setTheme,
        systemTheme: systemTheme,
        themeManager: ThemeManager_1.themeManager,
        themeName: settings.theme,
        themeVersion: themeVersion,
        toggleTheme: toggleTheme
    };
}
exports.useTheme = useTheme;
// Utility hook for getting theme values in components
function useThemeValue(selector) {
    var currentTheme = useTheme().currentTheme;
    return selector(currentTheme);
}
exports.useThemeValue = useThemeValue;
// Hook for theme-aware status colors
function useStatusColors() {
    var currentTheme = useTheme().currentTheme;
    return {
        down: currentTheme.colors.status.down,
        pending: currentTheme.colors.status.pending,
        unknown: currentTheme.colors.status.unknown,
        up: currentTheme.colors.status.up
    };
}
exports.useStatusColors = useStatusColors;
// Hook for theme-aware CSS classes using CSS custom properties
function useThemeClasses() {
    var getColor = useTheme().getColor;
    var getBackgroundClass = function (variant) {
        if (variant === void 0) { variant = "primary"; }
        return {
            backgroundColor: "var(--color-background-" + variant + ")"
        };
    };
    var getTextClass = function (variant) {
        if (variant === void 0) { variant = "primary"; }
        return {
            color: "var(--color-text-" + variant + ")"
        };
    };
    var getBorderClass = function (variant) {
        if (variant === void 0) { variant = "primary"; }
        return {
            borderColor: "var(--color-border-" + variant + ")"
        };
    };
    var getSurfaceClass = function (variant) {
        if (variant === void 0) { variant = "base"; }
        return {
            backgroundColor: "var(--color-surface-" + variant + ")"
        };
    };
    var getStatusClass = function (status) {
        return {
            color: "var(--color-status-" + status + ")"
        };
    };
    return {
        getBackgroundClass: getBackgroundClass,
        getBorderClass: getBorderClass,
        getColor: getColor,
        getStatusClass: getStatusClass,
        getSurfaceClass: getSurfaceClass,
        getTextClass: getTextClass
    };
}
exports.useThemeClasses = useThemeClasses;
// Hook for availability-based colors
function useAvailabilityColors() {
    var currentTheme = useTheme().currentTheme;
    var getAvailabilityColor = function (percentage) {
        // Clamp percentage between 0 and 100
        var clampedPercentage = Math.max(0, Math.min(100, percentage));
        // Use theme colors for consistency
        if (clampedPercentage >= 99) {
            return currentTheme.colors.status.up; // Excellent
        }
        else if (clampedPercentage >= 95) {
            return currentTheme.colors.success; // Very good
        }
        else if (clampedPercentage >= 90) {
            return currentTheme.colors.status.up; // Good
        }
        else if (clampedPercentage >= 80) {
            return currentTheme.colors.status.pending; // Fair (warning)
        }
        else if (clampedPercentage >= 70) {
            return currentTheme.colors.warning; // Warning
        }
        else if (clampedPercentage >= 50) {
            return currentTheme.colors.error; // Poor
        }
        else {
            return currentTheme.colors.status.down; // Critical
        }
    };
    var getAvailabilityVariant = function (percentage) {
        var clampedPercentage = Math.max(0, Math.min(100, percentage));
        if (clampedPercentage >= 95) {
            return "success";
        }
        else if (clampedPercentage >= 80) {
            return "warning";
        }
        else {
            return "danger";
        }
    };
    var getAvailabilityDescription = function (percentage) {
        var clampedPercentage = Math.max(0, Math.min(100, percentage));
        if (clampedPercentage >= 99.9) {
            return "Excellent";
        }
        else if (clampedPercentage >= 99) {
            return "Very Good";
        }
        else if (clampedPercentage >= 95) {
            return "Good";
        }
        else if (clampedPercentage >= 90) {
            return "Fair";
        }
        else if (clampedPercentage >= 80) {
            return "Poor";
        }
        else if (clampedPercentage >= 50) {
            return "Critical";
        }
        else {
            return "Failed";
        }
    };
    return {
        getAvailabilityColor: getAvailabilityColor,
        getAvailabilityDescription: getAvailabilityDescription,
        getAvailabilityVariant: getAvailabilityVariant
    };
}
exports.useAvailabilityColors = useAvailabilityColors;
