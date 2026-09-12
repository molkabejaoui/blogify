// src/App.jsx
// permet de definir les routes de l'application et la structure globale de l'application


import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Article from "./pages/Article";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import EditProfile from "./pages/EditProfile";
import CreateArticle from "./pages/CreateArticle";
import Dashboard from "./pages/Dashboard";
import { useEffect } from "react";
import api from "./services/api";
import AdminMessages from "./pages/AdminMessages";


export default function App() {
  useEffect(() => {
    const trackVisitor = async () => {
      const token = localStorage.getItem("token");
      const alreadyTracked = sessionStorage.getItem("visitor_tracked");

      // 👉 seulement si NON authentifié et pas encore tracké
      if (!token && !alreadyTracked) {
        try {
          await api.trackVisitor();
          sessionStorage.setItem("visitor_tracked", "true");
          console.log("Visiteur enregistré");
        } catch (error) {
          console.error("Erreur tracking visiteur", error);
        }
      }
    };

    trackVisitor();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articles/:id" element={<Article />} />
        <Route path="/users/:id" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/admin/create-article" element={<CreateArticle />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute adminOnly>
              <AdminMessages />
            </ProtectedRoute>
          }
        />


      </Routes>
      
    </BrowserRouter>
  );
}
