import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchRestaurants() {
      const { data, error: err } = await supabase
        .from('restaurants')
        .select('*')
        .eq('active', true)
        .order('sort_order')
      if (err) setError(err.message)
      else setRestaurants(data ?? [])
      setLoading(false)
    }
    fetchRestaurants()
  }, [])

  async function addRestaurant(values) {
    const { data, error: err } = await supabase.from('restaurants').insert(values).select().single()
    if (err) throw err
    setRestaurants((prev) => [...prev, data])
    return data
  }

  return { restaurants, loading, error, addRestaurant }
}
