import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { todayISO, daysUntil } from '../lib/date'
import { getStatus } from '../lib/reminders'

export function useReminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const today = todayISO()

      const [eventsRes, insuranceRes, vehiclesRes] = await Promise.all([
        supabase
          .from('events')
          .select('id, title, event_date, category')
          .gte('event_date', today)
          .order('event_date'),
        supabase
          .from('insurance_policies')
          .select('id, policy_name, next_due_date, coverage_end_date, status')
          .eq('status', 'active'),
        supabase
          .from('vehicles')
          .select('id, nickname, brand, model, tax_due_date, cmi_due_date, insurance_due_date, next_service_date'),
      ])

      const items = []

      for (const e of eventsRes.data ?? []) {
        const d = daysUntil(e.event_date)
        items.push({ title: e.title, date: e.event_date, daysUntil: d, status: getStatus(d), type: 'event' })
      }

      for (const p of insuranceRes.data ?? []) {
        const name = p.policy_name ?? 'ประกัน'
        if (p.next_due_date) {
          const d = daysUntil(p.next_due_date)
          items.push({ title: `${name} — งวดถัดไป`, date: p.next_due_date, daysUntil: d, status: getStatus(d), type: 'insurance' })
        }
        if (p.coverage_end_date) {
          const d = daysUntil(p.coverage_end_date)
          if (d <= 60) {
            items.push({ title: `${name} — คุ้มครองหมด`, date: p.coverage_end_date, daysUntil: d, status: getStatus(d), type: 'insurance' })
          }
        }
      }

      for (const v of vehiclesRes.data ?? []) {
        const brandModel = `${v.brand ?? ''} ${v.model ?? ''}`.trim()
        const vname = v.nickname ?? (brandModel || 'รถ')
        const slots = [
          [v.tax_due_date, 'ต่อภาษีรถ'],
          [v.cmi_due_date, 'พ.ร.บ.'],
          [v.insurance_due_date, 'ประกันรถ'],
          [v.next_service_date, 'เช็กระยะ'],
        ]
        for (const [date, label] of slots) {
          if (date) {
            const d = daysUntil(date)
            items.push({ title: `${vname} — ${label}`, date, daysUntil: d, status: getStatus(d), type: 'vehicle' })
          }
        }
      }

      items.sort((a, b) => a.daysUntil - b.daysUntil)
      setReminders(items)
      setLoading(false)
    }

    fetchAll()
  }, [])

  return { reminders, loading }
}
