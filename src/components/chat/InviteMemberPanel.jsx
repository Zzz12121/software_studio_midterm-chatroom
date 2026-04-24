import { useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function InviteMemberPanel({ chatroomId }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function handleInvite(e) {
    e.preventDefault();
    setMsg("");

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", targetEmail)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMsg("找不到這個 email 的使用者");
        return;
      }

      const targetUser = snapshot.docs[0];
      const targetUid = targetUser.data().uid;

      await updateDoc(doc(db, "chatrooms", chatroomId), {
        members: arrayUnion(targetUid),
      });

      setMsg("邀請成功");
      setEmail("");
    } catch (error) {
      console.error(error);
      setMsg("邀請失敗");
    }
  }

  if (!chatroomId) {
    return null;
  }

  return (
    <div style={{ marginTop: "12px" }}>
      <form onSubmit={handleInvite} style={{ display: "grid", gap: "8px" }}>
        <input
          type="email"
          placeholder="輸入要邀請的會員 email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Invite Member</button>
      </form>

      {msg && <p style={{ marginTop: "8px" }}>{msg}</p>}
    </div>
  );
}