<#
.SYNOPSIS
  Bootstrap GitHub labels for a repository (create/update) using GitHub CLI.

.DESCRIPTION
  This script manages GitHub issue/PR labels using `gh label create`.

  Default behavior:
    - Uses the embedded standard label set (the set you originally provided)
    - Uses --force to update existing labels to match color/description

  Optional behavior:
    - -FromLabelerYml: derive label *names* from `.github/labeler.yml` top-level keys
      (labeler.yml does not store color/description, so this script maps known names to
      embedded definitions and handles unknown names via fallback or strict mode).

FEATURES
  -WhatIf           : Preview actions without changing anything
  -NoForce          : Create-only (do not update existing labels)
  -Repo             : Target OWNER/REPO explicitly
  -FromLabelerYml   : Use label names from labeler.yml keys
  -Strict           : Fail if labeler.yml contains unknown label names
  -AuditOnly        : No changes; prints a report (missing/extra/unknown)
  -ExportJson       : Export the resolved label set to JSON for review/automation

REQUIREMENTS
  - GitHub CLI installed: https://cli.github.com/
  - Authenticated: gh auth login

EXAMPLES
  # Apply embedded defaults (create/update)
  pwsh ./scripts/bootstrap-labels.ps1

  # Apply to a different repo
  pwsh ./scripts/bootstrap-labels.ps1 -Repo "OWNER/REPO"

  # Read label names from .github/labeler.yml; use defaults where possible
  pwsh ./scripts/bootstrap-labels.ps1 -FromLabelerYml

  # Enforce that every label in labeler.yml is defined in embedded defaults
  pwsh ./scripts/bootstrap-labels.ps1 -FromLabelerYml -Strict

  # Audit only (no writes) and show what would happen
  pwsh ./scripts/bootstrap-labels.ps1 -FromLabelerYml -AuditOnly

  # Export resolved label set as JSON
  pwsh ./scripts/bootstrap-labels.ps1 -FromLabelerYml -ExportJson ".\artifacts\labels.resolved.json"

NOTES
  - Colors are hex without the leading '#'
  - `--force` updates existing labels to match the selected definitions
  - labeler.yml provides label NAMES only; rule details are ignored here
#>

