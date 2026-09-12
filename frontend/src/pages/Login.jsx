import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const success = await login({
      email,
      motDePasse, // ✅ NOM EXACT DU BACKEND
    });

    if (!success) {
      setError("Email ou mot de passe incorrect");
      return;
    }

    const redirectTo = location.state?.from?.pathname || "/";
    navigate(redirectTo);
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Connexion</h2>

        {error && <p className="error">{error}</p>}

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

        <button type="submit">Se connecter</button>

        <div className="login-register">
          <span>Vous n'avez pas de compte ?</span>
          <Link to="/register">S'inscrire</Link>
        </div>
      </form>
    </div>
  );
}
