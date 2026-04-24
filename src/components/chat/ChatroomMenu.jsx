import { useState } from "react";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import InviteMemberPanel from "./InviteMemberPanel";
import ChatroomMembers from "./ChatroomMembers";

export default function ChatroomMenu({
  chatroom,
  currentUserId,
}) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  if (!chatroom) {
    return (
      <div className="chat-header-button placeholder">
        <div className="chat-title-avatar">?</div>
        <div>
          <h2>Select a chatroom</h2>
          <p>Choose a room from the left sidebar</p>
        </div>
      </div>
    );
  }

  const chatTitle = chatroom.name || "未命名聊天室";
  const isGroup = chatroom.type === "group";

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
      });

      setMsg("成員已移除");
    } catch (error) {
      console.error("Remove member error:", error);
      setMsg("移除成員失敗");
    }
  }

  return (
    <div className="chatroom-menu-wrapper">
      <button
        type="button"
        className="chat-header-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="chat-title-avatar">
          {chatTitle.charAt(0).toUpperCase()}
        </div>

        <div className="chat-title-text">
          <h2>{chatTitle}</h2>
          <p>
            {chatroom.type || "chatroom"} · {chatroom.members?.length || 0} members
          </p>
        </div>

        <span className="chat-header-arrow">▾</span>
      </button>

      {open && (
        <div className="chatroom-dropdown">
          <div className="chatroom-dropdown-card">
            <div className="chatroom-dropdown-header">
              <div className="chat-title-avatar large">
                {chatTitle.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{chatTitle}</strong>
                <p>
                  {chatroom.type || "chatroom"} · {chatroom.members?.length || 0} members
                </p>
              </div>
            </div>

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