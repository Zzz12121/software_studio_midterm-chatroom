import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import CreateChatroomModal from "../components/chat/CreateChatroomModal";
import MessageInput from "../components/chat/MessageInput";
import ChatroomList from "../components/chat/ChatroomList";
import MessageList from "../components/chat/MessageList";
import InviteMemberPanel from "../components/chat/InviteMemberPanel";
import ChatroomMembers from "../components/chat/ChatroomMembers";
import NotificationManager from "../components/chat/NotificationManager";

export default function ChatPage() {
  const { currentUser, logout } = useAuth();

  const [selectedChatroomId, setSelectedChatroomId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [myBlockedUsers, setMyBlockedUsers] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  useEffect(() => {
    async function fetchMyProfile() {
      if (!currentUser) return;

      const snap = await getDoc(doc(db, "users", currentUser.uid));

      if (snap.exists()) {
        setMyBlockedUsers(snap.data().blockedUsers || []);
      }
    }

    fetchMyProfile();
  }, [currentUser]);

  useEffect(() => {
    async function fetchChatroomInfo() {
      if (!selectedChatroomId || !currentUser) {
        setSelectedChatroom(null);
        setBlockedByUsers([]);
        return;
      }

      const roomSnap = await getDoc(doc(db, "chatrooms", selectedChatroomId));

      if (!roomSnap.exists()) {
        setSelectedChatroom(null);
        setBlockedByUsers([]);
        return;
      }

      const roomData = {
        id: roomSnap.id,
        ...roomSnap.data(),
      };

      setSelectedChatroom(roomData);

      const members = Array.isArray(roomData.members) ? roomData.members : [];
      const otherMembers = members.filter((uid) => uid !== currentUser.uid);

      const blockedMeList = [];

      for (const uid of otherMembers) {
        const userSnap = await getDoc(doc(db, "users", uid));

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const blockedUsers = userData.blockedUsers || [];

          if (blockedUsers.includes(currentUser.uid)) {
            blockedMeList.push(uid);
          }
        }
      }

      setBlockedByUsers(blockedMeList);
    }

    fetchChatroomInfo();
  }, [selectedChatroomId, currentUser]);

  const isDirectChatBlocked =
    selectedChatroom?.type === "direct" &&
    (myBlockedUsers.length > 0 || blockedByUsers.length > 0) &&
    (() => {
      const members = selectedChatroom?.members || [];
      const otherUid = members.find((uid) => uid !== currentUser.uid);

      if (!otherUid) return false;

      return (
        myBlockedUsers.includes(otherUid) || blockedByUsers.includes(otherUid)
      );
    })();

  return (
    <div className="chat-layout">
      <NotificationManager />

      <aside className="chat-sidebar">
        <h2>Chatrooms</h2>
        <p>{currentUser?.email}</p>

        <CreateChatroomModal currentUserId={currentUser.uid} />

        <ChatroomList
          currentUserId={currentUser.uid}
          selectedChatroomId={selectedChatroomId}
          onSelectChatroom={(chatroomId) => {
            setSelectedChatroomId(chatroomId);
            setSearchText("");
            setReplyTarget(null);
          }}
        />

        <button onClick={logout} style={{ marginTop: "20px" }}>
          Logout
        </button>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <h2>Chat Area</h2>
          <p>{selectedChatroomId || "尚未選擇聊天室"}</p>

          {selectedChatroomId && (
            <>
              <input
                type="text"
                placeholder="搜尋目前聊天室訊息..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  marginTop: "12px",
                  width: "100%",
                  maxWidth: "320px",
                }}
              />

              <InviteMemberPanel chatroomId={selectedChatroomId} />

              <ChatroomMembers
                chatroomId={selectedChatroomId}
                currentUserId={currentUser.uid}
              />

              {isDirectChatBlocked && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px",
                    background: "#fee2e2",
                    border: "1px solid #ef4444",
                    borderRadius: "8px",
                  }}
                >
                  此私聊目前因封鎖關係無法繼續傳送訊息
                </div>
              )}
            </>
          )}
        </header>

        <section className="message-area">
          <MessageList
            chatroomId={selectedChatroomId}
            currentUserId={currentUser.uid}
            searchText={searchText}
            onReply={setReplyTarget}
            myBlockedUsers={myBlockedUsers}
            blockedByUsers={blockedByUsers}
          />
        </section>

        <footer className="chat-footer">
          {selectedChatroomId ? (
            isDirectChatBlocked ? (
              <p>此私聊已被封鎖，不能送訊息</p>
            ) : (
              <MessageInput
                chatroomId={selectedChatroomId}
                currentUserId={currentUser.uid}
                replyTarget={replyTarget}
                clearReplyTarget={() => setReplyTarget(null)}
              />
            )
          ) : (
            <p>尚未選擇聊天室，不能送訊息</p>
          )}
        </footer>
      </main>
    </div>
  );
}