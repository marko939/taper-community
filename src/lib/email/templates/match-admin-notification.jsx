import * as React from 'react';

export function MatchAdminNotificationEmail({ patientName, patientEmail, clinicianName, matchRequestId }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ background: "#1E1B2E", padding: "24px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>New Match Request</h1>
      </div>
      <div style={{ padding: "32px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", fontSize: "14px", color: "#374151", lineHeight: "1.8" }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: "600", paddingRight: "16px", whiteSpace: "nowrap" }}>Patient:</td>
              <td>{patientName}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: "600", paddingRight: "16px", whiteSpace: "nowrap" }}>Email:</td>
              <td><a href={`mailto:${patientEmail}`} style={{ color: "#6B46C1" }}>{patientEmail}</a></td>
            </tr>
            <tr>
              <td style={{ fontWeight: "600", paddingRight: "16px", whiteSpace: "nowrap" }}>Clinician:</td>
              <td>{clinicianName || 'Not specified'}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: "600", paddingRight: "16px", whiteSpace: "nowrap" }}>Request ID:</td>
              <td style={{ fontSize: "12px", color: "#9CA3AF" }}>{matchRequestId}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a href={`${siteUrl}/admin/match-requests`} style={{ display: "inline-block", background: "#6B46C1", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "15px", fontWeight: "600" }}>
            View in Admin &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
