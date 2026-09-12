from sqlalchemy import Column, Integer, DateTime
from datetime import datetime
from app.database import Base

class Favori(Base):
    __tablename__ = "favori"
    idF = Column(Integer, primary_key=True, index=True)
    utilisateurId = Column(Integer)
    articleId = Column(Integer)
    dateAjout = Column(DateTime, default=datetime.utcnow)
