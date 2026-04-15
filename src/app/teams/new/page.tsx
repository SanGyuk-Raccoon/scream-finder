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
        <h1>팀을 먼저 만들고 초대 링크와 매칭 등록 흐름을 검증합니다</h1>
        <p className="lede">
          현재는 RSO를 붙이기 전 단계라 팀 생성과 팀 멤버 저장, 매칭 등록까지의 기본 흐름에 집중합니다.
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
              placeholder="주 3회 스크림, 저녁 시간대 중심으로 운영"
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
          <div className="check-item">생성 성공 후 자동으로 팀 상세 페이지로 이동해야 합니다</div>
          <div className="check-item">생성 직후 팀장 멤버가 ACTIVE 상태로 저장되어야 합니다</div>
        </div>
      </section>
    </main>
  );
}
