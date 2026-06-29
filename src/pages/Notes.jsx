import { useState } from 'react'
import { useNotes } from '../hooks/useNotes'
import { useMembers } from '../hooks/useMembers'
import MemberPicker from '../components/MemberPicker'
import MemberTag from '../components/MemberTag'
import EmptyState from '../components/EmptyState'

function NoteCard({ note, members, onPin, onDone, onDelete }) {
  const noteMembers = members.filter(m =>
    note.note_members?.some(nm => nm.member_id === m.id)
  )
  return (
    <div className={`note-card${note.pinned ? ' pinned' : ''}${note.done ? ' done' : ''}`}>
      <p className="note-content">{note.content}</p>
      {noteMembers.length > 0 && (
        <div className="note-members">
          {noteMembers.map(m => <MemberTag key={m.id} member={m} />)}
        </div>
      )}
      <div className="note-actions">
        <button className={`note-btn${note.done ? ' active' : ''}`} onClick={onDone}>
          {note.done ? '↩ ยังไม่เสร็จ' : '✓ เสร็จ'}
        </button>
        <button className={`note-btn${note.pinned ? ' active' : ''}`} onClick={onPin}>
          📌 {note.pinned ? 'ถอดหมุด' : 'ปักหมุด'}
        </button>
        <button className="note-btn danger" onClick={onDelete}>🗑</button>
      </div>
    </div>
  )
}

export default function Notes() {
  const { notes, loading, addNote, togglePin, toggleDone, deleteNote } = useNotes()
  const { members } = useMembers()
  const [content, setContent] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    await addNote({ content: content.trim(), memberIds: selectedMembers })
    setContent('')
    setSelectedMembers([])
    setShowForm(false)
  }

  const pinned = notes.filter(n => n.pinned && !n.done)
  const active = notes.filter(n => !n.pinned && !n.done)
  const done   = notes.filter(n => n.done)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📝 โน้ตครอบครัว</h1>
        <button className="btn-add" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'ยกเลิก' : '+ เพิ่ม'}
        </button>
      </div>

      {showForm && (
        <div className="section">
          <form onSubmit={handleSubmit} className="card-form">
            <textarea
              className="note-textarea"
              placeholder="เขียนโน้ต…"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="form-field">
              <label className="form-label">เกี่ยวกับใคร</label>
              <MemberPicker members={members} value={selectedMembers} onChange={setSelectedMembers} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>ยกเลิก</button>
              <button type="submit" className="btn-primary" disabled={!content.trim()}>บันทึก</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="section"><p className="loading-text">กำลังโหลด…</p></div>
      ) : notes.length === 0 ? (
        <EmptyState icon="📝" message="ยังไม่มีโน้ต กด + เพิ่มได้เลย" />
      ) : (
        <>
          {pinned.length > 0 && (
            <section className="section">
              <h2 className="section-title">📌 ปักหมุด</h2>
              <div className="notes-list">
                {pinned.map(n => (
                  <NoteCard key={n.id} note={n} members={members}
                    onPin={() => togglePin(n.id, n.pinned)}
                    onDone={() => toggleDone(n.id, n.done)}
                    onDelete={() => deleteNote(n.id)} />
                ))}
              </div>
            </section>
          )}
          {active.length > 0 && (
            <section className="section">
              {pinned.length > 0 && <h2 className="section-title">โน้ต</h2>}
              <div className="notes-list">
                {active.map(n => (
                  <NoteCard key={n.id} note={n} members={members}
                    onPin={() => togglePin(n.id, n.pinned)}
                    onDone={() => toggleDone(n.id, n.done)}
                    onDelete={() => deleteNote(n.id)} />
                ))}
              </div>
            </section>
          )}
          {done.length > 0 && (
            <section className="section" style={{ paddingBottom: 16 }}>
              <h2 className="section-title">✅ เสร็จแล้ว</h2>
              <div className="notes-list">
                {done.map(n => (
                  <NoteCard key={n.id} note={n} members={members}
                    onPin={() => togglePin(n.id, n.pinned)}
                    onDone={() => toggleDone(n.id, n.done)}
                    onDelete={() => deleteNote(n.id)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
