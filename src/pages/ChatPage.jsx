import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import CreateChatroomModal from "../components/chat/CreateChatroomModal";
import MessageInput from "../components/chat/MessageInput";
import ChatroomList from "../components/chat/ChatroomList";
import MessageList from "../components/chat/MessageList";

export default function ChatPage() {
  const { currentUser, logout } = useAuth();
  const [selectedChatroomId, setSelectedChatroomId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
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

      <main style={styles.main}>
        <header style={styles.header}>
          <h2>Chat Area</h2>
          <p>{selectedChatroomId || "尚未選擇聊天室"}</p>

          {selectedChatroomId && (
            <input
              type="text"
              placeholder="搜尋目前聊天室訊息..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                marginTop: "12px",
                padding: "8px",
                width: "100%",
                maxWidth: "320px",
              }}
            />
          )}
        </header>

        <section style={styles.messageArea}>
          <MessageList
            chatroomId={selectedChatroomId}
            currentUserId={currentUser.uid}
            searchText={searchText}
            onReply={setReplyTarget}
          />
        </section>

        <footer style={styles.footer}>
          {selectedChatroomId ? (
            <MessageInput
              chatroomId={selectedChatroomId}
              currentUserId={currentUser.uid}
              replyTarget={replyTarget}
              clearReplyTarget={() => setReplyTarget(null)}
            />
          ) : (
            <p>尚未選擇聊天室，不能送訊息</p>
          )}
        </footer>
      </main>
    </div>
  );
}

const styles = {
  app: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    height: "100vh",
  },
  sidebar: {
    borderRight: "1px solid #ccc",
    padding: "16px",
    overflowY: "auto",
  },
  main: {
    display: "grid",
    gridTemplateRows: "140px 1fr 150px",
    height: "100vh",
  },
  header: {
    borderBottom: "1px solid #ccc",
    padding: "16px",
  },
  messageArea: {
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  footer: {
    borderTop: "1px solid #ccc",
    padding: "16px",
  },
};