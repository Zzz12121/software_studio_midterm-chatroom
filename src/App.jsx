import { useState } from "react";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { currentUser, loading } = useAuth();
  const [page, setPage] = useState("signin");

  if (loading) {
    return <h1>載入中...</h1>;
  }

  if (!currentUser) {
    return (
      <div>
        <div style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>
          <button onClick={() => setPage("signin")}>Sign In</button>
          <button onClick={() => setPage("signup")} style={{ marginLeft: "8px" }}>
            Sign Up
          </button>
        </div>

        {page === "signup" ? <SignUpPage /> : <SignInPage />}
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>
        <button onClick={() => setPage("chat")}>Chat</button>
        <button onClick={() => setPage("profile")} style={{ marginLeft: "8px" }}>
          Profile
        </button>
      </div>

      {page === "profile" ? <ProfilePage /> : <ChatPage />}
    </div>
  );
}