[CmdletBinding(SupportsShouldProcess = $true,ConfirmImpact = "Low")]
param(
    # Optional: target a specific GitHub repository in OWNER/REPO format.
    [Parameter(Mandatory = $false)]
    [string]$Repo,

    # If set, do not use --force (won't update labels that already exist).
    [Parameter(Mandatory = $false)]
    [switch]$NoForce,

    # If set, reads label names from the labeler config (top-level YAML keys).
    [Parameter(Mandatory = $false)]
    [switch]$FromLabelerYml,

    # Path to the labeler config (only used when -FromLabelerYml is set).
    [Parameter(Mandatory = $false)]
    [string]$LabelerYmlPath = ".github/labeler.yml",

    # If set with -FromLabelerYml, fails when labeler.yml contains labels not present in embedded defaults.
    [Parameter(Mandatory = $false)]
    [switch]$Strict,

    # If set, performs a read-only report (no gh writes), including remote label comparison (when possible).
    [Parameter(Mandatory = $false)]
    [switch]$AuditOnly,

    # Optional path to export the resolved label set as JSON.
    [Parameter(Mandatory = $false)]
    [string]$ExportJson,

    # Used for labels found in labeler.yml that don't exist in the embedded label set (when not -Strict).
    [Parameter(Mandatory = $false)]
    [ValidatePattern("^[0-9a-fA-F]{6}$")]
    [string]$FallbackColor = "cfd3d7",

    # Used for labels found in labeler.yml that don't exist in the embedded label set (when not -Strict).
    [Parameter(Mandatory = $false)]
    [string]$FallbackDescription = "Auto-created from .github/labeler.yml"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Section {
    param(
        [Parameter(Mandatory)] [string]$Title
    )
    Write-Host ""
    Write-Host ("== {0} ==" -f $Title) -ForegroundColor Cyan
}

function Write-Info {
    param([Parameter(Mandatory)] [string]$Message)
    Write-Host $Message -ForegroundColor DarkCyan
}

function Write-Warn {
    param([Parameter(Mandatory)] [string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

function Write-Err {
    param([Parameter(Mandatory)] [string]$Message)
    Write-Host $Message -ForegroundColor Red
}

function Assert-CommandExists {
    param([Parameter(Mandatory)] [string]$Command)

    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        throw "Required command '$Command' was not found on PATH."
    }
}

function Get-RepoArgs {
    param([string]$Repo)
    if ($Repo) { return @("--repo",$Repo) }
    return @()
}

function Get-LabelerYmlTopLevelKeys {
    param([Parameter(Mandatory)] [string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Labeler YAML not found at path: $Path"
    }

    # Dependency-free top-level key extraction.
    # Assumptions:
    # - Label keys are YAML top-level mapping keys at column 0
    # - Form: <key>:
    # - Keys may be quoted with "..." or '...'
    # - Lines starting with '#' are comments
    $keys = New-Object System.Collections.Generic.List[string]
    $seen = New-Object System.Collections.Generic.HashSet[string]

    foreach ($line in (Get-Content -LiteralPath $Path)) {
        $t = $line.Trim()
        if (-not $t) { continue }
        if ($t.StartsWith("#")) { continue }

        # Accept only truly top-level (no indentation)
        if ($line -notmatch '^\S') { continue }

        # Match: key:
        if ($line -match '^(?<key>("([^"\\]|\\.)+"|''([^''\\]|\\.)+''|[^:\s#][^:]*)?)\s*:\s*(#.*)?$') {
            $rawKey = $Matches["key"].Trim()
            if (-not $rawKey) { continue }

            $key = $rawKey.Trim()
            if (($key.StartsWith('"') -and $key.EndsWith('"')) -or ($key.StartsWith("'") -and $key.EndsWith("'"))) {
                $key = $key.Substring(1,$key.Length - 2)
            }
            $key = $key.Trim()

            if ($key -and -not $seen.Contains($key)) {
                [void]$seen.Add($key)
                $keys.Add($key)
            }
        }
    }

    return $keys
}

function Get-RemoteLabels {
    param(
        [Parameter(Mandatory)] [string[]]$RepoArgs
    )

    # Returns: hashtable name->object (name,color,description)
    # If this fails (auth/repo issues), we degrade gracefully.
    $remote = @{}
    try {
        $json = & gh label list @RepoArgs --limit 1000 --json name,color,description 2>$null
        if (-not $json) { return $remote }
        $items = $json | ConvertFrom-Json
        foreach ($i in $items) {
            $remote[[string]$i.Name] = @{
                Name = [string]$i.Name
                Color = [string]$i.Color
                Description = [string]$i.Description
            }
        }
    } catch {
        # swallow; audit will note it
    }
    return $remote
}

function Ensure-DirectoryForFile {
    param([Parameter(Mandatory)] [string]$Path)
    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
}

Assert-CommandExists -Command "gh"

# -------------------------
# Embedded standard labels (your current set)
# -------------------------
$embeddedLabels = @(
    @{ Name = "bug"; Color = "d73a4a"; Description = "Something isn't working." }
    @{ Name = "documentation"; Color = "0075ca"; Description = "Improvements or additions to documentation." }
    @{ Name = "duplicate"; Color = "cfd3d7"; Description = "This issue or pull request already exists." }
    @{ Name = "enhancement"; Color = "a2eeef"; Description = "New feature or request." }
    @{ Name = "good first issue"; Color = "7057ff"; Description = "Good for newcomers." }
    @{ Name = "help wanted"; Color = "008672"; Description = "Extra attention is needed." }
    @{ Name = "invalid"; Color = "e4e669"; Description = "This doesn't seem right." }
    @{ Name = "question"; Color = "d876e3"; Description = "Further information is requested." }
    @{ Name = "wontfix"; Color = "ffffff"; Description = "This will not be worked on." }
    @{ Name = "test"; Color = "0e8a16"; Description = "Needs tests or QA verification." }
    @{ Name = "vulnerability"; Color = "b60205"; Description = "Security vulnerability tracking." }
    @{ Name = "codex"; Color = "1d76db"; Description = "CodeX automation and tooling updates." }
    @{ Name = "dependabot"; Color = "06B1D0"; Description = "Automated Dependabot updates." }
    @{ Name = "dependencies"; Color = "742D9A"; Description = "Dependency maintenance work." }
    @{ Name = "github-actions"; Color = "5371BB"; Description = "GitHub Actions workflows or runners." }
    @{ Name = "npm"; Color = "6F44BD"; Description = "npm registry or packaging changes." }
    @{ Name = "CI/CD"; Color = "0b5394"; Description = "Continuous integration and delivery updates." }
    @{ Name = "configuration"; Color = "fbca04"; Description = "Configuration and tooling updates." }
)

$embeddedByName = @{}
foreach ($l in $embeddedLabels) {
    $embeddedByName[[string]$l.Name] = $l
}

# -------------------------
# Resolve desired labels
# -------------------------
$unknownFromLabeler = New-Object System.Collections.Generic.List[string]
$resolvedLabels = @()

if ($FromLabelerYml) {
    Write-Section "Resolve labels from labeler.yml"
    Write-Info "Reading top-level keys from: $LabelerYmlPath"
    $names = Get-LabelerYmlTopLevelKeys -Path $LabelerYmlPath

    if (-not $names -or $names.Count -eq 0) {
        throw "No top-level label keys found in $LabelerYmlPath"
    }

    foreach ($name in $names) {
        if ($embeddedByName.ContainsKey($name)) {
            $resolvedLabels += $embeddedByName[$name]
        } else {
            $unknownFromLabeler.Add($name)
            if ($Strict) {
                continue
            }
            $resolvedLabels += @{
                Name = $name
                Color = $FallbackColor
                Description = $FallbackDescription
            }
        }
    }

    if ($unknownFromLabeler.Count -gt 0) {
        $msg = "labeler.yml contains labels not present in embedded defaults: " + ($unknownFromLabeler -join ", ")
        if ($Strict) {
            throw $msg + "`nUse embedded defaults only, or add these labels to the embedded set, or run without -Strict to allow fallback."
        } else {
            Write-Warn $msg
            Write-Warn ("Using fallback for unknown labels: Color={0}, Description='{1}'" -f $FallbackColor,$FallbackDescription)
        }
    }

    # Stable order
    $resolvedLabels = $resolvedLabels | Sort-Object -Property Name
} else {
    Write-Section "Resolve labels from embedded defaults"
    $resolvedLabels = $embeddedLabels
}

if ($ExportJson) {
    Write-Section "Export resolved labels"
    Ensure-DirectoryForFile -Path $ExportJson
    $resolvedLabels | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $ExportJson -Encoding UTF8
    Write-Info "Exported: $ExportJson"
}

# -------------------------
# Audit mode (optional)
# -------------------------
$repoArgs = Get-RepoArgs -Repo $Repo
$target = if ($Repo) { $Repo } else { "(current repo)" }

Write-Section "Plan"
Write-Info ("Target      : {0}" -f $target)
Write-Info ("Source      : {0}" -f ($(if ($FromLabelerYml) { "labeler.yml ($LabelerYmlPath)" } else { "embedded label set" })))
Write-Info ("Behavior    : {0}" -f ($(if ($NoForce) { "create-only (no --force)" } else { "create-or-update (--force)" })))
Write-Info ("Labels      : {0}" -f $resolvedLabels.Count)
if ($WhatIfPreference) { Write-Warn "WhatIf      : enabled (no changes will be made)" }
if ($AuditOnly) { Write-Warn "AuditOnly   : enabled (no changes will be made)" }

if ($AuditOnly) {
    Write-Section "Audit"
    $remote = Get-RemoteLabels -RepoArgs $repoArgs
    if ($remote.Count -eq 0) {
        Write-Warn "Could not fetch remote labels (auth/repo issue?), or repo has no labels."
        Write-Info "Audit will only show the desired label set."
    }

    $desiredNames = [System.Collections.Generic.HashSet[string]]::new()
    foreach ($l in $resolvedLabels) { [void]$desiredNames.Add([string]$l.Name) }

    if ($remote.Count -gt 0) {
        $remoteNames = [System.Collections.Generic.HashSet[string]]::new()
        foreach ($k in $remote.Keys) { [void]$remoteNames.Add([string]$k) }

        $missing = @()
        foreach ($n in $desiredNames) { if (-not $remoteNames.Contains($n)) { $missing += $n } }

        $extra = @()
        foreach ($n in $remoteNames) { if (-not $desiredNames.Contains($n)) { $extra += $n } }

        Write-Host "Missing remote labels (would be created):" -ForegroundColor Cyan
        if ($missing.Count -eq 0) { Write-Host "  (none)" -ForegroundColor Gray } else { $missing | Sort-Object | ForEach-Object { Write-Host ("  - {0}" -f $_) } }

        Write-Host "Extra remote labels (not managed by this script):" -ForegroundColor Cyan
        if ($extra.Count -eq 0) { Write-Host "  (none)" -ForegroundColor Gray } else { $extra | Sort-Object | ForEach-Object { Write-Host ("  - {0}" -f $_) } }

        Write-Host "Potential diffs (name exists but color/description differs):" -ForegroundColor Cyan
        $diffs = 0
        foreach ($l in $resolvedLabels) {
            $name = [string]$l.Name
            if (-not $remote.ContainsKey($name)) { continue }
            $r = $remote[$name]
            if (($r.Color -ne $l.Color) -or (($r.Description ?? "") -ne ($l.Description ?? ""))) {
                $diffs++
                Write-Host ("  - {0}: remote(color={1}, desc='{2}') != desired(color={3}, desc='{4}')" -f $name,$r.Color,($r.Description ?? ""),$l.Color,($l.Description ?? "")) -ForegroundColor Yellow
            }
        }
        if ($diffs -eq 0) { Write-Host "  (none)" -ForegroundColor Gray }
    }

    Write-Section "Desired labels"
    foreach ($l in $resolvedLabels) {
        Write-Host ("- {0}  [{1}]  {2}" -f $l.Name,$l.Color,$l.Description) -ForegroundColor Gray
    }

    Write-Section "Done (audit only)"
    exit 0
}

# -------------------------
# Apply labels (gh writes)
# -------------------------
Write-Section "Apply"

foreach ($label in $resolvedLabels) {
    $name = [string]$label.Name
    $color = [string]$label.Color
    $desc = [string]$label.Description

    $args = @("label","create",$name,"--color",$color,"--description",$desc) + $repoArgs
    if (-not $NoForce) { $args += "--force" }

    $cmdPreview = "gh " + ($args -join " ")

    if ($PSCmdlet.ShouldProcess($target,"Create/update label '$name'")) {
        Write-Host ("- {0}" -f $cmdPreview) -ForegroundColor Gray
        & gh @args | Out-Null
    }
}

Write-Section "Done"
Write-Host "Labels bootstrapped successfully." -ForegroundColor Green
