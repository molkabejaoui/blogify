import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8000",
});

// Ajouter le token à chaque requête automatiquement
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gérer les erreurs 401 globalement
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si on reçoit une 401, on nettoie le faux token
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
    }
    return Promise.reject(error);
  }
);

export default http;

// faire la connexion entre le frontend et le backend et gerer les requettes http et les token d'authentification pour les utilisateur et les admin