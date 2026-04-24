import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function ChatroomMembers({ chatroomId, currentUserId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      if (!chatroomId) {
        setMembers([]);
        return;
      }

      setLoading(true);

      try {
        const chatroomRef = doc(db, "chatrooms", chatroomId);
        const chatroomSnap = await getDoc(chatroomRef);

        if (!chatroomSnap.exists()) {
          setMembers([]);
          setLoading(false);
          return;
        }

        const chatroomData = chatroomSnap.data();
        const memberIds = Array.isArray(chatroomData.members)
          ? chatroomData.members
          : [];

        const memberPromises = memberIds.map(async (uid) => {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            return {
              uid,
              username: "",
              email: uid,
            };
          }

          const userData = userSnap.data();
          return {
            uid,
            username: userData.username || "",
            email: userData.email || "",
            photoURL: userData.photoURL || "",
            isMe: uid === currentUserId,
          };
        });

        const users = await Promise.all(memberPromises);
        setMembers(users);
      } catch (error) {
        console.error("Fetch chatroom members error:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [chatroomId, currentUserId]);

  if (!chatroomId) return null;

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>Members</h3>

      {loading ? (
        <p style={styles.info}>載入中...</p>
      ) : members.length === 0 ? (
        <p style={styles.info}>目前沒有成員資料</p>
      ) : (
        <div style={styles.list}>
          {members.map((member) => (
            <div key={member.uid} style={styles.card}>
              <div style={styles.avatar}>
                {member.photoURL ? (
                  <img
                    src={member.photoURL}
                    alt="avatar"
                    style={styles.avatarImage}
                  />
                ) : (
                  <span>
                    {(member.username || member.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <p style={styles.name}>
                  {member.username || member.email || member.uid}
                  {member.isMe ? " (You)" : ""}
                </p>
                <p style={styles.email}>{member.email || member.uid}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: "12px",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fafafa",
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: "16px",
  },
  info: {
    margin: 0,
    fontSize: "14px",
    opacity: 0.7,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    fontWeight: "bold",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  name: {
    margin: 0,
    fontWeight: "bold",
    fontSize: "14px",
  },
  email: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    opacity: 0.7,
  },
};