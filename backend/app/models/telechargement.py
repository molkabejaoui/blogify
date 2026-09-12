from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class telechargement(Base):
    __tablename__ = "telechargement"

    id = Column(Integer, primary_key=True, index=True)

    article_id = Column(Integer, ForeignKey("article.idAr"), nullable=False)  # article sans s
    user_id = Column(Integer, ForeignKey("utilisateur.id"), nullable=True)   # utilisateur sans s

    created_at = Column(DateTime(timezone=True), server_default=func.now())
