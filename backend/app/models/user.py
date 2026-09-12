from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base
from datetime import datetime

class Utilisateur(Base):
    __tablename__ = "utilisateur"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255))
    email = Column(String(255), unique=True)
    motDePasse = Column(String(255))
    roleId = Column(Integer)
    avatar = Column(String(255), nullable=True)
    bio = Column(String(500), nullable=True)
    dateInscription = Column(DateTime, default=datetime.utcnow)
