# app/routes/visiteur.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from sqlalchemy import text,extract
from app.models.telechargement import telechargement

# Importer exactement depuis vos fichiers modèles
from app.models.user import Utilisateur
from app.models.article import Article
from app.models.favori import Favori
from app.models.enregistrement import Enregistrement

from app.core.auth import get_current_user, is_admin

router = APIRouter(
    prefix="/admin/dashboard",
    tags=["dashboard"]
)

# --- copier les statistiques  ---
@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Accès refusé")

    total_users = db.query(Utilisateur).count()
    total_articles = db.query(Article).count()
    total_views = db.query(func.sum(Article.vues)).scalar() or 0
    total_likes = db.query(Favori).count()
    total_saves = db.query(Enregistrement).count()
    total_downloads = db.query(telechargement).count()

    return {
        "totalUsers": total_users,
        "totalArticles": total_articles,
        "totalViews": total_views,
        "totalLikes": total_likes,
        "totalSaves": total_saves,
        "totalDownloads": total_downloads
    }

# --- envoyer les UTILISATEURS PAR MOIS ---
@router.get("/users-by-month")
def users_by_month(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Accès refusé")

    results = (
        db.query(
            extract('year', Utilisateur.dateInscription).label("year"),
            extract('month', Utilisateur.dateInscription).label("month"),
            func.count(Utilisateur.id).label("count")
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    # Créer "YYYY-MM" côté Python
    data = [{"month": f"{int(r.year)}-{int(r.month):02}", "count": r.count} for r in results]
    return data

# --- TOP ARTICLES AVEC DOWNLOADS ---
@router.get("/top-articles")
def top_articles(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Accès refusé")

    # Articles les plus vus
    most_viewed = db.query(Article).order_by(Article.vues.desc()).limit(5).all()

    # Articles les plus likés
    most_liked = (
        db.query(
            Article,
            func.count(Favori.idF).label("likes")
        )
        .join(Favori, Favori.articleId == Article.idAr)
        .group_by(Article.idAr)
        .order_by(func.count(Favori.idF).desc())
        .limit(5)
        .all()
    )

    # Articles les plus enregistrés
    most_saved = (
        db.query(
            Article,
            func.count(Enregistrement.idEn).label("saves")
        )
        .join(Enregistrement, Enregistrement.articleId == Article.idAr)
        .group_by(Article.idAr)
        .order_by(func.count(Enregistrement.idEn).desc())
        .limit(5)
        .all()
    )

    # Articles les plus téléchargés
    from app.models.telechargement import Telechargement
    most_downloaded = (
        db.query(
            Article,
            func.count(Telechargement.id).label("downloads")
        )
        .join(Telechargement, Telechargement.article_id == Article.idAr)
        .group_by(Article.idAr)
        .order_by(func.count(Telechargement.id).desc())
        .limit(5)
        .all()
    )

    return {
        "mostViewed": [{"id": a.idAr, "titre": a.titre, "vues": a.vues} for a in most_viewed],
        "mostLiked": [{"id": a.Article.idAr, "titre": a.Article.titre, "count": a.likes} for a in most_liked],
        "mostSaved": [{"id": a.Article.idAr, "titre": a.Article.titre, "count": a.saves} for a in most_saved],
        "mostDownloaded": [{"id": a.Article.idAr, "titre": a.Article.titre, "count": a.downloads} for a in most_downloaded]
    }
