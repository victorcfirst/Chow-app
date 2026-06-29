import { useState } from 'react'
import { useEvents } from '../hooks/useEvents'
import { useMembers } from '../hooks/useMembers'
import { useReminders } from '../hooks/useReminders'
import MemberPicker from '../components/MemberPicker'
import MemberTag from '../components/MemberTag'
import CountdownCard from '../components/CountdownCard'
import EmptyState from '../components/EmptyState'
import { todayISO, daysUntil } from '../lib/date'
import { getStatus } from '../lib/reminders'

export default function Calendar() {
  const { events, loading, addEvent, deleteEvent } = useEvents()
  const { members } = useMembers()
  const { reminders } = useReminders()
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', category: 'appointment', event_date: todayISO(),
    event_time: '', location: '', note: '', memberIds: [],
  })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.event_date) return
    await addEvent({
      title: form.title.trim(),
      category: form.category,
      event_date: form.event_date,
      event_time: form.event_time || null,
      location: form.location.trim() || null,
      note: form.note.trim() || null,
      memberIds: form.memberIds,
    })
    setForm({ title: '', category: 'appointment', event_date: todayISO(), event_time: '', location: '', note: '', memberIds: [] })
    setShowForm(false)
  }

  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter)
  const nonEventReminders = reminders.filter(r => r.type !== 'event' && r.status !== 'green')

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📅 นัดหมาย</h1>
        <button className="btn-add" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'ยกเลิก' : '+ เพิ่ม'}
        </button>
      </div>

      <div className="filter-bar">
        {[['all', 'ทั้งหมด'], ['appointment', 'นัดหมาย'], ['benefit', 'สิทธิประโยชน์']].map(([val, label]) => (
          <button key={val} className={`filter-chip${filter === val ? ' active' : ''}`} onClick={() => setFilter(val)}>
            {label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="section">
          <form onSubmit={handleSubmit} className="card-form">
            <div className="form-field">
              <label className="form-label">หัวข้อ *</label>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="หัวข้อนัดหมาย" autoFocus />
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
                <label className="form-label">วันที่ *</label>
                <input type="date" className="form-input" value={form.event_date} onChange={e => set('event_date', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">เวลา</label>
                <input type="time" className="form-input" value={form.event_time} onChange={e => set('event_time', e.target.value)} />
              </div>
              <div className="form-field" style={{ flex: 2 }}>
                <label className="form-label">สถานที่</label>
                <input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="สถานที่" />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">เกี่ยวกับใคร</label>
              <MemberPicker members={members} value={form.memberIds} onChange={v => set('memberIds', v)} />
            </div>
            <div className="form-field">
              <label className="form-label">หมายเหตุ</label>
              <input className="form-input" value={form.note} onChange={e => set('note', e.target.value)} placeholder="รายละเอียด" />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>ยกเลิก</button>
              <button type="submit" className="btn-primary" disabled={!form.title.trim() || !form.event_date}>บันทึก</button>
            </div>
          </form>
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
                    subtitle={[ev.event_time, ev.location].filter(Boolean).join(' · ')}
                  />
                  <div className="event-footer">
                    <div className="event-members">
                      {evMembers.map(m => <MemberTag key={m.id} member={m} />)}
                    </div>
                    <button className="btn-delete-sm" onClick={() => deleteEvent(ev.id)}>🗑</button>
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
