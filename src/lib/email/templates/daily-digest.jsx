import * as React from 'react';

export function DailyDigestEmail({ userName, replies }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "24px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Hi {userName},</p>
        <p style={{ color: "#6B7280" }}>
          {replies.length === 1
            ? "Someone replied to your post today."
            : `${replies.length} people replied to your posts today.`}
        </p>

        {replies.map((reply, i) => (
          <div key={i} style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#9CA3AF" }}>
              Re: <strong>{reply.threadTitle}</strong>
            </p>
            <p style={{ margin: "0 0 8px", color: "#6B7280", fontSize: "14px" }}>
              <strong>{reply.authorName}</strong> replied:
            </p>
            <p style={{ margin: "0 0 12px", color: "#374151", fontSize: "14px", fontStyle: "italic", borderLeft: "3px solid #6B46C1", paddingLeft: "12px" }}>
              &ldquo;{reply.preview}&rdquo;
            </p>
            <a href={reply.threadUrl} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontSize: "13px" }}>
              Continue the conversation &rarr;
            </a>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px", background: "#F9FAFB", borderRadius: "0 0 8px 8px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
          You're receiving this because someone replied to your post on TaperCommunity.
          <br />
          <a href={`${siteUrl}/settings`} style={{ color: "#6B46C1" }}>Manage email preferences</a>
        </p>
      </div>
    </div>
  );
}
