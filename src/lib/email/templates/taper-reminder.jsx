import * as React from 'react';

export function TaperReminderEmail({ userName, medicationName, daysSinceCheckin }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "32px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Hi {userName},</p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          It looks like you haven't logged a check-in for your <strong>{medicationName}</strong> taper
          in {daysSinceCheckin} days. Keeping your tracker updated helps you spot patterns and
          gives you a clearer picture of how your taper is going.
        </p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          Even a quick check-in — dose, mood, how you're feeling — makes a difference over time.
        </p>
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a href={`${siteUrl}/journal`} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600" }}>
            Log a check-in &rarr;
          </a>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: "13px" }}>
          You're doing something hard. We're here when you need us.
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
