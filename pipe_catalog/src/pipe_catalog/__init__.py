"""Pipe catalog package exposing the singleton catalog."""

from __future__ import annotations

from typing import TYPE_CHECKING

from .catalog import PipeCatalog

if TYPE_CHECKING:  # pragma: no cover - for typing only
    from meta_model import Pipe


def register_pipe(pipe: "Pipe", stage: str) -> None:
    """Register a pipe for a specific stage using the singleton catalog."""

    PipeCatalog.instance().add(pipe, stage)


def remove_pipe(identifier: str, stage: str) -> None:
    """Remove a stage-specific pipe from the singleton catalog."""

    PipeCatalog.instance().remove(identifier, stage)


__all__ = ["PipeCatalog", "register_pipe", "remove_pipe"]
