import { useEffect, useState } from "react";
import GifPicker from "./GifPicker";
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

  useEffect(() => {
    setText("");
    setMsg("");
    clearSelectedImage();
  }, [chatroomId]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    setMsg("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg("只能選擇圖片檔案");
      return;
    }

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

  async function handleSendGif(gif) {
    setMsg("");

    try {
      await addDoc(collection(db, "chatrooms", chatroomId, "messages"), {
        senderId: currentUserId,
        text: "",
        type: "gif",
        imageURL: "",
        imageName: "",
        gifURL: gif.gifURL,
        gifTitle: gif.title || "GIPHY GIF",
        giphyURL: gif.giphyURL || "",
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
                : replyTarget.type === "gif"
                ? "[GIF]"
                : replyTarget.text || "",
            }
          : null,
        reactions: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "chatrooms", chatroomId), {
        lastMessage: "[GIF]",
        lastSenderId: currentUserId,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setText("");
      clearSelectedImage();
      clearReplyTarget?.();
      setMsg("GIF 已送出");
    } catch (error) {
      console.error("Send GIF error:", error);
      setMsg("GIF 送出失敗");
    }
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
                : replyTarget.type === "gif"
                ? "[GIF]"
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
    <div className="message-input-root">
      <div className="message-input-preview-area">
        {replyTarget && (
          <div className="message-input-preview-card">
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
                : replyTarget.type === "gif"
                ? "[GIF]"
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
          <div className="message-input-preview-card">
            <p style={{ margin: "0 0 8px 0", fontSize: "12px" }}>
              已選擇圖片：{selectedImageName}
            </p>

            <img
              src={selectedImage}
              alt="preview"
              className="message-input-image-preview"
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

        {msg && <p className="message-input-status">{msg}</p>}
      </div>

      <form onSubmit={handleSendMessage} className="message-input-controls">
        <textarea
          placeholder="輸入訊息..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);

            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          disabled={!!selectedImage}
          className="message-textarea"
          rows={1}
        />

        <label className="image-upload-button">
          Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </label>

        <GifPicker onSelectGif={handleSendGif} resetKey={chatroomId} />

        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}