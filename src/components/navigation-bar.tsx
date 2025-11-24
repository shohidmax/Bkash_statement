import Link from 'next/link';
import { CodeXml, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NavigationBar() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <CodeXml className="h-6 w-6 text-accent" />
          <span className="font-headline">NextGen Node Starter</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/about">About</Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
             <a href="https://github.com/firebase/firebase-studio" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
                <Github className="h-4 w-4" />
             </a>
          </Button>
        </nav>
        <div className="md:hidden">
          {/* A Sheet component could be used here for a mobile menu drawer */}
        </div>
      </div>
    </header>
  );
}
