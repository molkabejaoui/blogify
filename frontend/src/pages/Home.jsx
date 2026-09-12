import { useEffect, useState, useRef, useMemo } from "react";
import api from "../services/api";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import jsPDF from "jspdf";
import { FiHeart, FiMessageCircle, FiDownload, FiBookmark, FiSend, FiTrash2 } from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";
import "../index.css";
import DOMPurify from 'dompurify';
import Footer from "../components/Footer";
import { downloadArticlePDF } from "../utils/downloadPDF";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function Home() {
  const [allArticles, setAllArticles] = useState([]); // On stocke la source brute
  const [users, setUsers] = useState([]);
  const [commentsByArticle, setCommentsByArticle] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const commentInputRefs = useRef({});
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  // 1. Extraire les paramètres de l'URL
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q") || "";
  const categoryId = searchParams.get("cat") || "";

  const [categories, setCategories] = useState([]); // Ajoute cet état en haut

  useEffect(() => {
    const loadData = async () => {
      try {
        // On charge les articles, les users ET les catégories
        const [resArticles, resUsers, resCats] = await Promise.all([
          api.getArticles(),
          api.getUsers(),
          api.getCategories()
        ]);

        setAllArticles(Array.isArray(resArticles) ? resArticles : []);
        setUsers(resUsers || []);
        setCategories(resCats || []); // Stocke les catégories pour le filtrage
      } catch (err) {
        console.error("Erreur API:", err);
      }
    };
    loadData();
  }, []);

  // 3. LE FILTRAGE MAGIQUE (useMemo)
  // Cette variable 'articles' se met à jour toute seule dès que l'URL change
  // Utilise useMemo directement sans "React." devant
  // Utilise useMemo pour un filtrage instantané sans page blanche
  const articles = useMemo(() => {
    if (!allArticles || allArticles.length === 0) return [];

    let result = [...allArticles];

    // 1. Filtrage par Catégorie
    if (categoryId) {
      // On récupère l'objet catégorie correspondant à l'ID pour avoir son nom
      const selectedCat = categories.find(c => String(c.idC) === String(categoryId));

      result = result.filter(a => {
        // Ta route backend renvoie le NOM de la catégorie dans le champ "categorie"
        if (selectedCat) {
          return a.categorie === selectedCat.nom;
        }
        return true;
      });
    }

    // 2. Filtrage par Recherche (Query)
    if (query) {
      result = result.filter(a =>
        a.titre?.toLowerCase().includes(query.toLowerCase()) ||
        a.contenu?.toLowerCase().includes(query.toLowerCase())
      );
    }
    result.sort((a, b) => {
      const dateA = new Date(a.datePublication);
      const dateB = new Date(b.datePublication);
      return dateB - dateA; // ⭐ Ordre décroissant (plus récent en premier)
    });
    
    return result;
  }, [allArticles, categoryId, query, categories]); // Ajoutez 'categories' dans les dépendances

  const getUserById = (id) => {
    if (user && user.id === id) return user; // 🔥 avatar toujours à jour
    return users.find(u => u.id === id || u.idU === id);
  };


  const toggleComments = async (articleId) => {
    if (!showComments[articleId]) {
      const res = await api.getCommentsByArticle(articleId);
      setCommentsByArticle((prev) => ({ ...prev, [articleId]: res }));
    }

    setShowComments((prev) => {
      const open = !prev[articleId];
      if (open) {
        setTimeout(() => {
          commentInputRefs.current[articleId]?.focus();
          commentInputRefs.current[articleId]?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }, 200);
      }
      return { ...prev, [articleId]: open };
    });
  };
  const handleDownload = async (article) => {
  if (!user) return navigate("/login");
  try {
    await downloadArticlePDF(article);
    await api.addDownload(article.idAr);
  } catch (err) {
    console.error("Erreur PDF:", err);
  }
};

  const handleAddComment = async (articleId) => {
    if (!user) return navigate("/login");
    if (!newComment.trim()) return;
    await api.addComment(articleId, newComment);
    setNewComment("");
    const res = await api.getCommentsByArticle(articleId);
    setCommentsByArticle((prev) => ({ ...prev, [articleId]: res }));
  };

  const formatSmartDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const handleToggleAction = async (articleId, type) => {
    if (!user) return navigate("/login");

    try {
      const res =
        type === "like"
          ? await api.toggleFavorite(articleId)
          : await api.toggleSave(articleId);

      setAllArticles(prev =>
        prev.map(a => {
          if (a.idAr !== articleId) return a;

          return type === "like"
            ? { ...a, isLiked: res.status === "added" }
            : { ...a, isSaved: res.status === "added" };
        })
      );
    } catch (err) {
      console.error("Toggle action error:", err);
    }
  };





  // ⭐ Fonction pour extraire le 1er paragraphe (pas le titre)
  const extractFirstParagraph = (htmlContent) => {
    // Créer un élément temporaire
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    // Chercher le premier <p> (paragraphe)
    const firstParagraph = temp.querySelector('p');

    if (firstParagraph) {
      let text = firstParagraph.textContent || firstParagraph.innerText;
      // Limiter à 120 caractères
      if (text.length > 120) {
        text = text.substring(0, 120) + '...';
      }
      return text;
    }

    // Fallback si pas de <p> trouvé
    let text = temp.textContent || temp.innerText || '';
    if (text.length > 120) {
      text = text.substring(0, 120) + '...';
    }
    return text;
  };
  return (
    <>
      <div className="layout d-flex bg-light">
        <Sidebar />

        <main className="flex-grow-1 py-4 main-content">
          <div className="content-container">
            {articles.map((a) => {
              const author = getUserById(a.utilisateurId);
              const postComments = commentsByArticle[a.idAr] || [];

              return (
                <div className="post-card-modern" key={a.idAr}>
                  {/* HEADER */}
                  <div className="post-header">
                    <div
                      className="post-author with-date pointer"
                      onClick={() => author && navigate(`/users/${author.id || author.idU}`)}
                    >
                      <img
                        src={
                          author?.avatar
                            ? `http://localhost:8000${author.avatar}`
                            : DEFAULT_AVATAR
                        }
                        className="author-avatar" alt="avatar"
                      />

                      <div className="author-info">
                        <span className="author-name">{author?.nom || "Utilisateur"}</span>
                        <span className="author-date">{formatSmartDate(a.datePublication)}</span>
                      </div>
                    </div>
                  </div>

                  {/* IMAGE */}
                  <div className="post-image-wrapper" onDoubleClick={() => handleToggleAction(a.idAr, "like")}>
                    <img src={`http://localhost:8000${a.image}`} alt={a.titre} />
                    <span className="post-date">{formatSmartDate(a.datePublication)}</span>
                  </div>

                  {/* ACTIONS */}
                  <div className="post-actions">
                    <span onClick={() => handleToggleAction(a.idAr, "like")}>
                      {a.isLiked ? <FaHeart className="icon like" /> : <FiHeart className="icon" />}
                    </span>

                    <FiMessageCircle className="icon" onClick={() => toggleComments(a.idAr)} />

                    <FiDownload className="icon pointer" onClick={() => handleDownload(a)} />

                    <span onClick={() => handleToggleAction(a.idAr, "save")}>
                      {a.isSaved ? <FaBookmark className="icon save" /> : <FiBookmark className="icon" />}
                    </span>
                  </div>

                  {/* TEXT */}
                  <div className="post-text">
                    <Link to={`/articles/${a.idAr}`}>{a.titre}</Link>
                    <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(extractFirstParagraph(a.contenu)) }} />
                  </div>

                  {/* COMMENTS */}
                  {showComments[a.idAr] && (
                    <div className="post-comments-zone">
                      <div className="comment-input-wrapper">
                        <img
                          src={
                            user?.avatar
                              ? `http://localhost:8000${user.avatar}`
                              : DEFAULT_AVATAR
                          }
                          className="comment-avatar pointer"
                          onClick={() => user && navigate(`/users/${user.id || user.idU}`)}
                          alt=""
                        />

                        <div className="comment-input-box">
                          <input
                            ref={(el) => (commentInputRefs.current[a.idAr] = el)}
                            placeholder="Écrire un commentaire..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddComment(a.idAr)}
                          />
                          <FiSend className={`send-icon ${newComment ? "active" : ""}`} onClick={() => handleAddComment(a.idAr)} />
                        </div>
                      </div>

                      <div className="comment-list">
                        {postComments.map((c) => {
                          const cu = getUserById(c.utilisateurId);

                          return (
                            <div key={c.idCmm} className="comment-row">
                              <img
                                src={
                                  cu?.avatar
                                    ? `http://localhost:8000${cu.avatar}`
                                    : DEFAULT_AVATAR
                                }
                                className="comment-avatar pointer"
                                onClick={() => cu && navigate(`/users/${cu.id || cu.idU}`)}
                                alt=""
                              />
                              <div className="comment-content">
                                <div className="comment-header d-flex justify-content-between align-items-center">
                                  <div>
                                    <span className="comment-name">{cu?.nom || "Utilisateur"}</span>
                                    <span className="comment-date ms-2">{formatSmartDate(c.dateCommentaire)}</span>
                                  </div>

                                  {user && (user.id === c.utilisateurId || isAdmin) && (
                                    <button
                                      className="btn-delete-comment"
                                      onClick={async () => {
                                        await api.deleteComment(c.idCmm);
                                        const res = await api.getCommentsByArticle(a.idAr);
                                        setCommentsByArticle((prev) => ({ ...prev, [a.idAr]: res }));
                                      }}
                                    >
                                      <FiTrash2 size={16} />
                                    </button>
                                  )}

                                </div>
                                <div className="comment-text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.contenu) }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
