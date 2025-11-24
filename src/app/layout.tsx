import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Solid PDF Filter Tool',
  description: 'A tool to analyze and filter PDF statements.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="night" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-base-300 text-slate-300">
        <div className="navbar bg-base-100 shadow-md border-b border-base-content/10 sticky top-0 z-30">
          <div className="flex-1">
            <a className="btn btn-ghost normal-case text-xl text-primary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Bkash statement manager
            </a>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li><a>Home</a></li>
              <li><a>About</a></li>
            </ul>
          </div>
        </div>
        
        <main className="container mx-auto p-4 flex-grow">
          {children}
        </main>
        
        <footer className="footer footer-center p-4 text-base-content/40 text-xs">
          <aside><p>Secure Client-Side Processing</p></aside>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
