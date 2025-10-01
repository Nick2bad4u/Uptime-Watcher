/**
 * Type alias that mirrors the Electron API exposed via the preload script.
 *
 * @remarks
 * Storybook consumes the shared preload bridge contracts directly to ensure
 * mocks and stories stay aligned with the production surface without relying on
 * global augmentations.
 */
import type { EventsDomainBridge } from "@shared/types/eventsBridge";
import type {
    ElectronBridgeApi,
    StateSyncApiSurface,
    SystemDomainBridge,
} from "@shared/types/preload";

type StorybookSystemApi = SystemDomainBridge & {
    readonly quitAndInstall: () => void;
};

export type ElectronAPI = ElectronBridgeApi<
    EventsDomainBridge,
    StorybookSystemApi
> & {
    readonly stateSync: StateSyncApiSurface;
};
