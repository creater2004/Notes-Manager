function AuthForm({
  page,
  onSelectPage,
  setMessage,
  handleAuth,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  message,
  loading,
}) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-icon">N</div>
        <h1>Notes Manager</h1>
        <p className="subtitle">Keep your thoughts organized.</p>

        <div className="auth-tabs">
          <button
            className={page === "login" ? "active" : ""}
            onClick={() => {
              onSelectPage("login");
              setMessage("");
            }}
          >
            Login
          </button>

          <button
            className={page === "register" ? "active" : ""}
            onClick={() => {
              onSelectPage("register");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleAuth}>
          {page === "register" && (
            <label>
              Full name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              minLength={page === "register" ? 6 : undefined}
              required
            />
          </label>

          {message && <p className="message">{message}</p>}

          <button className="primary-btn" disabled={loading}>
            {loading ? "Please wait..." : page === "register" ? "Create Account" : "Login"}
          </button>
        </form>

        <p className="switch-text">
          {page === "login"
            ? "New here? Create an account using Register."
            : "Already registered? Select Login."}
        </p>
      </section>
    </main>
  );
}

export default AuthForm;
