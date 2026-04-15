import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/server/actions/auth";
import { getTeamViewAction } from "@/server/actions/queries";

type Props = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ error?: string; inviteCreated?: string; matchCreated?: string }>;
};

function formatMemberName(gameName?: string, tagLine?: string): string {
  if (!gameName || !tagLine) {
    return "Riot verification pending";
  }

  return `${gameName}#${tagLine}`;
}

export default async function TeamDetailPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  const { teamId } = await params;
  const query = await searchParams;

  if (!user) {
    redirect("/");
  }

  const { team, members, inviteLinks, matchPosts } = await getTeamViewAction(teamId);

  if (!team) {
    notFound();
  }

  if (team.ownerUserId !== user.id) {
    redirect("/dashboard");
  }

  const activeInvite = inviteLinks.find((link) => link.status === "ACTIVE");
  const ownerMember = members.find((member) => member.role === "OWNER");
  const ownerNeedsVerification = ownerMember?.status !== "ACTIVE";
  const hasOpenMatch = matchPosts.some((post) => post.status === "OPEN");

  return (
    <main className="shell">
      <section className="panel hero">
        <p className="eyebrow">Team Management</p>
        <h1>{team.name}</h1>
        <p className="lede">{team.description || "팀 소개가 아직 없습니다."}</p>
        <div className="meta-grid">
          <div>
            <span className="meta-label">활동 시간</span>
            <strong>{team.activityTime || "미정"}</strong>
          </div>
          <div>
            <span className="meta-label">멤버 상태</span>
            <strong>
              {members.filter((member) => member.status === "ACTIVE").length}명 활성 /
              {members.length}명 전체
            </strong>
          </div>
        </div>
        {query.error ? <p className="notice error">{query.error}</p> : null}
        {query.inviteCreated ? (
          <p className="notice success">새 초대 링크를 생성했습니다.</p>
        ) : null}
        {query.matchCreated ? (
          <p className="notice success">매칭 글을 등록했습니다.</p>
        ) : null}
      </section>

      <section className="panel">
        <p className="eyebrow">Verification Status</p>
        <h2>현재 단계가 바로 보이도록 정리한 상태판</h2>
        <div className="checklist">
          <div className={`check-item ${inviteLinks.length > 0 ? "is-done" : ""}`}>
            1. 초대 링크 생성 {inviteLinks.length > 0 ? "완료" : "대기"}
          </div>
          <div className={`check-item ${ownerNeedsVerification ? "" : "is-done"}`}>
            2. 팀장 Riot 검증 {ownerNeedsVerification ? "대기" : "완료"}
          </div>
          <div className={`check-item ${hasOpenMatch ? "is-done" : ""}`}>
            3. 매칭 등록 {hasOpenMatch ? "완료" : "대기"}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Owner Verification</p>
            <h2>팀장도 초대 링크를 통해 Riot 인증을 마쳐야 합니다.</h2>
          </div>
          {activeInvite ? (
            <Link className="button secondary" href={`/join/${activeInvite.token}`}>
              {ownerNeedsVerification ? "팀장 Riot 검증" : "초대 링크 보기"}
            </Link>
          ) : null}
        </div>
        <p className="lede">
          {ownerNeedsVerification
            ? "현재 팀장이 아직 ACTIVE 멤버가 아닙니다. 아래 초대 링크를 통해 본인도 팀에 합류하세요."
            : "팀장 Riot 검증이 완료되어 매칭 등록 조건을 충족했습니다."}
        </p>
      </section>

      <section className="grid two">
        <div className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Invite Links</p>
              <h2>공유 가능한 합류 링크</h2>
            </div>
          </div>
          <form
            action={`/api/teams/${team.id}/invite-links`}
            method="post"
            className="stack compact"
          >
            <label className="field">
              <span>최대 사용 횟수</span>
              <input name="maxUses" type="number" min="1" placeholder="비워두면 무제한" />
            </label>
            <label className="field">
              <span>만료 시각</span>
              <input name="expiresAt" type="datetime-local" />
            </label>
            <button className="button" type="submit">
              초대 링크 생성
            </button>
          </form>

          <div className="stack list">
            {inviteLinks.length === 0 ? (
              <p className="muted">아직 생성된 링크가 없습니다.</p>
            ) : (
              inviteLinks.map((link) => (
                <article key={link.id} className="list-card">
                  <strong>/join/{link.token}</strong>
                  <span className="mono">{link.token}</span>
                  <span>
                    상태 {link.status} / 사용 {link.usedCount}
                    {link.maxUses ? `/${link.maxUses}` : ""}
                  </span>
                  <Link href={`/join/${link.token}`}>링크 열기</Link>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Members</p>
              <h2>현재 팀 구성</h2>
            </div>
          </div>
          <div className="stack list">
            {members.map((member) => (
              <article key={member.id} className="list-card">
                <strong>
                  {member.role === "OWNER" ? "팀장" : "팀원"} · {member.status}
                </strong>
                <span>
                  {formatMemberName(
                    member.riotAccount?.gameName,
                    member.riotAccount?.tagLine,
                  )}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Matches</p>
            <h2>등록된 스크림 모집</h2>
          </div>
          <Link className="button" href={`/teams/${team.id}/matches/new`}>
            매칭 등록
          </Link>
        </div>
        <div className="stack list">
          {matchPosts.length === 0 ? (
            <p className="muted">아직 등록된 매칭 글이 없습니다.</p>
          ) : (
            matchPosts.map((post) => (
              <article key={post.id} className="list-card">
                <strong>{post.title}</strong>
                <span>{post.description || "설명 없음"}</span>
                <span>
                  상태 {post.status}
                  {post.minTier || post.maxTier
                    ? ` / ${post.minTier || "?"} ~ ${post.maxTier || "?"}`
                    : ""}
                </span>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
