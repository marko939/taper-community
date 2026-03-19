import * as React from 'react';

export function MatchConfirmationEmail({ patientName, clinicianName }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "32px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Hi {patientName},</p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          We&apos;ve received your request to connect with <strong style={{ color: "#374151" }}>{clinicianName}</strong>.
        </p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          Our team will review your request and get back to you within <strong style={{ color: "#374151" }}>2 business days</strong>.
          In the meantime, keep journaling your progress — having a detailed record will help your provider
          understand your history when you connect.
        </p>
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a href={`${siteUrl}/journal`} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600" }}>
            Continue Journaling &rarr;
          </a>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: "13px" }}>
          If you have any questions, reply to this email and we&apos;ll be happy to help.
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
