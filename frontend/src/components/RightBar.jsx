import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function RightBar() {
  const navigate = useNavigate();
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    api.getArticles().then(all => {
      // Trier par vues (décroissant)
      const sorted = [...all].sort((a, b) => (b.vues || 0) - (a.vues || 0));
      setPopular(sorted.slice(0, 4));
    });
  }, []);

  return (
    <aside className="bg-white rounded shadow-sm p-3 mt-4">
      <h5 className="fw-bold mb-3">🔥 Articles populaires</h5>
      {popular.map(a => (
        <div
          key={a.idAr}
          className="mb-3 border-bottom pb-2 pointer"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/articles/${a.idAr}`)}
        >
          <p className="mb-0 fw-bold small text-truncate">{a.titre}</p>
          <p className="text-muted extra-small" style={{fontSize: "10px"}}>{a.vues || 0} vues</p>
        </div>
      ))}
    </aside>
  );
}