from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.telechargement import telechargement  # classe en minuscule
from app.models.article import Article
from app.core.auth import get_current_user
from app.core.auth import is_admin

router = APIRouter(
    prefix="/downloads",
    tags=["downloads"]
)

# --- Ajouter un téléchargement ---
@router.post("/add/{article_id}")
def add_download(article_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Vérifier si l'article existe
    article = db.query(Article).filter(Article.idAr == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    # Vérifier si le téléchargement existe déjà
    existing = db.query(telechargement).filter(
        telechargement.user_id == user.id,
        telechargement.article_id == article_id
    ).first()

    if existing:
        return {"status": "exists", "message": "Téléchargement déjà enregistré"}

    # Ajouter un téléchargement
    download = telechargement(user_id=user.id, article_id=article_id)
    db.add(download)
    db.commit()
    db.refresh(download)

    return {"status": "added", "message": "Téléchargement enregistré", "id": download.id}

# --- Récupérer tous les téléchargements ---
@router.get("/")
def get_downloads(db: Session = Depends(get_db), user=Depends(get_current_user)):
    downloads = db.query(telechargement).filter(telechargement.user_id == user.id).all()
    result = [{"id": d.id, "article_id": d.article_id, "date": d.created_at} for d in downloads]
    return result

# --- Compter les téléchargements par article (pour le dashboard) ---
@router.get("/count")
def count_downloads(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="Accès refusé")
    counts = (
        db.query(telechargement.article_id, func.count(telechargement.id).label("count"))
        .group_by(telechargement.article_id)
        .all()
    )
    return [{"article_id": c.article_id, "count": c.count} for c in counts]