import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSignIn(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMsg("登入成功");
      setEmail("");
      setPassword("");
    } catch (error) {
      setErrorMsg(error.message);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMsg("Google 登入成功");
    } catch (error) {
      setErrorMsg(error.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign In</h1>

        <form onSubmit={handleSignIn} className="form-grid">
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Sign In</button>
        </form>

        <button onClick={handleGoogleSignIn} style={{ marginTop: "12px" }}>
          Sign In with Google
        </button>

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      </div>
    </div>
  );
}