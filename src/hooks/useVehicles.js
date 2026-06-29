import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useVehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchVehicles() {
      const { data, error: err } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) setError(err.message)
      else setVehicles(data ?? [])
      setLoading(false)
    }
    fetchVehicles()
  }, [])

  async function addVehicle(values) {
    const { data, error: err } = await supabase.from('vehicles').insert(values).select().single()
    if (err) throw err
    setVehicles((prev) => [data, ...prev])
    return data
  }

  async function updateVehicle(id, values) {
    const { data, error: err } = await supabase
      .from('vehicles')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    setVehicles((prev) => prev.map((v) => (v.id === id ? data : v)))
    return data
  }

  async function getSignedImageUrl(path) {
    const { data, error: err } = await supabase.storage.from('documents').createSignedUrl(path, 3600)
    if (err) throw err
    return data.signedUrl
  }

  return { vehicles, loading, error, addVehicle, updateVehicle, getSignedImageUrl }
}
