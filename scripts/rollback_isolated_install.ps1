param(
    [string]$StateDir = "$PSScriptRoot\..\runtime\isolated-openclaw",
    [switch]$Pristine
)

function Resolve-RepoPath([string]$InputPath) {
    if ([string]::IsNullOrWhiteSpace($InputPath)) {
        return ""
    }
    $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
    if ([System.IO.Path]::IsPathRooted($InputPath)) {
        return [System.IO.Path]::GetFullPath($InputPath)
    }
    return [System.IO.Path]::GetFullPath((Join-Path $repoRoot $InputPath))
}

$resolvedStateDir = Resolve-RepoPath $StateDir
$manifestPath = Join-Path $resolvedStateDir "edict-install-manifest.json"

if (-not (Test-Path $manifestPath)) {
    throw "Manifest not found: $manifestPath"
}

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

if ($manifest.configBackup -and (Test-Path $manifest.configBackup)) {
    Copy-Item $manifest.configBackup $manifest.configPath -Force
}

$workspaceDirs = Get-ChildItem -Path $resolvedStateDir -Directory -Filter "workspace-*" -ErrorAction SilentlyContinue
foreach ($workspace in $workspaceDirs) {
    Remove-Item $workspace.FullName -Recurse -Force
}

if ($manifest.createdWorkspaces) {
    foreach ($workspace in $manifest.createdWorkspaces) {
        if (Test-Path $workspace) {
            Remove-Item $workspace -Recurse -Force
        }
    }
}

$agentsDir = Join-Path $resolvedStateDir "agents"
if (Test-Path $agentsDir) {
    Remove-Item $agentsDir -Recurse -Force
}

if ($Pristine) {
    Remove-Item $resolvedStateDir -Recurse -Force
    Write-Output "Rollback complete."
    Write-Output "Pristine cleanup removed: $resolvedStateDir"
    exit 0
}

Write-Output "Rollback complete."
Write-Output "Config restored: $($manifest.configBackup)"
Write-Output "State dir preserved: $resolvedStateDir"
