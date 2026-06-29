export default function MemberAvatar({ member, size = 36 }) {
  return (
    <div
      title={member.name}
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        backgroundColor: member.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {member.emoji ?? member.name.charAt(0)}
    </div>
  )
}
