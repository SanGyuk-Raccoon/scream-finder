import Link from "next/link";
import { getCurrentUser } from "@/server/actions/auth";
import { getMyTeamAction } from "@/server/actions/teams";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const user = await getCurrentUser();
  const query = await searchParams;
  const team = user ? await getMyTeamAction(user.id) : null;

  return (
    <main className="shell">
      <section className="panel hero">
        <p className="eyebrow">Scrim Finder MVP</p>
        <h1>팀 생성과 초대 링크, 매칭 등록 흐름을 먼저 검증하는 단계</h1>
        <p className="lede">
          현재 구현 범위는 Discord 로그인, 팀 생성, 초대 링크 발급, 링크 기반 팀 합류, 매칭 등록까지입니다.
          Supabase가 설정되어 있으면 실제 DB에 저장됩니다.
        </p>
        {query.error ? (
          <p className="notice error">
            로그인 오류: {query.error}. `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`,
            `DISCORD_REDIRECT_URI` 설정을 확인하세요.
          </p>
        ) : null}
        {user ? (
          <p className="notice success">
            현재 로그인 사용자: <strong>{user.username}</strong>
            {team ? ` / 연결된 팀: ${team.name}` : " / 아직 생성한 팀 없음"}
          </p>
        ) : (
          <p className="notice">
            아직 로그인하지 않았습니다. 먼저 Discord 로그인으로 팀장 세션을 만드세요.
          </p>
        )}
        <div className="actions">
          {user ? (
            <Link className="button" href={team ? `/teams/${team.id}` : "/dashboard"}>
              {team ? "팀 관리 열기" : "대시보드 이동"}
            </Link>
          ) : (
            <a className="button" href="/api/auth/discord/login">
              디스코드 로그인 시작
            </a>
          )}
          <Link className="button secondary" href="/dashboard">
            현재 상태 보기
          </Link>
        </div>
      </section>

      <section className="grid two">
        <article className="panel">
          <p className="eyebrow">검증 순서</p>
          <h2>가장 짧은 확인 경로</h2>
          <p className="lede">
            1. Discord 로그인
            <br />
            2. 팀 생성
            <br />
            3. 초대 링크 생성
            <br />
            4. 링크로 멤버 합류
            <br />
            5. 매칭 등록
          </p>
        </article>
        <article className="panel">
          <p className="eyebrow">현재 제약</p>
          <h2>RSO는 나중에 붙이고, 나머지 흐름부터 검증합니다</h2>
          <p className="lede">
            지금은 팀과 멤버, 초대 링크, 매칭 글이 저장되는지 확인하는 단계입니다. Riot 연동은 API
            키 준비 후 다시 붙일 예정입니다.
          </p>
        </article>
      </section>

      <section className="panel">
        <p className="eyebrow">Quick Checks</p>
        <h2>수동 확인 포인트</h2>
        <div className="checklist">
          <div className="check-item">로그인 후 `/dashboard`에서 사용자 이름이 보이는지</div>
          <div className="check-item">팀 생성 후 팀 상세 페이지로 이동하는지</div>
          <div className="check-item">초대 링크 생성 후 `/join/{'{token}'}` 경로가 열리는지</div>
          <div className="check-item">합류 후 팀 상세의 멤버 수가 늘어나는지</div>
          <div className="check-item">매칭 등록 후 팀 페이지에 OPEN 상태 글이 보이는지</div>
        </div>
      </section>
    </main>
  );
}
