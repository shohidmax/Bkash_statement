import { NextResponse } from 'next/server';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export async function GET() {
  const data = [
    {
      id: '1',
      title: 'API Route Handling',
      description:
        'Set up Node.js API routes to handle server-side logic and data fetching seamlessly.',
      imageUrl: PlaceHolderImages.find(p => p.id === 'api-routes')?.imageUrl || '',
      imageHint: PlaceHolderImages.find(p => p.id === 'api-routes')?.imageHint || '',
    },
    {
      id: '2',
      title: 'Component Library Integration',
      description:
        'Integrate a component library for a set of pre-built React components to accelerate development.',
        imageUrl: PlaceHolderImages.find(p => p.id === 'components')?.imageUrl || '',
        imageHint: PlaceHolderImages.find(p => p.id === 'components')?.imageHint || '',
    },
    {
      id: '3',
      title: 'Simple Data Display',
      description:
        'Create components to display fetched data, validating the full data flow from server to client.',
        imageUrl: PlaceHolderImages.find(p => p.id === 'deployment')?.imageUrl || '',
        imageHint: PlaceHolderImages.find(p => p.id === 'deployment')?.imageHint || '',
    },
  ];

  const message = process.env.API_MESSAGE || 'Data fetched successfully!';

  return NextResponse.json({ message, data });
}
