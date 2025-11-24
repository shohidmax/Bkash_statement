import axios from 'axios';
import { DataDisplay } from '@/components/data-display';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type DataItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

type ApiResponse = {
  message: string;
  data: DataItem[];
};

async function getData(): Promise<ApiResponse> {
  try {
    // Use HOST_URL from environment variables for robust API endpoint resolution.
    const host = process.env.HOST_URL || 'http://localhost:9002';
    const response = await axios.get<ApiResponse>(`${host}/api/data`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    // Provide a graceful fallback in case of an API error.
    return {
      message: 'Could not connect to the API. Displaying static content.',
      data: []
    };
  }
}

export default async function Home() {
  const { message, data } = await getData();

  return (
    <div className="space-y-12">
      <section className="text-center py-16 rounded-lg bg-card shadow-md">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
          Welcome to NextGen Node Starter
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          A powerful starter kit combining Next.js with Node.js-style API routes.
          Ready to build and deploy.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="#features">Explore Features</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/about">About this Project</Link>
          </Button>
        </div>
      </section>

      <section id="features" className="space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-bold font-headline">Core Features in Action</h2>
            <p className="mt-2 text-muted-foreground">{message}</p>
        </div>
        <DataDisplay data={data} />
      </section>
    </div>
  );
}
