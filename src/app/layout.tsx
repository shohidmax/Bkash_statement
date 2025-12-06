
'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Moon, Sun } from 'lucide-react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState('bkash');

  useEffect(() => {
    const storedTheme = localStorage.getItem('bkash-theme') || 'bkash';
    setTheme(storedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bkash-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'night' ? 'bkash' : 'night'));
  };

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <head>
        <title>Bkash Statement Manager</title>
        <meta name="description" content="A tool to analyze and filter PDF statements." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-base-300 text-base-content" suppressHydrationWarning>
        <div className="navbar bg-base-100 shadow-md border-b border-base-content/10 sticky top-0 z-30">
          <div className="flex-1">
            <a className="btn btn-ghost normal-case text-xl text-primary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Bkash statement manager
            </a>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1 items-center">
              <li>
                <label className="swap swap-rotate btn btn-ghost btn-circle">
                  <input type="checkbox" onClick={toggleTheme} checked={theme === 'night'} readOnly/>
                  <Sun className="swap-on fill-current w-5 h-5" />
                  <Moon className="swap-off fill-current w-5 h-5" />
                </label>
              </li>
              <li><a>About</a></li>
            </ul>
          </div>
        </div>
        
        <main className="container mx-auto p-4 flex-grow">
          {children}
        </main>
        
        <footer className="footer footer-center p-4 text-base-content/40 text-xs">
          <aside><p>developed by shohidmax</p></aside>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
