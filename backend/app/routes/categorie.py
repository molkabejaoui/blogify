from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Categorie
from app.core.auth import admin_required

router = APIRouter(prefix="/categorie", tags=["categorie"])

@router.post("/admin/create")
def create_category(nom: str, db: Session = Depends(get_db), admin = Depends(admin_required)):
    cat = Categorie(nom=nom)
    db.add(cat)
    db.commit()
    return {"message": "Catégorie créée"}

@router.get("/")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Categorie).all()
