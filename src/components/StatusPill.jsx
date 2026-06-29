import { STATUS_COLORS } from '../lib/reminders'

export default function StatusPill({ status, daysUntil }) {
  const color = STATUS_COLORS[status]
  let text
  if (status === 'overdue') text = `เลย ${Math.abs(daysUntil)} วัน`
  else if (daysUntil === 0) text = 'วันนี้'
  else if (daysUntil === 1) text = 'พรุ่งนี้'
  else text = `${daysUntil} วัน`

  return (
    <span
      className="status-pill"
      style={{ backgroundColor: color + '22', color, borderColor: color + '55' }}
    >
      {text}
    </span>
  )
}
