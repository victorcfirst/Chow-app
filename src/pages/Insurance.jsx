import { useState } from 'react'
import { useInsurance } from '../hooks/useInsurance'
import { useMembers } from '../hooks/useMembers'
import MemberPicker from '../components/MemberPicker'
import MemberAvatar from '../components/MemberAvatar'
import StatusPill from '../components/StatusPill'
import EmptyState from '../components/EmptyState'
import { formatThaiDate, daysUntil } from '../lib/date'
import { getStatus } from '../lib/reminders'

const TYPES = ['ชีวิต', 'สุขภาพ', 'อุบัติเหตุ', 'โรคร้ายแรง']
const FREQ  = [['year','รายปี'],['semi','ราย 6 เดือน'],['quarter','รายไตรมาส'],['month','รายเดือน']]
const STATUSES = [['active','ดำเนินการ'],['paidup','ชำระครบ'],['closed','ยกเลิก']]
const FREQ_MULT = { year: 1, semi: 2, quarter: 4, month: 12 }

const EMPTY_FORM = {
  owner_id: [], insurance_type: 'ชีวิต', company: '', policy_name: '',
  policy_number: '', agent_name: '', agent_phone: '', beneficiary: '',
  sum_assured: '', premium: '', premium_frequency: 'year', payment_years: '',
  start_date: '', coverage_end_date: '', next_due_date: '',
  installment_current: '', installment_total: '',
  tax_deductible: '', status: 'active', note: '',
}

