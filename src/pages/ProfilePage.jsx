import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";

export default function ProfilePage() {
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    photoURL: "",
  });

  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;

      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setForm({
          username: data.username || "",
          email: data.email || currentUser.email || "",
          phone: data.phone || "",
          address: data.address || "",
          photoURL: data.photoURL || "",
        });
      }
    }

    fetchProfile();
  }, [currentUser]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setMsg("");

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        username: form.username,
        email: form.email,
        phone: form.phone,
        address: form.address,
        photoURL: form.photoURL,
        updatedAt: serverTimestamp(),
      });

      setMsg("個人資料已儲存");
    } catch (error) {
      console.error(error);
      setMsg("儲存失敗");
    }
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>User Profile</h1>

      <form
        onSubmit={handleSave}
        style={{ display: "grid", gap: "12px", maxWidth: "420px" }}
      >
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone number"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />

        <input
          name="photoURL"
          placeholder="Profile picture URL"
          value={form.photoURL}
          onChange={handleChange}
        />

        <button type="submit">Save Profile</button>
      </form>

      {msg && <p style={{ marginTop: "12px" }}>{msg}</p>}
    </div>
  );
}