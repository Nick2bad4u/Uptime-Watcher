``` typescript
import type {LiteralUnion} from './literal-union.d.ts';
import type {JsonObject, JsonValue} from './json-value.d.ts';
```

A person who has been involved in creating or maintaining the package.

``` typescript
declare namespace PackageJson {
    export type Person =
        | string
        | {
            name: string;
            url?: string;
            email?: string;
        };
```

The URL to the package's issue tracker.

``` typescript
    export type BugsLocation =
        | string
        | {
            url?: string;
```

The email address to which issues should be reported.

``` typescript
            email?: string;
        };
```

``` typescript
    export type DirectoryLocations = {
        [directoryType: string]: JsonValue | undefined;
```

Location for executable scripts. Sugar to generate entries in the `bin` property by walking the folder.

``` typescript
        bin?: string;
```

Location for Markdown files.

``` typescript
        doc?: string;
```

Location for example scripts.

``` typescript
        example?: string;
```

Location for the bulk of the library.

``` typescript
        lib?: string;
```

Location for man pages. Sugar to generate a `man` array by walking the folder.

``` typescript
        man?: string;
```

Location for test files.

``` typescript
        test?: string;
    };
```

Run **before** the package is published (Also run on local `npm install` without any arguments).

``` typescript
    export type Scripts = {
        prepublish?: string;
```

Run both **before** the package is packed and published, and on local `npm install` without any arguments. This is run **after** `prepublish`, but **before** `prepublishOnly`.

``` typescript
        prepare?: string;
```

Run **before** the package is prepared and packed, **only** on `npm publish`.

``` typescript
        prepublishOnly?: string;
```

Run **before** a tarball is packed (on `npm pack`, `npm publish`, and when installing git dependencies).

``` typescript
        prepack?: string;
```

Run **after** the tarball has been generated and moved to its final destination.

``` typescript
        postpack?: string;
```

Run **after** the package is published.

``` typescript
        publish?: string;
```

Run **after** the package is published.

``` typescript
        postpublish?: string;
```

Run **before** the package is installed.

``` typescript
        preinstall?: string;
```

Run **after** the package is installed.

``` typescript
        install?: string;
```

Run **after** the package is installed and after `install`.

``` typescript
        postinstall?: string;
```

Run **before** the package is uninstalled and before `uninstall`.

``` typescript
        preuninstall?: string;
```

Run **before** the package is uninstalled.

``` typescript
        uninstall?: string;
```

Run **after** the package is uninstalled.

``` typescript
        postuninstall?: string;
```

Run **before** bump the package version and before `version`.

``` typescript
        preversion?: string;
```

Run **before** bump the package version.

``` typescript
        version?: string;
```

Run **after** bump the package version.

``` typescript
        postversion?: string;
```

Run with the `npm test` command, before `test`.

``` typescript
        pretest?: string;
```

Run with the `npm test` command.

``` typescript
        test?: string;
```

Run with the `npm test` command, after `test`.

``` typescript
        posttest?: string;
```

Run with the `npm stop` command, before `stop`.

``` typescript
        prestop?: string;
```

Run with the `npm stop` command.

``` typescript
        stop?: string;
```

Run with the `npm stop` command, after `stop`.

``` typescript
        poststop?: string;
```

Run with the `npm start` command, before `start`.

``` typescript
        prestart?: string;
```

Run with the `npm start` command.

``` typescript
        start?: string;
```

Run with the `npm start` command, after `start`.

``` typescript
        poststart?: string;
```

Run with the `npm restart` command, before `restart`. Note: `npm restart` will run the `stop` and `start` scripts if no `restart` script is provided.

``` typescript
        prerestart?: string;
```

Run with the `npm restart` command. Note: `npm restart` will run the `stop` and `start` scripts if no `restart` script is provided.

``` typescript
        restart?: string;
```

Run with the `npm restart` command, after `restart`. Note: `npm restart` will run the `stop` and `start` scripts if no `restart` script is provided.

