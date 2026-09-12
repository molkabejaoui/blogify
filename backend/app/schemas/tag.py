from pydantic import BaseModel, validator
import bleach

class TagCreate(BaseModel):
    nom: str

    @validator("nom")
    def clean_nom(cls, v):
        return bleach.clean(v, strip=True)
