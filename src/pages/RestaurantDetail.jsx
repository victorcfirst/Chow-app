import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useRestaurants } from '../hooks/useRestaurants'
import { useMenuItems } from '../hooks/useMenuItems'
import { useOrders } from '../hooks/useOrders'
import { useMembers } from '../hooks/useMembers'
import MemberPicker from '../components/MemberPicker'
import MemberAvatar from '../components/MemberAvatar'
import EmptyState from '../components/EmptyState'
import { formatThaiDate, todayISO } from '../lib/date'

const STATUS_LABEL = { open: '🟢 รับออเดอร์', called: '🟡 โทรแล้ว', done: '✅ เสร็จ' }
const STATUS_COLOR = { open: '#43A047', called: '#F9A825', done: '#9E9E9E' }
const STATUS_NEXT  = { open: 'called', called: 'done', done: 'open' }

export default function RestaurantDetail() {
  const { id } = useParams()
  const { restaurants } = useRestaurants()
  const { menuItems, addMenuItem } = useMenuItems(id)
  const { order, orderItems, loading: orderLoading, addItem, updateStatus } = useOrders(id)
  const { members } = useMembers()

  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showMenuForm, setShowMenuForm]   = useState(false)
  const [oForm, setOForm] = useState({ memberId: [], menuItemId: '', qty: 1, note: '' })
  const [mForm, setMForm] = useState({ name: '', price: '' })

  const restaurant = restaurants.find(r => r.id === id)

  // Group order items by member
  const grouped = members
    .map(m => ({ member: m, items: orderItems.filter(i => i.member_id === m.id) }))
    .filter(g => g.items.length > 0)
  const unknown = orderItems.filter(i => !i.member_id)

  async function handleAddItem(e) {
    e.preventDefault()
    const menu = menuItems.find(m => m.id === oForm.menuItemId)
    if (!oForm.memberId[0] || !menu) return
    await addItem({ memberId: oForm.memberId[0], menuItemId: menu.id, menuName: menu.name, qty: oForm.qty, note: oForm.note })
    setOForm({ memberId: [], menuItemId: '', qty: 1, note: '' })
    setShowOrderForm(false)
  }

  async function handleAddMenu(e) {
    e.preventDefault()
    if (!mForm.name.trim()) return
    await addMenuItem({ name: mForm.name.trim(), price: mForm.price ? Number(mForm.price) : null })
    setMForm({ name: '', price: '' })
    setShowMenuForm(false)
  }

  if (!restaurant) return <div className="section"><p className="loading-text">กำลังโหลด…</p></div>

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/restaurants" className="back-btn">‹</Link>
        <h1 className="page-title">{restaurant.name}</h1>
      </div>

      {restaurant.phone && (
        <div className="section">
          <a href={`tel:${restaurant.phone}`} className="rest-phone-link">📞 {restaurant.phone}</a>
        </div>
      )}

      {/* ---- Today's Order ---- */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">ออเดอร์ {formatThaiDate(todayISO())}</h2>
          {order && (
            <button
              className="status-badge"
              style={{ backgroundColor: STATUS_COLOR[order.status] + '22', color: STATUS_COLOR[order.status] }}
              onClick={() => updateStatus(STATUS_NEXT[order.status])}
            >
              {STATUS_LABEL[order.status]}
            </button>
          )}
        </div>

        {orderLoading ? (
          <p className="loading-text">กำลังโหลด…</p>
        ) : orderItems.length === 0 ? (
          <EmptyState icon="🛒" message="ยังไม่มีออเดอร์วันนี้" />
        ) : (
          <div className="order-by-member">
            {grouped.map(({ member, items }) => (
              <div key={member.id} className="order-member-group">
                <div className="order-member-header">
                  <MemberAvatar member={member} size={22} />
                  <span className="order-member-name">{member.name}</span>
                </div>
                {items.map(item => (
                  <div key={item.id} className="order-item-row">
                    <span>{item.menu_name} × {item.qty}</span>
                    {item.note && <span className="order-item-note">({item.note})</span>}
                  </div>
                ))}
              </div>
            ))}
            {unknown.map(item => (
              <div key={item.id} className="order-item-row">
                <span>{item.menu_name} × {item.qty}</span>
                {item.note && <span className="order-item-note">({item.note})</span>}
              </div>
            ))}
          </div>
        )}

        <button className="btn-add-inline" onClick={() => setShowOrderForm(v => !v)}>
          {showOrderForm ? '— ซ่อน' : '+ เพิ่มรายการสั่ง'}
        </button>

        {showOrderForm && (
          <form onSubmit={handleAddItem} className="card-form" style={{ marginTop: 10 }}>
            <div className="form-field">
              <label className="form-label">ใครสั่ง *</label>
              <MemberPicker members={members} value={oForm.memberId} onChange={v => setOForm(f => ({ ...f, memberId: v }))} multiSelect={false} />
            </div>
            <div className="form-field">
              <label className="form-label">เมนู *</label>
              <select className="form-input" value={oForm.menuItemId} onChange={e => setOForm(f => ({ ...f, menuItemId: e.target.value }))}>
                <option value="">เลือกเมนู</option>
                {menuItems.map(m => (
                  <option key={m.id} value={m.id}>{m.name}{m.price ? ` (฿${m.price})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">จำนวน</label>
                <input type="number" className="form-input" min={1} max={99}
                  value={oForm.qty} onChange={e => setOForm(f => ({ ...f, qty: Number(e.target.value) }))} />
              </div>
              <div className="form-field" style={{ flex: 2 }}>
                <label className="form-label">หมายเหตุ</label>
                <input className="form-input" value={oForm.note}
                  onChange={e => setOForm(f => ({ ...f, note: e.target.value }))} placeholder="เช่น เผ็ดน้อย" />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowOrderForm(false)}>ยกเลิก</button>
              <button type="submit" className="btn-primary" disabled={!oForm.memberId[0] || !oForm.menuItemId}>เพิ่ม</button>
            </div>
          </form>
        )}
      </section>

      {/* ---- Menu Items ---- */}
      <section className="section" style={{ paddingBottom: 16 }}>
        <div className="section-header">
          <h2 className="section-title">เมนูร้าน</h2>
          <button className="btn-add-sm" onClick={() => setShowMenuForm(v => !v)}>+ เพิ่มเมนู</button>
        </div>

        {showMenuForm && (
          <form onSubmit={handleAddMenu} className="card-form" style={{ marginBottom: 10 }}>
            <div className="form-row">
              <div className="form-field" style={{ flex: 2 }}>
                <label className="form-label">ชื่อเมนู *</label>
                <input className="form-input" value={mForm.name}
                  onChange={e => setMForm(f => ({ ...f, name: e.target.value }))} placeholder="ชื่อเมนู" autoFocus />
              </div>
              <div className="form-field">
                <label className="form-label">ราคา (฿)</label>
                <input type="number" className="form-input" value={mForm.price}
                  onChange={e => setMForm(f => ({ ...f, price: e.target.value }))} placeholder="0" inputMode="decimal" />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowMenuForm(false)}>ยกเลิก</button>
              <button type="submit" className="btn-primary" disabled={!mForm.name.trim()}>บันทึก</button>
            </div>
          </form>
        )}

        {menuItems.length === 0 ? (
          <EmptyState icon="🍜" message="ยังไม่มีเมนู" />
        ) : (
          <div className="menu-list">
            {menuItems.map(item => (
              <div key={item.id} className="menu-item-row">
                <span className="menu-item-name">{item.name}</span>
                {item.price != null && <span className="menu-item-price">฿{item.price}</span>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
