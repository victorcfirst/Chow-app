import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMembers() {
      const { data, error: err } = await supabase
        .from('members')
        .select('*')
        .eq('active', true)
        .order('sort_order')
      if (err) setError(err.message)
      else setMembers(data ?? [])
      setLoading(false)
    }

    fetchMembers()

    const channel = supabase
      .channel('members-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, fetchMembers)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { members, loading, error }
}