``` typescript
        postrestart?: string;
    } & Partial<Record<string, string>>;
```

Dependencies of the package. The version range is a string which has one or more space-separated descriptors. Dependencies can also be identified with a tarball or Git URL.

``` typescript
    export type Dependency = Partial<Record<string, string>>;
```

A mapping of conditions and the paths to which they resolve.

``` typescript
    type ExportConditions = {
        [condition: string]: Exports;
    };
```

Entry points of a module, optionally with conditions and subpath exports.

``` typescript
    export type Exports =
        | null
        | string
        | Array<string | ExportConditions>
        | ExportConditions;
```

Import map entries of a module, optionally with conditions and subpath imports.

``` typescript
    export type Imports = {
        [key: `#${string}`]: Exports;
    };
```

An ECMAScript module ID that is the primary entry point to the program.

``` typescript
    export interface NonStandardEntryPoints {
        module?: string;
```

A module ID with untranspiled code that is the primary entry point to the program.

``` typescript
        esnext?:
            | string
            | {
                [moduleName: string]: string | undefined;
                main?: string;
                browser?: string;
            };
```

A hint to JavaScript bundlers or component tools when packaging modules for client side use.

``` typescript
        browser?:
            | string
            | Partial<Record<string, string | false>>;
```

Denote which files in your project are "pure" and therefore safe for Webpack to prune if unused.
[Read more.](https://webpack.js.org/guides/tree-shaking/)

``` typescript
        sideEffects?: boolean | string[];
    }
```

Location of the bundled TypeScript declaration file.

``` typescript
    export type TypeScriptConfiguration = {
        types?: string;
```

Version selection map of TypeScript.

``` typescript
        typesVersions?: Partial<Record<string, Partial<Record<string, string[]>>>>;
```

Location of the bundled TypeScript declaration file. Alias of `types`.

``` typescript
        typings?: string;
    };
```

An alternative configuration for workspaces.

An array of workspace pattern strings which contain the workspace packages.

``` typescript
    export type WorkspaceConfig = {
        packages?: WorkspacePattern[];
```

Designed to solve the problem of packages which break when their `node_modules` are moved to the root workspace directory - a process known as hoisting. For these packages, both within your workspace, and also some that have been installed via `node_modules`, it is important to have a mechanism for preventing the default Yarn workspace behavior. By adding workspace pattern strings here, Yarn will resume non-workspace behavior for any package which matches the defined patterns.
[Supported](https://classic.yarnpkg.com/blog/2018/02/15/nohoist/) by Yarn.
[Not supported](https://github.com/npm/rfcs/issues/287) by npm.

``` typescript
        nohoist?: WorkspacePattern[];
    };
