function NoteForm({
  title,
  setTitle,
  content,
  setContent,
  category,
  setCategory,
  editingId,
  loading,
  onSubmit,
  onCancel,
}) {
  return (
    <section className="note-form-card">
      <h2>{editingId ? "Edit Note" : "Create a New Note"}</h2>

      <form onSubmit={onSubmit}>
        <label>
          Note title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React revision"
            maxLength={100}
            required
          />
        </label>

        <label>
          Note content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your notes here..."
            rows={4}
            required
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Study</option>
            <option>Personal</option>
            <option>Work</option>
            <option>Other</option>
          </select>
        </label>

        <div className="form-actions">
          <button className="primary-btn" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update Note" : "Add Note"}
          </button>

          {editingId && (
            <button type="button" className="secondary-btn" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default NoteForm;
