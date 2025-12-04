import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #00E0FF 0%, #FF6DDF 100%)',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 1186 1027"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M28.8677 513.256L310.763 25H874.552L1156.45 513.256L874.552 1001.51H310.763L28.8677 513.256Z"
            stroke="white"
            strokeWidth="80"
          />
          <rect
            x="334.305"
            y="400.122"
            width="516.705"
            height="328.775"
            stroke="white"
            strokeWidth="50"
          />
          <circle cx="700.127" cy="570.99" r="41.2536" stroke="white" strokeWidth="30" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
