import { useState } from "react";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function InviteMemberPanel({ chatroomId }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function findUserByEmail(targetEmail) {
    const normalizedEmail = targetEmail.trim().toLowerCase();

    const q = query(
      collection(db, "users"),
      where("email", "==", normalizedEmail)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  }

  async function handleInvite(e) {
    e.preventDefault();
    setMsg("");

    if (!email.trim()) {
      setMsg("請輸入 Gmail");
      return;
    }

    try {
      const user = await findUserByEmail(email);

      if (!user) {
        setMsg("找不到這個 Gmail 對應的使用者");
        return;
      }

      await updateDoc(doc(db, "chatrooms", chatroomId), {
        members: arrayUnion(user.uid),
        updatedAt: serverTimestamp(),
      });

      setEmail("");
      setMsg("邀請成功");
    } catch (error) {
      console.error("Invite member error:", error);
      setMsg(error.message);
    }
  }

  return (
    <form onSubmit={handleInvite} className="invite-member-form">
      <input
        type="email"
        placeholder="輸入要邀請的成員 Gmail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button type="submit">Invite</button>

      {msg && <p className="menu-message">{msg}</p>}
    </form>
  );
}