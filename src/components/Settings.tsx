import { useStore } from "../store";
import { 
  ThemedBox, 
  ThemedText, 
  ThemedButton, 
  StatusIndicator,
  ThemedInput,
  ThemedSelect,
  ThemedCheckbox
} from "../theme/components";
import { useTheme } from "../theme/useTheme";
import { CHECK_INTERVALS } from "../constants";

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
    lastError,
    clearError,
    isLoading,
    setLoading,
    setError,
  } = useStore();

  const { setTheme, availableThemes } = useTheme();

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleIntervalChange = async (interval: number) => {
    setLoading(true);
    try {
      setCheckInterval(interval);
      await window.electronAPI.updateCheckInterval(interval);
    } catch (error) {
      console.error("Failed to update check interval:", error);
      setError("Failed to update check interval");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm("Are you sure you want to reset all settings to defaults?")
    ) {
      resetSettings();
      clearError(); // Clear any errors when resetting
    }
  };

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName as any);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ThemedBox
        surface="overlay"
        padding="md"
        rounded="lg"
        shadow="xl"
        className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <ThemedBox
          surface="elevated"
          padding="lg"
          rounded="none"
          border={true}
          className="border-b"
        >
          <div className="flex items-center justify-between">
            <ThemedText size="xl" weight="semibold">
              ⚙️ Settings
            </ThemedText>
            <ThemedButton
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="hover:opacity-75 transition-opacity"
            >
              ✕
            </ThemedButton>
          </div>
        </ThemedBox>

        {/* Error Display */}
        {lastError && (
          <ThemedBox
            surface="base"
            padding="md"
            className="mx-6 mt-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700"
            rounded="md"
          >
            <div className="flex items-center justify-between">
              <ThemedText variant="primary" size="sm" className="text-red-800 dark:text-red-200">
                ⚠️ {lastError}
              </ThemedText>
              <ThemedButton
                variant="secondary"
                size="xs"
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </ThemedButton>
            </div>
          </ThemedBox>
        )}

        {/* Content */}
        <ThemedBox surface="base" padding="lg" className="space-y-6">
          {/* Monitoring Settings */}
          <section>
            <ThemedText size="lg" weight="medium" className="mb-4">
              🔍 Monitoring
            </ThemedText>
            <div className="space-y-4">
              <div>
                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                  Check Interval
                </ThemedText>
                <ThemedSelect
                  value={checkInterval}
                  onChange={(e) => handleIntervalChange(Number(e.target.value))}
                  disabled={isLoading}
                  aria-label="Check interval for monitoring sites"
                >
                  {CHECK_INTERVALS.map((interval) => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))}
                </ThemedSelect>
              </div>

              <div>
                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                  Request Timeout (ms)
                </ThemedText>
                <ThemedInput
                  type="number"
                  min="1000"
                  max="60000"
                  step="1000"
                  value={settings.timeout}
                  onChange={(e) =>
                    handleSettingChange("timeout", Number(e.target.value))
                  }
                  disabled={isLoading}
                  aria-label="Request timeout in milliseconds"
                />
                <ThemedText size="xs" variant="tertiary" className="mt-1 block">
                  How long to wait for a response before considering a site down
                </ThemedText>
              </div>

              <div>
                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                  Max Retries
                </ThemedText>
                <ThemedInput
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxRetries}
                  onChange={(e) =>
                    handleSettingChange("maxRetries", Number(e.target.value))
                  }
                  disabled={isLoading}
                  aria-label="Maximum number of retry attempts"
                />
                <ThemedText size="xs" variant="tertiary" className="mt-1 block">
                  Number of retry attempts before marking a site as down
                </ThemedText>
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section>
            <ThemedText size="lg" weight="medium" className="mb-4">
              🔔 Notifications
            </ThemedText>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <ThemedText size="sm" weight="medium">
                    Desktop Notifications
                  </ThemedText>
                  <ThemedText size="xs" variant="tertiary">
                    Show notifications when sites go up or down
                  </ThemedText>
                </div>
                <ThemedCheckbox
                  checked={settings.notifications}
                  onChange={(e) =>
                    handleSettingChange("notifications", e.target.checked)
                  }
                  disabled={isLoading}
                  aria-label="Enable desktop notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <ThemedText size="sm" weight="medium">
                    Sound Alerts
                  </ThemedText>
                  <ThemedText size="xs" variant="tertiary">
                    Play sound when status changes occur
                  </ThemedText>
                </div>
                <ThemedCheckbox
                  checked={settings.soundAlerts}
                  onChange={(e) =>
                    handleSettingChange("soundAlerts", e.target.checked)
                  }
                  disabled={isLoading}
                  aria-label="Enable sound alerts"
                />
              </div>
            </div>
          </section>

          {/* Application Settings */}
          <section>
            <ThemedText size="lg" weight="medium" className="mb-4">
              🖥️ Application
            </ThemedText>
            <div className="space-y-4">
              <div>
                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                  Theme
                </ThemedText>
                <ThemedSelect
                  value={settings.theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  disabled={isLoading}
                  aria-label="Select application theme"
                >
                  {availableThemes.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </option>
                  ))}
                </ThemedSelect>
                <div className="mt-2 flex items-center gap-2">
                  <ThemedText size="xs" variant="tertiary">
                    Current theme preview:
                  </ThemedText>
                  <StatusIndicator status="up" size="sm" />
                  <StatusIndicator status="down" size="sm" />
                  <StatusIndicator status="pending" size="sm" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <ThemedText size="sm" weight="medium">
                    Auto-start with System
                  </ThemedText>
                  <ThemedText size="xs" variant="tertiary">
                    Launch Uptime Watcher when your computer starts
                  </ThemedText>
                </div>
                <ThemedCheckbox
                  checked={settings.autoStart}
                  onChange={(e) =>
                    handleSettingChange("autoStart", e.target.checked)
                  }
                  disabled={isLoading}
                  aria-label="Enable auto-start with system"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <ThemedText size="sm" weight="medium">
                    Minimize to System Tray
                  </ThemedText>
                  <ThemedText size="xs" variant="tertiary">
                    Keep app running in system tray when window is closed
                  </ThemedText>
                </div>
                <ThemedCheckbox
                  checked={settings.minimizeToTray}
                  onChange={(e) =>
                    handleSettingChange("minimizeToTray", e.target.checked)
                  }
                  disabled={isLoading}
                  aria-label="Enable minimize to system tray"
                />
              </div>
            </div>
          </section>
        </ThemedBox>

        {/* Footer */}
        <ThemedBox
          surface="elevated"
          padding="lg"
          rounded="none"
          border={true}
          className="border-t"
        >
          <div className="flex items-center justify-between">
            <ThemedButton
              variant="error"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset to Defaults
            </ThemedButton>
            <div className="flex items-center space-x-3">
              <ThemedButton
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </ThemedButton>
              <ThemedButton
                variant="primary"
                size="sm"
                onClick={onClose}
                loading={isLoading}
              >
                Save Changes
              </ThemedButton>
            </div>
          </div>
        </ThemedBox>
      </ThemedBox>
    </div>
  );
}
