import { motion } from 'framer-motion';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
  message?: string;
  title?: string;
}

export const AccessDenied = ({ 
  title = "Access Restricted",
  message = "You do not have permission to view this page. Please contact an administrator if you believe this is an error."
}: AccessDeniedProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="glass-strong rounded-3xl p-8 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center"
          >
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground">{message}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="rounded-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
