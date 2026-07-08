import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';

import './globals.css';

export const metadata: Metadata = {
  title: 'Lead Capture AI Agent',
  description: 'Capture, qualify, and respond to inbound leads with AI assistance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
