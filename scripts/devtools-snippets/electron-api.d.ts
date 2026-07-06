export {};

declare global {
    interface DevtoolsSnippetMonitor {
        readonly host?: string;
        readonly port?: number;
        readonly status?: string;
        readonly type: string;
        readonly url?: string;
    }

    interface DevtoolsSnippetSite {
        readonly identifier: string;
        readonly monitors: readonly DevtoolsSnippetMonitor[];
        readonly monitoring: boolean;
        readonly name: string;
    }

    interface Window {
        readonly electronAPI?: {
            readonly sites?: {
                readonly addSite?: (site: unknown) => Promise<unknown>;
                readonly deleteAllSites?: () => Promise<number>;
                readonly getSites?: () => Promise<DevtoolsSnippetSite[]>;
            };
        };
    }
}
