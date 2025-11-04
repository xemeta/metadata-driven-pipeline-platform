from __future__ import annotations

from typing import TYPE_CHECKING

from meta_model.implementation_stage import STAGE_NAME

from .catalog import PipeCatalog

if TYPE_CHECKING:  # pragma: no cover
    from meta_model import Pipe, PipeConfig, PipelineConfig, StageConfig


class StageService:
    """Service for managing stage configurations."""

    def __init__(self, pipeline_config: PipelineConfig, catalog: PipeCatalog | None = None) -> None:
        self.pipeline_config = pipeline_config
        self._catalog = catalog or PipeCatalog.instance()

    def _normalize_stage(self, stage: str) -> str:
        stage_key = stage.lower()
        if stage_key not in STAGE_NAME._value2member_map_:
            msg = f"Unknown stage '{stage}'"
            raise ValueError(msg)
        return stage_key

    def get_stage_config(self, pipe_identifier: str, stage: str) -> StageConfig | None:
        """Retrieve the stage configuration for a given pipe and stage."""

        stage_key = self._normalize_stage(stage)
        if not self.pipeline_config.pipe or pipe_identifier not in self.pipeline_config.pipe:
            return None
        stage_config = self.pipeline_config.pipe[pipe_identifier]
        if getattr(stage_config, stage_key, None) is None:
            return None
        return stage_config

    def get_pipe_config(self, pipe_identifier: str, stage: str) -> PipeConfig | None:
        """Retrieve the pipe configuration for a given pipe and stage."""

        stage_key = self._normalize_stage(stage)
        stage_config = self.get_stage_config(pipe_identifier, stage_key)
        if not stage_config:
            return None
        return getattr(stage_config, stage_key, None)

    def register_pipe(self, pipe: "Pipe", stage: str) -> None:
        """Register the pipe for the specified stage."""

        stage_key = self._normalize_stage(stage)
        self._catalog.add(pipe, stage_key)

    def remove_pipe(self, identifier: str, stage: str) -> None:
        """Remove the pipe registration for the specified stage."""

        stage_key = self._normalize_stage(stage)
        self._catalog.remove(identifier, stage_key)

    def list_registered_pipes(self, stage: str | None = None) -> list[str]:
        """List registered pipes, optionally filtering by stage."""

        if stage is None:
            return self._catalog.list_identifiers()
        stage_key = self._normalize_stage(stage)
        return self._catalog.list_identifiers(stage_key)
