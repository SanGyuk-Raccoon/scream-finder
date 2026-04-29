# Discord-Gated Team Join And Completion Design

## Summary

ScrimFinder will keep Discord OAuth login as the application's primary authentication flow.
Discord server membership is used to gate match registration by the team owner.

Team joining is handled separately through a single invite link plus Riot Sign-On:

- creating a team immediately creates a reusable invite link
- opening the invite link does not create a team membership
- a user becomes a team member only after completing Riot Sign-On from that invite flow
- team seats are assigned on Riot completion order, first come first served
- a team is considered complete only when it has exactly 5 active members

This design intentionally keeps Riot Sign-On scoped to team joining only.
Riot is not part of match registration gating and is not required for general app login.

## Goals

- Keep Discord login as the app-wide identity layer
- Keep Riot Sign-On limited to invite-based team joining
- Remove onboarding intermediate states such as `PENDING`
- Use a single reusable invite link per team
- Allow users to belong to multiple teams
- Allow users to own multiple teams
- Keep one owner per team
- Allow match registration only for complete teams
- Require the team owner to be a Discord server member before match registration

## Non-Goals

- Automatically joining users to the Discord server
- Using Discord `guilds.join`
- Enabling Discord Membership Screening
- Reserving seats before Riot completion
- Supporting more than one Riot account per application user
- Implementing Riot checks outside the invite join flow

## Product Decisions

### Authentication

- Discord OAuth login remains the default application login method
- Users must have a Discord-authenticated session before completing invite-based team joining
- Each application user may link exactly one Riot account through Riot Sign-On

### Team Creation

- Team creation creates the team shell immediately
- Team creation also creates the team's reusable invite link immediately
- The team owner is not automatically inserted into `team_members`
- The owner may share the invite link even if they have not yet joined the team as a player
- If the owner wants to occupy a roster slot, they must use the same invite link and Riot flow as everyone else

### Team Membership

- Opening an invite link does not create a member record
- A member record is created only after Riot Sign-On succeeds
- There is no `PENDING` member state in the approved product logic
- The first 5 users who successfully complete Riot Sign-On through the invite flow become the active roster
- If 5 members already exist when another user completes Riot Sign-On, the join is rejected with `TEAM_FULL`

### Team Ownership And Membership Scope

- A team has exactly one owner
- A user may belong to many teams
- A user may own many teams
- Team ownership and team membership are separate concepts
- The owner's special responsibility is match registration

### Team Completion

- Team size is fixed at 5
- A team is complete when it has exactly 5 active members
- No separate cached completion flag is required in the first implementation
- Completion is computed from membership data at read time

### Match Registration

- Match registration is allowed only when the selected team is complete
- Match registration is allowed only when the team owner is a member of the configured Discord server
- Other product flows remain available even if the owner is not in the Discord server

## Technical Design

### Identity Model

The application user remains Discord-first.
Riot Sign-On enriches that existing user instead of creating a separate primary identity.

Approved model:

- `users` remains the base account table keyed by application `user.id`
- the logged-in user is found from the Discord session
- Riot account data is linked to that same application user
- one application user may have exactly one Riot account link

Recommended initial storage approach:

- add Riot account fields directly to the user record
- avoid introducing a separate `riot_accounts` table in the first implementation

Suggested user-linked Riot fields:

- `riotPuuid`
- `riotGameName`
- `riotTagLine`
- `riotLinkedAt`

### Team And Membership Model

Approved domain rules:

- `teams.ownerUserId` identifies the single owner of that team
- `team_members` represents actual roster membership only
- owner records are not auto-created at team creation time
- membership creation happens only after successful Riot completion
- product logic uses only active membership for team size and completion

For the first implementation, the existing `TeamMemberStatus` type may temporarily remain in shared contracts for compatibility, but the approved join flow must not create `PENDING` memberships.

### Invite Link Model

- each team has one reusable invite link created at team creation time
- the link may be shared before the owner has joined as a roster member
- the link is the single path into Riot-based team joining

### Discord Membership Service

The Discord membership check boundary remains:

- `src/shared/types/discord.ts`
- `src/server/services/discord-bot.ts`

Responsibilities:

- read bot configuration from environment variables
- look up whether a Discord user is in the configured guild
- return normalized guild member data for present users
- return `null` when the user is not in the guild
- fail closed for operational misconfiguration

### Riot Join Flow

Riot Sign-On is used only in the invite join flow.

Approved join flow:

