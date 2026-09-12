from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Utilisateur, Role
from app.schemas.auth import LoginSchema, RegisterSchema
from app.core.auth import create_access_token
from app.core.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
def me(user=Depends(get_current_user)):
    return user

@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    existing = db.query(Utilisateur).filter(Utilisateur.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # par défaut role = user (roleId=2)
    user_role = db.query(Role).filter(Role.nom == "user").first()
    if not user_role:
        user_role = Role(nom="user")
        db.add(user_role)
        db.commit()
        db.refresh(user_role)

    user = Utilisateur(
        nom=data.nom,
        email=data.email,
        motDePasse=data.motDePasse,
        roleId=user_role.idR
    )
    db.add(user)
    db.commit()
    return {"message": "Utilisateur créé"}

@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(
        Utilisateur.email == data.email,
        Utilisateur.motDePasse == data.motDePasse
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Identifiants invalides")

    token = create_access_token({"user_id": user.id, "role": user.roleId})

    return {"access_token": token, "token_type": "bearer"}
