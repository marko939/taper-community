import * as React from 'react';

export function IntroduceYourselfEmail({ userName }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "32px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Hi {userName},</p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          Welcome to TaperCommunity. We noticed you haven't posted yet —
          no pressure at all, but we'd love to hear from you when you're ready.
        </p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          A great place to start is the <strong>Introductions</strong> forum.
          You don't need to share anything you're not comfortable with —
          even just saying hello and what medication you're tapering is enough
          to connect with people going through the same thing.
        </p>
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a href={`${siteUrl}/forums/introductions`} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600" }}>
            Say hello &rarr;
          </a>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: "13px" }}>
          The community is here whenever you're ready.
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
