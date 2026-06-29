import { useState } from 'react'
import { useVehicles } from '../hooks/useVehicles'
import StatusPill from '../components/StatusPill'
import EmptyState from '../components/EmptyState'
import { formatThaiDate, daysUntil } from '../lib/date'
import { getStatus } from '../lib/reminders'

const CLASSES = ['ชั้น 1', 'ชั้น 2+', 'ชั้น 3+', 'ชั้น 3']
const EMPTY_FORM = {
  category: 'family', nickname: '', brand: '', model: '', year: '',
  license_plate: '', province: '', tax_due_date: '', cmi_due_date: '',
  insurance_company: '', insurance_class: '', insurance_policy_number: '',
  insurance_due_date: '', last_mileage: '', next_service_mileage: '',
  next_service_date: '', note: '',
}

function DateRow({ label, date }) {
  if (!date) return null
  const d = daysUntil(date)
  const status = getStatus(d)
  return (
    <div className="vehicle-date-row">
      <span className="vehicle-date-label">{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.8rem' }}>{formatThaiDate(date)}</span>
        <StatusPill status={status} daysUntil={d} />
      </div>
    </div>
  )
}

export default function Vehicles() {
  const { vehicles, loading, addVehicle } = useVehicles()
  const [tab, setTab] = useState('family')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.brand.trim() && !form.nickname.trim()) return
    await addVehicle({
      category: form.category,
      nickname: form.nickname || null,
      brand: form.brand || null,
      model: form.model || null,
      year: form.year ? Number(form.year) : null,
      license_plate: form.license_plate || null,
      province: form.province || null,
      tax_due_date: form.tax_due_date || null,
      cmi_due_date: form.cmi_due_date || null,
      insurance_company: form.insurance_company || null,
      insurance_class: form.insurance_class || null,
      insurance_policy_number: form.insurance_policy_number || null,
      insurance_due_date: form.insurance_due_date || null,
      last_mileage: form.last_mileage ? Number(form.last_mileage) : null,
      next_service_mileage: form.next_service_mileage ? Number(form.next_service_mileage) : null,
      next_service_date: form.next_service_date || null,
      note: form.note || null,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const filtered = vehicles.filter(v => v.category === tab)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🚗 รถ</h1>
        <button className="btn-add" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'ยกเลิก' : '+ เพิ่มรถ'}
        </button>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn${tab === 'family' ? ' active' : ''}`} onClick={() => setTab('family')}>🏠 ครอบครัว</button>
        <button className={`tab-btn${tab === 'company' ? ' active' : ''}`} onClick={() => setTab('company')}>🏢 บริษัท</button>
      </div>

      {showForm && (
        <div className="section">
          <form onSubmit={handleSubmit} className="card-form">
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">หมวดหมู่</label>
                <select className="form-input" value={form.category} onChange={e => { set('category', e.target.value); setTab(e.target.value) }}>
                  <option value="family">ครอบครัว</option>
                  <option value="company">บริษัท</option>
                </select>
              </div>
              <div className="form-field" style={{ flex: 2 }}>
                <label className="form-label">ชื่อเล่น</label>
                <input className="form-input" value={form.nickname} onChange={e => set('nickname', e.target.value)} placeholder="เช่น รถแม่" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">ยี่ห้อ *</label>
                <input className="form-input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Toyota" />
              </div>
              <div className="form-field">
                <label className="form-label">รุ่น</label>
                <input className="form-input" value={form.model} onChange={e => set('model', e.target.value)} placeholder="Yaris" />
              </div>
              <div className="form-field" style={{ maxWidth: 80 }}>
                <label className="form-label">ปี</label>
                <input type="number" className="form-input" value={form.year} onChange={e => set('year', e.target.value)} placeholder="2020" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field" style={{ flex: 2 }}>
                <label className="form-label">ทะเบียน</label>
                <input className="form-input" value={form.license_plate} onChange={e => set('license_plate', e.target.value)} placeholder="กก 1234" />
              </div>
              <div className="form-field">
                <label className="form-label">จังหวัด</label>
                <input className="form-input" value={form.province} onChange={e => set('province', e.target.value)} placeholder="กรุงเทพ" />
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: -4 }}>วันครบกำหนด</p>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">ต่อภาษี</label>
                <input type="date" className="form-input" value={form.tax_due_date} onChange={e => set('tax_due_date', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">พ.ร.บ. หมด</label>
                <input type="date" className="form-input" value={form.cmi_due_date} onChange={e => set('cmi_due_date', e.target.value)} />
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: -4 }}>ประกันภาคสมัครใจ</p>
            <div className="form-row">
              <div className="form-field" style={{ flex: 2 }}>
                <label className="form-label">บริษัทประกัน</label>
                <input className="form-input" value={form.insurance_company} onChange={e => set('insurance_company', e.target.value)} placeholder="บริษัท" />
              </div>
              <div className="form-field">
                <label className="form-label">ชั้น</label>
                <select className="form-input" value={form.insurance_class} onChange={e => set('insurance_class', e.target.value)}>
                  <option value="">-</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field" style={{ flex: 2 }}>
                <label className="form-label">เลขกรมธรรม์</label>
                <input className="form-input" value={form.insurance_policy_number} onChange={e => set('insurance_policy_number', e.target.value)} placeholder="เลขกรมธรรม์" />
              </div>
              <div className="form-field">
                <label className="form-label">ประกันหมด</label>
                <input type="date" className="form-input" value={form.insurance_due_date} onChange={e => set('insurance_due_date', e.target.value)} />
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: -4 }}>เช็กระยะ</p>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">ไมล์ล่าสุด</label>
                <input type="number" className="form-input" value={form.last_mileage} onChange={e => set('last_mileage', e.target.value)} placeholder="km" inputMode="numeric" />
              </div>
              <div className="form-field">
                <label className="form-label">เช็กระยะถัดไป</label>
                <input type="date" className="form-input" value={form.next_service_date} onChange={e => set('next_service_date', e.target.value)} />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>ยกเลิก</button>
              <button type="submit" className="btn-primary" disabled={!form.brand.trim() && !form.nickname.trim()}>บันทึก</button>
            </div>
          </form>
        </div>
      )}

      <section className="section" style={{ paddingBottom: 16 }}>
        {loading ? (
          <p className="loading-text">กำลังโหลด…</p>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🚗" message={`ไม่มีรถ${tab === 'family' ? 'ครอบครัว' : 'บริษัท'}`} />
        ) : (
          <div className="vehicle-list">
            {filtered.map(v => {
              const brandModel = `${v.brand ?? ''} ${v.model ?? ''}`.trim()
              const displayName = v.nickname ?? (brandModel || 'รถ')
              return (
                <div key={v.id} className="vehicle-card">
                  <div className="vehicle-header">
                    <div>
                      <div className="vehicle-name">{displayName}</div>
                      <div className="vehicle-plate">
                        {[v.brand, v.model, v.year].filter(Boolean).join(' ')}
                        {v.license_plate && ` · ${v.license_plate}${v.province ? ` (${v.province})` : ''}`}
                      </div>
                    </div>
                    {v.insurance_class && (
                      <span style={{ fontSize: '0.75rem', background: '#E3F2FD', color: '#1565C0', padding: '3px 10px', borderRadius: 12, fontWeight: 600 }}>
                        ประกัน{v.insurance_class}
                      </span>
                    )}
                  </div>
                  <div className="vehicle-dates">
                    <DateRow label="ต่อภาษีรถ"  date={v.tax_due_date} />
                    <DateRow label="พ.ร.บ."      date={v.cmi_due_date} />
                    <DateRow label="ประกันหมด"   date={v.insurance_due_date} />
                    <DateRow label="เช็กระยะ"    date={v.next_service_date} />
                  </div>
                  {v.insurance_company && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                      🛡️ {v.insurance_company}
                      {v.insurance_policy_number && ` · ${v.insurance_policy_number}`}
                    </p>
                  )}
                  {v.note && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{v.note}</p>}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
