import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGallery } from '../hooks/useGallery'
import { useReminders } from '../hooks/useReminders'
import { useNotes } from '../hooks/useNotes'
import { useTodayOrders } from '../hooks/useTodayOrders'
import CountdownCard from '../components/CountdownCard'
import EmptyState from '../components/EmptyState'

const STATUS_LABEL = { open: '🟢 รับออเดอร์', called: '🟡 โทรแล้ว' }

export default function Home() {
  const { photos, addPhoto, deletePhoto } = useGallery()
  const { reminders, loading: remLoading } = useReminders()
  const { notes } = useNotes()
  const { orders, loading: ordLoading } = useTodayOrders()
  const fileRef = useRef()

  const urgent = reminders.filter(r => r.status !== 'green').slice(0, 6)
  const pinnedNotes = notes.filter(n => n.pinned && !n.done).slice(0, 4)

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    try { await addPhoto(file) } catch (err) { alert('อัปโหลดไม่สำเร็จ: ' + err.message) }
    e.target.value = ''
  }

  return (
    <div className="page">
      <div className="home-hero">
        <img src="/logo.png" alt="ครอบครัว CHOW" className="home-logo" />
        <h1 className="home-title">CHOW Family</h1>
        <p className="home-subtitle">ยินดีต้อนรับสู่แอปบ้านเชาว์ 🏡</p>
      </div>

      {/* Gallery */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">📷 แกลเลอรี</h2>
          <button className="btn-add-sm" onClick={() => fileRef.current?.click()}>+ รูป</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
        {photos.length === 0 ? (
          <p className="loading-text" style={{ fontSize: '0.85rem' }}>กด + รูป เพื่อเพิ่มรูปครอบครัว</p>
        ) : (
          <div className="gallery-scroll">
            {photos.map(photo => (
              <div key={photo.id} className="gallery-item">
                <img src={photo.url} alt={photo.caption ?? ''} className="gallery-photo" />
                <button className="gallery-delete" onClick={() => deletePhoto(photo.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Today's orders */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">🍽️ ออเดอร์วันนี้</h2>
          <Link to="/restaurants" className="section-link">ดูทั้งหมด ›</Link>
        </div>
        {ordLoading ? (
          <p className="loading-text">กำลังโหลด…</p>
        ) : orders.length === 0 ? (
          <EmptyState icon="🛒" message="ยังไม่มีออเดอร์วันนี้" />
        ) : (
          <div className="home-orders">
            {orders.map(o => (
              <Link key={o.id} to={`/restaurants/${o.restaurant_id}`} className="home-order-card">
                <div className="home-order-header">
                  <span className="home-order-name">{o.restaurants?.name}</span>
                  <span className="home-order-status">{STATUS_LABEL[o.status] ?? ''}</span>
                </div>
                <div className="home-order-items">
                  {o.order_items.slice(0, 4).map(item => (
                    <span key={item.id} className="home-order-item">
                      <span style={{ color: item.members?.color }}>
                        {item.members?.emoji}
                      </span>
                      {' '}{item.menu_name} ×{item.qty}
                    </span>
                  ))}
                  {o.order_items.length > 4 && (
                    <span className="home-order-item" style={{ color: 'var(--text-secondary)' }}>
                      +{o.order_items.length - 4} รายการ
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Pinned notes */}
      {pinnedNotes.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">📌 โน้ตปักหมุด</h2>
            <Link to="/notes" className="section-link">ดูทั้งหมด ›</Link>
          </div>
          <div className="home-notes">
            {pinnedNotes.map(n => (
              <Link key={n.id} to="/notes" className="home-note-card">
                {n.content}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reminders */}
      <section className="section" style={{ paddingBottom: 16 }}>
        <div className="section-header">
          <h2 className="section-title">⚠️ ที่ต้องรู้วันนี้</h2>
        </div>
        {remLoading ? (
          <p className="loading-text">กำลังโหลด…</p>
        ) : urgent.length === 0 ? (
          <EmptyState icon="✅" message="ไม่มีเรื่องเร่งด่วนในขณะนี้" />
        ) : (
          <div className="cards-list">
            {urgent.map((r, i) => <CountdownCard key={i} {...r} />)}
          </div>
        )}
      </section>
    </div>
  )
}
