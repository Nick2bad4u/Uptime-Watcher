import { useStore } from "../../store";
import { ThemedBox, ThemedText } from "../../theme/components";
import { useTheme } from "../../theme/useTheme";
import { SiteCard } from "./SiteCard";

export function SiteList() {
    const { sites } = useStore();
    const { isDark } = useTheme();

    if (sites.length === 0) {
        return (
            <ThemedBox surface="base" padding="xl" className="text-center">
                <div className="empty-state-icon">🌐</div>
                <ThemedText size="lg" weight="medium" className="mb-2">
                    No sites to monitor
                </ThemedText>
                <ThemedText variant="secondary">Add your first website to start monitoring its uptime.</ThemedText>
            </ThemedBox>
        );
    }

    return (
        <div className={`divider-y ${isDark ? "dark" : ""}`}>
            {sites.map((site) => (
                <SiteCard key={site.identifier} site={site} />
            ))}
        </div>
    );
}
