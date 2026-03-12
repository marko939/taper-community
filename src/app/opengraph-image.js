import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const alt = 'TaperCommunity — Peer Support for Medication Tapering';
export const size = { width: 4800, height: 2520 };
export const contentType = 'image/png';

export default async function Image() {
  const [bannerBuffer, logoBuffer] = await Promise.all([
    readFile(join(process.cwd(), 'public', 'images', 'hero-banner.png')),
    readFile(join(process.cwd(), 'public', 'images', 'hero-logo.png')),
  ]);
  const bannerSrc = `data:image/png;base64,${bannerBuffer.toString('base64')}`;
  const logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background */}
        <img
          src={bannerSrc}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        {/* Darker overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(20, 10, 45, 0.3)',
          }}
        />
        {/* Logo + text — larger, tighter padding */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 40px',
          }}
        >
          <img
            src={logoSrc}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
