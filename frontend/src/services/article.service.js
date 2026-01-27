import api from './api';

const articleService = {
  // Récupérer tous les articles publiés
  getAllArticles: async () => {
    const response = await api.get('/articles/');
    return response.data;
  },

  // Récupérer un article par ID
  getArticleById: async (id) => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  // Récupérer les articles d'une catégorie
  getArticlesByCategory: async (categorieId) => {
    const response = await api.get(`/articles/categorie/${categorieId}`);
    return response.data;
  },

  // ADMIN - Créer un article
  createArticle: async (titre, contenu, categorieNom, tags) => {
    const response = await api.post('/articles/admin/create', {
      titre,
      contenu,
      categorieNom,
      tags,
    });
    return response.data;
  },

  // ADMIN - Modifier un article
  updateArticle: async (id, titre, contenu, estPublie) => {
    const response = await api.put(`/articles/admin/update/${id}`, {
      titre,
      contenu,
      estPublie,
    });
    return response.data;
  },

  // ADMIN - Supprimer un article
  deleteArticle: async (id) => {
    const response = await api.delete(`/articles/admin/delete/${id}`);
    return response.data;
  },
};

export default articleService;