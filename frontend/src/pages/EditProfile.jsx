import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    setAvatar(user.avatar || "");
    setBio(user.bio || "");
  }, [user]);

  const handleSave = async () => {
    await api.updateUser(user.id, { avatar, bio });
    alert("Profile mis à jour !");
    navigate(`/users/${user.id}`);
  };

  return (
    <div className="edit-page">
      <h2>Modifier Profile</h2>

      <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="URL avatar" />
      <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" />

      <button onClick={handleSave}>Sauvegarder</button>
    </div>
  );
}
