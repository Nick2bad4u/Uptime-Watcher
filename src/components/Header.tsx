import React from "react";
import { useStore } from "../store";
import { ThemedBox, ThemedText, ThemedButton, StatusIndicator, ThemedSelect } from "../theme/components";
import { useTheme } from "../theme/useTheme";

interface HeaderProps {
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
}

export function Header({ onStartMonitoring, onStopMonitoring }: HeaderProps) {
  const {
    isMonitoring,
    sites,
    darkMode,
    checkInterval,
    setCheckInterval,
    setShowSettings,
  } = useStore();

  const { toggleTheme } = useTheme();

  const upSites = sites.filter((site) => site.status === "up").length;
  const downSites = sites.filter((site) => site.status === "down").length;
  const pendingSites = sites.filter((site) => site.status === "pending").length;

  const handleIntervalChange = async (interval: number) => {
    setCheckInterval(interval);
    try {
      await window.electronAPI.updateCheckInterval(interval);
    } catch (error) {
      console.error("Failed to update check interval:", error);
    }
  };

  return (
    <ThemedBox surface="elevated" padding="md" className="shadow-sm border-b" border>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <ThemedText size="2xl" weight="bold">
              📊 Uptime Watcher
            </ThemedText>

            {/* Status Summary */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <StatusIndicator status="up" size="sm" />
                <ThemedText size="sm" variant="secondary">
                  {upSites} Up
                </ThemedText>
              </div>
              <div className="flex items-center space-x-1">
                <StatusIndicator status="down" size="sm" />
                <ThemedText size="sm" variant="secondary">
                  {downSites} Down
                </ThemedText>
              </div>
              <div className="flex items-center space-x-1">
                <StatusIndicator status="pending" size="sm" />
                <ThemedText size="sm" variant="secondary">
                  {pendingSites} Pending
                </ThemedText>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Check Interval Selector */}
            <div className="flex items-center space-x-2">
              <ThemedText size="sm" variant="secondary">
                Check every:
              </ThemedText>
              <ThemedSelect
                value={checkInterval}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                aria-label="Check interval"
                className="text-sm"
              >
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
                <option value={300000}>5 minutes</option>
                <option value={600000}>10 minutes</option>
                <option value={1800000}>30 minutes</option>
              </ThemedSelect>
            </div>
            
            {/* Monitoring Controls */}
            <div className="flex items-center space-x-2">
              {isMonitoring ? (
                <ThemedButton
                  variant="error"
                  size="sm"
                  onClick={onStopMonitoring}
                >
                  ⏸️ Stop Monitoring
                </ThemedButton>
              ) : (
                <ThemedButton
                  variant="success"
                  size="sm"
                  onClick={onStartMonitoring}
                >
                  ▶️ Start Monitoring
                </ThemedButton>
              )}
            </div>
            
            {/* Theme Toggle */}
            <ThemedButton
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {darkMode ? "☀️" : "🌙"}
            </ThemedButton>
            
            {/* Settings Button */}
            <ThemedButton
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="p-2"
            >
              ⚙️
            </ThemedButton>
          </div>
        </div>
      </div>
    </ThemedBox>
  );
}
