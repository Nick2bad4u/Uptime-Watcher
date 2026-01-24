/**
 * Parameter validators for site management IPC handlers.
 */

import type { IpcParameterValidator } from "../types";

import {
    createSiteIdentifierAndMonitorIdValidator,
    createSiteIdentifierValidator,
    validateSitePayload,
    validateSiteUpdatePayload,
} from "./shared";
import { createNoParamsValidator } from "./utils/commonValidators";

/**
 * Interface for site handler validators.
 */
interface SiteHandlerValidatorsInterface {
    addSite: IpcParameterValidator;
    deleteAllSites: IpcParameterValidator;
    getSites: IpcParameterValidator;
    removeMonitor: IpcParameterValidator;
    removeSite: IpcParameterValidator;
    updateSite: IpcParameterValidator;
}

/**
 * Parameter validators for site management IPC handlers.
 *
 * @remarks
 * Each property is a validator for a specific site-related IPC channel.
 */
export const SiteHandlerValidators: SiteHandlerValidatorsInterface = {
    addSite: validateSitePayload,
    deleteAllSites: createNoParamsValidator(),
    getSites: createNoParamsValidator(),
    removeMonitor: createSiteIdentifierAndMonitorIdValidator(
        "siteIdentifier",
        "monitorId"
    ),
    removeSite: createSiteIdentifierValidator("identifier"),
    updateSite: validateSiteUpdatePayload,
} as const;
