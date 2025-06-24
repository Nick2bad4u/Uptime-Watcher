import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SiteCard } from "./SiteCard";
import { useStore } from "../store";
import { useTheme } from "../theme/useTheme";
import { ThemedBox, ThemedText } from "../theme/components";
export function SiteList() {
    const { sites } = useStore();
    const { isDark } = useTheme();
    if (sites.length === 0) {
        return (_jsxs(ThemedBox, { surface: "base", padding: "xl", className: "text-center", children: [_jsx("div", { className: "empty-state-icon", children: "\uD83C\uDF10" }), _jsx(ThemedText, { size: "lg", weight: "medium", className: "mb-2", children: "No sites to monitor" }), _jsx(ThemedText, { variant: "secondary", children: "Add your first website to start monitoring its uptime." })] }));
    }
    return (_jsx("div", { className: `divider-y ${isDark ? "dark" : ""}`, children: sites.map((site) => (_jsx(SiteCard, { site: site }, site.identifier))) }));
}
