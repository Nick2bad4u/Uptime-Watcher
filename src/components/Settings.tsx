import React from "react";
import { useStore } from "../store";

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const {
    settings,
    updateSettings,
    resetSettings,
    checkInterval,
    setCheckInterval,
  } = useStore();

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleIntervalChange = (interval: number) => {
    setCheckInterval(interval);
  };

  const handleReset = () => {
    if (
      window.confirm("Are you sure you want to reset all settings to defaults?")
    ) {
      resetSettings();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Monitoring Settings */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              🔍 Monitoring
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check Interval
                </label>
                <select
                  value={checkInterval}
                  onChange={(e) => handleIntervalChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15000}>15 seconds</option>
                  <option value={30000}>30 seconds</option>
                  <option value={60000}>1 minute</option>
                  <option value={300000}>5 minutes</option>
                  <option value={600000}>10 minutes</option>
                  <option value={1800000}>30 minutes</option>
                  <option value={3600000}>1 hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Timeout (ms)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="60000"
                  step="1000"
                  value={settings.timeout}
                  onChange={(e) =>
                    handleSettingChange("timeout", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  How long to wait for a response before considering a site down
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Retries
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxRetries}
                  onChange={(e) =>
                    handleSettingChange("maxRetries", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Number of retry attempts before marking a site as down
                </p>
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              🔔 Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Desktop Notifications
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Show notifications when sites go up or down
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) =>
                    handleSettingChange("notifications", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sound Alerts
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Play sound when status changes occur
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundAlerts}
                  onChange={(e) =>
                    handleSettingChange("soundAlerts", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </section>

          {/* Application Settings */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              🖥️ Application
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange("theme", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto-start with System
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Launch Uptime Watcher when your computer starts
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoStart}
                  onChange={(e) =>
                    handleSettingChange("autoStart", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minimize to System Tray
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Keep app running in system tray when window is closed
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.minimizeToTray}
                  onChange={(e) =>
                    handleSettingChange("minimizeToTray", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors text-sm font-medium"
          >
            Reset to Defaults
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
