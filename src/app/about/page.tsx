import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';

const features = [
    "Basic Page Routing with Next.js",
    "Node.js API Route Handling",
    "Component Library Integration (shadcn/ui)",
    "Environment Configuration",
    "Simple Data Display from API",
    "Dependency Management with npm"
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">About NextGen Node Starter</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          This is a starter template designed to kickstart your Next.js project with a Node.js backend feel.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto bg-card">
        <CardHeader>
          <CardTitle className="font-headline">Core Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                <span className="text-md text-card-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground text-sm">
        <p>Built with modern tools for a great developer experience.</p>
      </div>
    </div>
  );
}
