from __future__ import annotations

from pydantic import Field

from .asset import Asset
from .base import MetaBase
from .column import Column


class Container(MetaBase):
    assets: list[Asset] = Field(default_factory=list)
    columns: list[Column] = Field(default_factory=list)


class GlueCatalogContainer(Container):
    database_name: str = ""
