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
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState("");

  function handleImageChange(e) {
    const file = e.target.files[0];
    setMsg("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg("只能選擇圖片檔案");
      return;
    }

    // Firestore 單一 document 有大小限制，所以先限制圖片大小
    if (file.size > 700 * 1024) {
      setMsg("圖片太大，請選擇 700KB 以下的圖片");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setSelectedImage(reader.result);
      setSelectedImageName(file.name);
    };

    reader.onerror = () => {
      setMsg("圖片讀取失敗");
    };

    reader.readAsDataURL(file);
  }

  function clearSelectedImage() {
    setSelectedImage(null);
    setSelectedImageName("");
  }

  async function handleSendMessage(e) {
    e.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText && !selectedImage) return;

    setMsg("");

    try {
      const messageType = selectedImage ? "image" : "text";

      await addDoc(collection(db, "chatrooms", chatroomId, "messages"), {
        senderId: currentUserId,
        text: selectedImage ? "" : trimmedText,
        type: messageType,
        imageURL: selectedImage || "",
        imageName: selectedImageName || "",
        unsent: false,
        edited: false,
        replyTo: replyTarget
          ? {
              messageId: replyTarget.id,
              senderId: replyTarget.senderId,
              text: replyTarget.unsent
                ? "此訊息已收回"
                : replyTarget.type === "image"
                ? "[圖片]"
                : replyTarget.text || "",
            }
          : null,
        reactions: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "chatrooms", chatroomId), {
        lastMessage: selectedImage ? "[圖片]" : trimmedText,
        lastSenderId: currentUserId,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setText("");
      clearSelectedImage();
      setMsg("訊息送出成功");
      clearReplyTarget?.();
    } catch (error) {
      console.error("Send message error:", error);
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
            正在回覆：
            {replyTarget.senderId === currentUserId
              ? "You"
              : replyTarget.senderId}
          </p>

          <p style={{ margin: "6px 0 0 0" }}>
            {replyTarget.unsent
              ? "此訊息已收回"
              : replyTarget.type === "image"
              ? "[圖片]"
              : replyTarget.text}
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

      {selectedImage && (
        <div
          style={{
            marginBottom: "12px",
            padding: "10px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            background: "#ffffff",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: "12px" }}>
            已選擇圖片：{selectedImageName}
          </p>

          <img
            src={selectedImage}
            alt="preview"
            style={{
              maxWidth: "180px",
              maxHeight: "120px",
              borderRadius: "8px",
              display: "block",
              objectFit: "cover",
            }}
          />

          <button
            type="button"
            onClick={clearSelectedImage}
            style={{ marginTop: "8px" }}
          >
            取消圖片
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
          disabled={!!selectedImage}
        />

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#10b981",
            color: "white",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </label>

        <button type="submit">Send</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}