1. User opens the team invite link
2. If the user is not logged in with Discord, they authenticate with Discord first
3. The invite flow starts Riot Sign-On
4. Riot callback resolves the Discord-authenticated application user
5. The application links the Riot account to that user
6. The application checks whether the user is already an active member of the target team
7. The application checks the current active roster count
8. If the team already has 5 active members, reject with `TEAM_FULL`
9. Otherwise create the active membership immediately

### Team Queries

`My team` becomes `My teams`.

Approved query model:

- team listing for a user is driven by `team_members.userId`
- owner-created teams may exist before the owner is a roster member
- owner dashboards and roster dashboards may need separate query paths

### Match Registration Guard

Match registration enforcement has two conditions:

1. the selected team has exactly 5 active members
2. the team owner is a member of the configured Discord server

These checks must run at both:

- match registration page entry
- match registration POST handling

This prevents both route and form bypass.

## Error Model

The approved business errors now include:

- `DISCORD_GUILD_MEMBERSHIP_REQUIRED`
- `TEAM_FULL`

Behavior:

- `DISCORD_GUILD_MEMBERSHIP_REQUIRED` is used when the owner attempts to enter or submit match registration without being in the Discord server
- `TEAM_FULL` is used when Riot completion occurs after all 5 team seats are already taken

Operational Discord bot misconfiguration is treated as closed-gate behavior for match registration.
It must not silently degrade into "not a guild member."

## Data Flow

### Team Creation

1. Resolve the Discord-authenticated owner
2. Create the team shell
3. Create the reusable team invite link automatically
4. Redirect the owner to the team page
5. Show that same invite link as the path the owner may also use to join as a player

### Invite Join

1. User opens the invite link
2. The app verifies the invite exists and is active
3. The app requires a Discord-authenticated session
4. The app starts Riot Sign-On
5. Riot callback resolves the same application user
6. The app links the Riot account to that user
7. The app checks whether the user already belongs to the team
8. The app checks whether the team already has 5 active members
9. If capacity remains, create the team membership as `ACTIVE`
10. If capacity is exhausted, stop with `TEAM_FULL`

### My Teams

1. Resolve current Discord-authenticated application user
2. Read teams through active memberships
3. Display all teams the user belongs to

### Match Registration Entry

1. Resolve current owner session
2. Verify owner authority for the selected team
3. Compute whether the team is complete from active membership count
4. Query Discord guild membership for the owner's Discord account
5. If the team is incomplete, reject entry
6. If the owner is not in the Discord server, reject entry with `DISCORD_GUILD_MEMBERSHIP_REQUIRED`
7. Otherwise render the match registration page

### Match Registration Submit

1. Resolve current owner session
2. Verify owner authority for the selected team
3. Recompute team completion
4. Recheck Discord guild membership for the owner
5. Reject if either precondition fails
6. Create the match post only when both checks pass

## Configuration

The application still needs these Discord values:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`
- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`
- `DISCORD_INVITE_URL`

For the Discord match gate, the critical values are:

- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`
- `DISCORD_INVITE_URL`

Riot configuration is required only for invite-based team joining.

## Testing Strategy

### Unit Tests

- Discord bot service returns normalized member data on `200`
- Discord bot service returns `null` on `404`
- Discord bot service throws on non-404 failure
- Discord bot service throws when required configuration is missing
- Riot join logic creates membership only after Riot success
- Riot join logic rejects when team capacity is already 5
- Riot join logic does not create duplicate membership for the same team

### Route And Action Tests

- team creation auto-creates an invite link
- invite join requires Discord-authenticated session
- invite join links Riot data to the current user
- invite join creates active membership after Riot completion
- a sixth successful Riot completion is rejected with `TEAM_FULL`
- match registration entry is blocked when the team is incomplete
- match registration entry is blocked when the owner is not in the Discord server
- match registration submit is blocked on the same conditions

### Page Behavior Checks

- team detail shows the owner-facing Discord participation banner when appropriate
- team detail presents the reusable invite link immediately after team creation
- my teams view lists multiple teams for the same user
- match registration UI reflects the complete-team requirement

### Manual Verification

1. Log in with Discord
2. Create a team
3. Confirm an invite link is automatically created
4. Confirm the owner is not automatically counted as a roster member
5. Use the invite link and complete Riot Sign-On
6. Confirm active membership is created only after Riot success
7. Repeat until 5 active members exist
8. Confirm a sixth Riot completion is rejected with `TEAM_FULL`
9. Confirm the owner can register a match only when the team is complete and the owner is in the Discord server

## Implementation Order

1. Update the design contracts for Discord-first user identity plus one Riot link
2. Change team creation to auto-create the invite link
3. Refactor invite join to require Discord session plus Riot completion
4. Remove `PENDING` behavior from the join flow
5. Change user-facing team queries from singular to plural where needed
6. Implement team completion checks from active membership count
7. Add Discord-server gating for owner match registration
8. Add tests for the invite, Riot, completion, and Discord gate flows
9. Update README and setup guidance

## Risks And Constraints

- Seat assignment is intentionally first-complete, not first-invited
- Owners can create and manage a team before joining its roster
- Users may belong to multiple teams, so "my team" assumptions must be removed from current code
- Users may own multiple teams, so current owner uniqueness assumptions must be removed from schema and query logic
- Discord bot misconfiguration blocks match registration
- Riot approval remains an external dependency for the invite join flow

## v1 변경 사항 (Issue #12)

본 설계 문서는 *RSO가 가용해진 이후의 최종 형태*를 기술한다. v1에서는 아래 항목이 일시적으로 다르게 동작하며, 명세 본문은 `docs/requirements/v1.md` 에 별도로 박혀 있다.

### 1. Discord 길드 게이트 검사 시점 — 이동

기존 본문(`Match Registration Guard`, `Match Registration Entry/Submit`, `Data Flow > Match Registration Entry/Submit`)은 길드 게이트를 *모집 등록 entry + submit* 두 자리에서 검사하도록 되어 있다.

v1 에서는 이를 **팀 합류 시점 한 자리**로 옮긴다.

- 검사 위치: `joinTeamByInviteAction` 직전 (Discord 로그인이 끝난 직후, 멤버 생성 전).
- 모집 등록 시점에는 길드 게이트 추가 검사를 *하지 않는다*. 이미 합류 시 통과한 사람들만 그 흐름에 들어가기 때문.
- 트레이드오프로 *합류 후 길드 탈퇴* 케이스는 잡히지 않는다. 매칭 알림 직전 재검사 방어선은 잠재 부채로 추후 추가.
- 사용자 결정 근거: "회원가입(=Discord 인증으로 사이트에 한 번 들어옴) ≠ 매 방문마다 로그인". 비로그인 둘러보기 요건과의 충돌도 회피.

### 2. RSO 비가용 기간의 임시 자기 신고 폼

본문 `Riot Join Flow` 와 `Data Flow > Invite Join` 의 3–6 단계는 RSO 호출을 전제한다.

v1 에서는 RSO 가 외부 사정으로 가용하지 않으므로, 같은 자리를 **임시 자기 신고 폼**으로 대체한다.

- 입력 항목: **Riot 닉네임 (`gameName`) + 솔로 티어 (`soloTier`)**.
- 저장 위치: 합류 시점에 입력되므로 `team_members` 측이 자연스럽다 (정확한 위치는 후속 타입 PR에서 확정).
- RSO 가용 시점에 **동일 자리를 RSO 결과로 교체**한다. 도메인 모델 자체는 바뀌지 않는다 (필드 이름이 같은 자리에 남음).
- 자기 신고는 신뢰도가 낮으므로, 자동 매칭이 사용하는 평균 티어는 *현 시점의 자기 신고 값* 을 그대로 사용하되, 추후 RSO 결과로 덮어쓴다.

### 3. `Match` 엔터티 도입과 매칭 흐름

본 설계 문서는 매칭(두 팀을 묶는 행위)을 *명시적으로 다루지 않는다*. v1 에서는 이를 별도 엔터티로 도입한다.

- 신규 엔터티 `Match`: 두 팀 / 두 모집글을 묶는 합의 결과. 승패는 저장하지 않음.
- 신규 엔터티 `MatchProposal` (또는 `MatchRequest`): 수동 신청과 자동 매칭 후보를 같은 자료형으로 표현.
- **수동 신청과 자동 매칭은 항상 병행**한다. 모든 `OPEN` 모집글이 자동 큐의 후보이자 수동 신청 대상.
- 티어 비교는 **팀 평균 티어 vs 모집글 `minTier`–`maxTier`**.
- 매칭 확정 시점에 Discord 봇이 양 팀에 알림 송신.

자세한 흐름·필드는 `docs/requirements/v1.md` §5 참조.

### 4. 모집 등록 가드 — 정확히 5명

본 설계 문서의 `Team Completion` / `Match Registration` 조건과 일치한다. 다만 현재 코드는 `registerMatchPostAction` 가 "ACTIVE ≥ 1" 만 검사하므로 v1 에서 **"ACTIVE == 5"** 로 강화한다.
