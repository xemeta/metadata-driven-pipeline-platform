from .base import MetaBase
from .container import Container


class Pipe(MetaBase):
    def __init__(
        self,
        identifier: str,
        description: str = "",
        source: Container = None,
        target: Container = None,
        transformations: list[str] = None,
    ):
        super().__init__(identifier, description)
        self.source = source
        self.target = target
        self.transformations = transformations if transformations is not None else []
