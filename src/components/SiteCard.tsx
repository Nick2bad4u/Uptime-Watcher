import { Site } from "../types";
import { useStore } from "../store";
import { useTheme } from "../theme/useTheme";
import { ThemedBox, ThemedText, ThemedButton, StatusIndicator, MiniChartBar } from "../theme/components";

interface SiteCardProps {
  site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
  const { removeSite, setError, setLoading, isLoading } = useStore();
  const { isDark } = useTheme();

  const handleRemove = async () => {
    if (!window.confirm(`Are you sure you want to remove ${site.name || site.url}?`)) {
      return;
    }

    setLoading(true);
    try {
      await window.electronAPI.removeSite(site.url);
      removeSite(site.url);
    } catch (error) {
      console.error("Failed to remove site:", error);
      setError("Failed to remove site");
    } finally {
      setLoading(false);
    }
  };

  const formatResponseTime = (time?: number) => {
    if (!time) return "N/A";
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatLastChecked = (date?: Date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  return (
    <ThemedBox 
      surface="base" 
      padding="lg" 
      className={`site-card-hover ${isDark ? 'dark' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <StatusIndicator 
              status={site.status as any} 
              size="lg" 
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <ThemedText size="lg" weight="medium" className="truncate">
                  {site.name || site.url}
                </ThemedText>
                <StatusIndicator 
                  status={site.status as any} 
                  size="sm" 
                  showText 
                />
              </div>

              {site.name && (
                <ThemedText size="sm" variant="tertiary" className="truncate">
                  {site.url}
                </ThemedText>
              )}

              <div className="flex items-center space-x-4 mt-2">
                <ThemedText size="sm" variant="secondary">
                  Response: {formatResponseTime(site.responseTime)}
                </ThemedText>
                <ThemedText size="sm" variant="secondary">
                  Last checked: {formatLastChecked(site.lastChecked)}
                </ThemedText>
                <ThemedText size="sm" variant="secondary">
                  History: {site.history.length} records
                </ThemedText>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <ThemedButton
            variant="error"
            size="sm"
            onClick={handleRemove}
            disabled={isLoading}
            className="p-2"
            aria-label={`Remove ${site.name || site.url}`}
          >
            🗑️
          </ThemedButton>
        </div>
      </div>

      {/* Mini chart area - placeholder for future chart implementation */}
      {site.history.length > 0 && (
        <ThemedBox 
          surface="elevated" 
          padding="md" 
          className="mt-4 border-t"
          border
        >
          <div className="flex items-center space-x-1">
            {site.history
              .slice(0, 20)
              .reverse()
              .map((record, index) => (
                <MiniChartBar
                  key={index}
                  status={record.status as any}
                  responseTime={record.responseTime}
                  timestamp={record.timestamp}
                />
              ))}
          </div>
          <ThemedText size="xs" variant="tertiary" className="mt-1">
            Recent status history (last 20 checks)
          </ThemedText>
        </ThemedBox>
      )}
    </ThemedBox>
  );
}
