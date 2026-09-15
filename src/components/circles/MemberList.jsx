import './MemberList.css'

export default function MemberList({ members = [], currentUserId }) {
  return (
    <div className="member-list-card">
      <div className="member-list-header">
        <div className="member-list-title">
          <span>Circle Members</span>
          <span className="member-count-badge">{members.length}</span>
        </div>
      </div>

      <div className="members-grid">
        {members.map((member) => {
          const isCurrentUser = member.id === currentUserId
          const isKeeper = member.role === 'keeper'

          return (
            <div key={member.id} className="member-item">
              <div className="member-info">
                <div className="member-avatar">
                  {isKeeper ? '🪄' : '✨'}
                </div>
                <div>
                  <div className="member-name">
                    {member.name} {isCurrentUser && <span style={{ color: '#c0d8f8', fontSize: '0.75rem' }}>(You)</span>}
                  </div>
                  {member.patronus && (
                    <div className="member-patronus">{member.patronus}</div>
                  )}
                </div>
              </div>

              <div>
                {isKeeper ? (
                  <span className="member-role-badge member-role-badge--keeper">
                    Keeper
                  </span>
                ) : (
                  <span className="member-role-badge member-role-badge--member">
                    Member
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
