from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Commentaire, Article
from app.core.auth import get_current_user, admin_required

router = APIRouter(prefix="/commentaires", tags=["commentaires"])


@router.post("/add/{article_id}")
def add_comment(
    article_id: int,
    contenu: str,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # ❌ Si l'utilisateur n'est pas connecté
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Vous devez être connecté pour commenter"
        )

    # 🔍 Vérifier si l'article existe et est publié
    article = db.query(Article).filter(
        Article.idAr == article_id,
        Article.estPublie == True
    ).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    # 📝 Ajouter le commentaire
    comment = Commentaire(
        contenu=contenu,
        dateCommentaire=datetime.utcnow(),
        utilisateurId=user.id,
        articleId=article_id
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {"message": "Commentaire ajouté"}


@router.get("/admin/all")
def get_all_comments(
    db: Session = Depends(get_db),
    admin = Depends(admin_required)
):
    return db.query(Commentaire).all()
