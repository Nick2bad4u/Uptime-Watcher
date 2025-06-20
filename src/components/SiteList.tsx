import { SiteCard } from "./SiteCard";
import { useStore } from "../store";
import { ThemedBox, ThemedText } from "../theme/components";

export function SiteList() {
  const { sites } = useStore();

  if (sites.length === 0) {
    return (
      <ThemedBox surface="base" padding="xl" className="text-center">
        <div className="text-gray-400 text-6xl mb-4">🌐</div>
        <ThemedText size="lg" weight="medium" className="mb-2">
          No sites to monitor
        </ThemedText>
        <ThemedText variant="secondary">
          Add your first website to start monitoring its uptime.
        </ThemedText>
      </ThemedBox>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} />
      ))}
    </div>
  );
}
