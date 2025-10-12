"""Pipe catalog package exposing the singleton registry."""

from __future__ import annotations

from typing import TYPE_CHECKING

from .catalog import PipeCatalog

if TYPE_CHECKING:  # pragma: no cover - for typing only
    from meta_model.pipe import Pipe


def register_pipe(pipe: "Pipe") -> None:
    """Register a pipe using the singleton catalog."""

    PipeCatalog.instance().register(pipe)


__all__ = ["PipeCatalog", "register_pipe"]
