import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/firebase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function ensureUserDocument(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const googleDisplayName =
      user.displayName ||
      user.email?.split("@")[0] ||
      "Google User";

    const googlePhotoURL = user.photoURL || "";
    const email = user.email || "";

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email,
        username: googleDisplayName,
        phone: "",
        address: "",
        photoURL: googlePhotoURL,
        blockedUsers: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return;
    }

    const oldData = userSnap.data();
    const oldUsername = oldData.username || "";
    const emailPrefix = email.split("@")[0];

    const shouldUseGoogleName =
      !oldUsername ||
      oldUsername === email ||
      oldUsername === emailPrefix;

    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: oldData.email || email,
        username: shouldUseGoogleName ? googleDisplayName : oldUsername,
        phone: oldData.phone || "",
        address: oldData.address || "",
        photoURL: oldData.photoURL || googlePhotoURL,
        blockedUsers: oldData.blockedUsers || [],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      await ensureUserDocument(result.user);

      setSuccessMsg("登入成功");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Email sign in error:", error);
      setErrorMsg(error.message);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await signInWithPopup(auth, googleProvider);

      await ensureUserDocument(result.user);

      setSuccessMsg("Google 登入成功");
    } catch (error) {
      console.error("Google sign in error:", error);
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

        <button type="button" onClick={handleGoogleSignIn} style={{ marginTop: "12px" }}>
          Sign In with Google
        </button>

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      </div>
    </div>
  );
}