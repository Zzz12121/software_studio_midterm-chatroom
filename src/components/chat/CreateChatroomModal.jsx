import { useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function CreateChatroomModal({ currentUserId }) {
  const [roomName, setRoomName] = useState("");
  const [roomPhotoURL, setRoomPhotoURL] = useState("");
  const [roomType, setRoomType] = useState("group");
  const [memberEmails, setMemberEmails] = useState("");
  const [msg, setMsg] = useState("");

  async function findUserByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) return null;

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

  async function handleCreateChatroom(e) {
    e.preventDefault();
    setMsg("");

    try {
      const emails = memberEmails
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

      if (roomType === "direct" && emails.length !== 1) {
        setMsg("私聊只能輸入一個對方 Gmail");
        return;
      }

      if (roomType === "group" && emails.length === 0) {
        setMsg("群組至少要輸入一個成員 Gmail");
        return;
      }

      const foundUsers = [];

      for (const email of emails) {
        const user = await findUserByEmail(email);

        if (!user) {
          setMsg(`找不到使用者：${email}`);
          return;
        }

        if (user.uid === currentUserId) {
          setMsg("不能把自己填在其他成員欄位");
          return;
        }

        foundUsers.push(user);
      }

      const memberIds = [
        currentUserId,
        ...foundUsers.map((user) => user.uid),
      ];

      const uniqueMemberIds = Array.from(new Set(memberIds));

      await addDoc(collection(db, "chatrooms"), {
        type: roomType,
        name:
          roomType === "group"
            ? roomName.trim() || "未命名群組"
            : "",
        photoURL: roomType === "group" ? roomPhotoURL.trim() : "",
        createdBy: currentUserId,
        members: uniqueMemberIds,
        lastMessage: "",
        lastSenderId: "",
        lastMessageAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setRoomName("");
      setRoomPhotoURL("");
      setMemberEmails("");
      setMsg("聊天室建立成功");
    } catch (error) {
      console.error("Create chatroom error:", error);
      setMsg(error.message);
    }
  }

  return (
    <div className="panel-card">
      <h2>Create Chatroom</h2>

      <form onSubmit={handleCreateChatroom} className="form-grid">
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
        >
          <option value="group">group</option>
          <option value="direct">direct</option>
        </select>

        {roomType === "group" && (
          <>
            <input
              type="text"
              placeholder="群組聊天室名稱"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />

            <input
              type="text"
              placeholder="群組頭像 URL，可不填"
              value={roomPhotoURL}
              onChange={(e) => setRoomPhotoURL(e.target.value)}
            />
          </>
        )}

        <input
          type="text"
          placeholder={
            roomType === "direct"
              ? "對方 Gmail，例如 test@gmail.com"
              : "成員 Gmail，用逗號分隔"
          }
          value={memberEmails}
          onChange={(e) => setMemberEmails(e.target.value)}
        />

        <button type="submit">Create Chatroom</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}