import requests
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import shutil
import re  
import os
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.database import get_db
from app.models import Article, ArticleCategorie, ArticleTag, Tag, Categorie, Favori
from app.models.enregistrement import Enregistrement
from app.core.auth import get_current_user, get_current_user_optional,is_admin # Assure-toi d'avoir une version optionnelle
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import asyncio
import bleach
import httpx
import unicodedata

def clean_html(text: str):
    return bleach.clean(text, strip=True)

TUNISIA_TZ = timezone(timedelta(hours=1))

def now_tunisia():
    return datetime.now(TUNISIA_TZ)

router = APIRouter(prefix="/articles", tags=["articles"])

UPLOAD_DIR = "uploads/articles"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


class CorrectionRequest(BaseModel):
    text: str
    mode: str = "full"  # "full" = correction complète | "light" = orthographe seulement


def strip_html_for_ai(text: str) -> str:
    """Retire les balises HTML pour envoyer du texte brut à l'IA."""
    import bleach
    # On strip les balises mais on remplace <br>, <p>, </p> par des sauts de ligne
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<p[^>]*>', '', text, flags=re.IGNORECASE)
    return bleach.clean(text, tags=[], strip=True).strip()

def detect_language(text: str) -> str:
    """Détection simple de la langue dominante."""
    arabic_chars = sum(1 for c in text if '\u0600' <= c <= '\u06FF')
    if arabic_chars > len(text) * 0.2:
        return "arabic"
    # Heuristique simple fr vs en
    fr_markers = ['le ', 'la ', 'les ', 'de ', 'du ', 'est ', 'une ', 'pour ', 'que ', 'dans ']
    fr_count = sum(text.lower().count(m) for m in fr_markers)
    return "french" if fr_count > 3 else "english"


@router.post("/ai-correct")
async def ai_correct(data: CorrectionRequest):
    if not data.text or not data.text.strip():
        return {"corrected": "", "success": False}

    # ✅ FIX 1 : on strip le HTML avant d'envoyer à Groq
    plain_text = strip_html_for_ai(data.text)

    if not plain_text:
        return {"corrected": data.text, "success": False, "error": "Texte vide après nettoyage HTML"}

    # ✅ FIX 2 : détection de langue pour adapter le system prompt
    lang = detect_language(plain_text)

    if lang == "arabic":
        system_prompt = "أنت محرر نصوص محترف. قم بتصحيح الأخطاء الإملائية والنحوية فقط دون تغيير المحتوى. أجب فقط بالنص المصحح."
        lang_label = "arabe"
    elif lang == "english":
        system_prompt = "You are a professional editor. Correct spelling and grammar errors without changing the content or adding new information. Reply ONLY with the corrected text."
        lang_label = "anglais"
    else:
        system_prompt = "Tu es un correcteur et rédacteur professionnel expert en français. Tu corriges les textes avec précision sans jamais inventer de contenu. Tu réponds UNIQUEMENT avec le texte corrigé."
        lang_label = "français"

    if data.mode == "light":
        prompt = f"""Corrige uniquement les fautes d'orthographe et de grammaire de ce texte sans modifier le sens ni la structure. Réponds UNIQUEMENT avec le texte corrigé, sans explication :

{plain_text}"""
    else:
        prompt = f"""Tu es un correcteur professionnel ({lang_label}). Améliore ce texte en :
1. Corrigeant toutes les fautes d'orthographe
2. Corrigeant les fautes de grammaire et de conjugaison
3. Reformulant les phrases mal construites (ex: "le lengaje" → "le langage")
4. Améliorant la cohérence et le sens général
5. Gardant le même style, ton et sujet original
6. Conservant la même structure (paragraphes, titres si présents)

RÈGLES ABSOLUES :
- Ne change PAS le sujet ou le sens global
- Ne supprime PAS d'informations importantes
- Ne rajoute PAS de contenu inventé
- Réponds UNIQUEMENT avec le texte corrigé, sans introduction ni explication

Texte à corriger :
{plain_text}"""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-oss-120b",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 4000,
                    "temperature": 0.3
                }
            )

            if response.status_code == 429:
                return {"corrected": data.text, "error": "Limite de requêtes atteinte. Réessayez dans 1 minute.", "success": False}
            elif response.status_code == 503:
                return {"corrected": data.text, "error": "Service temporairement indisponible. Réessayez.", "success": False}
            elif response.status_code != 200:
                return {"corrected": data.text, "error": f"Erreur API : {response.status_code}", "success": False}

            resp_json = response.json()

            if "choices" not in resp_json or len(resp_json["choices"]) == 0:
                return {"corrected": data.text, "error": "Réponse invalide de l'IA", "success": False}

            full_res = resp_json["choices"][0]["message"]["content"]

            # Nettoyer les balises <think> (chain-of-thought)
            corrected = re.sub(r'<think>.*?</think>', '', full_res, flags=re.DOTALL).strip()

            # Supprimer les introductions parasites
            parasites = [
                r"^(Voici|Voilà) le texte corrigé\s*[:\-]?\s*\n*",
                r"^Texte corrigé\s*[:\-]?\s*\n*",
                r"^Correction\s*[:\-]?\s*\n*",
                r"^(Bien sûr|Certainement|D'accord)[^\n]*\n+",
                r"^Here is the corrected text[:\-]?\s*\n*",
                r"^النص المصحح[:\-]?\s*\n*",
            ]
            for pattern in parasites:
                corrected = re.sub(pattern, '', corrected, flags=re.IGNORECASE).strip()

            return {
                "corrected": corrected,          # ✅ texte brut corrigé
                "original_length": len(plain_text),
                "corrected_length": len(corrected),
                "language_detected": lang,        # ✅ utile pour debug
                "success": True
            }

    except httpx.TimeoutException:
        return {"corrected": data.text, "error": "Délai d'attente dépassé. Réessayez.", "success": False}
    except httpx.RequestError:
        return {"corrected": data.text, "error": "Erreur réseau. Vérifiez votre connexion.", "success": False}
    except Exception:
        return {"corrected": data.text, "error": "Service temporairement indisponible.", "success": False}


