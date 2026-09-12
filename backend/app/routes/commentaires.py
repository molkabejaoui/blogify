from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Commentaire, Article , user
from app.core.auth import get_current_user, admin_required
import bleach
from app.core.auth import is_admin

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
    contenu_clean = bleach.clean(contenu, strip=True)  # <-- nettoyage XSS

    comment = Commentaire(
        contenu=contenu_clean,  # <-- utiliser contenu nettoyé
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

#recuperer les commentaire consernant un article specifique
@router.get("/article/{article_id}")
def get_comments_by_article(article_id: int, db: Session = Depends(get_db)):
    return db.query(Commentaire).filter(
        Commentaire.articleId == article_id
    ).all()

@router.delete("/delete/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: user = Depends(get_current_user)

):
    comment = db.query(Commentaire).filter(
        Commentaire.idCmm == comment_id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Commentaire introuvable")

    # 🔐 seul l’auteur ou admin
    if comment.utilisateurId != current_user.id and not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Action non autorisée")

    db.delete(comment)
    db.commit()

    return {"message": "Commentaire supprimé"}

