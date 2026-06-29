export default function MemberTag({ member }) {
  return (
    <span
      className="member-tag"
      style={{
        backgroundColor: member.color + '22',
        color: member.color,
        borderColor: member.color + '55',
      }}
    >
      {member.emoji && <span>{member.emoji}</span>}
      {member.name}
    </span>
  )
}
