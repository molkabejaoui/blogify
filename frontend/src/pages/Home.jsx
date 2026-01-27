// src/pages/Home.jsx

import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    api.getArticles().then(all => {
      const filtered = all.filter(a =>
        a.titre.toLowerCase().includes(query.toLowerCase())
      );
      setArticles(filtered);
    });
  }, [query]);

  return (
    <div className="layout">
      <Sidebar />

      <main className="home">
        {articles.map(a => (
          <div className="post" key={a.idAr} onClick={() => navigate(`/articles/${a.idAr}`)}>
            <img className="post-img" src={a.image} alt={a.titre} />
            <div className="post-body">
              <h3>{a.titre}</h3>
              <p>{a.contenu.substring(0, 100)}...</p>
              <div className="post-info">
                <span>{a.vues} vues</span>
                <span>{a.lectureMoyenne} min</span>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
