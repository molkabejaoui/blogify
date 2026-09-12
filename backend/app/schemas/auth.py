from pydantic import BaseModel, EmailStr, constr

class LoginSchema(BaseModel):
    email: EmailStr
    motDePasse: constr(min_length=6)

class RegisterSchema(BaseModel):
    nom: constr(max_length=50)
    email: EmailStr
    motDePasse: constr(min_length=6)
