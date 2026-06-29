import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const SESSION_KEY = 'chow_authed'

export function useAuth() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const verifyPin = useCallback(async (pin) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'pin')
        .single()
      if (err) throw err
      const correct = data?.value === pin
      if (correct) {
        sessionStorage.setItem(SESSION_KEY, '1')
        setAuthed(true)
      } else {
        setError('PIN ไม่ถูกต้อง')
      }
      return correct
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
  }, [])

  return { authed, loading, error, verifyPin, logout }
}
