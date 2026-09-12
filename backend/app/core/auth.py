from typing import Optional
from fastapi import Depends, HTTPException, status, Security, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

#gerer le jwk(token)  des utilisateur qui l'envoyer avec chaque requette et la login ,register et les role admin et user

from app.database import get_db
from app.models.user import Utilisateur

ACCESS_TOKEN_EXPIRE_MINUTES = 60
SECRET_KEY = "SECRET123"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=True  # <-- IMPORTANT : on veut une erreur automatique si token manquant
)


def get_current_user(
    token: str = Security(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide ou manquant"
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou manquant"
        )

    user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur introuvable"
        )

    return user


def admin_required(current_user: Utilisateur = Depends(get_current_user)):
    if current_user.roleId != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db)
):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            return None

        return db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    except JWTError:
        return None


def is_admin(user):
    return (
        user.email == "blogify2006@gmail.com"
        or user.id == 1
        or user.roleId == 1
    )

def get_current_admin(user=Depends(get_current_user)):
    if not is_admin(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé à l'administrateur"
        )
    return user