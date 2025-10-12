from __future__ import annotations

from pydantic import Field

from .base import MetaBase


class Asset(MetaBase):
    asset_type: str = "generic"


class DelimitedFileAsset(Asset):
    delimiter: str = ","
    has_header: bool = True
    asset_type: str = "delimited_file"


class ParquetFileAsset(Asset):
    asset_type: str = "parquet_file"


class IcebergTableAsset(Asset):
    table_location: str = Field(default="")
    asset_type: str = "iceberg_table"
