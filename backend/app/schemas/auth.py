from pydantic import BaseModel

class LoginSchema(BaseModel):
    email: str
    motDePasse: str

class RegisterSchema(BaseModel):
    nom: str
    email: str
    motDePasse: str
