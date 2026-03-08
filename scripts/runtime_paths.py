#!/usr/bin/env python3
"""Shared OpenClaw runtime path resolution for default and isolated installs."""

from __future__ import annotations

import os
from pathlib import Path


def profile_name() -> str | None:
    value = os.environ.get("OPENCLAW_PROFILE", "").strip()
    return value or None


def state_dir() -> Path:
    value = os.environ.get("OPENCLAW_STATE_DIR", "").strip()
    if value:
        return Path(value).expanduser()
    return Path.home() / ".openclaw"


def config_path() -> Path:
    value = os.environ.get("OPENCLAW_CONFIG_PATH", "").strip()
    if value:
        return Path(value).expanduser()
    return state_dir() / "openclaw.json"


def workspace_path(agent_id: str) -> Path:
    return state_dir() / f"workspace-{agent_id}"


def agents_root() -> Path:
    return state_dir() / "agents"


def is_isolated_runtime() -> bool:
    default_state = Path.home() / ".openclaw"
    return (
        state_dir() != default_state
        or config_path() != default_state / "openclaw.json"
        or profile_name() is not None
    )
