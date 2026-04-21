export default function PrivacyPage() {
  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Privacy Policy</p>
        <h1>ScrimFinder Privacy Policy</h1>
        <p className="lede">
          ScrimFinder collects the minimum account and team-management data needed to operate
          the service and prepare for Riot Sign On integration.
        </p>
      </section>

      <section className="panel">
        <h2>Data We Collect</h2>
        <div className="stack">
          <p>Discord account identifiers and basic profile data used for sign-in.</p>
          <p>Team, invite-link, and match-post information created by users inside the app.</p>
          <p>Riot account identifiers and related consented data only after Riot Sign On is implemented and approved.</p>
        </div>
      </section>

      <section className="panel">
        <h2>How We Use Data</h2>
        <div className="stack">
          <p>To authenticate users and maintain team ownership and membership records.</p>
          <p>To generate invite links, store match recruitment posts, and support core product flows.</p>
          <p>To investigate abuse, security incidents, and policy violations.</p>
        </div>
      </section>

      <section className="panel">
        <h2>Sharing and Retention</h2>
        <div className="stack">
          <p>We do not sell personal data.</p>
          <p>Data may be processed by infrastructure providers required to operate the service.</p>
          <p>We retain information only as long as needed for service operation, legal compliance, and security review.</p>
        </div>
      </section>

      <section className="panel">
        <h2>User Requests</h2>
        <p className="lede">
          For access, correction, or deletion requests, contact: `privacy@scrimfinder.example`
        </p>
      </section>
    </main>
  );
}
