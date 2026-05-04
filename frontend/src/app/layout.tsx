import type { Metadata } from 'next';
import QueryProvider from '@/components/providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.eutgumi.co.kr'),

  title: '이웃 E-uT | 구미 영어회화, 수업보다 대화로 배우는 공간',

  description:
    '구미 No.1 영어회화 커뮤니티 이웃 E-uT. 공부만 하는 영어는 이제 그만! 소규모 테이블에서 즐겁게 대화하며 실전 실력을 키우세요.',

  keywords: [
    '영어회화',
    '직장인영어회화',
    '영어스터디',
    '성인영어학원',
    '영어커뮤니티',
    '소규모영어회화',
    'E-uT',
    '구미영어회화',
    '구미영어스터디',
    '구미직장인영어',
    '이웃영어회화',
    '실전영어',
    '이웃영어스터디',
  ],

  alternates: {
    canonical: 'https://www.eutgumi.co.kr',
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    locale: 'ko_KR',
    type: 'website',
    siteName: '이웃 E-uT 영어회화 커뮤니티',

    title: '이웃 E-uT | 수업보다 대화, 영어가 재미있어지는 공간',

    description:
      '공부만 하는 영어는 이제 그만! 구미 이웃 E-uT 영어회화에서 소규모 테이블에서 즐겁게 대화하며 진짜 실력을 키우세요.',

    url: 'https://www.eutgumi.co.kr',

    images: [
      {
        url: 'https://www.eutgumi.co.kr/images/og-main.jpg',
        width: 1200,
        height: 630,
        alt: '구미 E-uT 영어회화 커뮤니티 활동 모습',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',

    title: '이웃 E-uT 영어회화 | 구미 영어회화 커뮤니티',

    description:
      '공부보다 대화 중심, 진짜 영어를 쓰는 공간 이웃 E-uT',

    images: ['https://www.eutgumi.co.kr/images/og-main.jpg'],
  },

  icons: {
    icon: '/icon.jpg',
    apple: '/apple-touch-icon.png',
  },

  verification: {
    google: 'DsUVHUHm5jYRLyIhAlv3d-umSvkPk4pzr9Vt5Pyc6Uk',

    other: {
      'naver-site-verification':
        '067c1201d6ddb25c1fe0a70aa8b0d8c5849e646a',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];
              w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-KP7WR5MC');
            `,
          }}
        />
        {/* End Google Tag Manager */}
      </head>

      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KP7WR5MC"
            height="0"
            width="0"
            style={{
              display: 'none',
              visibility: 'hidden',
            }}
          />
        </noscript>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: '이웃 E-uT 영어회화 구미점',
              image: 'https://www.eutgumi.co.kr/images/og-main.jpg',
              '@id': 'https://www.eutgumi.co.kr',
              url: 'https://www.eutgumi.co.kr',
              telephone: '0507-1344-8324',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '경북 구미시 옥계북로 34 7층 702호',
                addressLocality: 'Gumi',
                addressRegion: 'Gyeongsangbuk-do',
                postalCode: '39185',
                addressCountry: 'KR',
              },
              description:
                '구미 No.1 영어회화 커뮤니티 이웃 E-uT. 소규모 테이블에서 즐겁게 대화하며 진짜 실력을 키우세요.',
            }),
          }}
        />

        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
