import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérification au chargement de la page
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.getCurrentUser();
          setUser(res.data || res);
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("userEmail");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // --- FONCTION LOGIN ---
  const login = async (credentials) => {
    try {
      const data = await api.login(credentials.email, credentials.motDePasse);

      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        const userData = await api.getCurrentUser();
        setUser(userData.data || userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      return false;
    }
  };

  // --- FONCTION LOGOUT ---
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("user");
    setUser(null); // devient visiteur
  };

  // --- FONCTION UPDATE USER (photo / nom) ---
  const updateUser = (newData) => {
    setUser((prev) => ({
      ...prev,
      ...newData,
    }));
  };
  const isAdmin =
  user?.email === "blogify2006@gmail.com" ||
  user?.id === 1 ||
  user?.roleId === 1;
  

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
