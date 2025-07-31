<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Auto Update](#auto-update)
  - [Auto-updatable Targets¶](#auto-updatable-targets)
  - [Differences between electron-updater and built-in autoUpdater¶](#differences-between-electron-updater-and-built-in-autoupdater)
  - [Quick Setup Guide¶](#quick-setup-guide)
  - [Examples¶](#examples)
    - [Custom Options instantiating updater Directly¶](#custom-options-instantiating-updater-directly)
  - [Debugging¶](#debugging)
  - [Compatibility¶](#compatibility)
  - [Staged Rollouts¶](#staged-rollouts)
  - [File Generated and Uploaded in Addition¶](#file-generated-and-uploaded-in-addition)
  - [Private GitHub Update Repo¶](#private-github-update-repo)
  - [Events¶](#events)
      - [Event: `error`¶](#event-error)
      - [Event: `checking-for-update`¶](#event-checking-for-update)
      - [Event: `update-available`¶](#event-update-available)
      - [Event: `update-not-available`¶](#event-update-not-available)
      - [Event: `download-progress`¶](#event-download-progress)
      - [Event: `update-downloaded`¶](#event-update-downloaded)
  - [UpdateInfo¶](#updateinfo)
      - [Extended by¶](#extended-by)
      - [Properties¶](#properties)
        - [files¶](#files)
        - [minimumSystemVersion?¶](#minimumsystemversion)
        - [~~path~~¶](#path)
          - [Deprecated¶](#deprecated)
        - [releaseDate¶](#releasedate)
        - [releaseName?¶](#releasename)
        - [releaseNotes?¶](#releasenotes)
        - [~~sha512~~¶](#sha512)
          - [Deprecated¶ {#deprecated\_1}](#deprecated-deprecated_1)
        - [stagingPercentage?¶](#stagingpercentage)
        - [version¶](#version)

<!-- TOC end -->

/** eslint-disable markdown/heading-increment */
/** eslint-disable markdown/no-missing-link-fragments */
::::::::::::::::: {.md-content md-component="content"}

<!-- TOC --><a name="auto-update"></a>
# Auto Update

Auto updates are enabled by the `electron-updater` package. Ideally,
auto updates are configured to run in a CI pipeline to automatically
provision new releases. See [publish configuration](/publish) for
information on how to configure your local or CI environment for
automated deployments.

Auto updates work as follows:

- You configure the package to build release metadata (`latest.yml`)
- Electron builder uploads the actual release targets and metadata files
  to the configured target (except for generic server, where you have to
  upload manually)
- You configure the Electron application to use auto-updates, which
  queries the publish server for possible new releases

Read the remainder of this guide to configure everything.

::: {.admonition .info}
Code signing is required on macOS

macOS application must be [signed](/code-signing) in order for auto
updating to work.
:::

<!-- TOC --><a name="auto-updatable-targets"></a>
## Auto-updatable Targets[¶](#auto-updatable-targets "Permanent link")

- macOS: DMG.
- Linux: AppImage, DEB, Pacman (beta) and RPM.
- Windows: NSIS.

All these targets are default, custom configuration is not required.
(Though it is possible to [pass in additional configuration, e.g.
request headers](#custom-options-instantiating-updater-directly).)

::: {.admonition .info}
Info

1.  **Squirrel.Windows is not supported.** Simplified auto-update is
    supported on Windows if you use the default NSIS target, but is not
    supported for Squirrel.Windows. You can [easily migrate to
    NSIS](https://github.com/electron-userland/electron-builder/issues/837#issuecomment-355698368).
2.  `zip` target for macOS is **required** for Squirrel.Mac, otherwise
    `latest-mac.yml` cannot be created, which causes `autoUpdater`
    error. Default [target](/mac#MacOptions-target) for macOS is
    `dmg`+`zip`, so there is no need to explicitly specify target.
:::

<!-- TOC --><a name="differences-between-electron-updater-and-built-in-autoupdater"></a>
## Differences between electron-updater and built-in autoUpdater[¶](#differences-between-electron-updater-and-built-in-autoupdater "Permanent link")

The `electron-updater` package offers a different functionality compared
to Electron's built-in auto-updater. Here are the differences:

- Linux is supported (not only macOS and Windows).
- Code signature validation not only on macOS, but also on Windows.
- All required metadata files and artifacts are produced and published
  automatically.
- Download progress and [staged rollouts](#staged-rollouts) supported on
  all platforms.
- Different providers supported out of the box: ([GitHub
  Releases](https://help.github.com/articles/about-releases/), [Amazon
  S3](https://aws.amazon.com/s3/), [DigitalOcean
  Spaces](https://www.digitalocean.com/community/tutorials/an-introduction-to-digitalocean-spaces),
  [Keygen](https://keygen.sh/docs/api/#auto-updates-electron) and
  generic HTTP(s) server).
- You need only 2 lines of code to make it work.

<!-- TOC --><a name="quick-setup-guide"></a>
## Quick Setup Guide[¶](#quick-setup-guide "Permanent link")

1.  Install [electron-updater](https://yarn.pm/electron-updater) as an
    app dependency.

2.  Configure the [`publish`](/publish) options depending on where you
    want to host your release files.

3.  Build your application and check that the build directory contains
    the metadata `.yml` files next to the built application. For most
    publish targets, the building step will also upload the files,
    except for the generic server option, where you have to upload your
    built releases and metadata manually.

4.  Use `autoUpdater` from `electron-updater` instead of `electron`:

    CommonJS

    ::: highlight
        const { autoUpdater } = require("electron-updater")
    :::

    ESM

    ::: highlight
        import { autoUpdater } from "electron-updater"
    :::

    TypeScript

    ::: highlight
        import electronUpdater, { type AppUpdater } from 'electron-updater';

        export function getAutoUpdater(): AppUpdater {
           // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
           // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
           const { autoUpdater } = electronUpdater;
           return autoUpdater;
        }
    :::

5.  Call `autoUpdater.checkForUpdatesAndNotify()`. Or, if you need
    custom behaviour, implement `electron-updater` events, check
    examples below.

::: {.admonition .note}
Note

Do not call [setFeedURL](#appupdatersetfeedurloptions). electron-builder
automatically creates `app-update.yml` file for you on build in the
`resources` (this file is internal, you don't need to be aware of it).
:::

<!-- TOC --><a name="examples"></a>
## Examples[¶](#examples "Permanent link")

:::: {.admonition .example}
Example in TypeScript using system notifications

::: highlight
    import { autoUpdater } from "electron-updater"

    export default class AppUpdater {
      constructor() {
        const log = require("electron-log")
        log.transports.file.level = "debug"
        autoUpdater.logger = log
        autoUpdater.checkForUpdatesAndNotify()
      }
    }
:::
::::

- A [complete example](https://github.com/iffy/electron-updater-example)
  showing how to use.
- An [encapsulated manual update via
  menu](https://github.com/electron-userland/electron-builder/blob/7f6c3fea6fea8cffa00a43413f5335097aca94b0/pages/encapsulated%20manual%20update%20via%20menu.js).

<!-- TOC --><a name="custom-options-instantiating-updater-directly"></a>
### Custom Options instantiating updater Directly[¶](#custom-options-instantiating-updater-directly "Permanent link")

If you want to more control over the updater configuration (e.g. request
header for authorization purposes), you can instantiate the updater
directly.

::: highlight
    import { NsisUpdater } from "electron-updater"
    // Or MacUpdater, AppImageUpdater

    export default class AppUpdater {
        constructor() {
            const options = {
                requestHeaders: {
                    // Any request headers to include here
                },
                provider: 'generic',
                url: 'https://example.com/auto-updates'
            }

            const autoUpdater = new NsisUpdater(options)
            autoUpdater.addAuthHeader(`Bearer ${token}`)
            autoUpdater.checkForUpdatesAndNotify()
        }
    }
:::

<!-- TOC --><a name="debugging"></a>
## Debugging[¶](#debugging "Permanent link")

You don't need to listen all events to understand what's wrong. Just set
`logger`. [electron-log](https://github.com/megahertz/electron-log) is
recommended (it is an additional dependency that you can install if
needed).

::: highlight
    autoUpdater.logger = require("electron-log")
    autoUpdater.logger.transports.file.level = "info"
:::

Note that in order to develop/test UI/UX of updating without packaging
the application you need to have a file named `dev-app-update.yml` in
the root of your project, which matches your `publish` setting from
electron-builder config (but in [yaml](https://www.json2yaml.com)
format). In latest version you need [force the
updater](https://github.com/electron-userland/electron-builder/issues/6863)
to work in "dev" mode:

::: highlight
    autoUpdater.forceDevUpdateConfig = true
:::

::::: {.admonition .note}
Note

If you see this in logs:

::: highlight
    APPIMAGE env is not defined, current application is not an AppImage
:::

you need to apply [this
workaround](https://github.com/electron-userland/electron-builder/issues/3167#issuecomment-627696277)
otherwise update won't continue:

::: highlight
    process.env.APPIMAGE = path.join(__dirname, 'dist', `app_name-${app.getVersion()}.AppImage`)
:::
:::::

But it is not recommended, better to test auto-update for installed
application (especially on Windows).
[Minio](https://github.com/electron-userland/electron-builder/issues/3053#issuecomment-401001573)
is recommended as a local server for testing updates.

<!-- TOC --><a name="compatibility"></a>
## Compatibility[¶](#compatibility "Permanent link")

Generated metadata files format changes from time to time, but
compatibility preserved up to version 1. If you start a new project,
recommended to set `electronUpdaterCompatibility` to current latest
format version (`>= 2.16`).

Option `electronUpdaterCompatibility` set the electron-updater
compatibility semver range. Can be specified per platform.

e.g. `>= 2.16`, `>=1.0.0`. Defaults to `>=2.15`

- `1.0.0` latest-mac.json
- `2.15.0` path
- `2.16.0` files

<!-- TOC --><a name="staged-rollouts"></a>
## Staged Rollouts[¶](#staged-rollouts "Permanent link")

Staged rollouts allow you to distribute the latest version of your app
to a subset of users that you can increase over time, similar to
rollouts on platforms like Google Play.

Staged rollouts are controlled by manually editing your `latest.yml` /
`latest-mac.yml` (channel update info file).

::: highlight
    version: 1.1.0
    path: TestApp Setup 1.1.0.exe
    sha512: Dj51I0q8aPQ3ioaz9LMqGYujAYRbDNblAQbodDRXAMxmY6hsHqEl3F6SvhfJj5oPhcqdX1ldsgEvfMNXGUXBIw==
    stagingPercentage: 10
:::

Update will be shipped to 10% of userbase.

If you want to pull a staged release because it hasn't gone well, you
**must** increment the version number higher than your broken release.
Because some of your users will be on the broken 1.0.1, releasing a new
1.0.1 would result in them staying on a broken version.

<!-- TOC --><a name="file-generated-and-uploaded-in-addition"></a>
## File Generated and Uploaded in Addition[¶](#file-generated-and-uploaded-in-addition "Permanent link")

`latest.yml` (or `latest-mac.yml` for macOS, or `latest-linux.yml` for
Linux) will be generated and uploaded for all providers except `bintray`
(because not required, `bintray` doesn't use `latest.yml`).

<!-- TOC --><a name="private-github-update-repo"></a>
## Private GitHub Update Repo[¶](#private-github-update-repo "Permanent link")

You can use a private repository for updates with electron-updater by
setting the `GH_TOKEN` environment variable (on user machine) and
`private` option. If `GH_TOKEN` is set, electron-updater will use the
GitHub API for updates allowing private repositories to work.

::: {.admonition .warning}
Warning

Private GitHub provider only for [very
special](https://github.com/electron-userland/electron-builder/issues/1393#issuecomment-288191885)
cases --- not intended and not suitable for all users.
:::

::: {.admonition .note}
Note

The GitHub API currently has a rate limit of 5000 requests per user per
hour. An update check uses up to 3 requests per check.
:::

<!-- TOC --><a name="events"></a>
## Events[¶](#events "Permanent link")

The `autoUpdater` object emits the following events:

<!-- TOC --><a name="event-error"></a>
#### Event: `error`[¶](#event-error "Permanent link")

- `error` Error

Emitted when there is an error while updating.

<!-- TOC --><a name="event-checking-for-update"></a>
#### Event: `checking-for-update`[¶](#event-checking-for-update "Permanent link")

Emitted when checking if an update has started.

<!-- TOC --><a name="event-update-available"></a>
#### Event: `update-available`[¶](#event-update-available "Permanent link")

- `info` [UpdateInfo](#updateinfo) (for generic and github providers) \|
  [VersionInfo](#VersionInfo) (for Bintray provider)

Emitted when there is an available update. The update is downloaded
automatically if `autoDownload` is `true`.

<!-- TOC --><a name="event-update-not-available"></a>
#### Event: `update-not-available`[¶](#event-update-not-available "Permanent link")

Emitted when there is no available update.

- `info` [UpdateInfo](#updateinfo) (for generic and github providers) \|
  [VersionInfo](#VersionInfo) (for Bintray provider)

<!-- TOC --><a name="event-download-progress"></a>
#### Event: `download-progress`[¶](#event-download-progress "Permanent link")

- `progress` ProgressInfo
- `bytesPerSecond`
- `percent`
- `total`
- `transferred`

Emitted on progress.

<!-- TOC --><a name="event-update-downloaded"></a>
#### Event: `update-downloaded`[¶](#event-update-downloaded "Permanent link")

- `info` [UpdateInfo](#updateinfo) --- for generic and github providers.
  [VersionInfo](#VersionInfo) for Bintray provider.

<!-- TOC --><a name="updateinfo"></a>
## UpdateInfo[¶](#updateinfo "Permanent link")

[Electron-Builder](/packages) / [electron-updater](/electron-updater/) /
UpdateInfo

<!-- TOC --><a name="extended-by"></a>
#### Extended by[¶](#extended-by "Permanent link")

- [`UpdateDownloadedEvent`](/electron-updater.interface.updatedownloadedevent)

<!-- TOC --><a name="properties"></a>
#### Properties[¶](#properties "Permanent link")

<!-- TOC --><a name="files"></a>
##### files[¶](#files "Permanent link")

> `readonly` **files**:
> [`UpdateFileInfo`](/electron-updater.interface.updatefileinfo)\[\]

------------------------------------------------------------------------

<!-- TOC --><a name="minimumsystemversion"></a>
##### minimumSystemVersion?[¶](#minimumsystemversion "Permanent link")

> `readonly` `optional` **minimumSystemVersion**: `string`

The minimum version of system required for the app to run. Sample value:
macOS `23.1.0`, Windows `10.0.22631`. Same with os.release() value, this
is a kernel version.

------------------------------------------------------------------------

<!-- TOC --><a name="path"></a>
##### ~~path~~[¶](#path "Permanent link")

> `readonly` **path**: `string`

<!-- TOC --><a name="deprecated"></a>
###### Deprecated[¶](#deprecated "Permanent link")

------------------------------------------------------------------------

<!-- TOC --><a name="releasedate"></a>
##### releaseDate[¶](#releasedate "Permanent link")

> **releaseDate**: `string`

The release date.

------------------------------------------------------------------------

<!-- TOC --><a name="releasename"></a>
##### releaseName?[¶](#releasename "Permanent link")

> `optional` **releaseName**: `null` \| `string`

The release name.

------------------------------------------------------------------------

<!-- TOC --><a name="releasenotes"></a>
##### releaseNotes?[¶](#releasenotes "Permanent link")

> `optional` **releaseNotes**: `null` \| `string` \|
> [`ReleaseNoteInfo`](/builder-util-runtime.interface.releasenoteinfo)\[\]

The release notes. List if `updater.fullChangelog` is set to `true`,
`string` otherwise.

------------------------------------------------------------------------

<!-- TOC --><a name="sha512"></a>
##### ~~sha512~~[¶](#sha512 "Permanent link")

> `readonly` **sha512**: `string`

<!-- TOC --><a name="deprecated-deprecated_1"></a>
###### Deprecated[¶](#deprecated_1 "Permanent link") {#deprecated_1}

------------------------------------------------------------------------

<!-- TOC --><a name="stagingpercentage"></a>
##### stagingPercentage?[¶](#stagingpercentage "Permanent link")

> `readonly` `optional` **stagingPercentage**: `number`

The [staged rollout](/auto-update#staged-rollouts) percentage, 0-100.

------------------------------------------------------------------------

<!-- TOC --><a name="version"></a>
##### version[¶](#version "Permanent link")

> `readonly` **version**: `string`

The version.
:::::::::::::::::
:::::::::::::::::::::::::::
::::::::::::::::::::::::::::
