"""Singleton catalog for pipe definitions."""

from __future__ import annotations

from threading import Lock
from typing import TYPE_CHECKING

if TYPE_CHECKING:  # pragma: no cover
    from meta_model import Pipe


class PipeCatalog:
    """Singleton managing access to pipeline definitions."""

    _instance: PipeCatalog | None = None
    _lock: Lock = Lock()

    def __new__(cls) -> PipeCatalog:
        if cls._instance is not None:
            return cls._instance
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._catalog: dict[str, "Pipe"] = {}
        return cls._instance

    @classmethod
    def instance(cls) -> PipeCatalog:
        """Return the singleton instance explicitly."""

        return cls()

    def add(self, pipe: "Pipe") -> None:
        """Add a pipe to the catalog."""

        if pipe.identifier in self._catalog:
            msg = f"Pipe with identifier '{pipe.identifier}' already registered"
            raise ValueError(msg)
        self._catalog[pipe.identifier] = pipe

    def remove(self, identifier: str) -> None:
        """Remove a pipe from the catalog by identifier."""

        if identifier not in self._catalog:
            msg = f"Pipe with identifier '{identifier}' not found"
            raise KeyError(msg)
        del self._catalog[identifier]


__all__ = ["PipeCatalog"]
