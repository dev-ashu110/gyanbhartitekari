import { useState, useEffect } from 'react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { LiquidToggle } from './LiquidToggle';
import { BlurIntensityToggle } from './BlurIntensityToggle';
import schoolLogo from '@/assets/school-logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const NavLiquid = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liquidEffect, setLiquidEffect] = useState(true);
  const location = useLocation();
  const { user, profile, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out.',
      });
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Academics', path: '/academics' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  type IconType = typeof User;

  const getDashboardLink = (): { name: string; path: string; icon: IconType } | null => {
    if (!user || !profile) return null;
    
    switch (profile.role) {
      case 'student':
        return { name: 'My Portfolio', path: '/student-portfolio', icon: User };
      case 'teacher':
        return { name: 'Teacher Dashboard', path: '/teacher-dashboard', icon: User };
      case 'admin':
        return { name: 'Admin Panel', path: '/admin-dashboard', icon: User };
      case 'visitor':
        return { name: 'Visitor Portal', path: '/visitor-portal', icon: User };
      default:
        return null;
    }
  };

  const dashboardLink = getDashboardLink();
  const allLinks = dashboardLink ? [...navLinks, dashboardLink] : navLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          className={`glass-strong rounded-full transition-all duration-500 ${
            liquidEffect ? 'liquid-morph' : ''
          }`}
          animate={
            liquidEffect
              ? {
                  borderRadius: [
                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                    '30% 60% 70% 40% / 50% 60% 30% 60%',
                    '50% 40% 50% 60% / 40% 50% 70% 50%',
                    '40% 70% 40% 50% / 60% 40% 60% 50%',
                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                  ],
                }
              : {}
          }
          transition={liquidEffect ? { duration: 8, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          <div className="flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 z-10">
              <motion.img
                src={schoolLogo}
                alt="Gyan Bharti School"
                className="h-12 w-12 object-contain rounded-full"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6, type: "spring" }}
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-foreground">Gyan Bharti</span>
                <span className="text-xs text-muted-foreground">Sr. Sec. School</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {allLinks.map((link, index) => (
                <Link key={link.path} to={link.path}>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
                      isActive(link.path)
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    {'icon' in link && link.icon && React.createElement(link.icon as React.ComponentType<{ className?: string }>, { className: "h-4 w-4" })}
                    {link.name}
                  </motion.div>
                </Link>
              ))}
              
              {user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: allLinks.length * 0.05 }}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center gap-2 rounded-full hover-scale ml-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden xl:inline">Logout</span>
                  </Button>
                </motion.div>
              )}

              {!user && !loading && (
                <Link to="/auth">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Button size="sm" className="rounded-full hover-scale ml-2">
                      Sign In
                    </Button>
                  </motion.div>
                </Link>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <BlurIntensityToggle />
              <LiquidToggle onToggle={setLiquidEffect} />
              <ThemeToggle />

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden rounded-full"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-2 glass-strong rounded-3xl overflow-hidden"
            >
              <div className="p-4 flex flex-col space-y-2">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`px-4 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 ${
                        isActive(link.path)
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      {link.name}
                    </motion.div>
                  </Link>
                ))}

                {user && profile?.role === 'admin' && (
                  <Link to="/admin-dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.05 }}
                      className="px-4 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 text-primary font-medium"
                    >
                      Admin Dashboard
                    </motion.div>
                  </Link>
                ))}

                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: allLinks.length * 0.05 }}
                    className="pt-2 border-t border-border/50"
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </motion.div>
                )}

                {!user && !loading && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: allLinks.length * 0.05 }}
                    className="pt-2 border-t border-border/50"
                  >
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full rounded-2xl">
                        Sign In
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
