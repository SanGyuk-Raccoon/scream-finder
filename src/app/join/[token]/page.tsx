import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/server/actions/auth";
import { getInviteLinkAction } from "@/server/actions/invite-links";
import { getTeamViewAction } from "@/server/actions/queries";
import { isSupabaseConfigured } from "@/server/repositories";

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
          이 링크는 누구나 열 수 있지만, 최종 합류는 Riot 검증이 완료된 멤버만 가능합니다.
        </p>
        {sessionUser?.id === team.ownerUserId ? (
          <p className="notice">
            현재 팀장 계정으로 접속 중입니다. 본인 검증에도 같은 링크를 사용할 수 있습니다.
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
        <h2>합류 전에 눈으로 확인할 정보</h2>
        <div className="checklist">
          <div className="check-item">토큰: {token}</div>
          <div className="check-item">팀 이름: {team.name}</div>
          <div className="check-item">
            링크 상태: {inviteLink.status} / 사용 {inviteLink.usedCount}
            {inviteLink.maxUses ? ` / 최대 ${inviteLink.maxUses}` : ""}
          </div>
          <div className="check-item">
            저장소: {isSupabaseConfigured() ? "Supabase" : "In-memory fallback"}
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Join Action</p>
        <h2>지금은 Supabase 저장 여부를 먼저 확인하기 쉽게 유지합니다.</h2>
        <p className="lede">
          현재는 Riot 외부 인증 대신 Riot ID 입력 fallback을 유지합니다. 이번 단계에서 중요한
          것은 팀, 멤버, 초대 링크, 매칭 글이 Supabase에 영구 저장되는지입니다.
        </p>
        <form action={`/api/invite-links/${token}/join`} method="post" className="stack">
          <label className="field">
            <span>Game Name</span>
            <input name="gameName" placeholder="Hide on bush" required />
          </label>
          <label className="field">
            <span>Tag Line</span>
            <input name="tagLine" placeholder="KR1" required />
          </label>
          <button className="button" type="submit">
            Riot 검증 후 팀 합류
          </button>
        </form>
      </section>
    </main>
  );
}
