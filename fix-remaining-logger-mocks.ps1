# Fix remaining logger mocks in test files
$testFiles = Get-ChildItem -Path "src/test" -Recurse -Filter "*.ts" -File | Where-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    $content -match 'default:\s*\{'
}

Write-Host "Found $($testFiles.Count) files with potential logger default mocks to fix"

foreach ($file in $testFiles) {
    try {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content

        # Pattern 1: Basic vi.mock with default export
        $content = $content -replace '(vi\.mock\([^)]*services/logger[^)]*\),?\s*\(\)\s*=>\s*\(\s*\{\s*)default(\s*:\s*\{)', '$1logger$2'

        # Pattern 2: More flexible pattern for different quote styles and paths
        $content = $content -replace '(vi\.mock\([^)]*logger[^)]*\),?\s*\(\)\s*=>\s*\(\s*\{\s*)default(\s*:\s*\{)', '$1logger$2'

        if ($content -ne $originalContent) {
            Set-Content $file.FullName $content -NoNewline
            Write-Host "Fixed: $($file.Name)"
        } else {
            # Check if file contains "default: {" to see if it needs manual inspection
            if ($originalContent -match 'default:\s*\{') {
                Write-Host "Manual inspection needed: $($file.Name)"
            }
        }
    } catch {
        Write-Host "Error processing $($file.FullName): $_"
    }
}
