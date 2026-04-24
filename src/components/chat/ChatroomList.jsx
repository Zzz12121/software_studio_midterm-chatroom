import { useEffect, useRef, useState } from "react";
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

  const lastSeenMapRef = useRef({});
  const notifiedMapRef = useRef({});
  const initializedRef = useRef(false);
  const selectedChatroomIdRef = useRef(selectedChatroomId);

  useEffect(() => {
    selectedChatroomIdRef.current = selectedChatroomId;

    if (selectedChatroomId) {
      setChatrooms((prevRooms) => {
        const selectedRoom = prevRooms.find(
          (room) => room.id === selectedChatroomId
        );

        if (selectedRoom) {
          const ts = selectedRoom.lastMessageAt?.toMillis?.() || Date.now();
          lastSeenMapRef.current[selectedChatroomId] = ts;
        }

        return prevRooms.map((room) =>
          room.id === selectedChatroomId
            ? {
                ...room,
                unread: 0,
              }
            : room
        );
      });
    }
  }, [selectedChatroomId]);

  useEffect(() => {
    const q = query(collection(db, "chatrooms"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentSelectedId = selectedChatroomIdRef.current;

      const rooms = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .filter(
          (room) =>
            Array.isArray(room.members) && room.members.includes(currentUserId)
        );

      if (!initializedRef.current) {
        rooms.forEach((room) => {
          const lastMessageAtMs = room.lastMessageAt?.toMillis?.() || 0;
          lastSeenMapRef.current[room.id] = lastMessageAtMs;
          notifiedMapRef.current[room.id] = lastMessageAtMs;
        });

        initializedRef.current = true;

        setChatrooms(
          rooms.map((room) => ({
            ...room,
            unread: 0,
          }))
        );

        return;
      }

      const mappedRooms = rooms.map((room) => {
        const lastMessageAtMs = room.lastMessageAt?.toMillis?.() || 0;
        const seenAtMs = lastSeenMapRef.current[room.id] || 0;
        const notifiedAtMs = notifiedMapRef.current[room.id] || 0;

        const isSelected = room.id === currentSelectedId;
        const isOwnLastMessage = room.lastSenderId === currentUserId;

        if (isSelected || isOwnLastMessage) {
          lastSeenMapRef.current[room.id] = lastMessageAtMs;
          notifiedMapRef.current[room.id] = lastMessageAtMs;

          return {
            ...room,
            unread: 0,
          };
        }

        const hasUnread = lastMessageAtMs > seenAtMs;
        const shouldNotify = hasUnread && lastMessageAtMs > notifiedAtMs;

        if (
          shouldNotify &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification(room.name || "聊天室", {
            body: room.lastMessage || "你有未讀訊息",
          });

          notifiedMapRef.current[room.id] = lastMessageAtMs;
        }

        return {
          ...room,
          unread: hasUnread ? 1 : 0,
        };
      });

      setChatrooms(mappedRooms);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  function handleClickRoom(room) {
    const ts = room.lastMessageAt?.toMillis?.() || Date.now();

    lastSeenMapRef.current[room.id] = ts;
    notifiedMapRef.current[room.id] = ts;

    setChatrooms((prevRooms) =>
      prevRooms.map((item) =>
        item.id === room.id
          ? {
              ...item,
              unread: 0,
            }
          : item
      )
    );

    onSelectChatroom(room.id);
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>你的聊天室</h3>

      {chatrooms.length === 0 ? (
        <p>目前沒有聊天室</p>
      ) : (
        chatrooms.map((room) => (
          <div
            key={room.id}
            onClick={() => handleClickRoom(room)}
            className={`chatroom-card ${selectedChatroomId === room.id ? "active" : ""}`}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>
              {room.name || "未命名聊天室"}
            </p>

            <p
              style={{
                margin: "6px 0 0 0",
                fontSize: "12px",
                opacity: 0.8,
              }}
            >
              {room.lastMessage || room.type}
            </p>

            {room.unread > 0 && (
              <span className="unread-badge">
                {room.unread}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}