# Use Push-Location/Pop-Location for safe directory changes and error handling

# Determine repo root (parent of .github)
$repoRoot = Resolve-Path "$PSScriptRoot\.."

# Create docs/changelogs directory if it doesn't exist
$changelogDir = "$repoRoot\docs\changelogs"
if (!(Test-Path $changelogDir)) {
    New-Item -ItemType Directory -Path $changelogDir -Force | Out-Null
    Write-Output "Created directory: $changelogDir"
}

# Define specific folders to process (avoid build/dist directories)
$foldersToProcess = @(
    @{ Path = "$repoRoot"; Name = "root" },
    @{ Path = "$repoRoot\src"; Name = "src" },
    @{ Path = "$repoRoot\src\components"; Name = "src-components" },
    @{ Path = "$repoRoot\src\hooks"; Name = "src-hooks" },
    @{ Path = "$repoRoot\src\services"; Name = "src-services" },
    @{ Path = "$repoRoot\src\theme"; Name = "src-theme" },
    @{ Path = "$repoRoot\src\utils"; Name = "src-utils" },
    @{ Path = "$repoRoot\electron"; Name = "electron" },
    @{ Path = "$repoRoot\electron\services"; Name = "electron-services" },
    @{ Path = "$repoRoot\electron\utils"; Name = "electron-utils" },
    @{ Path = "$repoRoot\.github"; Name = "github" },
    @{ Path = "$repoRoot\.github\workflows"; Name = "github-workflows" },
    @{ Path = "$repoRoot\docs"; Name = "docs" },
    @{ Path = "$repoRoot\public"; Name = "public" },
    @{ Path = "$repoRoot\icons"; Name = "icons" },
    @{ Path = "$repoRoot\scripts"; Name = "scripts" }
)

Write-Output "Processing $($foldersToProcess.Count) specific directories for changelog generation..."

foreach ($folderInfo in $foldersToProcess) {
    $folder = $folderInfo.Path
    $folderName = $folderInfo.Name

    if (Test-Path $folder) {
        # Generate changelog filename
        $changelogFileName = "changelog-$folderName.md"
        $changelogPath = "$changelogDir\$changelogFileName"

        Push-Location $folder
        try {
            Write-Output "Generating changelog for: $folder -> $changelogFileName"
            npx git-cliff --output $changelogPath

            if (Test-Path $changelogPath) {
                Write-Output "✓ Successfully generated: $changelogPath"
            } else {
                Write-Warning "⚠ Changelog file not created for: $folder"
            }
        }
        catch {
            Write-Error "✗ Failed to update changelog for ${folder}: $_"
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Warning "Skipping missing folder: $folder"
    }
}

Write-Output "`nChangelog generation complete! Check the docs/changelogs/ directory for generated files."