```

A workspace pattern points to a directory or group of directories which contain packages that should be included in the workspace installation process.
The patterns are handled with [minimatch](https://github.com/isaacs/minimatch).
@example
`docs` → Include the docs directory and install its dependencies.
`packages/*` → Include all nested directories within the packages directory, like `packages/cli` and `packages/core`.

``` typescript
    type WorkspacePattern = string;
```

If your package only allows one version of a given dependency, and you’d like to enforce the same behavior as `yarn install --flat` on the command-line, set this to `true`.
Note that if your `package.json` contains `"flat": true` and other packages depend on yours (e.g. you are building a library rather than an app), those other packages will also need `"flat": true` in their `package.json` or be installed with `yarn install --flat` on the command-line.

``` typescript
    export type YarnConfiguration = {
        flat?: boolean;
```

Selective version resolutions. Allows the definition of custom package versions inside dependencies without manual edits in the `yarn.lock` file.

``` typescript
        resolutions?: Dependency;
    };
```

JSPM configuration.

``` typescript
    export type JSPMConfiguration = {
        jspm?: PackageJson;
    };
```

Type for [npm's `package.json` file](https://docs.npmjs.com/creating-a-package-json-file). Containing standard npm properties.

The name of the package.

``` typescript
    export interface PackageJsonStandard {
        name?: string;
```

Package version, parseable by [`node-semver`](https://github.com/npm/node-semver).

``` typescript
        version?: string;
```

Package description, listed in `npm search`.

``` typescript
        description?: string;
```

Keywords associated with package, listed in `npm search`.

``` typescript
        keywords?: string[];
```

The URL to the package's homepage.

``` typescript
        homepage?: LiteralUnion<'.', string>;
```

The URL to the package's issue tracker and/or the email address to which issues should be reported.

``` typescript
        bugs?: BugsLocation;
```

The license for the package.

``` typescript
        license?: string;
```

The licenses for the package.

``` typescript
        licenses?: Array<{
            type?: string;
            url?: string;
        }>;
```

``` typescript
        author?: Person;
```

A list of people who contributed to the package.

``` typescript
        contributors?: Person[];
```

A list of people who maintain the package.

``` typescript
        maintainers?: Person[];
```

The files included in the package.

``` typescript
        files?: string[];
```

Resolution algorithm for importing ".js" files from the package's scope.
[Read more.](https://nodejs.org/api/esm.html#esm_package_json_type_field)

``` typescript
        type?: 'module' | 'commonjs';
```

The module ID that is the primary entry point to the program.

``` typescript
        main?: string;
```

Subpath exports to define entry points of the package.
[Read more.](https://nodejs.org/api/packages.html#subpath-exports)

``` typescript
        exports?: Exports;
```

Subpath imports to define internal package import maps that only apply to import specifiers from within the package itself.
[Read more.](https://nodejs.org/api/packages.html#subpath-imports)

``` typescript
        imports?: Imports;
```

The executable files that should be installed into the `PATH`.

``` typescript
        bin?:
            | string
            | Partial<Record<string, string>>;
```

Filenames to put in place for the `man` program to find.

``` typescript
        man?: string | string[];
```

Indicates the structure of the package.

``` typescript
        directories?: DirectoryLocations;
```

Location for the code repository.

``` typescript
        repository?:
            | string
            | {
                type: string;
                url: string;
```

Relative path to package.json if it is placed in non-root directory (for example if it is part of a monorepo).
[Read more.](https://github.com/npm/rfcs/blob/latest/implemented/0010-monorepo-subdirectory-declaration.md)

``` typescript
                directory?: string;
            };
```

Script commands that are run at various times in the lifecycle of the package. The key is the lifecycle event, and the value is the command to run at that point.

``` typescript
        scripts?: Scripts;
```

Is used to set configuration parameters used in package scripts that persist across upgrades.

``` typescript
        config?: JsonObject;
```

The dependencies of the package.

``` typescript
        dependencies?: Dependency;
```

Additional tooling dependencies that are not required for the package to work. Usually test, build, or documentation tooling.

``` typescript
        devDependencies?: Dependency;
```

Dependencies that are skipped if they fail to install.

``` typescript
        optionalDependencies?: Dependency;
```

Dependencies that will usually be required by the package user directly or via another dependency.

``` typescript
        peerDependencies?: Dependency;
```

Indicate peer dependencies that are optional.

``` typescript
        peerDependenciesMeta?: Partial<Record<string, {optional: true}>>;
```

Package names that are bundled when the package is published.

``` typescript
        bundledDependencies?: string[];
```

Alias of `bundledDependencies`.

``` typescript
        bundleDependencies?: string[];
```

Engines that this package runs on.

``` typescript
        engines?: {
            [EngineName in 'npm' | 'node' | string]?: string;
        };
```

@deprecated

``` typescript
        engineStrict?: boolean;
```

Operating systems the module runs on.

``` typescript
        os?: Array<LiteralUnion<
            | 'aix'
            | 'darwin'
            | 'freebsd'
            | 'linux'
            | 'openbsd'
            | 'sunos'
            | 'win32'
            | '!aix'
            | '!darwin'
            | '!freebsd'
            | '!linux'
            | '!openbsd'
            | '!sunos'
            | '!win32',
            string
        >>;
```

CPU architectures the module runs on.

``` typescript
        cpu?: Array<LiteralUnion<
            | 'arm'
            | 'arm64'
            | 'ia32'
            | 'mips'
            | 'mipsel'
            | 'ppc'
            | 'ppc64'
            | 's390'
            | 's390x'
            | 'x32'
            | 'x64'
            | '!arm'
            | '!arm64'
            | '!ia32'
            | '!mips'
            | '!mipsel'
            | '!ppc'
            | '!ppc64'
            | '!s390'
            | '!s390x'
            | '!x32'
            | '!x64',
            string
        >>;
```

If set to `true`, a warning will be shown if package is installed locally. Useful if the package is primarily a command-line application that should be installed globally.
@deprecated

``` typescript
        preferGlobal?: boolean;
```

If set to `true`, then npm will refuse to publish it.

``` typescript
        private?: boolean;
```

A set of config values that will be used at publish-time. It's especially handy to set the tag, registry or access, to ensure that a given package is not tagged with 'latest', published to the global public registry or that a scoped module is private by default.

``` typescript
        publishConfig?: PublishConfig;
```

Describes and notifies consumers of a package's monetary support information.
[Read more.](https://github.com/npm/rfcs/blob/main/implemented/0017-add-funding-support.md)

The type of funding.

``` typescript
        funding?: string | {
            type?: LiteralUnion<
                | 'github'
                | 'opencollective'
                | 'patreon'
                | 'individual'
                | 'foundation'
                | 'corporation',
                string
            >;
```

The URL to the funding page.

``` typescript
            url: string;
        };
```

Used to configure [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) / [Yarn workspaces](https://classic.yarnpkg.com/docs/workspaces/).
Workspaces allow you to manage multiple packages within the same repository in such a way that you only need to run your install command once in order to install all of them in a single pass.
Please note that the top-level `private` property of `package.json` **must** be set to `true` in order to use workspaces.

``` typescript
        workspaces?: WorkspacePattern[] | WorkspaceConfig;
    }
```

Type for [`package.json` file used by the Node.js runtime](https://nodejs.org/api/packages.html#nodejs-packagejson-field-definitions).

Defines which package manager is expected to be used when working on the current project. It can set to any of the [supported package managers](https://nodejs.org/api/corepack.html#supported-package-managers), and will ensure that your teams use the exact same package manager versions without having to install anything else than Node.js.
**This field is currently experimental and needs to be opted-in; check the [Corepack](https://nodejs.org/api/corepack.html) page for details about the procedure.**
@example
`json { "packageManager": "<package manager name>@<version>" } `

``` typescript
    export type NodeJsStandard = {
        packageManager?: string;
    };
```

Additional, less common properties from the [npm docs on `publishConfig`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#publishconfig).

``` typescript
    export type PublishConfig = {
        [additionalProperties: string]: JsonValue | undefined;
```

When publishing scoped packages, the access level defaults to restricted. If you want your scoped package to be publicly viewable (and installable) set `--access=public`. The only valid values for access are public and restricted. Unscoped packages always have an access level of public.

``` typescript
        access?: 'public' | 'restricted';
```

The base URL of the npm registry.
Default: `'https://registry.npmjs.org/'`

``` typescript
        registry?: string;
```

The tag to publish the package under.
Default: `'latest'`

``` typescript
        tag?: string;
    };
}
```

Type for [npm's `package.json` file](https://docs.npmjs.com/creating-a-package-json-file). Also includes types for fields used by other popular projects, like TypeScript and Yarn.
@category File

``` typescript
export type PackageJson =
    JsonObject &
    PackageJson.NodeJsStandard &
    PackageJson.PackageJsonStandard &
    PackageJson.NonStandardEntryPoints &
    PackageJson.TypeScriptConfiguration &
    PackageJson.YarnConfiguration &
    PackageJson.JSPMConfiguration;
```