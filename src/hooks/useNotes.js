import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchNotes() {
      const { data, error: err } = await supabase
        .from('notes')
        .select('*, note_members(member_id)')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
      if (err) setError(err.message)
      else setNotes(data ?? [])
      setLoading(false)
    }

    fetchNotes()

    const channel = supabase
      .channel('notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, fetchNotes)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function addNote({ content, memberIds = [], createdBy = null }) {
    const { data: note, error: err } = await supabase
      .from('notes')
      .insert({ content, created_by: createdBy })
      .select()
      .single()
    if (err) throw err
    if (memberIds.length > 0) {
      await supabase.from('note_members').insert(
        memberIds.map((member_id) => ({ note_id: note.id, member_id }))
      )
    }
    return note
  }

  async function togglePin(id, pinned) {
    await supabase.from('notes').update({ pinned: !pinned }).eq('id', id)
  }

  async function toggleDone(id, done) {
    await supabase.from('notes').update({ done: !done }).eq('id', id)
  }

  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id)
  }

  return { notes, loading, error, addNote, togglePin, toggleDone, deleteNote }
}
