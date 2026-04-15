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
        <p className="eyebrow">Scream Finder MVP</p>
        <h1>팀장을 디스코드로 식별하고, Riot 검증으로 팀을 완성하는 스크림 등록 흐름</h1>
        <p className="lede">
          현재 구현 범위는 팀 생성, 초대 링크 발급, 링크 기반 팀 합류, 매칭 등록까지입니다.
          Supabase가 준비되기 전까지는 메모리 저장소를 사용합니다.
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
          <h2>기본 동작을 손으로 확인하는 가장 짧은 경로</h2>
          <p className="lede">
            1. Discord 로그인
            <br />
            2. 팀 생성
            <br />
            3. 초대 링크 생성
            <br />
            4. 팀장 본인 Riot 검증
            <br />
            5. 매칭 등록
          </p>
        </article>
        <article className="panel">
          <p className="eyebrow">현재 제약</p>
          <h2>지금 프론트는 검증 속도에 맞춰 단순하게 구성했습니다</h2>
          <p className="lede">
            팀원 합류는 아직 실제 RSO 화면 대신 Riot ID 입력 폼으로 대체되어 있습니다.
            대신 어떤 단계가 끝났는지 화면에서 바로 확인할 수 있게 상태 노출을 강화했습니다.
          </p>
        </article>
      </section>

      <section className="panel">
        <p className="eyebrow">Quick Checks</p>
        <h2>수동 확인 포인트</h2>
        <div className="checklist">
          <div className="check-item">로그인 후 `/dashboard`에서 사용자 이름이 보이는지</div>
          <div className="check-item">팀 생성 후 팀 상세 페이지로 이동하는지</div>
          <div className="check-item">초대 링크 생성 후 `/join/{`token`}` 경로가 열리는지</div>
          <div className="check-item">팀장이 자기 링크로 인증하면 OWNER 상태가 `ACTIVE`로 바뀌는지</div>
          <div className="check-item">이후 매칭 등록이 성공하고 팀 페이지에 목록이 보이는지</div>
        </div>
      </section>
    </main>
  );
}
