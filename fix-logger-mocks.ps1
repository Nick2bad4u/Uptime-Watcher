# Fix logger mocks in test files
$files = @(
    "src\test\services\logger.basic.test.ts",
    "src\test\utils\errorHandling.test.ts",
    "src\test\utils\fallbacks.test.ts",
    "src\test\utils\fileDownload.fixed.test.ts",
    "src\test\Settings.simple.coverage.test.tsx",
    "src\test\Settings.invalid-key.test.tsx",
    "src\test\Settings.invalid-key-logging.test.tsx",
    "src\test\ScreenshotThumbnail.test.tsx",
    "src\test\ScreenshotThumbnail.coverage.test.tsx",
    "src\test\hooks\useMount.100-coverage.test.ts",
    "src\test\components\AddSiteForm\DynamicMonitorFields.test.tsx",
    "src\test\components\AddSiteForm\AddSiteForm.targeted.test.tsx",
    "src\test\components\AddSiteForm\AddSiteForm.uncovered-lines.test.tsx",
    "src\test\components\AddSiteForm\DynamicField.additional-coverage.test.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file"
        $content = Get-Content $file -Raw
        $newContent = $content -replace 'default: \{', 'logger: {'
        Set-Content $file -Value $newContent
    } else {
        Write-Host "File not found: $file"
    }
}
