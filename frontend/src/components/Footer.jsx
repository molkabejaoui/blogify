import { useState ,useEffect } from "react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import logo from "../assets/logo.png";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sendContactMessage } from "../services/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendContactMessage({ email, message }); // <- utilise la fonction
      setSuccess(true);
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileClick = () => {
    const token = localStorage.getItem("token");

    if (token && user?.id) {
      navigate(`/users/${user.id}`);
    } else {
      navigate("/login");
    }
  };



  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Logo */}
        <div className="footer-section">
          <img src={logo} alt="Blogify" className="footer-logo" />
          <p className="footer-desc">
            Blogify est une plateforme moderne pour partager vos idées,
            articles et inspirations.
          </p>
        </div>

        {/* Liens */}
        <div className="footer-section">
          <h4>Liens rapides</h4>
          <ul>
            {/* Accueil */}
            <li>
              <Link to="/">Accueil</Link>
            </li>

            {/* Profil (logique intelligente) */}
            <li>
              <button
                onClick={handleProfileClick}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left"
                }}
              >
                Profil
              </button>
            </li>

            {/* Connexion / Inscription si non authentifié */}
            {!user && (
              <>
                <li>
                  <Link to="/login">Connexion</Link>
                </li>
                <li>
                  <Link to="/register">Inscription</Link>
                </li>
              </>
            )}
          </ul>
        </div>


        {/* About */}
        <div className="footer-section">
          <h4>À propos</h4>
          <p>
            Blogify aide les créateurs à publier et partager du contenu
            de qualité dans une interface simple et élégante.
          </p>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>Contactez-nous</h4>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <textarea
              placeholder="Votre message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <button type="submit">Envoyer</button>
          </form>

          {success && <p className="success">Message envoyé ✔</p>}
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div className="footer-bottom">
        <div className="socials">
          <a href="https://facebook.com" target="_blank"><FaFacebook /></a>
          <a href="https://instagram.com" target="_blank"><FaInstagram /></a>
          <a href="https://linkedin.com" target="_blank"><FaLinkedin /></a>
        </div>

        <p>© 2025 Blogify. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
