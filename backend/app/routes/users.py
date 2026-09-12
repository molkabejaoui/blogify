from fastapi import APIRouter, Depends, HTTPException , UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Utilisateur
from app.core.auth import get_current_user
import shutil
import os
import bleach
from pathlib import Path
# bleach permet de netoiyer les entree http pour eviter les attaque xss

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    return db.query(Utilisateur).all()

@router.get("/{id}")
def get_user(id: int, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user

@router.put("/me")
def update_profile(
    bio: str = Form(None),
    remove_avatar: bool = Form(False),   # ✅ BOOL
    avatar: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    if bio is not None:
        current_user.bio = bleach.clean(bio, strip=True) 

    if remove_avatar is True:
        current_user.avatar = None

    if avatar:
        upload_dir = "uploads/avatars"
        os.makedirs(upload_dir, exist_ok=True)

        safe_filename = Path(avatar.filename).name  # <-- sécurité chemin
        filename = f"{current_user.id}_{safe_filename}"
        file_path = os.path.join(upload_dir, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)

        current_user.avatar = f"/uploads/avatars/{filename}"

    db.commit()
    db.refresh(current_user)

    # ✅ RETOUR JSON PROPRE
    return {
        "id": current_user.id,
        "nom": current_user.nom,
        "email": current_user.email,
        "avatar": current_user.avatar,
        "bio": current_user.bio,
    }