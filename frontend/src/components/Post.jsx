import { getUserById } from "../services/api";
import { Link } from "react-router-dom";

export default function Post({ article }) {
  if (!article) return null; // 🛡️ sécurité

  const author = getUserById(article.utilisateurId);

  return (
    <div className="post">

      {/* Header post */}
      <div className="post-header">
        <img
          src={author?.avatar}
          alt={author?.nom}
          className="avatar"
        />
        <span>{author?.nom}</span>
      </div>

      {/* Image */}
      <img
        src={article.image}
        alt={article.titre}
        className="post-image"
      />

      {/* Content */}
      <div className="post-content">
        <h3>{article.titre}</h3>
        <p>{article.contenu}</p>

        <Link to={`/article/${article.idAr}`}>
          Lire l’article
        </Link>
      </div>

    </div>
  );
}
