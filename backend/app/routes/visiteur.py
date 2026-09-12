from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.visiteur import Visiteur
from app.models.user import Utilisateur
from sqlalchemy import func
import bleach
# bleach permet de netoiyer les entree http pour eviter les attaque xss

router = APIRouter(
    prefix="/visiteur",
    tags=["visiteur"]
)

# 🔹 Tracker une visite anonyme
@router.post("/track")
def track_visit(request: Request, db: Session = Depends(get_db)):
    ip = bleach.clean(request.client.host, strip=True)
    user_agent = bleach.clean(request.headers.get("user-agent", ""), strip=True)
    
    visite = Visiteur(ip=ip, userAgent=user_agent)
    db.add(visite)
    db.commit()
    return {"message": "Visite enregistrée"}

# 🔹 Statistiques pour le dashboard
@router.get("/stats")
def get_visitors_stats(db: Session = Depends(get_db)):
    # Total visiteurs anonymes
    total_anonymous = db.query(Visiteur.ip).distinct().count()

    # Total inscrits par année
    users_by_year = (
        db.query(
            func.year(Utilisateur.dateInscription).label("year"),
            func.count(Utilisateur.id).label("count")
        )
        .group_by("year")
        .order_by("year")
        .all()
    )

    return {
        "totalAnonymous": total_anonymous,
        "usersByYear": [{"year": r.year, "count": r.count} for r in users_by_year]
    }
