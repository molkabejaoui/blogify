from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Favori, Article
from app.core.auth import get_current_user 

router = APIRouter(prefix="/favoris", tags=["favoris"])
# met un Article en Favori pour un utilisateur connecté et permet de retirer le favori si il existe deja
@router.post("/toggle/{article_id}")
def toggle_favorite(
    article_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user) # Réactivé
):
    # 1. Vérifier si l'article existe
    article = db.query(Article).filter(Article.idAr == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    # 2. Chercher si le favori existe déjà pour l'utilisateur connecté
    existing = db.query(Favori).filter(
        Favori.utilisateurId == user.id, # Utilisation de user.id du token
        Favori.articleId == article_id
    ).first()

    if existing:
        # SI EXISTE -> ON SUPPRIME (Bien aligné)
        db.delete(existing)
        db.commit()
        return {"status": "removed", "message": "Retiré des favoris"}
    else:
        # SI ABSENT -> ON AJOUTE (Correction de l'indentation ici)
        fav = Favori(utilisateurId=user.id, articleId=article_id)
        db.add(fav)
        db.commit()
        return {"status": "added", "message": "Ajouté aux favoris"}

@router.get("/")
def get_favorites(
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    # Récupère uniquement les articles favoris de l'utilisateur connecté
    favoris = db.query(Article).join(Favori, Favori.articleId == Article.idAr).filter(
        Favori.utilisateurId == user.id
    ).all()
    return favoris