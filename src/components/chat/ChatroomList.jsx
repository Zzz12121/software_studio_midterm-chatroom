import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function ChatroomList({
  currentUserId,
  selectedChatroomId,
  onSelectChatroom,
}) {
  const [chatrooms, setChatrooms] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "chatrooms"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((room) => Array.isArray(room.members) && room.members.includes(currentUserId));

      setChatrooms(result);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>你的聊天室</h3>

      {chatrooms.length === 0 ? (
        <p>目前沒有聊天室</p>
      ) : (
        chatrooms.map((room) => (
          <div
            key={room.id}
            onClick={() => onSelectChatroom(room.id)}
            style={{
              padding: "10px",
              marginBottom: "8px",
              border: "1px solid #ccc",
              cursor: "pointer",
              background: selectedChatroomId === room.id ? "#e8f0fe" : "#fff",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>
              {room.name || "未命名聊天室"}
            </p>
            <p style={{ margin: "6px 0 0 0", fontSize: "12px" }}>
              {room.type}
            </p>
          </div>
        ))
      )}
    </div>
  );
}