/**
 * Shared base class for monitor service adapters.
 *
 * @remarks
 * Several monitor core factories (HTTP-derived and remote JSON-derived) produce
 * class-based adapters that share the same boilerplate:
 *
 * - Store an Axios instance
 * - Store the resolved monitor service config
 * - Expose {@link IMonitorService.getType}
 *
 * Centralizing these pieces reduces duplication without changing behavior.
 */

import type { Site } from "@shared/types";
import type { AxiosInstance } from "axios";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorServiceConfig,
} from "../types";

/**
 * Base class implementing the shared, non-behavioral parts of
 * {@link IMonitorService} adapters.
 */
export abstract class MonitorServiceAdapterBase<
    TType extends Site["monitors"][number]["type"],
> implements IMonitorService {
    protected axiosInstance: AxiosInstance;

    protected config: MonitorServiceConfig;

    private readonly type: TType;

    protected constructor(args: {
        readonly axiosInstance: AxiosInstance;
        readonly config: MonitorServiceConfig;
        readonly type: TType;
    }) {
        this.axiosInstance = args.axiosInstance;
        this.config = args.config;
        this.type = args.type;
    }

    public abstract check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult>;

    public getType(): Site["monitors"][0]["type"] {
        return this.type;
    }

    public abstract updateConfig(config: Partial<MonitorServiceConfig>): void;
}
