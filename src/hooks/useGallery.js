import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useGallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPhotos() {
      const { data, error: err } = await supabase
        .from('family_photos')
        .select('*')
        .order('sort_order')
      if (err) {
        setError(err.message)
      } else {
        setPhotos(
          (data ?? []).map((p) => ({
            ...p,
            url: supabase.storage.from('gallery').getPublicUrl(p.storage_path).data.publicUrl,
          }))
        )
      }
      setLoading(false)
    }
    fetchPhotos()
  }, [])

  async function addPhoto(file, caption = '') {
    const ext = file.name.split('.').pop()
    const path = `photos/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('gallery').upload(path, file)
    if (upErr) throw upErr
    const maxOrder = photos.reduce((m, p) => Math.max(m, p.sort_order ?? 0), 0)
    const { data, error: dbErr } = await supabase
      .from('family_photos')
      .insert({ storage_path: path, caption: caption || null, sort_order: maxOrder + 1 })
      .select()
      .single()
    if (dbErr) throw dbErr
    const url = supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl
    setPhotos(prev => [...prev, { ...data, url }])
  }

  async function deletePhoto(id) {
    const photo = photos.find(p => p.id === id)
    if (!photo) return
    await supabase.storage.from('gallery').remove([photo.storage_path])
    await supabase.from('family_photos').delete().eq('id', id)
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  return { photos, loading, error, addPhoto, deletePhoto }
}
