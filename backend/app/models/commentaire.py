from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class Commentaire(Base):
    __tablename__ = "commentaire"
    idCmm = Column(Integer, primary_key=True, index=True)
    contenu = Column(Text)
    dateCommentaire = Column(DateTime, default=datetime.utcnow)
    utilisateurId = Column(Integer, ForeignKey("utilisateur.id"))
    articleId = Column(Integer, ForeignKey("article.idAr"))
    parentId = Column(Integer, ForeignKey("commentaire.idCmm"), nullable=True)
