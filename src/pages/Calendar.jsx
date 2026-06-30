import { useState } from 'react'
import { useEvents } from '../hooks/useEvents'
import { useMembers } from '../hooks/useMembers'
import { useReminders } from '../hooks/useReminders'
import MemberPicker from '../components/MemberPicker'
import MemberTag from '../components/MemberTag'
import CountdownCard from '../components/CountdownCard'
import EmptyState from '../components/EmptyState'
import { todayISO, daysUntil, formatThaiDate } from '../lib/date'
import { getStatus } from '../lib/reminders'

const EMPTY_FORM = {
  title: '', category: 'appointment', event_date: todayISO(),
  is_range: false, event_end_date: '',
  event_time: '', location: '', note: '', memberIds: [],
}

function EventForm({ form, setForm, members, onSubmit, onCancel, submitLabel = 'บันทึก' }) {
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }
  const valid = form.title.trim() && form.event_date

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="form-field">
        <label className="form-label">หัวข้อ *</label>
        <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="หัวข้อนัดหมาย" autoFocus />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">ประเภท</label>
          <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="appointment">นัดหมาย</option>
            <option value="benefit">สิทธิประโยชน์</option>
          </select>
        </div>
        <div className="form-field" style={{ flex: 2 }}>
          <label className="form-label">{form.is_range ? 'วันที่เริ่ม *' : 'วันที่ *'}</label>
          <input type="date" className="form-input" value={form.event_date}
            onChange={e => set('event_date', e.target.value)} />
        </div>
      </div>

      <label className="range-toggle">
        <input type="checkbox" checked={form.is_range}
          onChange={e => set('is_range', e.target.checked)} />
        <span>ช่วงหลายวัน</span>
      </label>

      {form.is_range ? (
        <div className="form-field">
          <label className="form-label">วันที่สิ้นสุด</label>
          <input type="date" className="form-input" value={form.event_end_date}
            min={form.event_date} onChange={e => set('event_end_date', e.target.value)} />
        </div>
      ) : (
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">เวลา</label>
            <input type="time" className="form-input" value={form.event_time}
              onChange={e => set('event_time', e.target.value)} />
          </div>
          <div className="form-field" style={{ flex: 2 }}>
            <label className="form-label">สถานที่</label>
            <input className="form-input" value={form.location}
              onChange={e => set('location', e.target.value)} placeholder="สถานที่" />
          </div>
        </div>
      )}

      {form.is_range && (
        <div className="form-field">
          <label className="form-label">สถานที่</label>
          <input className="form-input" value={form.location}
            onChange={e => set('location', e.target.value)} placeholder="สถานที่" />
        </div>
      )}

      <div className="form-field">
        <label className="form-label">เกี่ยวกับใคร</label>
        <MemberPicker members={members} value={form.memberIds} onChange={v => set('memberIds', v)} />
      </div>
      <div className="form-field">
        <label className="form-label">หมายเหตุ</label>
        <input className="form-input" value={form.note}
          onChange={e => set('note', e.target.value)} placeholder="รายละเอียด" />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>ยกเลิก</button>
        <button type="submit" className="btn-primary" disabled={!valid}>{submitLabel}</button>
      </div>
    </form>
  )
}

function dateRangeLabel(ev) {
  if (ev.event_end_date && ev.event_end_date !== ev.event_date) {
    return `${formatThaiDate(ev.event_date)} – ${formatThaiDate(ev.event_end_date)}`
  }
  const parts = []
  if (ev.event_time) parts.push(ev.event_time.slice(0, 5) + ' น.')
  if (ev.location)   parts.push(ev.location)
  return parts.join(' · ')
}

