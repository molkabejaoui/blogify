import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { users, DEFAULT_AVATAR } from "../data/mockData";

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState("");

  // 🔁 Si déjà connecté → home
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nom || !email || !motDePasse) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    if (users.some(u => u.email === email)) {
      setError("Email déjà utilisé");
      return;
    }

    const newUser = {
      id: Date.now(),
      nom,
      email,
      motDePasse,
      avatar: avatarFile
        ? URL.createObjectURL(avatarFile)
        : DEFAULT_AVATAR,
      dateInscription: new Date().toISOString(),
      roleId: 2
    };

    users.push(newUser);
    navigate("/login");
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Créer un compte</h2>

        {error && <p className="error">{error}</p>}

        <input placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Mot de passe" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} />

        <input
          type="file"
          accept="image/*"
          onChange={e => setAvatarFile(e.target.files[0])}
        />

        <button type="submit">S'inscrire</button>

        <div className="login-register">
          <span>Déjà un compte ?</span>
          <Link to="/login">Connexion</Link>
        </div>
      </form>
    </div>
  );
}
