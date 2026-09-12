from pydantic import BaseModel, Field
#valider et controler les donnes qui sont envoyer a l'api et qui en sorte de l'api(json)
from typing import List, Optional

class ArticleCreate(BaseModel):
    titre: str = Field(..., max_length=200)
    contenu: str = Field(..., max_length=5000)
    categorieNom: str = Field(..., max_length=50)
    tags: list[str] = []


class ArticleUpdate(BaseModel):
    titre: Optional[str] = None
    contenu: Optional[str] = None
    estPublie: Optional[bool] = None
#le dossier shemas definit comment les donnes son etree et sortie de la api