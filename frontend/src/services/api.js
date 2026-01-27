// src/services/api.js
import {
  articles,
  users,
  commentaires,
  favoris,
  categories,
  tags,
  saved,
  DEFAULT_AVATAR
} from "../data/mockData";

/* ===================== USERS ===================== */

export const getUsers = () => Promise.resolve(users);

export const getUserById = (id) =>
  Promise.resolve(users.find(u => u.id === Number(id)));

/* ===================== ARTICLES ===================== */

export const getArticles = () => Promise.resolve(articles);

export const getArticleById = (id) =>
  Promise.resolve(articles.find(a => a.idAr === Number(id)));

/* ===================== COMMENTS ===================== */

export const getCommentsByArticle = (articleId) =>
  Promise.resolve(commentaires.filter(c => c.articleId === Number(articleId)));

export const getComments = () => Promise.resolve(commentaires);

/* ===================== CATEGORIES / TAGS ===================== */

export const getCategories = () => Promise.resolve(categories);
export const getTags = () => Promise.resolve(tags);

/* ===================== AUTH ===================== */

export const login = (email, motDePasse) => {
  const user = users.find(u => u.email === email && u.motDePasse === motDePasse);
  return Promise.resolve(user || null);
};

/* ===================== ADD COMMENT / FAVORITE ===================== */

export const addComment = (userId, articleId, contenu) => {
  const newComment = {
    idCmm: Date.now(),
    contenu,
    dateCommentaire: new Date().toISOString(),
    utilisateurId: Number(userId),
    articleId: Number(articleId),
    parentId: 0
  };
  commentaires.push(newComment);
  return Promise.resolve(newComment);
};

export const addFavorite = (userId, articleId) => {
  const exists = favoris.find(
    f => f.utilisateurId === Number(userId) && f.articleId === Number(articleId)
  );
  if (exists) return Promise.resolve(exists);

  const newFav = {
    idF: Date.now(),
    utilisateurId: Number(userId),
    articleId: Number(articleId),
    dateAjout: new Date().toISOString()
  };
  favoris.push(newFav);
  return Promise.resolve(newFav);
};

export const getFavoritesByUser = (userId) =>
  Promise.resolve(favoris.filter(f => f.utilisateurId === Number(userId)));

export const getFavorites = () => Promise.resolve(favoris);

/* ===================== SAVED (ENREGISTRÉS) ===================== */

export const addSaved = (userId, articleId) => {
  const exists = saved.find(
    s => s.utilisateurId === Number(userId) && s.articleId === Number(articleId)
  );
  if (exists) return Promise.resolve(exists);

  const newSaved = {
    idS: Date.now(),
    utilisateurId: Number(userId),
    articleId: Number(articleId),
    dateAjout: new Date().toISOString()
  };
  saved.push(newSaved);
  return Promise.resolve(newSaved);
};

export const getSavedByUser = (userId) =>
  Promise.resolve(saved.filter(s => s.utilisateurId === Number(userId)));

/* ===================== REGISTER / UPDATE USER ===================== */

export const register = (userData) => {
  const newUser = {
    id: Date.now(),
    ...userData,
    avatar: userData.avatar || DEFAULT_AVATAR,
    dateInscription: new Date().toISOString(),
    roleId: 2
  };
  users.push(newUser);
  return Promise.resolve(newUser);
};

export const updateUser = (id, data) => {
  const index = users.findIndex(u => u.id === Number(id));
  if (index === -1) return Promise.reject("User not found");

  if (data.avatar === "" || !data.avatar) {
    data.avatar = DEFAULT_AVATAR;
  }

  users[index] = { ...users[index], ...data };
  return Promise.resolve(users[index]);
};

/* ===================== TOGGLE FAVORITE / SAVED ===================== */

export const toggleFavorite = (userId, articleId) => {
  const exists = favoris.find(
    f => f.utilisateurId === Number(userId) && f.articleId === Number(articleId)
  );

  if (exists) {
    const index = favoris.indexOf(exists);
    favoris.splice(index, 1);
    return Promise.resolve({ removed: true });
  }

  const newFav = {
    idF: Date.now(),
    utilisateurId: Number(userId),
    articleId: Number(articleId),
    dateAjout: new Date().toISOString()
  };
  favoris.push(newFav);
  return Promise.resolve({ removed: false });
};

export const toggleSaved = (userId, articleId) => {
  const exists = saved.find(
    s => s.utilisateurId === Number(userId) && s.articleId === Number(articleId)
  );

  if (exists) {
    const index = saved.indexOf(exists);
    saved.splice(index, 1);
    return Promise.resolve({ removed: true });
  }

  const newSaved = {
    idS: Date.now(),
    utilisateurId: Number(userId),
    articleId: Number(articleId),
    dateAjout: new Date().toISOString()
  };
  saved.push(newSaved);
  return Promise.resolve({ removed: false });
};

/* ===================== STATS ===================== */

export const getStats = () => {
  // stats simplifiée pour mock
  const stats = {
    totalUsers: users.length,
    totalArticles: articles.length,
    totalComments: commentaires.length,
    totalFavorites: favoris.length,
  };
  return Promise.resolve(stats);
};

/* ===================== EXPORT DEFAULT ===================== */

export default {
  login,
  register,
  getUsers,
  getUserById,
  getArticles,
  getArticleById,
  getComments,
  getCommentsByArticle,
  addComment,
  addFavorite,
  getFavorites,
  getFavoritesByUser,
  addSaved,
  getSavedByUser,
  getCategories,
  getTags,
  updateUser,
  toggleFavorite,
  toggleSaved,
  getStats
};
