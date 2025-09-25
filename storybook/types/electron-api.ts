/**
 * Type alias that mirrors the Electron API exposed via the preload script.
 *
 * @remarks
 * The application declares the `electronAPI` surface in `src/types.ts` through
 * a global augmentation. Storybook consumes the same type to keep mocks and
 * stories aligned with the production bridge contract without duplicating
 * domain definitions.
 */
export type ElectronAPI = Window["electronAPI"];
