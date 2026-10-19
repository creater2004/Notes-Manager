import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import api from "./api";
import "./index.css";
import AuthForm from "./components/AuthForm";
import DashboardHeader from "./components/DashboardHeader";
import NoteForm from "./components/NoteForm";
import NotesSection from "./components/NotesSection";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Study");
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const page = location.pathname === "/register" ? "register" : "login";

  async function loadNotes() {
    try {
      const response = await api.get("/notes");
      setNotes(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load notes.");

      if (error.response?.status === 401) {
        logout();
      }
    }
  }

  useEffect(() => {
    if (token && user) {
      loadNotes();
    }
  }, [token, user]);

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = page === "register" ? "/auth/register" : "/auth/login";
      const body =
        page === "register" ? { name, email, password } : { email, password };

      const response = await api.post(endpoint, body);
      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setPassword("");
      setMessage(data.message);
      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to connect to server.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveNote(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const noteData = { title, content, category };

      if (editingId) {
        await api.put(`/notes/${editingId}`, noteData);
        setMessage("Note updated successfully!");
      } else {
        await api.post("/notes", noteData);
        setMessage("Note created successfully!");
      }

      setTitle("");
      setContent("");
      setCategory("Study");
      setEditingId(null);

      await loadNotes();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save note.");
    } finally {
      setLoading(false);
    }
  }

  function editNote(note) {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteNote(id) {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      await api.delete(`/notes/${id}`);
      setMessage("Note deleted successfully!");
      await loadNotes();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete note.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCategory("Study");
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setNotes([]);
    setMessage("You have logged out.");
    navigate("/login", { replace: true });
  }

  const visibleNotes = notes.filter((note) => {
    const searchValue = search.toLowerCase();
    const matchesSearch =
      note.title.toLowerCase().includes(searchValue) ||
      note.content.toLowerCase().includes(searchValue);

    const matchesCategory = filter === "All" || note.category === filter;

    return matchesSearch && matchesCategory;
  });

  function DashboardPage() {
    return (
      <main className="dashboard">
        <DashboardHeader user={user} onLogout={logout} />

        <section className="welcome">
          <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h1>My Notes</h1>
          <p>Create, organize and manage your notes in one place.</p>
        </section>

        {message && <div className="message dashboard-message">{message}</div>}

        <NoteForm
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          category={category}
          setCategory={setCategory}
          editingId={editingId}
          loading={loading}
          onSubmit={saveNote}
          onCancel={cancelEdit}
        />

        <NotesSection
          visibleNotes={visibleNotes}
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          onEdit={editNote}
          onDelete={deleteNote}
        />

        <footer className="footer">
          Notes Manager · Built with React, Express and MongoDB
        </footer>
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          token && user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/login"
        element={
          token && user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthForm
              page={page}
              onSelectPage={(nextPage) => navigate(nextPage === "login" ? "/login" : "/register")}
              setMessage={setMessage}
              handleAuth={handleAuth}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              message={message}
              loading={loading}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          token && user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthForm
              page={page}
              onSelectPage={(nextPage) => navigate(nextPage === "login" ? "/login" : "/register")}
              setMessage={setMessage}
              handleAuth={handleAuth}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              message={message}
              loading={loading}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={token && user ? <DashboardPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;
