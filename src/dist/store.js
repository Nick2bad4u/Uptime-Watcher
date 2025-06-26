"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useStore = void 0;
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
var constants_1 = require("./constants");
var defaultSettings = {
    autoStart: false,
    historyLimit: 100,
    maxRetries: 3,
    minimizeToTray: true,
    notifications: true,
    soundAlerts: false,
    theme: "system",
    timeout: constants_1.TIMEOUT_CONSTRAINTS.MAX / 10
};
exports.useStore = zustand_1.create()(middleware_1.persist(function (set, get) { return ({
    // Synchronized UI state for SiteDetails
    activeSiteDetailsTab: "overview",
    /**
     * Add a monitor to an existing site
     */
    addMonitorToSite: function (siteId, monitor) { return __awaiter(void 0, void 0, void 0, function () {
        var state, site, updatedMonitors, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = get();
                    state.setLoading(true);
                    state.clearError();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    site = state.sites.find(function (s) { return s.identifier === siteId; });
                    if (!site)
                        throw new Error("Site not found");
                    updatedMonitors = __spreadArrays(site.monitors, [monitor]);
                    return [4 /*yield*/, window.electronAPI.updateSite(siteId, { monitors: updatedMonitors })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, state.syncSitesFromBackend()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    state.setError("Failed to add monitor: " + (error_1 instanceof Error ? error_1.message : String(error_1)));
                    throw error_1;
                case 5:
                    state.setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); },
    addSite: function (site) { return set(function (state) { return ({ sites: __spreadArrays(state.sites, [site]) }); }); },
    // Update: apply downloaded update and restart
    applyUpdate: function () {
        var _a, _b;
        (_b = (_a = window.electronAPI).quitAndInstall) === null || _b === void 0 ? void 0 : _b.call(_a);
    },
    checkSiteNow: function (siteId, monitorId) { return __awaiter(void 0, void 0, void 0, function () {
        var state, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = get();
                    state.clearError();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, window.electronAPI.checkSiteNow(siteId, monitorId)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    state.setError("Failed to check site: " + error_2.message);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    }); },
    clearError: function () { return set({ lastError: undefined }); },
    createSite: function (siteData) { return __awaiter(void 0, void 0, void 0, function () {
        var state, monitors, newSite, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = get();
                    state.setLoading(true);
                    state.clearError();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    monitors = (siteData.monitors && siteData.monitors.length > 0
                        ? siteData.monitors
                        : [
                            {
                                history: [],
                                id: crypto.randomUUID(),
                                monitoring: true,
                                status: "pending",
                                type: "http"
                            },
                        ]).map(function (monitor) { return (__assign(__assign({}, monitor), { id: monitor.id || crypto.randomUUID(), monitoring: typeof monitor.monitoring === "undefined" ? true : monitor.monitoring, status: ["pending", "up", "down"].includes(monitor.status)
                            ? monitor.status
                            : "pending", type: monitor.type })); });
                    return [4 /*yield*/, window.electronAPI.addSite(__assign(__assign({}, siteData), { monitors: monitors }))];
                case 2:
                    newSite = _a.sent();
                    state.addSite(newSite);
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    state.setError("Failed to add site: " + error_3.message);
                    throw error_3;
                case 4:
                    state.setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    // Remove isMonitoring
    darkMode: false,
    deleteSite: function (identifier) { return __awaiter(void 0, void 0, void 0, function () {
        var state, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = get();
                    state.setLoading(true);
                    state.clearError();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, window.electronAPI.removeSite(identifier)];
                case 2:
                    _a.sent();
                    state.removeSite(identifier);
                    return [3 /*break*/, 5];
                case 3:
                    error_4 = _a.sent();
                    state.setError("Failed to remove site: " + error_4.message);
                    throw error_4;
                case 4:
                    state.setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    downloadSQLiteBackup: function () { return __awaiter(void 0, void 0, void 0, function () {
        var state, _a, buffer, fileName, blob, url, a, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    state = get();
                    state.setLoading(true);
                    state.clearError();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, window.electronAPI.downloadSQLiteBackup()];
                case 2:
                    _a = _b.sent(), buffer = _a.buffer, fileName = _a.fileName;
                    if (!buffer)
                        throw new Error("No backup data received");
                    blob = new Blob([buffer], { type: "application/x-sqlite3" });
                    url = URL.createObjectURL(blob);
                    a = document.createElement("a");
                    a.href = url;
                    a.download = fileName || "uptime-watcher-backup-" + new Date().toISOString().split("T")[0] + ".sqlite";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    return [3 /*break*/, 5];
                case 3:
                    error_5 = _b.sent();
                    state.setError("Failed to download SQLite backup: " + error_5.message);
                    throw error_5;
                case 4:
                    state.setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    getSelectedMonitorId: function (siteId) {
        var ids = get().selectedMonitorIds || {};
        // Only allow access to own properties with string keys
        if (typeof siteId === "string" && Object.prototype.hasOwnProperty.call(ids, siteId)) {
            // eslint-disable-next-line security/detect-object-injection -- sanitized above
            return ids[siteId];
        }
        return undefined;
    },
    // Derived selector
    getSelectedSite: function () {
        var _a = get(), selectedSiteId = _a.selectedSiteId, sites = _a.sites;
        if (!selectedSiteId)
            return undefined;
        return sites.find(function (s) { return s.identifier === selectedSiteId; }) || undefined;
    },
    // Backend integration actions
    initializeApp: function () { return __awaiter(void 0, void 0, void 0, function () {
        var state, _a, sites, historyLimit, error_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    state = get();
                    state.setLoading(true);
                    state.clearError();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            window.electronAPI.getSites(),
                            window.electronAPI.getHistoryLimit(),
                        ])];
                case 2:
                    _a = _b.sent(), sites = _a[0], historyLimit = _a[1];
                    state.setSites(sites);
                    state.updateSettings({ historyLimit: historyLimit });
                    return [3 /*break*/, 5];
                case 3:
                    error_6 = _b.sent();
                    state.setError("Failed to initialize app: " + error_6.message);
                    return [3 /*break*/, 5];
                case 4:
                    state.setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    isLoading: false,
    // Error handling initial state
    lastError: undefined,
    modifySite: function (identifier, updates) { return __awaiter(void 0, void 0, void 0, function () {
        var state, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = get();
                    state.setLoading(true);
                    state.clearError();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, window.electronAPI.updateSite(identifier, updates)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, state.syncSitesFromBackend()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_7 = _a.sent();
                    state.setError("Failed to update site: " + error_7.message);
                    throw error_7;
                case 5:
                    state.setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); },
    removeSite: function (identifier) {
        return set(function (state) { return ({
            selectedSiteId: state.selectedSiteId &&
                state.sites.find(function (s) { return s.identifier === identifier && s.identifier === state.selectedSiteId; })
                ? undefined
                : state.selectedSiteId,
            showSiteDetails: state.selectedSiteId &&
                state.sites.find(function (s) { return s.identifier === identifier && s.identifier === state.selectedSiteId; })
                ? false
                : state.showSiteDetails,
            sites: state.sites.filter(function (site) { return site.identifier !== identifier; })
        }); });
    },
    resetSettings: function () {
        return set({
            darkMode: false,
            settings: defaultSettings
        });
    },
    // Selected monitor id per site (UI state, not persisted)
    selectedMonitorIds: {},
    selectedSiteId: undefined,
    // Synchronized UI actions
    setActiveSiteDetailsTab: function (tab) { return set({ activeSiteDetailsTab: tab }); },
    // Error handling actions
    setError: function (error) { return set({ lastError: error }); },
    setLoading: function (loading) { return set({ isLoading: loading }); },
    setSelectedMonitorId: function (siteId, monitorId) {
        return set(function (state) {
            var _a;
            return ({
                selectedMonitorIds: __assign(__assign({}, state.selectedMonitorIds), (_a = {}, _a[siteId] = monitorId, _a))
            });
        });
    },
    // Site details actions
    setSelectedSite: function (site) {
        set({ selectedSiteId: site ? site.identifier : undefined });
    },
    setShowAdvancedMetrics: function (show) { return set({ showAdvancedMetrics: show }); },
    setShowSettings: function (show) { return set({ showSettings: show }); },
    setShowSiteDetails: function (show) { return set({ showSiteDetails: show }); },
    setSiteDetailsChartTimeRange: function (range) {
        return set({ siteDetailsChartTimeRange: range });
    },
    // Internal state actions (used by backend actions and internal logic)
    setSites: function (sites) { return set({ sites: sites }); },
    settings: defaultSettings,
    // updateSiteStatus and updateSite removed: all updates come from backend fetches only
    setUpdateError: function (error) { return set({ updateError: error }); },
    // Update status actions
    setUpdateStatus: function (status) { return set({ updateStatus: status }); },
    showAdvancedMetrics: false,
    showSettings: false,
    showSiteDetails: false,
    siteDetailsChartTimeRange: "24h",
    sites: [],
    startSiteMonitorMonitoring: function (siteId, monitorId) { return __awaiter(void 0, void 0, void 0, function () {
        var state, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = get();
                    state.clearError();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, window.electronAPI.startMonitoringForSite(siteId, monitorId)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, state.syncSitesFromBackend()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_8 = _a.sent();
                    state.setError("Failed to start monitoring for monitor: " + error_8.message);
                    throw error_8;
                case 5: return [2 /*return*/];
            }
        });
    }); },
    stopSiteMonitorMonitoring: function (siteId, monitorId) { return __awaiter(void 0, void 0, void 0, function () {
        var state, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = get();
                    state.clearError();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, window.electronAPI.stopMonitoringForSite(siteId, monitorId)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, state.syncSitesFromBackend()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_9 = _a.sent();
                    state.setError("Failed to stop monitoring for monitor: " + error_9.message);
                    throw error_9;
                case 5: return [2 /*return*/];
            }
        });
    }); },
    subscribeToStatusUpdates: function (callback) {
        window.electronAPI.onStatusUpdate(function (update) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Always fetch latest sites/monitors/history from backend for live updates
                    return [4 /*yield*/, get().syncSitesFromBackend()];
                    case 1:
                        // Always fetch latest sites/monitors/history from backend for live updates
                        _a.sent();
                        // Optionally, call the provided callback for custom logic
                        if (callback)
                            callback(update);
                        return [2 /*return*/];
                }
            });
        }); });
    },
    syncSitesFromBackend: function () { return __awaiter(void 0, void 0, void 0, function () {
        var state, backendSites, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = get();
                    state.setLoading(true);
                    state.clearError();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, window.electronAPI.getSites()];
                case 2:
                    backendSites = _a.sent();
                    state.setSites(backendSites);
                    return [3 /*break*/, 5];
                case 3:
                    error_10 = _a.sent();
                    state.setError("Failed to sync sites: " + error_10.message);
                    return [3 /*break*/, 5];
                case 4:
                    state.setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); },
    toggleDarkMode: function () {
        return set(function (state) {
            var newDarkMode = !state.darkMode;
            // Update theme setting to match
            var newTheme = newDarkMode ? "dark" : "light";
            return {
                darkMode: newDarkMode,
                settings: __assign(__assign({}, state.settings), { theme: newTheme })
            };
        });
    },
    totalDowntime: 0,
    // Statistics initial state
    totalUptime: 0,
    unsubscribeFromStatusUpdates: function () {
        window.electronAPI.removeAllListeners("status-update");
    },
    updateError: undefined,
    updateHistoryLimitValue: function (limit) { return __awaiter(void 0, void 0, void 0, function () {
        var state, newLimit, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = get();
                    state.clearError();
                    state.setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    // Call backend to update and prune history
                    return [4 /*yield*/, window.electronAPI.updateHistoryLimit(limit)];
                case 2:
                    // Call backend to update and prune history
                    _a.sent();
                    return [4 /*yield*/, window.electronAPI.getHistoryLimit()];
                case 3:
                    newLimit = _a.sent();
                    state.updateSettings({ historyLimit: newLimit });
                    return [3 /*break*/, 6];
                case 4:
                    error_11 = _a.sent();
                    state.setError("Failed to update history limit: " + error_11.message);
                    throw error_11;
                case 5:
                    state.setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); },
    updateSettings: function (newSettings) {
        return set(function (state) {
            var _a;
            var updatedSettings = __assign(__assign({}, state.settings), newSettings);
            // Keep darkMode in sync with theme setting for backwards compatibility
            // eslint-disable-next-line functional/no-let -- darkMode must be mutable for conditional assignment
            var darkMode = state.darkMode;
            if (newSettings.theme) {
                darkMode =
                    updatedSettings.theme === "dark" ||
                        (updatedSettings.theme === "system" && ((_a = window.matchMedia) === null || _a === void 0 ? void 0 : _a.call(window, "(prefers-color-scheme: dark)").matches));
            }
            return {
                darkMode: darkMode,
                settings: updatedSettings
            };
        });
    },
    updateSiteCheckInterval: function (siteId, monitorId, interval) { return __awaiter(void 0, void 0, void 0, function () {
        var state, site, updatedMonitors, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = get();
                    state.clearError();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    site = get().sites.find(function (s) { return s.identifier === siteId; });
                    if (!site)
                        throw new Error("Site not found");
                    updatedMonitors = site.monitors.map(function (monitor) {
                        return monitor.id === monitorId ? __assign(__assign({}, monitor), { checkInterval: interval }) : monitor;
                    });
                    return [4 /*yield*/, window.electronAPI.updateSite(siteId, { monitors: updatedMonitors })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, state.syncSitesFromBackend()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_12 = _a.sent();
                    state.setError("Failed to update monitor check interval: " + error_12.message);
                    throw error_12;
                case 5: return [2 /*return*/];
            }
        });
    }); },
    // Update status initial state
    updateStatus: "idle"
}); }, {
    name: "uptime-watcher-storage",
    partialize: function (state) { return ({
        activeSiteDetailsTab: state.activeSiteDetailsTab,
        darkMode: state.darkMode,
        settings: state.settings,
        showAdvancedMetrics: state.showAdvancedMetrics,
        siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
        totalDowntime: state.totalDowntime,
        totalUptime: state.totalUptime
    }); }
}));
