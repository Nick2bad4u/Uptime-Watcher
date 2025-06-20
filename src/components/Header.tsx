import React from "react";
import { useStore } from "../store";

interface HeaderProps {
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
}

export function Header({ onStartMonitoring, onStopMonitoring }: HeaderProps) {
  const {
    isMonitoring,
    sites,
    toggleDarkMode,
    darkMode,
    checkInterval,
    setCheckInterval,
    setShowSettings,
  } = useStore();

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
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              📊 Uptime Watcher
            </h1>

            {/* Status Summary */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span className="text-gray-600 dark:text-gray-300">
                  {upSites} Up
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span className="text-gray-600 dark:text-gray-300">
                  {downSites} Down
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span className="text-gray-600 dark:text-gray-300">
                  {pendingSites} Pending
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Check Interval Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Check every:
              </span>
              <select
                value={checkInterval}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
                <option value={300000}>5 minutes</option>
                <option value={600000}>10 minutes</option>
                <option value={1800000}>30 minutes</option>
              </select>
            </div>
            {/* Monitoring Controls */}
            <div className="flex items-center space-x-2">
              {isMonitoring ? (
                <button
                  onClick={onStopMonitoring}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  ⏸️ Stop Monitoring
                </button>
              ) : (
                <button
                  onClick={onStartMonitoring}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  ▶️ Start Monitoring
                </button>
              )}
            </div>{" "}
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              title="Open Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
