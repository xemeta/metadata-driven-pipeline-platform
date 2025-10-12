from .base import MetaBase


class Asset(MetaBase):
    def __init__(self, identifier: str, description: str = "", asset_type: str = "generic"):
        super().__init__(identifier, description)
        self.asset_type = asset_type


class DelimitedFileAsset(Asset):
    def __init__(
        self, identifier: str, description: str = "", delimiter: str = ",", has_header: bool = True
    ):
        super().__init__(identifier, description)
        self.delimiter = delimiter
        self.has_header = has_header


class ParquetFileAsset(Asset):
    def __init__(self, identifier: str, description: str = ""):
        super().__init__(identifier, description)


class IcebergTableAsset(Asset):
    def __init__(self, identifier: str, description: str = "", table_location: str = ""):
        super().__init__(identifier, description)
        self.table_location = table_location
