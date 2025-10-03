import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoPlaceholder from '@/assets/logo-placeholder.png';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [liquidEffect, setLiquidEffect] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div
          className={`glass-strong rounded-full transition-all duration-500 ${
            liquidEffect ? 'liquid-morph' : ''
          }`}
        >
          <div className="flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 z-10">
              <img src={logoPlaceholder} alt="Gyan Bharti School" className="h-10 w-10 object-contain" />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-foreground">Gyan Bharti</span>
                <span className="text-xs text-muted-foreground">Sr. Sec. School</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* Liquid Effect Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLiquidEffect(!liquidEffect)}
                className="hidden md:flex rounded-full"
                title={liquidEffect ? 'Disable Liquid Effect' : 'Enable Liquid Effect'}
              >
                <span className="text-xs">{liquidEffect ? '🌊' : '⚡'}</span>
              </Button>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                className="rounded-full"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 glass-strong rounded-3xl p-4 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
