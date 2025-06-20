import { useEffect, useState } from "react";
import { useStore } from "./store";
import { useTheme } from "./theme/useTheme";
import { Header } from "./components/Header";
import { SiteList } from "./components/SiteList";
import { AddSiteForm } from "./components/AddSiteForm";
import { Settings } from "./components/Settings";
import { ThemeProvider, ThemedBox, ThemedText, ThemedButton } from "./theme/components";
import { StatusUpdate } from "./types";

function App() {
  const {
    sites,
    setSites,
    updateSiteStatus,
    setMonitoring,
    darkMode,
    showSettings,
    setShowSettings,
    setError,
    setLoading,
    lastError,
    clearError,
    isLoading,
  } = useStore();

  const { isDark } = useTheme();

  // Delayed loading state to prevent flash for quick operations
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  // Only show loading overlay if loading takes more than 100ms
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      // Show loading overlay after 100ms delay
      timeoutId = setTimeout(() => {
        setShowLoadingOverlay(true);
      }, 100);
    } else {
      // Hide loading overlay immediately when loading stops
      setShowLoadingOverlay(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    // Load initial sites when app starts
    const loadSites = async () => {
      setLoading(true);
      try {
        const sites = await window.electronAPI.getSites();
        setSites(sites);
      } catch (error) {
        console.error("Failed to load sites:", error);
        setError("Failed to load sites");
      } finally {
        setLoading(false);
      }
    };

    loadSites();

    // Listen for status updates
    const handleStatusUpdate = (update: StatusUpdate) => {
      updateSiteStatus(update);
    };

    window.electronAPI.onStatusUpdate(handleStatusUpdate);

    // Cleanup
    return () => {
      window.electronAPI.removeAllListeners("status-update");
    };
  }, [setSites, updateSiteStatus, setError, setLoading]);

  const handleStartMonitoring = async () => {
    setLoading(true);
    try {
      await window.electronAPI.startMonitoring();
      setMonitoring(true);
    } catch (error) {
      console.error("Failed to start monitoring:", error);
      setError("Failed to start monitoring");
    } finally {
      setLoading(false);
    }
  };

  const handleStopMonitoring = async () => {
    setLoading(true);
    try {
      await window.electronAPI.stopMonitoring();
      setMonitoring(false);
    } catch (error) {
      console.error("Failed to stop monitoring:", error);
      setError("Failed to stop monitoring");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className={`app-container ${isDark ? 'dark' : ''}`}>
        {/* Global Loading Overlay */}
        {showLoadingOverlay && (
          <div className="loading-overlay">
            <ThemedBox surface="elevated" padding="lg" rounded="lg" shadow="xl">
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <ThemedText size="base" weight="medium">Loading...</ThemedText>
              </div>
            </ThemedBox>
          </div>
        )}

        {/* Global Error Notification */}
        {lastError && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <ThemedBox surface="elevated" padding="md" className="rounded-none border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="text-red-500">⚠️</div>
                  <ThemedText size="sm" className="text-red-600 dark:text-red-400">
                    {lastError}
                  </ThemedText>
                </div>
                <ThemedButton
                  variant="secondary"
                  size="sm"
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                >
                  ✕
                </ThemedButton>
              </div>
            </ThemedBox>
          </div>
        )}

        <Header
          onStartMonitoring={handleStartMonitoring}
          onStopMonitoring={handleStopMonitoring}
        />

        <main className="main-container">
          <div className="grid-layout">
            {/* Main content */}
            <div>
              <ThemedBox surface="elevated" padding="md" shadow="sm" rounded="lg">
                <ThemedBox surface="base" padding="md" border className="border-b">
                  <ThemedText size="lg" weight="medium">
                    Monitored Sites ({sites.length})
                  </ThemedText>
                </ThemedBox>
                <div className="p-0">
                  <SiteList />
                </div>
              </ThemedBox>
            </div>

            {/* Sidebar */}
            <div>
              <ThemedBox surface="elevated" padding="lg" shadow="sm" rounded="lg">
                <ThemedText size="lg" weight="medium" className="mb-4">
                  Add New Site
                </ThemedText>
                <AddSiteForm />
              </ThemedBox>
            </div>
          </div>
        </main>

        {/* Settings Modal */}
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </div>
    </ThemeProvider>
  );
}

export default App;
