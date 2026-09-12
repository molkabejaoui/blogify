from sqlalchemy import Column, Integer, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class Enregistrement(Base):
    __tablename__ = "enregistrements"
    idEn = Column(Integer, primary_key=True, index=True)
    # Il est préférable de mettre le type exact ou une ForeignKey si possible
    utilisateurId = Column(Integer, ForeignKey("utilisateur.id"), nullable=False)
    articleId = Column(Integer, ForeignKey("article.idAr"), nullable=False)
    dateEnregistrement = Column(DateTime, default=datetime.utcnow)