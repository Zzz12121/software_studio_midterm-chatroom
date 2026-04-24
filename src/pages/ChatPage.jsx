import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import CreateChatroomModal from "../components/chat/CreateChatroomModal";
import MessageInput from "../components/chat/MessageInput";
import ChatroomList from "../components/chat/ChatroomList";
import MessageList from "../components/chat/MessageList";
import NotificationManager from "../components/chat/NotificationManager";
import UserMenu from "../components/layout/UserMenu";
import ChatroomMenu from "../components/chat/ChatroomMenu";

export default function ChatPage({ onGoProfile }) {
  const { currentUser, logout } = useAuth();

  const [selectedChatroomId, setSelectedChatroomId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [myBlockedUsers, setMyBlockedUsers] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [selectedChatroom, setSelectedChatroom] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    async function fetchMyProfile() {
      if (!currentUser) return;

      const snap = await getDoc(doc(db, "users", currentUser.uid));

      if (snap.exists()) {
        const data = snap.data();

        setUserProfile({
          username: data.username || "",
          email: data.email || currentUser.email || "",
          photoURL: data.photoURL || "",
        });

        setMyBlockedUsers(data.blockedUsers || []);
      } else {
        setUserProfile({
          username: "",
          email: currentUser.email || "",
          photoURL: "",
        });
      }
    }

    fetchMyProfile();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedChatroomId || !currentUser) {
      setSelectedChatroom(null);
      setBlockedByUsers([]);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "chatrooms", selectedChatroomId),
      async (roomSnap) => {
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
    );

    return () => unsubscribe();
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
    <div className="messenger-layout no-page-scroll">
      <NotificationManager />

      <aside className="messenger-sidebar">
        <UserMenu
          currentUser={currentUser}
          userProfile={userProfile}
          onGoProfile={onGoProfile}
          onLogout={logout}
        />

        <div className="sidebar-section">
          <CreateChatroomModal currentUserId={currentUser.uid} />
        </div>

        <div className="sidebar-section grow">
          <ChatroomList
            currentUserId={currentUser.uid}
            selectedChatroomId={selectedChatroomId}
            onSelectChatroom={(chatroomId) => {
              setSelectedChatroomId(chatroomId);
              setSearchText("");
              setReplyTarget(null);
            }}
          />
        </div>
      </aside>

      <main className="messenger-main">
        <header className="messenger-header compact">
          <ChatroomMenu
            chatroom={selectedChatroom}
            currentUserId={currentUser.uid}
          />

          {selectedChatroomId && (
            <div className="chat-search-box">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          )}
        </header>

        {isDirectChatBlocked && (
          <section className="blocked-warning-bar">
            此私聊目前因封鎖關係無法繼續傳送訊息
          </section>
        )}

        <section className="messenger-messages">
          <MessageList
            chatroomId={selectedChatroomId}
            currentUserId={currentUser.uid}
            searchText={searchText}
            onReply={setReplyTarget}
            myBlockedUsers={myBlockedUsers}
            blockedByUsers={blockedByUsers}
          />
        </section>

        <footer className="messenger-footer">
          {selectedChatroomId ? (
            isDirectChatBlocked ? (
              <p className="footer-hint">此私聊已被封鎖，不能送訊息</p>
            ) : (
              <MessageInput
                chatroomId={selectedChatroomId}
                currentUserId={currentUser.uid}
                replyTarget={replyTarget}
                clearReplyTarget={() => setReplyTarget(null)}
              />
            )
          ) : (
            <p className="footer-hint">請先選擇一個聊天室</p>
          )}
        </footer>
      </main>
    </div>
  );
}