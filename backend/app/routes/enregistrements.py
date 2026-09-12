from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.enregistrement import Enregistrement
from app.models.article import Article
from app.core.auth import get_current_user

router = APIRouter(prefix="/enregistrements", tags=["enregistrements"])
#enregistrer un article pour un utilisateur connecté et permet de retirer l'enregistrement si il existe deja
@router.post("/toggle/{article_id}")
def toggle_save(article_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # 1. Vérifier si l'article existe
    article = db.query(Article).filter(Article.idAr == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    # 2. Chercher si déjà enregistré
    existing = db.query(Enregistrement).filter(
        Enregistrement.utilisateurId == user.id,
        Enregistrement.articleId == article_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed", "message": "Enregistrement supprimé"}
    else:
        new_save = Enregistrement(utilisateurId=user.id, articleId=article_id)
        db.add(new_save)
        db.commit()
        return {"status": "added", "message": "Article enregistré"}

@router.get("/")
def get_user_saves(db: Session = Depends(get_db), user=Depends(get_current_user)):
    saves = db.query(Enregistrement).filter(Enregistrement.utilisateurId == user.id).all()
    
    # Inclure les informations de l'article complet
    result = []
    for s in saves:
        article = db.query(Article).filter(Article.idAr == s.articleId).first()
        if article:
            result.append(article)
    return result
