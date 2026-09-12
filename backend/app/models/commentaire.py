from sqlalchemy import Column, Integer, Text, DateTime
from datetime import datetime
from app.database import Base

class Commentaire(Base):
    __tablename__ = "commentaire"
    idCmm = Column(Integer, primary_key=True, index=True)
    contenu = Column(Text)
    dateCommentaire = Column(DateTime, default=datetime.utcnow)
    utilisateurId = Column(Integer)
    articleId = Column(Integer)
    parentId = Column(Integer, default=0)
