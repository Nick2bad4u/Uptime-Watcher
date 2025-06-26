"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.themeManager = exports.ThemeManager = void 0;
var themes_1 = require("./themes");
var ThemeManager = /** @class */ (function () {
    function ThemeManager() {
    }
    ThemeManager.getInstance = function () {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    };
    /**
     * Get theme by name
     */
    ThemeManager.prototype.getTheme = function (name) {
        if (name === "system") {
            var systemPreference = this.getSystemThemePreference();
            // Only allow "light" or "dark" as keys
            if (systemPreference === "light" || systemPreference === "dark") {
                // eslint-disable-next-line security/detect-object-injection -- always light or dark
                return themes_1.themes[systemPreference];
            }
            // Fallback to light theme if unexpected value
            return themes_1.themes.light;
        }
        return themes_1.themes[name] || themes_1.themes.light;
    };
    /**
     * Get system theme preference
     */
    ThemeManager.prototype.getSystemThemePreference = function () {
        if (typeof window !== "undefined" && window.matchMedia) {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
    };
    /**
     * Listen for system theme changes
     */
    ThemeManager.prototype.onSystemThemeChange = function (callback) {
        if (typeof window === "undefined" || !window.matchMedia) {
            return function () { };
        }
        var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        var handler = function (e) { return callback(e.matches); };
        mediaQuery.addEventListener("change", handler);
        // Return cleanup function
        return function () { return mediaQuery.removeEventListener("change", handler); };
    };
    /**
     * Apply theme to document
     */
    ThemeManager.prototype.applyTheme = function (theme) {
        if (typeof document === "undefined")
            return;
        var root = document.documentElement;
        // Apply CSS custom properties
        for (var _i = 0, _a = Object.entries(theme.colors); _i < _a.length; _i++) {
            var _b = _a[_i], category = _b[0], colors = _b[1];
            if (typeof colors === "object" && colors !== undefined) {
                for (var _c = 0, _d = Object.entries(colors); _c < _d.length; _c++) {
                    var _e = _d[_c], key = _e[0], value = _e[1];
                    root.style.setProperty("--color-" + category + "-" + key, String(value));
                }
            }
            else {
                root.style.setProperty("--color-" + category, String(colors));
            }
        }
        // Apply typography
        for (var _f = 0, _g = Object.entries(theme.typography.fontSize); _f < _g.length; _f++) {
            var _h = _g[_f], size = _h[0], value = _h[1];
            root.style.setProperty("--font-size-" + size, value);
        }
        for (var _j = 0, _k = Object.entries(theme.typography.fontWeight); _j < _k.length; _j++) {
            var _l = _k[_j], weight = _l[0], value = _l[1];
            root.style.setProperty("--font-weight-" + weight, value);
        }
        for (var _m = 0, _o = Object.entries(theme.typography.lineHeight); _m < _o.length; _m++) {
            var _p = _o[_m], height = _p[0], value = _p[1];
            root.style.setProperty("--line-height-" + height, value);
        }
        // Apply spacing
        for (var _q = 0, _r = Object.entries(theme.spacing); _q < _r.length; _q++) {
            var _s = _r[_q], size = _s[0], value = _s[1];
            root.style.setProperty("--spacing-" + size, value);
        }
        // Apply shadows
        for (var _t = 0, _u = Object.entries(theme.shadows); _t < _u.length; _t++) {
            var _v = _u[_t], size = _v[0], value = _v[1];
            root.style.setProperty("--shadow-" + size, value);
        }
        // Apply border radius
        for (var _w = 0, _x = Object.entries(theme.borderRadius); _w < _x.length; _w++) {
            var _y = _x[_w], size = _y[0], value = _y[1];
            root.style.setProperty("--radius-" + size, value);
        }
        // Set theme class on body
        document.body.className = document.body.className.replace(/theme-\w+/g, "").trim();
        document.body.classList.add("theme-" + theme.name);
        // Set dark mode class for Tailwind compatibility
        if (theme.isDark) {
            root.classList.add("dark");
        }
        else {
            root.classList.remove("dark");
        }
    };
    /**
     * Create a custom theme based on an existing theme
     */
    ThemeManager.prototype.createCustomTheme = function (baseTheme, overrides) {
        return __assign(__assign(__assign({}, baseTheme), overrides), { borderRadius: __assign(__assign({}, baseTheme.borderRadius), overrides.borderRadius), colors: __assign(__assign({}, baseTheme.colors), overrides.colors), shadows: __assign(__assign({}, baseTheme.shadows), overrides.shadows), spacing: __assign(__assign({}, baseTheme.spacing), overrides.spacing), typography: __assign(__assign({}, baseTheme.typography), overrides.typography) });
    };
    /**
     * Get all available theme names
     */
    ThemeManager.prototype.getAvailableThemes = function () {
        return ["light", "dark", "high-contrast", "system"];
    };
    /**
     * Validate if theme name is valid
     */
    ThemeManager.prototype.isValidThemeName = function (name) {
        return this.getAvailableThemes().includes(name);
    };
    /**
     * Generate CSS variables string for a theme
     */
    ThemeManager.prototype.generateCSSVariables = function (theme) {
        var variables = [];
        // Colors
        for (var _i = 0, _a = Object.entries(theme.colors); _i < _a.length; _i++) {
            var _b = _a[_i], category = _b[0], colors = _b[1];
            if (typeof colors === "object" && colors !== undefined) {
                for (var _c = 0, _d = Object.entries(colors); _c < _d.length; _c++) {
                    var _e = _d[_c], key = _e[0], value = _e[1];
                    variables.push("  --color-" + category + "-" + key + ": " + value + ";");
                }
            }
            else {
                variables.push("  --color-" + category + ": " + colors + ";");
            }
        }
        // Typography
        for (var _f = 0, _g = Object.entries(theme.typography.fontSize); _f < _g.length; _f++) {
            var _h = _g[_f], size = _h[0], value = _h[1];
            variables.push("  --font-size-" + size + ": " + value + ";");
        }
        for (var _j = 0, _k = Object.entries(theme.typography.fontWeight); _j < _k.length; _j++) {
            var _l = _k[_j], weight = _l[0], value = _l[1];
            variables.push("  --font-weight-" + weight + ": " + value + ";");
        }
        for (var _m = 0, _o = Object.entries(theme.typography.lineHeight); _m < _o.length; _m++) {
            var _p = _o[_m], height = _p[0], value = _p[1];
            variables.push("  --line-height-" + height + ": " + value + ";");
        }
        // Spacing
        for (var _q = 0, _r = Object.entries(theme.spacing); _q < _r.length; _q++) {
            var _s = _r[_q], size = _s[0], value = _s[1];
            variables.push("  --spacing-" + size + ": " + value + ";");
        }
        // Shadows
        for (var _t = 0, _u = Object.entries(theme.shadows); _t < _u.length; _t++) {
            var _v = _u[_t], size = _v[0], value = _v[1];
            variables.push("  --shadow-" + size + ": " + value + ";");
        }
        // Border radius
        for (var _w = 0, _x = Object.entries(theme.borderRadius); _w < _x.length; _w++) {
            var _y = _x[_w], size = _y[0], value = _y[1];
            variables.push("  --radius-" + size + ": " + value + ";");
        }
        return ":root {\n" + variables.join("\n") + "\n}";
    };
    return ThemeManager;
}());
exports.ThemeManager = ThemeManager;
exports.themeManager = ThemeManager.getInstance();
