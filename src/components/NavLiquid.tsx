import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { LiquidToggle } from './LiquidToggle';
import { BlurIntensityToggle } from './BlurIntensityToggle';
import logoPlaceholder from '@/assets/logo-placeholder.png';

export const NavLiquid = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liquidEffect, setLiquidEffect] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Academics', path: '/academics' },
    { name: 'Notices', path: '/notices' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

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
                src={logoPlaceholder}
                alt="Gyan Bharti School"
                className="h-10 w-10 object-contain"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-foreground">Gyan Bharti</span>
                <span className="text-xs text-muted-foreground">Sr. Sec. School</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full transition-all duration-300 ${
                      isActive(link.path)
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    {link.name}
                  </motion.div>
                </Link>
              ))}
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
                      className={`px-4 py-3 rounded-2xl transition-all duration-300 ${
                        isActive(link.path)
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      {link.name}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
