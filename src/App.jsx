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
      <div style={styles.shell}>
        <div style={styles.topbar}>
          <button onClick={() => setPage("signin")}>Sign In</button>
          <button onClick={() => setPage("signup")} style={{ marginLeft: "8px" }}>
            Sign Up
          </button>
        </div>

        <div style={styles.content}>
          {page === "signup" ? <SignUpPage /> : <SignInPage />}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.shell}>
      <div style={styles.topbar}>
        <button onClick={() => setPage("chat")}>Chat</button>
        <button onClick={() => setPage("profile")} style={{ marginLeft: "8px" }}>
          Profile
        </button>
      </div>

      <div style={styles.content}>
        {page === "profile" ? <ProfilePage /> : <ChatPage />}
      </div>
    </div>
  );
}

const styles = {
  shell: {
    height: "100vh",
    display: "grid",
    gridTemplateRows: "56px 1fr",
    overflow: "hidden",
  },
  topbar: {
    borderBottom: "1px solid #ccc",
    padding: "12px",
    background: "#fff",
    textAlign: "center",
  },
  content: {
    minHeight: 0,
    overflow: "hidden",
  },
};