import React, { createContext, useContext, useState } from "react";
import api from "../services/api";
import { DEFAULT_AVATAR } from "../data/mockData";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async ({ email, password }) => {
    const u = await api.login(email, password);
    if (u) {
      setUser({
        ...u,
        avatar: u.avatar ?? DEFAULT_AVATAR
      });
    }
    return u;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
