import * as React from 'react';

export function Day7ForumsEmail({ userName, drugForumName, drugForumUrl }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "32px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Hey {userName},</p>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          You&apos;re one week in. Have you connected with others in the community yet?
          Our forums are where members share what&apos;s working, ask questions, and support
          each other through the hard parts of tapering.
        </p>

        {drugForumName && drugForumUrl ? (
          <div style={{ margin: "24px 0", background: "#F3E8FF", borderRadius: "12px", padding: "20px" }}>
            <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#374151", fontSize: "15px" }}>
              Your drug-specific forum:
            </p>
            <p style={{ margin: 0, color: "#6B7280", lineHeight: "1.6", fontSize: "14px" }}>
              The <strong>{drugForumName}</strong> forum has members sharing their tapering
              experiences, tips, and support. You don&apos;t have to go through this alone.
            </p>
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <a href={drugForumUrl} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                Visit {drugForumName} Forum &rarr;
              </a>
            </div>
          </div>
        ) : (
          <div style={{ margin: "24px 0", background: "#F3E8FF", borderRadius: "12px", padding: "20px" }}>
            <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#374151", fontSize: "15px" }}>
              Popular forums right now:
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#6B7280", lineHeight: "1.8", fontSize: "14px" }}>
              <li>General tapering discussions</li>
              <li>Drug-specific forums (SSRIs, benzos, SNRIs, and more)</li>
              <li>Success stories from members who&apos;ve completed their taper</li>
            </ul>
          </div>
        )}

        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a href={`${siteUrl}/forums`} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600" }}>
            Explore Forums &rarr;
          </a>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: "13px" }}>
          Even reading others&apos; experiences can help — you don&apos;t have to post right away.
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
