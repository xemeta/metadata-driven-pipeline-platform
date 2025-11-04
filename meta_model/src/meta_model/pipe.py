from __future__ import annotations

from .base import MetaBase
from .container import Container


class Pipe(MetaBase):
    source: Container | None = None
    target: Container | None = None
