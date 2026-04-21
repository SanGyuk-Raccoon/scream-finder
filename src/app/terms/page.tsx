export default function TermsPage() {
  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Terms of Service</p>
        <h1>ScrimFinder Terms of Service</h1>
        <p className="lede">
          These terms govern access to ScrimFinder, a scrim team management and recruitment
          service.
        </p>
      </section>

      <section className="panel">
        <h2>Acceptable Use</h2>
        <div className="stack">
          <p>Users must provide accurate account information and must not impersonate others.</p>
          <p>Users must not abuse invite links, harass other players, or use the service for unlawful conduct.</p>
          <p>Users must comply with Riot Games policies, platform rules, and applicable law.</p>
        </div>
      </section>

      <section className="panel">
        <h2>Service Availability</h2>
        <div className="stack">
          <p>The service may change, be suspended, or be removed at any time.</p>
          <p>Features that depend on third-party services, including Discord and Riot, may be unavailable or limited.</p>
        </div>
      </section>

      <section className="panel">
        <h2>Accounts and Content</h2>
        <div className="stack">
          <p>Users are responsible for activity performed through their accounts.</p>
          <p>Users retain responsibility for the content they submit, including team descriptions and match posts.</p>
        </div>
      </section>

      <section className="panel">
        <h2>Contact</h2>
        <p className="lede">
          For legal or support inquiries, contact: `support@scrimfinder.example`
        </p>
      </section>
    </main>
  );
}
