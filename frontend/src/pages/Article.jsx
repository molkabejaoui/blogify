import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { FiHeart, FiDownload, FiBookmark, FiSend } from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";
import jsPDF from "jspdf";
import "../index.css";
import SimilarArticles from "../components/SimilarArticles";
import { downloadArticlePDF } from "../utils/downloadPDF";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function Article() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteId, setShowDeleteId] = useState(null);
  const [deleteMenu, setDeleteMenu] = useState({ visible: false, x: 0, y: 0, commentId: null });

  const commentInputRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const users = await api.getUsers();
      setUsers(users);

      const a = await api.getArticleById(id);
      setArticle(a);

      if (a.utilisateurId) {
        try {
          const author = await api.getUserById(a.utilisateurId);
          setAuthor(author);
        } catch {
          setAuthor(null);
        }
      }

      const comments = await api.getCommentsByArticle(id);
      setComments(comments.reverse());

      if (user) {
        const favs = await api.getFavorites();
        setIsLiked(favs.some(f => f.idAr === Number(id)));

        const saved = await api.getSaved();
        setIsSaved(saved.some(f => f.idAr === Number(id)));
      }
    };

    fetchData();
  }, [id, user]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (deleteMenu.visible) {
        setDeleteMenu({ ...deleteMenu, visible: false });
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [deleteMenu]);

  const getUserById = (idU) => users.find(u => u.id === idU);

  const handleComment = async () => {
    if (!user) return navigate("/login");
    if (!newComment.trim()) return;

    await api.addComment(id, newComment);
    const res = await api.getCommentsByArticle(id);
    setComments(res.reverse());
    setNewComment("");
  };

  const toggleLike = async () => {
    if (!user) return navigate("/login");
    const res = await api.toggleFavorite(id);
    setIsLiked(res.status === "added");
  };

  const toggleSave = async () => {
    if (!user) return navigate("/login");

    try {
      const res = await api.toggleSave(id);
      setIsSaved(res.status === "added");
    } catch (err) {
      console.error(err);
    }
  };

  


const downloadPDF = async () => {
  if (!user) return navigate("/login");
  if (!article) return;
  try {
    await downloadArticlePDF(article);
    await api.addDownload(article.idAr);
  } catch (err) {
    console.error("Erreur PDF:", err);
  }
};

  const handleDeleteComment = async (idCmm) => {
    try {
      await api.deleteComment(idCmm);
      setComments(prev => prev.filter(c => c.idCmm !== idCmm));
      setShowDeleteId(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du commentaire");
    }
  };

  const handleRightClickComment = (e, c) => {
    e.preventDefault();
    if (user && (user.id === c.utilisateurId || isAdmin)) {
      setDeleteMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        commentId: c.idCmm
      });
    }
  };

  if (!article) return <div className="p-5">Chargement...</div>;

  return (
    <>
      <div className="layout d-flex bg-light">
        <Sidebar />

        <main className="flex-grow-1 py-4 main-content">
          <div className="content-container">
            
            {/* Article principal */}
            <div className="article-card smooth-shadow p-4" style={{ marginBottom: "30px" }}>
              {/* HEADER */}
              <div className="article-header d-flex align-items-center mb-3">
                <img src={
                  author?.avatar
                    ? `http://localhost:8000${author.avatar}`
                    : DEFAULT_AVATAR
                } className="author-avatar" alt="" />
                <div className="author-info ms-3">
                  <div className="author-name">{author?.nom || "Auteur Blogify"}</div>
                  <div className="author-date">
                    {article.ddatePublication
                      ? new Date(article.ddatePublication).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
              </div>

              {/* IMAGE */}
              {article.image && (
                <img 
                  src={`http://localhost:8000${article.image}`} 
                  alt={article.titre} 
                  className="article-image mb-3 rounded-lg" 
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    height: "auto",
                    display: "block"
                  }}
                />
              )}

              {/* TITRE */}
              <h1 className="article-title mb-3">{article.titre}</h1>

              {/* ⭐ CONTENU AVEC HTML */}
              <div 
                className="article-content mb-4"
                dangerouslySetInnerHTML={{ __html: article.contenu }}
                style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  color: "#333"
                }}
              />

              {/* ACTIONS */}
              <div className="article-actions d-flex gap-3 mb-4">
                <FaHeart
                  className={`action-icon ${isLiked ? "liked" : ""}`}
                  size={28}
                  style={{ cursor: "pointer", color: isLiked ? "#ed4956" : "#555", transition: "color 0.3s" }}
                  onClick={toggleLike}
                />
                <FaBookmark
                  className={`action-icon ${isSaved ? "saved" : ""}`}
                  size={28}
                  style={{ cursor: "pointer", color: isSaved ? "#1e90ff" : "#555", transition: "color 0.3s" }}
                  onClick={toggleSave}
                />
                <FiDownload className="action-icon" size={28} style={{ cursor: "pointer" }} onClick={downloadPDF} />
              </div>

              {/* COMMENTAIRES */}
              <div className="comments-section d-flex flex-column align-items-start">
                <div className="comment-input-wrapper mb-3 w-100 d-flex align-items-center gap-2">
                  <img src={
                    user?.avatar
                      ? `http://localhost:8000${user.avatar}`
                      : DEFAULT_AVATAR
                  } className="comment-avatar" alt="" />
                  <input
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Écrire un commentaire..."
                    className="flex-grow-1 p-2 rounded-pill border border-secondary"
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  />
                  <FiSend className="send-icon" size={22} style={{ cursor: "pointer" }} onClick={handleComment} />
                </div>

                <div className="comment-list d-flex flex-column gap-2">
                  {comments.map(c => {
                    const cu = getUserById(c.utilisateurId);

                    return (
                      <div
                        key={c.idCmm}
                        className="comment-row d-inline-flex align-items-start"
                        onContextMenu={(e) => handleRightClickComment(e, c)}
                      >
                        <img src={
                          cu?.avatar
                            ? `http://localhost:8000${cu.avatar}`
                            : DEFAULT_AVATAR
                        } className="comment-avatar" alt="" />
                        <div className="comment-content position-relative p-2 rounded-3" style={{ background: "#f2f2f2", maxWidth: "80%" }}>
                          <div className="comment-header d-flex justify-content-between">
                            <span className="comment-name">{cu?.nom || "Utilisateur"}</span>
                            <div className="comment-date" style={{ fontSize: "11px", color: "#777" }}>
                              {c.dateCommentaire
                                ? new Date(c.dateCommentaire).toLocaleDateString()
                                : "—"}
                            </div>
                          </div>
                          <div className="comment-text">{c.contenu}</div>
                          {deleteMenu.visible && deleteMenu.commentId === c.idCmm && (
                            <div
                              style={{
                                position: "fixed",
                                top: deleteMenu.y,
                                left: deleteMenu.x,
                                background: "#fff",
                                borderRadius: "10px",
                                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                                padding: "6px",
                                zIndex: 9999,
                                minWidth: "100px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                handleDeleteComment(c.idCmm);
                                setDeleteMenu({ ...deleteMenu, visible: false });
                              }}
                            >
                              <div
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  color: "#e53935",
                                  transition: "background 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#fff1f1"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                              >
                                Supprimer
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Articles similaires */}
            <div style={{ width: "100%" }}>
              <SimilarArticles currentArticleId={article.idAr} />
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}