import React, { useEffect } from "react";
import { useStore } from "./store";
import { Header } from "./components/Header";
import { SiteList } from "./components/SiteList";
import { AddSiteForm } from "./components/AddSiteForm";
import { Settings } from "./components/Settings";
import { ThemeProvider, ThemedBox, ThemedText } from "./theme/components";
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
  } = useStore();

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
      try {
        const sites = await window.electronAPI.getSites();
        setSites(sites);
      } catch (error) {
        console.error("Failed to load sites:", error);
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
  }, [setSites, updateSiteStatus]);

  const handleStartMonitoring = async () => {
    try {
      await window.electronAPI.startMonitoring();
      setMonitoring(true);
    } catch (error) {
      console.error("Failed to start monitoring:", error);
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await window.electronAPI.stopMonitoring();
      setMonitoring(false);
    } catch (error) {
      console.error("Failed to stop monitoring:", error);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          onStartMonitoring={handleStartMonitoring}
          onStopMonitoring={handleStopMonitoring}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <ThemedBox surface="elevated" padding="md" shadow="sm" rounded="lg">
                <ThemedBox surface="base" padding="md" border className="border-b">
                  <ThemedText size="lg" weight="medium">
                    Monitored Sites ({sites.length})
                  </ThemedText>
                </ThemedBox>
                <div className="p-0">
                  <SiteList sites={sites} />
                </div>
              </ThemedBox>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
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
