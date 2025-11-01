import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Home, LayoutDashboard, Users, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RoleBasedNav() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link to="/auth">
          <Button variant="default" size="sm">
            Sign In
          </Button>
        </Link>
      </motion.div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  const navItems = isAdmin
    ? [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
        { label: 'Users', icon: Users, path: '/owner-dashboard' },
      ]
    : [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Profile', icon: User, path: '/student-portfolio' },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      {navItems.map((item, index) => (
        <motion.div
          key={item.path}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link to={item.path}>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 hover-scale"
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
            </Button>
          </Link>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: navItems.length * 0.1 }}
      >
        <Button
          variant="destructive"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center gap-2 hover-scale"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </motion.div>

      {profile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (navItems.length + 1) * 0.1 }}
          className="hidden lg:flex items-center gap-2 ml-2 px-3 py-1 rounded-full glass-effect"
        >
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm">{profile.full_name || user.email}</span>
          {isAdmin && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              Admin
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
