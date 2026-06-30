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
    setNotes(prev => [
      { ...note, note_members: memberIds.map(id => ({ member_id: id })) },
      ...prev,
    ])
    return note
  }

  async function updateNote(id, { content, memberIds }) {
    const { data, error: err } = await supabase
      .from('notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    await supabase.from('note_members').delete().eq('note_id', id)
    if (memberIds.length > 0) {
      await supabase.from('note_members').insert(
        memberIds.map((member_id) => ({ note_id: id, member_id }))
      )
    }
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, ...data, note_members: memberIds.map(mid => ({ member_id: mid })) } : n
    ))
    return data
  }

  async function togglePin(id, pinned) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !pinned } : n))
    await supabase.from('notes').update({ pinned: !pinned }).eq('id', id)
  }

  async function toggleDone(id, done) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, done: !done } : n))
    await supabase.from('notes').update({ done: !done }).eq('id', id)
  }

  async function deleteNote(id) {
    setNotes(prev => prev.filter(n => n.id !== id))
    await supabase.from('notes').delete().eq('id', id)
  }

  return { notes, loading, error, addNote, updateNote, togglePin, toggleDone, deleteNote }
}
