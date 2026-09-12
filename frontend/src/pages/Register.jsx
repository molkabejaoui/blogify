import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register as apiRegister } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    // On envoie un objet propre
    await apiRegister({
      nom: nom.trim(),
      email: email.trim(),
      motDePasse: motDePasse,
    });

    navigate("/login");
  } catch (err) {
    // On affiche le message précis du backend (ex: "Email déjà utilisé")
    const message = err.response?.data?.detail || "Erreur d'inscription";
    setError(Array.isArray(message) ? "Données invalides" : message);
  }
};

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Créer un compte</h2>

        {error && <p className="error">{error}</p>}

        <input
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
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
