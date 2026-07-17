import '../index.css';
import '../App.css';
import ClientShell from './ClientShell';

export const metadata = {
  title: 'temp-app',
  description: 'Startup blueprint builder using AI workflow agents',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
