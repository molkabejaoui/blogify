from sqlalchemy import Column, Integer, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class Favori(Base):
    __tablename__ = "favori"
    idF = Column(Integer, primary_key=True, index=True)
    utilisateurId = Column(Integer, ForeignKey("utilisateur.id"))
    articleId = Column(Integer, ForeignKey("article.idAr"))
    dateAjout = Column(DateTime, default=datetime.utcnow)
