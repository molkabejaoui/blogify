from pydantic import BaseModel

class TagCreate(BaseModel):
    nom: str
