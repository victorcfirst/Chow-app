import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/date'

export function useTodayOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const today = todayISO()

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, status, restaurant_id,
          restaurants(name),
          order_items(id, menu_name, qty, note, member_id, members(name, color, emoji))
        `)
        .eq('order_date', today)
        .neq('status', 'done')
      if (!error) setOrders(data ?? [])
      setLoading(false)
    }

    fetch()

    const channel = supabase
      .channel('today-orders-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetch)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [today])

  return { orders, loading }
}
