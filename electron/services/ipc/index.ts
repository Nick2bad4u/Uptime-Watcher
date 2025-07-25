/**
 * Standardized IPC handler utilities and types.
 * Provides consistent response formatting, error handling, and parameter validation
 * for all IPC communication between main and renderer processes.
 */

export type { IpcHandlerConfig, IpcParameterValidator, IpcResponse, IpcValidationResponse } from "./types";
export {
    createErrorResponse,
    createSuccessResponse,
    createValidationResponse,
    IpcValidators,
    registerStandardizedIpcHandler,
    withIpcHandler,
    withIpcHandlerValidation,
} from "./utils";
export {
    DataHandlerValidators,
    MonitoringHandlerValidators,
    MonitorTypeHandlerValidators,
    SiteHandlerValidators,
    StateSyncHandlerValidators,
} from "./validators";
