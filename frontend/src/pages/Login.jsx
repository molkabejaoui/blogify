// src/pages/Login.jsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });

    if (success) {
      const redirectTo = location.state?.from?.pathname || "/";
      const scrollY = location.state?.scrollY || 0;
      navigate(redirectTo, { state: { scrollY } });
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Connexion</h2>

        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" type="password" />

        <button type="submit">Se connecter</button>

        <div className="login-register">
          <span>Vous n'avez pas de compte ?</span>
          <Link to="/register" className="register-link">S'inscrire</Link>
        </div>
      </form>
    </div>
  );
}
