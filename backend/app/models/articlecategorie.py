from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base

class ArticleCategorie(Base):
    __tablename__ = "articlecategorie"
    id = Column(Integer, primary_key=True, index=True)
    articleId = Column(Integer, ForeignKey("article.idAr"))
    categorieId = Column(Integer, ForeignKey("categorie.idCat"))