@router.get("/")
def get_published_articles(db: Session = Depends(get_db), user=Depends(get_current_user_optional)):
    articles = db.query(Article).filter(Article.estPublie == True).all()
    result = []

    for art in articles:
        # Date de publication
        date_pub = art.ddatePublication or art.dateCreation or now_tunisia()

        # Catégorie
        cat_relation = db.query(ArticleCategorie).filter(ArticleCategorie.articleId == art.idAr).first()
        categorie = None
        if cat_relation:
            cat_obj = db.query(Categorie).filter(Categorie.idC == cat_relation.categorieId).first()
            if cat_obj:
                categorie = cat_obj.nom

        # Tags
        tag_relations = db.query(ArticleTag).filter(ArticleTag.articleId == art.idAr).all()
        tags = []
        for tr in tag_relations:
            tag_obj = db.query(Tag).filter(Tag.idT == tr.tagId).first()
            if tag_obj:
                tags.append(tag_obj.nom)

        # Like / Save
        is_liked = False
        is_saved = False
        if user:
            is_liked = db.query(Favori).filter(Favori.articleId == art.idAr, Favori.utilisateurId == user.id).first() is not None
            is_saved = db.query(Enregistrement).filter(Enregistrement.articleId == art.idAr, Enregistrement.utilisateurId == user.id).first() is not None

        result.append({
            "idAr": art.idAr,
            "titre": art.titre,
            "contenu": art.contenu,
            "image": art.image,
            "vues": art.vues,
            "lectureMoyenne": art.lectureMoyenne,
            "datePublication": date_pub,
            "categorie": categorie,
            "tags": tags,
            "isLiked": is_liked,
            "isSaved": is_saved,
            "utilisateurId": art.utilisateurId
        })

    return result




