import * as React from 'react';

export function WelcomeEmail({ userName }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "32px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Welcome to TaperCommunity, {userName}!</p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          You&apos;ve joined a community of people who understand what it&apos;s like to taper.
          Here are three things you can do right now to get started:
        </p>

        <div style={{ margin: "24px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: "#F3E8FF", borderRadius: "8px", padding: "8px", minWidth: "36px", textAlign: "center" }}>
              <span style={{ fontSize: "16px" }}>1</span>
            </div>
            <div>
              <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#374151" }}>Start your taper journal</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#6B7280" }}>
                Track doses, symptoms, and mood daily with tools built on the Maudsley Guidelines.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: "#F3E8FF", borderRadius: "8px", padding: "8px", minWidth: "36px", textAlign: "center" }}>
              <span style={{ fontSize: "16px" }}>2</span>
            </div>
            <div>
              <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#374151" }}>Explore the forums</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#6B7280" }}>
                Find people tapering the same medication as you in our drug-specific forums.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ background: "#F3E8FF", borderRadius: "8px", padding: "8px", minWidth: "36px", textAlign: "center" }}>
              <span style={{ fontSize: "16px" }}>3</span>
            </div>
            <div>
              <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#374151" }}>Find a deprescriber</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#6B7280" }}>
                Browse 57+ tapering-friendly clinicians across 6 countries.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a href={siteUrl} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600" }}>
            Start Exploring &rarr;
          </a>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: "13px" }}>
          The community is here for you — whenever you&apos;re ready.
        </p>
      </div>
      <div style={{ padding: "16px", background: "#F9FAFB", borderRadius: "0 0 8px 8px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
          <a href={`${siteUrl}/settings`} style={{ color: "#6B46C1" }}>Manage email preferences</a>
        </p>
      </div>
    </div>
  );
}
