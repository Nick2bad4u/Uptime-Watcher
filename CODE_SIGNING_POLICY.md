# Code Signing Policy

## Status

Uptime Watcher is applying for free Windows code signing through SignPath
Foundation. Code signing is pending application submission, approval, and CI
integration.

The currently published `v23.9.0` Windows and macOS artifacts are unsigned.
Users should continue to expect Windows SmartScreen or unknown-publisher
warnings and macOS Gatekeeper approval prompts until a future release is
explicitly identified as signed.

After approval, Windows releases will use free code signing provided by
SignPath.io, certificate by SignPath Foundation. macOS releases will remain
unsigned because the project does not participate in the Apple Developer
Program.

## Signed Artifacts

Once signing is enabled, only Windows artifacts built from this repository's
GitHub Actions release workflow will be submitted to SignPath. The project will
not submit third-party projects or independently produced binaries for signing.

Each signing request must:

- originate from the public
  [`Nick2bad4u/Uptime-Watcher`](https://github.com/Nick2bad4u/Uptime-Watcher)
  repository;
- correspond to a published Git tag and release version;
- use the repository-controlled build and packaging configuration;
- receive manual approval from a designated approver; and
- pass the release workflow's build, test, security, and artifact-validation
  gates.

Unsigned dependencies bundled inside a signed installer remain attributable to
their upstream projects. Uptime Watcher will not apply its signing identity to
those upstream binaries.

## Team Roles

The project is currently maintained by one person:

- **Committer and reviewer:**
  [Nick2bad4u](https://github.com/Nick2bad4u)
- **Signing approver:**
  [Nick2bad4u](https://github.com/Nick2bad4u)

Changes from outside contributors require maintainer review before they are
merged. Repository and signing-service accounts used by project members must
have multi-factor authentication enabled.

## Privacy And System Changes

Uptime Watcher's data handling is documented in the
[Privacy Policy](PRIVACY.md). The application does not automatically send
telemetry, logs, or diagnostics to an Uptime Watcher-controlled service.

The Windows installer provides an uninstaller and identifies requested system
changes through its installation interface. Installation does not require the
project to weaken operating-system security controls.

## Verification And Revocation

After signing is enabled, the release workflow will verify the Authenticode
signature and expected publisher before uploading Windows artifacts. Release
notes will identify which files are signed and provide checksums or platform
digests where available.

If a signing key, signing workflow, maintainer account, or published artifact is
suspected to be compromised, the project may pause releases, remove affected
downloads, notify SignPath, and request certificate revocation. Security issues
should be reported using the instructions in [SECURITY.md](SECURITY.md).

This policy will be updated when the SignPath application is submitted or
accepted, the signing workflow changes, or another platform-signing provider is
introduced.
