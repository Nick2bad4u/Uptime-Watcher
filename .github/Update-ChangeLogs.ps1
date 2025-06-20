# Use Push-Location/Pop-Location for safe directory changes and error handling

# Determine repo root (parent of .github)
$repoRoot = Resolve-Path "$PSScriptRoot\.."

$folders = @(
    "$repoRoot",
    "$repoRoot\.github"
)

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Push-Location $folder
        try {
            npx git-cliff --output CHANGELOG.md
        }
        catch {
            Write-Error "Failed to update CHANGELOG.md in ${folder}: $_"
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Warning "Skipping missing folder: $folder"
    }
}

# (No longer needed: handled by the loop above)