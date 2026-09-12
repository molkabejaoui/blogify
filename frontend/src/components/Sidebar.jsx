import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEdit3, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Sidebar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarRef = useRef(null);
  const searchRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);
  const [catQuery, setCatQuery] = useState("");
  const [popular, setPopular] = useState([]);
  const [news, setNews] = useState([]);

  const filteredCats = categories.filter(c =>
    c.nom.toLowerCase().includes(catQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setCatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    api.getCategories().then(res => {
      const unique = Array.from(new Map(res.map(c => [c.nom, c])).values());
      setCategories(unique);
    });

    api.getArticles().then(res => {
      const popularSorted = [...res].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0)).slice(0, 3);
      setPopular(popularSorted);
      const today = new Date().toDateString();
      setNews(res.filter(a => new Date(a.datePublication).toDateString() === today));
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // 🔥 LOGIQUE : Sidebar s'arrête AVANT le footer (avec throttle pour performance)
  // 🔥 LOGIQUE SIMPLE : Sidebar s'arrête à la fin du layout
  useEffect(() => {
    const handleScroll = () => {
      const sidebar = sidebarRef.current;
      const layout = document.querySelector(".layout.d-flex.bg-light");

      if (!sidebar || !layout) return;

      const layoutRect = layout.getBoundingClientRect();
      const sidebarHeight = sidebar.offsetHeight;
      const windowHeight = window.innerHeight;

      // Bas du layout par rapport au viewport
      const layoutBottom = layoutRect.bottom;

      // Bas du sidebar si en position normale
      const sidebarBottom = 70 + sidebarHeight;

      // Si le bas du layout est au-dessus du bas du sidebar
      if (layoutBottom < sidebarBottom && layoutBottom < windowHeight) {
        // Déplacer le sidebar vers le haut
        const pushUp = sidebarBottom - layoutBottom;
        sidebar.style.transform = `translateY(-${pushUp}px)`;
      } else {
        // Position normale
        sidebar.style.transform = `translateY(0)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll(); // Appel initial

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [popular, news]); 

  const handleCreate = () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
    } else {
      navigate("/admin/create-article");
    }
  };

  return (
    <aside
      className="sidebar-modern sticky-sidebar"
      ref={sidebarRef}
    >
      {isAdmin && (
        <div className="admin-buttons mb-4">
          <button className="btn-dashboard" onClick={() => navigate("/admin/dashboard")}>
            Dashboard
          </button>
          <button className="btn-messages" onClick={() => navigate("/admin/messages")}>
            Messages
          </button>
        </div>
      )}

      <button className="btn-publish" onClick={handleCreate}>
        <FiEdit3 size={16} />
        Publier un article
      </button>

      <div className="category-box" ref={searchRef}>
        <div className="category-header">
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={catQuery}
            onChange={(e) => {
              setCatQuery(e.target.value);
              setCatOpen(true);
            }}
            onFocus={() => setCatOpen(true)}
          />
          <span onClick={() => setCatOpen(!catOpen)}>
            {catOpen ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        </div>
        {catOpen && (
          <div className="category-list">
            {filteredCats.map(cat => (
              <div
                key={cat.idC}
                className="category-item"
                onClick={() => {
                  navigate(`/?cat=${cat.idC}`);
                  setCatOpen(false);
                }}
              >
                {cat.nom}
              </div>
            ))}
          </div>
        )}
      </div>

      {popular.length > 0 && (
        <div className="sidebar-section">
          <h4>Populaires</h4>
          {popular.map(a => (
            <div key={a.idAr} className="article-card-mini" onClick={() => navigate(`/articles/${a.idAr}`)}>
              <h5>{a.titre}</h5>
              <p>{a.contenu?.slice(0, 70)}...</p>
            </div>
          ))}
        </div>
      )}

      {news.length > 0 && (
        <div className="sidebar-section">
          <h4>Nouveautés</h4>
          {news.map(a => (
            <div key={a.idAr} className="article-card-mini" onClick={() => navigate(`/articles/${a.idAr}`)}>
              <h5>{a.titre}</h5>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}