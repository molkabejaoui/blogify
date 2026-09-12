import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import {
  FiImage, FiSend, FiX, FiZap, FiBold, FiItalic,
  FiList, FiUnderline, FiCheckCircle, FiEdit3
} from "react-icons/fi";

export default function CreateArticle() {
  const [isScanning, setIsScanning] = useState(false);
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false
  });

  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiCorrecting, setIsAiCorrecting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [aiErrors, setAiErrors] = useState([]);

  const [categorie, setCategorie] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagsSelectionnes, setTagsSelectionnes] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [allCats, setAllCats] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [generationBuffer, setGenerationBuffer] = useState("");

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    api.getCategories().then(setAllCats);
    api.getTags().then(setAllTags);
  }, []);

  /* ----------- SUGGESTIONS IA ----------- */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (contenu.trim().length > 5) {
        try {
          const res = await api.getAISuggestions(contenu);
          if (res.errors) setAiErrors(res.errors);
          setSuggestion(res.suggestion || "");
        } catch (err) {
          console.error(err);
        }
      } else {
        setAiErrors([]);
        setSuggestion("");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [contenu]);

  /* -------- AUTO SCROLL IA -------- */
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.scrollTop = editorRef.current.scrollHeight;
    }
  }, [contenu]);

  /* ---------------- ACTIONS ---------------- */
  const handleKeyDown = (e) => {
    if (e.key === "Shift" && suggestion) {
      e.preventDefault();
      setContenu(contenu + suggestion);
      setSuggestion("");
    }
  };

  useEffect(() => {
    const handler = () => {
      setActiveStyles({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    };

    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const detectStyles = () => {
    const textarea = document.querySelector(".real-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = contenu.substring(start, end);

    setActiveStyles({
      bold: selected.startsWith("**") && selected.endsWith("**"),
      italic: selected.startsWith("*") && selected.endsWith("*"),
      underline: selected.startsWith("<u>") && selected.endsWith("</u>")
    });
  };

  const handleTextChange = (e) => {
    setContenu(e.target.value);
  };

  const appliquerCorrection = (word, replacement) => {
    setContenu(contenu.replace(word, replacement));
    setAiErrors(prev => prev.filter(e => e.word !== word));
  };

  const handleAiMagic = async () => {
    if (contenu.trim().length < 5) return;

    setIsAiCorrecting(true);
    setIsScanning(true);

    try {
      const res = await api.aiCorrect(contenu);
      if (res.corrected && editorRef.current) {
        setTimeout(() => {
          editorRef.current.innerHTML = res.corrected;
          setContenu(res.corrected);
          editorRef.current.focus();
          setIsScanning(false);
        }, 1200);
        setAiErrors([]);
      }
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    } finally {
      setIsAiCorrecting(false);
    }
  };


const handleAiGenerate = async () => {
  if (!titre || !categorie) return alert("Titre et catégorie requis !");
  setIsGenerating(true);
  setContenu("");
  if (editorRef.current) editorRef.current.innerText = "";

  try {
    const res = await fetch("http://localhost:8000/articles/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titre,
        categorie,
        tags: tagsSelectionnes.join(","),
      }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      
      if (editorRef.current) {
        editorRef.current.innerText = fullText.replace(/\*\*/g, '');
      }
      
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    const cleanText = fullText.replace(/\*\*/g, '').trim();
    const formattedHTML = formatAiTextToHTML(cleanText);
    
    if (editorRef.current) {
      editorRef.current.innerHTML = formattedHTML;
    }
    setContenu(formattedHTML);

  } catch (err) {
    console.error("Erreur génération IA :", err);
    alert("Erreur lors de la génération IA");
  } finally {
    setIsGenerating(false);
  }
};

const formatAiTextToHTML = (text) => {
  text = text.replace(/<think>.*?<\/think>/gs, '');
  text = text.replace(/\*\*/g, '');
  text = text.replace(/##/g, '');
  
  const lines = text.split('\n');
  let html = '';
  
  for (let line of lines) {
    line = line.trim();
    
    if (!line) continue;
    
    // ⭐ DÉTECTION AMÉLIORÉE DES TITRES
    // Un titre = ligne en MAJUSCULES entre 3 et 100 caractères
    const isAllCaps = line === line.toUpperCase();
    const hasNoPunctuation = !line.match(/[.!?,;:]$/);
    const isReasonableLength = line.length >= 3 && line.length <= 100;
    
    const isTitle = isAllCaps && hasNoPunctuation && isReasonableLength;
    
    if (isTitle) {
      // ⭐ Titres avec la MÊME taille que le texte (16px), juste en gras
      html += `<strong style="display: block; margin-top: 20px; margin-bottom: 10px; font-size: 16px; font-weight: bold; color: #1a1a1a;">${line}</strong>`;
    } else {
      // Paragraphe normal
      html += `<p style="margin-bottom: 16px; line-height: 1.8; color: #333; font-size: 16px;">${line}</p>`;
    }
  }
  
  return html;
};


  const toggleStyle = (style) => {
    editorRef.current.focus();

    if (style === "bold") document.execCommand("bold");
    if (style === "italic") document.execCommand("italic");
    if (style === "underline") document.execCommand("underline");

    setContenu(editorRef.current.innerHTML);
  };

  const handleEditableInput = () => {
    if (!isGenerating) {
      setContenu(editorRef.current.innerHTML); // ⭐ Garder le HTML
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contenu || !titre || !categorie) return alert("Remplir tous les champs !");

    setLoading(true);

    const formData = new FormData();
    formData.append("titre", titre);
    formData.append("contenu", contenu); // ⭐ Envoyer le HTML
    formData.append("categorieNom", categorie);
    formData.append("tags", tagsSelectionnes.join(","));
    if (image) formData.append("image", image);

    try {
      await api.createArticle(formData);
      navigate("/");
    } catch (err) {
      console.error("Erreur backend:", err.response || err);
      alert("Erreur lors de la publication");
    } finally {
      setLoading(false);
    }
  };

  const insertAtCursorPlainText = (text) => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    editorRef.current.focus();
    setContenu(editorRef.current.innerHTML); // ⭐ Garder le HTML
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <div className="layout d-flex bg-light">
        <Sidebar />

        <main className="flex-grow-1 py-4 main-content">
          <form onSubmit={handleSubmit} className="editor-container">

            {/* TITRE */}
            <input
              className="title-input-modern"
              placeholder="Titre de l'article..."
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
            />

            {/* ZONE MÉTA */}
            <div className="meta-zone-aligned mb-4">
              <div className="meta-item">
                <label className="fw-bold small text-muted d-block">CATÉGORIE</label>
                <div className="tags-input-wrapper category-wrapper">
                  <input
                    list="cats"
                    value={categorie}
                    placeholder="Choisir une catégorie"
                    onChange={e => setCategorie(e.target.value)}
                  />
                </div>

                <datalist id="cats">
                  {allCats.map(c => (
                    <option key={c.idC} value={c.nom} />
                  ))}
                </datalist>
              </div>

              <div className="meta-item flex-grow-1">
                <label className="fw-bold small text-muted d-block">TAGS</label>
                <div className="tags-input-wrapper">
                  {tagsSelectionnes.map(tag => (
                    <span key={tag} className="tag-chip">
                      {tag}
                      <FiX onClick={() =>
                        setTagsSelectionnes(tagsSelectionnes.filter(t => t !== tag))
                      } />
                    </span>
                  ))}

                  <input
                    value={tagInput}
                    placeholder="Ajouter un tag"
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        if (!tagsSelectionnes.includes(tagInput)) {
                          setTagsSelectionnes([...tagsSelectionnes, tagInput]);
                          setTagInput("");
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* IMAGE */}
            <div className="image-dropzone mb-4" onClick={() => document.getElementById("img").click()}>
              {preview ? <img src={preview} alt="" /> : <FiImage size={24} />}
              <input id="img" type="file" hidden onChange={e => {
                const file = e.target.files[0];
                setImage(file);
                setPreview(URL.createObjectURL(file));
              }} />
            </div>

            {/* TOOLBAR */}
            <div className="word-toolbar px-4 py-2 border-bottom d-flex gap-3 align-items-center bg-white">
              <button
                type="button"
                className={`btn btn-link p-0 ${activeStyles.bold ? "text-primary" : "text-dark"}`}
                onClick={() => toggleStyle("bold")}
              >
                <FiBold size={20} />
              </button>

              <button
                type="button"
                className={`btn btn-link p-0 ${activeStyles.italic ? "text-primary" : "text-dark"}`}
                onClick={() => toggleStyle("italic")}
              >
                <FiItalic size={20} />
              </button>

              <button
                type="button"
                className={`btn btn-link p-0 ${activeStyles.underline ? "text-primary" : "text-dark"}`}
                onClick={() => toggleStyle("underline")}
              >
                <FiUnderline size={20} />
              </button>

              <div className="ms-auto d-flex gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleAiGenerate} disabled={isGenerating}>
                  <FiEdit3 className={isGenerating ? "animate-spin" : ""} /> {isGenerating ? "Rédaction..." : "Générer"}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm btn-primary ${isAiCorrecting ? 'active' : ''}`}
                  onClick={handleAiMagic}
                  disabled={isAiCorrecting}
                >
                  {isAiCorrecting ? (
                    <>
                      <FiZap className="animate-spin" /> Correction...
                    </>
                  ) : (
                    <>
                      <FiZap /> CORRIGÉE
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ZONE TEXTE */}
            <div className="text-area-wrapper mt-2">
              <div className="editor-inner-container" style={{ position: 'relative' }}>
                <div className="suggestion-overlay">
                  <span className="transparent-text">{contenu.replace(/<[^>]*>/g, '')}</span>
                  <span className="ghost-text">{suggestion}</span>
                </div>

                <div
                  ref={editorRef}
                  className={`real-editor ${isScanning ? 'scanning' : ''}`}
                  contentEditable
                  onInput={handleEditableInput}
                  onKeyDown={handleKeyDown}
                  suppressContentEditableWarning
                />
              </div>

              {/* BOUTON PUBLIER */}
              <div className="d-flex justify-content-end mt-4">
                <button
                  type="submit"
                  className="btn-login"
                  disabled={loading}
                  style={{ minWidth: '180px' }}
                >
                  {loading ? "CHARGEMENT..." : (
                    <>
                      PUBLIER L'ARTICLE
                      <FiSend className="ms-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      <Footer />
    </>
  );
}