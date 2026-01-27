from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Favori, Article
from app.core.auth import get_current_user

router = APIRouter(prefix="/favoris", tags=["favoris"])


@router.post("/add/{article_id}")
def add_favorite(
    article_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # 1️⃣ Vérifier si l'utilisateur est connecté
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Vous devez être connecté pour ajouter aux favoris"
        )

    # 2️⃣ Vérifier si l'article existe
    article = db.query(Article).filter(
        Article.idAr == article_id,
        Article.estPublie == True
    ).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    # 3️⃣ Vérifier si déjà dans les favoris
    existing = db.query(Favori).filter(
        Favori.utilisateurId == user.id,
        Favori.articleId == article_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Déjà ajouté aux favoris"
        )

    # 4️⃣ Ajouter aux favoris
    fav = Favori(utilisateurId=user.id, articleId=article_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)

    return {"message": "Ajouté aux favoris"}


@router.get("/")
def get_favorites(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Vous devez être connecté"
        )

    return db.query(Favori).filter(Favori.utilisateurId == user.id).all()
