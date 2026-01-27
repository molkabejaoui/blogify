import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const ArticleCard = ({ article }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // Plus tard: appel API pour ajouter/retirer des favoris
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    // Plus tard: appel API pour enregistrer l'article
  };

  const handleDownloadPDF = (e) => {
    e.stopPropagation();
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(20);
    doc.text(article.titre, 20, 20);
    
    // Auteur et date
    doc.setFontSize(12);
    doc.text(`Par ${article.auteur} - ${article.dateCreation}`, 20, 30);
    
    // Contenu (avec retour à la ligne automatique)
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(article.contenu, 170);
    doc.text(splitText, 20, 40);
    
    // Télécharger
    doc.save(`${article.titre}.pdf`);
  };

  const handleCardClick = () => {
    navigate(`/article/${article.idAr}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 max-w-2xl mx-auto">
      {/* Header de la card (auteur) */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
            {article.auteur[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{article.auteur}</p>
            <p className="text-xs text-gray-500">{article.dateCreation}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
          {article.categorie}
        </span>
      </div>

      {/* Image */}
      <div 
        className="cursor-pointer"
        onClick={handleCardClick}
      >
        <img 
          src={article.image} 
          alt={article.titre}
          className="w-full h-96 object-cover"
        />
      </div>

      {/* Actions (coeur, téléchargement, enregistrement) */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            {/* Coeur (favoris) */}
            <button 
              onClick={handleFavorite}
              className="hover:scale-110 transition-transform"
            >
              {isFavorite ? (
                <svg className="w-7 h-7 text-red-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ) : (
                <svg className="w-7 h-7 text-gray-700 hover:text-red-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              )}
            </button>

            {/* Télécharger PDF */}
            <button 
              onClick={handleDownloadPDF}
              className="hover:scale-110 transition-transform"
              title="Télécharger en PDF"
            >
              <svg className="w-7 h-7 text-gray-700 hover:text-blue-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </button>
          </div>

          {/* Enregistrer */}
          <button 
            onClick={handleSave}
            className="hover:scale-110 transition-transform"
            title="Enregistrer l'article"
          >
            {isSaved ? (
              <svg className="w-7 h-7 text-gray-700 fill-current" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
            ) : (
              <svg className="w-7 h-7 text-gray-700 hover:text-yellow-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Vues et temps de lecture */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
          <span className="font-semibold">{article.vues.toLocaleString()} vues</span>
          <span>• {article.tempsLecture} min de lecture</span>
        </div>

        {/* Titre (cliquable) */}
        <h2 
          onClick={handleCardClick}
          className="text-xl font-bold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition"
        >
          {article.titre}
        </h2>

        {/* Extrait du contenu */}
        <p className="text-gray-600 mb-3">
          {article.contenu.substring(0, 150)}...
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;