export default function Calendar() {
  const { events, loading, addEvent, updateEvent, deleteEvent } = useEvents()
  const { members } = useMembers()
  const { reminders } = useReminders()
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editEvent, setEditEvent] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.event_date) return
    await addEvent({
      title: form.title.trim(),
      category: form.category,
      event_date: form.event_date,
      event_end_date: form.is_range ? form.event_end_date : null,
      event_time: form.is_range ? null : form.event_time,
      location: form.location.trim() || null,
      note: form.note.trim() || null,
      memberIds: form.memberIds,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  function handleEditOpen(ev) {
    const memberIds = ev.event_members?.map(em => em.member_id) ?? []
    const hasRange = !!(ev.event_end_date && ev.event_end_date !== ev.event_date)
    setEditEvent(ev)
    setEditForm({
      title: ev.title,
      category: ev.category,
      event_date: ev.event_date,
      is_range: hasRange,
      event_end_date: ev.event_end_date ?? '',
      event_time: ev.event_time?.slice(0, 5) ?? '',
      location: ev.location ?? '',
      note: ev.note ?? '',
      memberIds,
    })
  }

  async function handleEditSave(e) {
    e.preventDefault()
    if (!editForm.title.trim() || !editForm.event_date) return
    await updateEvent(editEvent.id, {
      title: editForm.title.trim(),
      category: editForm.category,
      event_date: editForm.event_date,
      event_end_date: editForm.is_range ? editForm.event_end_date : null,
      event_time: editForm.is_range ? null : editForm.event_time,
      location: editForm.location.trim() || null,
      note: editForm.note.trim() || null,
      memberIds: editForm.memberIds,
    })
    setEditEvent(null)
  }

  async function handleDelete(id) {
    if (!window.confirm('ลบนัดหมายนี้?')) return
    deleteEvent(id)
  }

  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter)
  const nonEventReminders = reminders.filter(r => r.type !== 'event' && r.status !== 'green')

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📅 นัดหมาย</h1>
        <button className="btn-add" onClick={() => { setShowForm(v => !v); setEditEvent(null) }}>
          {showForm ? 'ยกเลิก' : '+ เพิ่ม'}
        </button>
      </div>

      <div className="filter-bar">
        {[['all', 'ทั้งหมด'], ['appointment', 'นัดหมาย'], ['benefit', 'สิทธิประโยชน์']].map(([val, label]) => (
          <button key={val} className={`filter-chip${filter === val ? ' active' : ''}`}
            onClick={() => setFilter(val)}>{label}</button>
        ))}
      </div>

      {showForm && (
        <div className="section">
          <div className="card-form">
            <EventForm form={form} setForm={setForm} members={members}
              onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {editEvent && (
        <div className="modal-overlay" onClick={() => setEditEvent(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">แก้ไขนัดหมาย</h3>
            <EventForm form={editForm} setForm={setEditForm} members={members}
              onSubmit={handleEditSave} onCancel={() => setEditEvent(null)} />
          </div>
        </div>
      )}

      {filter === 'all' && nonEventReminders.length > 0 && (
        <section className="section">
          <h2 className="section-title">⚠️ ใกล้ครบกำหนด</h2>
          <div className="cards-list">
            {nonEventReminders.slice(0, 5).map((r, i) => <CountdownCard key={i} {...r} />)}
          </div>
        </section>
      )}

      <section className="section" style={{ paddingBottom: 16 }}>
        <h2 className="section-title">
          {filter === 'all' ? 'นัดหมายทั้งหมด' : filter === 'appointment' ? 'นัดหมาย' : 'สิทธิประโยชน์'}
        </h2>
        {loading ? (
          <p className="loading-text">กำลังโหลด…</p>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📅" message="ไม่มีนัดหมาย" />
        ) : (
          <div className="cards-list">
            {filtered.map(ev => {
              const evMembers = members.filter(m => ev.event_members?.some(em => em.member_id === m.id))
              const d = daysUntil(ev.event_date)
              return (
                <div key={ev.id} className="event-card">
                  <CountdownCard
                    title={ev.title}
                    date={ev.event_date}
                    daysUntil={d}
                    status={getStatus(d)}
                    subtitle={dateRangeLabel(ev)}
                  />
                  <div className="event-footer">
                    <div className="event-members">
                      {evMembers.map(m => <MemberTag key={m.id} member={m} />)}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-edit-sm" onClick={() => handleEditOpen(ev)}>✏️</button>
                      <button className="btn-delete-sm" onClick={() => handleDelete(ev.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
