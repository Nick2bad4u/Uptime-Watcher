@echo off
REM Batch wrapper for rename-copilotmd-files.ps1
REM This allows easy execution without needing to change PowerShell execution policy

echo 🔄 Renaming .copilotmd files to .md files in docs folder...
echo.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0rename-copilotmd-files.ps1" %*

echo.
echo ✅ Script execution completed.
pause
