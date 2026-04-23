import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function CreateChatroomModal({ currentUserId }) {
  const [roomName, setRoomName] = useState("");
  const [type, setType] = useState("group");
  const [memberText, setMemberText] = useState("");
  const [msg, setMsg] = useState("");

  async function handleCreateChatroom(e) {
    e.preventDefault();
    setMsg("");

    try {
      const extraMembers = memberText
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      const members = Array.from(new Set([currentUserId, ...extraMembers]));

      const docRef = await addDoc(collection(db, "chatrooms"), {
        type,
        name: roomName,
        createdBy: currentUserId,
        members,
        lastMessage: "",
        lastMessageAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMsg(`聊天室建立成功，ID: ${docRef.id}`);
      setRoomName("");
      setMemberText("");
      setType("group");
    } catch (error) {
      setMsg(error.message);
    }
  }

  return (
    <div style={{ padding: "24px", border: "1px solid #ccc", marginTop: "20px" }}>
      <h2>Create Chatroom</h2>

      <form onSubmit={handleCreateChatroom} style={{ display: "grid", gap: "12px", maxWidth: "420px" }}>
        <input
          type="text"
          placeholder="聊天室名稱"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="group">group</option>
          <option value="direct">direct</option>
        </select>

        <input
          type="text"
          placeholder="其他成員 uid，用逗號分隔"
          value={memberText}
          onChange={(e) => setMemberText(e.target.value)}
        />

        <button type="submit">Create Chatroom</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}