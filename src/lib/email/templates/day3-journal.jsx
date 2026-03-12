import * as React from 'react';

export function Day3JournalEmail({ userName }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "32px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Hey {userName},</p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          Have you set up your taper journal yet? Members who track daily see clearer
          patterns in their symptoms and feel more confident about their taper progress.
        </p>

        <div style={{ margin: "24px 0", background: "#F3E8FF", borderRadius: "12px", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#374151", fontSize: "15px" }}>
            Why daily tracking matters:
          </p>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "#6B7280", lineHeight: "1.8", fontSize: "14px" }}>
            <li>Spot symptom patterns tied to dose changes</li>
            <li>Know when a hold is needed vs. when to continue</li>
            <li>Share your taper timeline with your prescriber</li>
            <li>See how far you've come when the going gets tough</li>
          </ul>
        </div>

        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a href={`${siteUrl}/journal`} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600" }}>
            Start Your Taper Journal &rarr;
          </a>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: "13px" }}>
          It takes about 2 minutes to log your first entry.
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
