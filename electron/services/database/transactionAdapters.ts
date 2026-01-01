import type { Database } from "node-sqlite3-wasm";

import type {
    HistoryRepository,
    HistoryRepositoryTransactionAdapter,
} from "./HistoryRepository";
import type {
    MonitorRepository,
    MonitorRepositoryTransactionAdapter,
} from "./MonitorRepository";
import type {
    SettingsRepository,
    SettingsRepositoryTransactionAdapter,
} from "./SettingsRepository";
import type {
    SiteRepository,
    SiteRepositoryTransactionAdapter,
} from "./SiteRepository";

/**
 * Creates transaction-scoped site + monitor repository adapters.
 */
export function createSiteMonitorTransactionAdapters(
    db: Database,
    repositories: {
        monitor: MonitorRepository;
        site: SiteRepository;
    }
): {
    monitorTx: MonitorRepositoryTransactionAdapter;
    siteTx: SiteRepositoryTransactionAdapter;
} {
    return {
        monitorTx: repositories.monitor.createTransactionAdapter(db),
        siteTx: repositories.site.createTransactionAdapter(db),
    };
}

/**
 * Creates transaction-scoped history + settings repository adapters.
 */
export function createHistorySettingsTransactionAdapters(
    db: Database,
    repositories: {
        history: HistoryRepository;
        settings: SettingsRepository;
    }
): {
    historyTx: HistoryRepositoryTransactionAdapter;
    settingsTx: SettingsRepositoryTransactionAdapter;
} {
    return {
        historyTx: repositories.history.createTransactionAdapter(db),
        settingsTx: repositories.settings.createTransactionAdapter(db),
    };
}

/**
 * Creates transaction-scoped adapters used by import/export flows.
 */
export function createImportTransactionAdapters(
    db: Database,
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    }
): {
    historyTx: HistoryRepositoryTransactionAdapter;
    monitorTx: MonitorRepositoryTransactionAdapter;
    settingsTx: SettingsRepositoryTransactionAdapter;
    siteTx: SiteRepositoryTransactionAdapter;
} {
    return {
        historyTx: repositories.history.createTransactionAdapter(db),
        monitorTx: repositories.monitor.createTransactionAdapter(db),
        settingsTx: repositories.settings.createTransactionAdapter(db),
        siteTx: repositories.site.createTransactionAdapter(db),
    };
}
