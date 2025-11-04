from __future__ import annotations

from typing import List

from pydantic import Field

from .base import MetaBase
from .column import Column

"""
Add all representations of data - structured or unstructured
"""


class Asset(MetaBase):
    # asset_type: str = "generic"
    pass


class DelimitedFileAsset(Asset):
    delimiter: str = ","
    has_header: bool = True
    columns: List[Column] = []
    # asset_type: str = "delimited_file"


class ParquetFileAsset(Asset):
    # asset_type: str = "/parquet_file"
    columns: List[Column] = []


class IcebergTableAsset(Asset):
    table_location: str = Field(default="")
    columns: List[Column] = []
    # asset_type: str = "iceberg_table"
