from pydantic import BaseModel, EmailStr
import bleach

class UserCreate(BaseModel):
    nom: str
    email: EmailStr
    motDePasse: str

    @validator("nom")
    def clean_nom(cls, v):
        return bleach.clean(v, strip=True)


class UserLogin(BaseModel):
    email: EmailStr
    motDePasse: str


class UserOut(BaseModel):
    id: int
    nom: str
    email: str
    roleId: int

    class Config:
        orm_mode = True
