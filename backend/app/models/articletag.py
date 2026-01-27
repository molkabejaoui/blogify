from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base

class ArticleTag(Base):
    __tablename__ = "articletag"
    idArTag = Column(Integer, primary_key=True, index=True)
    articleId = Column(Integer, ForeignKey("article.idAr"))
    tagId = Column(Integer, ForeignKey("tag.idT"))
