import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import SearchBar from "./SearchBar";
import { articles } from "../data/mockData";
import { DEFAULT_AVATAR } from "../data/mockData";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">
          <img src={logo} alt="logo" className="logo" />
        </Link>
      </div>

      <div className="nav-center">
        <SearchBar
          data={articles}
          placeholder="Rechercher un article..."
          onSelect={(article) => navigate(`/articles/${article.idAr}`)}
        />
      </div>

      <div className="nav-right">
        {!user ? (
          <div className="auth-buttons">
            <button className="btn-login" onClick={() => navigate("/login")}>Connexion</button>
            <Link to="/register" className="btn-register">S'inscrire</Link>
          </div>
        ) : (
          <div className="profile" onClick={() => navigate(`/users/${user.id}`)}>
            <img src={user.avatar ?? DEFAULT_AVATAR} alt="avatar" className="avatar" />
            <span>{user.nom}</span>
            <button className="btn-logout" onClick={(e) => { e.stopPropagation(); logout(); }}>
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