export default function Insurance() {
  const { policies, loading, annualPremium, addPolicy, deletePolicy } = useInsurance()
  const { members } = useMembers()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterOwner, setFilterOwner] = useState('')
  const [filterTax, setFilterTax] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.policy_name.trim()) return
    await addPolicy({
      owner_id: form.owner_id[0] ?? null,
      insurance_type: form.insurance_type,
      company: form.company || null,
      policy_name: form.policy_name,
      policy_number: form.policy_number || null,
      agent_name: form.agent_name || null,
      agent_phone: form.agent_phone || null,
      beneficiary: form.beneficiary || null,
      sum_assured: form.sum_assured ? Number(form.sum_assured) : null,
      premium: form.premium ? Number(form.premium) : null,
      premium_frequency: form.premium_frequency,
      payment_years: form.payment_years ? Number(form.payment_years) : null,
      start_date: form.start_date || null,
      coverage_end_date: form.coverage_end_date || null,
      next_due_date: form.next_due_date || null,
      installment_current: form.installment_current ? Number(form.installment_current) : null,
      installment_total: form.installment_total ? Number(form.installment_total) : null,
      tax_deductible: form.tax_deductible ? Number(form.tax_deductible) : null,
      status: form.status,
      note: form.note || null,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  // Summary per member
  const memberSummary = members.map(m => {
    const owned = policies.filter(p => p.owner_id === m.id && p.status === 'active')
    const totalPremium = owned.reduce((s, p) => s + annualPremium(p), 0)
    const totalDeduct  = owned.reduce((s, p) => s + (p.tax_deductible ?? 0), 0)
    return { member: m, totalPremium, totalDeduct, count: owned.length }
  }).filter(s => s.count > 0)

  // Filter
  let filtered = policies
  if (filterOwner) filtered = filtered.filter(p => p.owner_id === filterOwner)
  if (filterTax)   filtered = filtered.filter(p => p.tax_deductible > 0)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🛡️ ประกัน</h1>
        <button className="btn-add" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'ยกเลิก' : '+ เพิ่ม'}
        </button>
      </div>

      {/* Summary */}
      {memberSummary.length > 0 && (
        <section className="section">
          <h2 className="section-title">สรุปเบี้ยต่อปี</h2>
          <div className="summary-row">
            {memberSummary.map(({ member, totalPremium, totalDeduct }) => (
              <div key={member.id} className="summary-card">
                <div className="summary-card-name" style={{ color: member.color }}>{member.emoji} {member.name}</div>
                <div className="summary-card-value">฿{totalPremium.toLocaleString()}</div>
                <div className="summary-card-sub">ลดหย่อน ฿{totalDeduct.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <button className={`filter-chip${!filterOwner && !filterTax ? ' active' : ''}`}
          onClick={() => { setFilterOwner(''); setFilterTax(false) }}>ทั้งหมด</button>
        {members.map(m => (
          <button key={m.id} className={`filter-chip${filterOwner === m.id ? ' active' : ''}`}
            onClick={() => setFilterOwner(filterOwner === m.id ? '' : m.id)}>
            {m.emoji} {m.name}
          </button>
        ))}
        <button className={`filter-chip${filterTax ? ' active' : ''}`}
          onClick={() => setFilterTax(v => !v)}>🧾 ลดหย่อนได้</button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="section">
          <form onSubmit={handleSubmit} className="card-form">
            <div className="form-field">
              <label className="form-label">เจ้าของ</label>
              <MemberPicker members={members} value={form.owner_id} onChange={v => set('owner_id', v)} multiSelect={false} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">ประเภท</label>
                <select className="form-input" value={form.insurance_type} onChange={e => set('insurance_type', e.target.value)}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-field" style={{ flex: 2 }}>
                <label className="form-label">บริษัทประกัน</label>
                <input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="บริษัท" />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">ชื่อกรมธรรม์ *</label>
              <input className="form-input" value={form.policy_name} onChange={e => set('policy_name', e.target.value)} placeholder="ชื่อแผนประกัน" />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">เบี้ย/งวด (฿)</label>
                <input type="number" className="form-input" value={form.premium} onChange={e => set('premium', e.target.value)} placeholder="0" inputMode="decimal" />
              </div>
              <div className="form-field">
                <label className="form-label">ความถี่</label>
                <select className="form-input" value={form.premium_frequency} onChange={e => set('premium_frequency', e.target.value)}>
                  {FREQ.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            {form.premium && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: -4 }}>
                เบี้ยต่อปี ≈ ฿{(Number(form.premium) * (FREQ_MULT[form.premium_frequency] ?? 1)).toLocaleString()}
              </p>
            )}
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">วันเริ่ม</label>
                <input type="date" className="form-input" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">คุ้มครองถึง</label>
                <input type="date" className="form-input" value={form.coverage_end_date} onChange={e => set('coverage_end_date', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">งวดถัดไป</label>
                <input type="date" className="form-input" value={form.next_due_date} onChange={e => set('next_due_date', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">ยอดลดหย่อน (฿)</label>
                <input type="number" className="form-input" value={form.tax_deductible} onChange={e => set('tax_deductible', e.target.value)} placeholder="0" inputMode="decimal" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">นายหน้า</label>
                <input className="form-input" value={form.agent_name} onChange={e => set('agent_name', e.target.value)} placeholder="ชื่อนายหน้า" />
              </div>
              <div className="form-field">
                <label className="form-label">เบอร์นายหน้า</label>
                <input className="form-input" value={form.agent_phone} onChange={e => set('agent_phone', e.target.value)} placeholder="0xx-xxx-xxxx" inputMode="tel" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">ผู้รับผลประโยชน์</label>
                <input className="form-input" value={form.beneficiary} onChange={e => set('beneficiary', e.target.value)} placeholder="ชื่อ" />
              </div>
              <div className="form-field">
                <label className="form-label">สถานะ</label>
                <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>ยกเลิก</button>
              <button type="submit" className="btn-primary" disabled={!form.policy_name.trim()}>บันทึก</button>
            </div>
          </form>
        </div>
      )}

      {/* Policy list */}
      <section className="section" style={{ paddingBottom: 16 }}>
        {loading ? (
          <p className="loading-text">กำลังโหลด…</p>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🛡️" message="ไม่มีรายการประกัน" />
        ) : (
          <div className="policy-list">
            {filtered.map(p => {
              const owner = members.find(m => m.id === p.owner_id)
              const annual = annualPremium(p)
              const due = p.next_due_date ? daysUntil(p.next_due_date) : null
              return (
                <div key={p.id} className="policy-card">
                  <div className="policy-header">
                    {owner && <div className="policy-owner"><MemberAvatar member={owner} size={32} /></div>}
                    <div className="policy-main">
                      <div className="policy-name">{p.policy_name}</div>
                      <div className="policy-company">{[p.insurance_type, p.company].filter(Boolean).join(' · ')}</div>
                    </div>
                    {due !== null && <StatusPill status={getStatus(due)} daysUntil={due} />}
                  </div>
                  <div className="policy-meta">
                    {annual > 0 && <span className="policy-meta-item">฿{annual.toLocaleString()}/ปี</span>}
                    {p.next_due_date && <span className="policy-meta-item">งวดถัดไป {formatThaiDate(p.next_due_date)}</span>}
                    {p.coverage_end_date && <span className="policy-meta-item">คุ้มครองถึง {formatThaiDate(p.coverage_end_date)}</span>}
                    {p.tax_deductible > 0 && <span className="policy-meta-item">🧾 ลดหย่อน ฿{Number(p.tax_deductible).toLocaleString()}</span>}
                    {p.agent_name && <span className="policy-meta-item">👤 {p.agent_name}</span>}
                  </div>
                  <div className="policy-footer">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {STATUSES.find(s => s[0] === p.status)?.[1]}
                    </span>
                    <button className="btn-delete-sm" onClick={() => deletePolicy(p.id)}>🗑</button>
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
