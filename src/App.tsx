import React, { useEffect } from "react";
import { useStore } from "./store";
import { Header } from "./components/Header";
import { SiteList } from "./components/SiteList";
import { AddSiteForm } from "./components/AddSiteForm";
import { Settings } from "./components/Settings";
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        onStartMonitoring={handleStartMonitoring}
        onStopMonitoring={handleStopMonitoring}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Monitored Sites ({sites.length})
                </h2>
              </div>
              <SiteList sites={sites} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Add New Site
              </h3>
              <AddSiteForm />
            </div>{" "}
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
