import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMenuItems(restaurantId) {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!restaurantId) { setLoading(false); return }

    async function fetchItems() {
      const { data, error: err } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('active', true)
        .order('sort_order')
      if (err) setError(err.message)
      else setMenuItems(data ?? [])
      setLoading(false)
    }
    fetchItems()
  }, [restaurantId])

  async function addMenuItem(values) {
    const { data, error: err } = await supabase
      .from('menu_items')
      .insert({ ...values, restaurant_id: restaurantId })
      .select()
      .single()
    if (err) throw err
    setMenuItems((prev) => [...prev, data])
    return data
  }

  return { menuItems, loading, error, addMenuItem }
}
