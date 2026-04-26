import { useEffect, useState } from "react";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { updateEmail, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";

export default function ProfilePage() {
  const { currentUser } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedProfiles, setBlockedProfiles] = useState([]);
  const [blockEmail, setBlockEmail] = useState("");

  const [previewError, setPreviewError] = useState(false);
  const [msg, setMsg] = useState("");
  const [blockMsg, setBlockMsg] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          setUsername(data.username || "");
          setEmail(data.email || currentUser.email || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setPhotoURL(data.photoURL || currentUser.photoURL || "");
          setBlockedUsers(data.blockedUsers || []);
        } else {
          setUsername(currentUser.displayName || "");
          setEmail(currentUser.email || "");
          setPhone("");
          setAddress("");
          setPhotoURL(currentUser.photoURL || "");
          setBlockedUsers([]);
        }
      } catch (error) {
        console.error("Fetch profile error:", error);
        setMsg("讀取個人資料失敗");
      }
    }

    fetchProfile();
  }, [currentUser]);

  useEffect(() => {
    setPreviewError(false);
  }, [photoURL]);

  useEffect(() => {
    async function fetchBlockedProfiles() {
      if (!blockedUsers.length) {
        setBlockedProfiles([]);
        return;
      }

      try {
        const profiles = [];

        for (const uid of blockedUsers) {
          const userSnap = await getDoc(doc(db, "users", uid));

          if (userSnap.exists()) {
            const data = userSnap.data();

            profiles.push({
              uid,
              username: data.username || "",
              email: data.email || "",
              photoURL: data.photoURL || "",
            });
          } else {
            profiles.push({
              uid,
              username: "",
              email: uid,
              photoURL: "",
            });
          }
        }

        setBlockedProfiles(profiles);
      } catch (error) {
        console.error("Fetch blocked profiles error:", error);
      }
    }

    fetchBlockedProfiles();
  }, [blockedUsers]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setMsg("");

    if (!currentUser) return;

    try {
      const cleanUsername = username.trim();
      const cleanEmail = email.trim();
      const cleanPhone = phone.trim();
      const cleanAddress = address.trim();
      const cleanPhotoURL = photoURL.trim();

      if (!cleanUsername) {
        setMsg("Username 不可以是空的");
        return;
      }

      if (!cleanEmail) {
        setMsg("Email 不可以是空的");
        return;
      }

      if (cleanEmail !== currentUser.email) {
        await updateEmail(auth.currentUser, cleanEmail);
      }

      await updateProfile(auth.currentUser, {
        displayName: cleanUsername,
        photoURL: cleanPhotoURL,
      });

      await updateDoc(doc(db, "users", currentUser.uid), {
        uid: currentUser.uid,
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        address: cleanAddress,
        photoURL: cleanPhotoURL,
        updatedAt: serverTimestamp(),
      });

      setMsg("Profile 已更新");
    } catch (error) {
      console.error("Update profile error:", error);
      setMsg(error.message);
    }
  }

  async function findUserByEmail(targetEmail) {
    const normalizedEmail = targetEmail.trim().toLowerCase();

    if (!normalizedEmail) return null;

    const q = query(
      collection(db, "users"),
      where("email", "==", normalizedEmail)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  }

  async function handleBlockUser(e) {
    e.preventDefault();
    setBlockMsg("");

    if (!currentUser) return;

    try {
      const targetUser = await findUserByEmail(blockEmail);

      if (!targetUser) {
        setBlockMsg("找不到這個 Gmail 對應的使用者");
        return;
      }

      if (targetUser.uid === currentUser.uid) {
        setBlockMsg("不能封鎖自己");
        return;
      }

      await updateDoc(doc(db, "users", currentUser.uid), {
        blockedUsers: arrayUnion(targetUser.uid),
        updatedAt: serverTimestamp(),
      });

      setBlockedUsers((prev) =>
        prev.includes(targetUser.uid) ? prev : [...prev, targetUser.uid]
      );

      setBlockEmail("");
      setBlockMsg("已封鎖使用者");
    } catch (error) {
      console.error("Block user error:", error);
      setBlockMsg(error.message);
    }
  }

  async function handleUnblockUser(uid) {
    setBlockMsg("");

    if (!currentUser) return;

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        blockedUsers: arrayRemove(uid),
        updatedAt: serverTimestamp(),
      });

      setBlockedUsers((prev) => prev.filter((item) => item !== uid));
      setBlockMsg("已解除封鎖");
    } catch (error) {
      console.error("Unblock user error:", error);
      setBlockMsg(error.message);
    }
  }

  const displayInitial =
    username?.charAt(0)?.toUpperCase() ||
    email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>Profile Settings</h1>

        <div className="profile-preview-section">
          <div className="profile-preview-avatar">
            {photoURL.trim() && !previewError ? (
              <img
                src={photoURL.trim()}
                alt="profile preview"
                onError={() => setPreviewError(true)}
              />
            ) : (
              <span>{displayInitial}</span>
            )}
          </div>

          <div className="profile-preview-info">
            <h2>{username || "Username Preview"}</h2>
            <p>{email || "email@example.com"}</p>

            {photoURL.trim() && !previewError && (
              <p className="profile-preview-success">
                圖片預覽成功，按 Save 後才會儲存
              </p>
            )}

            {photoURL.trim() && previewError && (
              <p className="profile-preview-error">
                這個圖片 URL 無法載入，請確認連結是否正確
              </p>
            )}

            {!photoURL.trim() && (
              <p className="profile-preview-muted">
                尚未輸入圖片 URL，會使用預設頭像
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="profile-form">
          <label>
            Username
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Phone
            <input
              type="text"
              placeholder="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <label>
            Address
            <input
              type="text"
              placeholder="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>

          <label>
            Profile Picture URL
            <input
              type="url"
              placeholder="https://example.com/avatar.png"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
            />
          </label>

          <button type="submit">Save Profile</button>
        </form>

        {msg && <p className="profile-message">{msg}</p>}

        <hr style={{ margin: "24px 0" }} />

        <section className="block-user-section">
          <h2>Block User</h2>

          <p className="profile-preview-muted">
            輸入對方 Gmail 來封鎖使用者。封鎖後，私聊會無法傳送訊息，群組中也會隱藏彼此訊息。
          </p>

          <form onSubmit={handleBlockUser} className="profile-form">
            <label>
              User Gmail
              <input
                type="email"
                placeholder="target@example.com"
                value={blockEmail}
                onChange={(e) => setBlockEmail(e.target.value)}
              />
            </label>

            <button type="submit">Block User</button>
          </form>

          {blockMsg && <p className="profile-message">{blockMsg}</p>}

          <div className="blocked-list">
            <h3>Blocked Users</h3>

            {blockedProfiles.length === 0 ? (
              <p className="profile-preview-muted">目前沒有封鎖任何使用者</p>
            ) : (
              blockedProfiles.map((user) => {
                const displayName = user.username || user.email || user.uid;
                const initial = displayName.charAt(0).toUpperCase();

                return (
                  <div key={user.uid} className="blocked-user-row">
                    <div className="blocked-user-avatar">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="blocked user avatar" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>

                    <div className="blocked-user-info">
                      <strong>{displayName}</strong>
                      <span>{user.email || user.uid}</span>
                    </div>

                    <button
                      type="button"
                      className="unblock-button"
                      onClick={() => handleUnblockUser(user.uid)}
                    >
                      Unblock
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}