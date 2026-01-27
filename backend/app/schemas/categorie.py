from pydantic import BaseModel

class CategorieCreate(BaseModel):
    nom: str

class CategorieOut(BaseModel):
    idC: int
    nom: str

    class Config:
        from_attributes = True

