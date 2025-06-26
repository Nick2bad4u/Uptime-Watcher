"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.UptimeMonitor = void 0;
/* eslint-disable perfectionist/sort-imports */
var events_1 = require("events");
var path_1 = require("path");
var axios_1 = require("axios");
var electron_1 = require("electron");
var main_1 = require("electron-log/main");
var is_port_reachable_1 = require("is-port-reachable");
var node_sqlite3_wasm_1 = require("node-sqlite3-wasm");
// Default timeout for HTTP requests (10 seconds)
var DEFAULT_REQUEST_TIMEOUT = 10000;
// Configure logger for uptime monitor
var logger = {
    debug: function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return main_1["default"].debug.apply(main_1["default"], __spreadArrays(["[MONITOR] " + message], args));
    },
    error: function (message, error) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (error instanceof Error) {
            main_1["default"].error.apply(main_1["default"], __spreadArrays(["[MONITOR] " + message, { message: error.message, stack: error.stack }], args));
        }
        else {
            main_1["default"].error.apply(main_1["default"], __spreadArrays(["[MONITOR] " + message, error], args));
        }
    },
    info: function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return main_1["default"].info.apply(main_1["default"], __spreadArrays(["[MONITOR] " + message], args));
    },
    warn: function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return main_1["default"].warn.apply(main_1["default"], __spreadArrays(["[MONITOR] " + message], args));
    }
};
var UptimeMonitor = /** @class */ (function (_super) {
    __extends(UptimeMonitor, _super);
    function UptimeMonitor() {
        var _this = _super.call(this) || this;
        _this.sites = new Map(); // key: site.identifier
        _this.siteIntervals = new Map(); // Per-site intervals
        _this.historyLimit = 100; // Default history limit
        _this.isMonitoring = false;
        _this.initDatabase();
        return _this;
    }
    // Helper: Retry logic for file operations
    UptimeMonitor.prototype.saveSitesWithRetry = function (maxRetries, delayMs) {
        if (maxRetries === void 0) { maxRetries = 5; }
        if (delayMs === void 0) { delayMs = 300; }
        return __awaiter(this, void 0, Promise, function () {
            var attempt, lastError, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attempt = 0;
                        lastError = null;
                        _a.label = 1;
                    case 1:
                        if (!(attempt < maxRetries)) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, this.saveSites()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                    case 4:
                        error_1 = _a.sent();
                        lastError = error_1;
                        logger.error("saveSites failed (attempt " + (attempt + 1) + "/" + maxRetries + ")", error_1);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delayMs); })];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 7:
                        logger.error("Persistent DB write failure after retries", lastError);
                        this.emit("db-error", { error: lastError, operation: "saveSites" });
                        return [2 /*return*/];
                }
            });
        });
    };
    // Helper: Retry logic for loading sites (DB read)
    UptimeMonitor.prototype.loadSitesWithRetry = function (maxRetries, delayMs) {
        if (maxRetries === void 0) { maxRetries = 5; }
        if (delayMs === void 0) { delayMs = 300; }
        return __awaiter(this, void 0, Promise, function () {
            var attempt, lastError, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attempt = 0;
                        lastError = null;
                        _a.label = 1;
                    case 1:
                        if (!(attempt < maxRetries)) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, this.loadSites()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                    case 4:
                        error_2 = _a.sent();
                        lastError = error_2;
                        logger.error("loadSites failed (attempt " + (attempt + 1) + "/" + maxRetries + ")", error_2);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delayMs); })];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 7:
                        logger.error("Persistent DB read failure after retries", lastError);
                        this.emit("db-error", { error: lastError, operation: "loadSites" });
                        return [2 /*return*/];
                }
            });
        });
    };
    UptimeMonitor.prototype.initDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbPath, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        dbPath = path_1["default"].join(electron_1.app.getPath("userData"), "uptime-watcher.sqlite");
                        logger.info("[initDatabase] Using SQLite DB at: " + dbPath);
                        this.db = new node_sqlite3_wasm_1.Database(dbPath);
                        // Create tables if they don't exist
                        return [4 /*yield*/, this.db.run("\n                CREATE TABLE IF NOT EXISTS sites (\n                    identifier TEXT PRIMARY KEY,\n                    name TEXT\n                );\n            ")];
                    case 1:
                        // Create tables if they don't exist
                        _a.sent();
                        return [4 /*yield*/, this.db.run("\n                CREATE TABLE IF NOT EXISTS monitors (\n                    id INTEGER PRIMARY KEY AUTOINCREMENT,\n                    site_identifier TEXT,\n                    type TEXT,\n                    url TEXT,\n                    host TEXT,\n                    port INTEGER,\n                    checkInterval INTEGER,\n                    monitoring BOOLEAN,\n                    status TEXT,\n                    responseTime INTEGER,\n                    lastChecked DATETIME,\n                    FOREIGN KEY(site_identifier) REFERENCES sites(identifier)\n                );\n            ")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.db.run("\n                CREATE TABLE IF NOT EXISTS history (\n                    id INTEGER PRIMARY KEY AUTOINCREMENT,\n                    monitor_id INTEGER,\n                    timestamp INTEGER,\n                    status TEXT,\n                    responseTime INTEGER,\n                    details TEXT, -- New: flexible details column\n                    FOREIGN KEY(monitor_id) REFERENCES monitors(id)\n                );\n            ")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.db.run("\n                CREATE TABLE IF NOT EXISTS settings (\n                    key TEXT PRIMARY KEY,\n                    value TEXT\n                );\n            ")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.db.run("\n                CREATE TABLE IF NOT EXISTS stats (\n                    key TEXT PRIMARY KEY,\n                    value TEXT\n                );\n            ")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.db.run("\n                CREATE TABLE IF NOT EXISTS logs (\n                    id INTEGER PRIMARY KEY AUTOINCREMENT,\n                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,\n                    level TEXT,\n                    message TEXT,\n                    data TEXT\n                );\n            ")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.loadSitesWithRetry()];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_3 = _a.sent();
                        logger.error("Failed to initialize database", error_3);
                        this.emit("db-error", { error: error_3, operation: "initDatabase" });
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    UptimeMonitor.prototype.loadSites = function () {
        return __awaiter(this, void 0, void 0, function () {
            var siteRows, _i, siteRows_1, siteRow, monitorRows, monitors, _a, monitorRows_1, row, historyRows, history, site, setting, _b, _c, site, _d, _e, monitor, error_4;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 11, , 12]);
                        return [4 /*yield*/, this.db.all("SELECT * FROM sites")];
                    case 1:
                        siteRows = (_f.sent());
                        this.sites.clear();
                        _i = 0, siteRows_1 = siteRows;
                        _f.label = 2;
                    case 2:
                        if (!(_i < siteRows_1.length)) return [3 /*break*/, 9];
                        siteRow = siteRows_1[_i];
                        return [4 /*yield*/, this.db.all("SELECT * FROM monitors WHERE site_identifier = ?", [
                                String(siteRow.identifier),
                            ])];
                    case 3:
                        monitorRows = (_f.sent());
                        monitors = [];
                        _a = 0, monitorRows_1 = monitorRows;
                        _f.label = 4;
                    case 4:
                        if (!(_a < monitorRows_1.length)) return [3 /*break*/, 7];
                        row = monitorRows_1[_a];
                        return [4 /*yield*/, this.db.all("SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC", [String(row.id)])];
                    case 5:
                        historyRows = (_f.sent());
                        history = historyRows.map(function (h) { return ({
                            details: h.details != undefined ? String(h.details) : undefined,
                            responseTime: typeof h.responseTime === "number" ? h.responseTime : Number(h.responseTime),
                            status: h.status === "up" || h.status === "down" ? h.status : "down",
                            timestamp: typeof h.timestamp === "number" ? h.timestamp : Number(h.timestamp)
                        }); });
                        monitors.push({
                            checkInterval: typeof row.checkInterval === "number"
                                ? row.checkInterval
                                : row.checkInterval
                                    ? Number(row.checkInterval)
                                    : undefined,
                            history: history,
                            host: row.host != undefined ? String(row.host) : undefined,
                            id: row.id != undefined ? String(row.id) : "-1",
                            lastChecked: row.lastChecked &&
                                (typeof row.lastChecked === "string" || typeof row.lastChecked === "number")
                                ? new Date(row.lastChecked)
                                : undefined,
                            monitoring: !!row.monitoring,
                            port: typeof row.port === "number" ? row.port : row.port ? Number(row.port) : undefined,
                            responseTime: typeof row.responseTime === "number"
                                ? row.responseTime
                                : row.responseTime
                                    ? Number(row.responseTime)
                                    : undefined,
                            status: typeof row.status === "string" ? row.status : "down",
                            type: typeof row.type === "string" ? row.type : "http",
                            url: row.url != undefined ? String(row.url) : undefined
                        });
                        _f.label = 6;
                    case 6:
                        _a++;
                        return [3 /*break*/, 4];
                    case 7:
                        site = {
                            identifier: String(siteRow.identifier),
                            monitors: monitors,
                            name: siteRow.name ? String(siteRow.name) : undefined
                        };
                        this.sites.set(site.identifier, site);
                        _f.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [4 /*yield*/, this.db.get("SELECT value FROM settings WHERE key = 'historyLimit'")];
                    case 10:
                        setting = _f.sent();
                        if (setting && typeof setting.value === "string") {
                            this.historyLimit = parseInt(setting.value, 10);
                        }
                        // Resume monitoring for all monitors that were running before restart
                        for (_b = 0, _c = this.sites.values(); _b < _c.length; _b++) {
                            site = _c[_b];
                            for (_d = 0, _e = site.monitors; _d < _e.length; _d++) {
                                monitor = _e[_d];
                                if (monitor.monitoring) {
                                    this.startMonitoringForSite(site.identifier, String(monitor.id));
                                }
                            }
                        }
                        return [3 /*break*/, 12];
                    case 11:
                        error_4 = _f.sent();
                        logger.error("Failed to load sites from DB", error_4);
                        this.emit("db-error", { error: error_4, operation: "loadSites" });
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    UptimeMonitor.prototype.getSites = function () {
        return __awaiter(this, void 0, Promise, function () {
            var siteRows, sites, _i, siteRows_2, siteRow, monitorRows, monitors, _a, monitorRows_2, row, historyRows, history;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db.all("SELECT * FROM sites")];
                    case 1:
                        siteRows = (_b.sent());
                        sites = [];
                        _i = 0, siteRows_2 = siteRows;
                        _b.label = 2;
                    case 2:
                        if (!(_i < siteRows_2.length)) return [3 /*break*/, 9];
                        siteRow = siteRows_2[_i];
                        return [4 /*yield*/, this.db.all("SELECT * FROM monitors WHERE site_identifier = ?", [
                                String(siteRow.identifier),
                            ])];
                    case 3:
                        monitorRows = (_b.sent());
                        monitors = [];
                        _a = 0, monitorRows_2 = monitorRows;
                        _b.label = 4;
                    case 4:
                        if (!(_a < monitorRows_2.length)) return [3 /*break*/, 7];
                        row = monitorRows_2[_a];
                        return [4 /*yield*/, this.db.all("SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC", [String(row.id)])];
                    case 5:
                        historyRows = (_b.sent());
                        history = historyRows.map(function (h) { return ({
                            details: h.details != undefined ? String(h.details) : undefined,
                            responseTime: typeof h.responseTime === "number" ? h.responseTime : Number(h.responseTime),
                            status: h.status === "up" || h.status === "down" ? h.status : "down",
                            timestamp: typeof h.timestamp === "number" ? h.timestamp : Number(h.timestamp)
                        }); });
                        monitors.push({
                            checkInterval: typeof row.checkInterval === "number"
                                ? row.checkInterval
                                : row.checkInterval
                                    ? Number(row.checkInterval)
                                    : undefined,
                            history: history,
                            host: row.host != undefined ? String(row.host) : undefined,
                            id: row.id != undefined ? String(row.id) : "-1",
                            lastChecked: row.lastChecked && (typeof row.lastChecked === "string" || typeof row.lastChecked === "number")
                                ? new Date(row.lastChecked)
                                : undefined,
                            monitoring: !!row.monitoring,
                            port: typeof row.port === "number" ? row.port : row.port ? Number(row.port) : undefined,
                            responseTime: typeof row.responseTime === "number"
                                ? row.responseTime
                                : row.responseTime
                                    ? Number(row.responseTime)
                                    : undefined,
                            status: typeof row.status === "string" ? row.status : "down",
                            type: typeof row.type === "string" ? row.type : "http",
                            url: row.url != undefined ? String(row.url) : undefined
                        });
                        _b.label = 6;
                    case 6:
                        _a++;
                        return [3 /*break*/, 4];
                    case 7:
                        sites.push({
                            identifier: String(siteRow.identifier),
                            monitors: monitors,
                            name: siteRow.name ? String(siteRow.name) : undefined
                        });
                        _b.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, sites];
                }
            });
        });
    };
    UptimeMonitor.prototype.saveSites = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, _i, _b, site, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        _loop_1 = function (site) {
                            var dbMonitors, toDelete, _i, toDelete_1, del, _a, _b, monitor, row;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: 
                                    // Upsert site row
                                    return [4 /*yield*/, this_1.db.run("INSERT OR REPLACE INTO sites (identifier, name) VALUES (?, ?)", [
                                            site.identifier,
                                            (_a = site.name) !== null && _a !== void 0 ? _a : null,
                                        ])];
                                    case 1:
                                        // Upsert site row
                                        _c.sent();
                                        return [4 /*yield*/, this_1.db.all("SELECT id FROM monitors WHERE site_identifier = ?", [
                                                site.identifier,
                                            ])];
                                    case 2:
                                        dbMonitors = (_c.sent());
                                        toDelete = dbMonitors.filter(function (dbm) { return !site.monitors.some(function (m) { return String(m.id) === String(dbm.id); }); });
                                        _i = 0, toDelete_1 = toDelete;
                                        _c.label = 3;
                                    case 3:
                                        if (!(_i < toDelete_1.length)) return [3 /*break*/, 7];
                                        del = toDelete_1[_i];
                                        return [4 /*yield*/, this_1.db.run("DELETE FROM history WHERE monitor_id = ?", [del.id])];
                                    case 4:
                                        _c.sent();
                                        return [4 /*yield*/, this_1.db.run("DELETE FROM monitors WHERE id = ?", [del.id])];
                                    case 5:
                                        _c.sent();
                                        _c.label = 6;
                                    case 6:
                                        _i++;
                                        return [3 /*break*/, 3];
                                    case 7:
                                        _a = 0, _b = site.monitors;
                                        _c.label = 8;
                                    case 8:
                                        if (!(_a < _b.length)) return [3 /*break*/, 14];
                                        monitor = _b[_a];
                                        if (!(monitor.id && !isNaN(Number(monitor.id)))) return [3 /*break*/, 10];
                                        return [4 /*yield*/, this_1.db.run("UPDATE monitors SET url = ?, host = ?, port = ?, checkInterval = ?, monitoring = ?, status = ?, responseTime = ?, lastChecked = ? WHERE id = ?", [
                                                monitor.url ? String(monitor.url) : null,
                                                monitor.host ? String(monitor.host) : null,
                                                monitor.port !== undefined && monitor.port !== null ? Number(monitor.port) : null,
                                                monitor.checkInterval !== undefined && monitor.checkInterval !== null
                                                    ? Number(monitor.checkInterval)
                                                    : null,
                                                monitor.monitoring ? 1 : 0,
                                                monitor.status,
                                                monitor.responseTime !== undefined && monitor.responseTime !== null
                                                    ? Number(monitor.responseTime)
                                                    : null,
                                                monitor.lastChecked ? monitor.lastChecked.toISOString() : null,
                                                monitor.id,
                                            ])];
                                    case 9:
                                        _c.sent();
                                        return [3 /*break*/, 13];
                                    case 10: return [4 /*yield*/, this_1.db.run("INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, monitoring, status, responseTime, lastChecked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                            site.identifier,
                                            monitor.type,
                                            monitor.url ? String(monitor.url) : null,
                                            monitor.host ? String(monitor.host) : null,
                                            monitor.port !== undefined && monitor.port !== null ? Number(monitor.port) : null,
                                            monitor.checkInterval !== undefined && monitor.checkInterval !== null
                                                ? Number(monitor.checkInterval)
                                                : null,
                                            monitor.monitoring ? 1 : 0,
                                            monitor.status,
                                            monitor.responseTime !== undefined && monitor.responseTime !== null
                                                ? Number(monitor.responseTime)
                                                : null,
                                            monitor.lastChecked ? monitor.lastChecked.toISOString() : null,
                                        ])];
                                    case 11:
                                        _c.sent();
                                        return [4 /*yield*/, this_1.db.get("SELECT id FROM monitors WHERE site_identifier = ? ORDER BY id DESC LIMIT 1", [site.identifier])];
                                    case 12:
                                        row = _c.sent();
                                        if (row && typeof row.id === "number") {
                                            monitor.id = String(row.id);
                                        }
                                        _c.label = 13;
                                    case 13:
                                        _a++;
                                        return [3 /*break*/, 8];
                                    case 14: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, _b = this.sites.values();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 4];
                        site = _b[_i];
                        return [5 /*yield**/, _loop_1(site)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: 
                    // Save historyLimit to settings
                    return [4 /*yield*/, this.db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('historyLimit', ?)", [
                            this.historyLimit.toString(),
                        ])];
                    case 5:
                        // Save historyLimit to settings
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_5 = _c.sent();
                        logger.error("Failed to save sites to DB", error_5);
                        throw error_5;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    UptimeMonitor.prototype.addSite = function (siteData) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var site, _i, _b, monitor, row, _c, _d, monitor;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        logger.info("Adding new site: " + siteData.identifier);
                        site = __assign({}, siteData);
                        this.sites.set(site.identifier, site); // Use identifier as key
                        // Persist to DB immediately
                        return [4 /*yield*/, this.db.run("INSERT OR REPLACE INTO sites (identifier, name) VALUES (?, ?)", [
                                site.identifier,
                                (_a = site.name) !== null && _a !== void 0 ? _a : null,
                            ])];
                    case 1:
                        // Persist to DB immediately
                        _e.sent();
                        // Remove all monitors for this site, then insert new ones
                        return [4 /*yield*/, this.db.run("DELETE FROM monitors WHERE site_identifier = ?", [site.identifier])];
                    case 2:
                        // Remove all monitors for this site, then insert new ones
                        _e.sent();
                        _i = 0, _b = site.monitors;
                        _e.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        monitor = _b[_i];
                        return [4 /*yield*/, this.db.run("INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, monitoring, status, responseTime, lastChecked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                site.identifier,
                                monitor.type,
                                monitor.url ? String(monitor.url) : null,
                                monitor.host ? String(monitor.host) : null,
                                monitor.port !== undefined && monitor.port !== null ? Number(monitor.port) : null,
                                monitor.checkInterval !== undefined && monitor.checkInterval !== null
                                    ? Number(monitor.checkInterval)
                                    : null,
                                monitor.monitoring ? 1 : 0,
                                monitor.status,
                                monitor.responseTime !== undefined && monitor.responseTime !== null
                                    ? Number(monitor.responseTime)
                                    : null,
                                monitor.lastChecked ? monitor.lastChecked.toISOString() : null,
                            ])];
                    case 4:
                        _e.sent();
                        return [4 /*yield*/, this.db.get("SELECT id FROM monitors WHERE site_identifier = ? ORDER BY id DESC LIMIT 1", [site.identifier])];
                    case 5:
                        row = _e.sent();
                        if (!row || typeof row.id !== "number") {
                            logger.error("Failed to fetch monitor id after insert", {
                                monitorType: monitor.type,
                                site: site.identifier
                            });
                            throw new Error("Failed to fetch monitor id after insert for site " + site.identifier);
                        }
                        monitor.id = String(row.id);
                        _e.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7:
                        _c = 0, _d = site.monitors;
                        _e.label = 8;
                    case 8:
                        if (!(_c < _d.length)) return [3 /*break*/, 11];
                        monitor = _d[_c];
                        return [4 /*yield*/, this.checkMonitor(site, String(monitor.id))];
                    case 9:
                        _e.sent();
                        _e.label = 10;
                    case 10:
                        _c++;
                        return [3 /*break*/, 8];
                    case 11:
                        logger.info("Site added successfully: " + site.identifier + " (" + (site.name || "unnamed") + ")");
                        return [2 /*return*/, site];
                }
            });
        });
    };
    UptimeMonitor.prototype.removeSite = function (identifier) {
        return __awaiter(this, void 0, Promise, function () {
            var removed, monitorRows, _i, _a, row;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        logger.info("Removing site: " + identifier);
                        removed = this.sites["delete"](identifier);
                        return [4 /*yield*/, this.db.all("SELECT id FROM monitors WHERE site_identifier = ?", [identifier])];
                    case 1:
                        monitorRows = _b.sent();
                        _i = 0, _a = monitorRows;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        row = _a[_i];
                        return [4 /*yield*/, this.db.run("DELETE FROM history WHERE monitor_id = ?", [row.id])];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: 
                    // Remove monitors for this site
                    return [4 /*yield*/, this.db.run("DELETE FROM monitors WHERE site_identifier = ?", [identifier])];
                    case 6:
                        // Remove monitors for this site
                        _b.sent();
                        // Remove the site row
                        return [4 /*yield*/, this.db.run("DELETE FROM sites WHERE identifier = ?", [identifier])];
                    case 7:
                        // Remove the site row
                        _b.sent();
                        if (removed) {
                            logger.info("Site removed successfully: " + identifier);
                        }
                        else {
                            logger.warn("Site not found for removal: " + identifier);
                        }
                        return [2 /*return*/, removed];
                }
            });
        });
    };
    UptimeMonitor.prototype.setHistoryLimit = function (limit) {
        return __awaiter(this, void 0, void 0, function () {
            var monitorRows, _i, _a, row;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (limit <= 0) {
                            this.historyLimit = 0;
                        }
                        else {
                            this.historyLimit = Math.max(10, limit);
                        }
                        // Save to settings table
                        return [4 /*yield*/, this.db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('historyLimit', ?)", [
                                this.historyLimit.toString(),
                            ])];
                    case 1:
                        // Save to settings table
                        _b.sent();
                        if (!(this.historyLimit > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.db.all("SELECT id FROM monitors")];
                    case 2:
                        monitorRows = _b.sent();
                        _i = 0, _a = monitorRows;
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        row = _a[_i];
                        return [4 /*yield*/, this.db.run("DELETE FROM history WHERE monitor_id = ? AND id NOT IN (\n                        SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT ?\n                    )", [row.id, row.id, this.historyLimit])];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    UptimeMonitor.prototype.getHistoryLimit = function () {
        return this.historyLimit;
    };
    UptimeMonitor.prototype.startMonitoring = function () {
        if (this.isMonitoring) {
            logger.debug("Monitoring already running");
            return;
        }
        logger.info("Starting monitoring with " + this.sites.size + " sites (per-site intervals)");
        this.isMonitoring = true;
        // Start interval for each site
        for (var _i = 0, _a = this.sites.values(); _i < _a.length; _i++) {
            var site = _a[_i];
            this.startMonitoringForSite(site.identifier);
        }
    };
    UptimeMonitor.prototype.stopMonitoring = function () {
        for (var _i = 0, _a = this.siteIntervals.values(); _i < _a.length; _i++) {
            var interval = _a[_i];
            clearInterval(interval);
        }
        this.siteIntervals.clear();
        this.isMonitoring = false;
        logger.info("Stopped all site monitoring intervals");
    };
    UptimeMonitor.prototype.startMonitoringForSite = function (identifier, monitorId) {
        var _this = this;
        var site = this.sites.get(identifier);
        if (site) {
            if (monitorId) {
                // Per-monitor-id: start interval for only this monitor
                var intervalKey = identifier + "|" + monitorId;
                if (this.siteIntervals.has(intervalKey)) {
                    clearInterval(this.siteIntervals.get(intervalKey));
                }
                var monitor = site.monitors.find(function (m) { return String(m.id) === String(monitorId); });
                if (!monitor)
                    return false;
                // Use monitor-specific checkInterval, fallback to default
                var monitorInterval = monitor.checkInterval || 60000;
                var interval = setInterval(function () {
                    _this.checkMonitor(site, monitorId);
                }, monitorInterval);
                this.siteIntervals.set(intervalKey, interval);
                // Set monitoring=true for this monitor and persist
                monitor.monitoring = true;
                this.saveSitesWithRetry();
                // Emit status-update for this monitorId
                var statusUpdate = {
                    previousStatus: undefined,
                    site: __assign(__assign({}, site), { monitors: site.monitors.map(function (m) { return (__assign({}, m)); }) })
                };
                this.emit("status-update", statusUpdate);
                return true;
            }
            // If no monitorId is provided, start all monitors for this site
            for (var _i = 0, _a = site.monitors; _i < _a.length; _i++) {
                var monitor = _a[_i];
                this.startMonitoringForSite(identifier, String(monitor.id));
            }
            return true;
        }
        return false;
    };
    UptimeMonitor.prototype.stopMonitoringForSite = function (identifier, monitorId) {
        var site = this.sites.get(identifier);
        if (site) {
            if (monitorId) {
                // Per-monitor-id: stop interval for only this monitor
                var intervalKey = identifier + "|" + monitorId;
                if (this.siteIntervals.has(intervalKey)) {
                    clearInterval(this.siteIntervals.get(intervalKey));
                    this.siteIntervals["delete"](intervalKey);
                }
                // Set monitoring=false for this monitor and persist
                var monitor = site.monitors.find(function (m) { return String(m.id) === String(monitorId); });
                if (monitor) {
                    monitor.monitoring = false;
                    this.saveSitesWithRetry();
                }
                // Emit status-update for this monitorId
                var statusUpdate = {
                    previousStatus: undefined,
                    site: __assign(__assign({}, site), { monitors: site.monitors.map(function (m) { return (__assign({}, m)); }) })
                };
                this.emit("status-update", statusUpdate);
                return true;
            }
            // If no monitorId is provided, stop all monitors for this site
            for (var _i = 0, _a = site.monitors; _i < _a.length; _i++) {
                var monitor = _a[_i];
                this.stopMonitoringForSite(identifier, String(monitor.id));
            }
            return true;
        }
        return false;
    };
    UptimeMonitor.prototype.checkMonitor = function (site, monitorId) {
        return __awaiter(this, void 0, void 0, function () {
            var monitor, startTime, newStatus, responseTime, details, response, available, err_1, previousStatus, now, historyEntry, err_2, excess, excessIds, statusUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        monitor = site.monitors.find(function (m) { return String(m.id) === String(monitorId); });
                        if (!monitor) {
                            logger.error("[checkMonitor] Monitor not found for id: " + monitorId + " on site: " + site.identifier);
                            return [2 /*return*/];
                        }
                        // Ensure monitor.id is present and valid before proceeding
                        if (!monitor.id) {
                            logger.error("[checkMonitor] Monitor missing id for " + site.identifier + ", skipping history insert.");
                            return [2 /*return*/];
                        }
                        logger.info("[checkMonitor] Checking monitor: site=" + site.identifier + ", id=" + monitor.id);
                        startTime = Date.now();
                        newStatus = "down";
                        responseTime = 0;
                        details = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!(monitor.type === "http")) return [3 /*break*/, 3];
                        if (!monitor.url)
                            throw new Error("HTTP monitor missing URL");
                        return [4 /*yield*/, axios_1["default"].get(monitor.url, {
                                timeout: DEFAULT_REQUEST_TIMEOUT,
                                validateStatus: function (status) { return status < 500; }
                            })];
                    case 2:
                        response = _a.sent();
                        responseTime = Date.now() - startTime;
                        newStatus = "up";
                        details = response.status ? String(response.status) : null;
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(monitor.type === "port")) return [3 /*break*/, 5];
                        if (!monitor.host || !monitor.port)
                            throw new Error("Port monitor missing host or port");
                        return [4 /*yield*/, is_port_reachable_1["default"](monitor.port, { host: monitor.host })];
                    case 4:
                        available = _a.sent();
                        responseTime = Date.now() - startTime;
                        newStatus = available ? "up" : "down";
                        details = monitor.port ? String(monitor.port) : null;
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        err_1 = _a.sent();
                        responseTime = Date.now() - startTime;
                        newStatus = "down";
                        logger.error("[checkMonitor] Error during check: site=" + site.identifier + ", id=" + monitor.id, err_1);
                        return [3 /*break*/, 7];
                    case 7:
                        previousStatus = monitor.status;
                        now = new Date();
                        // Update monitor
                        monitor.status = newStatus;
                        monitor.responseTime = responseTime;
                        monitor.lastChecked = now;
                        historyEntry = {
                            responseTime: responseTime,
                            status: newStatus,
                            timestamp: now.getTime()
                        };
                        // Use only the details variable above, do not redeclare
                        if (monitor.type === "http") {
                            // Try to get HTTP status code from last axios response if possible
                            // (axios throws on non-2xx, but we only care about code)
                            // For now, store '200' if up, '0' if down
                            details = newStatus === "up" ? "200" : "0";
                        }
                        else if (monitor.type === "port") {
                            details = monitor.port !== undefined ? String(monitor.port) : null;
                        }
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.db.run("INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)", [monitor.id, historyEntry.timestamp, historyEntry.status, historyEntry.responseTime, details])];
                    case 9:
                        _a.sent();
                        logger.info("[checkMonitor] Inserted history row: monitor_id=" + monitor.id + ", status=" + historyEntry.status + ", responseTime=" + historyEntry.responseTime + ", timestamp=" + historyEntry.timestamp + ", details=" + details);
                        return [3 /*break*/, 11];
                    case 10:
                        err_2 = _a.sent();
                        logger.error("[checkMonitor] Failed to insert history row: monitor_id=" + monitor.id, err_2);
                        return [3 /*break*/, 11];
                    case 11:
                        if (!(this.historyLimit > 0)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.db.all("SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?", [monitor.id, this.historyLimit])];
                    case 12:
                        excess = (_a.sent());
                        excessIds = excess.map(function (row) { return row.id; });
                        if (!(excessIds.length > 0)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.db.run("DELETE FROM history WHERE id IN (" + excessIds.join(",") + ")")];
                    case 13:
                        _a.sent();
                        _a.label = 14;
                    case 14: return [4 /*yield*/, this.saveSitesWithRetry()];
                    case 15:
                        _a.sent();
                        statusUpdate = {
                            previousStatus: previousStatus,
                            site: __assign(__assign({}, site), { monitors: site.monitors.map(function (m) { return (__assign({}, m)); }) })
                        };
                        this.emit("status-update", statusUpdate);
                        if (previousStatus === "up" && newStatus === "down") {
                            this.emit("site-monitor-down", { monitor: monitor, monitorId: monitorId, site: site });
                        }
                        else if (previousStatus === "down" && newStatus === "up") {
                            this.emit("site-monitor-up", { monitor: monitor, monitorId: monitorId, site: site });
                        }
                        return [2 /*return*/, statusUpdate];
                }
            });
        });
    };
    UptimeMonitor.prototype.checkSiteManually = function (identifier, monitorId) {
        if (monitorId === void 0) { monitorId = "http"; }
        return __awaiter(this, void 0, Promise, function () {
            var site, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        site = this.sites.get(identifier);
                        if (!site) {
                            throw new Error("Site with identifier " + identifier + " not found");
                        }
                        return [4 /*yield*/, this.checkMonitor(site, monitorId)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result || null];
                }
            });
        });
    };
    UptimeMonitor.prototype.updateSite = function (identifier, updates) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var site, updatedSite, dbMonitors, toDelete, _i, toDelete_2, del, _b, _c, monitor, numericId, row, _loop_2, this_2, _d, _e, updatedMonitor;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        site = this.sites.get(identifier);
                        if (!site) {
                            throw new Error("Site not found: " + identifier);
                        }
                        updatedSite = __assign(__assign(__assign({}, site), updates), { monitors: updates.monitors || site.monitors });
                        this.sites.set(identifier, updatedSite);
                        // Persist to DB
                        return [4 /*yield*/, this.db.run("INSERT OR REPLACE INTO sites (identifier, name) VALUES (?, ?)", [
                                updatedSite.identifier,
                                (_a = updatedSite.name) !== null && _a !== void 0 ? _a : null,
                            ])];
                    case 1:
                        // Persist to DB
                        _f.sent();
                        if (!updates.monitors) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.db.all("SELECT id FROM monitors WHERE site_identifier = ?", [
                                identifier,
                            ])];
                    case 2:
                        dbMonitors = (_f.sent());
                        toDelete = dbMonitors.filter(function (dbm) { return !updates.monitors.some(function (m) { return String(m.id) === String(dbm.id); }); });
                        _i = 0, toDelete_2 = toDelete;
                        _f.label = 3;
                    case 3:
                        if (!(_i < toDelete_2.length)) return [3 /*break*/, 7];
                        del = toDelete_2[_i];
                        return [4 /*yield*/, this.db.run("DELETE FROM history WHERE monitor_id = ?", [del.id])];
                    case 4:
                        _f.sent();
                        return [4 /*yield*/, this.db.run("DELETE FROM monitors WHERE id = ?", [del.id])];
                    case 5:
                        _f.sent();
                        _f.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7:
                        _b = 0, _c = updates.monitors;
                        _f.label = 8;
                    case 8:
                        if (!(_b < _c.length)) return [3 /*break*/, 14];
                        monitor = _c[_b];
                        numericId = monitor.id && !isNaN(Number(monitor.id)) ? Number(monitor.id) : undefined;
                        if (!numericId) return [3 /*break*/, 10];
                        // Update existing monitor
                        return [4 /*yield*/, this.db.run("UPDATE monitors SET type = ?, url = ?, host = ?, port = ?, checkInterval = ?, monitoring = ?, status = ?, responseTime = ?, lastChecked = ? WHERE id = ?", [
                                monitor.type,
                                monitor.url ? String(monitor.url) : null,
                                monitor.host ? String(monitor.host) : null,
                                monitor.port !== undefined && monitor.port !== null ? Number(monitor.port) : null,
                                monitor.checkInterval !== undefined && monitor.checkInterval !== null
                                    ? Number(monitor.checkInterval)
                                    : null,
                                monitor.monitoring ? 1 : 0,
                                monitor.status,
                                monitor.responseTime !== undefined && monitor.responseTime !== null
                                    ? Number(monitor.responseTime)
                                    : null,
                                monitor.lastChecked
                                    ? monitor.lastChecked instanceof Date
                                        ? monitor.lastChecked.toISOString()
                                        : monitor.lastChecked
                                    : null,
                                numericId,
                            ])];
                    case 9:
                        // Update existing monitor
                        _f.sent();
                        return [3 /*break*/, 13];
                    case 10: 
                    // Insert new monitor
                    return [4 /*yield*/, this.db.run("INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, monitoring, status, responseTime, lastChecked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                            identifier,
                            monitor.type,
                            monitor.url ? String(monitor.url) : null,
                            monitor.host ? String(monitor.host) : null,
                            monitor.port !== undefined && monitor.port !== null ? Number(monitor.port) : null,
                            monitor.checkInterval !== undefined && monitor.checkInterval !== null
                                ? Number(monitor.checkInterval)
                                : null,
                            monitor.monitoring ? 1 : 0,
                            monitor.status,
                            monitor.responseTime !== undefined && monitor.responseTime !== null
                                ? Number(monitor.responseTime)
                                : null,
                            monitor.lastChecked
                                ? monitor.lastChecked instanceof Date
                                    ? monitor.lastChecked.toISOString()
                                    : monitor.lastChecked
                                : null,
                        ])];
                    case 11:
                        // Insert new monitor
                        _f.sent();
                        return [4 /*yield*/, this.db.get("SELECT id FROM monitors WHERE site_identifier = ? ORDER BY id DESC LIMIT 1", [identifier])];
                    case 12:
                        row = _f.sent();
                        if (row && typeof row.id === "number") {
                            monitor.id = String(row.id);
                        }
                        _f.label = 13;
                    case 13:
                        _b++;
                        return [3 /*break*/, 8];
                    case 14:
                        // If monitors were updated, check for interval changes and restart timers as needed
                        if (updates.monitors) {
                            _loop_2 = function (updatedMonitor) {
                                var prevMonitor = site.monitors.find(function (m) { return String(m.id) === String(updatedMonitor.id); });
                                if (!prevMonitor)
                                    return "continue";
                                // If checkInterval changed, restart timer for this monitor
                                if (typeof updatedMonitor.checkInterval === "number" &&
                                    updatedMonitor.checkInterval !== prevMonitor.checkInterval) {
                                    this_2.stopMonitoringForSite(identifier, String(updatedMonitor.id));
                                    this_2.startMonitoringForSite(identifier, String(updatedMonitor.id));
                                }
                            };
                            this_2 = this;
                            for (_d = 0, _e = updates.monitors; _d < _e.length; _d++) {
                                updatedMonitor = _e[_d];
                                _loop_2(updatedMonitor);
                            }
                        }
                        return [2 /*return*/, updatedSite];
                }
            });
        });
    };
    // Export/Import functionality
    UptimeMonitor.prototype.exportData = function () {
        return __awaiter(this, void 0, Promise, function () {
            var sites, settings, exportObj, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.db.all("SELECT * FROM sites")];
                    case 1:
                        sites = _a.sent();
                        return [4 /*yield*/, this.db.all("SELECT * FROM settings")];
                    case 2:
                        settings = _a.sent();
                        exportObj = {
                            settings: settings.reduce(function (acc, row) {
                                if (typeof row.key === "string") {
                                    acc[row.key] = String(row.value);
                                }
                                return acc;
                            }, {}),
                            sites: sites.map(function (row) { return ({
                                identifier: row.identifier ? String(row.identifier) : "",
                                monitors: row.monitors_json ? JSON.parse(row.monitors_json) : [],
                                name: row.name ? String(row.name) : undefined
                            }); })
                        };
                        return [2 /*return*/, JSON.stringify(exportObj, null, 2)];
                    case 3:
                        error_6 = _a.sent();
                        logger.error("Failed to export data", error_6);
                        this.emit("db-error", { error: error_6, operation: "exportData" });
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UptimeMonitor.prototype.importData = function (data) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, Promise, function () {
            var parsedData, _i, _g, site, _h, _j, _k, key, value, _l, _m, site, _o, _p, monitor, monitorRow, monitorId, _q, _r, h, error_7;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        logger.info("Importing data");
                        _s.label = 1;
                    case 1:
                        _s.trys.push([1, 25, , 26]);
                        parsedData = JSON.parse(data);
                        // Clear existing tables
                        return [4 /*yield*/, this.db.run("DELETE FROM sites")];
                    case 2:
                        // Clear existing tables
                        _s.sent();
                        return [4 /*yield*/, this.db.run("DELETE FROM settings")];
                    case 3:
                        _s.sent();
                        return [4 /*yield*/, this.db.run("DELETE FROM monitors")];
                    case 4:
                        _s.sent();
                        return [4 /*yield*/, this.db.run("DELETE FROM history")];
                    case 5:
                        _s.sent();
                        if (!Array.isArray(parsedData.sites)) return [3 /*break*/, 9];
                        _i = 0, _g = parsedData.sites;
                        _s.label = 6;
                    case 6:
                        if (!(_i < _g.length)) return [3 /*break*/, 9];
                        site = _g[_i];
                        return [4 /*yield*/, this.db.run("INSERT INTO sites (identifier, name) VALUES (?, ?)", [
                                site.identifier,
                                (_a = site.name) !== null && _a !== void 0 ? _a : null,
                            ])];
                    case 7:
                        _s.sent();
                        _s.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 6];
                    case 9:
                        if (!(parsedData.settings && typeof parsedData.settings === "object")) return [3 /*break*/, 13];
                        _h = 0, _j = Object.entries(parsedData.settings);
                        _s.label = 10;
                    case 10:
                        if (!(_h < _j.length)) return [3 /*break*/, 13];
                        _k = _j[_h], key = _k[0], value = _k[1];
                        return [4 /*yield*/, this.db.run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, String(value)])];
                    case 11:
                        _s.sent();
                        _s.label = 12;
                    case 12:
                        _h++;
                        return [3 /*break*/, 10];
                    case 13:
                        _l = 0, _m = parsedData.sites;
                        _s.label = 14;
                    case 14:
                        if (!(_l < _m.length)) return [3 /*break*/, 23];
                        site = _m[_l];
                        if (!Array.isArray(site.monitors)) return [3 /*break*/, 22];
                        _o = 0, _p = site.monitors;
                        _s.label = 15;
                    case 15:
                        if (!(_o < _p.length)) return [3 /*break*/, 22];
                        monitor = _p[_o];
                        // Insert monitor, get id
                        return [4 /*yield*/, this.db.run("INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, monitoring, status, responseTime, lastChecked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                site.identifier,
                                monitor.type,
                                (_b = monitor.url) !== null && _b !== void 0 ? _b : null,
                                (_c = monitor.host) !== null && _c !== void 0 ? _c : null,
                                (_d = monitor.port) !== null && _d !== void 0 ? _d : null,
                                (_e = monitor.checkInterval) !== null && _e !== void 0 ? _e : null,
                                monitor.monitoring ? 1 : 0,
                                monitor.status,
                                monitor.responseTime,
                                monitor.lastChecked
                                    ? typeof monitor.lastChecked === "string"
                                        ? monitor.lastChecked
                                        : monitor.lastChecked.toISOString()
                                    : null,
                            ])];
                    case 16:
                        // Insert monitor, get id
                        _s.sent();
                        return [4 /*yield*/, this.db.get("SELECT id FROM monitors WHERE site_identifier = ? ORDER BY id DESC LIMIT 1", [site.identifier])];
                    case 17:
                        monitorRow = _s.sent();
                        monitorId = (monitorRow === null || monitorRow === void 0 ? void 0 : monitorRow.id) ? String(monitorRow.id) : undefined;
                        monitor.id = monitorId;
                        if (!(Array.isArray(monitor.history) && monitorId)) return [3 /*break*/, 21];
                        _q = 0, _r = monitor.history;
                        _s.label = 18;
                    case 18:
                        if (!(_q < _r.length)) return [3 /*break*/, 21];
                        h = _r[_q];
                        return [4 /*yield*/, this.db.run("INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)", [
                                monitorId,
                                h.timestamp,
                                h.status === "up" || h.status === "down" ? h.status : "down",
                                h.responseTime,
                                (_f = h.details) !== null && _f !== void 0 ? _f : null,
                            ])];
                    case 19:
                        _s.sent();
                        _s.label = 20;
                    case 20:
                        _q++;
                        return [3 /*break*/, 18];
                    case 21:
                        _o++;
                        return [3 /*break*/, 15];
                    case 22:
                        _l++;
                        return [3 /*break*/, 14];
                    case 23: return [4 /*yield*/, this.loadSites()];
                    case 24:
                        _s.sent();
                        logger.info("Data imported successfully");
                        return [2 /*return*/, true];
                    case 25:
                        error_7 = _s.sent();
                        logger.error("Failed to import data", error_7);
                        this.emit("db-error", { error: error_7, operation: "importData" });
                        return [2 /*return*/, false];
                    case 26: return [2 /*return*/];
                }
            });
        });
    };
    return UptimeMonitor;
}(events_1.EventEmitter));
exports.UptimeMonitor = UptimeMonitor;
