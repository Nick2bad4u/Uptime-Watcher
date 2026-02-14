interface IpcContractMap {
    "site:load": {
        request: { readonly siteId: string };
        response: { readonly ok: true };
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
    // @ts-expect-error -- intentional contract mismatch for typed lint rule coverage
    (params: { readonly siteId: number }) =>
        Promise.resolve({
            ok: params.siteId > 0,
        }),
    () => ({ siteId: "site-1" })
);

export const __typedFixtureModule = "typed-fixture-module";
