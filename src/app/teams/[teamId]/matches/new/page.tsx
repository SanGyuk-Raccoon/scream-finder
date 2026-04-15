import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/server/actions/auth";
import { getTeamViewAction } from "@/server/actions/queries";

type Props = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ error?: string }>;
};

const TIERS = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
] as const;

export default async function NewMatchPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  const { teamId } = await params;
  const query = await searchParams;

  if (!user) {
    redirect("/");
  }

  const { team } = await getTeamViewAction(teamId);
  if (!team) {
    notFound();
  }

  if (team.ownerUserId !== user.id) {
    redirect("/dashboard");
  }

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Match Registration</p>
        <h1>{team.name} 스크림 모집글 등록</h1>
        <p className="lede">
          현재 단계에서는 팀장 Riot 검증이 끝나 있어야만 등록할 수 있습니다.
        </p>
        {query.error ? <p className="notice error">{query.error}</p> : null}
        <form action={`/api/teams/${team.id}/matches`} method="post" className="stack">
          <label className="field">
            <span>제목</span>
            <input name="title" placeholder="금요일 5:5 스크림 구합니다" required />
          </label>
          <label className="field">
            <span>설명</span>
            <textarea
              name="description"
              rows={4}
              placeholder="평균 다이아, 보이스 필수, 22시 시작"
            />
          </label>
          <div className="grid two">
            <label className="field">
              <span>최소 티어</span>
              <select name="minTier" defaultValue="">
                <option value="">선택 안 함</option>
                {TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>최대 티어</span>
              <select name="maxTier" defaultValue="">
                <option value="">선택 안 함</option>
                {TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>가능 시간</span>
            <input name="availableTime" placeholder="금요일 22:00-01:00" />
          </label>
          <div className="actions">
            <button className="button" type="submit">
              매칭 등록
            </button>
            <Link className="button secondary" href={`/teams/${team.id}`}>
              돌아가기
            </Link>
          </div>
        </form>
        <div className="checklist top-gap">
          <div className="check-item">팀장 Riot 검증이 안 끝났으면 에러가 보여야 합니다</div>
          <div className="check-item">성공 시 팀 상세 페이지에 OPEN 상태 글이 나타나야 합니다</div>
        </div>
      </section>
    </main>
  );
}
