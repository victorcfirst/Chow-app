import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/date'

export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchEvents() {
      const { data, error: err } = await supabase
        .from('events')
        .select('*, event_members(member_id)')
        .gte('event_date', todayISO())
        .order('event_date')
      if (err) setError(err.message)
      else setEvents(data ?? [])
      setLoading(false)
    }

    fetchEvents()

    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function addEvent({ title, category = 'appointment', event_date, event_time, location, note, memberIds = [] }) {
    const { data: ev, error: err } = await supabase
      .from('events')
      .insert({ title, category, event_date, event_time, location, note })
      .select()
      .single()
    if (err) throw err
    if (memberIds.length > 0) {
      await supabase.from('event_members').insert(memberIds.map((member_id) => ({ event_id: ev.id, member_id })))
    }
    return ev
  }

  async function deleteEvent(id) {
    await supabase.from('events').delete().eq('id', id)
  }

  return { events, loading, error, addEvent, deleteEvent }
}
