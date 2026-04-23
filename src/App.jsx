import { useState } from "react";
import SignInPage from "./pages/SignInPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { currentUser, loading } = useAuth();
  const [page, setPage] = useState("chat");

  if (loading) {
    return <h1>載入中...</h1>;
  }

  if (!currentUser) {
    return <SignInPage />;
  }

  return (
    <div>
      <div style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>
        <button onClick={() => setPage("chat")}>Chat</button>
        <button onClick={() => setPage("profile")} style={{ marginLeft: "8px" }}>
          Profile
        </button>
      </div>

      {page === "chat" ? <ChatPage /> : <ProfilePage />}
    </div>
  );
}