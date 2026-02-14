interface IpcContractMap {
    "site:load": {
        request: { readonly siteId: string };
        response: { readonly ok: boolean };
    };
}

type ParameterValidator<Params> = (input: unknown) => Params;
type StandardizedIpcHandler<Params, Response> = (
    params: Params
) => Promise<Response>;

declare function registerStandardizedIpcHandler<
    Channel extends keyof IpcContractMap,
>(
    channel: Channel,
    handler: StandardizedIpcHandler<
        IpcContractMap[Channel]["request"],
        IpcContractMap[Channel]["response"]
    >,
    validator: ParameterValidator<IpcContractMap[Channel]["request"]>
): void;

registerStandardizedIpcHandler(
    "site:load",
    (params) => Promise.resolve({ ok: params.siteId.length > 0 }),
    (input) => ({ siteId: String(input) })
);

export const __typedFixtureModule = "typed-fixture-module";
