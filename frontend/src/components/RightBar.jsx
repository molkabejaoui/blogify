import { articles } from "../data/mockData";
import { useNavigate } from "react-router-dom";

export default function RightBar() {
  const navigate = useNavigate();

  return (
    <aside className="bg-white rounded-xl shadow p-4">
      <h3 className="font-bold mb-4">🔥 Articles populaires</h3>

      {articles.slice(0, 4).map(a => (
        <div
          key={a.idAr}
          className="mb-3 cursor-pointer"
          onClick={() => navigate(`/articles/${a.idAr}`)}
        >
          <p className="text-sm font-semibold">{a.titre}</p>
          <p className="text-xs text-gray-500">{a.vues} vues</p>
        </div>
      ))}
    </aside>
  );
}
