import * as React from 'react';

export function Day14DeprescriberEmail({ userName }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "32px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Hey {userName},</p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          Two weeks into your TaperCommunity membership — we hope you're finding the
          community helpful. If you're tapering (or thinking about it), working with a
          prescriber experienced in deprescribing can make a real difference.
        </p>

        <div style={{ margin: "24px 0", background: "#F3E8FF", borderRadius: "12px", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#374151", fontSize: "15px" }}>
            Why a deprescriber matters:
          </p>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "#6B7280", lineHeight: "1.8", fontSize: "14px" }}>
            <li>They understand withdrawal vs. relapse</li>
            <li>They know that "standard" tapers are often too fast</li>
            <li>They can prescribe liquid formulations for precise cuts</li>
            <li>They'll work with you on a timeline that fits your body</li>
          </ul>
        </div>

        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          Our directory has 57+ providers across 6 countries, many of whom offer
          telehealth appointments. You can filter by drug class, insurance, and location.
        </p>

        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a href={`${siteUrl}/deprescribers`} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600" }}>
            Find a Deprescriber &rarr;
          </a>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: "13px" }}>
          You're not alone in this. Professional guidance and peer support work best together.
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
