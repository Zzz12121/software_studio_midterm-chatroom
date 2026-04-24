import { useState } from "react";

export default function UserMenu({
  currentUser,
  userProfile,
  onGoProfile,
  onLogout,
}) {
  const [open, setOpen] = useState(false);

  const displayName =
    userProfile?.username ||
    userProfile?.email ||
    currentUser?.email ||
    "User";

  const photoURL = userProfile?.photoURL || "";

  return (
    <div className="user-menu-wrapper">
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
              onClick={onLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}