import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiGrid, FiHeart, FiBookmark, FiEdit2, FiTrash2
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import defaultAvatar from "../assets/default-avatar.png";

const DEFAULT_AVATAR = defaultAvatar;

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser, isAdmin } = useAuth();
  const canSeePrivate =
    user && (user.id === Number(id) || isAdmin);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [saved, setSaved] = useState([]);
  const [tab, setTab] = useState("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [hoveredPost, setHoveredPost] = useState(null);

  useEffect(() => {
    async function load() {
      const u = await api.getUserById(id);
      setProfile(u);
      setBio(u.bio || "");

      const all = await api.getArticles();
      setPosts(all.filter(a => a.utilisateurId === Number(id)));

      if (user && (user.id === Number(id) || isAdmin)) {
        setFavorites(await api.getFavorites());
        setSaved(await api.getSaved());
      }
    }
    load();
  }, [id, user, isAdmin]);

  const saveProfile = async () => {
    try {
      const formData = new FormData();
      if (bio !== null) formData.append("bio", bio);

      if (avatar === "REMOVE") {
        formData.append("remove_avatar", "1");
      } else if (avatar) {
        formData.append("avatar", avatar);
      }

      const res = await api.updateProfile(formData);
      updateUser(res);
      setProfile(res);
      setEditOpen(false);
    } catch (e) {
      console.error("Erreur update profile", e);
    }
  };

  const deleteArticle = async (articleId) => {
    try {
      const res = await api.deleteArticle(articleId);
      console.log("Delete response:", res);
      setPosts(posts.filter(p => p.idAr !== articleId));
    } catch (e) {
      console.error("Erreur suppression article", e.response?.data || e.message);
    }
  };

  const toggleSave = async (articleId) => {
    try {
      const res = await api.toggleSave(articleId);
      if (res.status === "added") {
        const all = await api.getArticles();
        const newItem = all.find(a => a.idAr === articleId);
        if (newItem) setSaved([...saved, newItem]);
      } else if (res.status === "removed") {
        setSaved(saved.filter(s => s.idAr !== articleId));
      }
    } catch (e) {
      console.error("Erreur toggle save", e);
    }
  };

  const list =
    tab === "posts"
      ? posts
      : tab === "likes" && canSeePrivate
        ? favorites
        : tab === "saved" && canSeePrivate
          ? saved
          : [];

  if (!profile) return <div className="text-center p-5">Chargement…</div>;

  return (
    <>
      <div className="layout d-flex bg-light">
        <Sidebar />

        <main className="flex-grow-1 py-4 main-content profile-page">
          {/* HEADER */}
          <div className="profile-header">
            <div className="avatar-box">
              <img
                src={
                  profile.avatar
                    ? `http://localhost:8000${profile.avatar}`
                    : DEFAULT_AVATAR
                }
                alt="avatar"
              />
              {user?.id === profile.id && (
                <button
                  className="edit-avatar"
                  onClick={() => setEditOpen(true)}
                  title="Modifier le profil"
                >
                  <FiEdit2 />
                </button>
              )}
            </div>

            <div>
              <h2>{profile.nom}</h2>
              <p className="bio">{profile.bio || "Aucune bio…"}</p>
            </div>
          </div>

          {/* TABS */}
          <div className="profile-tabs">
            <button
              className={tab === "posts" ? "active" : ""}
              onClick={() => setTab("posts")}
            >
              <FiGrid />
            </button>

            {canSeePrivate && (
              <>
                <button
                  className={tab === "likes" ? "active" : ""}
                  onClick={() => setTab("likes")}
                >
                  <FiHeart />
                </button>

                <button
                  className={tab === "saved" ? "active" : ""}
                  onClick={() => setTab("saved")}
                >
                  <FiBookmark />
                </button>
              </>
            )}
          </div>

          {/* GRID */}
          <div className="profile-grid">
            {list.map(a => {
              const canDelete =
                tab === "posts" && (user?.id === profile.id || isAdmin);

              return (
                <div
                  key={a.idAr}
                  className="post-card"
                  style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
                  onMouseEnter={() => setHoveredPost(a.idAr)}
                  onMouseLeave={() => setHoveredPost(null)}
                  onClick={() => navigate(`/articles/${a.idAr}`)}
                >
                  <img
                    src={`http://localhost:8000${a.image}`}
                    alt=""
                    style={{ display: "block", width: "100%" }}
                  />

                  {/* OVERLAY + POUBELLE AU SURVOL */}
                  {canDelete && hoveredPost === a.idAr && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "opacity 0.2s ease",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteArticle(a.idAr);
                        }}
                        title="Supprimer l'article"
                        style={{
                          background: "rgba(255, 255, 255, 0.15)",
                          border: "none",
                          borderRadius: "50%",
                          width: 48,
                          height: 48,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#fff",
                          fontSize: 20,
                          transition: "background 0.2s ease, transform 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(248, 113, 113, 0.9)";
                          e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* EDIT PROFILE */}
          {editOpen && (
            <div className="edit-modal">
              <div className="edit-box">
                <h4>Modifier le profil</h4>

                <div className="avatar-edit">
                  <img
                    src={
                      avatar === "REMOVE"
                        ? DEFAULT_AVATAR
                        : avatar
                          ? URL.createObjectURL(avatar)
                          : profile.avatar
                            ? `http://localhost:8000${profile.avatar}`
                            : DEFAULT_AVATAR
                    }
                    alt="avatar preview"
                    className="preview-avatar"
                  />

                  <label className="upload-btn">
                    Changer la photo
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={e => setAvatar(e.target.files[0])}
                    />
                  </label>

                  <button
                    className="remove-avatar"
                    onClick={() => setAvatar("REMOVE")}
                  >
                    Supprimer la photo
                  </button>
                </div>

                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Votre bio…"
                />

                <div className="actions">
                  <button onClick={() => setEditOpen(false)}>Annuler</button>
                  <button className="save" onClick={saveProfile}>
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}