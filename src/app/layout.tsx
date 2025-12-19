import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Evident - Structured evidence of work',
  description: 'Turn daily work into structured evidence. Instantly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-evident-50">{children}</body>
    </html>
  );
}
