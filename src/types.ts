/**
 * Renderer type declarations for the Electron preload bridge.
 *
 * @remarks
 * Uses shared preload bridge contracts to ensure the renderer surface stays in
 * sync with the Electron preload implementation.
 */

import type { EventsDomainBridge } from "@shared/types/eventsBridge";
import type {
    CloudDomainBridge,
    ElectronBridgeApi,
    SystemDomainBridge,
} from "@shared/types/preload";

type RendererSystemApi = SystemDomainBridge;

/**
 * Strongly typed renderer-side view of the Electron preload bridge API.
 */
export type ElectronAPI = ElectronBridgeApi<
    EventsDomainBridge,
    RendererSystemApi
> & {
    readonly cloud: CloudDomainBridge;
};

declare global {
    interface Window {
        /**
         * Secure Electron API exposed through the preload bridge.
         */
        electronAPI: ElectronAPI;
    }
}
