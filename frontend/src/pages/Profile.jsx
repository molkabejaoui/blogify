// src/pages/Profile.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_AVATAR } from "../data/mockData";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [saved, setSaved] = useState([]);
  const [bio, setBio] = useState("");

  useEffect(() => {
    api.getUserById(id).then(u => {
      setProfile(u);
      setBio(u.bio || "");
    });

    api.getArticles().then(all => setArticles(all.filter(a => a.utilisateurId === Number(id))));
    api.getFavoritesByUser(id).then(setFavorites);
    api.getSavedByUser(id).then(setSaved);
  }, [id]);

  const updateProfile = () => {
    if (!user || user.id !== Number(id)) return alert("Tu peux pas modifier ce profile !");
    api.updateUser(id, { bio }).then(() => alert("Bio mis à jour"));
  };

  if (!profile) return null;

  return (
    <div className="layout">
      <Sidebar />

      <main className="profile-page">
        <div className="profile-header">
          <div className="avatar-wrapper">
            <img src={profile.avatar ?? DEFAULT_AVATAR} className="profile-avatar" />

            {user && user.id === Number(id) && (
              <button className="edit-avatar" onClick={() => navigate("/edit-profile")}>
                ✎
              </button>
            )}
          </div>

          <h2>{profile.nom}</h2>
          <p>{profile.email}</p>

          <div className="bio">
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ajouter une bio..."/>
            <button onClick={updateProfile}>Sauvegarder Bio</button>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-section">
            <h3>Articles publiés</h3>
            <div className="profile-posts">
              {articles.map(a => (
                <div key={a.idAr} className="profile-post" onClick={() => navigate(`/articles/${a.idAr}`)}>
                  <img src={a.image} />
                  <h4>{a.titre}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <h3>Favoris</h3>
            <div className="profile-posts">
              {favorites.map(f => {
                const art = articles.find(a => a.idAr === f.articleId) || null;
                return art ? (
                  <div key={f.idF} className="profile-post" onClick={() => navigate(`/articles/${art.idAr}`)}>
                    <img src={art.image} />
                    <h4>{art.titre}</h4>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div className="profile-section">
            <h3>Enregistrements</h3>
            <div className="profile-posts">
              {saved.map(s => {
                const art = articles.find(a => a.idAr === s.articleId) || null;
                return art ? (
                  <div key={s.idS} className="profile-post" onClick={() => navigate(`/articles/${art.idAr}`)}>
                    <img src={art.image} />
                    <h4>{art.titre}</h4>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
