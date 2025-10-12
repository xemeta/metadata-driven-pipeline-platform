from __future__ import annotations

from pydantic import Field

from .base import MetaBase
from .container import Container


class Pipe(MetaBase):
    source: Container | None = None
    target: Container | None = None
    transformations: list[str] = Field(default_factory=list)
