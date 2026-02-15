/**
 * IPC handler execution wrapper.
 */

import type { CorrelationId } from "@shared/types/events";
import type { Promisable, UnknownRecord } from "type-fest";

import { generateCorrelationId } from "@shared/utils/correlation";
import { withLogContext } from "@shared/utils/loggingContext";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";

import { logger } from "../../../utils/logger";
import { normalizeIpcErrorMessage } from "./ipcErrorUtils";
import { shouldLogHandler } from "./ipcLogging";

/** Options that influence IPC handler execution. */
export interface IpcHandlerExecutionOptions {
    readonly correlationId?: CorrelationId;
    readonly metadata?: UnknownRecord;
}

/** Failure result from executing an IPC handler. */
export interface HandlerExecutionFailure {
    readonly duration: number;
    readonly errorMessage: string;
    readonly outcome: "error";
}

/** Success result from executing an IPC handler. */
export interface HandlerExecutionSuccess<T> {
    readonly duration: number;
    readonly outcome: "success";
    readonly value: T;
}

/** Execution result union for IPC handlers. */
export type HandlerExecutionResult<T> =
    | HandlerExecutionFailure
    | HandlerExecutionSuccess<T>;

/**
 * Executes an IPC handler and captures timing + error metadata.
 */
export async function executeIpcHandler<T>(
    channelName: string,
    handler: () => Promisable<T>,
    options?: IpcHandlerExecutionOptions
): Promise<HandlerExecutionResult<T>> {
    const startTime = Date.now();
    const logStart = shouldLogHandler(channelName);
    const correlationId = options?.correlationId ?? generateCorrelationId();
    const startMetadata = options?.metadata;

    if (logStart) {
        const metadata =
            startMetadata && Object.keys(startMetadata).length > 0
                ? { handler: channelName, ...startMetadata }
                : { handler: channelName };

        logger.debug(
            `[IpcHandler] Starting ${channelName}`,
            withLogContext({
                channel: channelName,
                correlationId,
                event: "ipc:handler:start",
                severity: "debug",
            }),
            metadata
        );
    }

    try {
        const value = await handler();
        const duration = Date.now() - startTime;

        if (logStart) {
            logger.debug(
                `[IpcHandler] Completed ${channelName}`,
                withLogContext({
                    channel: channelName,
                    correlationId,
                    event: "ipc:handler:completed",
                    severity: "debug",
                }),
                {
                    duration,
                    handler: channelName,
                }
            );
        }

        return {
            duration,
            outcome: "success",
            value,
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        const rawErrorMessage = getUserFacingErrorDetail(error);
        const errorMessage = normalizeIpcErrorMessage(rawErrorMessage);

        logger.error(
            `[IpcHandler] Failed ${channelName}`,
            withLogContext({
                channel: channelName,
                correlationId,
                event: "ipc:handler:failed",
                severity: "error",
            }),
            {
                duration,
                error: errorMessage,
            }
        );

        return {
            duration,
            errorMessage,
            outcome: "error",
        };
    }
}
