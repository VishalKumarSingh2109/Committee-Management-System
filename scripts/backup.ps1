# Committee Management System - MySQL backup script (Windows)
#
# Usage: right-click and "Run with PowerShell", or run manually:
#   powershell -ExecutionPolicy Bypass -File backup.ps1
#
# Reads DB credentials from server\.env so you don't repeat them here.
# Keeps the last 14 daily backups automatically; older ones are deleted.

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $scriptDir "..\server\.env"
$backupDir = Join-Path $scriptDir "..\backups"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# --- Read DB_* values out of server/.env ---
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([A-Z_]+)\s*=\s*(.*)\s*$') {
        $envVars[$matches[1]] = $matches[2]
    }
}

$dbName = $envVars["DB_NAME"]
$dbUser = $envVars["DB_USER"]
$dbPass = $envVars["DB_PASSWORD"]
$dbHost = $envVars["DB_HOST"]
$dbPort = $envVars["DB_PORT"]

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$outFile = Join-Path $backupDir "$dbName-$timestamp.sql"

Write-Host "Backing up '$dbName' to $outFile ..."

# Requires mysqldump to be on PATH (installed alongside MySQL Server / Workbench).
$env:MYSQL_PWD = $dbPass
& mysqldump --host=$dbHost --port=$dbPort --user=$dbUser $dbName | Out-File -Encoding utf8 $outFile
Remove-Item Env:\MYSQL_PWD

Write-Host "Backup complete: $outFile"

# --- Delete backups older than 14 days ---
Get-ChildItem $backupDir -Filter "*.sql" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-14) } |
    Remove-Item -Force

Write-Host "Old backups (14+ days) cleaned up."
