import { ThemedBox, ThemedText } from "../../../theme/components";

/**
 * Empty state component for when there are no sites to display
 */
export function EmptyState() {
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
