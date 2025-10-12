from __future__ import annotations

from .base import MetaBase


class Column(MetaBase):
    data_type: str = "string"
    nullable: bool = True
