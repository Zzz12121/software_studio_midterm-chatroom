import { useState } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function MessageInput({
  chatroomId,
  currentUserId,
  replyTarget,
  clearReplyTarget,
}) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSendMessage(e) {
    e.preventDefault();

    if (!text.trim()) return;
    setMsg("");

    try {
      await addDoc(collection(db, "chatrooms", chatroomId, "messages"), {
        senderId: currentUserId,
        text: text.trim(),
        type: "text",
        imageURL: "",
        unsent: false,
        edited: false,
        replyTo: replyTarget
          ? {
              messageId: replyTarget.id,
              senderId: replyTarget.senderId,
              text: replyTarget.unsent ? "此訊息已收回" : replyTarget.text || "",
            }
          : null,
        reactions: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "chatrooms", chatroomId), {
        lastMessage: text.trim(),
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setText("");
      setMsg("訊息送出成功");
      clearReplyTarget?.();
    } catch (error) {
      setMsg(error.message);
    }
  }

  return (
    <div>
      {replyTarget && (
        <div
          style={{
            marginBottom: "12px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "#f8fafc",
          }}
        >
          <p style={{ margin: 0, fontSize: "12px", opacity: 0.7 }}>
            正在回覆：{replyTarget.senderId === currentUserId ? "You" : replyTarget.senderId}
          </p>
          <p style={{ margin: "6px 0 0 0" }}>
            {replyTarget.unsent ? "此訊息已收回" : replyTarget.text}
          </p>

          <button
            type="button"
            onClick={clearReplyTarget}
            style={{ marginTop: "8px" }}
          >
            取消回覆
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "12px" }}>
        <input
          type="text"
          placeholder="輸入訊息..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">Send</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}