import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [favoris, setFavoris] = useState([]);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    api.getUsers().then(setUsers);
    api.getArticles().then(setArticles);
    api.getFavorites().then(setFavoris);
    api.getComments().then(setComments);
    api.getStats().then(setStats);
  }, []);

  // Stats admin
  const totalUsers = users.length;
  const totalArticles = articles.length;

  // article le plus enregistré
  const articleMostSaved = favoris.reduce((acc, fav) => {
    acc[fav.articleId] = (acc[fav.articleId] || 0) + 1;
    return acc;
  }, {});

  const mostSavedArticleId = Object.keys(articleMostSaved).reduce((a,b) => articleMostSaved[a] > articleMostSaved[b] ? a : b, 0);

  const mostSavedArticle = articles.find(a => a.idAr == mostSavedArticleId);

  // article le plus commenté
  const mostCommented = comments.reduce((acc, c) => {
    acc[c.articleId] = (acc[c.articleId] || 0) + 1;
    return acc;
  }, {});

  const mostCommentedArticleId = Object.keys(mostCommented).reduce((a,b) => mostCommented[a] > mostCommented[b] ? a : b, 0);
  const mostCommentedArticle = articles.find(a => a.idAr == mostCommentedArticleId);

  // derniers articles
  const latestArticles = [...articles].sort((a,b) => new Date(b.datePublication) - new Date(a.datePublication)).slice(0,5);

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Admin</h1>

      <div className="stats">
        <div>Utilisateurs : {totalUsers}</div>
        <div>Articles : {totalArticles}</div>
        <div>Article le plus enregistré : {mostSavedArticle?.titre}</div>
        <div>Article le plus commenté : {mostCommentedArticle?.titre}</div>
      </div>

      <div>
        <h3>Articles récents</h3>
        {latestArticles.map(a => (
          <div key={a.idAr}>{a.titre}</div>
        ))}
      </div>
    </div>
  );
}
