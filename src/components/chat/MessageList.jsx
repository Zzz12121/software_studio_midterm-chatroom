import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function MessageList({
  chatroomId,
  currentUserId,
  searchText = "",
  onReply,
  myBlockedUsers = [],
  blockedByUsers = [],
}) {
  const [messages, setMessages] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState("");
  const [editingText, setEditingText] = useState("");
  const [highlightedMessageId, setHighlightedMessageId] = useState("");
  const [userMap, setUserMap] = useState({});
  const messageRefs = useRef({});

  useEffect(() => {
    if (!chatroomId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "chatrooms", chatroomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setMessages(result);
    });

    return () => unsubscribe();
  }, [chatroomId]);

  useEffect(() => {
  async function fetchUsers() {
    const uidSet = new Set();

    messages.forEach((message) => {
      if (message.senderId) {
        uidSet.add(message.senderId);
      }

      if (message.replyTo?.senderId) {
        uidSet.add(message.replyTo.senderId);
      }
    });

    const uidList = Array.from(uidSet);

    if (uidList.length === 0) {
      setUserMap({});
      return;
    }

    try {
      const result = {};

      for (const uid of uidList) {
        const userSnap = await getDoc(doc(db, "users", uid));

        if (userSnap.exists()) {
          const data = userSnap.data();

          result[uid] = {
            uid,
            username: data.username || "",
            email: data.email || "",
            photoURL: data.photoURL || "",
          };
        } else {
          result[uid] = {
            uid,
            username: "",
            email: "",
            photoURL: "",
          };
        }
      }

      setUserMap(result);
    } catch (error) {
      console.error("Fetch message users error:", error);
    }
  }

  fetchUsers();
}, [messages]);
  async function updateChatroomLastMessage() {
    try {
      const latestQuery = query(
        collection(db, "chatrooms", chatroomId, "messages"),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const snapshot = await getDocs(latestQuery);

      if (snapshot.empty) {
        await updateDoc(doc(db, "chatrooms", chatroomId), {
          lastMessage: "",
          lastSenderId: "",
          lastMessageAt: null,
          updatedAt: serverTimestamp(),
        });
        return;
      }

      const latestMessage = snapshot.docs[0].data();

      let previewText = "";

      if (latestMessage.unsent) {
        previewText = "此訊息已收回";
      } else if (latestMessage.type === "image") {
        previewText = "[圖片]";
      } else if (latestMessage.type === "sticker") {
        previewText = "[貼圖]";
      } else {
        previewText = latestMessage.text || "";
      }

      await updateDoc(doc(db, "chatrooms", chatroomId), {
        lastMessage: previewText,
        lastSenderId: latestMessage.senderId || "",
        lastMessageAt: latestMessage.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Update chatroom lastMessage error:", error);
    }
  }

  async function handleUnsend(messageId) {
    try {
      await updateDoc(doc(db, "chatrooms", chatroomId, "messages", messageId), {
        text: "",
        unsent: true,
        updatedAt: serverTimestamp(),
      });

      await updateChatroomLastMessage();
    } catch (error) {
      console.error("Unsend error:", error);
    }
  }

  function startEdit(message) {
    setEditingMessageId(message.id);
    setEditingText(message.text || "");
  }

  function cancelEdit() {
    setEditingMessageId("");
    setEditingText("");
  }

  async function saveEdit(messageId) {
    if (!editingText.trim()) return;

    try {
      await updateDoc(doc(db, "chatrooms", chatroomId, "messages", messageId), {
        text: editingText.trim(),
        edited: true,
        updatedAt: serverTimestamp(),
      });

      await updateChatroomLastMessage();

      setEditingMessageId("");
      setEditingText("");
    } catch (error) {
      console.error("Edit error:", error);
    }
  }

  function handleJumpToMessage(messageId) {
    const el = messageRefs.current[messageId];
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedMessageId(messageId);

    setTimeout(() => {
      setHighlightedMessageId("");
    }, 1800);
  }

  function getUserDisplayName(uid) {
    const user = userMap[uid];

    if (uid === currentUserId) {
      return user?.username || user?.email || "You";
    }

    if (!user) return uid;

    return user.username || user.email || uid;
  }

  function getUserPhotoURL(uid) {
    const user = userMap[uid];

    if (!user) return "";

    return user.photoURL || "";
  }
  const filteredMessages = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    const visibleMessages = messages.filter((message) => {
      const senderId = message.senderId;

      if (myBlockedUsers.includes(senderId)) return false;
      if (blockedByUsers.includes(senderId)) return false;

      return true;
    });

    if (!keyword) return visibleMessages;

    return visibleMessages.filter((message) => {
      if (message.unsent) return false;
      return (message.text || "").toLowerCase().includes(keyword);
    });
  }, [messages, searchText, myBlockedUsers, blockedByUsers]);

  if (!chatroomId) {
    return <p>請先選擇聊天室</p>;
  }

  if (messages.length === 0) {
    return <p>目前還沒有訊息</p>;
  }

  if (filteredMessages.length === 0) {
    return <p>找不到符合搜尋條件的訊息</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {filteredMessages.map((message) => {
        const isMine = message.senderId === currentUserId;
        const isEditing = editingMessageId === message.id;
        const isHighlighted = highlightedMessageId === message.id;

        return (
          <div
            key={message.id}
            ref={(el) => {
              if (el) messageRefs.current[message.id] = el;
            }}
            className="message-bubble"
            style={{
              alignSelf: isMine ? "flex-end" : "flex-start",
              maxWidth: "70%",
              padding: "10px 14px",
              borderRadius: "12px",
              background: isHighlighted
                ? "#fde68a"
                : isMine
                ? "#dbeafe"
                : "#f3f4f6",
              border: "1px solid #d1d5db",
              transition: "background 0.3s",
            }}
          >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#bfdbfe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {getUserPhotoURL(message.senderId) ? (
                <img
                  src={getUserPhotoURL(message.senderId)}
                  alt="avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                (getUserDisplayName(message.senderId) || "?").charAt(0).toUpperCase()
              )}
            </div>

            <p style={{ margin: 0, fontSize: "12px", opacity: 0.75 }}>
              {getUserDisplayName(message.senderId)}
              {isMine ? " (You)" : ""}
            </p>
          </div>

            {message.replyTo && (
              <div
                onClick={() => handleJumpToMessage(message.replyTo.messageId)}
                style={{
                  marginTop: "8px",
                  padding: "8px",
                  borderLeft: "3px solid #60a5fa",
                  background: "#eef6ff",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
              >
                <p style={{ margin: 0, fontSize: "12px", opacity: 0.7 }}>
                  回覆：{getUserDisplayName(message.replyTo.senderId)}
                  {message.replyTo.senderId === currentUserId ? " (You)" : ""}
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>
                  {message.replyTo.text}
                </p>
              </div>
            )}

            {message.unsent ? (
              <p style={{ margin: "6px 0 0 0", opacity: 0.6 }}>此訊息已收回</p>
            ) : isEditing ? (
              <div style={{ marginTop: "8px" }}>
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  style={{ width: "100%", marginBottom: "8px" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => saveEdit(message.id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ margin: "6px 0 0 0", whiteSpace: "pre-wrap" }}>
                {message.text}
              </p>
            )}

            {message.edited && !message.unsent && (
              <p style={{ margin: "6px 0 0 0", fontSize: "12px", opacity: 0.6 }}>
                已編輯
              </p>
            )}

            {isMine && !message.unsent && !isEditing && (
              <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={() => startEdit(message)}>Edit</button>
                <button onClick={() => handleUnsend(message.id)}>Unsend</button>
                <button onClick={() => onReply?.(message)}>Reply</button>
              </div>
            )}

            {!isMine && !message.unsent && !isEditing && (
              <div style={{ marginTop: "8px" }}>
                <button onClick={() => onReply?.(message)}>Reply</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}