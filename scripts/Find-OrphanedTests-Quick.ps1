#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick finder for orphaned test files in your project (excludes node_modules).

.DESCRIPTION
    A simplified version of Find-OrphanedTests.ps1 that focuses on project test files only.
    
.EXAMPLE
    .\Find-OrphanedTests-Quick.ps1
    
    Shows project test files outside main test directories.
#>

# Quick execution - just show project orphaned tests
& "$PSScriptRoot\Find-OrphanedTests.ps1" -ShowOnlyProjectTests -OutputFormat Table
