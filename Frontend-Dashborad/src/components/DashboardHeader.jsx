function DashboardHeader({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-icon small">N</span>
        <span>Notes Manager</span>
      </div>

      <div className="user-area">
        <span>Hello, {user.name}</span>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
