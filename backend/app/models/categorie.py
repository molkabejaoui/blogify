from sqlalchemy import Column, Integer, String
from app.database import Base

class Categorie(Base):
    __tablename__ = "categorie"
    idC = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100))
