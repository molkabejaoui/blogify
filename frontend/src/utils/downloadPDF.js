import jsPDF from "jspdf";



/* gerer la structure de la page et le style de fichier pdf */



// ✅ Convertit le HTML en texte brut structuré
const htmlToBlocks = (htmlContent) => {
  const temp = document.createElement("div");
  temp.innerHTML = htmlContent;

  const blocks = [];

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push({ type: "text", content: text });
      return;
    }

    const tag = node.tagName?.toLowerCase();

    if (["h1", "h2", "h3"].includes(tag)) {
      const text = node.textContent?.trim();
      if (text) blocks.push({ type: "heading", content: text, level: tag });
    } else if (tag === "p") {
      const text = node.textContent?.trim();
      if (text) blocks.push({ type: "paragraph", content: text });
    } else if (tag === "ul" || tag === "ol") {
      node.querySelectorAll("li").forEach((li, i) => {
        const text = li.textContent?.trim();
        if (text) blocks.push({ type: "li", content: text, ordered: tag === "ol", index: i + 1 });
      });
    } else if (tag === "blockquote") {
      const text = node.textContent?.trim();
      if (text) blocks.push({ type: "quote", content: text });
    } else if (tag === "strong" || tag === "b") {
      const text = node.textContent?.trim();
      if (text) blocks.push({ type: "bold", content: text });
    } else if (tag === "br") {
      blocks.push({ type: "br" });
    } else {
      node.childNodes.forEach(walk);
    }
  };

  temp.childNodes.forEach(walk);
  return blocks;
};

export const downloadArticlePDF = async (article) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageW = pdf.internal.pageSize.getWidth();   // 210mm
  const pageH = pdf.internal.pageSize.getHeight();  // 297mm
  const marginLeft = 18;
  const marginRight = 18;
  const marginTop = 20;
  const marginBottom = 20;
  const contentWidth = pageW - marginLeft - marginRight; // ~174mm

  let y = marginTop; // curseur vertical courant

  // ─── Helpers ────────────────────────────────────────────────

  const checkNewPage = (neededHeight = 10) => {
    if (y + neededHeight > pageH - marginBottom) {
      pdf.addPage();
      y = marginTop;
    }
  };

  const addText = (text, options = {}) => {
    const {
      fontSize = 11,
      fontStyle = "normal",
      color = [30, 30, 30],
      lineHeight = 6.5,
      indent = 0,
    } = options;

    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", fontStyle);
    pdf.setTextColor(...color);

    const maxWidth = contentWidth - indent;
    const lines = pdf.splitTextToSize(text, maxWidth);

    lines.forEach((line) => {
      checkNewPage(lineHeight);
      pdf.text(line, marginLeft + indent, y);
      y += lineHeight;
    });
  };

  const addSpacing = (mm = 4) => {
    y += mm;
  };

  const addDivider = () => {
    checkNewPage(6);
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.line(marginLeft, y, pageW - marginRight, y);
    y += 5;
  };

  // ─── IMAGE de l'article ──────────────────────────────────────
  if (article.image) {
    try {
      const imgUrl = `http://localhost:8000${article.image}`;

      // Charger l'image via canvas pour l'encoder en base64
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.crossOrigin = "anonymous";
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = imgUrl;
      });

      const canvas = document.createElement("canvas");
      const maxImgWidth = 800;
      const ratio = Math.min(maxImgWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL("image/jpeg", 0.85);

      const pdfImgWidth = contentWidth;
      const pdfImgHeight = (canvas.height * pdfImgWidth) / canvas.width;
      const clampedHeight = Math.min(pdfImgHeight, 80); // max 80mm

      checkNewPage(clampedHeight);
      pdf.addImage(imgData, "JPEG", marginLeft, y, pdfImgWidth, clampedHeight, "", "FAST");
      y += clampedHeight + 6;
    } catch {
      // image non chargeable, on continue sans
    }
  }

  // ─── Catégorie + Tags ────────────────────────────────────────
  if (article.categorie) {
    checkNewPage(8);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 119, 204);
    pdf.text(article.categorie, marginLeft, y);
    y += 5;
  }

  if (article.tags?.length) {
    checkNewPage(7);
    const tagStr = article.tags.map(t => `#${typeof t === "string" ? t : t.nom}`).join("  ");
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(120, 120, 120);
    pdf.text(tagStr, marginLeft, y);
    y += 5;
  }

  addSpacing(3);

  // ─── Titre ───────────────────────────────────────────────────
  addText(article.titre, {
    fontSize: 20,
    fontStyle: "bold",
    color: [15, 15, 15],
    lineHeight: 9,
  });

  addSpacing(2);

  // ─── Date ────────────────────────────────────────────────────
  const rawDate = article.ddatePublication || article.datePublication;
  if (rawDate) {
    const dateStr = new Date(rawDate).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric"
    });
    addText(dateStr, {
      fontSize: 9,
      color: [160, 160, 160],
      lineHeight: 5,
    });
  }

  addSpacing(3);
  addDivider();

  // ─── Contenu ─────────────────────────────────────────────────
  const blocks = htmlToBlocks(article.contenu);

  for (const block of blocks) {
    if (block.type === "heading") {
      addSpacing(3);
      const size = block.level === "h1" ? 15 : block.level === "h2" ? 13 : 11;
      addText(block.content, { fontSize: size, fontStyle: "bold", color: [20, 20, 20], lineHeight: 7 });
      addSpacing(1);

    } else if (block.type === "paragraph" || block.type === "text") {
      addSpacing(1);
      addText(block.content, { fontSize: 11, color: [40, 40, 40], lineHeight: 6.5 });
      addSpacing(2);

    } else if (block.type === "bold") {
      addText(block.content, { fontSize: 11, fontStyle: "bold", color: [30, 30, 30], lineHeight: 6.5 });

    } else if (block.type === "li") {
      const prefix = block.ordered ? `${block.index}.` : "•";
      addText(`${prefix}  ${block.content}`, { fontSize: 11, color: [40, 40, 40], lineHeight: 6.2, indent: 4 });

    } else if (block.type === "quote") {
      addSpacing(2);
      checkNewPage(10);
      pdf.setDrawColor(0, 119, 204);
      pdf.setLineWidth(0.8);
      pdf.line(marginLeft, y - 1, marginLeft, y + 8);
      addText(block.content, { fontSize: 11, color: [80, 80, 80], lineHeight: 6.5, indent: 6 });
      addSpacing(2);

    } else if (block.type === "br") {
      addSpacing(3);
    }
  }

  // ─── Footer sur chaque page ───────────────────────────────────
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(180, 180, 180);
    pdf.text(`Blogify  —  Page ${i} / ${totalPages}`, pageW / 2, pageH - 10, { align: "center" });
  }

  pdf.save(`${article.titre}.pdf`);
};