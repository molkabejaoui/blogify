from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Article,
    ArticleCategorie,
    ArticleTag,
    Tag,
    Categorie
)
from app.schemas.article import ArticleCreate, ArticleUpdate
from app.core.auth import admin_required

router = APIRouter(prefix="/articles", tags=["articles"])


# =========================
# ADMIN
# =========================

@router.post("/admin/create")
def create_article(
    data: ArticleCreate,
    db: Session = Depends(get_db),
    admin = Depends(admin_required)  # active la sécurité admin
):
    # 🔥 1) Vérifier si la catégorie existe
    categorie = db.query(Categorie).filter(
        Categorie.nom == data.categorieNom
    ).first()

    # 🔥 2) Si n'existe pas → créer la catégorie automatiquement
    if not categorie:
        categorie = Categorie(nom=data.categorieNom)
        db.add(categorie)
        db.commit()
        db.refresh(categorie)

    # 📝 3) Créer l’article
    article = Article(
        titre=data.titre,
        contenu=data.contenu,
        estPublie=True
    )
    db.add(article)
    db.commit()
    db.refresh(article)

    # 🔗 4) Lier article ↔ catégorie
    article_categorie = ArticleCategorie(
        articleId=article.idAr,
        categorieId=categorie.idC
    )
    db.add(article_categorie)

    # 🏷️ 5) Gérer les tags
    for nom in data.tags:
        tag = db.query(Tag).filter(Tag.nom == nom).first()
        if not tag:
            tag = Tag(nom=nom)
            db.add(tag)
            db.commit()
            db.refresh(tag)

        db.add(
            ArticleTag(
                articleId=article.idAr,
                tagId=tag.idT
            )
        )

    db.commit()
    return {"message": "Article créé avec succès"}


@router.put("/admin/update/{id}")
def update_article(
    id: int,
    data: ArticleUpdate,
    db: Session = Depends(get_db),
    admin = Depends(admin_required)
):
    article = db.query(Article).filter(Article.idAr == id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    if data.titre is not None:
        article.titre = data.titre
    if data.contenu is not None:
        article.contenu = data.contenu
    if data.estPublie is not None:
        article.estPublie = data.estPublie

    db.commit()
    return {"message": "Article modifié avec succès"}


@router.delete("/admin/delete/{id}")
def delete_article(
    id: int,
    db: Session = Depends(get_db),
    admin = Depends(admin_required)
):
    article = db.query(Article).filter(Article.idAr == id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    db.delete(article)
    db.commit()
    return {"message": "Article supprimé avec succès"}


# =========================
# USER
# =========================

@router.get("/")
def get_published_articles(db: Session = Depends(get_db)):
    return db.query(Article).filter(Article.estPublie == True).all()


@router.get("/{id}")
def get_article(id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(
        Article.idAr == id,
        Article.estPublie == True
    ).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    return article


@router.get("/categorie/{idC}")
def get_articles_same_category(idC: int, db: Session = Depends(get_db)):
    liaisons = db.query(ArticleCategorie).filter(
        ArticleCategorie.categorieId == idC
    ).all()

    articles = []
    for liaison in liaisons:
        article = db.query(Article).filter(
            Article.idAr == liaison.articleId,
            Article.estPublie == True
        ).first()
        if article:
            articles.append(article)

    return articles
