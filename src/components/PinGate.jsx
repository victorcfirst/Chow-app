import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function PinGate({ children }) {
  const { authed, loading, error, verifyPin } = useAuth()
  const [pin, setPin] = useState(['', '', '', ''])
  const inputs = useRef([])

  useEffect(() => {
    const full = pin.join('')
    if (full.length === 4) {
      verifyPin(full).then((ok) => {
        if (!ok) {
          setPin(['', '', '', ''])
          setTimeout(() => inputs.current[0]?.focus(), 50)
        }
      })
    }
  }, [pin, verifyPin])

  if (authed) return children

  function handleChange(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...pin]
    next[i] = val
    setPin(next)
    if (val && i < 3) inputs.current[i + 1]?.focus()
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !pin[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  return (
    <div className="pin-gate">
      <div className="pin-gate-card">
        <img src="/logo.png" alt="CHOW Family" className="pin-gate-logo" />
        <h1 className="pin-gate-title">CHOW Family</h1>
        <p className="pin-gate-subtitle">กรุณาใส่ PIN เพื่อเข้าใช้งาน</p>
        <div className="pin-inputs">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              className={`pin-input${error ? ' error' : ''}`}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              autoComplete="off"
            />
          ))}
        </div>
        {error && <p className="pin-error">{error}</p>}
        {loading && <p className="pin-loading">กำลังตรวจสอบ…</p>}
      </div>
    </div>
  )
}
