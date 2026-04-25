import { useState } from "react";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import SplashScreen from "./components/common/SplashScreen";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { currentUser, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [authPage, setAuthPage] = useState("signin");
  const [appPage, setAppPage] = useState("chat");

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="app-loading">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="auth-shell">
        <div className="auth-topbar">
          <button
            type="button"
            onClick={() => setAuthPage("signin")}
            className={authPage === "signin" ? "nav-button active" : "nav-button"}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setAuthPage("signup")}
            className={authPage === "signup" ? "nav-button active" : "nav-button"}
          >
            Sign Up
          </button>
        </div>

        <main className="auth-content">
          {authPage === "signup" ? <SignUpPage /> : <SignInPage />}
        </main>
      </div>
    );
  }

  if (appPage === "profile") {
    return (
      <div className="profile-shell">
        <header className="profile-topbar">
          <button type="button" onClick={() => setAppPage("chat")}>
            ← Back to Chat
          </button>

          <h2>Profile Settings</h2>
        </header>

        <main className="profile-content">
          <ProfilePage />
        </main>
      </div>
    );
  }

  return <ChatPage onGoProfile={() => setAppPage("profile")} />;
}