// src/pages/AdminMessages.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer"; // 🔥 Ajouter le Footer

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getContactMessages()
      .then(res => setMessages(res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Chargement des messages...</div>;
  }

  return (
    <>
      {/* 🔥 Même structure que Home.jsx */}
      <div className="layout d-flex bg-light">
        <Sidebar />

        <main className="flex-grow-1 py-4 main-content">
          <div
            style={{
              width: "100%",
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "0 16px",
            }}
          >
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
              Messages des utilisateurs
            </h1>

            {messages.length === 0 ? (
              <p className="text-gray-500">
                Aucun message pour le moment.
              </p>
            ) : (
              <div className="admin-messages-card">
                {/* HEADER */}
                <div className="admin-messages-header">
                  <div>Email</div>
                  <div>Message</div>
                  <div>Date</div>
                  <div>Action</div>
                </div>

                {/* ROWS */}
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className="admin-message-row"
                  >
                    {/* EMAIL */}
                    <div className="admin-message-email">
                      {msg.email}
                    </div>

                    {/* MESSAGE */}
                    <div className="admin-message-text">
                      {msg.message}
                    </div>

                    {/* DATE */}
                    <div className="admin-message-date">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </div>

                    {/* ACTION */}
                    <div>
                      <a
                        href={`mailto:${msg.email}?subject=Réponse à votre message`}
                        className="admin-reply-btn"
                      >
                        Répondre
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 🔥 Footer en dehors du layout */}
      <Footer />
    </>
  );
}