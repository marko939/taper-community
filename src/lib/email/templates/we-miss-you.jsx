import * as React from 'react';

export function WeMissYouEmail({ userName }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "32px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Hi {userName},</p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          We haven't seen you in a while — just wanted to check in.
        </p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          Tapering is a long road and it can be isolating. The community is still
          here if you want to share where you're at, ask a question, or just
          read how others are doing.
        </p>
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a href={`${siteUrl}/forums`} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600" }}>
            See what's new &rarr;
          </a>
        </div>
      </div>
      <div style={{ padding: "16px", background: "#F9FAFB", borderRadius: "0 0 8px 8px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
          <a href={`${siteUrl}/settings`} style={{ color: "#6B46C1" }}>Manage email preferences</a>
        </p>
      </div>
    </div>
  );
}
