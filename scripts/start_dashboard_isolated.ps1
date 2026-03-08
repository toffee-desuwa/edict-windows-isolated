param(
    [string]$StateDir = "$PSScriptRoot\..\runtime\isolated-openclaw",
    [string]$ConfigPath = "",
    [string]$Profile = "edict-win-mvp",
    [string]$DashboardHost = "127.0.0.1",
    [int]$Port = 7891
)

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
function Resolve-RepoPath([string]$InputPath) {
    if ([string]::IsNullOrWhiteSpace($InputPath)) {
        return ""
    }
    if ([System.IO.Path]::IsPathRooted($InputPath)) {
        return [System.IO.Path]::GetFullPath($InputPath)
    }
    return [System.IO.Path]::GetFullPath((Join-Path $repoRoot $InputPath))
}

$resolvedStateDir = Resolve-RepoPath $StateDir
if ([string]::IsNullOrWhiteSpace($ConfigPath)) {
    $resolvedConfigPath = Join-Path $resolvedStateDir "openclaw.json"
} else {
    $resolvedConfigPath = Resolve-RepoPath $ConfigPath
}
if ([string]::IsNullOrWhiteSpace($DashboardHost)) {
    $DashboardHost = "127.0.0.1"
}

$env:OPENCLAW_STATE_DIR = $resolvedStateDir
$env:OPENCLAW_CONFIG_PATH = $resolvedConfigPath
$env:OPENCLAW_PROFILE = $Profile

python (Join-Path $repoRoot "scripts\sync_agent_config.py")
python (Join-Path $repoRoot "scripts\sync_officials_stats.py")
python (Join-Path $repoRoot "scripts\refresh_live_data.py")
python (Join-Path $repoRoot "dashboard\server.py") --host $DashboardHost --port $Port