# --- ROUTE CREATE (ADMIN) ---
@router.post("/create")  # <-- changement ici : plus /admin/create
async def create_article(
    titre: str = Form(...),
    contenu: str = Form(...),
    categorieNom: str = Form(...),
    tags: str = Form(""),  # facultatif pour éviter l'erreur si vide
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)  # tout utilisateur authentifié
):
    if len(titre) < 3:
        raise HTTPException(status_code=400, detail="Titre trop court")
    if len(contenu) < 20:
        raise HTTPException(status_code=400, detail="Contenu trop court")

    # --- Gestion de l'image ---
    image_url = None
    if image:
        file_extension = image.filename.split(".")[-1]
        file_name = f"{now_tunisia().timestamp()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/uploads/articles/{file_name}"

    # --- Calcul du temps de lecture ---
    temps_lecture = max(1, len(contenu.split()) // 200)

    # --- Création de l'article ---
    article = Article(
        titre=clean_html(titre),
        contenu=contenu.strip(),
        image=image_url,
        lectureMoyenne=temps_lecture,
        estPublie=True,
        vues=0,
        utilisateurId=user.id,          
        ddatePublication=now_tunisia()
    )

    db.add(article)
    db.commit()
    db.refresh(article)

    # --- Gestion catégorie ---
    cat = db.query(Categorie).filter(Categorie.nom == categorieNom).first()
    if not cat:
        cat = Categorie(nom=categorieNom)
        db.add(cat)
        db.commit()
        db.refresh(cat)
    db.add(ArticleCategorie(articleId=article.idAr, categorieId=cat.idC))

    # --- Gestion tags ---
    if tags:
        lista_tags = list(set(t.strip().lower() for t in tags.split(",") if t.strip()))

        for t_nom in lista_tags:
            t_obj = db.query(Tag).filter(
                Tag.nom.ilike(t_nom)
            ).first()

            if not t_obj:
                t_obj = Tag(nom=t_nom)
                db.add(t_obj)
                db.commit()
                db.refresh(t_obj)
            db.add(ArticleTag(articleId=article.idAr, tagId=t_obj.idT))

    db.commit()
    return {"message": "Article créé", "id": article.idAr}

# --- ROUTE DETAIL ---
@router.get("/{id}")
def get_article(id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.idAr == id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")
    article.vues += 1
    db.commit()
    db.refresh(article)
    return article

class GenerateRequest(BaseModel):
    titre: str
    categorie: str
    tags: str

from fastapi.responses import StreamingResponse
import requests, json, time


#generation d'article avec ai
@router.post("/ai-generate")
async def ai_generate(data: GenerateRequest):
    async def generate_stream():
        if not data.titre or not data.categorie:
            yield "Erreur : titre ou catégorie manquante\n"
            return

        prompt = f"""
Rédige un article complet et détaillé sur : {data.titre}
Catégorie : {data.categorie}

STRUCTURE OBLIGATOIRE :
1. Commence par INTRODUCTION (seul sur une ligne)
2. Ensuite 3-4 sections avec des titres courts en MAJUSCULES
3. Termine par CONCLUSION (seul sur une ligne)

RÈGLES IMPORTANTES :
- Chaque titre doit être SEUL sur sa ligne
- Laisse UNE LIGNE VIDE après chaque titre
- Laisse UNE LIGNE VIDE entre chaque paragraphe
- N'utilise PAS de **, ##, ou autres symboles
- Texte brut uniquement
- Article de 500 mots minimum

EXEMPLE :
INTRODUCTION

Le sport est essentiel pour la santé physique et mentale. Il permet de maintenir une bonne forme et de prévenir de nombreuses maladies.

BIENFAITS PHYSIQUES

L'activité physique régulière renforce le système cardiovasculaire. Elle aide également à maintenir un poids santé et améliore la circulation sanguine.

BIENFAITS MENTAUX

Le sport libère des endorphines qui réduisent le stress. Il améliore aussi la qualité du sommeil et augmente la confiance en soi.

CONCLUSION

En conclusion, le sport est un élément clé d'une vie équilibrée. Il apporte des bénéfices durables pour le corps et l'esprit.
"""

        async with httpx.AsyncClient(timeout=90) as client:
            try:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                    "model": "openai/gpt-oss-20b", 
                    "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 2000,
                        "temperature": 0.7
                    }
                )
                
                if response.status_code == 429:
                    yield "⚠️ Limite de requêtes atteinte. Réessayez dans 1 minute.\n"
                    return
                elif response.status_code == 503:
                    yield "⚠️ Service temporairement indisponible. Réessayez.\n"
                    return
                elif response.status_code != 200:
                    yield f"❌ Erreur {response.status_code}\n"
                    return
                
                res_json = response.json()

                if not res_json.get("choices"):
                    if "error" in res_json:
                        yield f"❌ Erreur API : {res_json['error'].get('message', 'Erreur inconnue')}\n"
                    else:
                        yield "Erreur : réponse IA invalide\n"
                    return

            except httpx.TimeoutException:
                yield "⏱️ Délai d'attente dépassé. Réessayez.\n"
                return
            except httpx.RequestError:
                yield f"❌ Erreur réseau : Service indisponible\n"
                return

        if "error" in res_json:
            yield f"Erreur API : {res_json['error'].get('message','Erreur inconnue')}\n"
            return

        try:
            full_text = res_json["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            yield "Erreur : réponse inattendue de l'API\n"
            return

        # ⭐ Nettoyer le texte
        full_text = full_text.replace('**', '').replace('##', '').strip()
        
        # ⭐ Streaming mot par mot
        words = full_text.split(' ')
        for word in words:
            yield word + ' '
            await asyncio.sleep(0.05)  # Délai entre chaque mot

    return StreamingResponse(generate_stream(), media_type="text/event-stream")



@router.delete("/{article_id}")
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    article = db.query(Article).filter(Article.idAr == article_id).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    if article.utilisateurId != current_user.id and not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Action non autorisée")

    # ======================
    # ❤️ FAVORIS
    # ======================
    db.query(Favori).filter(
        Favori.articleId == article_id
    ).delete(synchronize_session=False)

    # ======================
    # 💾 ENREGISTREMENTS / TÉLÉCHARGEMENTS
    # ======================
    db.query(Enregistrement).filter(
        Enregistrement.articleId == article_id
    ).delete(synchronize_session=False)

    # ======================
    # 🔖 TAGS
    # ======================
    article_tags = db.query(ArticleTag).filter(
        ArticleTag.articleId == article_id
    ).all()

    tag_ids = [at.tagId for at in article_tags]

    for at in article_tags:
        db.delete(at)

    db.commit()  # ⚠️ important

    # suppression des tags orphelins
    for tag_id in tag_ids:
        count = db.query(ArticleTag).filter(
            ArticleTag.tagId == tag_id
        ).count()

        if count == 0:
            tag = db.query(Tag).filter(Tag.idT == tag_id).first()
            if tag:
                db.delete(tag)

    db.commit()

    # ======================
    # 📂 CATÉGORIE
    # ======================
    cat_relation = db.query(ArticleCategorie).filter(
        ArticleCategorie.articleId == article_id
    ).first()

    categorie_id = cat_relation.categorieId if cat_relation else None

    if cat_relation:
        db.delete(cat_relation)

    # ======================
    # 🗑️ ARTICLE
    # ======================
    db.delete(article)
    db.commit()

    # ======================
    # 🧹 NETTOYAGE CATÉGORIE ORPHELINE
    # ======================
    if categorie_id:
        count_cat = db.query(ArticleCategorie).filter(
            ArticleCategorie.categorieId == categorie_id
        ).count()

        if count_cat == 0:
            cat = db.query(Categorie).filter(
                Categorie.idC == categorie_id
            ).first()
            if cat:
                db.delete(cat)
                db.commit()

    return {"message": "Article et toutes ses dépendances supprimés correctement"}

@router.get("/{id}/similar")
def get_similar_articles(id: int, db: Session = Depends(get_db)):
    # 1. On récupère l'article source
    article = db.query(Article).filter(Article.idAr == id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    # 2. Récupérer les points communs (IDs)
    cat_rel = db.query(ArticleCategorie).filter(ArticleCategorie.articleId == id).first()
    source_cat_id = cat_rel.categorieId if cat_rel else None

    tag_rels = db.query(ArticleTag).filter(ArticleTag.articleId == id).all()
    source_tag_ids = [t.tagId for t in tag_rels]

    similar_ids = []

    # ✅ 1. PRIORITÉ AUX TAGS (au moins 1 en commun)
    if source_tag_ids:
        same_tags = db.query(ArticleTag.articleId).filter(
            ArticleTag.tagId.in_(source_tag_ids),
            ArticleTag.articleId != id
        ).all()

        for r in same_tags:
            if r[0] not in similar_ids:
                similar_ids.append(r[0])

    # ✅ 2. ENSUITE MÊME CATÉGORIE
    if source_cat_id:
        same_cat = db.query(ArticleCategorie.articleId).filter(
            ArticleCategorie.categorieId == source_cat_id,
            ArticleCategorie.articleId != id
        ).all()

        for r in same_cat:
            if r[0] not in similar_ids:
                similar_ids.append(r[0])

    if not similar_ids:
        return []

    # 4. Récupérer les articles publiés
    articles_similaires = db.query(Article).filter(
        Article.idAr.in_(list(similar_ids)),
        Article.estPublie == True
    ).limit(6).all()

    # 5. Formatage
    result = []
    for art in articles_similaires:
        # Récupération sécurisée du nom de la catégorie
        cat_info = db.query(Categorie.nom).join(ArticleCategorie).filter(ArticleCategorie.articleId == art.idAr).first()
        
        result.append({
            "idAr": art.idAr,
            "titre": art.titre,
            "image": art.image,
            "vues": art.vues,
            "datePublication": art.ddatePublication or art.dateCreation,
            "categorie": cat_info.nom if cat_info else None
        })

    return result

