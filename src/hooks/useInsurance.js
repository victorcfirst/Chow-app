import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FREQ_MULTIPLIER = { year: 1, semi: 2, quarter: 4, month: 12 }

export function useInsurance() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPolicies() {
      const { data, error: err } = await supabase
        .from('insurance_policies')
        .select('*, members(id, name, color, emoji)')
        .order('created_at', { ascending: false })
      if (err) setError(err.message)
      else setPolicies(data ?? [])
      setLoading(false)
    }
    fetchPolicies()
  }, [])

  function annualPremium(policy) {
    if (!policy.premium) return 0
    return policy.premium * (FREQ_MULTIPLIER[policy.premium_frequency] ?? 1)
  }

  async function addPolicy(values) {
    const { data, error: err } = await supabase.from('insurance_policies').insert(values).select().single()
    if (err) throw err
    setPolicies((prev) => [data, ...prev])
    return data
  }

  async function updatePolicy(id, values) {
    const { data, error: err } = await supabase
      .from('insurance_policies')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    setPolicies((prev) => prev.map((p) => (p.id === id ? data : p)))
    return data
  }

  async function deletePolicy(id) {
    await supabase.from('insurance_policies').delete().eq('id', id)
    setPolicies((prev) => prev.filter((p) => p.id !== id))
  }

  return { policies, loading, error, annualPremium, addPolicy, updatePolicy, deletePolicy }
}
