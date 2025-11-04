from .type import Type


class IcebergDataType(Type):
    data_type: str


class DecimalDataType(IcebergDataType):
    precision: int
    scale: int
