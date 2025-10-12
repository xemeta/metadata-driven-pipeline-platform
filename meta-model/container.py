from .asset import Asset
from .base import MetaBase
from .column import Column


class Container(MetaBase):
    def __init__(
        self,
        identifier: str,
        description: str = "",
        assets: list[Asset] = None,
        columns: list[Column] = None,
    ):
        super().__init__(identifier, description)
        self.assets = assets if assets is not None else []
        self.columns = columns if columns is not None else []


class GlueCatalogContainer(Container):
    def __init__(
        self,
        identifier: str,
        description: str = "",
        database_name: str = "",
        assets: list[Asset] = None,
        columns: list[Column] = None,
    ):
        super().__init__(identifier, description, assets, columns)
        self.database_name = database_name
