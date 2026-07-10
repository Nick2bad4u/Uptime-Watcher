import type { Session } from "electron";

import type { Logger } from "@shared/utils/logger/interfaces";

import { ensureError } from "@shared/utils/errorHandling";
import { setHas } from "ts-extras";

import {
    applyProductionDocumentSecurityHeaders,
    getProductionCspHeaderValue,
} from "./utils/productionSecurityHeaders";

type WindowSecurityLogger = Pick<Logger, "debug" | "warn">;

/**
 * Installs fail-closed permission and response-header policies for window
 * sessions.
 *
 * @internal
 */
export class WindowSessionSecurity {
    private readonly attachedProductionHeaderSessions = new WeakSet<Session>();

    private hasLoggedDisplayMediaDenial = false;

    private readonly logger: WindowSecurityLogger;

    private readonly loggedDeniedPermissions = new Set<string>();

    public constructor(logger: WindowSecurityLogger) {
        this.logger = logger;
    }

    /** Configures permission guards and environment-specific headers. */
    public configure(session: Session, isProduction: boolean): void {
        this.attachPermissionGuards(session);
        this.attachProductionHeaders(session, isProduction);
    }

    private attachPermissionGuards(session: Session): void {
        try {
            type PermissionRequestHandler = NonNullable<
                Parameters<typeof session.setPermissionRequestHandler>[0]
            >;

            session.setPermissionCheckHandler(() => false);
            const handlePermissionRequest: PermissionRequestHandler = (
                _webContents,
                permission,
                grantPermission
            ) => {
                if (
                    !setHas<string, string>(
                        this.loggedDeniedPermissions,
                        permission
                    )
                ) {
                    this.loggedDeniedPermissions.add(permission);
                    this.logger.warn(
                        "[WindowService] Denied permission request",
                        { permission }
                    );
                }

                grantPermission(false);
            };
            session.setPermissionRequestHandler(handlePermissionRequest);

            if (typeof session.setDevicePermissionHandler === "function") {
                session.setDevicePermissionHandler(() => false);
            }

            if (typeof session.setDisplayMediaRequestHandler === "function") {
                type DisplayMediaRequestHandler = NonNullable<
                    Parameters<typeof session.setDisplayMediaRequestHandler>[0]
                >;
                const handleDisplayMediaRequest: DisplayMediaRequestHandler = (
                    _request,
                    callback
                ) => {
                    if (!this.hasLoggedDisplayMediaDenial) {
                        this.hasLoggedDisplayMediaDenial = true;
                        this.logger.warn(
                            "[WindowService] Denied display media (screen capture) request"
                        );
                    }

                    callback({});
                };
                session.setDisplayMediaRequestHandler(
                    handleDisplayMediaRequest
                );
            }
        } catch (error: unknown) {
            this.logger.warn(
                "[WindowService] Failed to attach permission handlers",
                ensureError(error)
            );
        }
    }

    private attachProductionHeaders(
        session: Session,
        isProduction: boolean
    ): void {
        if (!isProduction) {
            this.logger.debug(
                "[WindowService] Skipping security headers in development mode for DevTools compatibility"
            );
            return;
        }

        if (this.attachedProductionHeaderSessions.has(session)) {
            return;
        }

        const productionCsp = getProductionCspHeaderValue();

        try {
            type OnHeadersReceivedHandler = NonNullable<
                Parameters<typeof session.webRequest.onHeadersReceived>[0]
            >;
            const onHeadersReceived: OnHeadersReceivedHandler = (
                details,
                callback
            ) => {
                const { resourceType, responseHeaders } = details;
                if (
                    typeof resourceType === "string" &&
                    resourceType !== "mainFrame" &&
                    resourceType !== "subFrame"
                ) {
                    callback(
                        responseHeaders
                            ? { cancel: false, responseHeaders }
                            : { cancel: false }
                    );
                    return;
                }

                callback({
                    cancel: false,
                    responseHeaders: applyProductionDocumentSecurityHeaders({
                        productionCsp,
                        responseHeaders,
                    }),
                });
            };

            session.webRequest.onHeadersReceived(onHeadersReceived);
            this.attachedProductionHeaderSessions.add(session);
        } catch (error: unknown) {
            this.logger.warn(
                "[WindowService] Failed to attach security header middleware",
                ensureError(error)
            );
        }
    }
}
