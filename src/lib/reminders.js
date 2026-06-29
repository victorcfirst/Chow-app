export const THRESHOLD = {
  RED: 7,
  YELLOW: 30,
}

export function getStatus(days) {
  if (days < 0) return 'overdue'
  if (days < THRESHOLD.RED) return 'red'
  if (days < THRESHOLD.YELLOW) return 'yellow'
  return 'green'
}

export const STATUS_COLORS = {
  overdue: '#B71C1C',
  red: '#E53935',
  yellow: '#F9A825',
  green: '#43A047',
}

export const STATUS_LABELS = {
  overdue: 'เลยกำหนด',
  red: 'เร่งด่วน',
  yellow: 'ใกล้ถึง',
  green: 'ปกติ',
}
