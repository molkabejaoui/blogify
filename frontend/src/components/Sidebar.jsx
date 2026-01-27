// src/components/Sidebar.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Sidebar() {
  const [cats, setCats] = useState([]);
  const [tags, setTags] = useState([]);
  const [newArticles, setNewArticles] = useState([]);
  const [topLiked, setTopLiked] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    api.getCategories().then(setCats);
    api.getTags().then(setTags);

    api.getArticles().then(all => {
      const sortedNew = [...all].sort((a,b)=> new Date(b.datePublication) - new Date(a.datePublication)).slice(0,5);
      setNewArticles(sortedNew);
      const top = [...all].sort((a,b)=> b.vues - a.vues).slice(0,5);
      setTopLiked(top);
    });
  }, []);

  return (
    <aside className="sidebar">
      <h3>Catégories</h3>
      <ul>
        {cats.map(c => (
          <li key={c.idC} onClick={() => navigate("/")}>{c.nom}</li>
        ))}
      </ul>

      <h3>Tags</h3>
      <ul>
        {tags.map(t => (
          <li key={t.idT} onClick={() => navigate("/")}>{t.nom}</li>
        ))}
      </ul>

      <h3>Nouveautés</h3>
      <ul>
        {newArticles.map(a => (
          <li key={a.idAr} onClick={() => navigate(`/articles/${a.idAr}`)}>{a.titre}</li>
        ))}
      </ul>

      <h3>Les plus aimés</h3>
      <ul>
        {topLiked.map(a => (
          <li key={a.idAr} onClick={() => navigate(`/articles/${a.idAr}`)}>{a.titre}</li>
        ))}
      </ul>
    </aside>
  );
}
