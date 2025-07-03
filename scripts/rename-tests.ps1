param (
    [switch]$DryRun,
    [string]$Directory = "."
)

$culture = Get-Culture
$files = Get-ChildItem -Path $Directory -Recurse -Include @("*.ts", "*.tsx") -Exclude "*node_modules*" | Where-Object { $_.DirectoryName -match '\\test($|\\)' }

foreach ($file in $files) {
    $baseNameWithTest = $file.BaseName
    $extension = $file.Extension

    $baseName = $baseNameWithTest
    if ($baseNameWithTest.EndsWith(".test")) {
        $baseName = $baseNameWithTest.Substring(0, $baseNameWithTest.Length - 5)
    }

    $words = $baseName -split '[-_.]'

    $firstWord = $words[0]
    $camelCaseName = $firstWord.Substring(0, 1).ToLower() + $firstWord.Substring(1)

    if ($words.Length -gt 1) {
        $camelCaseName += ($words[1..($words.Length - 1)] | ForEach-Object {
            if ($_.Length -gt 1) {
                $_.Substring(0, 1).ToUpper() + $_.Substring(1)
            } else {
                $_.ToUpper()
            }
        }) -join ''
    }

    $finalName = if ($file.Name -match '\.test\.tsx?$') {
        "$($camelCaseName).test$($extension)"
    } else {
        "$($camelCaseName)$($extension)"
    }

    if ($file.Name -ne $finalName) {
        if ($DryRun) {
            Write-Host "[Dry Run] Would rename '$($file.Name)' to '$($finalName)'"
        } else {
            Rename-Item -Path $file.FullName -NewName $finalName
            Write-Host "Renamed '$($file.Name)' to '$($finalName)'"
        }
    }
}
