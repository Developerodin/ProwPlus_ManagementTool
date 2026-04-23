import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'prowplus — Project Management',
  description: 'Enterprise project, team and client management.',
  icons: {
    icon: '/pp_icons.png',
    apple: '/pp_icons.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '10px',
              border: '1px solid rgba(15,23,42,0.08)',
              fontSize: '13px',
              color: '#0f172a',
            },
          }}
        />
      </body>
    </html>
  );
}
