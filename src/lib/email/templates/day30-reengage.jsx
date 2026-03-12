import * as React from 'react';

export function Day30ReengageEmail({ userName }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "32px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Hi {userName},</p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          It's been about a month since you signed up — and we want you to know
          there's absolutely no pressure. Tapering takes courage, and everyone
          moves at their own pace.
        </p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          The community has grown since you joined, with new members sharing
          their experiences every day. Whenever you're ready, here are two ways
          to get started:
        </p>
        <ul style={{ color: "#6B7280", lineHeight: "1.8", paddingLeft: "20px" }}>
          <li>
            <strong style={{ color: "#374151" }}>Browse the forums</strong> — read
            stories from others on a similar path and see what resonates.
          </li>
          <li>
            <strong style={{ color: "#374151" }}>Start a taper journal</strong> — a
            private space to track your progress, doses, and how you're feeling.
          </li>
        </ul>
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a href={`${siteUrl}/forums`} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600" }}>
            Come back when you're ready &rarr;
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
