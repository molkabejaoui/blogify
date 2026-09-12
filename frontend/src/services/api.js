import http from "./http";

// organise les appels API et la logique de communication avec le backend
/** --- AUTHENTIFICATION --- **/
export const login = async (email, motDePasse) => {
  const res = await http.post("/auth/login", { email, motDePasse });
  if (res.data.access_token) {
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("userEmail", email);
  }
  return res.data;
};

export const register = (data) => http.post("/auth/register", data).then(res => res.data);
export const getCurrentUser = () => http.get("/auth/me").then(res => res.data);

/** --- UTILISATEURS --- **/
export const getUsers = () => http.get("/users/").then(res => res.data);
export const getUserById = (id) => http.get(`/users/${id}`).then(res => res.data);

/** --- ARTICLES --- **/
export const getArticles = () => http.get("/articles/").then(res => res.data);
export const getArticleById = (id) => http.get(`/articles/${id}`).then(res => res.data);
export const getArticlesByCategory = (idC) => http.get(`/articles/categorie/${idC}`).then(res => res.data);

/** --- ADMIN (Gestion des articles) --- **/
export const createArticle = (formData) => http.post("/articles/create", formData, {
  headers: { "Content-Type": "multipart/form-data" },
}).then(res => res.data);




/** --- CATEGORIES & TAGS --- **/
export const getCategories = () => http.get("/categorie/").then(res => res.data);
export const getTags = () => http.get("/tag/").then(res => res.data);

/** --- COMMENTAIRES --- **/
// Correction du chemin pour éviter le 404
export const getCommentsByArticle = (articleId) =>
  http.get(`/commentaires/article/${articleId}`).then(res => res.data);

export const addComment = (articleId, contenu) =>
  http.post(`/commentaires/add/${articleId}`, null, { params: { contenu } }).then(res => res.data);

/** --- FAVORIS & ENREGISTREMENTS (Liaison Home & Article) --- **/
export const toggleFavorite = (articleId) => http.post(`/favoris/toggle/${articleId}`).then(res => res.data);
export const toggleSave = (articleId) => http.post(`/enregistrements/toggle/${articleId}`).then(res => res.data);
export const getFavorites = () => http.get("/favoris/").then(res => res.data);

/** --- INTELLIGENCE ARTIFICIELLE --- **/
export const getAISuggestions = (text) => http.post("/articles/ai-correct", { text }).then(res => res.data);
export const aiCorrect = (text) => http.post("/articles/ai-correct", { text }).then(res => res.data);
export const aiGenerate = (data) => http.post("/articles/ai-generate", data).then(res => res.data);
// --- EXPORTATION GLOBALE ---

export const deleteComment = (commentId) =>
  http.delete(`/commentaires/delete/${commentId}`).then(res => res.data);

/** --- PROFIL UTILISATEUR --- **/
export const updateProfile = async (formData) => {
  const res = await http.put("/users/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

 // --- DASHBOARD VISITEURS ---
export const getVisitorStats = async () => {
  const res = await http.get("/visiteur/stats");
  return res.data;
};
// --- TRACK VISITEUR ---
export const trackVisitor = async () => {
  await http.post("/visiteur/track");
};


/** --- ENREGISTREMENTS (Bookmark / Save) --- **/
export const getSaved = () => http.get("/enregistrements/").then(res => res.data);

/** --- CONTACT --- **/
export const sendContactMessage = (data) => http.post("/contact/", data).then(res => res.data);
export const getContactMessages = () => http.get("/contact/").then(res => res.data);
export const deleteArticle = (id) =>
  http.delete(`/articles/${id}`).then(res => res.data);


export const addDownload = (articleId) =>
  http.post(`/downloads/add/${articleId}`).then(res => res.data);

export const getDownloads = () =>
  http.get("/downloads/").then(res => res.data);



const getDashboardStats = async () => {
  const res = await http.get("/admin/dashboard/stats");
  return res.data;
};

const getUsersByMonth = async () => {
  const res = await http.get("/admin/dashboard/users-by-month");
  return res.data;
};

const getTopArticlesDashboard = async () => {
  const res = await http.get("/admin/dashboard/top-articles");
  return res.data;
};


const api = {
  login,
  register,
  getUsers,
  getUserById,
  getCurrentUser,
  getArticles,
  getArticleById,
  getArticlesByCategory,
  createArticle,
  deleteArticle,
  getCategories,
  getTags,
  getCommentsByArticle,
  addComment,
  toggleFavorite, // Pour le bouton Like
  toggleSave,     // Pour le bouton Bookmark
  getFavorites,   // Pour corriger l'erreur Article.jsx
  getAISuggestions,
  aiCorrect,
  aiGenerate,
  deleteComment,
  updateProfile,
  getSaved,
  sendContactMessage,
  getContactMessages,
  getDashboardStats,
  getUsersByMonth,
  getTopArticlesDashboard,
  getVisitorStats,
  trackVisitor,
  addDownload,
  getDownloads,
  getSimilarArticles: (id) =>
    http.get(`/articles/${id}/similar`).then(res => res.data),

};

export default api;
// exporter les api et le organiser les appels API et la logique de communication avec le backend