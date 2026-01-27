import api from './api';

const commentService = {
  // Ajouter un commentaire
  addComment: async (articleId, contenu) => {
    const response = await api.post(`/commentaires/add/${articleId}`, null, {
      params: { contenu }
    });
    return response.data;
  },
};

export default commentService;