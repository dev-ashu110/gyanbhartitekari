import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-20">
      <Card className="glass-strong p-12 rounded-3xl text-center max-w-2xl">
        <AlertCircle className="h-24 w-24 text-primary mx-auto mb-6" />
        <h1 className="text-6xl font-bold mb-4 text-gradient">404</h1>
        <h2 className="text-3xl font-bold mb-4 text-foreground">Page Not Found</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <Button asChild size="lg" className="rounded-full">
          <Link to="/">
            <Home className="mr-2 h-5 w-5" />
            Return to Home
          </Link>
        </Button>
      </Card>
    </main>
  );
};

export default NotFound;
