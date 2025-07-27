<#
.SYNOPSIS
    Lists all files in a directory, organized by subdirectory.
.DESCRIPTION
    This script recursively scans a directory and displays all files grouped by their containing subdirectories.
.PARAMETER Path
    The directory path to scan. Defaults to current directory if not specified.
.PARAMETER OutputFile
    (Optional) Path to a text file where the results will be saved.
.EXAMPLE
    .\ListFilesBySubdir.ps1 -Path "C:\MyFiles"
    Lists all files under C:\MyFiles organized by subdirectory.
.EXAMPLE
    .\ListFilesBySubdir.ps1 -Path "D:\Projects" -OutputFile "D:\filelist.txt"
    Lists all files under D:\Projects and saves the output to D:\filelist.txt
#>

param (
    [string]$Path = ".",
    [string]$OutputFile
)

function List-FilesBySubdirectory {
    param (
        [string]$Directory
    )

    # Get all subdirectories recursively
    $subdirs = Get-ChildItem -Path $Directory -Directory -Recurse | Sort-Object FullName

    # Add the root directory
    $subdirs = @(Get-Item -Path $Directory) + $subdirs

    foreach ($dir in $subdirs) {
        # Get files in current directory (non-recursive)
        $files = Get-ChildItem -Path $dir.FullName -File | Sort-Object Name

        if ($files.Count -gt 0) {
            # Display directory header
            Write-Output ""
            Write-Output "Directory: $($dir.FullName)"
            Write-Output ("-" * ("Directory: $($dir.FullName)".Length))

            # Display files
            foreach ($file in $files) {
                Write-Output "  $($file.Name) (Size: $([math]::Round($file.Length / 1KB, 2)) KB, Modified: $($file.LastWriteTime))"
            }

            # Display file count
            Write-Output ""
            Write-Output "Total files in this directory: $($files.Count)"
        }
    }
}

# Main script execution
try {
    # Verify path exists
    if (-not (Test-Path -Path $Path -PathType Container)) {
        throw "The specified path does not exist or is not a directory: $Path"
    }

    # Resolve full path
    $fullPath = (Resolve-Path -Path $Path).Path

    Write-Output "Listing all files under: $fullPath"
    Write-Output "Scan started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Output ""

    # Capture output if output file is specified
    if ($OutputFile) {
        $output = List-FilesBySubdirectory -Directory $fullPath
        $output | Out-File -FilePath $OutputFile -Encoding UTF8
        Write-Output "Results saved to: $OutputFile"
    } else {
        List-FilesBySubdirectory -Directory $fullPath
    }

    Write-Output ""
    Write-Output "Scan completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} catch {
    Write-Error $_.Exception.Message
    exit 1
}