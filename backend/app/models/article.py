from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Article(Base):
    __tablename__ = "article"
    idAr = Column(Integer, primary_key=True, index=True)
    titre = Column(String(255))
    contenu = Column(Text)
    image = Column(String(255), nullable=True)
    datePublication = Column(DateTime, default=datetime.utcnow)
    utilisateurId = Column(Integer, ForeignKey("utilisateur.id"))
    vues = Column(Integer, default=0)
    lectureMoyenne = Column(Integer, default=0)
    estPublie = Column(Boolean, default=False)
