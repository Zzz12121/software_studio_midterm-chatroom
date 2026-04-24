import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function ChatroomMembers({
  chatroomId,
  currentUserId,
  removable = false,
  onRemoveMember,
}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chatroomId) {
      setMembers([]);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(doc(db, "chatrooms", chatroomId), async (chatroomSnap) => {
      if (!chatroomSnap.exists()) {
        setMembers([]);
        setLoading(false);
        return;
      }

      const chatroomData = chatroomSnap.data();
      const memberIds = Array.isArray(chatroomData.members)
        ? chatroomData.members
        : [];

      try {
        const memberPromises = memberIds.map(async (uid) => {
          const userSnap = await getDoc(doc(db, "users", uid));

          if (!userSnap.exists()) {
            return {
              uid,
              username: "",
              email: uid,
              photoURL: "",
              isMe: uid === currentUserId,
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
    });

    return () => unsubscribe();
  }, [chatroomId, currentUserId]);

  if (!chatroomId) return null;

  return (
    <div className="members-panel">
      {loading ? (
        <p className="muted-text">載入中...</p>
      ) : members.length === 0 ? (
        <p className="muted-text">目前沒有成員資料</p>
      ) : (
        <div className="members-list">
          {members.map((member) => {
            const displayName = member.username || member.email || member.uid;

            return (
              <div key={member.uid} className="member-row">
                <div className="member-avatar">
                  {member.photoURL ? (
                    <img src={member.photoURL} alt="avatar" />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="member-info">
                  <strong>
                    {displayName}
                    {member.isMe ? " (You)" : ""}
                  </strong>
                  <span>{member.email || member.uid}</span>
                </div>

                {removable && !member.isMe && (
                  <button
                    type="button"
                    className="remove-member-button"
                    onClick={() => onRemoveMember?.(member.uid)}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}