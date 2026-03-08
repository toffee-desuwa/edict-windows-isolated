# Windows Isolated-Install MVP

This document describes the current **Windows isolated-install MVP** for Edict.

It is not a full Windows port and it does not claim full Windows parity with the macOS/Linux install path. The goal is narrower: make Edict reproducibly installable into an **isolated OpenClaw state/config** on Windows without modifying the user's main `~/.openclaw`.

## Validation Status

Current validation claim:

> **Windows isolated-install MVP, validated locally with two cold-start runs.**

What was actually validated in those local runs:

- isolated install into a repo-local state directory
- isolated dashboard startup against that state directory
- default rollback
- `-Pristine` rollback
- no direct modification of the main `~/.openclaw`

What was not validated here:

- full Windows feature parity
- continuous background sync via `run_loop.sh`
- Feishu integration
- isolated model switching

## Scope

This MVP currently covers:

- creating isolated `workspace-*` directories
- registering Edict agents into a target isolated config
- initializing the repo-local `data/` files required for dashboard startup
- starting the dashboard against the isolated runtime
- rolling back the isolated state with documented cleanup semantics

## Non-Goals

- no full Windows parity
- no Windows port of `scripts/run_loop.sh`
- no Feishu integration
- no isolated-mode model switching
- no direct modification of the main `.openclaw`

## Recommended Paths

Use these repo-local paths for the isolated runtime:

- isolated state dir: `.\runtime\isolated-openclaw`
- isolated config path: `.\runtime\isolated-openclaw\openclaw.json`
- profile name: `edict-win-mvp`

These resolve to absolute paths under the repository root when used with the provided PowerShell scripts.

## Install

Primary install command:

```powershell
python .\scripts\windows_isolated_install.py `
  --state-dir .\runtime\isolated-openclaw `
  --config-path .\runtime\isolated-openclaw\openclaw.json `
  --profile edict-win-mvp
```

Optional seed-config install:

```powershell
python .\scripts\windows_isolated_install.py `
  --state-dir .\runtime\isolated-openclaw `
  --config-path .\runtime\isolated-openclaw\openclaw.json `
  --seed-config C:\path\to\seed-openclaw.json `
  --profile edict-win-mvp
```

Expected result:

- isolated state created under `runtime\isolated-openclaw`
- target config created or updated at `runtime\isolated-openclaw\openclaw.json`
- install manifest written to `runtime\isolated-openclaw\edict-install-manifest.json`
- repo-local dashboard data files created under `.\data\` if missing

## Start

Start the dashboard against the isolated runtime:

```powershell
.\scripts\start_dashboard_isolated.ps1 `
  -StateDir .\runtime\isolated-openclaw `
  -ConfigPath .\runtime\isolated-openclaw\openclaw.json `
  -Profile edict-win-mvp
```

Expected dashboard URL:

```text
http://127.0.0.1:7891
```

Expected startup behavior:

- `OPENCLAW_STATE_DIR` points at the isolated state dir
- `OPENCLAW_CONFIG_PATH` points at the isolated config path
- `OPENCLAW_PROFILE` is set for the isolated session
- startup initializes dashboard data once via:
  - `scripts/sync_agent_config.py`
  - `scripts/sync_officials_stats.py`
  - `scripts/refresh_live_data.py`
- `dashboard/server.py` starts on `127.0.0.1` by default

## Rollback

Default rollback:

```powershell
.\scripts\rollback_isolated_install.ps1 `
  -StateDir .\runtime\isolated-openclaw
```

Default rollback semantics:

- restores the backed-up target config if a config backup exists in the manifest
- removes all `workspace-*` directories under the isolated state dir
- removes `workspace-main` if present
- removes the isolated `agents/` directory
- preserves the isolated state dir itself
- preserves `openclaw.json`
- preserves `edict-install-manifest.json`

Stronger cleanup:

```powershell
.\scripts\rollback_isolated_install.ps1 `
  -StateDir .\runtime\isolated-openclaw `
  -Pristine
```

`-Pristine` semantics:

- reads the manifest first
- removes the entire isolated state dir recursively
- therefore also removes:
  - `agents/`
  - all `workspace-*` directories
  - `workspace-main/`
  - `edict-install-manifest.json`
  - `openclaw.json`

## What Is Not Removed

The rollback scope is intentionally limited to the isolated state directory.

Default rollback does **not** remove:

- the isolated state dir itself
- `openclaw.json`
- `edict-install-manifest.json`
- repo-local `.\data\` files
- any files in the user's main `~/.openclaw`

`-Pristine` does **not** remove:

- repo-local `.\data\` files
- repository source files
- any files in the user's main `~/.openclaw`

## Known Limitations

- `scripts/run_loop.sh` is not ported to Windows in this MVP.
- Feishu integration is not included.
- Model switching is blocked in isolated mode.
- Windows file locking is more conservative than the Unix `fcntl` path. Reads are effectively serialized through the lock file.
- Repo-local `.\data\` files are not cleaned by rollback or by `-Pristine`.
- This MVP is isolated-install only. It is not a claim of full Windows support.

### 11 vs 12 Discrepancy

The repository currently contains **11 Edict agent directories** under `agents/`:

- `taizi`
- `zhongshu`
- `menxia`
- `shangshu`
- `hubu`
- `libu`
- `bingbu`
- `xingbu`
- `gongbu`
- `libu_hr`
- `zaochao`

Some project docs and UI copy still refer to **12 agents**. That count includes a **legacy compatibility role** named `main`, which is not a separate source agent directory in this MVP.

For this Windows isolated-install MVP, the honest interpretation is:

- **11 real Edict agent directories**
- **plus legacy compatibility handling for `main` where required by runtime sync logic**

Do not read the current MVP as shipping 12 separate Windows agent workspaces from 12 source directories.
