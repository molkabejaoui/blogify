import { useEffect, useRef, useState } from "react";

// ✅ Même fonction que dans Home.jsx — extrait le texte propre sans HTML
const extractFirstParagraph = (htmlContent) => {
  if (!htmlContent) return "";
  const temp = document.createElement("div");
  temp.innerHTML = htmlContent;

  // Chercher le premier <p> qui contient du vrai texte (pas vide)
  const paragraphs = temp.querySelectorAll("p");
  for (let p of paragraphs) {
    const text = p.textContent?.trim();
    if (text && text.length > 10) { // ignorer les <p> vides ou trop courts
      return text.length > 80 ? text.substring(0, 80) + "…" : text;
    }
  }

  // Fallback : prendre tout le texte brut
  const fallback = temp.textContent?.trim() || "";
  return fallback.length > 80 ? fallback.substring(0, 80) + "…" : fallback;
};

export default function SearchBar({ data = [], onSearch }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = data.filter((a) =>
      a.titre?.toLowerCase().includes(q) ||
      a.contenu?.toLowerCase().includes(q) ||
      a.tags?.some((tag) => tag.nom?.toLowerCase().includes(q))
    );
    setResults(filtered.slice(0, 6));
  }, [query, data]);

  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (article) => {
    setQuery("");
    setResults([]);
    onSearch(article);
  };

  return (
    <div ref={boxRef} className="search-box">
      <input
        type="text"
        placeholder="Rechercher par titre, contenu ou tag…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      {results.length > 0 && (
        <div className="search-results" style={{ maxHeight: "320px", overflowY: "auto", scrollbarWidth: "none" }}>
          {results.map((a) => (
            <div
              key={a.idAr}
              className="search-item"
              onClick={() => handleSelect(a)}
            >
              <div className="search-title">{a.titre}</div>
              {/* ✅ Texte propre, sans balises HTML */}
              <div className="search-snippet">
                {extractFirstParagraph(a.contenu)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}