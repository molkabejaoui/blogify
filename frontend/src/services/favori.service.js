import api from './api';

const favoriService = {
  // Ajouter aux favoris
  addToFavoris: async (articleId) => {
    const response = await api.post(`/favoris/add/${articleId}`);
    return response.data;
  },
};

export default favoriService;