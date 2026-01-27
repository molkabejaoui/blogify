from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    nom: str
    email: EmailStr
    motDePasse: str


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
