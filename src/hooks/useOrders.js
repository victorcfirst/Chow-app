import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/date'

export function useOrders(restaurantId) {
  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const today = todayISO()

  useEffect(() => {
    if (!restaurantId) { setLoading(false); return }

    async function fetchOrder() {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('order_date', today)
        .maybeSingle()
      if (err) { setError(err.message); setLoading(false); return }
      setOrder(data)

      if (data) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*, members(name, color, emoji)')
          .eq('order_id', data.id)
        setOrderItems(items ?? [])
      }
      setLoading(false)
    }

    fetchOrder()

    const channel = supabase
      .channel(`order-${restaurantId}-${today}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, fetchOrder)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [restaurantId, today])

  async function ensureOrder() {
    if (order) return order
    const { data, error: err } = await supabase
      .from('orders')
      .insert({ restaurant_id: restaurantId, order_date: today })
      .select()
      .single()
    if (err) throw err
    setOrder(data)
    return data
  }

  async function addItem({ memberId, menuItemId, menuName, qty = 1, note = '' }) {
    const o = await ensureOrder()
    const { data, error: err } = await supabase
      .from('order_items')
      .insert({ order_id: o.id, member_id: memberId, menu_item_id: menuItemId, menu_name: menuName, qty, note })
      .select()
      .single()
    if (err) throw err
    setOrderItems((prev) => [...prev, data])
    return data
  }

  async function updateStatus(status) {
    if (!order) return
    await supabase.from('orders').update({ status }).eq('id', order.id)
    setOrder((prev) => ({ ...prev, status }))
  }

  return { order, orderItems, loading, error, addItem, updateStatus }
}
