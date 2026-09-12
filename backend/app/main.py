from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    auth, articles, commentaires, favoris, 
    categorie, tag, users, enregistrements
)
from fastapi.staticfiles import StaticFiles
from app.routes import contact
import os
from app.routes import dashboard
from app.routes import visiteur
from app.routes import downloads
# --- le point d'entree du projet qui crier et demarer l'application et definir les routes ---
app = FastAPI(
    title="Blogify API",
    description="Backend pour l'application Blogify avec FastAPI",
    version="1.0.0"
)

# --- SERVIR LES FICHIERS STATIQUES (Images uploadées) ---
UPLOAD_DIR = "uploads"

os.makedirs("uploads/articles", exist_ok=True)
os.makedirs("uploads/avatars", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- CONFIGURATION CORS (Pour autoriser React) ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---declarer les routes--
app.include_router(auth)
app.include_router(articles)
app.include_router(commentaires)
app.include_router(favoris)
app.include_router(categorie)
app.include_router(tag)
app.include_router(users)
app.include_router(enregistrements)
app.include_router(contact.router)
app.include_router(dashboard.router)
app.include_router(visiteur.router)
app.include_router(downloads.router)

@app.get("/")
def root():
    return {"message": "Bienvenue sur l'API Blogify"}
