from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Utilisateur(Base):
    __tablename__ = "utilisateur"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    motDePasse = Column(String(255))
    avatar = Column(String(255), nullable=True)
    dateInscription = Column(DateTime, default=datetime.utcnow)
    roleId = Column(Integer, ForeignKey("role.idR"))
    role = relationship("Role")
