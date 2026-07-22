import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GraftDesk | Modern Hair Transplant Clinic OS & CRM',
  description: 'AI-powered operating system for hair transplant clinics. Manage leads, patients, consultations, surgeries, graft counting, and post-op care.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
