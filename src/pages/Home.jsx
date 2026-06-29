import { useGallery } from '../hooks/useGallery'
import { useReminders } from '../hooks/useReminders'
import CountdownCard from '../components/CountdownCard'
import EmptyState from '../components/EmptyState'

export default function Home() {
  const { photos } = useGallery()
  const { reminders, loading } = useReminders()

  const urgent = reminders.filter((r) => r.status !== 'green').slice(0, 6)

  return (
    <div className="page">
      <div className="home-hero">
        <h1 className="home-title">CHOW Family 🏡</h1>
        <p className="home-subtitle">ยินดีต้อนรับสู่แอปบ้านเชาว์</p>
      </div>

      {photos.length > 0 && (
        <section className="section">
          <div className="gallery-scroll">
            {photos.map((photo) => (
              <img key={photo.id} src={photo.url} alt={photo.caption ?? ''} className="gallery-photo" />
            ))}
          </div>
        </section>
      )}

      <section className="section" style={{ paddingBottom: 16 }}>
        <h2 className="section-title">ที่ต้องรู้วันนี้</h2>
        {loading ? (
          <p className="loading-text">กำลังโหลด…</p>
        ) : urgent.length === 0 ? (
          <EmptyState icon="✅" message="ไม่มีเรื่องเร่งด่วนในขณะนี้" />
        ) : (
          <div className="cards-list">
            {urgent.map((r, i) => (
              <CountdownCard key={i} {...r} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
