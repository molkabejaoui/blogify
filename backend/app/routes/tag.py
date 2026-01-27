from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Tag
from app.core.auth import admin_required

router = APIRouter(prefix="/tag", tags=["tag"])

@router.post("/admin/create")
def create_tag(nom: str, db: Session = Depends(get_db), admin = Depends(admin_required)):
    tag = Tag(nom=nom)
    db.add(tag)
    db.commit()
    return {"message": "Tag créé"}

@router.get("/")
def get_tags(db: Session = Depends(get_db)):
    return db.query(Tag).all()
