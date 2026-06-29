import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRestaurants } from '../hooks/useRestaurants'
import EmptyState from '../components/EmptyState'

export default function Restaurants() {
  const { restaurants, loading, addRestaurant } = useRestaurants()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', note: '' })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    await addRestaurant({ name: form.name.trim(), phone: form.phone.trim() || null, note: form.note.trim() || null })
    setForm({ name: '', phone: '', note: '' })
    setShowForm(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🍽️ ร้านอาหาร</h1>
        <button className="btn-add" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'ยกเลิก' : '+ เพิ่มร้าน'}
        </button>
      </div>

      {showForm && (
        <div className="section">
          <form onSubmit={handleSubmit} className="card-form">
            <div className="form-field">
              <label className="form-label">ชื่อร้าน *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="ชื่อร้าน" autoFocus />
            </div>
            <div className="form-field">
              <label className="form-label">เบอร์โทร</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0xx-xxx-xxxx" inputMode="tel" />
            </div>
            <div className="form-field">
              <label className="form-label">หมายเหตุ</label>
              <input className="form-input" value={form.note} onChange={e => set('note', e.target.value)} placeholder="เช่น เปิด 8 โมง" />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>ยกเลิก</button>
              <button type="submit" className="btn-primary" disabled={!form.name.trim()}>บันทึก</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="section"><p className="loading-text">กำลังโหลด…</p></div>
      ) : restaurants.length === 0 ? (
        <EmptyState icon="🍽️" message="ยังไม่มีร้านอาหาร กด + เพิ่มได้เลย" />
      ) : (
        <section className="section" style={{ paddingBottom: 16 }}>
          <div className="rest-list">
            {restaurants.map(r => (
              <Link key={r.id} to={`/restaurants/${r.id}`} className="rest-card">
                <div className="rest-card-body">
                  <span className="rest-name">{r.name}</span>
                  {r.phone && <span className="rest-phone">📞 {r.phone}</span>}
                  {r.note && <span className="rest-note">{r.note}</span>}
                </div>
                <span className="rest-arrow">›</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
