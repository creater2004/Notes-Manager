function NotesSection({
  visibleNotes,
  search,
  setSearch,
  filter,
  setFilter,
  onEdit,
  onDelete,
}) {
  return (
    <section className="notes-section">
      <div className="notes-heading">
        <div>
          <h2>All Notes</h2>
          <p>{visibleNotes.length} notes found</p>
        </div>
      </div>

      <div className="filters">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option>Study</option>
          <option>Personal</option>
          <option>Work</option>
          <option>Other</option>
        </select>
      </div>

      {visibleNotes.length === 0 ? (
        <div className="empty-state">
          <h3>No notes found</h3>
          <p>Create a note or change your search/filter.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {visibleNotes.map((note) => (
            <article className="note-card" key={note._id}>
              <div className="note-card-top">
                <span className={`category ${note.category.toLowerCase()}`}>
                  {note.category}
                </span>

                <span className="note-date">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <h3>{note.title}</h3>
              <p className="note-content">{note.content}</p>

              <div className="note-actions">
                <button onClick={() => onEdit(note)}>Edit</button>
                <button className="delete-btn" onClick={() => onDelete(note._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default NotesSection;
