import * as React from 'react';

export function ForumNewPostEmail({ userName, posts }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#6B46C1", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>TaperCommunity</h1>
      </div>
      <div style={{ padding: "24px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <p style={{ fontSize: "16px", color: "#374151" }}>Hi {userName},</p>
        <p style={{ color: "#6B7280" }}>
          {posts.length === 1
            ? "There's a new post in a forum you follow."
            : `There are ${posts.length} new posts in forums you follow.`}
        </p>

        {posts.map((post, i) => (
          <div key={i} style={{ border: "1px solid #E5E7EB", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#9CA3AF" }}>
              In: <strong>{post.forumName}</strong>
            </p>
            <p style={{ margin: "0 0 8px", color: "#374151", fontSize: "15px", fontWeight: "600" }}>
              {post.threadTitle}
            </p>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#6B7280" }}>
              by {post.authorName}
            </p>
            {post.preview && (
              <p style={{ margin: "8px 0 12px", color: "#6B7280", fontSize: "14px", fontStyle: "italic", borderLeft: "3px solid #6B46C1", paddingLeft: "12px" }}>
                &ldquo;{post.preview}&rdquo;
              </p>
            )}
            <a href={post.threadUrl} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontSize: "13px" }}>
              Read post &rarr;
            </a>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px", background: "#F9FAFB", borderRadius: "0 0 8px 8px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
          You're receiving this because you follow this forum on TaperCommunity.
          <br />
          <a href={`${siteUrl}/settings`} style={{ color: "#6B46C1" }}>Manage email preferences</a>
        </p>
      </div>
    </div>
  );
}
