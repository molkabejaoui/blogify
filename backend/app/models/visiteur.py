from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class Visiteur(Base):
    __tablename__ = "visiteur"

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String(45), nullable=True)          # IP du visiteur
    userAgent = Column(String(255), nullable=True)  # navigateur ou device
    dateVisite = Column(DateTime(timezone=True), server_default=func.now())
