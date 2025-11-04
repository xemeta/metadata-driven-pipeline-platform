from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class STAGE_NAME(Enum):
    DEV = "dev"
    STAGING = "staging"
    PROD = "prod"
    TST = "tst"


class PipeOverride(BaseModel):
    """Class representing an override for a pipe configuration."""

    sources: Optional[Dict[str, Dict[str, Any]]] = {}
    containers: Optional[Dict[str, Dict[str, Any]]] = {}


class PipeConfig(BaseModel):
    """Class representing the configuration for a pipe."""

    excluded_pipes: List[str] = []
    excluded_sources: List[str] = []
    excluded_containers: List[str] = []
    pipe_overrides: Dict[str, PipeOverride] = {}


class StageConfig(BaseModel):
    """Class representing the configuration for an implementation stage."""

    dev: Optional[PipeConfig] = None
    staging: Optional[PipeConfig] = None
    prod: Optional[PipeConfig] = None
    tst: Optional[PipeConfig] = None


class PipelineConfig(BaseModel):
    """Class representing the overall pipeline configuration."""

    pipe: Optional[Dict[str, StageConfig]] = {}
