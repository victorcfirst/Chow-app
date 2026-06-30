import { useState } from 'react'
import { useNotes } from '../hooks/useNotes'
import { useMembers } from '../hooks/useMembers'
import MemberPicker from '../components/MemberPicker'
import MemberTag from '../components/MemberTag'
import EmptyState from '../components/EmptyState'

function NoteCard({ note, members, onTogglePin, onToggleDone, onDelete, onEdit }) {
  const noteMembers = members.filter(m => note.note_members?.some(nm => nm.member_id === m.id))
  return (
    <div className={`note-card${note.done ? ' note-done' : ''}${note.pinned ? ' note-pinned' : ''}`}>
      <div className="note-body">
        <p className="note-content">{note.content}</p>
        {noteMembers.length > 0 && (
          <div className="note-tags">
            {noteMembers.map(m => <MemberTag key={m.id} member={m} />)}
          </div>
        )}
      </div>
      <div className="note-actions">
        <button className="note-action-btn" onClick={() => onTogglePin(note.id, note.pinned)}
          title={note.pinned ? 'เลิกปักหมุด' : 'ปักหมุด'}>
          {note.pinned ? '📌' : '📍'}
        </button>
        <button className="note-action-btn" onClick={() => onToggleDone(note.id, note.done)}
          title={note.done ? 'ยกเลิกเสร็จ' : 'ทำเสร็จแล้ว'}>
          {note.done ? '↩️' : '✅'}
        </button>
        <button className="note-action-btn" onClick={() => onEdit(note)} title="แก้ไข">✏️</button>
        <button className="note-action-btn note-action-delete" title="ลบ"
          onClick={() => { if (window.confirm('ลบโน้ตนี้?')) onDelete(note.id) }}>
          🗑
        </button>
      </div>
    </div>
  )
}

const EMPTY_FORM = { content: '', memberIds: [] }

export default function Notes() {
  const { notes, loading, addNote, updateNote, togglePin, toggleDone, deleteNote } = useNotes()
  const { members } = useMembers()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editNote, setEditNote] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.content.trim()) return
    await addNote({ content: form.content.trim(), memberIds: form.memberIds })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  function handleEditOpen(note) {
    const memberIds = note.note_members?.map(nm => nm.member_id) ?? []
    setEditNote(note)
    setEditForm({ content: note.content, memberIds })
  }

  async function handleEditSave(e) {
    e.preventDefault()
    if (!editForm.content.trim()) return
    await updateNote(editNote.id, { content: editForm.content.trim(), memberIds: editForm.memberIds })
    setEditNote(null)
  }

  const pinned = notes.filter(n => n.pinned && !n.done)
  const active = notes.filter(n => !n.pinned && !n.done)
  const done   = notes.filter(n => n.done)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📝 โน้ต</h1>
        <button className="btn-add" onClick={() => { setShowForm(v => !v); setEditNote(null) }}>
          {showForm ? 'ยกเลิก' : '+ เพิ่ม'}
        </button>
      </div>

      {showForm && (
        <div className="section">
          <form onSubmit={handleSubmit} className="card-form">
            <div className="form-field">
              <label className="form-label">โน้ต *</label>
              <textarea className="form-input form-textarea" rows={3}
                value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="พิมพ์โน้ต…" autoFocus />
            </div>
            <div className="form-field">
              <label className="form-label">เกี่ยวกับใคร</label>
              <MemberPicker members={members} value={form.memberIds}
                onChange={v => setForm(f => ({ ...f, memberIds: v }))} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>ยกเลิก</button>
              <button type="submit" className="btn-primary" disabled={!form.content.trim()}>บันทึก</button>
            </div>
          </form>
        </div>
      )}

      {editNote && (
        <div className="modal-overlay" onClick={() => setEditNote(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">แก้ไขโน้ต</h3>
            <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-field">
                <textarea className="form-input form-textarea" rows={4}
                  value={editForm.content}
                  onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} autoFocus />
              </div>
              <div className="form-field">
                <label className="form-label">เกี่ยวกับใคร</label>
                <MemberPicker members={members} value={editForm.memberIds}
                  onChange={v => setEditForm(f => ({ ...f, memberIds: v }))} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditNote(null)}>ยกเลิก</button>
                <button type="submit" className="btn-primary" disabled={!editForm.content.trim()}>บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="section" style={{ paddingBottom: 16 }}>
        {loading ? (
          <p className="loading-text">กำลังโหลด…</p>
        ) : notes.length === 0 ? (
          <EmptyState icon="📝" message="ยังไม่มีโน้ต กด + เพิ่มได้เลย" />
        ) : (
          <div className="notes-list">
            {pinned.length > 0 && (
              <>
                <p className="notes-section-label">📌 ปักหมุด</p>
                {pinned.map(n => (
                  <NoteCard key={n.id} note={n} members={members}
                    onTogglePin={togglePin} onToggleDone={toggleDone}
                    onDelete={deleteNote} onEdit={handleEditOpen} />
                ))}
              </>
            )}
            {active.length > 0 && (
              <>
                {pinned.length > 0 && <p className="notes-section-label">โน้ตทั้งหมด</p>}
                {active.map(n => (
                  <NoteCard key={n.id} note={n} members={members}
                    onTogglePin={togglePin} onToggleDone={toggleDone}
                    onDelete={deleteNote} onEdit={handleEditOpen} />
                ))}
              </>
            )}
            {done.length > 0 && (
              <>
                <p className="notes-section-label" style={{ marginTop: 8 }}>✅ เสร็จแล้ว</p>
                {done.map(n => (
                  <NoteCard key={n.id} note={n} members={members}
                    onTogglePin={togglePin} onToggleDone={toggleDone}
                    onDelete={deleteNote} onEdit={handleEditOpen} />
                ))}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
