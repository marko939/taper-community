import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #5B2E91 0%, #3D1E63 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-1px',
            }}
          >
            TaperCommunity
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#2EC4B6',
              fontWeight: 600,
            }}
          >
            Peer Support for Medication Tapering
          </div>
          <div
            style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '700px',
              textAlign: 'center',
              lineHeight: '1.5',
            }}
          >
            Evidence-based guidance, shared experiences, and taper journals.
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
