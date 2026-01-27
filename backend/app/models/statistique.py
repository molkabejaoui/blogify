from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base

class Statistiques(Base):
    __tablename__ = "statistiques"
    idStat = Column(Integer, primary_key=True, index=True)
    articleId = Column(Integer, ForeignKey("article.idAr"))
    vues = Column(Integer, default=0)
    nbCommentaires = Column(Integer, default=0)
    tempsLecture = Column(Integer, default=0)
