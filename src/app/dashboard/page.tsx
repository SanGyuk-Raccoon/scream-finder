import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/actions/auth";
import { getMyTeamAction } from "@/server/actions/teams";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const team = await getMyTeamAction(user.id);

  return (
    <main className="shell">
      <section className="panel hero">
        <p className="eyebrow">Owner Dashboard</p>
        <h1>{user.username}</h1>
        <p className="lede">
          Discord 로그인으로 팀장을 식별하고, 팀 생성과 초대 링크, 매칭 등록 흐름을 먼저 검증하는
          단계입니다.
        </p>
        <div className="stat-grid">
          <article className="stat-card">
            <span className="meta-label">Discord ID</span>
            <strong>{user.discordUserId}</strong>
          </article>
          <article className="stat-card">
            <span className="meta-label">팀 상태</span>
            <strong>{team ? "생성 완료" : "아직 없음"}</strong>
          </article>
        </div>
        {team ? (
          <div className="actions">
            <Link className="button" href={`/teams/${team.id}`}>
              팀 관리로 이동
            </Link>
            <Link className="button secondary" href={`/teams/${team.id}/matches/new`}>
              매칭 등록
            </Link>
          </div>
        ) : (
          <div className="actions">
            <Link className="button" href="/teams/new">
              팀 생성 시작
            </Link>
          </div>
        )}
        <form action="/api/auth/logout" method="post" className="actions">
          <button className="button secondary" type="submit">
            로그아웃
          </button>
        </form>
      </section>

      <section className="panel">
        <p className="eyebrow">Manual Test Guide</p>
        <h2>여기서 확인할 것</h2>
        <div className="checklist">
          <div className="check-item">현재 사용자명이 Discord 계정과 맞는지</div>
          <div className="check-item">팀이 없으면 생성 버튼만 보이는지</div>
          <div className="check-item">팀이 있으면 팀 관리와 매칭 등록 버튼이 보이는지</div>
          <div className="check-item">로그아웃 후 홈으로 돌아가는지</div>
        </div>
      </section>
    </main>
  );
}
