from pydantic import BaseModel


class MetaBase(BaseModel):
    identifier: str
    description: str = ""
