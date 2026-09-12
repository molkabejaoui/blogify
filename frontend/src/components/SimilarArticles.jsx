import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function SimilarArticles({ currentArticleId }) {
    const navigate = useNavigate();
    const [similarArticles, setSimilarArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getSimilarArticles(currentArticleId)
            .then(setSimilarArticles)
            .finally(() => setLoading(false));
    }, [currentArticleId]);

    return (
        <div className="similar-articles-block">
        <div className="similar-articles-container">
            <h6 className="similar-articles-title">
                Articles similaires
            </h6>

            {loading ? (
                <div className="text-muted small">Chargement...</div>
            ) : similarArticles.length === 0 ? (
                <div className="text-muted small">Aucun article similaire</div>
            ) : (
                <ul className="similar-articles-list">
                    {similarArticles.map(article => (
                        <li
                            key={article.idAr}
                            className="similar-article-item"
                            onClick={() => navigate(`/articles/${article.idAr}`)}
                        >
                            <img
                                src={`http://localhost:8000${article.image}`}
                                alt={article.titre}
                                className="similar-article-img"
                            />
                            <div className="similar-article-content">
                                <div className="similar-article-title">
                                    {article.titre}
                                </div>
                                <div className="similar-article-date">
                                    {new Date(article.datePublication).toLocaleDateString()}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        </div>
    );
}
