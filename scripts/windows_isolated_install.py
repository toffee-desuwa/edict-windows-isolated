#!/usr/bin/env python3
"""Create an isolated Windows Edict install without touching the main OpenClaw runtime."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import shutil
from pathlib import Path


BASE = Path(__file__).resolve().parent.parent
AGENTS_DIR = BASE / "agents"
DATA_DIR = BASE / "data"
AGENT_IDS = [
    "taizi",
    "zhongshu",
    "menxia",
    "shangshu",
    "hubu",
    "libu",
    "bingbu",
    "xingbu",
    "gongbu",
    "libu_hr",
    "zaochao",
]
AGENT_DEFS = [
    {"id": "taizi", "subagents": {"allowAgents": ["zhongshu"]}},
    {"id": "zhongshu", "subagents": {"allowAgents": ["menxia", "shangshu"]}},
    {"id": "menxia", "subagents": {"allowAgents": ["shangshu", "zhongshu"]}},
    {"id": "shangshu", "subagents": {"allowAgents": ["zhongshu", "menxia", "hubu", "libu", "bingbu", "xingbu", "gongbu", "libu_hr"]}},
    {"id": "hubu", "subagents": {"allowAgents": ["shangshu"]}},
    {"id": "libu", "subagents": {"allowAgents": ["shangshu"]}},
    {"id": "bingbu", "subagents": {"allowAgents": ["shangshu"]}},
    {"id": "xingbu", "subagents": {"allowAgents": ["shangshu"]}},
    {"id": "gongbu", "subagents": {"allowAgents": ["shangshu"]}},
    {"id": "libu_hr", "subagents": {"allowAgents": ["shangshu"]}},
    {"id": "zaochao", "subagents": {"allowAgents": []}},
]
AGENTS_MD = """# AGENTS.md

1. Acknowledge the task before acting.
2. Include task ID, result, evidence paths, and blockers in replies.
3. Route cross-agent coordination through Shangshu unless explicitly instructed otherwise.
4. Flag destructive or external actions clearly before execution.
"""


def read_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Install Edict into an isolated OpenClaw runtime on Windows")
    parser.add_argument("--state-dir", required=True, help="Target isolated OpenClaw state directory")
    parser.add_argument("--config-path", help="Target isolated openclaw.json path (default: <state-dir>\\openclaw.json)")
    parser.add_argument("--seed-config", help="Optional source config to copy before agent registration")
    parser.add_argument("--profile", default="edict-win-mvp", help="Optional OpenClaw profile name to record in the manifest")
    return parser


def create_workspaces(state_dir: Path) -> list[str]:
    created = []
    for agent_id in AGENT_IDS:
        workspace = state_dir / f"workspace-{agent_id}"
        workspace.mkdir(parents=True, exist_ok=True)
        (workspace / "skills").mkdir(exist_ok=True)
        soul_src = AGENTS_DIR / agent_id / "SOUL.md"
        if soul_src.exists():
            soul_text = soul_src.read_text(encoding="utf-8", errors="ignore").replace("__REPO_DIR__", str(BASE))
            (workspace / "SOUL.md").write_text(soul_text, encoding="utf-8")
        (workspace / "AGENTS.md").write_text(AGENTS_MD, encoding="utf-8")
        created.append(str(workspace))
    return created


def register_agents(config_path: Path, state_dir: Path) -> tuple[int, Path | None]:
    config_backup = None
    if config_path.exists():
        stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
        config_backup = config_path.with_name(f"{config_path.name}.bak.edict-{stamp}")
        shutil.copy2(config_path, config_backup)

    cfg = read_json(config_path, {})
    agents_cfg = cfg.setdefault("agents", {})
    agents_cfg.setdefault("defaults", {})
    agents_list = agents_cfg.setdefault("list", [])
    existing = {agent.get("id") for agent in agents_list if isinstance(agent, dict)}

    added = 0
    for agent in AGENT_DEFS:
        agent_id = agent["id"]
        if agent_id in existing:
            continue
        entry = {
            "id": agent_id,
            "workspace": str(state_dir / f"workspace-{agent_id}"),
            **{k: v for k, v in agent.items() if k != "id"},
        }
        agents_list.append(entry)
        added += 1

    write_json(config_path, cfg)
    return added, config_backup


def init_data() -> list[str]:
    DATA_DIR.mkdir(exist_ok=True)
    created = []
    files = {
        "live_status.json": {},
        "agent_config.json": {},
        "model_change_log.json": [],
        "last_model_change_result.json": {},
        "officials_stats.json": {},
        "sync_status.json": {},
        "pending_model_changes.json": [],
    }
    for name, payload in files.items():
        path = DATA_DIR / name
        if not path.exists():
            write_json(path, payload)
            created.append(str(path))

    tasks_path = DATA_DIR / "tasks_source.json"
    if not tasks_path.exists():
        write_json(tasks_path, [])
        created.append(str(tasks_path))
    return created


def write_manifest(state_dir: Path, config_path: Path, profile: str, created_workspaces: list[str], created_data: list[str], config_backup: Path | None, agents_added: int) -> Path:
    manifest = {
        "installedAt": dt.datetime.now().isoformat(),
        "repoRoot": str(BASE),
        "profile": profile,
        "stateDir": str(state_dir),
        "configPath": str(config_path),
        "configBackup": str(config_backup) if config_backup else None,
        "createdWorkspaces": created_workspaces,
        "createdDataFiles": created_data,
        "agentsAdded": agents_added,
    }
    manifest_path = state_dir / "edict-install-manifest.json"
    write_json(manifest_path, manifest)
    return manifest_path


def main() -> None:
    args = build_parser().parse_args()
    state_dir = Path(args.state_dir).expanduser().resolve()
    config_path = Path(args.config_path).expanduser().resolve() if args.config_path else state_dir / "openclaw.json"
    seed_config = Path(args.seed_config).expanduser().resolve() if args.seed_config else None

    state_dir.mkdir(parents=True, exist_ok=True)
    if seed_config and not config_path.exists():
        shutil.copy2(seed_config, config_path)

    created_workspaces = create_workspaces(state_dir)
    agents_added, config_backup = register_agents(config_path, state_dir)
    created_data = init_data()
    manifest_path = write_manifest(state_dir, config_path, args.profile, created_workspaces, created_data, config_backup, agents_added)

    print(f"State dir: {state_dir}")
    print(f"Config path: {config_path}")
    print(f"Agents added: {agents_added}")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
