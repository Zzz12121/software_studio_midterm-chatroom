import { useEffect, useRef, useState } from "react";
import {
  arrayRemove,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import InviteMemberPanel from "./InviteMemberPanel";
import ChatroomMembers from "./ChatroomMembers";

export default function ChatroomMenu({ chatroom, currentUserId }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [userMap, setUserMap] = useState({});
  const [editName, setEditName] = useState("");
  const [editPhotoURL, setEditPhotoURL] = useState("");

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!open) return;

      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    async function fetchMembers() {
      if (!chatroom?.members) {
        setUserMap({});
        return;
      }

      const result = {};

      for (const uid of chatroom.members) {
        const userSnap = await getDoc(doc(db, "users", uid));

        if (userSnap.exists()) {
          const data = userSnap.data();

          result[uid] = {
            uid,
            username: data.username || "",
            email: data.email || "",
            photoURL: data.photoURL || "",
          };
        }
      }

      setUserMap(result);
    }

    fetchMembers();
  }, [chatroom]);

  useEffect(() => {
    if (!chatroom) return;

    setEditName(chatroom.name || "");
    setEditPhotoURL(chatroom.photoURL || "");
    setMsg("");
  }, [chatroom]);

  if (!chatroom) {
    return (
      <div className="chat-header-button placeholder">
        <div className="chat-title-avatar">?</div>
        <div className="chat-title-text">
          <h2>Select a chatroom</h2>
          <p>Choose a room from the left sidebar</p>
        </div>
      </div>
    );
  }

  const isGroup = chatroom.type === "group";
  const display = getChatroomDisplay();

  function getChatroomDisplay() {
    if (chatroom.type === "direct") {
      const otherUid = chatroom.members?.find((uid) => uid !== currentUserId);
      const otherUser = userMap[otherUid];

      return {
        name:
          otherUser?.username ||
          otherUser?.email ||
          chatroom.name ||
          "私聊聊天室",
        photoURL: otherUser?.photoURL || "",
        fallback:
          otherUser?.username?.charAt(0) ||
          otherUser?.email?.charAt(0) ||
          "D",
      };
    }

    return {
      name: chatroom.name || "未命名群組",
      photoURL: chatroom.photoURL || "",
      fallback: (chatroom.name || "G").charAt(0),
    };
  }

  async function handleSaveGroupProfile() {
    if (!isGroup) return;

    setMsg("");

    try {
      await updateDoc(doc(db, "chatrooms", chatroom.id), {
        name: editName.trim() || "未命名群組",
        photoURL: editPhotoURL.trim(),
        updatedAt: serverTimestamp(),
      });

      setMsg("群組資料已更新");
    } catch (error) {
      console.error("Update group profile error:", error);
      setMsg("更新群組資料失敗");
    }
  }

  async function handleRemoveMember(uid) {
    setMsg("");

    if (!isGroup) {
      setMsg("只有群組聊天室可以移除成員");
      return;
    }

    if (uid === currentUserId) {
      setMsg("不能在這裡移除自己");
      return;
    }

    try {
      await updateDoc(doc(db, "chatrooms", chatroom.id), {
        members: arrayRemove(uid),
        updatedAt: serverTimestamp(),
      });

      setMsg("成員已移除");
    } catch (error) {
      console.error("Remove member error:", error);
      setMsg("移除成員失敗");
    }
  }

  return (
    <div className="chatroom-menu-wrapper" ref={menuRef}>
      <button
        type="button"
        className="chat-header-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="chat-title-avatar">
          {display.photoURL ? (
            <img src={display.photoURL} alt="chatroom avatar" />
          ) : (
            <span>{display.fallback.toUpperCase()}</span>
          )}
        </div>

        <div className="chat-title-text">
          <h2>{display.name}</h2>
          <p>
            {chatroom.type || "chatroom"} · {chatroom.members?.length || 0}{" "}
            members
          </p>
        </div>

        <span className="chat-header-arrow">▾</span>
      </button>

      {open && (
        <div className="chatroom-dropdown">
          <div className="chatroom-dropdown-card">
            <div className="chatroom-dropdown-header">
              <div className="chat-title-avatar large">
                {display.photoURL ? (
                  <img src={display.photoURL} alt="chatroom avatar" />
                ) : (
                  <span>{display.fallback.toUpperCase()}</span>
                )}
              </div>

              <div>
                <strong>{display.name}</strong>
                <p>
                  {chatroom.type || "chatroom"} ·{" "}
                  {chatroom.members?.length || 0} members
                </p>
              </div>
            </div>

            {isGroup && (
              <div className="chatroom-menu-section">
                <h3>Group Settings</h3>

                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="群組聊天室名稱"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="群組頭像 URL"
                    value={editPhotoURL}
                    onChange={(e) => setEditPhotoURL(e.target.value)}
                  />

                  <button type="button" onClick={handleSaveGroupProfile}>
                    Save Group Profile
                  </button>
                </div>
              </div>
            )}

            <div className="chatroom-menu-section">
              <h3>Invite Member</h3>
              <InviteMemberPanel chatroomId={chatroom.id} />
            </div>

            <div className="chatroom-menu-section">
              <h3>Members</h3>
              <ChatroomMembers
                chatroomId={chatroom.id}
                currentUserId={currentUserId}
                removable={isGroup}
                onRemoveMember={handleRemoveMember}
              />
            </div>

            {msg && <p className="menu-message">{msg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}