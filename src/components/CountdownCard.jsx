import { STATUS_COLORS } from '../lib/reminders'
import { formatThaiDate } from '../lib/date'
import StatusPill from './StatusPill'

export default function CountdownCard({ title, date, daysUntil, status, type, subtitle }) {
  const borderColor = STATUS_COLORS[status]
  return (
    <div className="countdown-card" style={{ borderLeftColor: borderColor }}>
      <div className="countdown-card-header">
        <span className="countdown-card-title">{title}</span>
        <StatusPill status={status} daysUntil={daysUntil} />
      </div>
      {subtitle && <div className="countdown-card-subtitle">{subtitle}</div>}
      <div className="countdown-card-date">{formatThaiDate(date)}</div>
    </div>
  )
}
