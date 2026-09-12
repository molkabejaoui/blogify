from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.contact import Contact
from typing import List
import bleach

router = APIRouter(prefix="/contact", tags=["Contact"])

# --- POST : envoyer et sauvegarder message ---
@router.post("/")
def send_message(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    message = data.get("message")

    if not email or not message:
        raise HTTPException(status_code=400, detail="Email et message sont obligatoires")

    email_clean = bleach.clean(email, strip=True)
    message_clean = bleach.clean(message, strip=True)

    contact = Contact(
        email=email_clean,
        message=message_clean
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return {"message": "Message enregistré", "contact_id": contact.id}

# --- GET : récupérer tous les messages ---
@router.get("/", response_model=List[dict])
def get_messages(db: Session = Depends(get_db)):
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).all()
    result = [
        {
            "id": c.id,
            "email": c.email,
            "message": c.message,
            "created_at": c.created_at
        }
        for c in contacts
    ]
    return result
