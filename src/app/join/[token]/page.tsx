import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, isSupabaseConfiguredAction } from "@/server/actions/auth";
import { getInviteLinkAction } from "@/server/actions/invite-links";
import { getTeamViewAction } from "@/server/actions/teams";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ joined?: string; error?: string; teamId?: string }>;
};

export default async function JoinTeamPage({ params, searchParams }: Props) {
  const { token } = await params;
  const query = await searchParams;
  const inviteLink = await getInviteLinkAction(token);
  const sessionUser = await getCurrentUser();

  if (!inviteLink) {
    notFound();
  }

  const { team } = await getTeamViewAction(inviteLink.teamId);
  if (!team) {
    notFound();
  }

  return (
    <main className="shell">
      <section className="panel hero">
        <p className="eyebrow">Join Team</p>
        <h1>{team.name}</h1>
        <p className="lede">
          초대 링크를 받은 사람이 팀에 합류하는 화면입니다. 현재 단계에서는 기본 정보만 입력해
          멤버 등록과 Supabase 저장 흐름을 먼저 검증합니다.
        </p>
        {sessionUser?.id === team.ownerUserId ? (
          <p className="notice">
            현재 팀장 계정으로 접속 중입니다. 본인도 같은 초대 링크를 통해 팀 멤버 흐름을 확인할 수
            있습니다.
          </p>
        ) : null}
        {query.joined ? (
          <p className="notice success">
            팀 합류가 완료되었습니다.
            {query.teamId ? (
              <>
                {" "}
                <Link href={`/teams/${query.teamId}`}>팀 페이지로 이동</Link>
              </>
            ) : null}
          </p>
        ) : null}
        {query.error ? <p className="notice error">{query.error}</p> : null}
      </section>

      <section className="panel">
        <p className="eyebrow">Invite Snapshot</p>
        <h2>합류 전에 확인할 정보</h2>
        <div className="checklist">
          <div className="check-item">토큰: {token}</div>
          <div className="check-item">팀 이름: {team.name}</div>
          <div className="check-item">
            링크 상태: {inviteLink.status} / 사용 {inviteLink.usedCount}
            {inviteLink.maxUses ? ` / 최대 ${inviteLink.maxUses}` : ""}
          </div>
          <div className="check-item">
            저장소: {isSupabaseConfiguredAction() ? "Supabase" : "In-memory fallback"}
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Join Action</p>
        <h2>멤버 등록 테스트</h2>
        <p className="lede">
          RSO는 나중에 붙일 예정이라 지금은 표시 이름만 입력합니다. 이 단계에서 중요한 것은 팀 멤버,
          초대 링크 사용량, 이후 매칭 등록까지 데이터가 저장되는지입니다.
        </p>
        <form action={`/api/invite-links/${token}/join`} method="post" className="stack">
          <label className="field">
            <span>표시 이름</span>
            <input name="displayName" placeholder="Midnight Top" required={!sessionUser} />
          </label>
          <button className="button" type="submit">
            팀 합류
          </button>
        </form>
      </section>
    </main>
  );
}
