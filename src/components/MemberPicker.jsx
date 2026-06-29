import MemberAvatar from './MemberAvatar'

/**
 * Multi-select (default) or single-select member toggle.
 * Props:
 *   members    — array from useMembers()
 *   value      — array of selected member IDs
 *   onChange   — (ids: string[]) => void
 *   multiSelect — bool (default true); false = single-select
 */
export default function MemberPicker({ members, value = [], onChange, multiSelect = true }) {
  function toggle(id) {
    if (multiSelect) {
      onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
    } else {
      onChange(value.includes(id) ? [] : [id])
    }
  }

  return (
    <div className="member-picker">
      {members.map((m) => {
        const selected = value.includes(m.id)
        return (
          <button
            key={m.id}
            type="button"
            className={`member-pick-btn${selected ? ' selected' : ''}`}
            style={
              selected
                ? { borderColor: m.color, backgroundColor: m.color + '22' }
                : {}
            }
            onClick={() => toggle(m.id)}
          >
            <MemberAvatar member={m} size={28} />
            <span className="member-pick-name">{m.name}</span>
          </button>
        )
      })}
    </div>
  )
}
