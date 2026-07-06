import type { Site } from "@shared/types";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorServiceConfig,
} from "../types";

import {
    copyMonitorServiceConfig,
    createDefaultMonitorServiceConfig,
    mergeMonitorServiceConfig,
} from "./monitorServiceConfigMerging";

/**
 * Shared base for monitor services that only need normalized config storage.
 */
export abstract class ConfigurableMonitorServiceBase<
    TType extends Site["monitors"][number]["type"],
> implements IMonitorService {
    protected config: MonitorServiceConfig;

    private readonly type: TType;

    protected constructor(args: {
        readonly config?: Partial<MonitorServiceConfig>;
        readonly defaultTimeoutMs: number;
        readonly type: TType;
    }) {
        this.config = createDefaultMonitorServiceConfig({
            defaultTimeoutMs: args.defaultTimeoutMs,
            ...(args.config && { config: args.config }),
        });
        this.type = args.type;
    }

    public abstract check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult>;

    public getConfig(): MonitorServiceConfig {
        return copyMonitorServiceConfig(this.config);
    }

    public getType(): TType {
        return this.type;
    }

    public updateConfig(config: Partial<MonitorServiceConfig>): void {
        this.validateConfigUpdate(config);
        this.config = mergeMonitorServiceConfig({
            currentConfig: this.config,
            update: config,
        });
    }

    protected validateConfigUpdate(
        config: Partial<MonitorServiceConfig>
    ): void {
        void config;
        // Default: no additional validation beyond accessor-safe config merge.
    }
}
