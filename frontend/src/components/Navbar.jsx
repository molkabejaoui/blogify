import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import logo from "../assets/logo.png";
import SearchBar from "./SearchBar";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [articles, setArticles] = useState([]);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    api.getArticles().then(setArticles);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", dark);
  }, [dark]);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav
      className="navbar fixed-top d-flex align-items-center px-4 shadow-sm"
      style={{
        width: "100%",
        backgroundColor: dark ? "#121212" : "#fff",
        color: dark ? "#e0e0e0" : "#111",
        zIndex: 9999,
        padding: "0.5rem 1rem",
        transition: "0.3s all",
      }}
    >
      {/* LOGO */}
      <Link to="/" className="me-4">
        <img src={logo} alt="logo" style={{ height: 40 }} />
      </Link>

      {/* SEARCH */}
      <div style={{ width: 350 }}>
        <SearchBar
          data={articles}
          onSearch={(article) => {
            navigate(`/articles/${article.idAr}`);
          }}
        />
      </div>

      {/* DROITE */}
      <div className="d-flex align-items-center gap-3 ms-auto">
        {!user ? (
          <div className="navbar-actions">
            <button
              className="nav-btn secondary"
              onClick={() => navigate("/login")}
            >
              Connexion
            </button>

            <button
              className="nav-btn"
              onClick={() => navigate("/register")}
            >
              S'inscrire
            </button>
          </div>
        ) : (
          /* ===== PROFIL AVEC MENU DÉROULANT ===== */
          <div
            ref={menuRef}
            style={{ position: "relative", display: "flex", alignItems: "center" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                lineHeight: 1,
              }}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <img
                src={
                  user.avatar
                    ? `http://localhost:8000${user.avatar}`
                    : DEFAULT_AVATAR
                }
                alt="avatar"
                style={{
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: dark ? "2px solid #3b82f6" : "2px solid #fff",
                  display: "block",
                }}
              />
              <span
                style={{
                  fontWeight: 600,
                  marginLeft: 8,
                  lineHeight: "36px",
                  whiteSpace: "nowrap",
                }}
              >
                {user.nom || "Utilisateur"}
              </span>
            </div>

            {/* MENU DÉROULANT */}
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "120%",
                  right: 0,
                  backgroundColor: dark ? "#1e1e1e" : "#fff",
                  color: dark ? "#e0e0e0" : "#111",
                  border: dark ? "1px solid #333" : "1px solid #e5e7eb",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  minWidth: 180,
                  overflow: "hidden",
                  zIndex: 10000,
                }}
              >
                <Link
                  to={`/users/${user.id}`}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    textDecoration: "none",
                    color: "inherit",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = dark
                      ? "#2a2a2a"
                      : "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Profil
                </Link>

                <div
                  onClick={handleLogout}
                  style={{
                    padding: "10px 16px",
                    color: "#f87171",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = dark
                      ? "#2a2a2a"
                      : "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Déconnexion
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}