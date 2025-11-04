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
                cls._instance._catalog: dict[str, dict[str, "Pipe"]] = {}  # type: ignore[type-var]
        return cls._instance

    @classmethod
    def instance(cls) -> PipeCatalog:
        """Return the singleton instance explicitly."""

        return cls()

    def add(self, pipe: "Pipe", stage: str) -> None:
        """Add a pipe to the catalog for a specific stage."""

        stage_catalog = self._catalog.setdefault(stage, {})  # type: ignore
        if pipe.identifier in stage_catalog:
            msg = f"Pipe with identifier '{pipe.identifier}' already registered for stage '{stage}'"
            raise ValueError(msg)
        stage_catalog[pipe.identifier] = pipe

    def remove(self, identifier: str, stage: str) -> None:
        """Remove a pipe from the catalog by identifier and stage."""

        if stage not in self._catalog or identifier not in self._catalog[stage]:  # type: ignore
            msg = f"Pipe with identifier '{identifier}' not found for stage '{stage}'"
            raise KeyError(msg)
        del self._catalog[stage][identifier]  # type: ignore
        if not self._catalog[stage]:  # type: ignore
            del self._catalog[stage]  # type: ignore

    def list_identifiers(self, stage: str | None = None) -> list[str]:
        """Return the identifiers of registered pipes for a stage, or all if stage omitted."""

        if stage is None:
            return [
                identifier
                for stage_catalog in self._catalog.values()
                for identifier in stage_catalog
            ]  # type: ignore
        if stage not in self._catalog:  # type: ignore
            return []
        return list(self._catalog[stage].keys())  # type: ignore


__all__ = ["PipeCatalog"]
