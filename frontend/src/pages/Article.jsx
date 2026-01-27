import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_AVATAR } from "../data/mockData";

import { FiHeart, FiDownload, FiBookmark, FiSend } from "react-icons/fi";
import { jsPDF } from "jspdf";

export default function Article() {
  const [users, setUsers] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [similar, setSimilar] = useState([]);

  const [newComment, setNewComment] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const commentBoxRef = useRef(null);

  const suggestions = [
    "Super article !",
    "Merci pour le partage 😊",
    "Très intéressant !",
    "J’ai appris quelque chose",
  ];

  useEffect(() => {
    api.getUsers().then(setUsers);

    api.getArticleById(id).then(a => {
      setArticle(a);
      api.getUserById(a.utilisateurId).then(setAuthor);
      api.getArticles().then(all => setSimilar(all.filter(x => x.idAr !== a.idAr).slice(0, 3)));
    });

    api.getCommentsByArticle(id).then(setComments);

    if (user) {
      api.getFavoritesByUser(user.id).then(fav => setIsFavorite(fav.some(f => f.articleId === Number(id))));
      api.getSavedByUser(user.id).then(sav => setIsSaved(sav.some(s => s.articleId === Number(id))));
    }

    if (location.state?.scrollY) {
      window.scrollTo(0, location.state.scrollY);
    }
  }, [id, user]);

  const handleComment = () => {
    if (!user) {
      navigate("/login", { state: { from: location, scrollY: window.scrollY } });
      return;
    }
    if (!newComment.trim()) return;

    api.addComment(user.id, id, newComment).then(c => {
      setComments([...comments, c]);
      setNewComment("");
    });
  };

  const toggleFavorite = () => {
    if (!user) {
      navigate("/login", { state: { from: location, scrollY: window.scrollY } });
      return;
    }
    api.toggleFavorite(user.id, id).then(res => setIsFavorite(!res.removed));
  };

  const toggleSave = () => {
    if (!user) {
      navigate("/login", { state: { from: location, scrollY: window.scrollY } });
      return;
    }
    api.toggleSaved(user.id, id).then(res => setIsSaved(!res.removed));
  };

  const downloadPDF = () => {
    if (!user) {
      navigate("/login", { state: { from: location, scrollY: window.scrollY } });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(article.titre, 20, 20);
    doc.setFontSize(12);
    doc.text(article.contenu, 20, 40, { maxWidth: 170 });
    doc.save(`${article.titre}.pdf`);
  };

  if (!article) return null;

  return (
    <div className="layout">
      <Sidebar />

      <main className="article-page">
        <div className="article-left">
          <img className="article-img" src={article.image} alt={article.titre} />

          <div className="article-content">
            <h1>{article.titre}</h1>

            {author && (
              <div className="author" onClick={() => navigate(`/users/${author.id}`)}>
                <img src={author.avatar ?? DEFAULT_AVATAR} className="author-avatar" />
                <div className="author-info">
                  <span>{author.nom}</span>
                  <span className="date">{new Date(article.datePublication).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            <p>{article.contenu}</p>

            <div className="article-actions">
              <button onClick={downloadPDF} className={isFavorite ? "icon-btn active" : "icon-btn"}>
                <FiDownload /> Télécharger
              </button>

              <button onClick={toggleFavorite} className={isFavorite ? "icon-btn active" : "icon-btn"}>
                <FiHeart /> Favoris
              </button>

              <button onClick={toggleSave} className={isSaved ? "icon-btn active" : "icon-btn"}>
                <FiBookmark /> Enregistrer
              </button>
            </div>

            <div className="comments">
  <h3>Commentaires</h3>

  <div className="comment-input" ref={commentBoxRef}>
    <input
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      placeholder="Ajouter un commentaire..."
    />
    <button
      onClick={handleComment}
      className={newComment.trim() ? "send-btn active" : "send-btn"}
    >
      <FiSend />
    </button>
  </div>

  <div className="suggestions">
    {suggestions.map((s, idx) => (
      <button key={idx} className="suggestion-btn" onClick={() => setNewComment(s)}>
        {s}
      </button>
    ))}
  </div>

  {comments.map(c => (
    <div className="comment" key={c.idCmm}>
      <img
        src={(users.find(u => u.id === c.utilisateurId)?.avatar) ?? DEFAULT_AVATAR}
        className="comment-avatar"
      />

      <div className="comment-body">
        <div className="comment-header">
          <span
            className="comment-user"
            onClick={() => navigate(`/users/${c.utilisateurId}`)}
          >
            {users.find(u => u.id === c.utilisateurId)?.nom || "Utilisateur"}
          </span>
          <span className="comment-date">
            {new Date(c.dateCommentaire).toLocaleDateString()}
          </span>
        </div>
        <p>{c.contenu}</p>
      </div>
    </div>
  ))}
</div>

          </div>
        </div>

        <div className="article-right">
          <h3>Articles similaires</h3>
          {similar.map(s => (
            <div className="similar" key={s.idAr} onClick={() => navigate(`/articles/${s.idAr}`)}>
              <img src={s.image} />
              <div>
                <h4>{s.titre}</h4>
                <p>{s.contenu.substring(0, 40)}...</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
