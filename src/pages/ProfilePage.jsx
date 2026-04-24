import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
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

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockEmail, setBlockEmail] = useState("");
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
        setBlockedUsers(data.blockedUsers || []);
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

  async function handleBlockByEmail(e) {
    e.preventDefault();
    setMsg("");

    const email = blockEmail.trim().toLowerCase();
    if (!email) return;

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMsg("找不到這個 email");
        return;
      }

      const targetUser = snapshot.docs[0].data();

      if (targetUser.uid === currentUser.uid) {
        setMsg("不能封鎖自己");
        return;
      }

      await updateDoc(doc(db, "users", currentUser.uid), {
        blockedUsers: arrayUnion(targetUser.uid),
        updatedAt: serverTimestamp(),
      });

      setBlockedUsers((prev) =>
        prev.includes(targetUser.uid) ? prev : [...prev, targetUser.uid]
      );
      setBlockEmail("");
      setMsg("封鎖成功");
    } catch (error) {
      console.error(error);
      setMsg("封鎖失敗");
    }
  }

  async function handleUnblock(uid) {
    setMsg("");

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        blockedUsers: arrayRemove(uid),
        updatedAt: serverTimestamp(),
      });

      setBlockedUsers((prev) => prev.filter((item) => item !== uid));
      setMsg("已解除封鎖");
    } catch (error) {
      console.error(error);
      setMsg("解除封鎖失敗");
    }
  }

  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%" }}>
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

      <div style={{ marginTop: "32px", maxWidth: "420px" }}>
        <h2>Block User</h2>

        <form
          onSubmit={handleBlockByEmail}
          style={{ display: "grid", gap: "12px" }}
        >
          <input
            type="email"
            placeholder="輸入要封鎖的 email"
            value={blockEmail}
            onChange={(e) => setBlockEmail(e.target.value)}
          />
          <button type="submit">Block</button>
        </form>

        <div style={{ marginTop: "20px" }}>
          <h3>Blocked Users</h3>

          {blockedUsers.length === 0 ? (
            <p>目前沒有封鎖任何人</p>
          ) : (
            blockedUsers.map((uid) => (
              <div
                key={uid}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #ccc",
                  padding: "8px 12px",
                  marginBottom: "8px",
                }}
              >
                <span>{uid}</span>
                <button onClick={() => handleUnblock(uid)}>Unblock</button>
              </div>
            ))
          )}
        </div>
      </div>

      {msg && <p style={{ marginTop: "16px" }}>{msg}</p>}
    </div>
  );
}