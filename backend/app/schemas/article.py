from pydantic import BaseModel, Field
from typing import List, Optional

class ArticleCreate(BaseModel):
    titre: str
    contenu: str
    categorieNom: str
    tags: list[str] = []

class ArticleUpdate(BaseModel):
    titre: Optional[str] = None
    contenu: Optional[str] = None
    estPublie: Optional[bool] = None
