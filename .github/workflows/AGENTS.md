# Agents Guide For GitHub Workflows

## Scope

This file applies to `.github/workflows/**`.

## Workflow Standards

- Treat workflows as production release infrastructure. Small YAML edits can
  change security, publishing, and installer behavior.
- Keep workflow names, job names, and step names descriptive enough to debug
  failures from the Actions UI without opening the YAML.
- Preserve existing job boundaries unless there is a clear reliability,
  security, or runtime reason to change them.
- Prefer explicit `permissions` with `contents: read` as the baseline and add
  write scopes only to the job that needs them.
- Keep third-party actions pinned to full commit SHAs with the upstream version
  comment preserved or updated.
- Keep `step-security/harden-runner` on jobs that already use it unless the job
  cannot run with it and the reason is documented.
- Use `.node-version` as the Node source of truth and keep `.nvmrc` aligned
  when changing runtime versions.
- Follow the repository's existing install style. Current workflows commonly
  use `npm install --force` because the dependency graph requires it.
- Use PowerShell for Windows-specific runner logic. Avoid adding Linux-only
  shell fragments to cross-platform jobs.

## Security Rules

- Never print secrets, tokens, signing keys, release credentials, or derived
  secret values.
- Do not pass secrets to pull-request workflows from forks unless GitHub's
  event model and repository policy make that safe.
- Use OIDC or provenance support where the target service supports it. Keep
  long-lived tokens narrowly scoped.
- Keep release upload, package signing, Internet Archive upload, VirusTotal,
  Codecov, SonarCloud, and Pages deployment credentials isolated to the
  jobs that need them.
- Do not widen `GITHUB_TOKEN` permissions to fix a failing step until the exact
  missing permission is identified.

## Build And Release Rules

- Installer and packaging workflows must preserve platform-specific behavior
  for Windows, macOS, Linux, Flatpak, and release artifact upload.
- Do not rename artifacts, installer patterns, or release assets without
  checking downstream workflows that download or upload those files.
- Keep `actions/upload-artifact`, `actions/download-artifact`, and release
  downloader paths aligned with the producing job's artifact names.
- For docs workflows, build TypeDoc, the ESLint inspector, Storybook docs, and
  Docusaurus in the same order used by root scripts unless intentionally
  changing the docs pipeline.

## Validation

- Run `npm run lint:actions` after workflow changes.
- Run YAML/prettier checks if formatting changed.
- For release, installer, or deployment workflow changes, also inspect the
  changed workflow paths and any artifact consumers with `rg` before reporting
  the change complete.
- If a workflow fix is based on a CI failure, read the failing log first and
  verify the patched command or condition addresses that exact failure.
