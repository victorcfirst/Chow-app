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

  return { photos, loading, error }
}
