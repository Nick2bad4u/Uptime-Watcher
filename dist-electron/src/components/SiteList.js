"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteList = SiteList;
const jsx_runtime_1 = require("react/jsx-runtime");
const store_1 = require("../store");
const components_1 = require("../theme/components");
const useTheme_1 = require("../theme/useTheme");
const SiteCard_1 = require("./SiteCard");
function SiteList() {
    const { sites } = (0, store_1.useStore)();
    const { isDark } = (0, useTheme_1.useTheme)();
    if (sites.length === 0) {
        return ((0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { surface: "base", padding: "xl", className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "empty-state-icon", children: "\uD83C\uDF10" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "medium", className: "mb-2", children: "No sites to monitor" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { variant: "secondary", children: "Add your first website to start monitoring its uptime." })] }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: `divider-y ${isDark ? "dark" : ""}`, children: sites.map((site) => ((0, jsx_runtime_1.jsx)(SiteCard_1.SiteCard, { site: site }, site.identifier))) }));
}
