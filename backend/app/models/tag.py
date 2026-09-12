from sqlalchemy import Column, Integer, String
from app.database import Base

class Tag(Base):
    __tablename__ = "tag"
    idT = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), unique=True, index=True)
