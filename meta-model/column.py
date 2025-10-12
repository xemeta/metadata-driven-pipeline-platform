from .base import MetaBase


class Column(MetaBase):
    def __init__(
        self,
        identifier: str,
        description: str = "",
        data_type: str = "string",
        nullable: bool = True,
    ):
        super().__init__(identifier, description)
        self.data_type = data_type
        self.nullable = nullable
