from pydantic import BaseModel

class FavoriCreate(BaseModel):
    articleId: int
