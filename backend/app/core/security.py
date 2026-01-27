from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Utilisateur

SECRET_KEY = "SECRET123"
ALGORITHM = "HS256"

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# def create_access_token(data: dict, expires_minutes: int = 60):
#     to_encode = data.copy()
#     expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# def get_current_user(
#     token: str = Depends(oauth2_scheme),
#     db: Session = Depends(get_db)
# ):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id: int = payload.get("id")
#         if user_id is None:
#             raise HTTPException(status_code=401)
#     except JWTError:
#         raise HTTPException(status_code=401)

#     user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=401)

#     return user

# def admin_required(user: Utilisateur = Depends(get_current_user)):
#     if user.roleId != 1:
#         raise HTTPException(status_code=403, detail="Accès refusé (admin seulement)")
#     return user
