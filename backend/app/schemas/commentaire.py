from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Commentaire, BadWord, PhrasePrete
from app.core.security import get_current_user
import language_tool_python

tool = language_tool_python.LanguageTool("fr-FR")

def corriger_texte(text):
    return tool.correct(text)


router = APIRouter(prefix="/commentaires", tags=["commentaires"])

def clean_text(text: str):
    return text.lower().strip()

@router.post("/create")
def create_commentaire(data: dict, db: Session = Depends(get_db),
                      current_user=Depends(get_current_user)):

    contenu = data["contenu"]
    articleId = data["articleId"]

    # 1) filtrer les bad words
    bad_words = db.query(BadWord).all()
    for bw in bad_words:
        if bw.mot in clean_text(contenu):
            raise HTTPException(status_code=400, detail="Mot interdit détecté")

    # 2) correction simple (à remplacer par un outil réel)
    contenu_corrige = corriger_texte(contenu)
 # (tu peux utiliser LanguageTool plus tard)

    # 3) enregistrer le commentaire
    new_comment = Commentaire(
        contenu=contenu_corrige,
        utilisateurId=current_user.id,
        articleId=articleId
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    # 4) ajouter le texte dans phrase_prete (apprentissage)
    phrase = PhrasePrete(phrase=contenu_corrige)
    db.add(phrase)
    db.commit()

    return {"message": "Commentaire ajouté", "id": new_comment.idCmm}


@router.get("/suggestions")
def suggestions(db: Session = Depends(get_db)):
    phrases = db.query(PhrasePrete).limit(20).all()
    return [p.phrase for p in phrases]
