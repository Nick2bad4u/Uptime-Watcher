# PowerShell script to fix Markdown links in documentation
# This script removes .md extensions from internal links to work with Jekyll collections

Write-Host "🔧 Fixing Markdown links in documentation..." -ForegroundColor Cyan

# Get all markdown files in the docs directory
$docFiles = Get-ChildItem -Path "docs" -Filter "*.md" -Recurse

$totalFiles = $docFiles.Count
$processedFiles = 0
$totalReplacements = 0

foreach ($file in $docFiles) {
    $processedFiles++
    Write-Progress -Activity "Processing Markdown files" -Status "File $processedFiles of $totalFiles" -PercentComplete (($processedFiles / $totalFiles) * 100)
    
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileReplacements = 0
    
    # Pattern to match markdown links with .md extension
    # Matches: [text](filename.md) or [text](path/filename.md) but not external URLs
    $pattern = '\[([^\]]+)\]\(([^)]*?)\.md\)'
    
    # Find all matches first to report them
    $linkMatches = [regex]::Matches($content, $pattern)
    
    if ($linkMatches.Count -gt 0) {
        Write-Host "📝 Processing: $($file.Name)" -ForegroundColor Yellow
        
        foreach ($match in $linkMatches) {
            $linkText = $match.Groups[1].Value
            $linkPath = $match.Groups[2].Value
            Write-Host "  🔗 Found link: [$linkText]($linkPath.md)" -ForegroundColor Gray
        }
    }
    
    # Replace .md links with Jekyll-friendly paths
    $content = [regex]::Replace($content, $pattern, {
        param($match)
        $linkText = $match.Groups[1].Value
        $linkPath = $match.Groups[2].Value
        
        # Handle different path types
        if ($linkPath -match '^https?://') {
            # External URL - don't modify
            return $match.Value
        } elseif ($linkPath -match '^\.\.?/') {
            # Relative path - remove .md extension and add trailing slash if it's a guide
            if ($linkPath -match 'guides/') {
                $newPath = $linkPath -replace '\.md$', '/'
            } else {
                $newPath = $linkPath -replace '\.md$', '/'
            }
            $fileReplacements++
            return "[$linkText]($newPath)"
        } elseif ($linkPath -match '/') {
            # Path with directory - add trailing slash
            $newPath = $linkPath + '/'
            $fileReplacements++
            return "[$linkText]($newPath)"
        } else {
            # Simple filename - add trailing slash
            $newPath = $linkPath + '/'
            $fileReplacements++
            return "[$linkText]($newPath)"
        }
    })
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $totalReplacements += $fileReplacements
        Write-Host "  ✅ Updated $fileReplacements links in $($file.Name)" -ForegroundColor Green
    }
}

Write-Progress -Activity "Processing Markdown files" -Completed

Write-Host ""
Write-Host "🎉 Link fixing complete!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  • Files processed: $totalFiles" -ForegroundColor White
Write-Host "  • Total link replacements: $totalReplacements" -ForegroundColor White

if ($totalReplacements -gt 0) {
    Write-Host ""
    Write-Host "📝 What was changed:" -ForegroundColor Yellow
    Write-Host "  • Removed .md extensions from internal links" -ForegroundColor White
    Write-Host "  • Added trailing slashes for Jekyll collection URLs" -ForegroundColor White
    Write-Host "  • Preserved external URLs unchanged" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Your documentation links should now work properly with Jekyll!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ℹ️  No changes were needed - all links are already properly formatted!" -ForegroundColor Blue
}
