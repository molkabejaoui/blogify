import defaultAvatar from "../assets/default-avatar.png";
export const DEFAULT_AVATAR = defaultAvatar;


export const users = [
  {
    id: 1,
    nom: "admin",
    email: "admin@blogify.com",
    motDePasse: "admin123",
    avatar: null,
    dateInscription: "2025-01-01",
    roleId: 1 // admin
  },
  {
    id: 1,
    nom: "Ahmed Ben Ali",
    email: "ahmed@gmail.com",
    motDePasse: "123456",
    avatar: null,
    dateInscription: "2025-01-01T00:00:00",
    roleId: 2,
    bio: ""
  },
  {
    id: 2,
    nom: "Sara Trabelsi",
    email: "sara@gmail.com",
    motDePasse: "123456",
    avatar: null,
    dateInscription: "2025-01-02T00:00:00",
    roleId: 2,
    bio: ""
  },
  {
    id: 3,
    nom: "Moez Khlifi",
    email: "moez@gmail.com",
    motDePasse: "123456",
    avatar: null,
    dateInscription: "2025-01-03T00:00:00",
    roleId: 2,
    bio: ""
  }
];
export const stats = [
  { articleId: 1, vues: 200, nbCommentaires: 5, tempsLecture: 120 },
  { articleId: 2, vues: 500, nbCommentaires: 12, tempsLecture: 300 },
];

export const articles = [
  {
    idAr: 1,
    titre: "L'IA révolutionne le monde moderne ",
    contenu: "L'intelligence artificielle (IA) désigne des systèmes informatiques capables d'effectuer des tâches typiquement associées à l'intelligence humaine, telles que l'apprentissage, le raisonnement et la prise de décision. Actuellement, l'IA transforme divers secteurs, et son impact est de plus en plus reconnu, notamment depuis l'émergence de technologies comme ChatGPT. Au Canada, des politiques et initiatives sont mises en place pour encadrer et promouvoir le développement de l'IA. Les entreprises canadiennes adoptent l'IA pour améliorer l'efficacité opérationnelle, personnaliser les services et innover dans des domaines tels que la santé, la finance et le commerce de détail. Cependant, l'essor de l'IA soulève également des questions éthiques et sociales, notamment en ce qui concerne la confidentialité des données, la sécurité et l'impact sur l'emploi. Il est crucial de développer des cadres réglementaires appropriés pour garantir une utilisation responsable de l'IA tout en maximisant ses avantages pour la société. Avec l'évolution rapide de l'IA, il est essentiel que les gouvernements, les entreprises et les individus collaborent pour naviguer dans ce paysage en constante évolution et exploiter le potentiel de l'IA de manière éthique et bénéfique pour tous. donc l'avenir de l'IA au Canada dépendra de notre capacité à équilibrer innovation technologique et responsabilité sociale.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
    datePublication: "2025-01-20T00:00:00",
    utilisateurId: 1,
    vues: 1543,
    lectureMoyenne: 5,
    estPublie: true
  },
  {
    idAr: 2,
    titre: "Guide alimentation saine",
    contenu: "Adopter une alimentation saine n'est pas compliqué...",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop",
    datePublication: "2025-01-19T00:00:00",
    utilisateurId: 2,
    vues: 2341,
    lectureMoyenne: 4,
    estPublie: true
  },
  {
    idAr: 3,
    titre: "Design minimaliste 2025",
    contenu: "Le minimalisme est la tendance...",
    image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&auto=format&fit=crop",
    datePublication: "2025-01-18T00:00:00",
    utilisateurId: 3,
    vues: 1120,
    lectureMoyenne: 3,
    estPublie: true
  },
  {
    idAr: 4,
    titre: "Apprendre React rapidement",
    contenu: "React est une bibliothèque JavaScript...",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",
    datePublication: "2025-01-17T00:00:00",
    utilisateurId: 1,
    vues: 4100,
    lectureMoyenne: 6,
    estPublie: true
  },
  {
    idAr: 5,
    titre: "CSS moderne : astuces",
    contenu: "CSS n’est pas difficile si on comprend...",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop",
    datePublication: "2025-01-16T00:00:00",
    utilisateurId: 2,
    vues: 780,
    lectureMoyenne: 2,
    estPublie: true
  },
  {
    idAr: 6,
    titre: "Backend avec FastAPI",
    contenu: "FastAPI est rapide et simple...",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop",
    datePublication: "2025-01-15T00:00:00",
    utilisateurId: 3,
    vues: 990,
    lectureMoyenne: 3,
    estPublie: true
  },
  {
    idAr: 7,
    titre: "Marketing digital 2025",
    contenu: "Le marketing digital évolue...",
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&auto=format&fit=crop",
    datePublication: "2025-01-14T00:00:00",
    utilisateurId: 1,
    vues: 2100,
    lectureMoyenne: 4,
    estPublie: true
  },
  {
    idAr: 8,
    titre: "UI/UX : bonnes pratiques",
    contenu: "L'expérience utilisateur est essentielle...",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop",
    datePublication: "2025-01-13T00:00:00",
    utilisateurId: 2,
    vues: 1500,
    lectureMoyenne: 3,
    estPublie: true
  },
  {
    idAr: 9,
    titre: "Python pour débutants",
    contenu: "Python est simple et puissant...",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop",
    datePublication: "2025-01-12T00:00:00",
    utilisateurId: 3,
    vues: 2900,
    lectureMoyenne: 5,
    estPublie: true
  },
  {
    idAr: 10,
    titre: "Voyage : meilleures destinations",
    contenu: "Découvrez les destinations les plus belles...",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop",
    datePublication: "2025-01-11T00:00:00",
    utilisateurId: 1,
    vues: 3300,
    lectureMoyenne: 6,
    estPublie: true
  }
];

export const commentaires = [
  {
    idCmm: 1,
    contenu: "Article très intéressant !",
    dateCommentaire: "2025-01-21T00:00:00",
    utilisateurId: 2,
    articleId: 1,
    parentId: 0
  },
  {
    idCmm: 2,
    contenu: "Merci pour ce guide !",
    dateCommentaire: "2025-01-22T00:00:00",
    utilisateurId: 1,
    articleId: 2,
    parentId: 0
  }
];

export const favoris = [
  {
    idF: 1,
    utilisateurId: 1,
    articleId: 2,
    dateAjout: "2025-01-23T00:00:00"
  }
];

export const saved = [
  {
    idS: 1,
    utilisateurId: 1,
    articleId: 3,
    dateAjout: "2025-01-24T00:00:00"
  }
];

export const categories = [
  { idC: 1, nom: "Web" },
  { idC: 2, nom: "Backend" },
  { idC: 3, nom: "Design" }
];

export const tags = [
  { idT: 1, nom: "React" },
  { idT: 2, nom: "FastAPI" },
  { idT: 3, nom: "CSS" }
];

export const roles = [
  { idR: 1, nom: "admin" },
  { idR: 2, nom: "user" }
];


