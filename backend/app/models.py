from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import declarative_base
import datetime

Base = declarative_base()

class Utilisateur(Base):
    __tablename__ = "utilisateur"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    motDePasse = Column(String(255))
    avatar = Column(String(255))
    dateInscription = Column(DateTime, default=datetime.datetime.utcnow)
    roleId = Column(Integer)

class Role(Base):
    __tablename__ = "role"
    idR = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50))

class Tag(Base):
    __tablename__ = "tag"
    idT = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), unique=True)

class Categorie(Base):
    __tablename__ = "categorie"
    idC = Column(Integer, primary_key=True, index=True)
    nom = Column(String(45), unique=True)

class Article(Base):
    __tablename__ = "article"
    idAr = Column(Integer, primary_key=True, index=True)
    titre = Column(String(255))
    contenu = Column(Text)
    image = Column(String(255))
    datePublication = Column(DateTime, default=datetime.datetime.utcnow)
    utilisateurId = Column(Integer)
    vues = Column(Integer, default=0)
    lectureMoyenne = Column(Integer, default=0)
    estPublie = Column(Boolean, default=False)

class ArticleTag(Base):
    __tablename__ = "articletag"
    idArTag = Column(Integer, primary_key=True, index=True)
    articleId = Column(Integer)
    tagId = Column(Integer)

class ArticleCategorie(Base):
    __tablename__ = "articlecategorie"
    id = Column(Integer, primary_key=True, index=True)
    articleId = Column(Integer)
    categorieId = Column(Integer)

class Favori(Base):
    __tablename__ = "favori"
    idF = Column(Integer, primary_key=True, index=True)
    utilisateurId = Column(Integer)
    articleId = Column(Integer)
    dateAjout = Column(DateTime, default=datetime.datetime.utcnow)

class Commentaire(Base):
    __tablename__ = "commentaire"
    idCmm = Column(Integer, primary_key=True, index=True)
    contenu = Column(Text)
    dateCommentaire = Column(DateTime, default=datetime.datetime.utcnow)
    utilisateurId = Column(Integer)
    articleId = Column(Integer)
    parentId = Column(Integer, default=0)

class Statistiques(Base):
    __tablename__ = "statistiques"
    idStat = Column(Integer, primary_key=True, index=True)
    articleId = Column(Integer)
    vues = Column(Integer, default=0)
    nbCommentaires = Column(Integer, default=0)
    tempsLecture = Column(Integer, default=0)

class BadWord(Base):
    __tablename__ = "bad_word"
    id = Column(Integer, primary_key=True, index=True)
    mot = Column(String(100), unique=True)

class PhrasePrete(Base):
    __tablename__ = "phrase_prete"
    id = Column(Integer, primary_key=True, index=True)
    phrase = Column(String(255), unique=True)
