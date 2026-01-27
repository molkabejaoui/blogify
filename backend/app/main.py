from fastapi import FastAPI
from app.database import Base, engine
from app.routes import auth, articles, commentaires, favoris, categorie, tag
from app.routes.articles import router as articlerouter
# Créer les tables automatiquement si elles n'existent pas
Base.metadata.create_all(bind=engine)
import uvicorn


app = FastAPI(title="Blogify - Backend")
#cree l'application fastapi

# Routers
app.include_router(auth.router)
app.include_router(articlerouter)
app.include_router(commentaires.router)
app.include_router(favoris.router)
app.include_router(categorie.router)
app.include_router(tag.router)
#importer tout les routes 


@app.get("/")
def root():
    return {"message": "Bienvenue sur Blogify"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)

