from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Categorie
from app.core.auth import admin_required  # Réactivé
import bleach
router = APIRouter(prefix="/categorie", tags=["categorie"])

@router.post("/admin/create")
def create_category(
    nom: str, 
    db: Session = Depends(get_db),      # Virgule ajoutée ici
    admin = Depends(admin_required)    # Token Admin réactivé
    ):
    # Vérifier si la catégorie existe déjà
    nom_clean = bleach.clean(nom, strip=True)
    if len(nom_clean) > 50:
        raise HTTPException(status_code=400, detail="Nom trop long")

    # Vérifier si la catégorie existe déjà
    existing_cat = db.query(Categorie).filter(Categorie.nom == nom_clean).first()
    if existing_cat:
        raise HTTPException(status_code=400, detail="Cette catégorie existe déjà")

    cat = Categorie(nom=nom_clean)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    
    return {"message": "Catégorie créée par l'admin", "id": cat.idC}

@router.get("/")
def get_categories(db: Session = Depends(get_db)):
    # La lecture reste publique (pas besoin de token ici généralement)
    return db.query(Categorie).all()