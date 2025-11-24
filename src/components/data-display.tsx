'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

type DataItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

type DataDisplayProps = {
  data: DataItem[];
};

export function DataDisplay({ data }: DataDisplayProps) {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground">No data to display.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
        <Card key={item.id} className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl bg-card">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                data-ai-hint={item.imageHint}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-6">
            <CardTitle className="font-headline mb-2 text-card-foreground">{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Button variant="secondary" className="w-full">
              Learn More
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
