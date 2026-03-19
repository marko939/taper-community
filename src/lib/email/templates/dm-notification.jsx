import * as React from 'react';

export function DMNotificationEmail({ recipientName, senderName, messagePreview }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "32px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Hi {recipientName},</p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          <strong style={{ color: "#374151" }}>{senderName}</strong> sent you a message:
        </p>
        <div style={{
          background: "#F3F4F6",
          borderLeft: "4px solid #6B46C1",
          padding: "16px",
          borderRadius: "0 8px 8px 0",
          margin: "16px 0",
        }}>
          <p style={{ color: "#374151", lineHeight: "1.6", margin: 0, fontSize: "15px" }}>
            &ldquo;{messagePreview}&rdquo;
          </p>
        </div>
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a href={`${siteUrl}/messages`} style={{
            display: "inline-block",
            background: "#6B46C1",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "15px",
            fontWeight: "600",
          }}>
            Reply to {senderName} &rarr;
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
