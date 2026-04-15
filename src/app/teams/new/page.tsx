import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/actions/auth";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewTeamPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const query = await searchParams;

  if (!user) {
    redirect("/");
  }

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Create Team</p>
        <h1>팀장을 먼저 만들고, 이후에 Riot 검증으로 팀원 구성을 확정합니다.</h1>
        <p className="lede">
          지금 단계에서는 빠른 동작 검증이 목적이므로 팀명, 소개, 활동 시간만 받습니다.
        </p>
        {query.error ? <p className="notice error">{query.error}</p> : null}
        <form action="/api/teams" method="post" className="stack">
          <label className="field">
            <span>팀명</span>
            <input name="name" placeholder="Midnight Scrim" required />
          </label>
          <label className="field">
            <span>팀 소개</span>
            <textarea
              name="description"
              rows={4}
              placeholder="주 3회 스크림, 밤 9시 이후 가능"
            />
          </label>
          <label className="field">
            <span>주 활동 시간</span>
            <input name="activityTime" placeholder="평일 21:00-24:00" />
          </label>
          <div className="actions">
            <button className="button" type="submit">
              팀 생성
            </button>
            <Link className="button secondary" href="/dashboard">
              취소
            </Link>
          </div>
        </form>
        <div className="checklist top-gap">
          <div className="check-item">생성 성공 시 자동으로 팀 상세 페이지로 이동해야 합니다</div>
          <div className="check-item">생성 직후 팀장 멤버 상태는 `PENDING_RIOT` 이어야 합니다</div>
        </div>
      </section>
    </main>
  );
}
