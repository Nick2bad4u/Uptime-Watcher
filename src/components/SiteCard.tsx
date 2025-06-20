import React from "react";
import { Site } from "../types";
import { useStore } from "../store";

interface SiteCardProps {
  site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
  const { removeSite } = useStore();

  const handleRemove = async () => {
    try {
      await window.electronAPI.removeSite(site.url);
      removeSite(site.url);
    } catch (error) {
      console.error("Failed to remove site:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "up":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
      case "down":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "up":
        return "✅";
      case "down":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "❓";
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
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(site.status)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                  {site.name || site.url}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}
                >
                  {site.status.toUpperCase()}
                </span>
              </div>

              {site.name && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {site.url}
                </p>
              )}

              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Response: {formatResponseTime(site.responseTime)}</span>
                <span>Last checked: {formatLastChecked(site.lastChecked)}</span>
                <span>History: {site.history.length} records</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleRemove}
            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Remove site"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Mini chart area - placeholder for future chart implementation */}
      {site.history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-1">
            {site.history
              .slice(0, 20)
              .reverse()
              .map((record, index) => (
                <div
                  key={index}
                  className={`w-2 h-8 rounded-sm ${
                    record.status === "up" ? "bg-green-500" : "bg-red-500"
                  }`}
                  title={`${record.status} - ${formatResponseTime(record.responseTime)} at ${new Date(record.timestamp).toLocaleString()}`}
                />
              ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Recent status history (last 20 checks)
          </p>
        </div>
      )}
    </div>
  );
}
