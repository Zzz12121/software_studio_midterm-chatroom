import { useEffect, useRef, useState } from "react";

export default function UserMenu({
  currentUser,
  userProfile,
  onGoProfile,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName =
    userProfile?.username ||
    userProfile?.email ||
    currentUser?.email ||
    "User";

  const photoURL = userProfile?.photoURL || "";

  useEffect(() => {
    function handleClickOutside(e) {
      if (!open) return;

      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        type="button"
        className="user-profile-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="user-avatar">
          {photoURL ? (
            <img src={photoURL} alt="profile" />
          ) : (
            <span>{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="user-meta">
          <strong>{displayName}</strong>
          <span>{currentUser?.email}</span>
        </div>

        <span className="user-menu-arrow">▾</span>
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-card">
            <div className="user-dropdown-header">
              <div className="user-avatar large">
                {photoURL ? (
                  <img src={photoURL} alt="profile" />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div>
                <strong>{displayName}</strong>
                <p>{currentUser?.email}</p>
              </div>
            </div>

            <button
              type="button"
              className="dropdown-action"
              onClick={() => {
                setOpen(false);
                onGoProfile?.();
              }}
            >
              ⚙️ Profile Settings
            </button>

            <button
              type="button"
              className="dropdown-action danger"
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}