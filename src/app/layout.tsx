import type {Metadata} from 'next';
import './globals.css';
import { NavigationBar } from '@/components/navigation-bar';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'NextGen Node Starter',
  description: 'A Next.js starter with Node.js API routes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background">
        <NavigationBar />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
